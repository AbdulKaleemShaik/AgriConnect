package com.agriconnect.catalog;

import java.util.List;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;

public interface ProductRepository extends JpaRepository<Product, Long>, JpaSpecificationExecutor<Product> {

    /** Fetches the farmer in the same query to avoid N+1 selects when mapping to DTOs. */
    @Override
    @EntityGraph(attributePaths = "farmer")
    Page<Product> findAll(Specification<Product> spec, Pageable pageable);

    @EntityGraph(attributePaths = "farmer")
    List<Product> findByFarmerIdAndDeletedFalseOrderByCreatedAtDesc(Long farmerId);
}
