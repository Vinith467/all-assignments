# test_rental_admin.py

import requests
import json

BASE_URL = 'http://127.0.0.1:8000/api'

def test_1_active_rentals():
    """Get active rentals"""
    response = requests.get(f'{BASE_URL}/admin/rentals/active/')
    
    print("="*60)
    print("TEST 1: Active Rentals")
    print("="*60)
    print(json.dumps(response.json(), indent=2))
    print()
    
    data = response.json()
    if data.get('success') and data.get('rentals'):
        return data['rentals'][0]['rental_id']
    return None

def test_2_process_return(rental_id):
    """Process rental return"""
    if not rental_id:
        print("⚠️  No active rentals to test\n")
        return
    
    response = requests.post(
        f'{BASE_URL}/admin/rentals/{rental_id}/return/',
        json={
            'actual_return_date': '2026-01-06',  # On time
            'condition_status': 'CLEAN',
            'damage_fee': 0
        }
    )
    
    print("="*60)
    print(f"TEST 2: Process Return (Rental ID: {rental_id})")
    print("="*60)
    print(json.dumps(response.json(), indent=2))
    print()

def test_3_rental_history():
    """Get rental history"""
    response = requests.get(f'{BASE_URL}/admin/rentals/history/')
    
    print("="*60)
    print("TEST 3: Rental History")
    print("="*60)
    print(json.dumps(response.json(), indent=2))
    print()

if __name__ == '__main__':
    print("\n🔄 TESTING RENTAL MANAGEMENT\n")
    
    rental_id = test_1_active_rentals()
    test_2_process_return(rental_id)
    test_3_rental_history()
    
    print("✅ All rental tests completed!")