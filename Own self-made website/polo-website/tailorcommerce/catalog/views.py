from django.shortcuts import render

# Create your views here.
# catalog/views.py

from django.http import JsonResponse
from django.views.decorators.http import require_http_methods
from django.db.models import Q, Avg,Count
from .models import Product, ProductVariant, Fabric, RentalConfig
from inventory.models import Inventory
import json
from orders.models import OrderItem

@require_http_methods(["GET"])
def product_list(request):
    """Get list of products with filters"""
    
    # Get query parameters
    category = request.GET.get('category', None)
    search = request.GET.get('search', None)
    is_rentable = request.GET.get('is_rentable', None)
    
    # Base query
    products = Product.objects.filter(is_active=True)
    
    # Apply filters
    if category:
        products = products.filter(category=category)
    
    if search:
        products = products.filter(
            Q(name__icontains=search) | 
            Q(description__icontains=search) |
            Q(brand__icontains=search)
        )
    
    if is_rentable:
        rentable = is_rentable.lower() == 'true'
        products = products.filter(is_rentable=rentable)
    
    # Build response
    products_data = []
    for product in products:
        # Get primary image
        primary_image = product.images.filter(is_primary=True).first()
        if not primary_image:
            primary_image = product.images.first()
        
        # Get Cloudinary URL
        image_url = None
        if primary_image and primary_image.image:
            image_url = primary_image.image.url  # Cloudinary automatically provides URL
        
        
        # Get price range from variants
        variants = product.variants.filter(is_active=True)
        prices = [v.price_override for v in variants if v.price_override]
        
        # Get average rating
        avg_rating = product.reviews.aggregate(Avg('rating'))['rating__avg'] or 0
        review_count = product.reviews.count()
        
        # 2. Calculate "People Ordered" (Unique users who bought this)
        # We count unique users from OrderItems associated with this product
        people_ordered = OrderItem.objects.filter(
            product_name=product.name,
            order__status__in=['PLACED', 'PROCESSING', 'STITCHING', 'READY', 'PICKED_UP', 'COMPLETED']
        ).values('order__user').distinct().count()
        
        product_data = {
            'id': product.id,
            'name': product.name,
            'slug': product.slug,
            'category': product.category,
            'brand': product.brand,
            'description': product.description[:200] + '...' if len(product.description) > 200 else product.description,
            'is_buyable': product.is_buyable,
            'is_rentable': product.is_rentable,
            'primary_image': image_url,
            'price_range': {
                'min': float(min(prices)) if prices else None,
                'max': float(max(prices)) if prices else None,
            },
            'rating': round(float(avg_rating), 1),
            'review_count': review_count,
            'people_ordered': people_ordered, 
            'created_at': product.created_at.isoformat(),
        }
        
        # Add rental info if applicable
        if product.is_rentable:
            try:
                rental_config = product.rental_config
                product_data['rental_info'] = {
                    'deposit_amount': float(rental_config.deposit_amount),
                    'rent_per_day': float(rental_config.rent_per_day),
                }
            except:
                pass
        
        products_data.append(product_data)
    
    return JsonResponse({
        'success': True,
        'count': len(products_data),
        'products': products_data
    })


@require_http_methods(["GET"])
def product_detail(request, product_id):
    """Get detailed product information"""
    
    try:
        product = Product.objects.get(id=product_id, is_active=True)
    except Product.DoesNotExist:
        return JsonResponse({
            'success': False,
            'error': 'Product not found'
        }, status=404)
    
    # Get all images
    images = []
    for img in product.images.all():
        images.append({
            'id': img.id,
            'url': img.image.url if img.image else None,  # Cloudinary URL
            'is_primary': img.is_primary,
            'display_order': img.display_order,
        })
    # Get variants with inventory
    variants = []
    for variant in product.variants.filter(is_active=True):
        try:
            inventory = variant.inventory
            stock = inventory.available_quantity
            in_stock = stock > 0
        except:
            stock = 0
            in_stock = False
        
        variants.append({
            'id': variant.id,
            'sku': variant.sku,
            'size': variant.size,
            'color': variant.color,
            'price': float(variant.price_override) if variant.price_override else None,
            'in_stock': in_stock,
            'stock_quantity': stock,
        })
    
    # Base product data
    product_data = {
        'id': product.id,
        'name': product.name,
        'slug': product.slug,
        'category': product.category,
        'brand': product.brand,
        'description': product.description,
        'is_buyable': product.is_buyable,
        'is_rentable': product.is_rentable,
        'images': images,
        'variants': variants,
    }
    
    # Add fabric details if fabric product
    if product.category == 'FABRIC':
        try:
            fabric = product.fabric_details
            product_data['fabric_details'] = {
                'fabric_category': fabric.fabric_category,
                'material': fabric.material,
                'color': fabric.color,
                'price_per_meter': float(fabric.price_per_meter),
            }
        except:
            pass
    
    # Add rental info if rentable
    if product.is_rentable:
        try:
            rental_config = product.rental_config
            product_data['rental_config'] = {
                'deposit_amount': float(rental_config.deposit_amount),
                'rent_per_day': float(rental_config.rent_per_day),
            }
        except:
            pass
    
  # ✅ GET REVIEWS WITH IMAGES
    reviews = []
    # Order by newest first
    for review in product.reviews.all().order_by('-created_at'):
        reviews.append({
            'user': review.user.username,
            'rating': review.rating,
            'comment': review.comment,
            # ✅ Fix: Ensure we send the Cloudinary URL
            'image': review.review_image.url if review.review_image else None, 
            'created_at': review.created_at.isoformat(),
        })
    # Calculate average rating
    avg_rating = product.reviews.aggregate(Avg('rating'))['rating__avg']
    
  # ✅ FLAT STRUCTURE (Matches your frontend)
    product_data['reviews'] = reviews       # This is now a List []
    product_data['rating'] = float(avg_rating) if avg_rating else 0
    product_data['review_count'] = len(reviews)
    return JsonResponse({
        'success': True,
        'product': product_data
    })


@require_http_methods(["GET"])
def categories_list(request):
    """Get all product categories"""
    
    categories = Product.CATEGORY_CHOICES
    
    category_data = []
    for code, name in categories:
        count = Product.objects.filter(category=code, is_active=True).count()
        category_data.append({
            'code': code,
            'name': name,
            'product_count': count,
        })
    
    return JsonResponse({
        'success': True,
        'categories': category_data
    })