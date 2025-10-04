package com.quickbite.userservice.controller;

import com.quickbite.userservice.dto.AddressDto;
import com.quickbite.userservice.dto.ApiResponse;
import com.quickbite.userservice.dto.UserProfileDto;
import com.quickbite.userservice.service.UserProfileService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import jakarta.servlet.http.HttpServletRequest;
import com.quickbite.userservice.util.JwtUtil;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/users")
public class UserProfileController {

    @Autowired
    private UserProfileService userProfileService;

    @Autowired
    private JwtUtil jwtUtil;

    @PostMapping("/profile")
    public ResponseEntity<ApiResponse<UserProfileDto>> createUserProfile(@Valid @RequestBody UserProfileDto userProfileDto, HttpServletRequest request) {
        Long userId = extractUserId(request);
        userProfileDto.setUserId(userId); // Set userId from the authenticated token
        UserProfileDto createdProfile = userProfileService.createUserProfile(userProfileDto);
        ApiResponse<UserProfileDto> body = ApiResponse.<UserProfileDto>builder()
                .success(true)
                .message("User profile created successfully")
                .data(createdProfile)
                .build();
        return new ResponseEntity<>(body, HttpStatus.CREATED);
    }

    @GetMapping("/profile")
    public ResponseEntity<ApiResponse<UserProfileDto>> getUserProfile(HttpServletRequest request) {
        Long userId = extractUserId(request);
        UserProfileDto userProfileDto = userProfileService.getUserProfileByUserId(userId);
        ApiResponse<UserProfileDto> body = ApiResponse.<UserProfileDto>builder()
                .success(true)
                .message("User profile fetched successfully")
                .data(userProfileDto)
                .build();
        return ResponseEntity.ok(body);
    }

    @PutMapping("/profile")
    public ResponseEntity<ApiResponse<UserProfileDto>> updateUserProfile(@Valid @RequestBody UserProfileDto userProfileDto, HttpServletRequest request) {
        Long userId = extractUserId(request);
        UserProfileDto updatedProfile = userProfileService.updateUserProfile(userId, userProfileDto);
        ApiResponse<UserProfileDto> body = ApiResponse.<UserProfileDto>builder()
                .success(true)
                .message("User profile updated successfully")
                .data(updatedProfile)
                .build();
        return ResponseEntity.ok(body);
    }

    @GetMapping("/location")
    public ResponseEntity<ApiResponse<UserProfileDto>> getCurrentLocation(HttpServletRequest request) {
        Long userId = extractUserId(request);
        UserProfileDto userProfileDto = userProfileService.getUserProfileByUserId(userId);
        ApiResponse<UserProfileDto> body = ApiResponse.<UserProfileDto>builder()
                .success(true)
                .message("User location fetched successfully")
                .data(userProfileDto)
                .build();
        return ResponseEntity.ok(body);
    }

    @PutMapping("/location")
    public ResponseEntity<ApiResponse<UserProfileDto>> updateCurrentLocation(@RequestBody UserProfileDto userProfileDto, HttpServletRequest request) {
        Long userId = extractUserId(request);
        // Only latitude/longitude are relevant here; service will persist them
        UserProfileDto updated = userProfileService.updateUserLocation(userId, userProfileDto.getCurrentLatitude(), userProfileDto.getCurrentLongitude());
        ApiResponse<UserProfileDto> body = ApiResponse.<UserProfileDto>builder()
                .success(true)
                .message("User location updated successfully")
                .data(updated)
                .build();
        return ResponseEntity.ok(body);
    }

    @PostMapping("/addresses")
    public ResponseEntity<ApiResponse<AddressDto>> addAddress(@Valid @RequestBody AddressDto addressDto, HttpServletRequest request) {
        Long userId = extractUserId(request);
        AddressDto newAddress = userProfileService.addAddress(userId, addressDto);
        ApiResponse<AddressDto> body = ApiResponse.<AddressDto>builder()
                .success(true)
                .message("Address created successfully")
                .data(newAddress)
                .build();
        return new ResponseEntity<>(body, HttpStatus.CREATED);
    }

    @PutMapping("/addresses/{addressId}")
    public ResponseEntity<ApiResponse<AddressDto>> updateAddress(@PathVariable Long addressId, @Valid @RequestBody AddressDto addressDto) {
        AddressDto updatedAddress = userProfileService.updateAddress(addressId, addressDto);
        ApiResponse<AddressDto> body = ApiResponse.<AddressDto>builder()
                .success(true)
                .message("Address updated successfully")
                .data(updatedAddress)
                .build();
        return ResponseEntity.ok(body);
    }

    @DeleteMapping("/addresses/{addressId}")
    public ResponseEntity<ApiResponse<Void>> deleteAddress(@PathVariable Long addressId) {
        userProfileService.deleteAddress(addressId);
        return ResponseEntity.ok(ApiResponse.<Void>builder()
                .success(true)
                .message("Address deleted successfully")
                .data(null)
                .build());
    }

    private Long extractUserId(HttpServletRequest request) {
        String auth = request.getHeader("Authorization");
        if (auth != null && auth.startsWith("Bearer ")) {
            String token = auth.substring(7);
            try {
                return jwtUtil.getAllClaimsFromToken(token).get("userId", Long.class);
            } catch (Exception ignored) {}
        }
        throw new RuntimeException("Unauthorized");
    }
}