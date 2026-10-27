package com.agriconnect.catalog;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.Instant;

import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import com.agriconnect.user.User;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Index;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import jakarta.persistence.Version;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Entity
@Table(name = "products", indexes = {
        @Index(name = "idx_products_category", columnList = "category"),
        @Index(name = "idx_products_farmer", columnList = "farmer_id")
})
@Getter
@Setter
@NoArgsConstructor
public class Product {

    private static final BigDecimal HUNDRED = BigDecimal.valueOf(100);

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, length = 200)
    private String title;

    @Column(length = 5000)
    private String description;

    @Column(nullable = false, length = 100)
    private String category;

    @Column(nullable = false, precision = 12, scale = 2)
    private BigDecimal price;

    /** Discount in percent, 0-100. */
    @Column(nullable = false)
    private int discount;

    @Column(nullable = false, precision = 12, scale = 2)
    private BigDecimal discountPrice;

    @Column(nullable = false)
    private int stock;

    private String image;

    @Column(nullable = false)
    private boolean active = true;

    /** Soft delete keeps order history intact when a farmer removes a listing. */
    @Column(nullable = false)
    private boolean deleted;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "farmer_id", nullable = false)
    private User farmer;

    /** Optimistic locking prevents two concurrent checkouts from overselling stock. */
    @Version
    private Long version;

    @CreationTimestamp
    @Column(nullable = false, updatable = false)
    private Instant createdAt;

    @UpdateTimestamp
    private Instant updatedAt;

    public void applyPricing(BigDecimal newPrice, int discountPercent) {
        this.price = newPrice.setScale(2, RoundingMode.HALF_UP);
        this.discount = discountPercent;
        this.discountPrice = price.multiply(HUNDRED.subtract(BigDecimal.valueOf(discountPercent)))
                .divide(HUNDRED, 2, RoundingMode.HALF_UP);
    }

    public boolean isPurchasable() {
        return active && !deleted;
    }

    public boolean isOwnedBy(Long userId) {
        return farmer != null && farmer.getId().equals(userId);
    }
}
