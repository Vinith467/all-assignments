from django.http import JsonResponse
from django.views.decorators.http import require_http_methods
from django.views.decorators.csrf import csrf_exempt
import json
from .models import WishlistItem
from catalog.models import Product
from accounts.models import User

@require_http_methods(["GET"])
def get_wishlist(request):
    """Get all wishlist items for the current user"""
    # Hardcoded user for now (Replace with request.user when auth is fully active)
    try:
        user = User.objects.get(username='testcustomer')
    except User.DoesNotExist:
        return JsonResponse({'success': False, 'error': 'User not found'}, status=404)

    items = WishlistItem.objects.filter(user=user).select_related('product')
    
    wishlist_data = []
    for item in items:
        product = item.product
        
        # Get Image
        primary_image = product.images.filter(is_primary=True).first() or product.images.first()
        image_url = primary_image.image.url if (primary_image and primary_image.image) else None

        # Get Price
        price = 0
        if product.variants.exists():
            price = float(product.variants.first().price_override or 0)
        elif product.category == 'FABRIC':
             try:
                 price = float(product.fabric_details.price_per_meter)
             except:
                 pass

        wishlist_data.append({
            'id': item.id,
            'product_id': product.id,
            'name': product.name,
            'category': product.category,
            'price': price,
            'image': image_url,
            'is_rentable': product.is_rentable,
            'created_at': item.created_at.isoformat()
        })

    return JsonResponse({'success': True, 'wishlist': wishlist_data})

@csrf_exempt
@require_http_methods(["POST"])
def toggle_wishlist(request):
    """Add or remove item from wishlist"""
    try:
        data = json.loads(request.body)
        product_id = data.get('product_id')
        
        # Hardcoded user for now
        user = User.objects.get(username='testcustomer') 

        product = Product.objects.get(id=product_id)
        
        # Toggle logic: if exists delete, else create
        item, created = WishlistItem.objects.get_or_create(user=user, product=product)
        
        if not created:
            item.delete()
            return JsonResponse({'success': True, 'action': 'removed'})
        
        return JsonResponse({'success': True, 'action': 'added'})

    except Product.DoesNotExist:
        return JsonResponse({'success': False, 'error': 'Product not found'}, status=404)
    except Exception as e:
        return JsonResponse({'success': False, 'error': str(e)}, status=400)