package com.quickbite.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class ResetRequest {
	
	private String email;
	private String otp;
	private String newPassword;

}