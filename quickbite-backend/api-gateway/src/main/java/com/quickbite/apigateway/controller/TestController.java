package com.quickbite.apigateway.controller;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import reactor.core.publisher.Mono;

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
}