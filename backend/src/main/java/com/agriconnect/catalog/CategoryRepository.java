package com.agriconnect.catalog;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;

public interface CategoryRepository extends JpaRepository<Category, Long> {

    boolean existsByNameIgnoreCase(String name);

    boolean existsByNameIgnoreCaseAndIdNot(String name, Long id);

    List<Category> findByActiveTrueOrderByNameAsc();

    List<Category> findAllByOrderByNameAsc();
}
