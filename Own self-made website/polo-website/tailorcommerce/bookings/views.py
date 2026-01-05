from django.shortcuts import render

# Create your views here.
# bookings/views.py

from django.http import JsonResponse
from django.views.decorators.http import require_http_methods
from django.views.decorators.csrf import csrf_exempt
from django.db import transaction
from datetime import datetime, date
import json

from .models import Booking, MeasurementProfile
from accounts.models import User


@csrf_exempt
@require_http_methods(["POST"])
def create_booking(request):
    """Create a measurement booking"""
    
    try:
        data = json.loads(request.body)
    except json.JSONDecodeError:
        return JsonResponse({
            'success': False,
            'error': 'Invalid JSON'
        }, status=400)
    
    # Get user
    try:
        user = User.objects.get(username='testcustomer')
    except User.DoesNotExist:
        return JsonResponse({
            'success': False,
            'error': 'User not found'
        }, status=404)
    
    # Validate required fields
    booking_date = data.get('date')
    time_slot = data.get('time_slot')
    
    if not booking_date or not time_slot:
        return JsonResponse({
            'success': False,
            'error': 'date and time_slot are required'
        }, status=400)
    
    # Parse date
    try:
        booking_date = datetime.strptime(booking_date, '%Y-%m-%d').date()
    except ValueError:
        return JsonResponse({
            'success': False,
            'error': 'Invalid date format. Use YYYY-MM-DD'
        }, status=400)
    
    # Check if date is in the past
    if booking_date < date.today():
        return JsonResponse({
            'success': False,
            'error': 'Cannot book for past dates'
        }, status=400)
    
    # Check if slot already booked
    existing = Booking.objects.filter(
        date=booking_date,
        time_slot=time_slot,
        status__in=['PENDING', 'CONFIRMED']
    ).exists()
    
    if existing:
        return JsonResponse({
            'success': False,
            'error': 'This time slot is already booked'
        }, status=400)
    
    # Create booking
    booking = Booking.objects.create(
        user=user,
        date=booking_date,
        time_slot=time_slot,
        notes=data.get('notes', ''),
        status='PENDING'
    )
    
    return JsonResponse({
        'success': True,
        'message': 'Booking created successfully',
        'booking': {
            'id': booking.id,
            'date': booking.date.isoformat(),
            'time_slot': booking.time_slot,
            'status': booking.status,
        }
    })



# Update booking_list as well
@require_http_methods(["GET"])
def booking_list(request):
    """Get user's bookings"""
    
    try:
        user = User.objects.get(username='testcustomer')
    except User.DoesNotExist:
        return JsonResponse({
            'success': False,
            'error': 'User not found'
        }, status=404)
    
    bookings = Booking.objects.filter(user=user)
    
    bookings_data = []
    for booking in bookings:
        bookings_data.append({
            'id': booking.id,
            'date': booking.date.isoformat(),
            'time_slot': booking.time_slot,
            'status': booking.status,
            'notes': booking.notes,
            'measurement_status': 'completed' if booking.measurement_photo else 'pending',
            'measurement_photo_url': booking.measurement_photo.url if booking.measurement_photo else None,
            'created_at': booking.created_at.isoformat(),
        })
    
    return JsonResponse({
        'success': True,
        'bookings': bookings_data
    })
    
# bookings/views.py - Add this new function

@require_http_methods(["GET"])
def get_my_measurements(request):
    """Get customer's measurement meters (if completed)"""
    
    # Get user
    try:
        user = User.objects.get(username='testcustomer')
    except User.DoesNotExist:
        return JsonResponse({
            'success': False,
            'error': 'User not found'
        }, status=404)
    
    # Get latest completed booking with measurements
    completed_booking = Booking.objects.filter(
        user=user,
        status='COMPLETED',
        measurement_photo__isnull=False
    ).order_by('-updated_at').first()
    
    if not completed_booking or not completed_booking.measurement_data:
        return JsonResponse({
            'success': False,
            'has_measurement': False,
            'message': 'No measurements found'
        })
    
    measurement_data = completed_booking.measurement_data
    
    return JsonResponse({
        'success': True,
        'has_measurement': True,
        'measurements': {
            'shirt_meters': measurement_data.get('shirt_meters'),
            'pant_meters': measurement_data.get('pant_meters'),
            'kurta_meters': measurement_data.get('kurta_meters'),
            'notes': measurement_data.get('notes', '')
        },
        'booking_date': completed_booking.date.isoformat()
    })

# bookings/views.py - Update booking_detail function

@require_http_methods(["GET"])
def booking_detail(request, booking_id):
    """Get booking details (NO PHOTO - customer side)"""
    
    # Get user
    try:
        user = User.objects.get(username='testcustomer')
    except User.DoesNotExist:
        return JsonResponse({
            'success': False,
            'error': 'User not found'
        }, status=404)
    
    # Get booking
    try:
        booking = Booking.objects.get(id=booking_id, user=user)
    except Booking.DoesNotExist:
        return JsonResponse({
            'success': False,
            'error': 'Booking not found'
        }, status=404)
    
    # Customer sees status but NOT the photo
    return JsonResponse({
        'success': True,
        'booking': {
            'id': booking.id,
            'date': booking.date.isoformat(),
            'time_slot': booking.time_slot,
            'status': booking.status,
            'notes': booking.notes,
            'measurement_status': 'completed' if booking.measurement_photo else 'pending',
            'created_at': booking.created_at.isoformat(),
            'updated_at': booking.updated_at.isoformat(),
        }
    })


