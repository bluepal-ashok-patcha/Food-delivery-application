package com.quickbite.authservice.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;
import lombok.Data;

@Data
public class UserRegistrationRequestDto {

    @NotEmpty(message = "Name cannot be empty")
    @Size(min = 2, message = "Name must be at least 2 characters long")
    private String name;

    @NotEmpty(message = "Email cannot be empty")
    @Email(message = "Invalid email format")
    private String email;

    @NotEmpty(message = "Password cannot be empty")
    @Size(min = 6, message = "Password must be at least 6 characters long")
    private String password;

    @NotEmpty(message = "Phone number cannot be empty")
    @Pattern(regexp = "^\\+?[\\d\\s-()]+$", message = "Invalid phone number")
    private String phone;
}