package com.agriconnect.common.exception;

import java.time.Instant;
import java.util.List;

import com.fasterxml.jackson.annotation.JsonInclude;

/** Error body returned by every failing endpoint. */
@JsonInclude(JsonInclude.Include.NON_EMPTY)
public record ApiError(
        Instant timestamp,
        int status,
        String error,
        String message,
        String path,
        List<FieldViolation> fieldErrors) {

    public record FieldViolation(String field, String message) {
    }
}
