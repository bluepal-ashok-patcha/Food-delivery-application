package com.quickbite.authservice.controller;

import com.quickbite.authservice.dto.AuthResponseDto;
import com.quickbite.authservice.dto.UserLoginRequestDto;
import com.quickbite.authservice.dto.UserRegistrationRequestDto;
import com.quickbite.authservice.service.AuthService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/auth")
public class AuthController {

    @Autowired
    private AuthService authService;

    @PostMapping("/register")
    public ResponseEntity<AuthResponseDto> registerUser(@Valid @RequestBody UserRegistrationRequestDto requestDto) {
        AuthResponseDto response = authService.registerUser(requestDto);
        return new ResponseEntity<>(response, HttpStatus.CREATED);
    }

    @PostMapping("/login")
    public ResponseEntity<AuthResponseDto> loginUser(@Valid @RequestBody UserLoginRequestDto requestDto) {
        AuthResponseDto response = authService.loginUser(requestDto);
        return new ResponseEntity<>(response, HttpStatus.OK);
    }
}