from django.db import models

# Create your models here.
from django.db import models

class WishlistItem(models.Model):
    user = models.ForeignKey('accounts.User', on_delete=models.CASCADE, related_name='wishlist')
    product = models.ForeignKey('catalog.Product', on_delete=models.CASCADE, related_name='wishlisted_by')
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = 'wishlist_items'
        unique_together = ('user', 'product') # User can't wishlist same item twice
        ordering = ['-created_at']

    def __str__(self):
        return f"{self.user.username} - {self.product.name}"