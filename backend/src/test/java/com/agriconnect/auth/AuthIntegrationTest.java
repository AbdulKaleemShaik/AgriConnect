package com.agriconnect.auth;

import static org.hamcrest.Matchers.hasItem;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.multipart;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.put;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import java.util.Map;

import org.junit.jupiter.api.Test;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;

import com.agriconnect.support.IntegrationTestSupport;

class AuthIntegrationTest extends IntegrationTestSupport {

    @Test
    void registerLoginAndFetchOwnProfile() throws Exception {
        String email = uniqueEmail("asha");
        register("customer", email);

        mockMvc.perform(post("/api/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(json(Map.of("email", email, "password", PASSWORD))))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.tokenType").value("Bearer"))
                .andExpect(jsonPath("$.role").value("ROLE_CUSTOMER"))
                .andExpect(jsonPath("$.token").isNotEmpty());

        String token = login(email, PASSWORD);
        mockMvc.perform(auth(get("/api/users/me"), token))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.email").value(email))
                .andExpect(jsonPath("$.role").value("CUSTOMER"))
                .andExpect(jsonPath("$.password").doesNotExist());
    }

    @Test
    void loginAcceptsLegacyUsernameField() throws Exception {
        String email = uniqueEmail("legacy");
        register("farmer", email);

        mockMvc.perform(post("/api/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(json(Map.of("username", email, "password", PASSWORD))))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.role").value("ROLE_FARMER"));
    }

    @Test
    void duplicateEmailIsRejectedWith409() throws Exception {
        String email = uniqueEmail("dup");
        register("customer", email);

        mockMvc.perform(multipart("/api/auth/register/farmer")
                        .param("name", "Again").param("email", email.toUpperCase()).param("password", PASSWORD))
                .andExpect(status().isConflict())
                .andExpect(jsonPath("$.message").value("An account with this email already exists"));
    }

    @Test
    void registrationValidatesInput() throws Exception {
        mockMvc.perform(multipart("/api/auth/register/customer")
                        .param("name", "").param("email", "not-an-email").param("password", "short")
                        .param("mobileNumber", "123"))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.fieldErrors[*].field", hasItem("email")))
                .andExpect(jsonPath("$.fieldErrors[*].field", hasItem("password")))
                .andExpect(jsonPath("$.fieldErrors[*].field", hasItem("mobileNumber")));
    }

    @Test
    void wrongPasswordReturns401AndAccountLocksAfterFiveFailures() throws Exception {
        String email = uniqueEmail("lock");
        register("customer", email);
        String badLogin = json(Map.of("email", email, "password", "wrong-password"));

        for (int i = 0; i < 5; i++) {
            mockMvc.perform(post("/api/auth/login").contentType(MediaType.APPLICATION_JSON).content(badLogin))
                    .andExpect(status().isUnauthorized())
                    .andExpect(jsonPath("$.message").value("Invalid email or password"));
        }

        // Even the correct password is refused while the lock is active.
        mockMvc.perform(post("/api/auth/login").contentType(MediaType.APPLICATION_JSON)
                        .content(json(Map.of("email", email, "password", PASSWORD))))
                .andExpect(status().isLocked());
    }

    @Test
    void forgotPasswordDoesNotRevealWhetherEmailExists() throws Exception {
        mockMvc.perform(post("/api/auth/forgot-password").contentType(MediaType.APPLICATION_JSON)
                        .content(json(Map.of("email", "nobody-here@example.com"))))
                .andExpect(status().isAccepted());
    }

    @Test
    void invalidOrMissingTokenIsRejected() throws Exception {
        mockMvc.perform(get("/api/users/me"))
                .andExpect(status().isUnauthorized())
                .andExpect(jsonPath("$.path").value("/api/users/me"));

        mockMvc.perform(get("/api/users/me").header(HttpHeaders.AUTHORIZATION, "Bearer garbage.token.value"))
                .andExpect(status().isUnauthorized());
    }

    @Test
    void changePasswordRequiresCurrentPassword() throws Exception {
        String email = uniqueEmail("pw");
        register("customer", email);
        String token = login(email, PASSWORD);

        mockMvc.perform(auth(put("/api/users/me/password"), token).contentType(MediaType.APPLICATION_JSON)
                        .content(json(Map.of("currentPassword", "nope", "newPassword", "BrandNew123"))))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.message").value("Current password is incorrect"));

        mockMvc.perform(auth(put("/api/users/me/password"), token).contentType(MediaType.APPLICATION_JSON)
                        .content(json(Map.of("currentPassword", PASSWORD, "newPassword", "BrandNew123"))))
                .andExpect(status().isNoContent());

        login(email, "BrandNew123");
    }
}
