package com.quita.api.debt.repository;

import com.quita.api.debt.model.Debt;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import java.util.List;
import java.util.UUID;

@Repository
public interface DebtRepository extends JpaRepository<Debt, UUID> {
    List<Debt> findAllByDocumentId(UUID documentId);

    @Query("""
    SELECT d
    FROM Debt d
    JOIN d.document doc
    WHERE doc.user.id = :userId
    """)
    List<Debt> findAllByUserId(@Param("userId") UUID userId);
}
