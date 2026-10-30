from django.db import IntegrityError, transaction
from rest_framework import generics, status
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response

from .models import Expense
from .serializers import ExpenseSerializer


class ExpenseListCreateView(generics.ListCreateAPIView):
    serializer_class = ExpenseSerializer
    permission_classes = [IsAuthenticated]
    pagination_class = None

    def get_queryset(self):
        return Expense.objects.filter(user=self.request.user)

    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        client_id = serializer.validated_data.get("client_id")

        if client_id:
            existing = Expense.objects.filter(
                user=request.user,
                client_id=client_id
            ).first()

            if existing:
                return Response(
                    self.get_serializer(existing).data,
                    status=status.HTTP_200_OK
                )

        try:
            with transaction.atomic():
                expense = serializer.save(user=request.user)
        except IntegrityError:
            if not client_id:
                raise

            existing = Expense.objects.get(
                user=request.user,
                client_id=client_id
            )

            return Response(
                self.get_serializer(existing).data,
                status=status.HTTP_200_OK
            )

        return Response(
            self.get_serializer(expense).data,
            status=status.HTTP_201_CREATED
        )


class ExpenseDetailView(generics.RetrieveUpdateDestroyAPIView):
    serializer_class = ExpenseSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        return Expense.objects.filter(user=self.request.user)