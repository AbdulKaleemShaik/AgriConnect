package com.agriconnect.cart;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Lock;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import com.agriconnect.catalog.Product;

import jakarta.persistence.LockModeType;

public interface CartItemRepository extends JpaRepository<CartItem, Long> {

    /**
     * Locks (SELECT ... FOR UPDATE) every product in the customer's cart, always in id order.
     * Called at the start of checkout so concurrent checkouts of the same product queue up
     * instead of deadlocking on MySQL (the order insert's foreign-key check takes a shared
     * lock on the product row that would otherwise conflict with the stock update).
     */
    @Lock(LockModeType.PESSIMISTIC_WRITE)
    @Query("select p from Product p where p.id in "
            + "(select c.product.id from CartItem c where c.customer.id = :customerId) order by p.id")
    List<Product> lockProductsInCart(@Param("customerId") Long customerId);

    @EntityGraph(attributePaths = {"product", "product.farmer"})
    List<CartItem> findByCustomerIdOrderByIdAsc(Long customerId);

    Optional<CartItem> findByCustomerIdAndProductId(Long customerId, Long productId);

    @Modifying
    @Query("delete from CartItem c where c.customer.id = :customerId and c.product.id = :productId")
    int deleteByCustomerIdAndProductId(@Param("customerId") Long customerId, @Param("productId") Long productId);

    @Modifying
    @Query("delete from CartItem c where c.customer.id = :customerId")
    int deleteByCustomerId(@Param("customerId") Long customerId);

    @Modifying
    @Query("delete from CartItem c where c.product.id = :productId")
    int deleteByProductId(@Param("productId") Long productId);
}
