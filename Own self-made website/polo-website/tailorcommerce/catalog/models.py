# catalog/models.py

from django.db import models
from django.utils.text import slugify
from cloudinary.models import CloudinaryField

class Product(models.Model):
    """Base product model for all categories"""
    
    CATEGORY_CHOICES = (
        ('FABRIC', 'Fabric'),
        ('READYMADE', 'Ready Made'),
        ('TRADITIONAL', 'Traditional'),
        ('ACCESSORY', 'Accessory'),
        ('INNERWEAR', 'Innerwear'),
    )
    
    name = models.CharField(max_length=200)
    slug = models.SlugField(max_length=220, unique=True, blank=True)
    category = models.CharField(max_length=20, choices=CATEGORY_CHOICES)
    brand = models.CharField(max_length=100, blank=True)
    description = models.TextField()
    is_buyable = models.BooleanField(default=True, help_text="Can customers buy this product?")
    is_rentable = models.BooleanField(default=False, help_text="Can customers rent this product?")
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        db_table = 'products'
        verbose_name = 'Product'
        verbose_name_plural = 'Products'
        ordering = ['-created_at']
    
    def __str__(self):
        return f"{self.name} ({self.get_category_display()})"
    
    def save(self, *args, **kwargs):
        if not self.slug:
            self.slug = slugify(self.name)
        super().save(*args, **kwargs)

# catalog/models.py - Update ProductImage model
class ProductImage(models.Model):
    """Multiple images per product"""
    
    product = models.ForeignKey(Product, on_delete=models.CASCADE, related_name='images')
    image = CloudinaryField('product_images', folder='products')  # CHANGED
    is_primary = models.BooleanField(default=False, help_text="Main display image")
    display_order = models.PositiveIntegerField(default=0)
    created_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        db_table = 'product_images'
        verbose_name = 'Product Image'
        verbose_name_plural = 'Product Images'
        ordering = ['display_order', 'id']
    
    def __str__(self):
        return f"Image for {self.product.name}"
    
    def save(self, *args, **kwargs):
        if self.is_primary:
            ProductImage.objects.filter(product=self.product, is_primary=True).update(is_primary=False)
        super().save(*args, **kwargs)

class ProductVariant(models.Model):
    """Product variations (size, color, etc.)"""
    
    SIZE_CHOICES = (
        ('XS', 'Extra Small'),
        ('S', 'Small'),
        ('M', 'Medium'),
        ('L', 'Large'),
        ('XL', 'Extra Large'),
        ('XXL', 'Double XL'),
        ('XXXL', 'Triple XL'),
    )
    
    product = models.ForeignKey(Product, on_delete=models.CASCADE, related_name='variants')
    sku = models.CharField(max_length=100, unique=True, help_text="Stock Keeping Unit")
    size = models.CharField(max_length=10, choices=SIZE_CHOICES, null=True, blank=True)
    color = models.CharField(max_length=30)
    price_override = models.DecimalField(
        max_digits=10, 
        decimal_places=2, 
        null=True, 
        blank=True,
        help_text="Leave blank to use product's base price"
    )
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        db_table = 'product_variants'
        verbose_name = 'Product Variant'
        verbose_name_plural = 'Product Variants'
        unique_together = ['product', 'size', 'color']
    
    def __str__(self):
        size_str = f"{self.size} - " if self.size else ""
        return f"{self.product.name} - {size_str}{self.color}"


class Fabric(models.Model):
    """Fabric-specific details"""
    
    FABRIC_CATEGORY_CHOICES = (
        ('SHIRT', 'Shirt Fabric'),
        ('PANT', 'Pant Fabric'),
    )
    
    MATERIAL_CHOICES = (
        ('COTTON', 'Cotton'),
        ('LINEN', 'Linen'),
        ('POLYESTER', 'Polyester'),
        ('BLEND', 'Blend'),
        ('SILK', 'Silk'),
        ('WOOL', 'Wool'),
    )
    
    product = models.OneToOneField(Product, on_delete=models.CASCADE, related_name='fabric_details')
    fabric_category = models.CharField(max_length=10, choices=FABRIC_CATEGORY_CHOICES)
    material = models.CharField(max_length=20, choices=MATERIAL_CHOICES)
    color = models.CharField(max_length=30)
    price_per_meter = models.DecimalField(max_digits=10, decimal_places=2)
    
    class Meta:
        db_table = 'fabrics'
        verbose_name = 'Fabric'
        verbose_name_plural = 'Fabrics'
    
    def __str__(self):
        return f"{self.get_material_display()} {self.color} {self.get_fabric_category_display()}"


class StitchType(models.Model):
    """Available stitching options"""
    
    name = models.CharField(max_length=50, unique=True, help_text="e.g., Shirt, Pant, Kurta")
    price = models.DecimalField(max_digits=10, decimal_places=2)
    description = models.TextField(blank=True)
    is_active = models.BooleanField(default=True)
    
    class Meta:
        db_table = 'stitch_types'
        verbose_name = 'Stitch Type'
        verbose_name_plural = 'Stitch Types'
    
    def __str__(self):
        return f"{self.name} (₹{self.price})"


class TraditionalBoxItem(models.Model):
    """Items included in traditional wear boxes"""
    
    product = models.ForeignKey(Product, on_delete=models.CASCADE, related_name='box_items')
    item_name = models.CharField(max_length=100, help_text="e.g., Kurta, Dhoti, Angavastram")
    quantity = models.PositiveIntegerField(default=1)
    is_stitchable = models.BooleanField(default=False, help_text="Can this item be stitched?")
    
    class Meta:
        db_table = 'traditional_box_items'
        verbose_name = 'Traditional Box Item'
        verbose_name_plural = 'Traditional Box Items'
    
    def __str__(self):
        return f"{self.item_name} (x{self.quantity}) in {self.product.name}"


class RentalConfig(models.Model):
    """Rental configuration for rentable products"""
    
    product = models.OneToOneField(Product, on_delete=models.CASCADE, related_name='rental_config')
    deposit_amount = models.DecimalField(
        max_digits=10, 
        decimal_places=2,
        help_text="Full product value paid as deposit"
    )
    rent_per_day = models.DecimalField(max_digits=10, decimal_places=2)
    
    class Meta:
        db_table = 'rental_configs'
        verbose_name = 'Rental Configuration'
        verbose_name_plural = 'Rental Configurations'
    
    def __str__(self):
        return f"Rental: {self.product.name} - ₹{self.rent_per_day}/day"
    
    def save(self, *args, **kwargs):
        # Ensure rental config only for rentable products
        if not self.product.is_rentable:
            raise ValueError("Cannot create rental config for non-rentable product")
        super().save(*args, **kwargs)