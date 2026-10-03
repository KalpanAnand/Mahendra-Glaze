package com.eyewear.backend.controller;

import com.eyewear.backend.entity.Product;
import com.eyewear.backend.service.ProductService;
import com.eyewear.backend.entity.ProductImage;
import com.eyewear.backend.repository.ProductImageRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/products")
@RequiredArgsConstructor
public class ProductController {

    private final ProductService productService;
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
        try {
            return ResponseEntity.ok(productService.addProductImage(id, file, isPrimary));
        } catch (RuntimeException e) {
            return ResponseEntity.notFound().build();
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.internalServerError().build();
        }
    }

    @PatchMapping("/admin/image/{imageId}/primary")
    public ResponseEntity<Void> setPrimaryImage(@PathVariable Integer imageId) {
        try {
            productService.setPrimaryImage(imageId);
            return ResponseEntity.ok().build();
        } catch (RuntimeException e) {
            return ResponseEntity.notFound().build();
        }
    }

    @DeleteMapping("/admin/{id}/images")
    public ResponseEntity<Void> deleteAllProductImages(@PathVariable Integer id) {
        return productService.getProductById(id).map(product -> {
            List<ProductImage> images = product.getImages();
            if (images != null && !images.isEmpty()) {
                productImageRepository.deleteAll(images);
            }
            return ResponseEntity.ok().<Void>build();
        }).orElse(ResponseEntity.notFound().build());
    }

    @DeleteMapping("/admin/image/{imageId}")
    public ResponseEntity<Void> deleteProductImage(@PathVariable Integer imageId) {
        try {
            productService.deleteProductImage(imageId);
            return ResponseEntity.ok().build();
        } catch (RuntimeException e) {
            return ResponseEntity.notFound().build();
        }
    }
}
