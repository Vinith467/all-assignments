from django.shortcuts import render

# Create your views here.
# cart/views.py

from django.http import JsonResponse
from django.views.decorators.http import require_http_methods
from django.contrib.auth.decorators import login_required
from django.views.decorators.csrf import csrf_exempt
from .models import Cart, CartItem
from catalog.models import Product, ProductVariant, Fabric, StitchType
from inventory.models import Inventory
import json

def get_or_create_cart(user):
    """Helper function to get or create active cart for user"""
    cart, created = Cart.objects.get_or_create(
        user=user,
        status='ACTIVE'
    )
    return cart


@csrf_exempt  # For now, we'll add proper auth later
@require_http_methods(["GET"])
def get_cart(request):
    """Get user's cart with all items"""
    
    # For now, using testcustomer - later we'll use actual auth
    from accounts.models import User
    try:
        user = User.objects.get(username='testcustomer')
    except User.DoesNotExist:
        return JsonResponse({
            'success': False,
            'error': 'User not found'
        }, status=404)
    
    cart = get_or_create_cart(user)
    
    # Build cart items
    items_data = []
    for item in cart.items.all():
        # Get product primary image
        primary_image = item.product.images.filter(is_primary=True).first()
        if not primary_image:
            primary_image = item.product.images.first()
        
        image_url = None
        if primary_image and primary_image.image:
            image_url = primary_image.image.url  # Cloudinary URL
        
        item_data = {
            'id': item.id,
            'product': {
                'id': item.product.id,
                'name': item.product.name,
                'category': item.product.category,
                'image': image_url,  # ADD THIS
            },
            'purchase_type': item.purchase_type,
            'quantity': item.quantity,
            'price_snapshot': float(item.price_snapshot),
            'subtotal': float(item.get_subtotal()),
        }
        
        # Add variant info if exists
        if item.variant:
            item_data['variant'] = {
                'id': item.variant.id,
                'size': item.variant.size,
                'color': item.variant.color,
            }
        
        # Add fabric info if exists
        if item.fabric:
            item_data['fabric'] = {
                'material': item.fabric.material,
                'color': item.fabric.color,
                'meters': float(item.meters) if item.meters else None,
            }
        
        # Add stitch info if exists
        if item.stitch_type:
            item_data['stitch_type'] = {
                'name': item.stitch_type.name,
                'price': float(item.stitch_type.price),
            }
        
        # Add rental info if rental
        if item.purchase_type == 'RENT':
            item_data['rental_days'] = item.rental_days
        
        items_data.append(item_data)
    
    return JsonResponse({
        'success': True,
        'cart': {
            'id': cart.id,
            'status': cart.status,
            'items_count': cart.items.count(),
            'total': float(cart.calculate_total()),
            'items': items_data,
        }
    })


