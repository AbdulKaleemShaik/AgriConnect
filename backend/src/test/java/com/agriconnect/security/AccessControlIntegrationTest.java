package com.agriconnect.security;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.multipart;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.patch;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import java.util.Map;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;

import com.agriconnect.support.IntegrationTestSupport;

/** Verifies the CUSTOMER / FARMER / ADMIN authorization rules through the real filter chain. */
class AccessControlIntegrationTest extends IntegrationTestSupport {

    private String customer;
    private String farmer;
    private String admin;

    @BeforeEach
    void tokens() throws Exception {
        customer = newUserToken("customer");
        farmer = newUserToken("farmer");
        admin = adminToken();
    }

    @Test
    void publicEndpointsNeedNoToken() throws Exception {
        mockMvc.perform(get("/api/products")).andExpect(status().isOk());
        mockMvc.perform(get("/api/categories")).andExpect(status().isOk())
                .andExpect(jsonPath("$[?(@.name == 'Vegetables')]").exists());
        mockMvc.perform(get("/v3/api-docs")).andExpect(status().isOk());
        mockMvc.perform(get("/actuator/health")).andExpect(status().isOk());
    }

    @Test
    void anonymousCallsToProtectedEndpointsGet401() throws Exception {
        mockMvc.perform(get("/api/cart")).andExpect(status().isUnauthorized());
        mockMvc.perform(get("/api/orders/mine")).andExpect(status().isUnauthorized());
        mockMvc.perform(get("/api/admin/users")).andExpect(status().isUnauthorized());
    }

    @Test
    void onlyCustomersUseTheCartAndCheckout() throws Exception {
        mockMvc.perform(auth(get("/api/cart"), customer)).andExpect(status().isOk());
        mockMvc.perform(auth(get("/api/cart"), farmer)).andExpect(status().isForbidden());
        mockMvc.perform(auth(get("/api/cart"), admin)).andExpect(status().isForbidden());
        mockMvc.perform(auth(post("/api/orders"), farmer).contentType(MediaType.APPLICATION_JSON).content("{}"))
                .andExpect(status().isForbidden());
    }

    @Test
    void onlyFarmersCreateProducts() throws Exception {
        mockMvc.perform(multipart("/api/products")
                        .param("title", "x").param("category", "Fruits").param("price", "1").param("stock", "1")
                        .header(HttpHeaders.AUTHORIZATION, bearer(customer)))
                .andExpect(status().isForbidden());
        createProduct(farmer, "Bananas", "40.00", 5);
    }

    @Test
    void farmerCannotModifyAnotherFarmersProductButAdminCan() throws Exception {
        long productId = createProduct(farmer, "Coconuts", "25.00", 5);
        String otherFarmer = newUserToken("farmer");

        mockMvc.perform(auth(org.springframework.test.web.servlet.request.MockMvcRequestBuilders
                        .delete("/api/products/" + productId), otherFarmer))
                .andExpect(status().isForbidden())
                .andExpect(jsonPath("$.message").value("You can only modify your own products"));

        mockMvc.perform(auth(org.springframework.test.web.servlet.request.MockMvcRequestBuilders
                        .delete("/api/products/" + productId), admin))
                .andExpect(status().isNoContent());
    }

    @Test
    void adminAreaIsAdminOnly() throws Exception {
        mockMvc.perform(auth(get("/api/admin/users"), customer)).andExpect(status().isForbidden());
        mockMvc.perform(auth(get("/api/admin/users"), farmer)).andExpect(status().isForbidden());
        mockMvc.perform(auth(get("/api/admin/users").param("role", "FARMER"), admin))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.content[0].role").value("FARMER"));
        mockMvc.perform(auth(get("/api/admin/orders"), admin)).andExpect(status().isOk());
        mockMvc.perform(auth(post("/api/categories"), farmer).contentType(MediaType.APPLICATION_JSON)
                        .content(json(Map.of("name", "Herbs"))))
                .andExpect(status().isForbidden());
    }

    @Test
    void disabledUserLosesAccessImmediately() throws Exception {
        String email = uniqueEmail("disabled");
        register("customer", email);
        String token = login(email, PASSWORD);
        long userId = readJson(mockMvc.perform(auth(get("/api/users/me"), token)).andReturn()).get("id").asLong();

        mockMvc.perform(auth(patch("/api/admin/users/" + userId + "/status"), admin)
                        .contentType(MediaType.APPLICATION_JSON).content(json(Map.of("enabled", false))))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.enabled").value(false));

        mockMvc.perform(auth(get("/api/users/me"), token)).andExpect(status().isUnauthorized());
        mockMvc.perform(post("/api/auth/login").contentType(MediaType.APPLICATION_JSON)
                        .content(json(Map.of("email", email, "password", PASSWORD))))
                .andExpect(status().isForbidden());
    }

    @Test
    void usersCannotSeeOtherPeoplesOrders() throws Exception {
        long productId = createProduct(farmer, "Wheat", "35.00", 10);
        mockMvc.perform(auth(post("/api/cart/items"), customer).contentType(MediaType.APPLICATION_JSON)
                .content(json(Map.of("productId", productId)))).andExpect(status().isOk());
        long orderId = readJson(mockMvc.perform(auth(post("/api/orders"), customer)
                .contentType(MediaType.APPLICATION_JSON)
                .content(json(Map.of("firstName", "A", "email", "a@example.com", "mobileNo", "9876543210",
                        "address", "x", "city", "y", "state", "z", "pincode", "522001", "paymentType", "COD"))))
                .andExpect(status().isCreated()).andReturn()).get(0).get("id").asLong();

        String otherCustomer = newUserToken("customer");
        String otherFarmer = newUserToken("farmer");
        mockMvc.perform(auth(get("/api/orders/" + orderId), otherCustomer)).andExpect(status().isNotFound());
        mockMvc.perform(auth(post("/api/orders/" + orderId + "/cancel"), otherCustomer))
                .andExpect(status().isForbidden());
        mockMvc.perform(auth(patch("/api/orders/" + orderId + "/status"), otherFarmer)
                        .contentType(MediaType.APPLICATION_JSON).content(json(Map.of("status", "DELIVERED"))))
                .andExpect(status().isForbidden());

        mockMvc.perform(auth(get("/api/orders/" + orderId), customer)).andExpect(status().isOk());
        mockMvc.perform(auth(get("/api/orders/" + orderId), farmer)).andExpect(status().isOk());
        mockMvc.perform(auth(get("/api/orders/" + orderId), admin)).andExpect(status().isOk());
    }
}
