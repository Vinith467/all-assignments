# bookings/admin_views.py

from django.http import JsonResponse
from django.views.decorators.http import require_http_methods
from django.views.decorators.csrf import csrf_exempt
import json

from .models import Booking
from accounts.models import User


@csrf_exempt
@require_http_methods(["POST"])
def upload_measurement(request, booking_id):
    """Admin: Upload measurement photo and set fabric meters"""
    
    # Get admin user
    try:
        admin_user = User.objects.get(username='vinith')
    except User.DoesNotExist:
        return JsonResponse({
            'success': False,
            'error': 'Admin user not found'
        }, status=404)
    
    # Check admin role
    if admin_user.role not in ['ADMIN', 'STAFF']:
        return JsonResponse({
            'success': False,
            'error': 'Unauthorized'
        }, status=403)
    
    # Get booking
    try:
        booking = Booking.objects.get(id=booking_id)
    except Booking.DoesNotExist:
        return JsonResponse({
            'success': False,
            'error': 'Booking not found'
        }, status=404)
    
    # Get uploaded file
    measurement_photo = request.FILES.get('measurement_photo')
    measurement_notes = request.POST.get('measurement_data', '')
    
    # Get fabric meters
    shirt_meters = request.POST.get('shirt_meters')
    pant_meters = request.POST.get('pant_meters')
    kurta_meters = request.POST.get('kurta_meters')
    
    if not measurement_photo:
        return JsonResponse({
            'success': False,
            'error': 'No photo uploaded'
        }, status=400)
    
    # Save the photo to Cloudinary
    booking.measurement_photo = measurement_photo
    
    # Build measurement data JSON
    measurement_data = {}
    
    # Add notes if provided
    if measurement_notes:
        measurement_data['notes'] = measurement_notes
    
    # Add fabric meters
    if shirt_meters:
        measurement_data['shirt_meters'] = float(shirt_meters)
    if pant_meters:
        measurement_data['pant_meters'] = float(pant_meters)
    if kurta_meters:
        measurement_data['kurta_meters'] = float(kurta_meters)
    
    # Save measurement data
    booking.measurement_data = measurement_data
    
    # Mark as completed
    booking.status = 'COMPLETED'
    booking.save()
    
    return JsonResponse({
        'success': True,
        'message': 'Measurement uploaded successfully',
        'booking': {
            'id': booking.id,
            'status': booking.status,
            'measurement_status': 'completed',
            'measurement_data': measurement_data
        }
    })