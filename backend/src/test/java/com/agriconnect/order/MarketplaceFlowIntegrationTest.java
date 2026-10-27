package com.agriconnect.order;

import static org.assertj.core.api.Assertions.assertThat;
import static org.hamcrest.Matchers.startsWith;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.multipart;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.patch;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.put;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.content;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import java.util.Map;

import org.junit.jupiter.api.Test;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.mock.web.MockMultipartFile;
import org.springframework.test.web.servlet.MvcResult;

import com.agriconnect.support.IntegrationTestSupport;
import com.fasterxml.jackson.databind.JsonNode;

/** End-to-end happy path and key business rules across products, cart and orders. */
class MarketplaceFlowIntegrationTest extends IntegrationTestSupport {

    private static final Map<String, String> CHECKOUT = Map.of(
            "firstName", "Asha", "lastName", "Rao", "email", "asha@example.com", "mobileNo", "9876543210",
            "address", "12 Market St", "city", "Guntur", "state", "Andhra Pradesh", "pincode", "522001",
            "paymentType", "COD");

    @Test
    void farmerListsProductCustomerBuysItFarmerFulfilsIt() throws Exception {
        String farmer = newUserToken("farmer");
        String customer = newUserToken("customer");

        // Farmer creates a product with an image; it is served back from /images/products/**
        MvcResult created = mockMvc.perform(multipart("/api/products")
                        .file(new MockMultipartFile("image", "mango.png", "image/png", new byte[]{1, 2, 3, 4}))
                        .param("title", "Alphonso Mangoes").param("category", "Fruits")
                        .param("price", "200.00").param("discount", "10").param("stock", "10")
                        .header(HttpHeaders.AUTHORIZATION, bearer(farmer)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.discountPrice").value(180.00))
                .andExpect(jsonPath("$.imageUrl", startsWith("/images/products/")))
                .andReturn();
        JsonNode product = readJson(created);
        long productId = product.get("id").asLong();

        mockMvc.perform(get(product.get("imageUrl").asText()))
                .andExpect(status().isOk())
                .andExpect(content().bytes(new byte[]{1, 2, 3, 4}));

        // Public catalogue shows it
        mockMvc.perform(get("/api/products").param("q", "alphonso"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.content[0].id").value(productId));

        // Customer adds 2, then 1 more -> 3 in cart
        mockMvc.perform(auth(post("/api/cart/items"), customer).contentType(MediaType.APPLICATION_JSON)
                        .content(json(Map.of("productId", productId, "quantity", 2))))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.items[0].quantity").value(2));
        mockMvc.perform(auth(post("/api/cart/items"), customer).contentType(MediaType.APPLICATION_JSON)
                        .content(json(Map.of("productId", productId))))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.totalQuantity").value(3))
                .andExpect(jsonPath("$.totalAmount").value(540.00));

        // Checkout
        MvcResult placed = mockMvc.perform(auth(post("/api/orders"), customer)
                        .contentType(MediaType.APPLICATION_JSON).content(json(CHECKOUT)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$[0].quantity").value(3))
                .andExpect(jsonPath("$[0].totalPrice").value(540.00))
                .andExpect(jsonPath("$[0].status").value("PLACED"))
                .andReturn();
        long orderId = readJson(placed).get(0).get("id").asLong();

        // Stock decremented and cart emptied
        mockMvc.perform(get("/api/products/" + productId)).andExpect(jsonPath("$.stock").value(7));
        mockMvc.perform(auth(get("/api/cart"), customer)).andExpect(jsonPath("$.items").isEmpty());

        // Farmer sees the order and moves it along
        mockMvc.perform(auth(get("/api/orders/farmer"), farmer))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.content[0].id").value(orderId))
                .andExpect(jsonPath("$.content[0].shippingAddress.city").value("Guntur"));
        mockMvc.perform(auth(patch("/api/orders/" + orderId + "/status"), farmer)
                        .contentType(MediaType.APPLICATION_JSON).content(json(Map.of("status", "SHIPPED"))))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.statusLabel").value("Shipped/Dispatched"));

        // Customer sees the new status and can no longer cancel
        mockMvc.perform(auth(get("/api/orders/mine"), customer))
                .andExpect(jsonPath("$[0].status").value("SHIPPED"));
        mockMvc.perform(auth(post("/api/orders/" + orderId + "/cancel"), customer))
                .andExpect(status().isConflict());
    }

    @Test
    void cancellingRestoresStock() throws Exception {
        String farmer = newUserToken("farmer");
        String customer = newUserToken("customer");
        long productId = createProduct(farmer, "Red Onions", "30.00", 5);

        mockMvc.perform(auth(post("/api/cart/items"), customer).contentType(MediaType.APPLICATION_JSON)
                        .content(json(Map.of("productId", productId, "quantity", 5))))
                .andExpect(status().isOk());
        long orderId = readJson(mockMvc.perform(auth(post("/api/orders"), customer)
                        .contentType(MediaType.APPLICATION_JSON).content(json(CHECKOUT)))
                .andExpect(status().isCreated()).andReturn()).get(0).get("id").asLong();
        mockMvc.perform(get("/api/products/" + productId)).andExpect(jsonPath("$.stock").value(0));

        mockMvc.perform(auth(post("/api/orders/" + orderId + "/cancel"), customer))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.status").value("CANCELLED"));
        mockMvc.perform(get("/api/products/" + productId)).andExpect(jsonPath("$.stock").value(5));
    }

    @Test
    void cannotAddMoreThanAvailableStockOrCheckoutEmptyCart() throws Exception {
        String farmer = newUserToken("farmer");
        String customer = newUserToken("customer");
        long productId = createProduct(farmer, "Turmeric", "90.00", 2);

        mockMvc.perform(auth(post("/api/cart/items"), customer).contentType(MediaType.APPLICATION_JSON)
                        .content(json(Map.of("productId", productId, "quantity", 3))))
                .andExpect(status().isConflict())
                .andExpect(jsonPath("$.message").value("Only 2 unit(s) of 'Turmeric' are in stock"));

        mockMvc.perform(auth(post("/api/orders"), customer).contentType(MediaType.APPLICATION_JSON)
                        .content(json(CHECKOUT)))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.message").value("Your cart is empty"));
    }

    @Test
    void deletedProductDisappearsFromCatalogueButOrderHistoryRemains() throws Exception {
        String farmer = newUserToken("farmer");
        String customer = newUserToken("customer");
        long productId = createProduct(farmer, "Groundnuts", "60.00", 10);
        mockMvc.perform(auth(post("/api/cart/items"), customer).contentType(MediaType.APPLICATION_JSON)
                .content(json(Map.of("productId", productId)))).andExpect(status().isOk());
        mockMvc.perform(auth(post("/api/orders"), customer).contentType(MediaType.APPLICATION_JSON)
                .content(json(CHECKOUT))).andExpect(status().isCreated());

        mockMvc.perform(auth(org.springframework.test.web.servlet.request.MockMvcRequestBuilders
                        .delete("/api/products/" + productId), farmer))
                .andExpect(status().isNoContent());

        mockMvc.perform(get("/api/products/" + productId)).andExpect(status().isNotFound());
        MvcResult orders = mockMvc.perform(auth(get("/api/orders/mine"), customer))
                .andExpect(status().isOk()).andReturn();
        assertThat(readJson(orders).get(0).get("product").get("title").asText()).isEqualTo("Groundnuts");
    }

    @Test
    void profileUpdateOnlyTouchesTheCallersAccount() throws Exception {
        String customer = newUserToken("customer");

        mockMvc.perform(multipart("/api/users/me")
                        .param("id", "1") // ignored: identity comes from the token
                        .param("name", "Renamed User").param("city", "Vijayawada").param("pincode", "520001")
                        .with(request -> {
                            request.setMethod("PUT");
                            return request;
                        })
                        .header(HttpHeaders.AUTHORIZATION, bearer(customer)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.name").value("Renamed User"))
                .andExpect(jsonPath("$.city").value("Vijayawada"));

        mockMvc.perform(auth(get("/api/users/me"), adminToken()))
                .andExpect(jsonPath("$.name").value("Administrator"));
    }

    @Test
    void cartQuantityCanBeSetAndRemoved() throws Exception {
        String farmer = newUserToken("farmer");
        String customer = newUserToken("customer");
        long productId = createProduct(farmer, "Chillies", "15.00", 20);
        mockMvc.perform(auth(post("/api/cart/items"), customer).contentType(MediaType.APPLICATION_JSON)
                .content(json(Map.of("productId", productId)))).andExpect(status().isOk());

        mockMvc.perform(auth(put("/api/cart/items/" + productId), customer).contentType(MediaType.APPLICATION_JSON)
                        .content(json(Map.of("quantity", 4))))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.totalAmount").value(60.00));
        mockMvc.perform(auth(put("/api/cart/items/" + productId), customer).contentType(MediaType.APPLICATION_JSON)
                        .content(json(Map.of("quantity", 0))))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.items").isEmpty());
    }
}
