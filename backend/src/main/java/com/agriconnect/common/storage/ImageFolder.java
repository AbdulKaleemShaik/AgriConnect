package com.agriconnect.common.storage;

public enum ImageFolder {
    PRODUCTS("products"),
    PROFILES("profiles");

    private final String directory;

    ImageFolder(String directory) {
        this.directory = directory;
    }

    public String directory() {
        return directory;
    }

    /** Public, relative URL of a stored file, or {@code null} when there is no file. */
    public String urlFor(String filename) {
        return filename == null ? null : "/images/" + directory + "/" + filename;
    }
}
