package com.quita.api.complaint.model;

import com.quita.api.user.model.User;
import jakarta.persistence.*;
import lombok.*;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Table(name = "complaints")
@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class Complaint {

    @Id
    private UUID id;

    @Column(name = "user_id", nullable = false)
    private UUID userId;

    @Column(nullable = false)
    private String institution;

    @Column(nullable = false)
    private String title;

    @Column(name = "complaint_text", nullable = false, columnDefinition = "TEXT")
    private String complaintText;

    @Column(name = "current_debt_value")
    private BigDecimal currentDebtValue;

    @Column(name = "generated_by", nullable = false, length = 50)
    private String generatedBy;

    @Column(nullable = false)
    private Integer version;

    @Column(name = "created_at", nullable = false)
    private LocalDateTime createdAt;

    @Column(name = "updated_at", nullable = false)
    private LocalDateTime updatedAt;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", insertable = false, updatable = false)
    private User user;
}
