package com.quickbite.userservice.controller;

import com.quickbite.userservice.dto.AddressDto;
import com.quickbite.userservice.dto.ApiResponse;
import com.quickbite.userservice.dto.UserProfileDto;
import com.quickbite.userservice.service.UserProfileService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/users")
public class UserProfileController {

    @Autowired
    private UserProfileService userProfileService;

    // The userId for creation will be passed in the DTO from the gateway
    @PostMapping("/profile")
    public ResponseEntity<UserProfileDto> createUserProfile(@Valid @RequestBody UserProfileDto userProfileDto) {
        UserProfileDto createdProfile = userProfileService.createUserProfile(userProfileDto);
        return new ResponseEntity<>(createdProfile, HttpStatus.CREATED);
    }

    // The userId is now read from a header, which the API Gateway will add after validating the JWT
    @GetMapping("/profile")
    public ResponseEntity<UserProfileDto> getUserProfile(@RequestHeader("X-User-Id") Long userId) {
        UserProfileDto userProfileDto = userProfileService.getUserProfileByUserId(userId);
        return ResponseEntity.ok(userProfileDto);
    }

    @PutMapping("/profile")
    public ResponseEntity<UserProfileDto> updateUserProfile(@RequestHeader("X-User-Id") Long userId, @Valid @RequestBody UserProfileDto userProfileDto) {
        UserProfileDto updatedProfile = userProfileService.updateUserProfile(userId, userProfileDto);
        return ResponseEntity.ok(updatedProfile);
    }

    @PostMapping("/addresses")
    public ResponseEntity<AddressDto> addAddress(@RequestHeader("X-User-Id") Long userId, @Valid @RequestBody AddressDto addressDto) {
        AddressDto newAddress = userProfileService.addAddress(userId, addressDto);
        return new ResponseEntity<>(newAddress, HttpStatus.CREATED);
    }

    // Address ID is still in the path as it's a specific resource identifier
    @PutMapping("/addresses/{addressId}")
    public ResponseEntity<AddressDto> updateAddress(@PathVariable Long addressId, @Valid @RequestBody AddressDto addressDto) {
        AddressDto updatedAddress = userProfileService.updateAddress(addressId, addressDto);
        return ResponseEntity.ok(updatedAddress);
    }

    @DeleteMapping("/addresses/{addressId}")
    public ResponseEntity<ApiResponse> deleteAddress(@PathVariable Long addressId) {
        userProfileService.deleteAddress(addressId);
        return ResponseEntity.ok(new ApiResponse("Address deleted successfully", true));
    }
}