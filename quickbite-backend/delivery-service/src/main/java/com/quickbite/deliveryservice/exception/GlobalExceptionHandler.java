package com.quickbite.deliveryservice.exception;

import com.quickbite.deliveryservice.dto.ApiResponse;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.dao.EmptyResultDataAccessException;

@RestControllerAdvice
public class GlobalExceptionHandler {

    private static final Logger log = LoggerFactory.getLogger(GlobalExceptionHandler.class);

    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ResponseEntity<ApiResponse<Void>> handleValidationException(MethodArgumentNotValidException ex) {
        String message = ex.getBindingResult().getAllErrors().stream()
                .findFirst()
                .map(err -> err.getDefaultMessage())
                .orElse("Validation error");
        
        log.warn("Validation error: {}", message);
        
        ApiResponse<Void> response = ApiResponse.<Void>builder()
                .success(false)
                .message(message)
                .data(null)
                .build();
        
        return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(response);
    }

    @ExceptionHandler(IllegalArgumentException.class)
    public ResponseEntity<ApiResponse<Void>> handleIllegalArgument(IllegalArgumentException ex) {
        log.warn("Illegal argument: {}", ex.getMessage());
        
        ApiResponse<Void> response = ApiResponse.<Void>builder()
                .success(false)
                .message(ex.getMessage())
                .data(null)
                .build();
        
        return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(response);
    }

    @ExceptionHandler(RuntimeException.class)
    public ResponseEntity<ApiResponse<Void>> handleRuntimeException(RuntimeException ex) {
        log.error("Runtime exception: {}", ex.getMessage(), ex);
        
        // Determine appropriate HTTP status based on message content
        HttpStatus status = HttpStatus.INTERNAL_SERVER_ERROR;
        String message = ex.getMessage();
        
        if (message != null) {
            if (message.contains("not found") || message.contains("does not exist")) {
                status = HttpStatus.NOT_FOUND;
            } else if (message.contains("Forbidden") || message.contains("Unauthorized") || 
                      message.contains("not belong to current user")) {
                status = HttpStatus.FORBIDDEN;
            } else if (message.contains("already exists") || message.contains("already assigned") ||
                      message.contains("already reviewed")) {
                status = HttpStatus.CONFLICT;
            } else if (message.contains("Invalid") || message.contains("required")) {
                status = HttpStatus.BAD_REQUEST;
            }
        }
        
        ApiResponse<Void> response = ApiResponse.<Void>builder()
                .success(false)
                .message(message != null ? message : "An error occurred")
                .data(null)
                .build();
        
        return ResponseEntity.status(status).body(response);
    }

    @ExceptionHandler(DataIntegrityViolationException.class)
    public ResponseEntity<ApiResponse<Void>> handleDataIntegrityViolation(DataIntegrityViolationException ex) {
        log.error("Data integrity violation: {}", ex.getMessage(), ex);
        
        String message = "Data integrity constraint violation";
        if (ex.getMessage() != null) {
            if (ex.getMessage().contains("Duplicate entry")) {
                message = "Resource already exists";
            } else if (ex.getMessage().contains("foreign key constraint")) {
                message = "Cannot delete resource due to existing references";
            }
        }
        
        ApiResponse<Void> response = ApiResponse.<Void>builder()
                .success(false)
                .message(message)
                .data(null)
                .build();
        
        return ResponseEntity.status(HttpStatus.CONFLICT).body(response);
    }

    @ExceptionHandler(EmptyResultDataAccessException.class)
    public ResponseEntity<ApiResponse<Void>> handleEmptyResult(EmptyResultDataAccessException ex) {
        log.warn("Resource not found: {}", ex.getMessage());
        
        ApiResponse<Void> response = ApiResponse.<Void>builder()
                .success(false)
                .message("Resource not found")
                .data(null)
                .build();
        
        return ResponseEntity.status(HttpStatus.NOT_FOUND).body(response);
    }

    @ExceptionHandler(Exception.class)
    public ResponseEntity<ApiResponse<Void>> handleGeneric(Exception ex) {
        log.error("Unhandled exception", ex);
        
        ApiResponse<Void> response = ApiResponse.<Void>builder()
                .success(false)
                .message("Internal server error")
                .data(null)
                .build();
        
        return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(response);
    }
}


