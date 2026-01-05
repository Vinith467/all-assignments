# inventory/models.py

from django.db import models

class Inventory(models.Model):
    """Stock management for product variants"""
    
    variant = models.OneToOneField(
        'catalog.ProductVariant', 
        on_delete=models.CASCADE, 
        related_name='inventory'
    )
    available_quantity = models.PositiveIntegerField(default=0)
    low_stock_threshold = models.PositiveIntegerField(default=5, help_text="Alert when stock falls below this")
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        db_table = 'inventory'
        verbose_name = 'Inventory'
        verbose_name_plural = 'Inventory'
    
    def __str__(self):
        return f"{self.variant} - Stock: {self.available_quantity}"
    
    @property
    def is_low_stock(self):
        return self.available_quantity <= self.low_stock_threshold
    
    @property
    def is_out_of_stock(self):
        return self.available_quantity == 0