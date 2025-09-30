package com.quickbite.paymentservice.controller;

import com.quickbite.paymentservice.dto.ApiResponse;
import com.razorpay.Order;
import com.razorpay.RazorpayClient;
import org.json.JSONObject;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.util.Map;

@RestController
@RequestMapping("/api/payments")
public class PaymentController {

    @Autowired
    private RazorpayClient razorpayClient;

    @PostMapping("/intent")
    public ResponseEntity<ApiResponse<Map<String, Object>>> createPaymentIntent(@RequestBody Map<String, Object> payload) throws Exception {
        // amount expected in major units (e.g. rupees). Razorpay expects paise.
        BigDecimal amount = new BigDecimal(payload.get("amount").toString());
        String currency = String.valueOf(payload.getOrDefault("currency", "INR"));
        String receipt = String.valueOf(payload.getOrDefault("receipt", "rcpt_" + System.currentTimeMillis()));

        JSONObject options = new JSONObject();
        options.put("amount", amount.multiply(BigDecimal.valueOf(100)).longValue());
        options.put("currency", currency);
        options.put("receipt", receipt);

        Order order = razorpayClient.Orders.create(options);
        Map<String, Object> data = order.toJson().toMap();
        return new ResponseEntity<>(ApiResponse.<Map<String, Object>>builder()
                .success(true)
                .message("Payment intent created successfully")
                .data(data)
                .build(), HttpStatus.CREATED);
    }

    @PostMapping("/webhook")
    public ResponseEntity<ApiResponse<Void>> handleWebhook(@RequestBody String payload, @RequestHeader("X-Razorpay-Signature") String signature) {
        // TODO: verify signature with webhook secret and update order/payment status in DB or call order-service
        return ResponseEntity.ok(ApiResponse.<Void>builder()
                .success(true)
                .message("Webhook received")
                .data(null)
                .build());
    }
}


