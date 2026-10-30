from django.db import models
from django.conf import settings


class Expense(models.Model):
    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name="expenses"
    )

    title = models.CharField(max_length=120)
    amount = models.DecimalField(max_digits=12, decimal_places=2)

    category = models.CharField(max_length=50, default="Other")
    date = models.DateField()
    description = models.TextField(blank=True, default="")

    created_at = models.DateTimeField(auto_now_add=True)

    client_id = models.UUIDField(
        null=True,
        blank=True
    )

    class Meta:
        ordering = ["-date", "-created_at"]

        constraints = [
            models.UniqueConstraint(
                fields=["user", "client_id"],
                name="unique_user_expense_client_id"
            )
        ]

    def __str__(self):
        return f"{self.title} - {self.amount}"