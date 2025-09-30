package com.quickbite.deliveryservice.controller;

import com.quickbite.deliveryservice.dto.DeliveryPartnerDto;
import com.quickbite.deliveryservice.dto.LocationUpdateDto;
import com.quickbite.deliveryservice.entity.DeliveryPartnerStatus;
import com.quickbite.deliveryservice.service.DeliveryService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/delivery")
public class DeliveryController {

    @Autowired
    private DeliveryService deliveryService;

    @PostMapping("/partners")
    public ResponseEntity<DeliveryPartnerDto> createDeliveryPartner(@Valid @RequestBody DeliveryPartnerDto partnerDto) {
        DeliveryPartnerDto createdPartner = deliveryService.createDeliveryPartner(partnerDto);
        return new ResponseEntity<>(createdPartner, HttpStatus.CREATED);
    }

    @GetMapping("/partners/{userId}")
    public ResponseEntity<DeliveryPartnerDto> getDeliveryPartner(@PathVariable Long userId) {
        DeliveryPartnerDto partner = deliveryService.getDeliveryPartnerByUserId(userId);
        return ResponseEntity.ok(partner);
    }

    @PutMapping("/partners/{userId}/status")
    public ResponseEntity<DeliveryPartnerDto> updatePartnerStatus(@PathVariable Long userId, @RequestParam DeliveryPartnerStatus status) {
        DeliveryPartnerDto updatedPartner = deliveryService.updateDeliveryPartnerStatus(userId, status);
        return ResponseEntity.ok(updatedPartner);
    }

    @PutMapping("/partners/{userId}/location")
    public ResponseEntity<Void> updatePartnerLocation(@PathVariable Long userId, @Valid @RequestBody LocationUpdateDto locationDto) {
        deliveryService.updateDeliveryPartnerLocation(userId, locationDto);
        return ResponseEntity.ok().build();
    }

    @GetMapping("/partners/available")
    public ResponseEntity<List<DeliveryPartnerDto>> getAvailablePartners() {
        List<DeliveryPartnerDto> partners = deliveryService.findAvailablePartners();
        return ResponseEntity.ok(partners);
    }
}