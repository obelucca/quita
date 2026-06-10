package com.quita.api.complaint.service;

import com.quita.api.complaint.dto.ComplaintHistoryResponse;
import com.quita.api.complaint.model.Complaint;
import com.quita.api.complaint.repository.ComplaintRepository;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;
import java.util.UUID;

@Service
public class ComplaintHistoryService {

    private final ComplaintRepository complaintRepository;

    public ComplaintHistoryService(ComplaintRepository complaintRepository) {
        this.complaintRepository = complaintRepository;
    }

    @Transactional(readOnly = true)
    public List<ComplaintHistoryResponse> getHistory(UUID userId) {
        List<Complaint> complaints = complaintRepository.findAllByUserIdOrderByCreatedAtDesc(userId);
        return complaints.stream()
                .map(c -> ComplaintHistoryResponse.builder()
                        .id(c.getId())
                        .institution(c.getInstitution())
                        .title(c.getTitle())
                        .version(c.getVersion())
                        .createdAt(c.getCreatedAt())
                        .build())
                .toList();
    }

    @Transactional(readOnly = true)
    public Complaint getById(UUID id, UUID userId) {
        return complaintRepository.findByIdAndUserId(id, userId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Complaint not found"));
    }
}
