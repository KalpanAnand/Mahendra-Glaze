package com.eyewear.backend.controller;

import com.eyewear.backend.entity.Product;
import com.eyewear.backend.service.ProductService;
import com.eyewear.backend.entity.ProductImage;
import com.eyewear.backend.repository.ProductImageRepository;
import com.eyewear.backend.service.ImageUploadService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;
import java.io.IOException;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/products")
@RequiredArgsConstructor
@CrossOrigin(origins = "*") // Allows React frontend to connect locally
public class ProductController {

    private final ProductService productService;
    private final ImageUploadService imageUploadService;
    private final ProductImageRepository productImageRepository;

    @GetMapping
    public List<Product> getProducts(
            @RequestParam(required = false) String category,
            @RequestParam(required = false) String search) {
        
        if (search != null && !search.isEmpty()) {
            return productService.searchProducts(search);
        } else if (category != null && !category.isEmpty()) {
            return productService.getProductsByCategory(category);
        }
        return productService.getAllActiveProducts();
    }

    @GetMapping("/{id}")
    public ResponseEntity<Product> getProduct(@PathVariable Integer id) {
        return productService.getProductById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    public static class CheckoutRequest {
        public Integer productId;
        public Integer quantity;
    }

    @PostMapping("/checkout")
    public ResponseEntity<Map<String, String>> checkout(@RequestBody List<CheckoutRequest> requests) {
        for (CheckoutRequest req : requests) {
            productService.updateStock(req.productId, -req.quantity);
        }
        return ResponseEntity.ok(Map.of("message", "Checkout successful!"));
    }

    // Admin endpoints (Unprotected for now, security added in Phase 5)
    
    @PostMapping("/admin")
    public Product createProduct(@RequestBody Product product) {
        return productService.createProduct(product);
    }

    @PutMapping("/admin/{id}")
    public Product updateProduct(@PathVariable Integer id, @RequestBody Product product) {
        return productService.updateProduct(id, product);
    }

    @PatchMapping("/admin/{id}/stock")
    public Product updateStock(@PathVariable Integer id, @RequestParam Integer quantityChange) {
        return productService.updateStock(id, quantityChange);
    }

    @DeleteMapping("/admin/{id}")
    public ResponseEntity<Void> deactivateProduct(@PathVariable Integer id) {
        productService.deactivateProduct(id);
        return ResponseEntity.ok().build();
    }

    @PostMapping("/admin/{id}/image")
    public ResponseEntity<ProductImage> uploadProductImage(
            @PathVariable Integer id,
            @RequestParam("file") MultipartFile file,
            @RequestParam(defaultValue = "false") Boolean isPrimary) {
        
        return productService.getProductById(id).map(product -> {
            try {
                String imageUrl = imageUploadService.uploadImage(file);
                ProductImage productImage = ProductImage.builder()
                        .product(product)
                        .imageUrl(imageUrl)
                        .isPrimary(isPrimary)
                        .build();
                return ResponseEntity.ok(productImageRepository.save(productImage));
            } catch (Exception e) {
                e.printStackTrace();
                return ResponseEntity.internalServerError().<ProductImage>build();
            }
        }).orElse(ResponseEntity.notFound().build());
    }
}