@csrf_exempt
@require_http_methods(["DELETE"])
def cancel_booking(request, booking_id):
    """Cancel a booking"""
    
    # Get user
    try:
        user = User.objects.get(username='testcustomer')
    except User.DoesNotExist:
        return JsonResponse({
            'success': False,
            'error': 'User not found'
        }, status=404)
    
    # Get booking
    try:
        booking = Booking.objects.get(id=booking_id, user=user)
    except Booking.DoesNotExist:
        return JsonResponse({
            'success': False,
            'error': 'Booking not found'
        }, status=404)
    
    # Check if can be cancelled
    if booking.status == 'COMPLETED':
        return JsonResponse({
            'success': False,
            'error': 'Cannot cancel completed booking'
        }, status=400)
    
    if booking.status == 'CANCELLED':
        return JsonResponse({
            'success': False,
            'error': 'Booking already cancelled'
        }, status=400)
    
    # Cancel booking
    booking.status = 'CANCELLED'
    booking.save()
    
    return JsonResponse({
        'success': True,
        'message': 'Booking cancelled successfully'
    })


@require_http_methods(["GET"])
def available_slots(request):
    """Get available time slots for a date"""
    
    booking_date = request.GET.get('date')
    
    if not booking_date:
        return JsonResponse({
            'success': False,
            'error': 'date parameter is required'
        }, status=400)
    
    # Parse date
    try:
        booking_date = datetime.strptime(booking_date, '%Y-%m-%d').date()
    except ValueError:
        return JsonResponse({
            'success': False,
            'error': 'Invalid date format. Use YYYY-MM-DD'
        }, status=400)
    
    # Define available time slots
    all_slots = [
        '09:00 AM - 10:00 AM',
        '10:00 AM - 11:00 AM',
        '11:00 AM - 12:00 PM',
        '12:00 PM - 01:00 PM',
        '02:00 PM - 03:00 PM',
        '03:00 PM - 04:00 PM',
        '04:00 PM - 05:00 PM',
        '05:00 PM - 06:00 PM',
    ]
    
    # Get booked slots
    booked_slots = Booking.objects.filter(
        date=booking_date,
        status__in=['PENDING', 'CONFIRMED']
    ).values_list('time_slot', flat=True)
    
    # Calculate available slots
    available = [slot for slot in all_slots if slot not in booked_slots]
    
    return JsonResponse({
        'success': True,
        'date': booking_date.isoformat(),
        'available_slots': available,
        'booked_slots': list(booked_slots),
    })


# Measurement Profile APIs

@csrf_exempt
@require_http_methods(["POST"])
def create_measurement_profile(request):
    """Create or update measurement profile"""
    
    try:
        data = json.loads(request.body)
    except json.JSONDecodeError:
        return JsonResponse({
            'success': False,
            'error': 'Invalid JSON'
        }, status=400)
    
    # Get user
    try:
        user = User.objects.get(username='testcustomer')
    except User.DoesNotExist:
        return JsonResponse({
            'success': False,
            'error': 'User not found'
        }, status=404)
    
    profile_name = data.get('profile_name', 'Default')
    measurements = data.get('measurements')
    
    if not measurements:
        return JsonResponse({
            'success': False,
            'error': 'measurements are required'
        }, status=400)
    
    # Validate measurements structure
    required_fields = ['chest', 'waist', 'shoulder', 'sleeve', 'length']
    for field in required_fields:
        if field not in measurements:
            return JsonResponse({
                'success': False,
                'error': f'{field} is required in measurements'
            }, status=400)
    
    # Create or update profile
    profile, created = MeasurementProfile.objects.update_or_create(
        user=user,
        profile_name=profile_name,
        defaults={'measurements': measurements}
    )
    
    return JsonResponse({
        'success': True,
        'message': 'Measurement profile saved successfully',
        'profile': {
            'id': profile.id,
            'profile_name': profile.profile_name,
            'measurements': profile.measurements,
        }
    })


@require_http_methods(["GET"])
def measurement_profile_list(request):
    """Get user's measurement profiles"""
    
    # Get user
    try:
        user = User.objects.get(username='testcustomer')
    except User.DoesNotExist:
        return JsonResponse({
            'success': False,
            'error': 'User not found'
        }, status=404)
    
    profiles = MeasurementProfile.objects.filter(user=user)
    
    profiles_data = []
    for profile in profiles:
        profiles_data.append({
            'id': profile.id,
            'profile_name': profile.profile_name,
            'measurements': profile.measurements,
            'created_at': profile.created_at.isoformat(),
        })
    
    return JsonResponse({
        'success': True,
        'profiles': profiles_data
    })


@require_http_methods(["GET"])
def measurement_profile_detail(request, profile_id):
    """Get measurement profile details"""
    
    # Get user
    try:
        user = User.objects.get(username='testcustomer')
    except User.DoesNotExist:
        return JsonResponse({
            'success': False,
            'error': 'User not found'
        }, status=404)
    
    # Get profile
    try:
        profile = MeasurementProfile.objects.get(id=profile_id, user=user)
    except MeasurementProfile.DoesNotExist:
        return JsonResponse({
            'success': False,
            'error': 'Profile not found'
        }, status=404)
    
    return JsonResponse({
        'success': True,
        'profile': {
            'id': profile.id,
            'profile_name': profile.profile_name,
            'measurements': profile.measurements,
            'created_at': profile.created_at.isoformat(),
            'updated_at': profile.updated_at.isoformat(),
        }
    })