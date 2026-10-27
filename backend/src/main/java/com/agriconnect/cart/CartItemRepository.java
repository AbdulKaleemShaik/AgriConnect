package com.agriconnect.cart;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface CartItemRepository extends JpaRepository<CartItem, Long> {

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
