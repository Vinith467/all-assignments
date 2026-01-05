# test_admin_orders.py

import requests
import json

BASE_URL = 'http://127.0.0.1:8000/api'

def test_1_admin_order_list():
    """Get all orders (admin view)"""
    response = requests.get(f'{BASE_URL}/admin/orders/all/')
    
    print("="*60)
    print("TEST 1: Admin Order List")
    print("="*60)
    print(json.dumps(response.json(), indent=2))
    print()

def test_2_pending_measurements():
    """Get orders with pending measurements"""
    response = requests.get(f'{BASE_URL}/admin/orders/pending-measurements/')
    
    print("="*60)
    print("TEST 2: Orders Pending Measurements")
    print("="*60)
    print(json.dumps(response.json(), indent=2))
    print()
    
    # Return first item ID for testing
    data = response.json()
    if data.get('success') and data.get('pending_items'):
        return data['pending_items'][0]['order_item_id']
    return None

def test_3_set_fabric_meters(order_item_id):
    """Set fabric meters for an item"""
    if not order_item_id:
        print("⚠️  No pending measurements to test\n")
        return
    
    response = requests.put(
        f'{BASE_URL}/admin/orders/items/{order_item_id}/set-meters/',
        json={'meters': 2.5}
    )
    
    print("="*60)
    print(f"TEST 3: Set Fabric Meters (Item ID: {order_item_id})")
    print("="*60)
    print(json.dumps(response.json(), indent=2))
    print()

def test_4_update_order_status():
    """Update order status"""
    response = requests.put(
        f'{BASE_URL}/admin/orders/1/update-status/',
        json={
            'status': 'PROCESSING',
            'note': 'Order confirmed and being processed'
        }
    )
    
    print("="*60)
    print("TEST 4: Update Order Status")
    print("="*60)
    print(json.dumps(response.json(), indent=2))
    print()

if __name__ == '__main__':
    print("\n👨‍💼 TESTING ADMIN ORDER MANAGEMENT\n")
    
    test_1_admin_order_list()
    item_id = test_2_pending_measurements()
    test_3_set_fabric_meters(item_id)
    test_4_update_order_status()
    
    print("✅ All admin tests completed!")