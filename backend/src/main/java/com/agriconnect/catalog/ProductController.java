package com.agriconnect.catalog;

import java.util.List;

import org.springdoc.core.annotations.ParameterObject;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.ModelAttribute;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RequestPart;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.web.servlet.support.ServletUriComponentsBuilder;

import com.agriconnect.catalog.dto.ProductRequest;
import com.agriconnect.catalog.dto.ProductResponse;
import com.agriconnect.common.PageResponse;
import com.agriconnect.security.AppUserDetails;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;

@RestController
@RequestMapping("/api/products")
@Tag(name = "Products")
public class ProductController {

    private final ProductService productService;

    public ProductController(ProductService productService) {
        this.productService = productService;
    }

    @GetMapping
    @Operation(summary = "Browse active products (public, paginated, filter by category and/or text)")
    public PageResponse<ProductResponse> search(
            @RequestParam(required = false) String category,
            @RequestParam(name = "q", required = false) String query,
            @ParameterObject @PageableDefault(size = 12, sort = "createdAt", direction = Sort.Direction.DESC)
            Pageable pageable) {
        return PageResponse.from(productService.search(category, query, pageable));
    }

    @GetMapping("/{id}")
    @Operation(summary = "Get a product by id (public)")
    public ProductResponse get(@PathVariable Long id) {
        return productService.getById(id);
    }

    @GetMapping("/mine")
    @PreAuthorize("hasRole('FARMER')")
    @Operation(summary = "List the authenticated farmer's own products, including inactive ones")
    public List<ProductResponse> mine(@AuthenticationPrincipal AppUserDetails me) {
        return productService.listForFarmer(me.getId());
    }

    @PostMapping(consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    @PreAuthorize("hasRole('FARMER')")
    @Operation(summary = "Create a product listing (farmer only; multipart form, optional 'image' part)")
    public ResponseEntity<ProductResponse> create(@AuthenticationPrincipal AppUserDetails me,
                                                  @Valid @ModelAttribute ProductRequest request,
                                                  @RequestPart(name = "image", required = false)
                                                  MultipartFile image) {
        ProductResponse created = productService.create(me.getId(), request, image);
        var location = ServletUriComponentsBuilder.fromCurrentRequest().path("/{id}")
                .buildAndExpand(created.id()).toUri();
        return ResponseEntity.status(HttpStatus.CREATED).location(location).body(created);
    }

    @PutMapping(path = "/{id}", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    @PreAuthorize("hasAnyRole('FARMER', 'ADMIN')")
    @Operation(summary = "Update a product (owning farmer or admin)")
    public ProductResponse update(@PathVariable Long id,
                                  @AuthenticationPrincipal AppUserDetails me,
                                  @Valid @ModelAttribute ProductRequest request,
                                  @RequestPart(name = "image", required = false) MultipartFile image) {
        return productService.update(id, me, request, image);
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasAnyRole('FARMER', 'ADMIN')")
    @Operation(summary = "Delete (soft-delete) a product (owning farmer or admin)")
    public ResponseEntity<Void> delete(@PathVariable Long id, @AuthenticationPrincipal AppUserDetails me) {
        productService.delete(id, me);
        return ResponseEntity.noContent().build();
    }
}
