package com.quita.api.document.controller;

import com.quita.api.auth.service.JwtService;
import com.quita.api.config.StorageProperties;
import com.quita.api.document.repository.DocumentRepository;
import com.quita.api.user.model.User;
import com.quita.api.user.repository.UserRepository;
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.webmvc.test.autoconfigure.AutoConfigureMockMvc;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.mock.web.MockMultipartFile;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.transaction.annotation.Transactional;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.time.LocalDateTime;
import java.util.Comparator;
import java.util.UUID;

import static org.hamcrest.Matchers.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.multipart;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@SpringBootTest
@AutoConfigureMockMvc
@Transactional
class DocumentControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private DocumentRepository documentRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Autowired
    private JwtService jwtService;

    @Autowired
    private StorageProperties storageProperties;

    private User testUser;
    private String token;

    @BeforeEach
    void setUp() throws IOException {
        documentRepository.deleteAllInBatch();
        userRepository.deleteAllInBatch();

        // Clear uploads directory if it exists
        Path uploadPath = Paths.get(storageProperties.getUploadDir()).toAbsolutePath().normalize();
        if (Files.exists(uploadPath)) {
            Files.walk(uploadPath)
                    .sorted(Comparator.reverseOrder())
                    .map(Path::toFile)
                    .forEach(file -> {
                        if (!file.getPath().equals(uploadPath.toString())) {
                            file.delete();
                        }
                    });
        }

        testUser = User.builder()
                .name("Cleber Lucas")
                .email("cleber@email.com")
                .password(passwordEncoder.encode("123456"))
                .createdAt(LocalDateTime.now())
                .updatedAt(LocalDateTime.now())
                .build();
        userRepository.saveAndFlush(testUser);

        token = "Bearer " + jwtService.generateToken(testUser.getId().toString(), testUser.getEmail());
    }

    @AfterEach
    void tearDown() throws IOException {
        documentRepository.deleteAllInBatch();
        userRepository.deleteAllInBatch();

        // Clean up stored files
        Path uploadPath = Paths.get(storageProperties.getUploadDir()).toAbsolutePath().normalize();
        if (Files.exists(uploadPath)) {
            Files.walk(uploadPath)
                    .sorted(Comparator.reverseOrder())
                    .map(Path::toFile)
                    .forEach(file -> {
                        if (!file.getPath().equals(uploadPath.toString())) {
                            file.delete();
                        }
                    });
        }
    }

    @Test
    void shouldUploadPdfSuccessfully() throws Exception {
        MockMultipartFile file = new MockMultipartFile(
                "file",
                "registrato.pdf",
                MediaType.APPLICATION_PDF_VALUE,
                "dummy pdf content".getBytes()
        );

        mockMvc.perform(multipart("/documents/upload")
                        .file(file)
                        .header(HttpHeaders.AUTHORIZATION, token))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.id", notNullValue()))
                .andExpect(jsonPath("$.originalFilename", is("registrato.pdf")))
                .andExpect(jsonPath("$.status", is("UPLOADED")));
    }

    @Test
    void shouldRejectNonPdfFile() throws Exception {
        MockMultipartFile file = new MockMultipartFile(
                "file",
                "registrato.txt",
                MediaType.TEXT_PLAIN_VALUE,
                "dummy text content".getBytes()
        );

        mockMvc.perform(multipart("/documents/upload")
                        .file(file)
                        .header(HttpHeaders.AUTHORIZATION, token))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.message", is("Only PDF files are allowed")));
    }

    @Test
    void shouldRejectTooLargeFile() throws Exception {
        // Create a mock multipart file representing a file slightly over 20MB
        byte[] largeContent = new byte[20 * 1024 * 1024 + 1];
        MockMultipartFile file = new MockMultipartFile(
                "file",
                "large.pdf",
                MediaType.APPLICATION_PDF_VALUE,
                largeContent
        );

        mockMvc.perform(multipart("/documents/upload")
                        .file(file)
                        .header(HttpHeaders.AUTHORIZATION, token))
                .andExpect(status().isPayloadTooLarge())
                .andExpect(jsonPath("$.message", is("File size exceeds maximum limit")));
    }

    @Test
    void shouldListDocumentsSuccessfully() throws Exception {
        MockMultipartFile file = new MockMultipartFile(
                "file",
                "registrato.pdf",
                MediaType.APPLICATION_PDF_VALUE,
                "dummy pdf content".getBytes()
        );

        // Upload first
        mockMvc.perform(multipart("/documents/upload")
                        .file(file)
                        .header(HttpHeaders.AUTHORIZATION, token))
                .andExpect(status().isCreated());

        // List next
        mockMvc.perform(get("/documents")
                        .header(HttpHeaders.AUTHORIZATION, token))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$", hasSize(1)))
                .andExpect(jsonPath("$[0].originalFilename", is("registrato.pdf")))
                .andExpect(jsonPath("$[0].status", is("UPLOADED")))
                .andExpect(jsonPath("$[0].uploadDate", notNullValue()));
    }

    @Test
    void shouldNotListOtherUsersDocuments() throws Exception {
        // Create another user
        User otherUser = User.builder()
                .name("Other User")
                .email("other@email.com")
                .password(passwordEncoder.encode("123456"))
                .createdAt(LocalDateTime.now())
                .updatedAt(LocalDateTime.now())
                .build();
        userRepository.saveAndFlush(otherUser);

        String otherToken = "Bearer " + jwtService.generateToken(otherUser.getId().toString(), otherUser.getEmail());

        MockMultipartFile file = new MockMultipartFile(
                "file",
                "registrato.pdf",
                MediaType.APPLICATION_PDF_VALUE,
                "dummy pdf content".getBytes()
        );

        // Upload as otherUser
        mockMvc.perform(multipart("/documents/upload")
                        .file(file)
                        .header(HttpHeaders.AUTHORIZATION, otherToken))
                .andExpect(status().isCreated());

        // List as testUser (should return 0 documents)
        mockMvc.perform(get("/documents")
                        .header(HttpHeaders.AUTHORIZATION, token))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$", hasSize(0)));
    }

    @Test
    void shouldBlockAnonymousUpload() throws Exception {
        MockMultipartFile file = new MockMultipartFile(
                "file",
                "registrato.pdf",
                MediaType.APPLICATION_PDF_VALUE,
                "dummy pdf content".getBytes()
        );

        mockMvc.perform(multipart("/documents/upload")
                        .file(file))
                .andExpect(status().isForbidden());
    }
}
