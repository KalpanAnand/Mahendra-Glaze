package com.eyewear.backend.service;

import com.eyewear.backend.entity.Product;
import com.eyewear.backend.repository.ProductRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;

@Service
@RequiredArgsConstructor
public class ProductService {

    private final ProductRepository productRepository;

    public List<Product> getAllActiveProducts() {
        return productRepository.findByIsActiveTrue();
    }

    public Optional<Product> getProductById(Integer id) {
        return productRepository.findById(id);
    }

    public List<Product> getProductsByCategory(String category) {
        return productRepository.findByCategoryAndIsActiveTrue(category);
    }

    public List<Product> searchProducts(String name) {
        return productRepository.findByNameContainingIgnoreCaseAndIsActiveTrue(name);
    }

    @Transactional
    public Product createProduct(Product product) {
        product.setIsActive(true);
        if (product.getStockQuantity() == null) {
            product.setStockQuantity(0);
        }
        return productRepository.save(product);
    }

    @Transactional
    public Product updateProduct(Integer id, Product updatedProduct) {
        return productRepository.findById(id).map(existing -> {
            existing.setName(updatedProduct.getName());
            existing.setDescription(updatedProduct.getDescription());
            existing.setCategory(updatedProduct.getCategory());
            existing.setBrand(updatedProduct.getBrand());
            existing.setPrice(updatedProduct.getPrice());
            existing.setDiscountPrice(updatedProduct.getDiscountPrice());
            existing.setGender(updatedProduct.getGender());
            existing.setFrameType(updatedProduct.getFrameType());
            existing.setFrameMaterial(updatedProduct.getFrameMaterial());
            existing.setFrameColor(updatedProduct.getFrameColor());
            existing.setLensType(updatedProduct.getLensType());
            existing.setLensColor(updatedProduct.getLensColor());
            return productRepository.save(existing);
        }).orElseThrow(() -> new RuntimeException("Product not found with id: " + id));
    }

    @Transactional
    public void deactivateProduct(Integer id) {
        productRepository.findById(id).ifPresent(product -> {
            product.setIsActive(false);
            productRepository.save(product);
        });
    }

    @Transactional
    public Product updateStock(Integer id, Integer quantityChange) {
        return productRepository.findById(id).map(product -> {
            int newStock = (product.getStockQuantity() != null ? product.getStockQuantity() : 0) + quantityChange;
            if (newStock < 0) newStock = 0;
            product.setStockQuantity(newStock);
            return productRepository.save(product);
        }).orElseThrow(() -> new RuntimeException("Product not found with id: " + id));
    }
}
