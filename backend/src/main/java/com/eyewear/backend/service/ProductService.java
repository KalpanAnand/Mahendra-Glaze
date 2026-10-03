package com.eyewear.backend.service;

import com.eyewear.backend.entity.Product;
import com.eyewear.backend.entity.ProductImage;
import com.eyewear.backend.repository.ProductImageRepository;
import com.eyewear.backend.repository.ProductRepository;
import com.eyewear.backend.service.ImageUploadService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.List;
import java.util.Optional;

@Service
@RequiredArgsConstructor
public class ProductService {

    private final ProductRepository productRepository;
    private final ProductImageRepository productImageRepository;
    private final ImageUploadService imageUploadService;

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

    @Transactional
    public ProductImage addProductImage(Integer productId, MultipartFile file, Boolean isPrimary) throws IOException {
        Product product = productRepository.findById(productId)
                .orElseThrow(() -> new RuntimeException("Product not found with id: " + productId));

        boolean hasPrimary = product.getImages() != null
                && product.getImages().stream().anyMatch(img -> Boolean.TRUE.equals(img.getIsPrimary()));

        if (!hasPrimary) {
            isPrimary = true;
        }

        if (Boolean.TRUE.equals(isPrimary) && product.getImages() != null) {
            product.getImages().forEach(img -> img.setIsPrimary(false));
        }

        String imageUrl = imageUploadService.uploadImage(file);
        ProductImage productImage = ProductImage.builder()
                .product(product)
                .imageUrl(imageUrl)
                .isPrimary(isPrimary)
                .build();
        return productImageRepository.save(productImage);
    }

    @Transactional
    public void setPrimaryImage(Integer imageId) {
        ProductImage image = productImageRepository.findById(imageId)
                .orElseThrow(() -> new RuntimeException("Image not found with id: " + imageId));
        Product product = image.getProduct();

        if (product.getImages() != null) {
            product.getImages().forEach(img -> img.setIsPrimary(img.getId().equals(imageId)));
            productImageRepository.saveAll(product.getImages());
        }
    }

    @Transactional
    public void deleteProductImage(Integer imageId) {
        ProductImage image = productImageRepository.findById(imageId)
                .orElseThrow(() -> new RuntimeException("Image not found with id: " + imageId));
        Integer productId = image.getProduct().getId();
        boolean wasPrimary = Boolean.TRUE.equals(image.getIsPrimary());

        productImageRepository.delete(image);

        if (wasPrimary) {
            List<ProductImage> remaining = productImageRepository.findByProductId(productId);
            if (!remaining.isEmpty()) {
                ProductImage nextPrimary = remaining.get(0);
                nextPrimary.setIsPrimary(true);
                productImageRepository.save(nextPrimary);
            }
        }
    }
}
