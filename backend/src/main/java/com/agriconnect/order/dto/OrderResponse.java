package com.agriconnect.order.dto;

import java.math.BigDecimal;
import java.time.Instant;

import com.agriconnect.catalog.dto.ProductResponse;
import com.agriconnect.order.CustomerOrder;
import com.agriconnect.order.OrderStatus;
import com.agriconnect.order.ShippingAddress;

public record OrderResponse(
        Long id,
        String orderNumber,
        Instant orderDate,
        ProductResponse product,
        int quantity,
        BigDecimal unitPrice,
        BigDecimal totalPrice,
        OrderStatus status,
        String statusLabel,
        String paymentType,
        Long customerId,
        Address shippingAddress) {

    public record Address(String firstName, String lastName, String email, String mobileNo,
                          String address, String city, String state, String pincode) {

        static Address from(ShippingAddress a) {
            return new Address(a.getFirstName(), a.getLastName(), a.getEmail(), a.getMobileNo(),
                    a.getAddress(), a.getCity(), a.getState(), a.getPincode());
        }
    }

    public static OrderResponse from(CustomerOrder order) {
        return new OrderResponse(order.getId(), order.getOrderNumber(), order.getOrderDate(),
                ProductResponse.from(order.getProduct()), order.getQuantity(), order.getUnitPrice(),
                order.getTotalPrice(), order.getStatus(), order.getStatus().label(), order.getPaymentType(),
                order.getCustomer().getId(), Address.from(order.getShippingAddress()));
    }
}
