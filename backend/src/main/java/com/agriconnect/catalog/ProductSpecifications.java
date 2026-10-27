package com.agriconnect.catalog;

import java.util.Locale;

import org.springframework.data.jpa.domain.Specification;
import org.springframework.util.StringUtils;

/** Composable filters for the public product listing. */
final class ProductSpecifications {

    private ProductSpecifications() {
    }

    static Specification<Product> purchasable() {
        return (root, query, cb) -> cb.and(cb.isTrue(root.get("active")), cb.isFalse(root.get("deleted")));
    }

    static Specification<Product> inCategory(String category) {
        if (!StringUtils.hasText(category)) {
            return null;
        }
        String value = category.trim().toLowerCase(Locale.ROOT);
        return (root, query, cb) -> cb.equal(cb.lower(root.get("category")), value);
    }

    static Specification<Product> matches(String text) {
        if (!StringUtils.hasText(text)) {
            return null;
        }
        String pattern = "%" + text.trim().toLowerCase(Locale.ROOT) + "%";
        return (root, query, cb) -> cb.or(
                cb.like(cb.lower(root.get("title")), pattern),
                cb.like(cb.lower(root.get("category")), pattern));
    }
}
