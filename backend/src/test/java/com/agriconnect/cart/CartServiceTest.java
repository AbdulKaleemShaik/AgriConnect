package com.agriconnect.cart;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import java.util.List;
import java.util.Optional;

import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import com.agriconnect.TestData;
import com.agriconnect.cart.dto.CartResponse;
import com.agriconnect.catalog.Product;
import com.agriconnect.catalog.ProductRepository;
import com.agriconnect.common.exception.ConflictException;
import com.agriconnect.common.exception.ResourceNotFoundException;
import com.agriconnect.user.Role;
import com.agriconnect.user.User;
import com.agriconnect.user.UserRepository;

@ExtendWith(MockitoExtension.class)
class CartServiceTest {

    @Mock CartItemRepository cartItemRepository;
    @Mock ProductRepository productRepository;
    @Mock UserRepository userRepository;
    @InjectMocks CartService cartService;

    private final User customer = TestData.user(3, Role.CUSTOMER);
    private final Product product = TestData.product(10, TestData.user(1, Role.FARMER), "25.00", 5);

    @Test
    void addingNewProductCreatesCartLine() {
        when(productRepository.findById(10L)).thenReturn(Optional.of(product));
        when(cartItemRepository.findByCustomerIdAndProductId(3L, 10L)).thenReturn(Optional.empty());
        when(userRepository.getReferenceById(3L)).thenReturn(customer);

        cartService.addItem(3L, 10L, 2);

        ArgumentCaptor<CartItem> saved = ArgumentCaptor.forClass(CartItem.class);
        verify(cartItemRepository).save(saved.capture());
        assertThat(saved.getValue().getQuantity()).isEqualTo(2);
        assertThat(saved.getValue().getCustomer()).isSameAs(customer);
    }

    @Test
    void addingExistingProductIncrementsQuantity() {
        CartItem existing = new CartItem(customer, product, 2);
        when(productRepository.findById(10L)).thenReturn(Optional.of(product));
        when(cartItemRepository.findByCustomerIdAndProductId(3L, 10L)).thenReturn(Optional.of(existing));

        cartService.addItem(3L, 10L, 1);

        assertThat(existing.getQuantity()).isEqualTo(3);
    }

    @Test
    void cannotAddMoreThanStock() {
        when(productRepository.findById(10L)).thenReturn(Optional.of(product));
        when(cartItemRepository.findByCustomerIdAndProductId(3L, 10L))
                .thenReturn(Optional.of(new CartItem(customer, product, 4)));

        assertThatThrownBy(() -> cartService.addItem(3L, 10L, 2))
                .isInstanceOf(ConflictException.class)
                .hasMessageContaining("Only 5 unit(s)");
        verify(cartItemRepository, never()).save(any());
    }

    @Test
    void cannotAddInactiveProduct() {
        product.setActive(false);
        when(productRepository.findById(10L)).thenReturn(Optional.of(product));

        assertThatThrownBy(() -> cartService.addItem(3L, 10L, 1)).isInstanceOf(ResourceNotFoundException.class);
    }

    @Test
    void settingQuantityToZeroRemovesLine() {
        CartItem existing = new CartItem(customer, product, 2);
        when(cartItemRepository.findByCustomerIdAndProductId(3L, 10L)).thenReturn(Optional.of(existing));

        cartService.updateQuantity(3L, 10L, 0);

        verify(cartItemRepository).delete(existing);
    }

    @Test
    void cartTotalsAreComputedFromDiscountPrice() {
        Product discounted = TestData.product(11, TestData.user(1, Role.FARMER), "100.00", 10);
        discounted.applyPricing(discounted.getPrice(), 10); // 90.00 each
        when(cartItemRepository.findByCustomerIdOrderByIdAsc(3L)).thenReturn(List.of(
                new CartItem(customer, product, 2),        // 2 x 25.00
                new CartItem(customer, discounted, 3)));   // 3 x 90.00

        CartResponse cart = cartService.getCart(3L);

        assertThat(cart.totalQuantity()).isEqualTo(5);
        assertThat(cart.totalAmount()).isEqualByComparingTo("320.00");
        assertThat(cart.items().get(1).unitPrice()).isEqualByComparingTo("90.00");
    }
}
