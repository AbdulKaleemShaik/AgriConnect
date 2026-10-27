package com.agriconnect;

import java.math.BigDecimal;

import com.agriconnect.catalog.Product;
import com.agriconnect.security.AppUserDetails;
import com.agriconnect.user.Role;
import com.agriconnect.user.User;

/** Builders for entities used by unit tests. */
public final class TestData {

    private TestData() {
    }

    public static User user(long id, Role role) {
        User user = new User();
        user.setId(id);
        user.setName(role.name().toLowerCase() + id);
        user.setEmail(role.name().toLowerCase() + id + "@example.com");
        user.setPassword("{hashed}");
        user.setRole(role);
        user.setEnabled(true);
        return user;
    }

    public static Product product(long id, User farmer, String price, int stock) {
        Product product = new Product();
        product.setId(id);
        product.setTitle("Tomatoes " + id);
        product.setCategory("Vegetables");
        product.setStock(stock);
        product.setActive(true);
        product.setFarmer(farmer);
        product.applyPricing(new BigDecimal(price), 0);
        return product;
    }

    public static AppUserDetails principal(User user) {
        return AppUserDetails.from(user);
    }
}
