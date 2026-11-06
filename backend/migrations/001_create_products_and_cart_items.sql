-- Apply only after reviewing the target database. Run in one transaction with
-- psql -v ON_ERROR_STOP=1 -1 -f migrations/001_create_products_and_cart_items.sql
-- Existing users data and schema are not changed.

CREATE TABLE products (
    id SERIAL PRIMARY KEY,
    seller_id INTEGER NOT NULL REFERENCES users (id),
    name VARCHAR(255) NOT NULL,
    description TEXT NOT NULL,
    category VARCHAR(100) NOT NULL,
    price NUMERIC(12, 2) NOT NULL,
    pack_size VARCHAR(100) NOT NULL,
    stock_quantity INTEGER NOT NULL,
    image_url VARCHAR(2048),
    origin VARCHAR(100) NOT NULL,
    ingredients TEXT,
    allergens TEXT,
    packaging TEXT,
    shelf_life VARCHAR(100),
    storage_instructions TEXT,
    CONSTRAINT ck_products_price_positive CHECK (price > 0),
    CONSTRAINT ck_products_stock_nonnegative CHECK (stock_quantity >= 0)
);

CREATE INDEX ix_products_seller_id ON products (seller_id);

CREATE TABLE cart_items (
    id SERIAL PRIMARY KEY,
    buyer_id INTEGER NOT NULL REFERENCES users (id),
    product_id INTEGER NOT NULL REFERENCES products (id),
    quantity INTEGER NOT NULL,
    CONSTRAINT ck_cart_items_quantity_positive CHECK (quantity > 0),
    CONSTRAINT uq_cart_items_buyer_product UNIQUE (buyer_id, product_id)
);

CREATE INDEX ix_cart_items_product_id ON cart_items (product_id);
