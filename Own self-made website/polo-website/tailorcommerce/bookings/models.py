# bookings/models.py

from django.db import models
from cloudinary.models import CloudinaryField


class MeasurementProfile(models.Model):
    """Reusable measurement profiles for customers"""
    
    user = models.ForeignKey('accounts.User', on_delete=models.CASCADE, related_name='measurement_profiles')
    profile_name = models.CharField(max_length=50, help_text="e.g., Default, Formal, Casual")
    measurements = models.JSONField(help_text="Store measurements as JSON: {chest: 38, waist: 32, etc.}")
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        db_table = 'measurement_profiles'
        verbose_name = 'Measurement Profile'
        verbose_name_plural = 'Measurement Profiles'
        unique_together = ['user', 'profile_name']
    
    def __str__(self):
        return f"{self.user.username} - {self.profile_name}"


# bookings/models.py - Update Booking model
class Booking(models.Model):
    """Measurement appointment bookings"""
    
    STATUS_CHOICES = (
        ('PENDING', 'Pending'),
        ('CONFIRMED', 'Confirmed'),
        ('COMPLETED', 'Completed'),
        ('CANCELLED', 'Cancelled'),
    )
    
    user = models.ForeignKey('accounts.User', on_delete=models.CASCADE, related_name='bookings')
    date = models.DateField()
    time_slot = models.CharField(max_length=20, help_text="e.g., 10:00 AM - 11:00 AM")
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='PENDING')
    notes = models.TextField(blank=True)
    
    # Admin uploads measurement photo (NOT visible to customer)
    measurement_photo = CloudinaryField(
        'measurement_photos',
        folder='measurements',  # CHANGED
        null=True,
        blank=True,
        help_text="Admin: Upload photo of handwritten measurements"
    )
    
    # Optional: Admin can still add JSON measurements if needed
    measurement_data = models.JSONField(
        null=True,
        blank=True,
        help_text="Admin: Optional typed measurements"
    )
    
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    # ... rest of the model
    
    class Meta:
        db_table = 'bookings'
        verbose_name = 'Booking'
        verbose_name_plural = 'Bookings'
        ordering = ['-date', '-created_at']
    
    def __str__(self):
        return f"{self.user.username} - {self.date} {self.time_slot} ({self.get_status_display()})"