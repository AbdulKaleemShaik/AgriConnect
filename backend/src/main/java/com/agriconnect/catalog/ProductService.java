package com.agriconnect.catalog;

import java.util.List;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import com.agriconnect.cart.CartItemRepository;
import com.agriconnect.catalog.dto.ProductRequest;
import com.agriconnect.catalog.dto.ProductResponse;
import com.agriconnect.common.exception.BadRequestException;
import com.agriconnect.common.exception.ResourceNotFoundException;
import com.agriconnect.common.storage.FileStorageService;
import com.agriconnect.common.storage.ImageFolder;
import com.agriconnect.security.AppUserDetails;
import com.agriconnect.user.Role;
import com.agriconnect.user.User;
import com.agriconnect.user.UserRepository;

@Service
public class ProductService {

    private static final List<String> SORTABLE_FIELDS = List.of("createdAt", "price", "discountPrice", "title");

    private final ProductRepository productRepository;
    private final UserRepository userRepository;
    private final CartItemRepository cartItemRepository;
    private final FileStorageService fileStorage;

    public ProductService(ProductRepository productRepository, UserRepository userRepository,
                          CartItemRepository cartItemRepository, FileStorageService fileStorage) {
        this.productRepository = productRepository;
        this.userRepository = userRepository;
        this.cartItemRepository = cartItemRepository;
        this.fileStorage = fileStorage;
    }

    /** Public catalogue: active, non-deleted products, optionally filtered by category and text. */
    @Transactional(readOnly = true)
    public Page<ProductResponse> search(String category, String query, Pageable pageable) {
        pageable.getSort().forEach(order -> {
            if (!SORTABLE_FIELDS.contains(order.getProperty())) {
                throw new BadRequestException("Cannot sort by '" + order.getProperty() + "'. Allowed: "
                        + String.join(", ", SORTABLE_FIELDS));
            }
        });
        Specification<Product> spec = ProductSpecifications.purchasable();
        Specification<Product> byCategory = ProductSpecifications.inCategory(category);
        Specification<Product> byText = ProductSpecifications.matches(query);
        if (byCategory != null) {
            spec = spec.and(byCategory);
        }
        if (byText != null) {
            spec = spec.and(byText);
        }
        return productRepository.findAll(spec, pageable).map(ProductResponse::from);
    }

    @Transactional(readOnly = true)
    public ProductResponse getById(Long id) {
        return ProductResponse.from(findExisting(id));
    }

    @Transactional(readOnly = true)
    public List<ProductResponse> listForFarmer(Long farmerId) {
        return productRepository.findByFarmerIdAndDeletedFalseOrderByCreatedAtDesc(farmerId).stream()
                .map(ProductResponse::from)
                .toList();
    }

    @Transactional
    public ProductResponse create(Long farmerId, ProductRequest request, MultipartFile image) {
        User farmer = userRepository.findById(farmerId)
                .orElseThrow(() -> ResourceNotFoundException.of("User", farmerId));
        Product product = new Product();
        product.setFarmer(farmer);
        apply(product, request);
        product.setImage(fileStorage.store(image, ImageFolder.PRODUCTS));
        return ProductResponse.from(productRepository.save(product));
    }

    @Transactional
    public ProductResponse update(Long productId, AppUserDetails actor, ProductRequest request,
                                  MultipartFile image) {
        Product product = findExisting(productId);
        checkCanModify(product, actor);
        apply(product, request);
        String newImage = fileStorage.store(image, ImageFolder.PRODUCTS);
        if (newImage != null) {
            fileStorage.delete(product.getImage(), ImageFolder.PRODUCTS);
            product.setImage(newImage);
        }
        return ProductResponse.from(product);
    }

    /** Soft-deletes the listing and removes it from every cart; existing orders keep referencing it. */
    @Transactional
    public void delete(Long productId, AppUserDetails actor) {
        Product product = findExisting(productId);
        checkCanModify(product, actor);
        product.setDeleted(true);
        product.setActive(false);
        cartItemRepository.deleteByProductId(productId);
    }

    private void apply(Product product, ProductRequest request) {
        product.setTitle(request.title().trim());
        product.setDescription(request.description());
        product.setCategory(request.category().trim());
        product.setStock(request.stock());
        product.setActive(request.activeOrDefault());
        product.applyPricing(request.price(), request.discountOrZero());
    }

    private void checkCanModify(Product product, AppUserDetails actor) {
        if (!actor.hasRole(Role.ADMIN) && !product.isOwnedBy(actor.getId())) {
            throw new AccessDeniedException("You can only modify your own products");
        }
    }

    private Product findExisting(Long id) {
        return productRepository.findById(id)
                .filter(p -> !p.isDeleted())
                .orElseThrow(() -> ResourceNotFoundException.of("Product", id));
    }
}
