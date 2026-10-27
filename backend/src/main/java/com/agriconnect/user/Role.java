package com.agriconnect.user;

public enum Role {
    CUSTOMER,
    FARMER,
    ADMIN;

    /** Spring Security authority name, e.g. {@code ROLE_FARMER}. */
    public String authority() {
        return "ROLE_" + name();
    }
}
