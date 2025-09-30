package com.quickbite.deliveryservice.service;

import com.quickbite.deliveryservice.dto.DeliveryPartnerDto;
import com.quickbite.deliveryservice.dto.LocationUpdateDto;
import com.quickbite.deliveryservice.entity.DeliveryPartner;
import com.quickbite.deliveryservice.entity.DeliveryPartnerStatus;
import com.quickbite.deliveryservice.repository.DeliveryPartnerRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.BeanUtils;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class DeliveryService {

    private static final Logger log = LoggerFactory.getLogger(DeliveryService.class);

    @Autowired
    private DeliveryPartnerRepository deliveryPartnerRepository;

    @Transactional
    public DeliveryPartnerDto createDeliveryPartner(DeliveryPartnerDto partnerDto) {
        if (deliveryPartnerRepository.findByUserId(partnerDto.getUserId()).isPresent()) {
            throw new RuntimeException("Delivery partner profile already exists");
        }
        DeliveryPartner partner = convertToEntity(partnerDto);
        DeliveryPartner savedPartner = deliveryPartnerRepository.save(partner);
        log.info("Created delivery partner profile for userId: {}", savedPartner.getUserId());
        return convertToDto(savedPartner);
    }

    @Transactional(readOnly = true)
    public DeliveryPartnerDto getDeliveryPartnerByUserId(Long userId) {
        DeliveryPartner partner = deliveryPartnerRepository.findByUserId(userId)
                .orElseThrow(() -> new RuntimeException("Delivery partner not found"));
        return convertToDto(partner);
    }

    @Transactional
    public DeliveryPartnerDto updateDeliveryPartnerStatus(Long userId, DeliveryPartnerStatus status) {
        DeliveryPartner partner = deliveryPartnerRepository.findByUserId(userId)
                .orElseThrow(() -> new RuntimeException("Delivery partner not found"));
        partner.setStatus(status);
        DeliveryPartner updatedPartner = deliveryPartnerRepository.save(partner);
        log.info("Updated status to {} for delivery partner with userId: {}", status, userId);
        return convertToDto(updatedPartner);
    }

    @Transactional
    public void updateDeliveryPartnerLocation(Long userId, LocationUpdateDto locationDto) {
        DeliveryPartner partner = deliveryPartnerRepository.findByUserId(userId)
                .orElseThrow(() -> new RuntimeException("Delivery partner not found"));
        partner.setLatitude(locationDto.getLatitude());
        partner.setLongitude(locationDto.getLongitude());
        deliveryPartnerRepository.save(partner);
        log.trace("Updated location for delivery partner with userId: {}", userId); // Trace for frequent updates
    }

    @Transactional(readOnly = true)
    public List<DeliveryPartnerDto> findAvailablePartners() {
        return deliveryPartnerRepository.findByStatus(DeliveryPartnerStatus.AVAILABLE).stream()
                .map(this::convertToDto)
                .collect(Collectors.toList());
    }

    // --- DTO Conversion Utilities ---

    private DeliveryPartnerDto convertToDto(DeliveryPartner partner) {
        DeliveryPartnerDto dto = new DeliveryPartnerDto();
        BeanUtils.copyProperties(partner, dto);
        return dto;
    }

    private DeliveryPartner convertToEntity(DeliveryPartnerDto dto) {
        DeliveryPartner entity = new DeliveryPartner();
        BeanUtils.copyProperties(dto, entity);
        return entity;
    }
}