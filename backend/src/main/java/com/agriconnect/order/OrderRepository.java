package com.agriconnect.order;

import java.util.List;
import java.util.Optional;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;

public interface OrderRepository extends JpaRepository<CustomerOrder, Long> {

    @EntityGraph(attributePaths = {"product", "product.farmer", "customer"})
    List<CustomerOrder> findByCustomerIdOrderByOrderDateDesc(Long customerId);

    @EntityGraph(attributePaths = {"product", "product.farmer", "customer"})
    Page<CustomerOrder> findByProductFarmerId(Long farmerId, Pageable pageable);

    @EntityGraph(attributePaths = {"product", "product.farmer", "customer"})
    Optional<CustomerOrder> findWithDetailsById(Long id);

    @EntityGraph(attributePaths = {"product", "product.farmer", "customer"})
    Optional<CustomerOrder> findByOrderNumber(String orderNumber);

    @Override
    @EntityGraph(attributePaths = {"product", "product.farmer", "customer"})
    Page<CustomerOrder> findAll(Pageable pageable);
}
