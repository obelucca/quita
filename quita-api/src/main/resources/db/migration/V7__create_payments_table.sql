CREATE TABLE payments (
    id UUID PRIMARY KEY,
    user_id UUID NOT NULL,
    mercadopago_payment_id VARCHAR(100),
    mercadopago_preference_id VARCHAR(100),
    package_name VARCHAR(50) NOT NULL,
    credits_quantity INTEGER NOT NULL,
    amount DECIMAL(10,2) NOT NULL,
    status VARCHAR(30) NOT NULL,
    created_at TIMESTAMP NOT NULL,
    approved_at TIMESTAMP,
    CONSTRAINT fk_payments_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);
