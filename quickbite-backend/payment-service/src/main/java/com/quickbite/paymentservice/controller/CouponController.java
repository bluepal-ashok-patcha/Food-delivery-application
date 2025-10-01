package com.quickbite.paymentservice.controller;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.Map;

@RestController
@RequestMapping("/api/payments/coupons")
public class CouponController {

    @GetMapping("/validate")
    public ResponseEntity<Map<String, Object>> validate(@RequestParam String code, @RequestParam double amount) {
        // Simple placeholder: 10% off for "SAVE10"
        if ("SAVE10".equalsIgnoreCase(code) && amount >= 100) {
            double discount = Math.round(amount * 0.10 * 100.0) / 100.0;
            return ResponseEntity.ok(Map.of(
                "valid", true,
                "discount", discount,
                "message", "Coupon applied"
            ));
        }
        return ResponseEntity.ok(Map.of(
            "valid", false,
            "discount", 0,
            "message", "Invalid or ineligible coupon"
        ));
    }
}


