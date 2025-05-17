package com.boulevardsecurity.securitymanagementapp.storage;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.util.StringUtils;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.nio.file.*;

@Service
public class FileStorageService {

    private Path rootDir;

    public FileStorageService(@Value("${file.storage.location}") String storageLocation) {
        try {
            this.rootDir = Paths.get(storageLocation).toAbsolutePath().normalize();
            Files.createDirectories(rootDir);
        } catch (IOException e) {
            throw new RuntimeException("Impossible de créer le dossier de stockage", e);
        }
    }

    public String store(MultipartFile file, String baseName) throws IOException {
        String ext = StringUtils.getFilenameExtension(file.getOriginalFilename());
        String filename = baseName + "-" + System.currentTimeMillis() + "." + ext;
        Path target = this.rootDir.resolve(filename);
        Files.copy(file.getInputStream(), target, StandardCopyOption.REPLACE_EXISTING);
        return target.toString();
    }
}
