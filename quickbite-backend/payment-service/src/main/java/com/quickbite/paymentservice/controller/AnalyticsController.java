package com.quickbite.paymentservice.controller;

import com.quickbite.paymentservice.dto.PaymentAnalyticsDto;
import com.quickbite.paymentservice.service.PaymentAnalyticsService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/payments")
@CrossOrigin(origins = "*")
public class AnalyticsController {

    @Autowired
    private PaymentAnalyticsService paymentAnalyticsService;

    @GetMapping("/analytics")
    public ResponseEntity<PaymentAnalyticsDto> getPaymentAnalytics(
            @RequestParam(defaultValue = "week") String period) {
        
        PaymentAnalyticsDto analytics = paymentAnalyticsService.getPaymentAnalytics(period);
        return ResponseEntity.ok(analytics);
    }

    @GetMapping("/analytics/summary")
    public ResponseEntity<Object> getAnalyticsSummary(
            @RequestParam(defaultValue = "week") String period) {
        
        // Get summary analytics for payments
        Object summary = paymentAnalyticsService.getPaymentAnalyticsSummary(period);
        return ResponseEntity.ok(summary);
    }
}
