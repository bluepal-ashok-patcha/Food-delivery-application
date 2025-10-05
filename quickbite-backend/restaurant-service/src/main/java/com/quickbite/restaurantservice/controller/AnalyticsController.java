package com.quickbite.restaurantservice.controller;



import com.quickbite.restaurantservice.dto.AnalyticsDto;
import com.quickbite.restaurantservice.service.AnalyticsService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/restaurants")
@CrossOrigin(origins = "*")
public class AnalyticsController {

    @Autowired
    private AnalyticsService analyticsService;

    @GetMapping("/{restaurantId}/analytics")
    public ResponseEntity<AnalyticsDto> getRestaurantAnalytics(
            @PathVariable Long restaurantId,
            @RequestParam(defaultValue = "week") String period) {
        
        AnalyticsDto analytics = analyticsService.getRestaurantAnalytics(restaurantId, period);
        return ResponseEntity.ok(analytics);
    }

    @GetMapping("/analytics/summary")
    public ResponseEntity<Object> getAnalyticsSummary(
            @RequestParam(defaultValue = "week") String period) {
        
        // Get summary analytics for all restaurants
        Object summary = analyticsService.getAnalyticsSummary(period);
        return ResponseEntity.ok(summary);
    }
}
