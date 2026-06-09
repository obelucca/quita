CREATE TABLE documents (
    id UUID PRIMARY KEY,
    user_id UUID NOT NULL,
    original_filename VARCHAR(255) NOT NULL,
    stored_filename VARCHAR(255) NOT NULL,
    content_type VARCHAR(100) NOT NULL,
    file_size BIGINT NOT NULL,
    upload_date TIMESTAMP NOT NULL,
    status VARCHAR(50) NOT NULL,

    CONSTRAINT fk_document_user
        FOREIGN KEY (user_id)
        REFERENCES users(id)
);
