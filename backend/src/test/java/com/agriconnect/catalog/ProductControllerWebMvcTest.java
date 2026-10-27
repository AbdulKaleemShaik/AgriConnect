package com.agriconnect.catalog;

import static org.hamcrest.Matchers.hasItem;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.ArgumentMatchers.isNull;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;
import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.user;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.delete;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.multipart;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.header;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import java.math.BigDecimal;
import java.util.List;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.context.annotation.Import;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.mock.web.MockMultipartFile;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.test.web.servlet.MockMvc;

import com.agriconnect.TestData;
import com.agriconnect.catalog.dto.ProductRequest;
import com.agriconnect.catalog.dto.ProductResponse;
import com.agriconnect.security.AppUserDetails;
import com.agriconnect.security.AppUserDetailsService;
import com.agriconnect.security.JwtService;
import com.agriconnect.security.RestAuthenticationHandlers;
import com.agriconnect.security.SecurityConfig;
import com.agriconnect.user.Role;

/** Web-layer slice: request mapping, validation, error JSON and role checks, with the service mocked. */
@WebMvcTest(ProductController.class)
@Import({SecurityConfig.class, RestAuthenticationHandlers.class})
class ProductControllerWebMvcTest {

    @Autowired MockMvc mockMvc;

    @MockitoBean ProductService productService;
    @MockitoBean JwtService jwtService;
    @MockitoBean AppUserDetailsService userDetailsService;

    private final AppUserDetails farmer = TestData.principal(TestData.user(1, Role.FARMER));
    private final AppUserDetails customer = TestData.principal(TestData.user(3, Role.CUSTOMER));

    private static ProductResponse sampleProduct() {
        return new ProductResponse(10L, "Tomatoes", "Fresh", "Vegetables", new BigDecimal("40.00"), 0,
                new BigDecimal("40.00"), 25, "abc.jpg", "/images/products/abc.jpg", true, 1L, "farmer1");
    }

    @Test
    void listingIsPublicAndPaginated() throws Exception {
        when(productService.search(eq("Vegetables"), isNull(), any(Pageable.class)))
                .thenReturn(new PageImpl<>(List.of(sampleProduct()), PageRequest.of(1, 5), 6));

        mockMvc.perform(get("/api/products").param("category", "Vegetables").param("page", "1").param("size", "5"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.content[0].title").value("Tomatoes"))
                .andExpect(jsonPath("$.page").value(1))
                .andExpect(jsonPath("$.size").value(5))
                .andExpect(jsonPath("$.totalElements").value(6))
                .andExpect(jsonPath("$.totalPages").value(2));
    }

    @Test
    void farmerCanCreateProductWithImage() throws Exception {
        when(productService.create(eq(1L), any(ProductRequest.class), any())).thenReturn(sampleProduct());

        mockMvc.perform(multipart("/api/products")
                        .file(new MockMultipartFile("image", "t.png", "image/png", new byte[]{1, 2, 3}))
                        .param("title", "Tomatoes").param("category", "Vegetables")
                        .param("price", "40.00").param("stock", "25")
                        .with(user(farmer)))
                .andExpect(status().isCreated())
                .andExpect(header().string("Location", "http://localhost/api/products/10"))
                .andExpect(jsonPath("$.id").value(10));
    }

    @Test
    void invalidProductReturnsFieldErrors() throws Exception {
        mockMvc.perform(multipart("/api/products")
                        .param("title", "").param("category", "Vegetables")
                        .param("price", "-1").param("stock", "5")
                        .with(user(farmer)))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.status").value(400))
                .andExpect(jsonPath("$.message").value("Validation failed"))
                .andExpect(jsonPath("$.fieldErrors[*].field", hasItem("title")))
                .andExpect(jsonPath("$.fieldErrors[*].field", hasItem("price")));
        verify(productService, never()).create(any(), any(), any());
    }

    @Test
    void anonymousUserCannotCreateProduct() throws Exception {
        mockMvc.perform(multipart("/api/products").param("title", "x"))
                .andExpect(status().isUnauthorized())
                .andExpect(jsonPath("$.status").value(401));
    }

    @Test
    void customerCannotCreateProduct() throws Exception {
        mockMvc.perform(multipart("/api/products")
                        .param("title", "Tomatoes").param("category", "Vegetables")
                        .param("price", "40.00").param("stock", "25")
                        .with(user(customer)))
                .andExpect(status().isForbidden())
                .andExpect(jsonPath("$.status").value(403));
    }

    @Test
    void ownershipViolationFromServiceMapsTo403() throws Exception {
        when(productService.update(eq(10L), any(), any(), any()))
                .thenThrow(new AccessDeniedException("You can only modify your own products"));

        mockMvc.perform(multipart("/api/products/10")
                        .param("title", "Tomatoes").param("category", "Vegetables")
                        .param("price", "40.00").param("stock", "25")
                        .with(request -> {
                            request.setMethod("PUT");
                            return request;
                        })
                        .with(user(farmer)))
                .andExpect(status().isForbidden())
                .andExpect(jsonPath("$.message").value("You can only modify your own products"));
    }

    @Test
    void farmerCanDeleteOwnProduct() throws Exception {
        mockMvc.perform(delete("/api/products/10").with(user(farmer)))
                .andExpect(status().isNoContent());
        verify(productService).delete(eq(10L), any(AppUserDetails.class));
    }

    @Test
    void mineRequiresFarmerRole() throws Exception {
        mockMvc.perform(get("/api/products/mine").with(user(customer)))
                .andExpect(status().isForbidden());
    }
}
