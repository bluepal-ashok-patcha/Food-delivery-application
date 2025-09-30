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

    @PostMapping("/profile")
    public ResponseEntity<UserProfileDto> createUserProfile(@Valid @RequestBody UserProfileDto userProfileDto) {
        UserProfileDto createdProfile = userProfileService.createUserProfile(userProfileDto);
        return new ResponseEntity<>(createdProfile, HttpStatus.CREATED);
    }

    @GetMapping("/{userId}/profile")
    public ResponseEntity<UserProfileDto> getUserProfile(@PathVariable Long userId) {
        UserProfileDto userProfileDto = userProfileService.getUserProfileByUserId(userId);
        return ResponseEntity.ok(userProfileDto);
    }

    @PutMapping("/{userId}/profile")
    public ResponseEntity<UserProfileDto> updateUserProfile(@PathVariable Long userId, @Valid @RequestBody UserProfileDto userProfileDto) {
        UserProfileDto updatedProfile = userProfileService.updateUserProfile(userId, userProfileDto);
        return ResponseEntity.ok(updatedProfile);
    }

    @PostMapping("/{userId}/addresses")
    public ResponseEntity<AddressDto> addAddress(@PathVariable Long userId, @Valid @RequestBody AddressDto addressDto) {
        AddressDto newAddress = userProfileService.addAddress(userId, addressDto);
        return new ResponseEntity<>(newAddress, HttpStatus.CREATED);
    }

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