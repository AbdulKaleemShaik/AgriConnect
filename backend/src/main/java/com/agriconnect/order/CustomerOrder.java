package com.agriconnect.order;

import java.math.BigDecimal;
import java.time.Instant;

import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import com.agriconnect.catalog.Product;
import com.agriconnect.user.User;

import jakarta.persistence.Column;
import jakarta.persistence.Embedded;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Index;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

/**
 * One ordered product line. A checkout creates one order per cart line so each
 * farmer can fulfil and track their own items independently.
 */
@Entity
@Table(name = "orders", indexes = {
        @Index(name = "idx_orders_customer", columnList = "customer_id"),
        @Index(name = "idx_orders_product", columnList = "product_id")
})
@Getter
@Setter
@NoArgsConstructor
public class CustomerOrder {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    /** Public, non-guessable order reference shown to users. */
    @Column(nullable = false, unique = true, length = 40)
    private String orderNumber;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "customer_id", nullable = false)
    private User customer;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "product_id", nullable = false)
    private Product product;

    @Column(nullable = false)
    private int quantity;

    /** Price per unit at the time of purchase (later price changes do not affect the order). */
    @Column(nullable = false, precision = 12, scale = 2)
    private BigDecimal unitPrice;

    @Column(nullable = false, precision = 12, scale = 2)
    private BigDecimal totalPrice;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private OrderStatus status;

    @Column(nullable = false, length = 30)
    private String paymentType;

    @Embedded
    private ShippingAddress shippingAddress;

    @CreationTimestamp
    @Column(nullable = false, updatable = false)
    private Instant orderDate;

    @UpdateTimestamp
    private Instant updatedAt;
}
