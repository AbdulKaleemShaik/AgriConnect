package com.agriconnect.catalog.dto;

import java.math.BigDecimal;

import com.agriconnect.catalog.Product;
import com.agriconnect.common.storage.ImageFolder;

public record ProductResponse(
        Long id,
        String title,
        String description,
        String category,
        BigDecimal price,
        int discount,
        BigDecimal discountPrice,
        int stock,
        String image,
        String imageUrl,
        boolean active,
        Long farmerId,
        String farmerName) {

    public static ProductResponse from(Product product) {
        return new ProductResponse(product.getId(), product.getTitle(), product.getDescription(),
                product.getCategory(), product.getPrice(), product.getDiscount(), product.getDiscountPrice(),
                product.getStock(), product.getImage(), ImageFolder.PRODUCTS.urlFor(product.getImage()),
                product.isActive(), product.getFarmer().getId(), product.getFarmer().getName());
    }
}
