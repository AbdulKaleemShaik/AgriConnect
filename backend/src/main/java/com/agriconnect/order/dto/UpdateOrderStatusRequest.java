package com.agriconnect.order.dto;

import com.agriconnect.order.OrderStatus;

import jakarta.validation.constraints.NotNull;

public record UpdateOrderStatusRequest(@NotNull OrderStatus status) {
}
