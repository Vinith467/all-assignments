# reviews/views.py

from django.http import JsonResponse
from django.views.decorators.http import require_http_methods
from django.views.decorators.csrf import csrf_exempt
import json
from .models import Review
from catalog.models import Product
from orders.models import OrderItem
from accounts.models import User

@csrf_exempt
@require_http_methods(["POST"])
def create_review(request):
    """Create a review with optional image"""
    
    # Handle Form Data (Multipart) instead of JSON
    try:
        # Get User (Hardcoded for now)
        try:
            user = User.objects.get(username='testcustomer')
        except User.DoesNotExist:
            return JsonResponse({'success': False, 'error': 'User not found'}, status=404)

        product_id = request.POST.get('product_id')
        rating = request.POST.get('rating')
        comment = request.POST.get('comment', '')
        image = request.FILES.get('image')

        if not product_id or not rating:
            return JsonResponse({'success': False, 'error': 'Product and rating are required'}, status=400)

        # Get Product
        try:
            product = Product.objects.get(id=product_id)
        except Product.DoesNotExist:
             return JsonResponse({'success': False, 'error': 'Product not found'}, status=404)

        # ✅ FIX: Verify purchase using 'product_name' instead of 'product_id'
        # OrderItem stores snapshots, not foreign keys.
        has_purchased = OrderItem.objects.filter(
            order__user=user,
            product_name=product.name, # Using name to match snapshot
            order__status__in=['COMPLETED', 'PICKED_UP', 'READY'] # Allow reviewing if item is ready/received
        ).exists()

        # Enforce verified purchase
        if not has_purchased:
             return JsonResponse({'success': False, 'error': 'You can only review products from completed orders.'}, status=403)

        # Create/Update Review
        review, created = Review.objects.update_or_create(
            user=user,
            product=product,
            defaults={
                'rating': rating,
                'comment': comment,
                'is_verified_purchase': True,
                'review_image': image if image else None
            }
        )
        
        # If updating and no new image, keep old one (Django update_or_create handles this if we don't pass None explicitly, but logic here ensures new image overwrites)

        return JsonResponse({'success': True, 'message': 'Review submitted successfully'})

    except Exception as e:
        return JsonResponse({'success': False, 'error': str(e)}, status=400)