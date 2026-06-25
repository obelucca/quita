ALTER TABLE complaints ADD COLUMN credit_consumed BOOLEAN NOT NULL DEFAULT FALSE;
ALTER TABLE complaints ADD COLUMN credit_consumed_at TIMESTAMP;
