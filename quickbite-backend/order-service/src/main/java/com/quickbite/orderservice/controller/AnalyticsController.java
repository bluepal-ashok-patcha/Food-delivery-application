package com.quickbite.orderservice.controller;

import com.quickbite.orderservice.dto.OrderAnalyticsDto;
import com.quickbite.orderservice.service.OrderAnalyticsService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/orders")
@CrossOrigin(origins = "*")
public class AnalyticsController {

    @Autowired
    private OrderAnalyticsService orderAnalyticsService;

    @GetMapping("/analytics")
    public ResponseEntity<OrderAnalyticsDto> getOrderAnalytics(
            @RequestParam(defaultValue = "week") String period) {
        
        OrderAnalyticsDto analytics = orderAnalyticsService.getOrderAnalytics(period);
        return ResponseEntity.ok(analytics);
    }

    @GetMapping("/analytics/summary")
    public ResponseEntity<Object> getAnalyticsSummary(
            @RequestParam(defaultValue = "week") String period) {
        
        // This would return summary analytics for orders
        return ResponseEntity.ok("Order analytics summary endpoint - to be implemented");
    }
}
