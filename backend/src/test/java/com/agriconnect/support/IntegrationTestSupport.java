package com.agriconnect.support;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.multipart;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import java.util.Map;
import java.util.UUID;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.MvcResult;
import org.springframework.test.web.servlet.request.MockHttpServletRequestBuilder;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;

/**
 * Boots the whole application against in-memory H2 (profile "test") and drives it over HTTP
 * through MockMvc, including the real JWT filter chain.
 */
@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("test")
public abstract class IntegrationTestSupport {

    protected static final String PASSWORD = "Passw0rd!";
    protected static final String ADMIN_EMAIL = "admin@test.local";
    protected static final String ADMIN_PASSWORD = "Admin@12345";

    @Autowired protected MockMvc mockMvc;
    @Autowired protected ObjectMapper objectMapper;

    protected static String uniqueEmail(String prefix) {
        return prefix + "-" + UUID.randomUUID().toString().substring(0, 8) + "@example.com";
    }

    protected String json(Object body) throws Exception {
        return objectMapper.writeValueAsString(body);
    }

    protected JsonNode readJson(MvcResult result) throws Exception {
        return objectMapper.readTree(result.getResponse().getContentAsString());
    }

    protected void register(String role, String email) throws Exception {
        mockMvc.perform(multipart("/api/auth/register/" + role)
                        .param("name", "Test " + role)
                        .param("email", email)
                        .param("password", PASSWORD)
                        .param("mobileNumber", "9876543210")
                        .param("pincode", "522001"))
                .andExpect(status().isCreated());
    }

    protected String login(String email, String password) throws Exception {
        MvcResult result = mockMvc.perform(post("/api/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(json(Map.of("email", email, "password", password))))
                .andExpect(status().isOk())
                .andReturn();
        return readJson(result).get("token").asText();
    }

    /** Registers a fresh user of the given role ("customer" or "farmer") and returns a bearer token. */
    protected String newUserToken(String role) throws Exception {
        String email = uniqueEmail(role);
        register(role, email);
        return login(email, PASSWORD);
    }

    protected String adminToken() throws Exception {
        return login(ADMIN_EMAIL, ADMIN_PASSWORD);
    }

    protected long createProduct(String farmerToken, String title, String price, int stock) throws Exception {
        MvcResult result = mockMvc.perform(multipart("/api/products")
                        .param("title", title)
                        .param("category", "Vegetables")
                        .param("price", price)
                        .param("stock", String.valueOf(stock))
                        .header(HttpHeaders.AUTHORIZATION, bearer(farmerToken)))
                .andExpect(status().isCreated())
                .andReturn();
        return readJson(result).get("id").asLong();
    }

    protected static String bearer(String token) {
        return "Bearer " + token;
    }

    protected static MockHttpServletRequestBuilder auth(MockHttpServletRequestBuilder builder, String token) {
        return builder.header(HttpHeaders.AUTHORIZATION, bearer(token));
    }
}
