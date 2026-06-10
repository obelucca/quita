package com.quita.api.debt.model;

import com.quita.api.document.model.Document;
import jakarta.persistence.*;
import lombok.*;
import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Table(name = "debts")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Debt {

    @Id
    private UUID id;

    @Column(name = "document_id", nullable = false)
    private UUID documentId;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "document_id", insertable = false, updatable = false)
    private Document document;

    @Column(length = 255)
    private String institution;

    @Column(name = "operation_type", length = 255)
    private String operationType;

    @Column(name = "reported_value", precision = 19, scale = 2)
    private BigDecimal reportedValue;

    @Column(name = "extracted_text", columnDefinition = "TEXT")
    private String extractedText;

    @Column(name = "created_at", nullable = false)
    private LocalDateTime createdAt;
}
