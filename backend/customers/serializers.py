from rest_framework import serializers
from .models import Customer


class CustomerSerializer(serializers.ModelSerializer):
    createdAt = serializers.DateTimeField(
        source="created_at",
        read_only=True
    )

    totalOrders = serializers.IntegerField(
        source="total_orders",
        required=False
    )

    totalSpent = serializers.DecimalField(
        source="total_spent",
        max_digits=12,
        decimal_places=2,
        required=False
    )

    client_id = serializers.UUIDField(
        required=False,
        allow_null=True
    )

    class Meta:
        model = Customer

        fields = [
            "id",
            "client_id",
            "name",
            "email",
            "phone",
            "city",
            "totalOrders",
            "totalSpent",
            "createdAt",
        ]

        read_only_fields = ["id", "createdAt"]