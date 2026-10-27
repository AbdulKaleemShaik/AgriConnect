package com.agriconnect.catalog;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import java.math.BigDecimal;
import java.util.Optional;

import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.security.access.AccessDeniedException;

import com.agriconnect.TestData;
import com.agriconnect.cart.CartItemRepository;
import com.agriconnect.catalog.dto.ProductRequest;
import com.agriconnect.catalog.dto.ProductResponse;
import com.agriconnect.common.exception.BadRequestException;
import com.agriconnect.common.exception.ResourceNotFoundException;
import com.agriconnect.common.storage.FileStorageService;
import com.agriconnect.user.Role;
import com.agriconnect.user.User;
import com.agriconnect.user.UserRepository;

@ExtendWith(MockitoExtension.class)
class ProductServiceTest {

    @Mock ProductRepository productRepository;
    @Mock UserRepository userRepository;
    @Mock CartItemRepository cartItemRepository;
    @Mock FileStorageService fileStorage;
    @InjectMocks ProductService productService;

    private final User farmer = TestData.user(1, Role.FARMER);
    private final User otherFarmer = TestData.user(2, Role.FARMER);

    private static ProductRequest request(String price, Integer discount) {
        return new ProductRequest("Organic Tomatoes", "Fresh", "Vegetables", new BigDecimal(price), 50, discount, true);
    }

    @Test
    void createAssignsFarmerAndComputesDiscountPrice() {
        when(userRepository.findById(1L)).thenReturn(Optional.of(farmer));
        when(productRepository.save(any(Product.class))).thenAnswer(inv -> inv.getArgument(0));

        ProductResponse response = productService.create(1L, request("40.00", 25), null);

        assertThat(response.farmerId()).isEqualTo(1L);
        assertThat(response.price()).isEqualByComparingTo("40.00");
        assertThat(response.discountPrice()).isEqualByComparingTo("30.00");
        assertThat(response.active()).isTrue();
    }

    @Test
    void ownerCanUpdateProduct() {
        Product product = TestData.product(10, farmer, "20.00", 5);
        when(productRepository.findById(10L)).thenReturn(Optional.of(product));

        ProductResponse response = productService.update(10L, TestData.principal(farmer), request("99.99", 0), null);

        assertThat(response.price()).isEqualByComparingTo("99.99");
        assertThat(response.stock()).isEqualTo(50);
    }

    @Test
    void anotherFarmerCannotUpdateProduct() {
        Product product = TestData.product(10, farmer, "20.00", 5);
        when(productRepository.findById(10L)).thenReturn(Optional.of(product));

        assertThatThrownBy(() -> productService.update(10L, TestData.principal(otherFarmer), request("1.00", 0), null))
                .isInstanceOf(AccessDeniedException.class);
        assertThat(product.getPrice()).isEqualByComparingTo("20.00");
    }

    @Test
    void adminCanDeleteAnyProductAndItIsSoftDeleted() {
        Product product = TestData.product(10, farmer, "20.00", 5);
        when(productRepository.findById(10L)).thenReturn(Optional.of(product));

        productService.delete(10L, TestData.principal(TestData.user(99, Role.ADMIN)));

        assertThat(product.isDeleted()).isTrue();
        assertThat(product.isActive()).isFalse();
        verify(cartItemRepository).deleteByProductId(10L);
    }

    @Test
    void deletedProductIsNotFound() {
        Product product = TestData.product(10, farmer, "20.00", 5);
        product.setDeleted(true);
        when(productRepository.findById(10L)).thenReturn(Optional.of(product));

        assertThatThrownBy(() -> productService.getById(10L)).isInstanceOf(ResourceNotFoundException.class);
    }

    @Test
    void searchRejectsUnknownSortField() {
        var pageable = PageRequest.of(0, 10, Sort.by("farmer.password"));

        assertThatThrownBy(() -> productService.search(null, null, pageable))
                .isInstanceOf(BadRequestException.class);
        verify(productRepository, never()).findAll(any(org.springframework.data.jpa.domain.Specification.class),
                any(org.springframework.data.domain.Pageable.class));
    }
}
