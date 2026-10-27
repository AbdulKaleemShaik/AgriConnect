package com.agriconnect.cart;

import java.math.BigDecimal;

import com.agriconnect.catalog.Product;
import com.agriconnect.user.User;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import jakarta.persistence.UniqueConstraint;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Entity
@Table(name = "cart_items", uniqueConstraints =
        @UniqueConstraint(name = "uk_cart_customer_product", columnNames = {"customer_id", "product_id"}))
@Getter
@Setter
@NoArgsConstructor
public class CartItem {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "customer_id", nullable = false)
    private User customer;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "product_id", nullable = false)
    private Product product;

    @Column(nullable = false)
    private int quantity;

    public CartItem(User customer, Product product, int quantity) {
        this.customer = customer;
        this.product = product;
        this.quantity = quantity;
    }

    public BigDecimal lineTotal() {
        return product.getDiscountPrice().multiply(BigDecimal.valueOf(quantity));
    }
}
