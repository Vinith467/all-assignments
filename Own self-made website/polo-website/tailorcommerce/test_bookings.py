# test_bookings.py

import requests
import json
from datetime import datetime, timedelta

BASE_URL = 'http://127.0.0.1:8000/api'

def test_1_check_available_slots():
    """Check available slots for tomorrow"""
    tomorrow = (datetime.now() + timedelta(days=1)).strftime('%Y-%m-%d')
    
    response = requests.get(f'{BASE_URL}/bookings/available-slots/', params={
        'date': tomorrow
    })
    
    print("="*60)
    print("TEST 1: Check Available Slots")
    print("="*60)
    print(json.dumps(response.json(), indent=2))
    print()

def test_2_create_booking():
    """Create a booking"""
    tomorrow = (datetime.now() + timedelta(days=1)).strftime('%Y-%m-%d')
    
    response = requests.post(f'{BASE_URL}/bookings/create/', json={
        'date': tomorrow,
        'time_slot': '10:00 AM - 11:00 AM',
        'notes': 'Need measurements for shirt stitching'
    })
    
    print("="*60)
    print("TEST 2: Create Booking")
    print("="*60)
    print(json.dumps(response.json(), indent=2))
    print()
    
    if response.json().get('success'):
        return response.json()['booking']['id']
    return None

def test_3_booking_list():
    """Get booking list"""
    response = requests.get(f'{BASE_URL}/bookings/')
    
    print("="*60)
    print("TEST 3: Booking List")
    print("="*60)
    print(json.dumps(response.json(), indent=2))
    print()

def test_4_create_measurement_profile():
    """Create measurement profile"""
    response = requests.post(f'{BASE_URL}/bookings/measurements/create/', json={
        'profile_name': 'Formal Shirt',
        'measurements': {
            'chest': 40,
            'waist': 34,
            'shoulder': 18,
            'sleeve': 32,
            'length': 30,
            'collar': 16,
            'notes': 'Standard fit'
        }
    })
    
    print("="*60)
    print("TEST 4: Create Measurement Profile")
    print("="*60)
    print(json.dumps(response.json(), indent=2))
    print()

def test_5_measurement_list():
    """Get measurement profiles"""
    response = requests.get(f'{BASE_URL}/bookings/measurements/')
    
    print("="*60)
    print("TEST 5: Measurement Profile List")
    print("="*60)
    print(json.dumps(response.json(), indent=2))
    print()

def test_6_booking_detail(booking_id):
    """Get booking details"""
    response = requests.get(f'{BASE_URL}/bookings/{booking_id}/')
    
    print("="*60)
    print(f"TEST 6: Booking Detail (ID: {booking_id})")
    print("="*60)
    print(json.dumps(response.json(), indent=2))
    print()

if __name__ == '__main__':
    print("\n📅 TESTING BOOKINGS & MEASUREMENTS\n")
    
    test_1_check_available_slots()
    booking_id = test_2_create_booking()
    test_3_booking_list()
    test_4_create_measurement_profile()
    test_5_measurement_list()
    
    if booking_id:
        test_6_booking_detail(booking_id)
    
    print("✅ All booking tests completed!")