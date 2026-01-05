# rentals/models.py

from django.db import models
from decimal import Decimal

class RentalTransaction(models.Model):
    """Rental lifecycle management"""
    
    STATUS_CHOICES = (
        ('ACTIVE', 'Active'),
        ('RETURNED', 'Returned'),
        ('CLOSED', 'Closed'),
    )
    
    CONDITION_CHOICES = (
        ('CLEAN', 'Clean'),
        ('DIRTY', 'Dirty'),
        ('DAMAGED', 'Damaged'),
    )
    
    order_item = models.OneToOneField('orders.OrderItem', on_delete=models.CASCADE, related_name='rental_transaction')
    
    deposit_amount = models.DecimalField(max_digits=10, decimal_places=2)
    rent_per_day = models.DecimalField(max_digits=10, decimal_places=2)
    
    expected_return_date = models.DateField()
    actual_return_date = models.DateField(null=True, blank=True)
    
    actual_days_used = models.PositiveIntegerField(default=0)
    condition_status = models.CharField(max_length=20, choices=CONDITION_CHOICES, null=True, blank=True)
    
    late_fee = models.DecimalField(max_digits=10, decimal_places=2, default=Decimal('0.00'))
    damage_fee = models.DecimalField(max_digits=10, decimal_places=2, default=Decimal('0.00'))
    rent_cost = models.DecimalField(max_digits=10, decimal_places=2, default=Decimal('0.00'))
    refund_amount = models.DecimalField(max_digits=10, decimal_places=2, default=Decimal('0.00'))
    
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='ACTIVE')
    
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        db_table = 'rental_transactions'
        verbose_name = 'Rental Transaction'
        verbose_name_plural = 'Rental Transactions'
    
    def __str__(self):
        return f"Rental for {self.order_item.product_name}"
    
    def calculate_refund(self):
        """Calculate refund amount after return"""
        if not self.actual_return_date:
            return None
        
        # Calculate rent cost
        self.rent_cost = self.rent_per_day * self.actual_days_used
        
        # Calculate refund
        self.refund_amount = self.deposit_amount - self.rent_cost - self.late_fee - self.damage_fee
        
        # Refund cannot be negative
        if self.refund_amount < 0:
            self.refund_amount = Decimal('0.00')
        
        self.save()
        return self.refund_amount