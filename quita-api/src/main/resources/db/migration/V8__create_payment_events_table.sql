CREATE TABLE payment_events (
    id UUID PRIMARY KEY,
    payment_id UUID NOT NULL,
    event_type VARCHAR(50) NOT NULL,
    old_status VARCHAR(20),
    new_status VARCHAR(20),
    processing_source VARCHAR(30) NOT NULL,
    metadata JSONB,
    created_at TIMESTAMP NOT NULL,
    CONSTRAINT fk_payment_events_payment FOREIGN KEY (payment_id) REFERENCES payments(id) ON DELETE CASCADE
);

CREATE INDEX idx_payment_events_payment ON payment_events(payment_id);
CREATE INDEX idx_payment_events_created ON payment_events(created_at);
