# test_cart_complete.py

import requests
import json

BASE_URL = 'http://127.0.0.1:8000/api'

def print_response(title, response):
    print(f"\n{'='*60}")
    print(f"{title}")
    print(f"{'='*60}")
    print(json.dumps(response.json(), indent=2))

def test_1_add_blazer_buy():
    """Add blazer to buy"""
    response = requests.post(f'{BASE_URL}/cart/add/', json={
        'product_id': 2,
        'variant_id': 1,  # M size
        'purchase_type': 'BUY',
        'quantity': 1
    })
    print_response("TEST 1: Add Blazer (BUY)", response)

def test_2_add_blazer_rent():
    """Add blazer to rent"""
    response = requests.post(f'{BASE_URL}/cart/add/', json={
        'product_id': 2,
        'variant_id': 2,  # L size
        'purchase_type': 'RENT',
        'quantity': 1,
        'rental_days': 5
    })
    print_response("TEST 2: Add Blazer (RENT - 5 days)", response)

def test_3_add_cufflinks():
    """Add cufflinks"""
    response = requests.post(f'{BASE_URL}/cart/add/', json={
        'product_id': 6,
        'variant_id': 12,  # Correct ID
        'purchase_type': 'BUY',
        'quantity': 2
    })
    print_response("TEST 3: Add Cufflinks (2 qty)", response)

def test_4_add_fabric_only():
    """Add fabric without stitching"""
    response = requests.post(f'{BASE_URL}/cart/add/', json={
        'product_id': 1,
        'purchase_type': 'BUY',
        'quantity': 1,
        'meters': 3.5
    })
    print_response("TEST 4: Add Fabric (3.5 meters, no stitching)", response)

def test_5_add_fabric_with_stitching():
    """Add fabric with stitching"""
    response = requests.post(f'{BASE_URL}/cart/add/', json={
        'product_id': 1,
        'purchase_type': 'BUY',
        'quantity': 1,
        'stitch_type_id': 1  # Shirt stitching
    })
    print_response("TEST 5: Add Fabric with Shirt Stitching", response)

def test_6_view_cart():
    """View final cart"""
    response = requests.get(f'{BASE_URL}/cart/')
    print_response("TEST 6: Final Cart Contents", response)

def test_7_update_quantity():
    """Update cart item quantity"""
    response = requests.put(f'{BASE_URL}/cart/update/1/', json={
        'quantity': 2  # Change blazer quantity to 2
    })
    print_response("TEST 7: Update Blazer Quantity to 2", response)

def test_8_remove_item():
    """Remove item from cart"""
    response = requests.delete(f'{BASE_URL}/cart/remove/2/')
    print_response("TEST 8: Remove Item ID 2", response)

def test_9_final_cart():
    """View cart after modifications"""
    response = requests.get(f'{BASE_URL}/cart/')
    print_response("TEST 9: Cart After Updates", response)

if __name__ == '__main__':
    print("\n")
    print("🛒 " + "="*58 + " 🛒")
    print("         COMPLETE CART API TESTING")
    print("🛒 " + "="*58 + " 🛒")
    
    # Clear previous test (start fresh)
    print("\n⚠️  Note: This test assumes empty cart or will add to existing items\n")
    
    # Run all tests
    test_1_add_blazer_buy()
    test_2_add_blazer_rent()
    test_3_add_cufflinks()
    test_4_add_fabric_only()
    test_5_add_fabric_with_stitching()
    test_6_view_cart()
    
    input("\n\nPress ENTER to test UPDATE and DELETE operations...")
    
    test_7_update_quantity()
    test_8_remove_item()
    test_9_final_cart()
    
    print("\n\n✅ All tests completed!")