CREATE TABLE debts (
    id UUID PRIMARY KEY,
    document_id UUID NOT NULL,
    institution VARCHAR(255),
    operation_type VARCHAR(255),
    reported_value DECIMAL(19,2),
    extracted_text TEXT,
    created_at TIMESTAMP NOT NULL,
    CONSTRAINT fk_debt_document
        FOREIGN KEY (document_id)
        REFERENCES documents(id)
);
