# test_order_creation.py

import requests
import json

BASE_URL = 'http://127.0.0.1:8000/api'

def test_create_order():
    """Test order creation from cart"""
    url = f'{BASE_URL}/orders/create/'
    
    # Create order with default address
    response = requests.post(url, json={
        'payment_method': 'MANUAL'
    })
    
    print("="*60)
    print("CREATE ORDER")
    print("="*60)
    print(json.dumps(response.json(), indent=2))
    print()
    
    if response.json().get('success'):
        order_id = response.json()['order']['order_id']
        return order_id
    return None

def test_order_list():
    """Test getting order list"""
    url = f'{BASE_URL}/orders/'
    
    response = requests.get(url)
    
    print("="*60)
    print("ORDER LIST")
    print("="*60)
    print(json.dumps(response.json(), indent=2))
    print()

def test_order_detail(order_id):
    """Test getting order details"""
    url = f'{BASE_URL}/orders/{order_id}/'
    
    response = requests.get(url)
    
    print("="*60)
    print(f"ORDER DETAIL (ID: {order_id})")
    print("="*60)
    print(json.dumps(response.json(), indent=2))
    print()

if __name__ == '__main__':
    print("\n🛍️ TESTING ORDER CREATION\n")
    
    # Step 1: Create order from cart
    order_id = test_create_order()
    
    if order_id:
        # Step 2: View order list
        test_order_list()
        
        # Step 3: View order details
        test_order_detail(order_id)
        
        print("✅ Order creation successful!")
        print(f"📦 Order ID: {order_id}")
    else:
        print("❌ Order creation failed!")