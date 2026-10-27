package com.agriconnect.cart.dto;

import java.math.BigDecimal;
import java.util.List;

import com.agriconnect.cart.CartItem;
import com.agriconnect.catalog.dto.ProductResponse;

public record CartResponse(List<Item> items, int totalQuantity, BigDecimal totalAmount) {

    public record Item(Long id, ProductResponse product, int quantity, BigDecimal unitPrice, BigDecimal lineTotal) {

        static Item from(CartItem item) {
            return new Item(item.getId(), ProductResponse.from(item.getProduct()), item.getQuantity(),
                    item.getProduct().getDiscountPrice(), item.lineTotal());
        }
    }

    public static CartResponse from(List<CartItem> cartItems) {
        List<Item> items = cartItems.stream().map(Item::from).toList();
        int quantity = items.stream().mapToInt(Item::quantity).sum();
        BigDecimal total = items.stream().map(Item::lineTotal).reduce(BigDecimal.ZERO, BigDecimal::add);
        return new CartResponse(items, quantity, total);
    }
}
