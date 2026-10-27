package com.agriconnect.common.storage;

import java.io.IOException;
import java.io.InputStream;
import java.io.UncheckedIOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.Map;
import java.util.UUID;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import com.agriconnect.common.exception.BadRequestException;
import com.agriconnect.config.AppProperties;

/**
 * Stores uploaded images on the local filesystem under generated names.
 * Client-supplied file names are never used, which prevents path traversal
 * and overwriting other users' files.
 */
@Service
public class FileStorageService {

    private static final Logger log = LoggerFactory.getLogger(FileStorageService.class);

    private static final Map<String, String> ALLOWED_TYPES = Map.of(
            "image/jpeg", "jpg",
            "image/png", "png",
            "image/webp", "webp",
            "image/gif", "gif");

    private final Path root;

    public FileStorageService(AppProperties properties) {
        this.root = Paths.get(properties.storage().uploadDir()).toAbsolutePath().normalize();
        try {
            for (ImageFolder folder : ImageFolder.values()) {
                Files.createDirectories(root.resolve(folder.directory()));
            }
        } catch (IOException e) {
            throw new UncheckedIOException("Cannot create upload directory " + root, e);
        }
    }

    /** Stores the image and returns its generated file name, or {@code null} if no file was sent. */
    public String store(MultipartFile file, ImageFolder folder) {
        if (file == null || file.isEmpty()) {
            return null;
        }
        String extension = ALLOWED_TYPES.get(file.getContentType());
        if (extension == null) {
            throw new BadRequestException("Only JPEG, PNG, WEBP or GIF images are allowed");
        }
        String filename = UUID.randomUUID() + "." + extension;
        Path target = root.resolve(folder.directory()).resolve(filename).normalize();
        try (InputStream in = file.getInputStream()) {
            Files.copy(in, target);
        } catch (IOException e) {
            throw new UncheckedIOException("Failed to store uploaded file", e);
        }
        return filename;
    }

    /** Best-effort delete; a missing file is not an error. */
    public void delete(String filename, ImageFolder folder) {
        if (filename == null || filename.isBlank()) {
            return;
        }
        Path target = root.resolve(folder.directory()).resolve(filename).normalize();
        if (!target.startsWith(root)) {
            return;
        }
        try {
            Files.deleteIfExists(target);
        } catch (IOException e) {
            log.warn("Could not delete {}: {}", target, e.getMessage());
        }
    }
}
