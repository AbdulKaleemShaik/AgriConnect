package com.agriconnect.cart;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.agriconnect.cart.dto.CartResponse;
import com.agriconnect.catalog.Product;
import com.agriconnect.catalog.ProductRepository;
import com.agriconnect.common.exception.ConflictException;
import com.agriconnect.common.exception.ResourceNotFoundException;
import com.agriconnect.user.User;
import com.agriconnect.user.UserRepository;

/** Shopping cart of the authenticated customer. The customer id always comes from the JWT, never the request. */
@Service
public class CartService {

    private final CartItemRepository cartItemRepository;
    private final ProductRepository productRepository;
    private final UserRepository userRepository;

    public CartService(CartItemRepository cartItemRepository, ProductRepository productRepository,
                       UserRepository userRepository) {
        this.cartItemRepository = cartItemRepository;
        this.productRepository = productRepository;
        this.userRepository = userRepository;
    }

    @Transactional(readOnly = true)
    public CartResponse getCart(Long customerId) {
        return CartResponse.from(cartItemRepository.findByCustomerIdOrderByIdAsc(customerId));
    }

    /** Adds {@code quantity} units, merging with an existing line for the same product. */
    @Transactional
    public CartResponse addItem(Long customerId, Long productId, int quantity) {
        Product product = findPurchasableProduct(productId);
        CartItem item = cartItemRepository.findByCustomerIdAndProductId(customerId, productId)
                .orElseGet(() -> new CartItem(customerReference(customerId), product, 0));
        int newQuantity = item.getQuantity() + quantity;
        ensureInStock(product, newQuantity);
        item.setQuantity(newQuantity);
        cartItemRepository.save(item);
        return getCart(customerId);
    }

    /** Sets the absolute quantity; 0 removes the line. */
    @Transactional
    public CartResponse updateQuantity(Long customerId, Long productId, int quantity) {
        CartItem item = cartItemRepository.findByCustomerIdAndProductId(customerId, productId)
                .orElseThrow(() -> new ResourceNotFoundException("Product " + productId + " is not in your cart"));
        if (quantity == 0) {
            cartItemRepository.delete(item);
        } else {
            ensureInStock(item.getProduct(), quantity);
            item.setQuantity(quantity);
        }
        return getCart(customerId);
    }

    @Transactional
    public void removeItem(Long customerId, Long productId) {
        cartItemRepository.deleteByCustomerIdAndProductId(customerId, productId);
    }

    @Transactional
    public void clear(Long customerId) {
        cartItemRepository.deleteByCustomerId(customerId);
    }

    private Product findPurchasableProduct(Long productId) {
        return productRepository.findById(productId)
                .filter(Product::isPurchasable)
                .orElseThrow(() -> ResourceNotFoundException.of("Product", productId));
    }

    private static void ensureInStock(Product product, int requested) {
        if (requested > product.getStock()) {
            throw new ConflictException("Only " + product.getStock() + " unit(s) of '" + product.getTitle()
                    + "' are in stock");
        }
    }

    private User customerReference(Long customerId) {
        return userRepository.getReferenceById(customerId);
    }
}
