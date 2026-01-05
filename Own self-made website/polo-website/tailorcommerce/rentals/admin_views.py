# rentals/admin_views.py - COMPLETE FIXED VERSION

from django.http import JsonResponse
from django.views.decorators.http import require_http_methods
from django.views.decorators.csrf import csrf_exempt
from django.utils import timezone
from decimal import Decimal
import json

from .models import RentalTransaction
from accounts.models import User


def check_admin(user):
    """Helper to check if user is admin"""
    return user.role in ['ADMIN', 'STAFF']


@require_http_methods(["GET"])
def active_rentals(request):
    """Admin: Get all active rentals"""
    
    # Get admin user
    try:
        admin_user = User.objects.get(username='vinith')
    except User.DoesNotExist:
        return JsonResponse({
            'success': False,
            'error': 'Admin user not found'
        }, status=404)
    
    # Get active rentals
    rentals = RentalTransaction.objects.filter(status='ACTIVE').select_related(
        'order_item__order__user'
    )
    
    rentals_data = []
    for rental in rentals:
        order = rental.order_item.order
        
        # CORRECT: Calculate planned rental period (order date to expected return)
        days_rented = (rental.expected_return_date - order.created_at.date()).days
        
        # Check if overdue
        is_overdue = timezone.now().date() > rental.expected_return_date
        
        rentals_data.append({
            'rental_id': rental.id,
            'order_number': order.order_number,
            'customer': order.user.username,
            'customer_phone': order.user.phone,
            'product_name': rental.order_item.product_name,
            'deposit_amount': float(rental.deposit_amount),
            'rent_per_day': float(rental.rent_per_day),
            'expected_return_date': rental.expected_return_date.isoformat(),
            'days_rented': days_rented,  # Planned rental period
            'is_overdue': is_overdue,
            'status': rental.status,
        })
    
    return JsonResponse({
        'success': True,
        'total_active_rentals': len(rentals_data),
        'rentals': rentals_data
    })


@csrf_exempt
@require_http_methods(["POST"])
def process_return(request, rental_id):
    """Admin: Process rental return and calculate refund"""
    
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
    
    # Get rental
    try:
        rental = RentalTransaction.objects.get(id=rental_id)
    except RentalTransaction.DoesNotExist:
        return JsonResponse({
            'success': False,
            'error': 'Rental transaction not found'
        }, status=404)
    
    # Check if already returned
    if rental.status != 'ACTIVE':
        return JsonResponse({
            'success': False,
            'error': 'Rental is not active'
        }, status=400)
    
    # Get return data
    actual_return_date = data.get('actual_return_date')
    condition_status = data.get('condition_status', 'CLEAN')
    damage_fee = Decimal(data.get('damage_fee', '0.00'))
    
    # Validate condition status
    valid_conditions = ['CLEAN', 'DIRTY', 'DAMAGED']
    if condition_status not in valid_conditions:
        return JsonResponse({
            'success': False,
            'error': f'Invalid condition_status. Must be one of: {", ".join(valid_conditions)}'
        }, status=400)
    
    # Parse actual return date (default to today if not provided)
    if actual_return_date:
        from datetime import datetime
        try:
            actual_return_date = datetime.strptime(actual_return_date, '%Y-%m-%d').date()
        except ValueError:
            return JsonResponse({
                'success': False,
                'error': 'Invalid date format. Use YYYY-MM-DD'
            }, status=400)
    else:
        actual_return_date = timezone.now().date()
    
    # Get order date
    order_date = rental.order_item.order.created_at.date()
    
    # Calculate PLANNED rental days (what customer agreed to pay for)
    # This is from order date to expected return date
    planned_days = (rental.expected_return_date - order_date).days
    
    # Calculate actual days used (for record keeping)
    actual_days_used = (actual_return_date - order_date).days
    
    # Calculate late fee if returned after expected date
    late_days = 0
    late_fee = Decimal('0.00')
    if actual_return_date > rental.expected_return_date:
        late_days = (actual_return_date - rental.expected_return_date).days
        late_fee = late_days * rental.rent_per_day
    
    # CORRECT: Rent cost based on PLANNED days (not actual days)
    # Customer pays for the agreed rental period regardless of early return
    rent_cost = rental.rent_per_day * planned_days
    
    # Calculate refund
    refund_amount = rental.deposit_amount - rent_cost - late_fee - damage_fee
    
    # Refund cannot be negative
    if refund_amount < 0:
        refund_amount = Decimal('0.00')
    
    # Update rental transaction
    rental.actual_return_date = actual_return_date
    rental.actual_days_used = actual_days_used
    rental.condition_status = condition_status
    rental.late_fee = late_fee
    rental.damage_fee = damage_fee
    rental.rent_cost = rent_cost
    rental.refund_amount = refund_amount
    rental.status = 'RETURNED'
    rental.save()
    
    # Prepare response
    return JsonResponse({
        'success': True,
        'message': 'Rental return processed successfully',
        'rental': {
            'rental_id': rental.id,
            'product_name': rental.order_item.product_name,
            'deposit_amount': float(rental.deposit_amount),
            'rent_per_day': float(rental.rent_per_day),
            'planned_days': planned_days,
            'actual_days_used': actual_days_used,
            'expected_return_date': rental.expected_return_date.isoformat(),
            'actual_return_date': actual_return_date.isoformat(),
            'late_days': late_days,
            'condition_status': condition_status,
            'rent_cost': float(rent_cost),
            'late_fee': float(late_fee),
            'damage_fee': float(damage_fee),
            'refund_amount': float(refund_amount),
            'status': rental.status,
        }
    })


@require_http_methods(["GET"])
def rental_history(request):
    """Admin: Get rental history"""
    
    # Get admin user
    try:
        admin_user = User.objects.get(username='vinith')
    except User.DoesNotExist:
        return JsonResponse({
            'success': False,
            'error': 'Admin user not found'
        }, status=404)
    
    # Get all rentals
    rentals = RentalTransaction.objects.all().select_related(
        'order_item__order__user'
    ).order_by('-created_at')
    
    rentals_data = []
    for rental in rentals:
        order = rental.order_item.order
        
        rentals_data.append({
            'rental_id': rental.id,
            'order_number': order.order_number,
            'customer': order.user.username,
            'product_name': rental.order_item.product_name,
            'deposit_amount': float(rental.deposit_amount),
            'rent_per_day': float(rental.rent_per_day),
            'expected_return_date': rental.expected_return_date.isoformat(),
            'actual_return_date': rental.actual_return_date.isoformat() if rental.actual_return_date else None,
            'actual_days_used': rental.actual_days_used,
            'condition_status': rental.condition_status,
            'refund_amount': float(rental.refund_amount),
            'status': rental.status,
            'created_at': rental.created_at.isoformat(),
        })
    
    return JsonResponse({
        'success': True,
        'total_rentals': len(rentals_data),
        'rentals': rentals_data
    })