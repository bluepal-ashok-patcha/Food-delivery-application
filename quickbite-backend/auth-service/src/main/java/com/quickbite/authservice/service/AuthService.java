package com.quickbite.authservice.service;

import com.quickbite.authservice.dto.AuthResponseDto;
import com.quickbite.authservice.dto.UserDto;
import com.quickbite.authservice.exception.DuplicateEmailException;
import com.quickbite.authservice.dto.UserLoginRequestDto;
import com.quickbite.authservice.dto.UserRegistrationRequestDto;
import com.quickbite.authservice.entity.User;
import com.quickbite.authservice.repository.UserRepository;
import com.quickbite.authservice.util.JwtUtil;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

@Service
public class AuthService {

    private static final Logger log = LoggerFactory.getLogger(AuthService.class);

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Autowired
    private JwtUtil jwtUtil;

    @Autowired
    private AuthenticationManager authenticationManager;

    public AuthResponseDto registerUser(UserRegistrationRequestDto requestDto) {
        if (userRepository.findByEmail(requestDto.getEmail()).isPresent()) {
            log.warn("Registration attempt with existing email: {}", requestDto.getEmail());
            throw new DuplicateEmailException("User with this email already exists");
        }

        User user = User.builder()
                .email(requestDto.getEmail())
                .password(passwordEncoder.encode(requestDto.getPassword()))
                .role("CUSTOMER")
                .name(requestDto.getName())
                .phone(requestDto.getPhone())
                .build();

        User savedUser = userRepository.save(user);
        log.info("User registered successfully: {}", savedUser.getEmail());

        String token = jwtUtil.generateToken(savedUser.getId(), savedUser.getEmail(), savedUser.getRole());
        UserDto userDto = UserDto.builder()
                .id(savedUser.getId())
                .email(savedUser.getEmail())
                .role(savedUser.getRole())
                .name(savedUser.getName())
                .phone(savedUser.getPhone())
                .build();
        return AuthResponseDto.builder()
                .token(token)
                .message("User registered successfully")
                .user(userDto)
                .build();
    }

    public AuthResponseDto loginUser(UserLoginRequestDto requestDto) {
        Authentication authentication = authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(requestDto.getEmail(), requestDto.getPassword())
        );

        SecurityContextHolder.getContext().setAuthentication(authentication);

        User user = userRepository.findByEmail(requestDto.getEmail()).orElseThrow(() -> new RuntimeException("User not found"));
        log.info("User logged in successfully: {}", user.getEmail());

        String token = jwtUtil.generateToken(user.getId(), user.getEmail(), user.getRole());
        UserDto userDto = UserDto.builder()
                .id(user.getId())
                .email(user.getEmail())
                .role(user.getRole())
                .name(user.getName())
                .phone(user.getPhone())
                .build();
        return AuthResponseDto.builder()
                .token(token)
                .message("User logged in successfully")
                .user(userDto)
                .build();
    }
}