@csrf_exempt
@require_http_methods(["POST"])
def add_to_cart(request):
    """Add item to cart"""
    
    try:
        data = json.loads(request.body)
    except json.JSONDecodeError:
        return JsonResponse({
            'success': False,
            'error': 'Invalid JSON'
        }, status=400)
    
    # Get user (hardcoded for now)
    from accounts.models import User
    try:
        user = User.objects.get(username='testcustomer')
    except User.DoesNotExist:
        return JsonResponse({
            'success': False,
            'error': 'User not found'
        }, status=404)
    
    # Validate required fields
    product_id = data.get('product_id')
    purchase_type = data.get('purchase_type', 'BUY')
    quantity = data.get('quantity', 1)
    
    if not product_id:
        return JsonResponse({
            'success': False,
            'error': 'product_id is required'
        }, status=400)
    
    # Get product
    try:
        product = Product.objects.get(id=product_id, is_active=True)
    except Product.DoesNotExist:
        return JsonResponse({
            'success': False,
            'error': 'Product not found'
        }, status=404)
    
    # Validate purchase type
    if purchase_type == 'BUY' and not product.is_buyable:
        return JsonResponse({
            'success': False,
            'error': 'This product is not available for purchase'
        }, status=400)
    
    if purchase_type == 'RENT' and not product.is_rentable:
        return JsonResponse({
            'success': False,
            'error': 'This product is not available for rent'
        }, status=400)
    
    # Get or create cart
    cart = get_or_create_cart(user)
    
    # Prepare cart item data
    cart_item_data = {
        'cart': cart,
        'product': product,
        'purchase_type': purchase_type,
        'quantity': quantity,
    }
    
    # Handle variant (for READYMADE, ACCESSORY, INNERWEAR)
    variant_id = data.get('variant_id')
    if variant_id:
        try:
            variant = ProductVariant.objects.get(id=variant_id, product=product)
            cart_item_data['variant'] = variant
            cart_item_data['price_snapshot'] = variant.price_override or 0
            
            # Check inventory
            try:
                inventory = variant.inventory
                if inventory.available_quantity < quantity:
                    return JsonResponse({
                        'success': False,
                        'error': f'Only {inventory.available_quantity} items in stock'
                    }, status=400)
            except Inventory.DoesNotExist:
                return JsonResponse({
                    'success': False,
                    'error': 'Product out of stock'
                }, status=400)
                
        except ProductVariant.DoesNotExist:
            return JsonResponse({
                'success': False,
                'error': 'Variant not found'
            }, status=404)
            
    
    # Handle fabric
    if product.category == 'FABRIC':
        try:
            fabric = product.fabric_details
            cart_item_data['fabric'] = fabric
            
            # If no stitching, customer can select meters
            stitch_type_id = data.get('stitch_type_id')
            if stitch_type_id:
                try:
                    stitch_type = StitchType.objects.get(id=stitch_type_id, is_active=True)
                    cart_item_data['stitch_type'] = stitch_type
                    # Meters will be set by admin after measurement
                    meters = data.get('meters')
                    if meters:
                        cart_item_data['meters'] = meters
                except StitchType.DoesNotExist:
                    return JsonResponse({
                        'success': False,
                        'error': 'Stitch type not found'
                    }, status=404)
            else:
                # Customer buying fabric only - they select meters
                meters = data.get('meters')
                if not meters:
                    return JsonResponse({
                        'success': False,
                        'error': 'meters is required for fabric purchase'
                    }, status=400)
                cart_item_data['meters'] = meters
            
            cart_item_data['price_snapshot'] = fabric.price_per_meter
            
        except Fabric.DoesNotExist:
            return JsonResponse({
                'success': False,
                'error': 'Fabric details not found'
            }, status=404)
    
    # Handle rental
    if purchase_type == 'RENT':
        rental_days = data.get('rental_days')
        if not rental_days:
            return JsonResponse({
                'success': False,
                'error': 'rental_days is required for rentals'
            }, status=400)
        cart_item_data['rental_days'] = rental_days
        
        # Set price as deposit amount
        try:
            rental_config = product.rental_config
            cart_item_data['price_snapshot'] = rental_config.deposit_amount
        except:
            return JsonResponse({
                'success': False,
                'error': 'Rental configuration not found'
            }, status=404)
    
    # Create cart item
    cart_item = CartItem.objects.create(**cart_item_data)
    
    return JsonResponse({
        'success': True,
        'message': 'Item added to cart',
        'cart_item_id': cart_item.id,
        'cart_total': float(cart.calculate_total()),
    })


@csrf_exempt
@require_http_methods(["PUT"])
def update_cart_item(request, item_id):
    """Update cart item quantity"""
    
    try:
        data = json.loads(request.body)
    except json.JSONDecodeError:
        return JsonResponse({
            'success': False,
            'error': 'Invalid JSON'
        }, status=400)
    
    # Get user
    from accounts.models import User
    try:
        user = User.objects.get(username='testcustomer')
    except User.DoesNotExist:
        return JsonResponse({
            'success': False,
            'error': 'User not found'
        }, status=404)
    
    # Get cart item
    try:
        cart_item = CartItem.objects.get(id=item_id, cart__user=user, cart__status='ACTIVE')
    except CartItem.DoesNotExist:
        return JsonResponse({
            'success': False,
            'error': 'Cart item not found'
        }, status=404)
    
    # Update quantity
    quantity = data.get('quantity')
    if quantity:
        if quantity <= 0:
            cart_item.delete()
            return JsonResponse({
                'success': True,
                'message': 'Item removed from cart'
            })
        
        # Check inventory if variant exists
        if cart_item.variant:
            try:
                inventory = cart_item.variant.inventory
                if inventory.available_quantity < quantity:
                    return JsonResponse({
                        'success': False,
                        'error': f'Only {inventory.available_quantity} items in stock'
                    }, status=400)
            except Inventory.DoesNotExist:
                pass
        
        cart_item.quantity = quantity
        cart_item.save()
    
    return JsonResponse({
        'success': True,
        'message': 'Cart item updated',
        'cart_total': float(cart_item.cart.calculate_total()),
    })


@csrf_exempt
@require_http_methods(["DELETE"])
def remove_from_cart(request, item_id):
    """Remove item from cart"""
    
    # Get user
    from accounts.models import User
    try:
        user = User.objects.get(username='testcustomer')
    except User.DoesNotExist:
        return JsonResponse({
            'success': False,
            'error': 'User not found'
        }, status=404)
    
    # Get and delete cart item
    try:
        cart_item = CartItem.objects.get(id=item_id, cart__user=user, cart__status='ACTIVE')
        cart = cart_item.cart
        cart_item.delete()
        
        return JsonResponse({
            'success': True,
            'message': 'Item removed from cart',
            'cart_total': float(cart.calculate_total()),
        })
    except CartItem.DoesNotExist:
        return JsonResponse({
            'success': False,
            'error': 'Cart item not found'
        }, status=404)