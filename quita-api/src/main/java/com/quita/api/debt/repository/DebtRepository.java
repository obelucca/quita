package com.quita.api.debt.repository;

import com.quita.api.debt.model.Debt;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;
import java.util.UUID;

@Repository
public interface DebtRepository extends JpaRepository<Debt, UUID> {
    List<Debt> findAllByDocumentId(UUID documentId);
}
