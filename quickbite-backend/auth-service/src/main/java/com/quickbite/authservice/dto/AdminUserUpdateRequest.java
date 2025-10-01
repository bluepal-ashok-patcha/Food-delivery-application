package com.quickbite.authservice.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotEmpty;
import lombok.Data;

@Data
public class AdminUserUpdateRequest {
    private String name;
    @Email
    private String email;
    private String phone;
    private String role; // CUSTOMER, ADMIN, RESTAURANT_OWNER, DELIVERY_PARTNER
    private Boolean active;
}


