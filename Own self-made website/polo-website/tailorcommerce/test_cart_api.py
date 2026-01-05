# test_cart_api.py

import requests
import json

BASE_URL = 'http://127.0.0.1:8000/api'

def test_add_blazer_to_cart():
    """Test adding blazer to cart (BUY)"""
    url = f'{BASE_URL}/cart/add/'
    
    # Add Medium Black Blazer
    data = {
        'product_id': 2,  # Blazer
        'variant_id': 1,  # M size (check your admin for correct ID)
        'purchase_type': 'BUY',
        'quantity': 1
    }
    
    response = requests.post(url, json=data)
    print("Add Blazer (BUY):")
    print(response.json())
    print()

def test_add_blazer_rental():
    """Test adding blazer as rental"""
    url = f'{BASE_URL}/cart/add/'
    
    data = {
        'product_id': 2,  # Blazer
        'variant_id': 2,  # L size
        'purchase_type': 'RENT',
        'quantity': 1,
        'rental_days': 5
    }
    
    response = requests.post(url, json=data)
    print("Add Blazer (RENT - 5 days):")
    print(response.json())
    print()

def test_add_fabric_only():
    """Test adding fabric without stitching"""
    url = f'{BASE_URL}/cart/add/'
    
    data = {
        'product_id': 1,  # Fabric
        'purchase_type': 'BUY',
        'quantity': 1,
        'meters': 3.0  # Customer selects meters
    }
    
    response = requests.post(url, json=data)
    print("Add Fabric (3 meters, no stitching):")
    print(response.json())
    print()

def test_add_fabric_with_stitching():
    """Test adding fabric with stitching"""
    url = f'{BASE_URL}/cart/add/'
    
    data = {
        'product_id': 1,  # Fabric
        'purchase_type': 'BUY',
        'quantity': 1,
        'stitch_type_id': 1  # Shirt stitching (meters will be set by admin)
    }
    
    response = requests.post(url, json=data)
    print("Add Fabric with Shirt Stitching (meters pending):")
    print(response.json())
    print()

def test_get_cart():
    """Get cart contents"""
    url = f'{BASE_URL}/cart/'
    
    response = requests.get(url)
    print("Cart Contents:")
    print(json.dumps(response.json(), indent=2))
    print()

if __name__ == '__main__':
    print("=" * 50)
    print("Testing Cart APIs")
    print("=" * 50)
    print()
    
    # Test 1: Add blazer to buy
    test_add_blazer_to_cart()
    
    # Test 2: Add accessory
    url = f'{BASE_URL}/cart/add/'
    data = {
        'product_id': 6,  # Cufflinks
        'variant_id': 12,  # Check correct variant ID
        'purchase_type': 'BUY',
        'quantity': 2
    }
    response = requests.post(url, json=data)
    print("Add Cufflinks (2 qty):")
    print(response.json())
    print()
    
    # View cart
    test_get_cart()