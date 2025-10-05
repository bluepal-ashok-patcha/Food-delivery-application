package com.quickbite.deliveryservice.controller;

import com.quickbite.deliveryservice.dto.DeliveryAnalyticsDto;
import com.quickbite.deliveryservice.service.DeliveryAnalyticsService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/delivery")
@CrossOrigin(origins = "*")
public class AnalyticsController {

    @Autowired
    private DeliveryAnalyticsService deliveryAnalyticsService;

    @GetMapping("/analytics")
    public ResponseEntity<DeliveryAnalyticsDto> getDeliveryAnalytics(
            @RequestParam(defaultValue = "week") String period) {
        
        DeliveryAnalyticsDto analytics = deliveryAnalyticsService.getDeliveryAnalytics(period);
        return ResponseEntity.ok(analytics);
    }

    @GetMapping("/analytics/summary")
    public ResponseEntity<Object> getAnalyticsSummary(
            @RequestParam(defaultValue = "week") String period) {
        
        // Get summary analytics for delivery
        Object summary = deliveryAnalyticsService.getDeliveryAnalyticsSummary(period);
        return ResponseEntity.ok(summary);
    }
}
