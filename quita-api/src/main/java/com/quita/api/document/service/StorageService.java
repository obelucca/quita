package com.quita.api.document.service;

import org.springframework.web.multipart.MultipartFile;
import java.io.IOException;

public interface StorageService {
    String store(MultipartFile file, String storedFilename) throws IOException;
}
