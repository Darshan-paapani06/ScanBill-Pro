-- ==========================================
-- Barcode Reader & Billing Dashboard Schema
-- Database: MySQL
-- ==========================================

-- Create database if not exists (Optional)
CREATE DATABASE IF NOT EXISTS billing_system;
USE billing_system;

-- 1. Create Products Table
CREATE TABLE IF NOT EXISTS products (
    id INT AUTO_INCREMENT PRIMARY KEY,
    barcode_value VARCHAR(100) NOT NULL UNIQUE,
    product_name VARCHAR(150) NOT NULL,
    price DECIMAL(10, 2) NOT NULL,
    stock_quantity INT NOT NULL DEFAULT 0,
    image_url VARCHAR(500) NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    -- Index barcode_value for ultra-fast point-of-sale lookup
    INDEX idx_barcode (barcode_value)
);

-- 2. Insert Core Dummy Items for Demo / Testing
INSERT INTO products (barcode_value, product_name, price, stock_quantity, image_url)
VALUES 
('123456789012', 'XPS Elite Ultra 15" Laptop', 1299.99, 45, 'https://images.unsplash.com/photo-1593642632823-8f785ba67e45?auto=format&fit=crop&w=300&q=80'),
('987654321098', 'Acoustix Aura ANC Wireless Headphones', 249.50, 120, 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=300&q=80'),
('456789012345', 'Horizon Active Smartwatch Gen 5', 189.00, 85, 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=300&q=80'),
('748291036481', 'Apex Pro Mechanical Keyboard SDK', 145.00, 30, 'https://images.unsplash.com/photo-1587829741301-dc798b83add3?auto=format&fit=crop&w=300&q=80'),
('395726104829', 'Viper Mini Ergonomic Mouse v3', 69.99, 150, 'https://images.unsplash.com/photo-1527443154391-507e9dc6c5cc?auto=format&fit=crop&w=300&q=80');

-- 3. (Optional) Create Transactions History Table (for a complete, Enterprise-grade system)
CREATE TABLE IF NOT EXISTS transactions (
    id INT AUTO_INCREMENT PRIMARY KEY,
    receipt_number VARCHAR(50) NOT NULL UNIQUE,
    cashier_name VARCHAR(100) NOT NULL,
    subtotal DECIMAL(10, 2) NOT NULL,
    tax DECIMAL(10, 2) NOT NULL,
    grand_total DECIMAL(10, 2) NOT NULL,
    payment_method VARCHAR(50) NOT NULL DEFAULT 'Credit Card',
    transaction_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS transaction_items (
    id INT AUTO_INCREMENT PRIMARY KEY,
    transaction_id INT NOT NULL,
    product_id INT NOT NULL,
    quantity INT NOT NULL,
    unit_price DECIMAL(10, 2) NOT NULL,
    FOREIGN KEY (transaction_id) REFERENCES transactions(id) ON DELETE CASCADE,
    FOREIGN KEY (product_id) REFERENCES products(id)
);
