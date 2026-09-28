CREATE TABLE inventory_transactions (
    id SERIAL PRIMARY KEY,
    product_id INT NOT NULL,
    quantity_change INT NOT NULL,
    transaction_type VARCHAR(50) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_inventory_product FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE
);
