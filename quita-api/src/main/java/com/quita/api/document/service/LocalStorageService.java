package com.quita.api.document.service;

import com.quita.api.config.StorageProperties;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;
import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;

@Service
@RequiredArgsConstructor
public class LocalStorageService implements StorageService {

    private final StorageProperties storageProperties;

    @Override
    public String store(MultipartFile file, String storedFilename) throws IOException {
        Path uploadPath = Paths.get(storageProperties.getUploadDir()).toAbsolutePath().normalize();
        if (!Files.exists(uploadPath)) {
            Files.createDirectories(uploadPath);
        }
        Path targetLocation = uploadPath.resolve(storedFilename);
        Files.copy(file.getInputStream(), targetLocation, StandardCopyOption.REPLACE_EXISTING);
        return targetLocation.toString();
    }
}
