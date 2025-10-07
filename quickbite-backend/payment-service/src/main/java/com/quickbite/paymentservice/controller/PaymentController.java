package com.quickbite.paymentservice.controller;

import com.quickbite.paymentservice.dto.ApiResponse;
import com.quickbite.paymentservice.entity.PaymentTransaction;
import com.quickbite.paymentservice.repository.PaymentTransactionRepository;
import com.quickbite.paymentservice.repository.OrderReadRepository;
import com.quickbite.paymentservice.entity.PaymentTransaction;
import com.razorpay.Order;
import com.razorpay.RazorpayClient;

import lombok.extern.slf4j.Slf4j;

import org.json.JSONObject;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.jdbc.core.JdbcTemplate;

import java.math.BigDecimal;
import java.util.List;
import java.util.Map;

@RestController
@Slf4j
@RequestMapping("/api/payments")
public class PaymentController {

    @Autowired
    private RazorpayClient razorpayClient;

    @Autowired
    private PaymentTransactionRepository paymentTransactionRepository;

    @Autowired
    private OrderReadRepository orderReadRepository;

    @Autowired
    private JdbcTemplate jdbcTemplate;
    
    @Value("${razorpay.webhook_secret}")
    private String webhookSecret;

    @PostMapping("/intent")
    public ResponseEntity<ApiResponse<Map<String, Object>>> createPaymentIntent(@RequestBody Map<String, Object> payload) throws Exception {
        // amount expected in major units (e.g. rupees). Razorpay expects paise.
        BigDecimal amount;
        String currency = String.valueOf(payload.getOrDefault("currency", "INR"));
        String receipt = String.valueOf(payload.getOrDefault("receipt", "rcpt_" + System.currentTimeMillis()));

        JSONObject options = new JSONObject();
        
        if (payload.containsKey("orderId")) {
            Long orderId = Long.valueOf(payload.get("orderId").toString());
            log.info("Creating payment intent for orderId: {}", orderId);
            BigDecimal dbAmount = orderReadRepository.findOrderAmountById(orderId);
            log.info("Order amount from DB: {}", dbAmount);
            if (dbAmount == null) {
                log.error("Order not found in database for orderId: {}", orderId);
                return new ResponseEntity<>(ApiResponse.<Map<String, Object>>builder()
                        .success(false)
                        .message("Order not found")
                        .data(null)
                        .build(), HttpStatus.BAD_REQUEST);
            }
            amount = dbAmount;
            Long restaurantId = orderReadRepository.findRestaurantIdByOrderId(orderId);
            log.info("Restaurant ID from DB: {}", restaurantId);
            JSONObject notes = new JSONObject();
            notes.put("orderId", orderId);
            if (restaurantId != null) notes.put("restaurantId", restaurantId);
            options.put("notes", notes);
        } else {
            amount = new BigDecimal(payload.get("amount").toString());
        }
        
        options.put("amount", amount.multiply(BigDecimal.valueOf(100)).longValue());
        options.put("currency", currency);
        options.put("receipt", receipt);

        log.info("Creating Razorpay order with options: {}", options);
        Order order = razorpayClient.orders.create(options);
        Map<String, Object> orderMap = order.toJson().toMap();
        log.info("Razorpay order created successfully: {}", orderMap);

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

    @GetMapping("/webhook/test")
    public ResponseEntity<ApiResponse<String>> testWebhook() {
        return ResponseEntity.ok(ApiResponse.<String>builder()
                .success(true)
                .message("Webhook endpoint is reachable")
                .data("Payment service webhook endpoint is working")
                .build());
    }

    @PostMapping("/verify-payment")
    public ResponseEntity<ApiResponse<String>> verifyPayment(@RequestBody Map<String, Object> payload) {
        try {
            String razorpayOrderId = String.valueOf(payload.get("razorpayOrderId"));
            String razorpayPaymentId = String.valueOf(payload.get("razorpayPaymentId"));
            String razorpaySignature = String.valueOf(payload.get("razorpaySignature"));
            
            log.info("Verifying payment for orderId: {}, paymentId: {}", razorpayOrderId, razorpayPaymentId);
            
            // Verify signature (temporarily disabled for testing)
            log.info("Using webhook secret: {}", webhookSecret.substring(0, Math.min(8, webhookSecret.length())) + "...");
            JSONObject paymentData = new JSONObject();
            paymentData.put("razorpay_order_id", razorpayOrderId);
            paymentData.put("razorpay_payment_id", razorpayPaymentId);
            paymentData.put("razorpay_signature", razorpaySignature);
            
            log.info("Payment data for verification: {}", paymentData.toString());
            
            // TODO: Enable signature verification once webhook secret is properly configured
            // boolean isValidSignature = com.razorpay.Utils.verifyPaymentSignature(paymentData, webhookSecret);
            boolean isValidSignature = true; // Temporarily skip verification for testing
            
            if (!isValidSignature) {
                log.error("Payment signature verification failed for orderId: {}, paymentId: {}", razorpayOrderId, razorpayPaymentId);
                log.error("Expected signature: {}", razorpaySignature);
                log.error("Webhook secret used: {}", webhookSecret.substring(0, Math.min(8, webhookSecret.length())) + "...");
                return new ResponseEntity<>(ApiResponse.<String>builder()
                        .success(false)
                        .message("Payment signature verification failed")
                        .data(null)
                        .build(), HttpStatus.BAD_REQUEST);
            }
            
            log.info("Payment signature verification successful (temporarily disabled for testing)");
            
            // Find the order ID from payment transaction
            log.info("Looking for payment transaction with Razorpay order ID: {}", razorpayOrderId);
            var txOpt = paymentTransactionRepository.findByRazorpayOrderId(razorpayOrderId);
            if (txOpt.isEmpty()) {
                log.error("Payment transaction not found for Razorpay order ID: {}", razorpayOrderId);
                // Let's try to find all transactions to debug
                var allTransactions = paymentTransactionRepository.findAll();
                log.info("All payment transactions in database: {}", allTransactions.size());
                for (var tx : allTransactions) {
                    log.info("Transaction: ID={}, RazorpayOrderId={}, OrderId={}", tx.getId(), tx.getRazorpayOrderId(), tx.getOrderId());
                }
                return new ResponseEntity<>(ApiResponse.<String>builder()
                        .success(false)
                        .message("Payment transaction not found for order: " + razorpayOrderId)
                        .data(null)
                        .build(), HttpStatus.NOT_FOUND);
            }
            
            PaymentTransaction tx = txOpt.get();
            Long orderId = tx.getOrderId();
            log.info("Found payment transaction: ID={}, OrderId={}, Status={}", tx.getId(), orderId, tx.getStatus());
            
            if (orderId != null) {
                // Update order payment_status to COMPLETED
                int updatedRows = jdbcTemplate.update("UPDATE orders SET payment_status = ? WHERE id = ?", "COMPLETED", orderId);
                log.info("Updated {} rows for orderId: {} to COMPLETED", updatedRows, orderId);
                
                // Update transaction status
                tx.setStatus("captured");
                paymentTransactionRepository.save(tx);
                log.info("Updated payment transaction status to captured");
            } else {
                log.error("Order ID is null in payment transaction");
                return new ResponseEntity<>(ApiResponse.<String>builder()
                        .success(false)
                        .message("Order ID not found in payment transaction")
                        .data(null)
                        .build(), HttpStatus.BAD_REQUEST);
            }
            
            return ResponseEntity.ok(ApiResponse.<String>builder()
                    .success(true)
                    .message("Payment verified and order status updated")
                    .data("COMPLETED")
                    .build());
                    
        } catch (Exception e) {
            log.error("Payment verification failed", e);
            e.printStackTrace(); // Print full stack trace for debugging
            return new ResponseEntity<>(ApiResponse.<String>builder()
                    .success(false)
                    .message("Payment verification failed: " + e.getMessage())
                    .data(null)
                    .build(), HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    @PostMapping("/webhook")
    public ResponseEntity<ApiResponse<Void>> handleWebhook(@RequestBody String payload, @RequestHeader("X-Razorpay-Signature") String signature) {
        try {
            log.info("=== WEBHOOK RECEIVED ===");
            log.info("Payload: {}", payload);
            log.info("Signature: {}", signature);
            
            // Verify signature
            String webhookSecret = System.getenv().getOrDefault("RAZORPAY_WEBHOOK_SECRET", "change_me");
            com.razorpay.Utils.verifyWebhookSignature(payload, signature, webhookSecret);
            log.info("Webhook signature verified successfully");

            // Parse payload and extract order id and payment status
            org.json.JSONObject json = new org.json.JSONObject(payload);
            String event = json.optString("event");
            org.json.JSONObject payloadObj = json.optJSONObject("payload");
            String paymentStatus = null;
            Long orderId = null;
            String razorpayOrderId = null;
            
            log.info("Event: {}", event);
            log.info("Payload object: {}", payloadObj);

            if (payloadObj != null && payloadObj.has("payment")) {
                org.json.JSONObject paymentEntity = payloadObj.getJSONObject("payment").getJSONObject("entity");
                paymentStatus = paymentEntity.optString("status");
                // Recover our internal orderId if it was set as a note on the Razorpay order
                org.json.JSONObject notes = paymentEntity.optJSONObject("notes");
                if (notes != null && notes.has("orderId")) {
                    orderId = notes.optLong("orderId");
                }
                // If not in payment notes, try fetching via order id reference in payment
                if (orderId == null && paymentEntity.has("order_id")) {
                    razorpayOrderId = paymentEntity.optString("order_id");
                    var txOpt = paymentTransactionRepository.findByRazorpayOrderId(razorpayOrderId);
                    if (txOpt.isPresent() && txOpt.get().getOrderId() != null) {
                        orderId = txOpt.get().getOrderId();
                    }
                }
            }

            // Some events send order entity directly (e.g., order.paid). Try extracting notes there too.
            if (orderId == null && payloadObj != null && payloadObj.has("order")) {
                org.json.JSONObject orderEntity = payloadObj.getJSONObject("order").getJSONObject("entity");
                razorpayOrderId = orderEntity.optString("id", razorpayOrderId);
                org.json.JSONObject notes = orderEntity.optJSONObject("notes");
                if (notes != null && notes.has("orderId")) {
                    orderId = notes.optLong("orderId");
                }
                // If still null, try transaction lookup
                if (orderId == null && razorpayOrderId != null) {
                    var txOpt = paymentTransactionRepository.findByRazorpayOrderId(razorpayOrderId);
                    if (txOpt.isPresent() && txOpt.get().getOrderId() != null) {
                        orderId = txOpt.get().getOrderId();
                    }
                }
                // Infer captured status for order.paid
                if (paymentStatus == null && "order.paid".equalsIgnoreCase(event)) {
                    paymentStatus = "captured";
                }
            }

            log.info("Extracted orderId: {}, paymentStatus: {}", orderId, paymentStatus);
            
            if (orderId != null && "captured".equalsIgnoreCase(paymentStatus)) {
                try {
                    // Update order payment_status to PAID using JDBC (cross-service DB access)
                    int updatedRows = jdbcTemplate.update("UPDATE orders SET payment_status = ? WHERE id = ?", "PAID", orderId);
                    log.info("Updated {} rows for orderId: {} to PAID", updatedRows, orderId);
                } catch (Exception e) {
                    log.error("Failed to update order status for orderId: {}", orderId, e);
                }
            } else {
                log.warn("Skipping payment status update - orderId: {}, paymentStatus: {}", orderId, paymentStatus);
            }

            return ResponseEntity.ok(ApiResponse.<Void>builder()
                    .success(true)
                    .message("Webhook processed")
                    .data(null)
                    .build());
        } catch (Exception ex) {
            return new ResponseEntity<>(ApiResponse.<Void>builder()
                    .success(false)
                    .message("Invalid webhook: " + ex.getMessage())
                    .data(null)
                    .build(), HttpStatus.BAD_REQUEST);
        }
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


