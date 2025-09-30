package com.quickbite.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class AuthResponse {
	
	 private String jwt;
	 private String message;
	 private Boolean status;
	 private String role;
}

