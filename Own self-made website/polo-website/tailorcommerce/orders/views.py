from django.shortcuts import render

# Create your views here.
# orders/views.py

from django.http import JsonResponse
from django.views.decorators.http import require_http_methods
from django.views.decorators.csrf import csrf_exempt
from django.db import transaction
from django.utils import timezone
from decimal import Decimal
import json

from catalog.models import Product

from .models import Order, OrderItem, OrderStatusHistory, Invoice
from cart.models import Cart, CartItem
from payments.models import Payment
from rentals.models import RentalTransaction
from inventory.models import Inventory
from accounts.models import User, Address


@csrf_exempt
@require_http_methods(["POST"])
def create_order(request):
    """
    Create order from cart
    This is a complex transaction that:
    1. Creates order
    2. Creates order items (snapshots)
    3. Creates payment record
    4. Creates rental transactions
    5. Reduces inventory
    6. Marks cart as checked out
    """
    
    try:
        data = json.loads(request.body)
    except json.JSONDecodeError:
        return JsonResponse({
            'success': False,
            'error': 'Invalid JSON'
        }, status=400)
    
    # Get user (hardcoded for now)
    try:
        user = User.objects.get(username='testcustomer')
    except User.DoesNotExist:
        return JsonResponse({
            'success': False,
            'error': 'User not found'
        }, status=404)
    
    # Get address
    address_id = data.get('address_id')
    if not address_id:
        # Use default address
        try:
            address = user.addresses.get(is_default=True)
        except Address.DoesNotExist:
            return JsonResponse({
                'success': False,
                'error': 'No default address found. Please provide address_id.'
            }, status=400)
    else:
        try:
            address = Address.objects.get(id=address_id, user=user)
        except Address.DoesNotExist:
            return JsonResponse({
                'success': False,
                'error': 'Address not found'
            }, status=404)
    
    # Get active cart
    try:
        cart = Cart.objects.get(user=user, status='ACTIVE')
    except Cart.DoesNotExist:
        return JsonResponse({
            'success': False,
            'error': 'No active cart found'
        }, status=404)
    
    # Check if cart is empty
    if cart.items.count() == 0:
        return JsonResponse({
            'success': False,
            'error': 'Cart is empty'
        }, status=400)
    
    # Calculate total
    total_amount = cart.calculate_total()
    
    # Start atomic transaction (all or nothing)
    try:
        with transaction.atomic():
            # 1. Create Order
            order = Order.objects.create(
                user=user,
                address=address,
                total_amount=total_amount,
                status='PLACED'
            )
            
            # 2. Create Order Items from Cart Items
            rental_transactions_to_create = []
            
            for cart_item in cart.items.all():
                # Prepare snapshots
                variant_snapshot = None
                if cart_item.variant:
                    variant_snapshot = {
                        'id': cart_item.variant.id,
                        'sku': cart_item.variant.sku,
                        'size': cart_item.variant.size,
                        'color': cart_item.variant.color,
                        'price': float(cart_item.variant.price_override) if cart_item.variant.price_override else None,
                    }
                
                fabric_snapshot = None
                if cart_item.fabric:
                    fabric_snapshot = {
                        'material': cart_item.fabric.material,
                        'color': cart_item.fabric.color,
                        'price_per_meter': float(cart_item.fabric.price_per_meter),
                    }
                
                stitch_type_snapshot = None
                stitching_status = 'NOT_APPLICABLE'
                if cart_item.stitch_type:
                    stitch_type_snapshot = {
                        'name': cart_item.stitch_type.name,
                        'price': float(cart_item.stitch_type.price),
                    }
                    # If stitching is required and meters not set, mark as pending measurement
                    if cart_item.meters is None:
                        stitching_status = 'PENDING_MEASUREMENT'
                    else:
                        stitching_status = 'READY_FOR_STITCHING'
                        
                        
                # ✅ GET IMAGE URL
                product_image_url = None
                primary_image = cart_item.product.images.filter(is_primary=True).first()
                if not primary_image:
                    primary_image = cart_item.product.images.first()
                
                if primary_image and primary_image.image:
                    product_image_url = primary_image.image.url
                # Create Order Item
                order_item = OrderItem.objects.create(
                    order=order,
                    product_name=cart_item.product.name,
                    product_category=cart_item.product.category,
                    variant_snapshot=variant_snapshot,
                    fabric_snapshot=fabric_snapshot,
                    stitch_type_snapshot=stitch_type_snapshot,
                    purchase_type=cart_item.purchase_type,
                    quantity=cart_item.quantity,
                    meters=cart_item.meters,
                    price=cart_item.price_snapshot,
                    stitching_status=stitching_status,
                )
                
                # 3. Reduce Inventory (only for BUY, not RENT)
                if cart_item.purchase_type == 'BUY' and cart_item.variant:
                    try:
                        inventory = cart_item.variant.inventory
                        if inventory.available_quantity < cart_item.quantity:
                            raise Exception(f'Insufficient stock for {cart_item.product.name}')
                        
                        inventory.available_quantity -= cart_item.quantity
                        inventory.save()
                    except Inventory.DoesNotExist:
                        raise Exception(f'Inventory not found for {cart_item.product.name}')
                
                # 4. Prepare Rental Transaction data (create after order items)
                if cart_item.purchase_type == 'RENT':
                    # Calculate expected return date
                    expected_return_date = timezone.now().date() + timezone.timedelta(days=cart_item.rental_days)
                    
                    try:
                        rental_config = cart_item.product.rental_config
                        rental_transactions_to_create.append({
                            'order_item': order_item,
                            'deposit_amount': rental_config.deposit_amount,
                            'rent_per_day': rental_config.rent_per_day,
                            'expected_return_date': expected_return_date,
                            'actual_days_used': 0,
                        })
                    except:
                        raise Exception(f'Rental config not found for {cart_item.product.name}')
            
            # 5. Create Rental Transactions
            for rental_data in rental_transactions_to_create:
                RentalTransaction.objects.create(**rental_data)
            
            # 6. Create Payment Record
            payment_method = data.get('payment_method', 'MANUAL')
            payment = Payment.objects.create(
                order=order,
                provider=payment_method,
                amount=total_amount,
                status='SUCCESS',  # For now, assume success (later integrate Razorpay)
                transaction_id=f'TXN-{order.order_number}'
            )
            
            # 7. Create Order Status History
            OrderStatusHistory.objects.create(
                order=order,
                status='PLACED',
                note='Order placed successfully',
                changed_by=user
            )
            
            # 8. Mark Cart as Checked Out
            cart.status = 'CHECKED_OUT'
            cart.save()
            
            # 9. Generate Invoice (optional - can be done async)
            invoice = Invoice.objects.create(
                order=order,
                gst_amount=Decimal('0.00'),  # Add GST calculation later
                total_with_gst=total_amount
            )
            
            # Return success response
            return JsonResponse({
                'success': True,
                'message': 'Order created successfully',
                'order': {
                    'order_number': order.order_number,
                    'order_id': order.id,
                    'total_amount': float(order.total_amount),
                    'status': order.status,
                    'items_count': order.items.count(),
                    'payment_status': payment.status,
                    'invoice_number': invoice.invoice_number,
                }
            })
            
    except Exception as e:
        return JsonResponse({
            'success': False,
            'error': str(e)
        }, status=400)


