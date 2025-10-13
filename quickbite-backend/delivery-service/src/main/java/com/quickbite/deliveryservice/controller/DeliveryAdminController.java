package com.quickbite.deliveryservice.controller;

import com.quickbite.deliveryservice.dto.ApiResponse;
import com.quickbite.deliveryservice.dto.DeliveryPartnerDto;
import com.quickbite.deliveryservice.entity.DeliveryPartner;
import com.quickbite.deliveryservice.entity.DeliveryPartnerStatus;
import com.quickbite.deliveryservice.repository.CrossServiceJdbcRepository;
import com.quickbite.deliveryservice.repository.DeliveryPartnerRepository;
import org.springframework.beans.BeanUtils;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/delivery/admin")
public class DeliveryAdminController {

    @Autowired
    private DeliveryPartnerRepository deliveryPartnerRepository;

    @Autowired
    private CrossServiceJdbcRepository crossServiceJdbcRepository;

    @GetMapping("/pending")
    public ResponseEntity<ApiResponse<List<DeliveryPartnerDto>>> listPendingPartners() {
        List<DeliveryPartner> partners = deliveryPartnerRepository.findAll();
        List<DeliveryPartnerDto> pending = partners.stream().filter(p -> {
            Map<String, Object> auth = crossServiceJdbcRepository.findAuthUserById(p.getUserId());
            String role = auth != null ? (String) auth.get("role") : null;
            // Pending ONLY if auth role is still CUSTOMER (self-registered) or auth record missing
            return role == null || "CUSTOMER".equals(role);
        }).map(p -> {
            DeliveryPartnerDto dto = new DeliveryPartnerDto();
            BeanUtils.copyProperties(p, dto);
            return dto;
        }).collect(Collectors.toList());

        return ResponseEntity.ok(ApiResponse.<List<DeliveryPartnerDto>>builder()
                .success(true)
                .message("Pending delivery partner applications fetched successfully")
                .data(pending)
                .build());
    }

    @PutMapping("/{partnerUserId}/approve")
    public ResponseEntity<ApiResponse<DeliveryPartnerDto>> approveDeliveryPartner(@PathVariable Long partnerUserId) {
        DeliveryPartner partner = deliveryPartnerRepository.findByUserId(partnerUserId)
                .orElseThrow(() -> new RuntimeException("Delivery partner not found"));
        partner.setStatus(DeliveryPartnerStatus.AVAILABLE);
        DeliveryPartner saved = deliveryPartnerRepository.save(partner);
        // Elevate role in auth-service
        crossServiceJdbcRepository.updateUserRole(partnerUserId, "DELIVERY_PARTNER");

        DeliveryPartnerDto dto = new DeliveryPartnerDto();
        BeanUtils.copyProperties(saved, dto);
        return ResponseEntity.ok(ApiResponse.<DeliveryPartnerDto>builder()
                .success(true)
                .message("Delivery partner approved successfully")
                .data(dto)
                .build());
    }

    @PutMapping("/{partnerUserId}/reject")
    public ResponseEntity<ApiResponse<DeliveryPartnerDto>> rejectDeliveryPartner(@PathVariable Long partnerUserId) {
        DeliveryPartner partner = deliveryPartnerRepository.findByUserId(partnerUserId)
                .orElseThrow(() -> new RuntimeException("Delivery partner not found"));
        partner.setStatus(DeliveryPartnerStatus.OFFLINE);
        DeliveryPartner saved = deliveryPartnerRepository.save(partner);

        DeliveryPartnerDto dto = new DeliveryPartnerDto();
        BeanUtils.copyProperties(saved, dto);
        return ResponseEntity.ok(ApiResponse.<DeliveryPartnerDto>builder()
                .success(true)
                .message("Delivery partner rejected")
                .data(dto)
                .build());
    }

    @GetMapping("/offline")
    public ResponseEntity<ApiResponse<List<DeliveryPartnerDto>>> listOfflinePartners() {
        List<DeliveryPartner> partners = deliveryPartnerRepository.findAll();
        List<DeliveryPartnerDto> offline = partners.stream()
                .filter(p -> p.getStatus() == DeliveryPartnerStatus.OFFLINE)
                .map(p -> {
                    DeliveryPartnerDto dto = new DeliveryPartnerDto();
                    BeanUtils.copyProperties(p, dto);
                    return dto;
                })
                .collect(Collectors.toList());

        return ResponseEntity.ok(ApiResponse.<List<DeliveryPartnerDto>>builder()
                .success(true)
                .message("Offline delivery partners fetched successfully")
                .data(offline)
                .build());
    }
}


