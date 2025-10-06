package com.quickbite.apigateway.controller;

import org.springframework.web.bind.annotation.*;
import reactor.core.publisher.Mono;
import java.util.Map;
import java.util.HashMap;

@RestController
@RequestMapping("/test")
public class TestController {

    @GetMapping("/public")
    public Mono<String> publicEndpoint() {
        return Mono.just("Public endpoint works!");
    }

    @GetMapping("/protected")
    public Mono<String> protectedEndpoint() {
        return Mono.just("Protected endpoint works! JWT validation successful.");
    }

    @GetMapping("/cors")
    public Mono<Map<String, Object>> corsTest() {
        Map<String, Object> response = new HashMap<>();
        response.put("message", "CORS test endpoint");
        response.put("timestamp", System.currentTimeMillis());
        response.put("status", "success");
        return Mono.just(response);
    }

    @PostMapping("/cors")
    public Mono<Map<String, Object>> corsPostTest(@RequestBody(required = false) Map<String, Object> body) {
        Map<String, Object> response = new HashMap<>();
        response.put("message", "CORS POST test endpoint");
        response.put("receivedData", body);
        response.put("timestamp", System.currentTimeMillis());
        response.put("status", "success");
        return Mono.just(response);
    }
}