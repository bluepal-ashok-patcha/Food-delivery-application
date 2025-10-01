package com.quickbite.authservice.controller;

import com.quickbite.authservice.dto.AdminUserUpdateRequest;
import com.quickbite.authservice.dto.ApiResponse;
import com.quickbite.authservice.dto.UserRegistrationRequestDto;
import com.quickbite.authservice.entity.User;
import com.quickbite.authservice.repository.UserRepository;
import org.springframework.security.crypto.password.PasswordEncoder;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/admin/users")
public class AdminUserController {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @GetMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<List<User>>> listUsers() {
        List<User> users = userRepository.findAll();
        return ResponseEntity.ok(ApiResponse.<List<User>>builder()
            .success(true)
            .message("Users fetched successfully")
            .data(users)
            .build());
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<User>> updateUser(@PathVariable Long id, @Valid @RequestBody AdminUserUpdateRequest req) {
        User user = userRepository.findById(id).orElseThrow(() -> new RuntimeException("User not found"));
        if (req.getName() != null) user.setName(req.getName());
        if (req.getEmail() != null) user.setEmail(req.getEmail());
        if (req.getPhone() != null) user.setPhone(req.getPhone());
        if (req.getRole() != null) user.setRole(req.getRole());
        if (req.getActive() != null) user.setActive(req.getActive());
        User saved = userRepository.save(user);
        return ResponseEntity.ok(ApiResponse.<User>builder()
            .success(true)
            .message("User updated successfully")
            .data(saved)
            .build());
    }

    @PostMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<User>> createUser(@Valid @RequestBody UserRegistrationRequestDto req, @RequestParam(defaultValue = "CUSTOMER") String role) {
        if (userRepository.findByEmail(req.getEmail()).isPresent()) {
            return new ResponseEntity<>(ApiResponse.<User>builder()
                .success(false)
                .message("User with this email already exists")
                .data(null)
                .build(), HttpStatus.CONFLICT);
        }
        User user = User.builder()
            .email(req.getEmail())
            .password(passwordEncoder.encode(req.getPassword()))
            .role(role)
            .name(req.getName())
            .phone(req.getPhone())
            .active(true)
            .build();
        User saved = userRepository.save(user);
        return new ResponseEntity<>(ApiResponse.<User>builder()
            .success(true)
            .message("User created successfully")
            .data(saved)
            .build(), HttpStatus.CREATED);
    }

    @PutMapping("/{id}/activate")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<User>> activate(@PathVariable Long id) {
        User user = userRepository.findById(id).orElseThrow(() -> new RuntimeException("User not found"));
        user.setActive(true);
        return new ResponseEntity<>(ApiResponse.<User>builder()
            .success(true)
            .message("User activated")
            .data(userRepository.save(user))
            .build(), HttpStatus.OK);
    }

    @PutMapping("/{id}/deactivate")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<User>> deactivate(@PathVariable Long id) {
        User user = userRepository.findById(id).orElseThrow(() -> new RuntimeException("User not found"));
        user.setActive(false);
        return new ResponseEntity<>(ApiResponse.<User>builder()
            .success(true)
            .message("User deactivated")
            .data(userRepository.save(user))
            .build(), HttpStatus.OK);
    }
}


