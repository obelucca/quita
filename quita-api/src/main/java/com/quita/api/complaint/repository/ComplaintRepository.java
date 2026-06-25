package com.quita.api.complaint.repository;

import com.quita.api.complaint.model.Complaint;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface ComplaintRepository extends JpaRepository<Complaint, UUID> {

    List<Complaint> findAllByUserIdOrderByCreatedAtDesc(UUID userId);

    Optional<Complaint> findFirstByUserIdOrderByCreatedAtDesc(UUID userId);

    Optional<Complaint> findFirstByUserIdAndInstitutionAndCreatedAtAfter(UUID userId, String institution, java.time.LocalDateTime after);

    Optional<Complaint> findByIdAndUserId(UUID id, UUID userId);

    @Query("SELECT COALESCE(MAX(c.version), 0) FROM Complaint c WHERE c.userId = :userId AND c.institution = :institution")
    int findMaxVersionByUserIdAndInstitution(@Param("userId") UUID userId, @Param("institution") String institution);
}
