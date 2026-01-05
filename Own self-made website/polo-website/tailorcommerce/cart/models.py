# cart/models.py

from django.db import models
from decimal import Decimal

class Cart(models.Model):
    """Shopping cart for users"""
    
    STATUS_CHOICES = (
        ('ACTIVE', 'Active'),
        ('CHECKED_OUT', 'Checked Out'),
    )
    
    user = models.ForeignKey('accounts.User', on_delete=models.CASCADE, related_name='carts')
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='ACTIVE')
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        db_table = 'carts'
        verbose_name = 'Cart'
        verbose_name_plural = 'Carts'
    
    def __str__(self):
        return f"{self.user.username}'s Cart ({self.get_status_display()})"
    
    def calculate_total(self):
        total = Decimal('0.00')
        for item in self.items.all():
            total += item.get_subtotal()
        return total


class CartItem(models.Model):
    """Items in cart - handles all product types"""
    
    PURCHASE_TYPE_CHOICES = (
        ('BUY', 'Buy'),
        ('RENT', 'Rent'),
    )
    
    cart = models.ForeignKey(Cart, on_delete=models.CASCADE, related_name='items')
    product = models.ForeignKey('catalog.Product', on_delete=models.CASCADE)
    variant = models.ForeignKey('catalog.ProductVariant', on_delete=models.SET_NULL, null=True, blank=True)
    
    # For fabric purchases
    fabric = models.ForeignKey('catalog.Fabric', on_delete=models.SET_NULL, null=True, blank=True)
    meters = models.DecimalField(max_digits=5, decimal_places=2, null=True, blank=True, help_text="Fabric meters")
    stitch_type = models.ForeignKey('catalog.StitchType', on_delete=models.SET_NULL, null=True, blank=True)
    
    # For rentals
    purchase_type = models.CharField(max_length=10, choices=PURCHASE_TYPE_CHOICES, default='BUY')
    rental_days = models.PositiveIntegerField(null=True, blank=True, help_text="Number of days for rental")
    
    quantity = models.PositiveIntegerField(default=1)
    price_snapshot = models.DecimalField(max_digits=10, decimal_places=2, help_text="Price at time of adding to cart")
    
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        db_table = 'cart_items'
        verbose_name = 'Cart Item'
        verbose_name_plural = 'Cart Items'
    
    def __str__(self):
        return f"{self.product.name} in {self.cart.user.username}'s cart"
    
    def get_subtotal(self):
        """Calculate subtotal based on item type"""
        subtotal = Decimal('0.00')
        
        # ✅ FIX: Handle fabric items separately
        if self.fabric:
            # Calculate fabric cost based on meters
            if self.meters:
                subtotal = self.fabric.price_per_meter * self.meters
            
            # Add stitching cost if applicable
            if self.stitch_type:
                subtotal += self.stitch_type.price
        
        # Handle rental items
        elif self.purchase_type == 'RENT' and self.rental_days:
            rental_config = getattr(self.product, 'rental_config', None)
            if rental_config:
                subtotal = rental_config.deposit_amount
        
        # Handle regular products (readymade, accessories, etc.)
        else:
            subtotal = self.price_snapshot * self.quantity
        
        return subtotal