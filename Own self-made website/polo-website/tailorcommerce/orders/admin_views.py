# orders/admin_views.py

from django.http import JsonResponse
from django.views.decorators.http import require_http_methods
from django.views.decorators.csrf import csrf_exempt
from django.db import transaction
import json

from .models import Order, OrderItem, OrderStatusHistory
from accounts.models import User


def check_admin(user):
    """Helper to check if user is admin"""
    return user.role in ['ADMIN', 'STAFF']


@csrf_exempt
@require_http_methods(["PUT"])
def update_order_status(request, order_id):
    """Admin: Update order status"""
    
    try:
        data = json.loads(request.body)
    except json.JSONDecodeError:
        return JsonResponse({
            'success': False,
            'error': 'Invalid JSON'
        }, status=400)
    
    # Get admin user (hardcoded for now)
    try:
        admin_user = User.objects.get(username='vinith')  # Your admin user
    except User.DoesNotExist:
        return JsonResponse({
            'success': False,
            'error': 'Admin user not found'
        }, status=404)
    
    # Check if admin
    if not check_admin(admin_user):
        return JsonResponse({
            'success': False,
            'error': 'Unauthorized'
        }, status=403)
    
    # Get order
    try:
        order = Order.objects.get(id=order_id)
    except Order.DoesNotExist:
        return JsonResponse({
            'success': False,
            'error': 'Order not found'
        }, status=404)
    
    # Get new status
    new_status = data.get('status')
    note = data.get('note', '')
    
    if not new_status:
        return JsonResponse({
            'success': False,
            'error': 'status is required'
        }, status=400)
    
    # Validate status
    valid_statuses = ['PLACED', 'PROCESSING', 'STITCHING', 'READY', 'PICKED_UP', 'COMPLETED', 'CANCELLED']
    if new_status not in valid_statuses:
        return JsonResponse({
            'success': False,
            'error': f'Invalid status. Must be one of: {", ".join(valid_statuses)}'
        }, status=400)
    
    # Update order status
    old_status = order.status
    order.status = new_status
    order.save()
    
    # Create status history
    OrderStatusHistory.objects.create(
        order=order,
        status=new_status,
        note=note or f'Status changed from {old_status} to {new_status}',
        changed_by=admin_user
    )
    
    return JsonResponse({
        'success': True,
        'message': 'Order status updated successfully',
        'order': {
            'order_number': order.order_number,
            'old_status': old_status,
            'new_status': new_status,
        }
    })


@csrf_exempt
@require_http_methods(["PUT"])
def set_fabric_meters(request, order_item_id):
    """Admin: Set fabric meters after measurement"""
    
    try:
        data = json.loads(request.body)
    except json.JSONDecodeError:
        return JsonResponse({
            'success': False,
            'error': 'Invalid JSON'
        }, status=400)
    
    # Get admin user
    try:
        admin_user = User.objects.get(username='vinith')
    except User.DoesNotExist:
        return JsonResponse({
            'success': False,
            'error': 'Admin user not found'
        }, status=404)
    
    if not check_admin(admin_user):
        return JsonResponse({
            'success': False,
            'error': 'Unauthorized'
        }, status=403)
    
    # Get order item
    try:
        order_item = OrderItem.objects.get(id=order_item_id)
    except OrderItem.DoesNotExist:
        return JsonResponse({
            'success': False,
            'error': 'Order item not found'
        }, status=404)
    
    # Check if this is a fabric with stitching (meters should be null)
    if order_item.stitching_status != 'PENDING_MEASUREMENT':
        return JsonResponse({
            'success': False,
            'error': 'This order item does not require meter setting'
        }, status=400)
    
    # Get meters
    meters = data.get('meters')
    if not meters:
        return JsonResponse({
            'success': False,
            'error': 'meters is required'
        }, status=400)
    
    # Update order item
    order_item.meters = meters
    order_item.stitching_status = 'READY_FOR_STITCHING'
    order_item.save()
    
    # Add note to order history
    OrderStatusHistory.objects.create(
        order=order_item.order,
        status=order_item.order.status,
        note=f'Fabric meters set to {meters}m for {order_item.product_name}',
        changed_by=admin_user
    )
    
    return JsonResponse({
        'success': True,
        'message': 'Fabric meters set successfully',
        'order_item': {
            'id': order_item.id,
            'product_name': order_item.product_name,
            'meters': float(order_item.meters),
            'stitching_status': order_item.stitching_status,
        }
    })


@require_http_methods(["GET"])
def admin_order_list(request):
    """Admin: Get all orders with filters"""
    
    # Get admin user
    try:
        admin_user = User.objects.get(username='vinith')
    except User.DoesNotExist:
        return JsonResponse({
            'success': False,
            'error': 'Admin user not found'
        }, status=404)
    
    if not check_admin(admin_user):
        return JsonResponse({
            'success': False,
            'error': 'Unauthorized'
        }, status=403)
    
    # Get filters
    status = request.GET.get('status')
    
    # Base query
    orders = Order.objects.all().order_by('-created_at')
    
    # Apply filters
    if status:
        orders = orders.filter(status=status)
    
    orders_data = []
    for order in orders:
        # Check if has pending measurements
        pending_measurements = order.items.filter(stitching_status='PENDING_MEASUREMENT').count()
        
        orders_data.append({
            'order_number': order.order_number,
            'order_id': order.id,
            'customer': order.user.username,
            'customer_phone': order.user.phone,
            'status': order.status,
            'total_amount': float(order.total_amount),
            'items_count': order.items.count(),
            'pending_measurements': pending_measurements,
            'created_at': order.created_at.isoformat(),
        })
    
    return JsonResponse({
        'success': True,
        'total_orders': len(orders_data),
        'orders': orders_data
    })


@require_http_methods(["GET"])
def orders_pending_measurement(request):
    """Admin: Get orders with items needing measurement"""
    
    # Get admin user
    try:
        admin_user = User.objects.get(username='vinith')
    except User.DoesNotExist:
        return JsonResponse({
            'success': False,
            'error': 'Admin user not found'
        }, status=404)
    
    if not check_admin(admin_user):
        return JsonResponse({
            'success': False,
            'error': 'Unauthorized'
        }, status=403)
    
    # Get order items with pending measurements
    pending_items = OrderItem.objects.filter(
        stitching_status='PENDING_MEASUREMENT'
    ).select_related('order', 'order__user')
    
    items_data = []
    for item in pending_items:
        items_data.append({
            'order_item_id': item.id,
            'order_number': item.order.order_number,
            'order_id': item.order.id,
            'customer': item.order.user.username,
            'customer_phone': item.order.user.phone,
            'product_name': item.product_name,
            'fabric_snapshot': item.fabric_snapshot,
            'stitch_type_snapshot': item.stitch_type_snapshot,
            'current_meters': float(item.meters) if item.meters else None,
        })
    
    return JsonResponse({
        'success': True,
        'total_pending': len(items_data),
        'pending_items': items_data
    })