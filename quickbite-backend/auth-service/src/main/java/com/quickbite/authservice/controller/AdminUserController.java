//package com.quickbite.authservice.controller;
//
//import java.util.List;
//
//import org.springframework.beans.factory.annotation.Autowired;
//import org.springframework.http.ResponseEntity;
//import org.springframework.security.access.prepost.PreAuthorize;
//import org.springframework.web.bind.annotation.GetMapping;
//import org.springframework.web.bind.annotation.PathVariable;
//import org.springframework.web.bind.annotation.PostMapping;
//import org.springframework.web.bind.annotation.PutMapping;
//import org.springframework.web.bind.annotation.RequestBody;
//import org.springframework.web.bind.annotation.RequestMapping;
//import org.springframework.web.bind.annotation.RequestParam;
//import org.springframework.web.bind.annotation.RestController;
//import org.springframework.web.multipart.MultipartFile;
//
//import com.quickbite.authservice.dto.AdminUserUpdateRequest;
//import com.quickbite.authservice.dto.ApiResponse;
//import com.quickbite.authservice.dto.UserRegistrationRequestDto;
//import com.quickbite.authservice.entity.User;
//import com.quickbite.authservice.service.AuthService;
//
//import jakarta.validation.Valid;
//
//@RestController
//@RequestMapping("/admin/users")
//public class AdminUserController {
//
//   
//    @Autowired
//    private AuthService authService;
//    
//       
//    // List all users
//    @GetMapping
//    @PreAuthorize("hasRole('ADMIN')")
//    public ResponseEntity<ApiResponse<List<User>>> listUsers() {
//        return authService.listUsers();
//    }
//
//    // Create a new user
//    @PostMapping
//    @PreAuthorize("hasRole('ADMIN')")
//    public ResponseEntity<ApiResponse<User>> createUser(
//            @Valid @RequestBody UserRegistrationRequestDto request,
//            @RequestParam(defaultValue = "CUSTOMER") String role) {
//        return authService.createUser(request, role);
//    }
//
//    // Update a user
//    @PutMapping("/{id}")
//    @PreAuthorize("hasRole('ADMIN')")
//    public ResponseEntity<ApiResponse<User>> updateUser(
//            @PathVariable Long id,
//            @Valid @RequestBody AdminUserUpdateRequest request) {
//        return authService.updateUser(id, request);
//    }
//
//    // Activate a user
//    @PutMapping("/{id}/activate")
//    @PreAuthorize("hasRole('ADMIN')")
//    public ResponseEntity<ApiResponse<User>> activateUser(@PathVariable Long id) {
//        return authService.activateUser(id);
//    }
//
//    // Deactivate a user
//    @PutMapping("/{id}/deactivate")
//    @PreAuthorize("hasRole('ADMIN')")
//    public ResponseEntity<ApiResponse<User>> deactivateUser(@PathVariable Long id) {
//        return authService.deactivateUser(id);
//    }
//
//    
//    // Import users from Excel
//    @PostMapping("/import")
//    @PreAuthorize("hasRole('ADMIN')")
//    public ResponseEntity<ApiResponse<String>> importUsers(@RequestParam("file") MultipartFile file) {
//        return authService.importUsers(file);
//    }
//
//    // Export all users to PDF (grouped by role)
//    @GetMapping("/export/pdf")
//    @PreAuthorize("hasRole('ADMIN')")
//    public ResponseEntity<byte[]> exportUsersToPdf() {
//        return authService.exportAllUsersToPdf();
//    }
//
//    // Export users by specific role
//    @GetMapping("/export/pdf/{role}")
//    @PreAuthorize("hasRole('ADMIN')")
//    public ResponseEntity<byte[]> exportUsersByRole(@PathVariable String role) {
//        return authService.exportUsersByRole(role);
//    }
//}

package com.quickbite.authservice.controller;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

import com.quickbite.authservice.dto.AdminUserUpdateRequest;
import com.quickbite.authservice.dto.ApiResponse;
import com.quickbite.authservice.dto.UserRegistrationRequestDto;
import com.quickbite.authservice.entity.User;
import com.quickbite.authservice.service.AuthService;

import jakarta.validation.Valid;

@RestController
@RequestMapping("/admin/users")
public class AdminUserController {

    @Autowired
    private AuthService authService;

    // List all users
    @GetMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<List<User>>> listUsers() {
        return authService.listUsers();
    }

    // Create a new user
    @PostMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<User>> createUser(
            @Valid @RequestBody UserRegistrationRequestDto request,
            @RequestParam(defaultValue = "CUSTOMER") String role) {
        return authService.createUser(request, role);
    }

    // Update a user
    @PutMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<User>> updateUser(
            @PathVariable Long id,
            @Valid @RequestBody AdminUserUpdateRequest request) {
        return authService.updateUser(id, request);
    }

    // Activate a user
    @PutMapping("/{id}/activate")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<User>> activateUser(@PathVariable Long id) {
        return authService.activateUser(id);
    }

    // Deactivate a user
    @PutMapping("/{id}/deactivate")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<User>> deactivateUser(@PathVariable Long id) {
        return authService.deactivateUser(id);
    }

    // Import users from Excel
    @PostMapping("/import")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<String>> importUsers(@RequestParam("file") MultipartFile file) {
        return authService.importUsers(file);
    }

    // Export all users to PDF (grouped by role)
    @GetMapping("/export/pdf")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<byte[]> exportUsersToPdf() {
        return authService.exportAllUsersToPdf();
    }

    // Export users by specific role to PDF
    @GetMapping("/export/pdf/{role}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<byte[]> exportUsersByRole(@PathVariable String role) {
        return authService.exportUsersByRole(role);
    }

    // Export all users to Excel (grouped by role)
    @GetMapping("/export/excel")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<byte[]> exportUsersToExcel() {
        return authService.exportAllUsersToExcel();
    }

    // Export users by specific role to Excel
    @GetMapping("/export/excel/{role}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<byte[]> exportUsersByRoleToExcel(@PathVariable String role) {
        return authService.exportUsersByRoleToExcel(role);
    }
    
    
}
