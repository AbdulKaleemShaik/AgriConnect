package com.agriconnect.order;

import static org.assertj.core.api.Assertions.assertThat;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.concurrent.Callable;
import java.util.concurrent.CountDownLatch;
import java.util.concurrent.ExecutorService;
import java.util.concurrent.Executors;
import java.util.concurrent.Future;

import org.junit.jupiter.api.Test;
import org.springframework.http.MediaType;

import com.agriconnect.support.IntegrationTestSupport;

/**
 * Several customers check out the last units of a product at the same moment. The product's
 * {@code @Version} column (optimistic locking) must let exactly enough of them succeed and
 * reject the rest with 409, so stock never goes negative.
 */
class ConcurrentCheckoutIntegrationTest extends IntegrationTestSupport {

    private static final Map<String, String> CHECKOUT = Map.of(
            "firstName", "Asha", "lastName", "Rao", "email", "asha@example.com", "mobileNo", "9876543210",
            "address", "12 Market St", "city", "Guntur", "state", "Andhra Pradesh", "pincode", "522001",
            "paymentType", "COD");

    @Test
    void concurrentCheckoutsNeverOversellTheLastUnit() throws Exception {
        String farmer = newUserToken("farmer");
        long productId = createProduct(farmer, "Last Mango Crate", "500", 1);

        int buyers = 5;
        List<String> customers = new ArrayList<>();
        for (int i = 0; i < buyers; i++) {
            String customer = newUserToken("customer");
            mockMvc.perform(auth(post("/api/cart/items"), customer).contentType(MediaType.APPLICATION_JSON)
                            .content(json(Map.of("productId", productId, "quantity", 1))))
                    .andExpect(status().isOk());
            customers.add(customer);
        }

        CountDownLatch start = new CountDownLatch(1);
        ExecutorService pool = Executors.newFixedThreadPool(buyers);
        try {
            List<Future<Integer>> results = new ArrayList<>();
            for (String customer : customers) {
                Callable<Integer> checkout = () -> {
                    start.await();
                    return mockMvc.perform(auth(post("/api/orders"), customer)
                                    .contentType(MediaType.APPLICATION_JSON).content(json(CHECKOUT)))
                            .andReturn().getResponse().getStatus();
                };
                results.add(pool.submit(checkout));
            }
            start.countDown();

            List<Integer> statuses = new ArrayList<>();
            for (Future<Integer> result : results) {
                statuses.add(result.get());
            }

            assertThat(statuses).filteredOn(s -> s == 201).hasSize(1);
            assertThat(statuses).filteredOn(s -> s == 409).hasSize(buyers - 1);
        } finally {
            pool.shutdownNow();
        }

        mockMvc.perform(get("/api/products/" + productId)).andExpect(jsonPath("$.stock").value(0));
    }
}
