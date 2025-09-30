 package com.quickbite.controller;


import java.time.LocalDateTime;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.quickbite.dto.AuthResponse;
import com.quickbite.dto.ForgotPasswordRequest;
import com.quickbite.dto.LoginRequest;
import com.quickbite.dto.ResetRequest;
import com.quickbite.dto.UserRequestDto;
import com.quickbite.dto.UserResponseDto;
import com.quickbite.entity.PasswordResetToken;
import com.quickbite.entity.User;
import com.quickbite.repository.PasswordResetTokenRepository;
import com.quickbite.repository.UserRepository;
import com.quickbite.service.AuthService;

import jakarta.mail.MessagingException;
import jakarta.validation.Valid;


@RestController
@RequestMapping("/api/auth")
public class AuthController {
	
		@Autowired
		private AuthService authService;
		@Autowired
		private UserRepository userRepository;
	    @Autowired
	    private PasswordEncoder passwordEncoder;
	    @Autowired
	    private PasswordResetTokenRepository tokenRepository;
	    
	    
	    
	    @PostMapping("/signup")
	    public ResponseEntity<UserResponseDto> createUserHandler(@Valid @RequestBody UserRequestDto userRequest) {
	        UserResponseDto response = authService.register(userRequest);
	        return new ResponseEntity<>(response, HttpStatus.CREATED);
	    }
        

	@PostMapping("/signin")
	public ResponseEntity<AuthResponse> signin(@Valid @RequestBody LoginRequest loginRequest) {
		System.out.println("Received signin request: " + loginRequest);
	    try {
	        AuthResponse response = authService.login(loginRequest);
	        return new ResponseEntity<>(response, HttpStatus.OK);
	    } catch (BadCredentialsException ex) {
	        throw ex; // let GlobalExceptionHandler catch it
	    }
	}
	
	 @PostMapping("/forgot-password")
	    public ResponseEntity<String> forgotPassword(@RequestBody ForgotPasswordRequest request) throws MessagingException {
	        String result = authService.forgotPassword(request.getEmail());
	        return ResponseEntity.ok(result);
	    }

	  @PostMapping("/reset-password")
	    public ResponseEntity<String> resetPassword(@RequestBody ResetRequest request) {
	        String email = request.getEmail();
	        String otp = request.getOtp();
	        String newPassword = request.getNewPassword();

	        // Find the OTP in the DB
	        PasswordResetToken resetToken = tokenRepository.findByToken(otp).orElse(null);

	        if (resetToken == null || resetToken.getUser() == null) {
	            return ResponseEntity.badRequest().body("Invalid OTP.");
	        }

	        // Match the OTP with correct email
	        if (!resetToken.getUser().getEmail().equals(email)) {
	            return ResponseEntity.badRequest().body("OTP does not match this email.");
	        }

	        // Check expiry
	        if (resetToken.getExpiryDate().isBefore(LocalDateTime.now())) {
	            return ResponseEntity.badRequest().body("OTP has expired.");
	        }

	        //Reset password
	        User user = resetToken.getUser();
	        user.setPassword(passwordEncoder.encode(newPassword));
	        userRepository.save(user);
	        tokenRepository.save(resetToken);
	        // Invalidate used token
//	        tokenRepository.delete(resetToken);

	        return ResponseEntity.ok("Password reset successfully!");
	    }


   }
 
 

 
 
 
 
 
 
