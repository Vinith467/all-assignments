# populate_data.py

import os
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings')
django.setup()

from accounts.models import User, Address
from catalog.models import (
    Product, ProductImage, ProductVariant, Fabric, 
    StitchType, RentalConfig
)
from inventory.models import Inventory
from decimal import Decimal

def create_sample_data():
    print("Creating sample data...")
    
    # 1. Create a customer user
    customer, created = User.objects.get_or_create(
        username='testcustomer',
        defaults={
            'email': 'customer@test.com',
            'phone': '9876543210',
            'role': 'CUSTOMER'
        }
    )
    if created:
        customer.set_password('test123')
        customer.save()
        print("✅ Customer user created")
    
    # 2. Create address for customer
    address, created = Address.objects.get_or_create(
        user=customer,
        name='Test Customer',
        defaults={
            'phone': '9876543210',
            'address_line': '123 Main Street, Apartment 4B',
            'city': 'Bangalore',
            'state': 'Karnataka',
            'pincode': '560001',
            'is_default': True
        }
    )
    if created:
        print("✅ Customer address created")
    
    # 3. Create stitch types
    stitch_types_data = [
        {'name': 'Shirt Stitching', 'price': Decimal('300.00'), 'description': 'Standard shirt stitching'},
        {'name': 'Pant Stitching', 'price': Decimal('250.00'), 'description': 'Standard pant stitching'},
        {'name': 'Kurta Stitching', 'price': Decimal('400.00'), 'description': 'Traditional kurta stitching'},
    ]
    
    for data in stitch_types_data:
        stitch_type, created = StitchType.objects.get_or_create(
            name=data['name'],
            defaults={'price': data['price'], 'description': data['description']}
        )
        if created:
            print(f"✅ Stitch type created: {data['name']}")
    
    # 4. Create a fabric product
    fabric_product, created = Product.objects.get_or_create(
        name='Premium Cotton White Shirt Fabric',
        defaults={
            'category': 'FABRIC',
            'brand': 'Premium Textiles',
            'description': 'High quality cotton fabric perfect for formal shirts',
            'is_buyable': True,
            'is_rentable': False,
            'is_active': True
        }
    )
    if created:
        print("✅ Fabric product created")
        
        # Add fabric details
        Fabric.objects.create(
            product=fabric_product,
            fabric_category='SHIRT',
            material='COTTON',
            color='White',
            price_per_meter=Decimal('250.00')
        )
        print("✅ Fabric details added")
    
    # 5. Create a readymade product (blazer - rentable and buyable)
    blazer, created = Product.objects.get_or_create(
        name='Premium Black Blazer',
        defaults={
            'category': 'READYMADE',
            'brand': 'Elite Fashion',
            'description': 'Premium black blazer perfect for weddings and formal events',
            'is_buyable': True,
            'is_rentable': True,
            'is_active': True
        }
    )
    if created:
        print("✅ Blazer product created")
        
        # Add rental config
        RentalConfig.objects.create(
            product=blazer,
            deposit_amount=Decimal('5000.00'),
            rent_per_day=Decimal('300.00')
        )
        print("✅ Rental config added")
        
        # Add variants
        sizes = ['M', 'L', 'XL']
        for size in sizes:
            variant = ProductVariant.objects.create(
                product=blazer,
                sku=f'BLAZER-BLK-{size}',
                size=size,
                color='Black',
                price_override=Decimal('4500.00')
            )
            # Add inventory
            Inventory.objects.create(
                variant=variant,
                available_quantity=10,
                low_stock_threshold=3
            )
            print(f"✅ Variant created: {size}")
    
    # 6. Create a traditional product
    wedding_kurta, created = Product.objects.get_or_create(
        name='Royal Wedding Kurta Set',
        defaults={
            'category': 'TRADITIONAL',
            'brand': 'Royal Wear',
            'description': 'Complete wedding kurta set with all accessories',
            'is_buyable': True,
            'is_rentable': True,
            'is_active': True
        }
    )
    if created:
        print("✅ Wedding kurta created")
        
        # Add rental config
        RentalConfig.objects.create(
            product=wedding_kurta,
            deposit_amount=Decimal('8000.00'),
            rent_per_day=Decimal('500.00')
        )
        
        # Add variants
        sizes = ['M', 'L', 'XL']
        colors = ['Cream', 'Gold']
        for size in sizes:
            for color in colors:
                variant = ProductVariant.objects.create(
                    product=wedding_kurta,
                    sku=f'KURTA-{color[:3].upper()}-{size}',
                    size=size,
                    color=color,
                    price_override=Decimal('7500.00')
                )
                # Add inventory
                Inventory.objects.create(
                    variant=variant,
                    available_quantity=5,
                    low_stock_threshold=2
                )
        print("✅ Wedding kurta variants created")
    
    # 7. Create accessories
    accessories_data = [
        {'name': 'Leather Belt', 'brand': 'Premium Leather', 'price': Decimal('800.00')},
        {'name': 'Silk Tie', 'brand': 'Elite Fashion', 'price': Decimal('500.00')},
        {'name': 'Cufflinks Set', 'brand': 'Royal Accessories', 'price': Decimal('1200.00')},
    ]
    
    for data in accessories_data:
        product, created = Product.objects.get_or_create(
            name=data['name'],
            defaults={
                'category': 'ACCESSORY',
                'brand': data['brand'],
                'description': f'Premium quality {data["name"].lower()}',
                'is_buyable': True,
                'is_rentable': False,
                'is_active': True
            }
        )
        if created:
            # Add variant
            variant = ProductVariant.objects.create(
                product=product,
                sku=f'ACC-{data["name"][:3].upper()}-001',
                color='Standard',
                price_override=data['price']
            )
            # Add inventory
            Inventory.objects.create(
                variant=variant,
                available_quantity=50,
                low_stock_threshold=10
            )
            print(f"✅ Accessory created: {data['name']}")
    
    print("\n🎉 Sample data creation completed!")
    print("\nCreated:")
    print(f"- {User.objects.filter(role='CUSTOMER').count()} customer(s)")
    print(f"- {Product.objects.count()} product(s)")
    print(f"- {ProductVariant.objects.count()} variant(s)")
    print(f"- {StitchType.objects.count()} stitch type(s)")
    print(f"- {Inventory.objects.count()} inventory record(s)")

if __name__ == '__main__':
    create_sample_data()