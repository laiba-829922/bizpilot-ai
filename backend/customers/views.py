from django.db import IntegrityError, transaction
from rest_framework import generics, status
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response

from .models import Customer
from .serializers import CustomerSerializer


class CustomerListCreateView(generics.ListCreateAPIView):
    serializer_class = CustomerSerializer
    permission_classes = [IsAuthenticated]
    pagination_class = None

    def get_queryset(self):
        return Customer.objects.filter(user=self.request.user)

    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        client_id = serializer.validated_data.get("client_id")

        # Prevent duplicate imports
        if client_id:
            existing = Customer.objects.filter(
                user=request.user,
                client_id=client_id
            ).first()

            if existing:
                return Response(
                    self.get_serializer(existing).data,
                    status=status.HTTP_200_OK
                )

        # Prevent duplicate customer emails
        email = serializer.validated_data["email"]

        existing_email = Customer.objects.filter(
            user=request.user,
            email__iexact=email
        ).first()

        if existing_email:
            return Response(
                {
                    "email": [
                        "A customer with this email already exists."
                    ]
                },
                status=status.HTTP_400_BAD_REQUEST
            )

        try:
            with transaction.atomic():
                customer = serializer.save(user=request.user)

        except IntegrityError:
            if client_id:
                existing = Customer.objects.filter(
                    user=request.user,
                    client_id=client_id
                ).first()

                if existing:
                    return Response(
                        self.get_serializer(existing).data,
                        status=status.HTTP_200_OK
                    )

            return Response(
                {"detail": "Customer already exists."},
                status=status.HTTP_400_BAD_REQUEST
            )

        return Response(
            self.get_serializer(customer).data,
            status=status.HTTP_201_CREATED
        )


class CustomerDetailView(generics.RetrieveUpdateDestroyAPIView):
    serializer_class = CustomerSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        return Customer.objects.filter(user=self.request.user)