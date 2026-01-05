# reviews/models.py

from django.db import models
from django.core.validators import MinValueValidator, MaxValueValidator
from cloudinary.models import CloudinaryField


class Review(models.Model):
    """Product reviews by customers"""
    
    user = models.ForeignKey('accounts.User', on_delete=models.CASCADE, related_name='reviews')
    product = models.ForeignKey('catalog.Product', on_delete=models.CASCADE, related_name='reviews')
    rating = models.PositiveIntegerField(
        validators=[MinValueValidator(1), MaxValueValidator(5)],
        help_text="Rating from 1 to 5"
    )
    comment = models.TextField()
    is_verified_purchase = models.BooleanField(default=False, help_text="Did user purchase this?")
    
    review_image = CloudinaryField('review_images', folder='reviews', null=True, blank=True)
    
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        db_table = 'reviews'
        verbose_name = 'Review'
        verbose_name_plural = 'Reviews'
        unique_together = ['user', 'product']  # One review per user per product
        ordering = ['-created_at']
    
    def __str__(self):
        return f"{self.user.username} - {self.product.name} ({self.rating}★)"