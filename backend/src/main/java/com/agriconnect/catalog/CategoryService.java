package com.agriconnect.catalog;

import java.util.List;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.agriconnect.catalog.dto.CategoryRequest;
import com.agriconnect.catalog.dto.CategoryResponse;
import com.agriconnect.common.exception.ConflictException;
import com.agriconnect.common.exception.ResourceNotFoundException;

@Service
public class CategoryService {

    private final CategoryRepository categoryRepository;

    public CategoryService(CategoryRepository categoryRepository) {
        this.categoryRepository = categoryRepository;
    }

    @Transactional(readOnly = true)
    public List<CategoryResponse> list(boolean includeInactive) {
        List<Category> categories = includeInactive
                ? categoryRepository.findAllByOrderByNameAsc()
                : categoryRepository.findByActiveTrueOrderByNameAsc();
        return categories.stream().map(CategoryResponse::from).toList();
    }

    @Transactional
    public CategoryResponse create(CategoryRequest request) {
        String name = request.name().trim();
        if (categoryRepository.existsByNameIgnoreCase(name)) {
            throw new ConflictException("Category '" + name + "' already exists");
        }
        return CategoryResponse.from(categoryRepository.save(
                new Category(name, request.active() == null || request.active())));
    }

    @Transactional
    public CategoryResponse update(Long id, CategoryRequest request) {
        Category category = categoryRepository.findById(id)
                .orElseThrow(() -> ResourceNotFoundException.of("Category", id));
        String name = request.name().trim();
        if (categoryRepository.existsByNameIgnoreCaseAndIdNot(name, id)) {
            throw new ConflictException("Category '" + name + "' already exists");
        }
        category.setName(name);
        if (request.active() != null) {
            category.setActive(request.active());
        }
        return CategoryResponse.from(category);
    }

    @Transactional
    public void delete(Long id) {
        if (!categoryRepository.existsById(id)) {
            throw ResourceNotFoundException.of("Category", id);
        }
        categoryRepository.deleteById(id);
    }
}
