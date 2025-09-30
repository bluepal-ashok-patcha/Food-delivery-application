package com.quickbite.paymentservice.controller;

import com.quickbite.paymentservice.dto.ApiResponse;
import com.quickbite.paymentservice.entity.PaymentTransaction;
import com.quickbite.paymentservice.repository.PaymentTransactionRepository;
import com.quickbite.paymentservice.repository.OrderReadRepository;
import com.quickbite.paymentservice.entity.PaymentTransaction;
import com.razorpay.Order;
import com.razorpay.RazorpayClient;
import org.json.JSONObject;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/payments")
public class PaymentController {

    @Autowired
    private RazorpayClient razorpayClient;

    @Autowired
    private PaymentTransactionRepository paymentTransactionRepository;

    @Autowired
    private OrderReadRepository orderReadRepository;

    @PostMapping("/intent")
    public ResponseEntity<ApiResponse<Map<String, Object>>> createPaymentIntent(@RequestBody Map<String, Object> payload) throws Exception {
        // amount expected in major units (e.g. rupees). Razorpay expects paise.
        BigDecimal amount;
        String currency = String.valueOf(payload.getOrDefault("currency", "INR"));
        String receipt = String.valueOf(payload.getOrDefault("receipt", "rcpt_" + System.currentTimeMillis()));

        JSONObject options = new JSONObject();
        
        if (payload.containsKey("orderId")) {
            Long orderId = Long.valueOf(payload.get("orderId").toString());
            BigDecimal dbAmount = orderReadRepository.findOrderAmountById(orderId);
            if (dbAmount == null) {
                return new ResponseEntity<>(ApiResponse.<Map<String, Object>>builder()
                        .success(false)
                        .message("Order not found")
                        .data(null)
                        .build(), HttpStatus.BAD_REQUEST);
            }
            amount = dbAmount;
            Long restaurantId = orderReadRepository.findRestaurantIdByOrderId(orderId);
            if (restaurantId != null) {
                options.put("notes", new JSONObject().put("restaurantId", restaurantId));
            }
        } else {
            amount = new BigDecimal(payload.get("amount").toString());
        }
        
        options.put("amount", amount.multiply(BigDecimal.valueOf(100)).longValue());
        options.put("currency", currency);
        options.put("receipt", receipt);

        Order order = razorpayClient.orders.create(options);
        Map<String, Object> orderMap = order.toJson().toMap();

        PaymentTransaction tx = new PaymentTransaction();
        tx.setRazorpayOrderId(order.get("id"));
        tx.setAmount(amount);
        tx.setCurrency(currency);
        tx.setStatus(String.valueOf(orderMap.getOrDefault("status", "created")));
        if (payload.containsKey("orderId")) {
            Long orderId = Long.valueOf(payload.get("orderId").toString());
            tx.setOrderId(orderId);
            Long restaurantId = orderReadRepository.findRestaurantIdByOrderId(orderId);
            if (restaurantId != null) {
                tx.setRestaurantId(restaurantId);
            }
        }
        paymentTransactionRepository.save(tx);
        Map<String, Object> data = orderMap;
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

    @GetMapping("/transactions")
    public ResponseEntity<ApiResponse<List<PaymentTransaction>>> getAllTransactions() {
        List<PaymentTransaction> transactions = paymentTransactionRepository.findAll();
        return ResponseEntity.ok(ApiResponse.<List<PaymentTransaction>>builder()
                .success(true)
                .message("All transactions retrieved successfully")
                .data(transactions)
                .build());
    }

    @GetMapping("/transactions/{id}")
    public ResponseEntity<ApiResponse<PaymentTransaction>> getTransactionById(@PathVariable Long id) {
        return paymentTransactionRepository.findById(id)
                .map(transaction -> ResponseEntity.ok(ApiResponse.<PaymentTransaction>builder()
                        .success(true)
                        .message("Transaction found")
                        .data(transaction)
                        .build()))
                .orElse(ResponseEntity.status(HttpStatus.NOT_FOUND)
                        .body(ApiResponse.<PaymentTransaction>builder()
                                .success(false)
                                .message("Transaction not found")
                                .data(null)
                                .build()));
    }

    @GetMapping("/transactions/order/{orderId}")
    public ResponseEntity<ApiResponse<List<PaymentTransaction>>> getTransactionsByOrderId(@PathVariable Long orderId) {
        List<PaymentTransaction> transactions = paymentTransactionRepository.findByOrderId(orderId);
        return ResponseEntity.ok(ApiResponse.<List<PaymentTransaction>>builder()
                .success(true)
                .message("Transactions for order " + orderId + " retrieved successfully")
                .data(transactions)
                .build());
    }

    @GetMapping("/transactions/status/{status}")
    public ResponseEntity<ApiResponse<List<PaymentTransaction>>> getTransactionsByStatus(@PathVariable String status) {
        List<PaymentTransaction> transactions = paymentTransactionRepository.findByStatus(status);
        return ResponseEntity.ok(ApiResponse.<List<PaymentTransaction>>builder()
                .success(true)
                .message("Transactions with status " + status + " retrieved successfully")
                .data(transactions)
                .build());
    }

    @GetMapping("/transactions/restaurant/{restaurantId}")
    public ResponseEntity<ApiResponse<List<PaymentTransaction>>> getTransactionsByRestaurantId(@PathVariable Long restaurantId) {
        List<PaymentTransaction> transactions = paymentTransactionRepository.findByRestaurantId(restaurantId);
        return ResponseEntity.ok(ApiResponse.<List<PaymentTransaction>>builder()
                .success(true)
                .message("Transactions for restaurant " + restaurantId + " retrieved successfully")
                .data(transactions)
                .build());
    }
}


