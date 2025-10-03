package com.quickbite.userservice.service;

import com.quickbite.userservice.dto.AddressDto;
import com.quickbite.userservice.dto.UserProfileDto;
import com.quickbite.userservice.entity.Address;
import com.quickbite.userservice.entity.UserProfile;
import com.quickbite.userservice.repository.AddressRepository;
import com.quickbite.userservice.repository.UserProfileRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.BeanUtils;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.stream.Collectors;

@Service
public class UserProfileService {

    private static final Logger log = LoggerFactory.getLogger(UserProfileService.class);

    @Autowired
    private UserProfileRepository userProfileRepository;

    @Autowired
    private AddressRepository addressRepository;

    @Transactional(readOnly = true)
    public UserProfileDto getUserProfileByUserId(Long userId) {
        UserProfile userProfile = userProfileRepository.findByUserId(userId)
                .orElseThrow(() -> new RuntimeException("User profile not found")); // Replace with custom exception
        return convertToDto(userProfile);
    }

    @Transactional
    public UserProfileDto createUserProfile(UserProfileDto userProfileDto) {
        if (userProfileRepository.findByUserId(userProfileDto.getUserId()).isPresent()) {
            throw new RuntimeException("User profile already exists");
        }
        UserProfile userProfile = convertToEntity(userProfileDto);
        UserProfile savedProfile = userProfileRepository.save(userProfile);
        log.info("Created user profile for userId: {}", savedProfile.getUserId());
        return convertToDto(savedProfile);
    }

    @Transactional
    public UserProfileDto updateUserProfile(Long userId, UserProfileDto userProfileDto) {
        UserProfile existingProfile = userProfileRepository.findByUserId(userId)
                .orElseThrow(() -> new RuntimeException("User profile not found"));

        existingProfile.setFirstName(userProfileDto.getFirstName());
        existingProfile.setLastName(userProfileDto.getLastName());
        existingProfile.setPhoneNumber(userProfileDto.getPhoneNumber());

        UserProfile updatedProfile = userProfileRepository.save(existingProfile);
        log.info("Updated user profile for userId: {}", updatedProfile.getUserId());
        return convertToDto(updatedProfile);
    }

    @Transactional
    public UserProfileDto updateUserLocation(Long userId, Double latitude, Double longitude) {
        UserProfile existingProfile = userProfileRepository.findByUserId(userId)
                .orElseThrow(() -> new RuntimeException("User profile not found"));

        if (latitude != null) {
            existingProfile.setCurrentLatitude(latitude);
        }
        if (longitude != null) {
            existingProfile.setCurrentLongitude(longitude);
        }

        UserProfile updated = userProfileRepository.save(existingProfile);
        log.info("Updated user current location for userId: {} -> {}, {}", userId, latitude, longitude);
        return convertToDto(updated);
    }

    @Transactional
    public AddressDto addAddress(Long userId, AddressDto addressDto) {
        UserProfile userProfile = userProfileRepository.findByUserId(userId)
                .orElseThrow(() -> new RuntimeException("User profile not found"));

        Address address = new Address();
        BeanUtils.copyProperties(addressDto, address);
        userProfile.getAddresses().add(address);

        userProfileRepository.save(userProfile);
        log.info("Added new address for userId: {}", userId);
        // The saved address will have an ID, find it to return
        Address savedAddress = userProfile.getAddresses().get(userProfile.getAddresses().size() - 1);
        return convertToDto(savedAddress);
    }

    @Transactional
    public AddressDto updateAddress(Long addressId, AddressDto addressDto) {
        Address existingAddress = addressRepository.findById(addressId)
                .orElseThrow(() -> new RuntimeException("Address not found"));

        BeanUtils.copyProperties(addressDto, existingAddress, "id");
        Address updatedAddress = addressRepository.save(existingAddress);
        log.info("Updated address with id: {}", addressId);
        return convertToDto(updatedAddress);
    }

    @Transactional
    public void deleteAddress(Long addressId) {
        if (!addressRepository.existsById(addressId)) {
            throw new RuntimeException("Address not found");
        }
        addressRepository.deleteById(addressId);
        log.info("Deleted address with id: {}", addressId);
    }


    // --- DTO Conversion Utilities ---

    private UserProfileDto convertToDto(UserProfile userProfile) {
        UserProfileDto dto = new UserProfileDto();
        BeanUtils.copyProperties(userProfile, dto);
        if (userProfile.getAddresses() != null) {
            dto.setAddresses(userProfile.getAddresses().stream().map(this::convertToDto).collect(Collectors.toList()));
        }
        return dto;
    }

    private AddressDto convertToDto(Address address) {
        AddressDto dto = new AddressDto();
        BeanUtils.copyProperties(address, dto);
        return dto;
    }

    private UserProfile convertToEntity(UserProfileDto dto) {
        UserProfile entity = new UserProfile();
        BeanUtils.copyProperties(dto, entity, "addresses");
        if (dto.getAddresses() != null) {
            entity.setAddresses(dto.getAddresses().stream().map(this::convertToEntity).collect(Collectors.toList()));
        }
        return entity;
    }

    private Address convertToEntity(AddressDto dto) {
        Address entity = new Address();
        BeanUtils.copyProperties(dto, entity);
        return entity;
    }
}