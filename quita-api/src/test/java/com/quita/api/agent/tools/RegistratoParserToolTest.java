package com.quita.api.agent.tools;

import com.quita.api.config.StorageProperties;
import com.quita.api.debt.model.Debt;
import com.quita.api.debt.repository.DebtRepository;
import com.quita.api.document.model.Document;
import com.quita.api.document.model.DocumentStatus;
import com.quita.api.document.repository.DocumentRepository;
import com.quita.api.user.model.User;
import com.quita.api.user.repository.UserRepository;
import org.apache.pdfbox.pdmodel.PDDocument;
import org.apache.pdfbox.pdmodel.PDPage;
import org.apache.pdfbox.pdmodel.PDPageContentStream;
import org.apache.pdfbox.pdmodel.font.PDType1Font;
import org.apache.pdfbox.pdmodel.font.Standard14Fonts;
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.transaction.annotation.Transactional;

import java.io.File;
import java.io.IOException;
import java.math.BigDecimal;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.time.LocalDateTime;
import java.util.Comparator;
import java.util.List;
import java.util.UUID;

import static org.junit.jupiter.api.Assertions.*;

@SpringBootTest
@Transactional
class RegistratoParserToolTest {

    @Autowired
    private RegistratoParserTool registratoParserTool;

    @Autowired
    private DocumentRepository documentRepository;

    @Autowired
    private DebtRepository debtRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private StorageProperties storageProperties;

    private User testUser;
    private Document testDocument;
    private Path pdfPath;

    @BeforeEach
    void setUp() throws IOException {
        debtRepository.deleteAllInBatch();
        documentRepository.deleteAllInBatch();
        userRepository.deleteAllInBatch();

        // Clear uploads directory
        Path uploadPath = Paths.get(storageProperties.getUploadDir()).toAbsolutePath().normalize();
        if (!Files.exists(uploadPath)) {
            Files.createDirectories(uploadPath);
        } else {
            Files.walk(uploadPath)
                    .sorted(Comparator.reverseOrder())
                    .map(Path::toFile)
                    .forEach(file -> {
                        if (!file.getPath().equals(uploadPath.toString())) {
                            file.delete();
                        }
                    });
        }

        // Create a user
        testUser = User.builder()
                .name("Cleber Lucas")
                .email("cleber.lucas@email.com")
                .password("encodedpassword")
                .createdAt(LocalDateTime.now())
                .updatedAt(LocalDateTime.now())
                .build();
        userRepository.saveAndFlush(testUser);

        // Create a document record
        UUID documentId = UUID.randomUUID();
        String storedFilename = documentId.toString() + ".pdf";
        pdfPath = uploadPath.resolve(storedFilename);

        // Build the mock document PDF using PDFBox
        try (PDDocument doc = new PDDocument()) {
            PDPage page = new PDPage();
            doc.addPage(page);
            try (PDPageContentStream contentStream = new PDPageContentStream(doc, page)) {
                contentStream.beginText();
                contentStream.setFont(new PDType1Font(Standard14Fonts.FontName.HELVETICA), 12);
                contentStream.newLineAtOffset(50, 700);
                contentStream.showText("Instituicao: Banco Nubank");
                contentStream.newLineAtOffset(0, -20);
                contentStream.showText("Modalidade: Emprestimo Pessoal");
                contentStream.newLineAtOffset(0, -20);
                contentStream.showText("Valor: 3.500,50");
                contentStream.endText();
            }
            doc.save(pdfPath.toFile());
        }

        testDocument = Document.builder()
                .id(documentId)
                .userId(testUser.getId())
                .originalFilename("registrato_test.pdf")
                .storedFilename(storedFilename)
                .contentType("application/pdf")
                .fileSize(Files.size(pdfPath))
                .uploadDate(LocalDateTime.now())
                .status(DocumentStatus.UPLOADED)
                .build();
        documentRepository.saveAndFlush(testDocument);
    }

    @AfterEach
    void tearDown() throws IOException {
        debtRepository.deleteAllInBatch();
        documentRepository.deleteAllInBatch();
        userRepository.deleteAllInBatch();

        if (pdfPath != null && Files.exists(pdfPath)) {
            Files.delete(pdfPath);
        }
    }

    @Test
    void shouldExecuteToolSuccessfullyAndExtractDebts() {
        AgentContext context = new AgentContext();
        context.setParameter("documentId", testDocument.getId());

        ToolResult result = registratoParserTool.execute(context);

        assertTrue(result.isSuccess());
        assertNotNull(result.getData());
        assertTrue(result.getMessage().contains("Successfully processed document"));

        // Verify document status
        Document updatedDoc = documentRepository.findById(testDocument.getId()).orElseThrow();
        assertEquals(DocumentStatus.PROCESSED, updatedDoc.getStatus());

        // Verify debts in repository
        List<Debt> debts = debtRepository.findAllByDocumentId(testDocument.getId());
        assertEquals(1, debts.size());

        Debt debt = debts.get(0);
        assertEquals("Banco Nubank", debt.getInstitution());
        assertEquals("Emprestimo Pessoal", debt.getOperationType());
        assertEquals(new BigDecimal("3500.50"), debt.getReportedValue());
        assertNotNull(debt.getExtractedText());
    }

    @Test
    void shouldFailIfDocumentDoesNotExist() {
        AgentContext context = new AgentContext();
        context.setParameter("documentId", UUID.randomUUID());

        ToolResult result = registratoParserTool.execute(context);

        assertFalse(result.isSuccess());
        assertTrue(result.getMessage().contains("Document not found"));
    }

    @Test
    void shouldTransitionToFailedIfFileIsCorrupted() throws IOException {
        // Corrupt the PDF file by writing invalid data to it
        Files.writeString(pdfPath, "this is not a valid PDF file");

        AgentContext context = new AgentContext();
        context.setParameter("documentId", testDocument.getId());

        ToolResult result = registratoParserTool.execute(context);

        assertFalse(result.isSuccess());
        assertTrue(result.getMessage().contains("Failed to process document"));

        // Verify document status updated to FAILED
        Document updatedDoc = documentRepository.findById(testDocument.getId()).orElseThrow();
        assertEquals(DocumentStatus.FAILED, updatedDoc.getStatus());
    }
}
