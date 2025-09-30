package com.quickbite.exception;


public class EmailAlreadyExistsException extends RuntimeException {

    // Default constructor
    public EmailAlreadyExistsException() {
        super("Email already exists.");
    }

    // Constructor with custom message
    public EmailAlreadyExistsException(String message) {
        super(message);
    }
}
