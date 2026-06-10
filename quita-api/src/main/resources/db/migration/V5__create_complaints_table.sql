CREATE TABLE complaints (
    id UUID PRIMARY KEY,
    user_id UUID NOT NULL,
    institution VARCHAR(255) NOT NULL,
    title VARCHAR(255) NOT NULL,
    complaint_text TEXT NOT NULL,
    current_debt_value DECIMAL(19,2),
    generated_by VARCHAR(50) NOT NULL,
    version INTEGER NOT NULL,
    created_at TIMESTAMP NOT NULL,
    updated_at TIMESTAMP NOT NULL,

    CONSTRAINT fk_complaint_user
        FOREIGN KEY (user_id)
        REFERENCES users(id)
);
