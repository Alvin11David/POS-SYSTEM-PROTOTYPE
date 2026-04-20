import uuid
from decimal import Decimal

from django.db import models


class Product(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    name = models.CharField(max_length=120)
    price = models.DecimalField(max_digits=10, decimal_places=2)
    category = models.CharField(max_length=80, blank=True)
    emoji = models.CharField(max_length=16, blank=True)
    image_url = models.TextField(blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ["name"]


class Sale(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    total = models.DecimalField(max_digits=12, decimal_places=2)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ["-created_at"]


class SaleItem(models.Model):
    sale = models.ForeignKey(Sale, related_name="items", on_delete=models.CASCADE)
    product = models.ForeignKey(Product, null=True, blank=True, on_delete=models.SET_NULL)
    name = models.CharField(max_length=120)
    price = models.DecimalField(max_digits=10, decimal_places=2)
    quantity = models.PositiveIntegerField()
    emoji = models.CharField(max_length=16, blank=True)


class AppSetting(models.Model):
    currency = models.CharField(max_length=3, default="USD")
    tax_rate = models.DecimalField(max_digits=6, decimal_places=4, default=Decimal("0.0800"))


class Notification(models.Model):
    NOTIFICATION_TYPES = [
        ("success", "Success"),
        ("info", "Info"),
        ("warning", "Warning"),
        ("error", "Error"),
    ]

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    title = models.CharField(max_length=200)
    message = models.TextField()
    notification_type = models.CharField(max_length=20, choices=NOTIFICATION_TYPES, default="info")
    is_read = models.BooleanField(default=False)
    user = models.ForeignKey("auth.User", null=True, blank=True, on_delete=models.CASCADE, related_name="notifications")
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ["-created_at"]
