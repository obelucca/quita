package com.quita.api.document.service;

import com.quita.api.document.dto.DocumentResponse;
import com.quita.api.document.model.Document;
import com.quita.api.document.model.DocumentStatus;
import com.quita.api.document.repository.DocumentRepository;
import com.quita.api.exception.FileTooLargeException;
import com.quita.api.exception.InvalidFileTypeException;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class DocumentService {

    private final DocumentRepository documentRepository;
    private final StorageService storageService;

    private static final long MAX_FILE_SIZE = 20 * 1024 * 1024; // 20 MB

    @Transactional
    public DocumentResponse uploadDocument(MultipartFile file, UUID userId) {
        if (file == null || file.isEmpty()) {
            throw new IllegalArgumentException("File cannot be empty");
        }

        // Validate content type / extension
        String contentType = file.getContentType();
        String originalFilename = file.getOriginalFilename();
        boolean isPdf = (contentType != null && contentType.equalsIgnoreCase("application/pdf"))
                || (originalFilename != null && originalFilename.toLowerCase().endsWith(".pdf"));

        if (!isPdf) {
            throw new InvalidFileTypeException("Only PDF files are allowed");
        }

        // Validate file size
        if (file.getSize() > MAX_FILE_SIZE) {
            throw new FileTooLargeException("File size exceeds maximum limit");
        }

        UUID documentId = UUID.randomUUID();
        String storedFilename = documentId.toString() + ".pdf";

        try {
            storageService.store(file, storedFilename);
        } catch (IOException e) {
            throw new RuntimeException("Failed to store file", e);
        }

        Document document = Document.builder()
                .id(documentId)
                .userId(userId)
                .originalFilename(originalFilename != null ? originalFilename : "registrato.pdf")
                .storedFilename(storedFilename)
                .contentType("application/pdf")
                .fileSize(file.getSize())
                .uploadDate(LocalDateTime.now())
                .status(DocumentStatus.UPLOADED)
                .build();

        documentRepository.save(document);

        return DocumentResponse.builder()
                .id(document.getId().toString())
                .originalFilename(document.getOriginalFilename())
                .status(document.getStatus().name())
                .build();
    }

    public List<DocumentResponse> listDocuments(UUID userId) {
        return documentRepository.findAllByUserId(userId).stream()
                .map(doc -> DocumentResponse.builder()
                        .id(doc.getId().toString())
                        .originalFilename(doc.getOriginalFilename())
                        .uploadDate(doc.getUploadDate())
                        .status(doc.getStatus().name())
                        .build())
                .collect(Collectors.toList());
    }
}
