package com.quickbite.deliveryservice.controller;

import com.quickbite.deliveryservice.dto.DeliveryPartnerDto;
import com.quickbite.deliveryservice.dto.LocationUpdateDto;
import com.quickbite.deliveryservice.entity.DeliveryPartnerStatus;
import com.quickbite.deliveryservice.service.DeliveryService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/delivery")
public class DeliveryController {

    @Autowired
    private DeliveryService deliveryService;

    @PostMapping("/partners")
    public ResponseEntity<DeliveryPartnerDto> createDeliveryPartner(@Valid @RequestBody DeliveryPartnerDto partnerDto, Authentication authentication) {
        Long userId = (Long) authentication.getPrincipal();
        partnerDto.setUserId(userId); // Set userId from authenticated token
        DeliveryPartnerDto createdPartner = deliveryService.createDeliveryPartner(partnerDto);
        return new ResponseEntity<>(createdPartner, HttpStatus.CREATED);
    }

    @GetMapping("/partners/profile")
    public ResponseEntity<DeliveryPartnerDto> getDeliveryPartner(Authentication authentication) {
        Long userId = (Long) authentication.getPrincipal();
        DeliveryPartnerDto partner = deliveryService.getDeliveryPartnerByUserId(userId);
        return ResponseEntity.ok(partner);
    }

    @PutMapping("/partners/status")
    public ResponseEntity<DeliveryPartnerDto> updatePartnerStatus(@RequestParam DeliveryPartnerStatus status, Authentication authentication) {
        Long userId = (Long) authentication.getPrincipal();
        DeliveryPartnerDto updatedPartner = deliveryService.updateDeliveryPartnerStatus(userId, status);
        return ResponseEntity.ok(updatedPartner);
    }

    @PutMapping("/partners/location")
    public ResponseEntity<Void> updatePartnerLocation(@Valid @RequestBody LocationUpdateDto locationDto, Authentication authentication) {
        Long userId = (Long) authentication.getPrincipal();
        deliveryService.updateDeliveryPartnerLocation(userId, locationDto);
        return ResponseEntity.ok().build();
    }

    @GetMapping("/partners/available")
    public ResponseEntity<List<DeliveryPartnerDto>> getAvailablePartners() {
        List<DeliveryPartnerDto> partners = deliveryService.findAvailablePartners();
        return ResponseEntity.ok(partners);
    }
}