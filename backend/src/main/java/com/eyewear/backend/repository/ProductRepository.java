package com.eyewear.backend.repository;

import com.eyewear.backend.entity.Product;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface ProductRepository extends JpaRepository<Product, Integer> {
    @EntityGraph(attributePaths = {"images"})
    List<Product> findByCategoryAndIsActiveTrue(String category);

    @EntityGraph(attributePaths = {"images"})
    List<Product> findByIsActiveTrue();

    @EntityGraph(attributePaths = {"images"})
    List<Product> findByNameContainingIgnoreCaseAndIsActiveTrue(String name);

    @EntityGraph(attributePaths = {"images"})
    Optional<Product> findById(Integer id);
}
