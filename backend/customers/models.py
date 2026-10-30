import uuid

from django.db import models
from django.conf import settings


class Customer(models.Model):
    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name="customers"
    )

    client_id = models.UUIDField(
        null=True,
        blank=True
    )

    name = models.CharField(max_length=100)

    email = models.EmailField(max_length=254)

    phone = models.CharField(max_length=25)

    city = models.CharField(max_length=100)

    total_orders = models.PositiveIntegerField(default=0)

    total_spent = models.DecimalField(
        max_digits=12,
        decimal_places=2,
        default=0
    )

    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ["-created_at"]

        constraints = [
            models.UniqueConstraint(
                fields=["user", "client_id"],
                name="unique_user_customer_client_id"
            ),
            models.UniqueConstraint(
                fields=["user", "email"],
                name="unique_user_customer_email"
            ),
        ]

    def __str__(self):
        return self.name