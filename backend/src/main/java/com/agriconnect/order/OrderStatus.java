package com.agriconnect.order;

import java.util.EnumSet;
import java.util.Set;

public enum OrderStatus {
    PLACED("Order placed"),
    CONFIRMED("Order confirmed"),
    PROCESSING("Order processing"),
    SHIPPED("Shipped/Dispatched"),
    IN_TRANSIT("In transit"),
    OUT_FOR_DELIVERY("Out for delivery"),
    DELIVERED("Delivered"),
    CANCELLED("Cancelled");

    private static final Set<OrderStatus> CANCELLABLE = EnumSet.of(PLACED, CONFIRMED, PROCESSING);

    private final String label;

    OrderStatus(String label) {
        this.label = label;
    }

    public String label() {
        return label;
    }

    public boolean isFinal() {
        return this == DELIVERED || this == CANCELLED;
    }

    /** Customers may cancel until the order has shipped. */
    public boolean isCancellable() {
        return CANCELLABLE.contains(this);
    }
}
