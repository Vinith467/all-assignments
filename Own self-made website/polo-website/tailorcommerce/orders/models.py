# orders/models.py

from django.db import models
from decimal import Decimal

class Order(models.Model):
    """Customer orders after checkout"""
    
    STATUS_CHOICES = (
        ('PLACED', 'Placed'),
        ('PROCESSING', 'Processing'),
        ('STITCHING', 'Stitching'),
        ('READY', 'Ready'),
        ('PICKED_UP', 'Picked Up'),
        ('COMPLETED', 'Completed'),
        ('CANCELLED', 'Cancelled'),
    )
    
    user = models.ForeignKey('accounts.User', on_delete=models.CASCADE, related_name='orders')
    address = models.ForeignKey('accounts.Address', on_delete=models.SET_NULL, null=True)
    order_number = models.CharField(max_length=50, unique=True, editable=False)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='PLACED')
    total_amount = models.DecimalField(max_digits=12, decimal_places=2)
    
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        db_table = 'orders'
        verbose_name = 'Order'
        verbose_name_plural = 'Orders'
        ordering = ['-created_at']
    
    def __str__(self):
        return f"Order {self.order_number} - {self.user.username}"
    
    def save(self, *args, **kwargs):
        if not self.order_number:
            # Generate order number: ORD-YYYYMMDD-XXXX
            from django.utils import timezone
            import random
            date_str = timezone.now().strftime('%Y%m%d')
            random_str = str(random.randint(1000, 9999))
            self.order_number = f"ORD-{date_str}-{random_str}"
        super().save(*args, **kwargs)


class OrderItem(models.Model):
    """Order items with snapshots (immutable)"""
    
    PURCHASE_TYPE_CHOICES = (
        ('BUY', 'Buy'),
        ('RENT', 'Rent'),
    )
    
    STITCHING_STATUS_CHOICES = (
        ('NOT_APPLICABLE', 'Not Applicable'),
        ('PENDING_MEASUREMENT', 'Pending Measurement'),
        ('READY_FOR_STITCHING', 'Ready for Stitching'),
        ('IN_STITCHING', 'In Stitching'),
        ('COMPLETED', 'Completed'),
    )
    
    order = models.ForeignKey(Order, on_delete=models.CASCADE, related_name='items')
    
    # Snapshots (store data at time of order)
    product_name = models.CharField(max_length=200)
    product_category = models.CharField(max_length=20)
    variant_snapshot = models.JSONField(null=True, blank=True, help_text="Size, color details")
    fabric_snapshot = models.JSONField(null=True, blank=True, help_text="Fabric details if applicable")
    stitch_type_snapshot = models.JSONField(null=True, blank=True, help_text="Stitching details if applicable")
    
    purchase_type = models.CharField(max_length=10, choices=PURCHASE_TYPE_CHOICES, default='BUY')
    quantity = models.PositiveIntegerField(default=1)
    meters = models.DecimalField(max_digits=5, decimal_places=2, null=True, blank=True, help_text="Fabric meters (admin sets for stitching)")
    price = models.DecimalField(max_digits=10, decimal_places=2)
    image_url = models.CharField(max_length=500, null=True, blank=True, help_text="URL of product image at time of order")
    stitching_status = models.CharField(max_length=30, choices=STITCHING_STATUS_CHOICES, default='NOT_APPLICABLE')
    
    created_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        db_table = 'order_items'
        verbose_name = 'Order Item'
        verbose_name_plural = 'Order Items'
    
    def __str__(self):
        return f"{self.product_name} in Order {self.order.order_number}"


class OrderStatusHistory(models.Model):
    """Track order status changes"""
    
    order = models.ForeignKey(Order, on_delete=models.CASCADE, related_name='status_history')
    status = models.CharField(max_length=20)
    note = models.TextField(blank=True)
    changed_by = models.ForeignKey('accounts.User', on_delete=models.SET_NULL, null=True)
    changed_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        db_table = 'order_status_history'
        verbose_name = 'Order Status History'
        verbose_name_plural = 'Order Status Histories'
        ordering = ['-changed_at']
    
    def __str__(self):
        return f"{self.order.order_number} - {self.status}"


class Invoice(models.Model):
    """Invoice for orders"""
    
    order = models.OneToOneField(Order, on_delete=models.CASCADE, related_name='invoice')
    invoice_number = models.CharField(max_length=50, unique=True, editable=False)
    pdf_url = models.FileField(upload_to='invoices/%Y/%m/', null=True, blank=True)
    gst_amount = models.DecimalField(max_digits=10, decimal_places=2, default=Decimal('0.00'))
    total_with_gst = models.DecimalField(max_digits=12, decimal_places=2)
    created_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        db_table = 'invoices'
        verbose_name = 'Invoice'
        verbose_name_plural = 'Invoices'
    
    def __str__(self):
        return f"Invoice {self.invoice_number}"
    
    def save(self, *args, **kwargs):
        if not self.invoice_number:
            # Generate invoice number: INV-YYYYMMDD-XXXX
            from django.utils import timezone
            import random
            date_str = timezone.now().strftime('%Y%m%d')
            random_str = str(random.randint(1000, 9999))
            self.invoice_number = f"INV-{date_str}-{random_str}"
        super().save(*args, **kwargs)