@require_http_methods(["GET"])
def order_list(request):
    """Get user's order list"""
    
    # Get user
    try:
        user = User.objects.get(username='testcustomer')
    except User.DoesNotExist:
        return JsonResponse({
            'success': False,
            'error': 'User not found'
        }, status=404)
    
    orders = Order.objects.filter(user=user)
    
    orders_data = []
    for order in orders:
        orders_data.append({
            'order_number': order.order_number,
            'order_id': order.id,
            'status': order.status,
            'total_amount': float(order.total_amount),
            'items_count': order.items.count(),
            'created_at': order.created_at.isoformat(),
        })
    
    return JsonResponse({
        'success': True,
        'orders': orders_data
    })


@require_http_methods(["GET"])
def order_detail(request, order_id):
    """Get order details"""
    
    # Get user
    try:
        user = User.objects.get(username='testcustomer')
    except User.DoesNotExist:
        return JsonResponse({
            'success': False,
            'error': 'User not found'
        }, status=404)
    
    # Get order
    try:
        order = Order.objects.get(id=order_id, user=user)
    except Order.DoesNotExist:
        return JsonResponse({
            'success': False,
            'error': 'Order not found'
        }, status=404)
    
    # Build order items
    items_data = []
    for item in order.items.all():
        # ✅ RESOLVE IMAGE URL (With fallback for old orders)
        image_url = item.image_url
        if not image_url:
            # Fallback: Try to find product by name to get current image
            product_id = None
            from catalog.models import Product
            prod = Product.objects.filter(name=item.product_name).first()
        
             # 2. If fail, try case-insensitive match
            if not prod:
                prod = Product.objects.filter(name__iexact=item.product_name).first()
             
        # 3. If still fail, try containing match (risky but helpful for debugging)
            if not prod:
                prod = Product.objects.filter(name__icontains=item.product_name).first()

            if prod:
                product_id = prod.id
            # Fallback image logic
                if not image_url:
                    img = prod.images.filter(is_primary=True).first() or prod.images.first()
                    if img and img.image:
                        image_url = img.image.url
                else:
                    print(f"⚠️ DEBUG: Could not find product ID for '{item.product_name}'")
        item_data = {
            'id': item.id,
            'product_id': product_id,
            'product_name': item.product_name,
            'image': image_url,
            'product_category': item.product_category,
            'purchase_type': item.purchase_type,
            'quantity': item.quantity,
            'price': float(item.price),
            'stitching_status': item.stitching_status,
            'variant_snapshot': item.variant_snapshot,
            'fabric_snapshot': item.fabric_snapshot,
            'stitch_type_snapshot': item.stitch_type_snapshot,
        }
        
        # Add rental info if exists
        try:
            rental = item.rental_transaction
            item_data['rental_info'] = {
                'deposit_amount': float(rental.deposit_amount),
                'rent_per_day': float(rental.rent_per_day),
                'expected_return_date': rental.expected_return_date.isoformat(),
                'actual_return_date': rental.actual_return_date.isoformat() if rental.actual_return_date else None,
                'status': rental.status,
                'refund_amount': float(rental.refund_amount),
            }
        except:
            pass
        
        items_data.append(item_data)
    
    # Get status history
    history = []
    for status in order.status_history.all():
        history.append({
            'status': status.status,
            'note': status.note,
            'changed_by': status.changed_by.username if status.changed_by else None,
            'changed_at': status.changed_at.isoformat(),
        })
    
    # Get payment info
    payment = order.payments.first()
    payment_data = None
    if payment:
        payment_data = {
            'transaction_id': payment.transaction_id,
            'amount': float(payment.amount),
            'status': payment.status,
            'provider': payment.provider,
        }
    
    # Get invoice info
    invoice_data = None
    try:
        invoice = order.invoice
        invoice_data = {
            'invoice_number': invoice.invoice_number,
            'total_with_gst': float(invoice.total_with_gst),
            'gst_amount': float(invoice.gst_amount),
        }
    except:
        pass
    
    return JsonResponse({
        'success': True,
        'order': {
            'order_number': order.order_number,
            'order_id': order.id,
            'status': order.status,
            'total_amount': float(order.total_amount),
            'created_at': order.created_at.isoformat(),
            'address': {
                'name': order.address.name,
                'phone': order.address.phone,
                'address_line': order.address.address_line,
                'city': order.address.city,
                'state': order.address.state,
                'pincode': order.address.pincode,
            } if order.address else None,
            'items': items_data,
            'status_history': history,
            'payment': payment_data,
            'invoice': invoice_data,
        }
    })