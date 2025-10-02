package com.quickbite.restaurantservice.service;

import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;

import jakarta.mail.MessagingException;
import jakarta.mail.internet.MimeMessage;
import java.util.concurrent.CompletableFuture;

@Service
@Slf4j
public class EmailService {

    @Autowired
    private JavaMailSender mailSender;

    @Value("${app.notification.from-email:noreply@quickbite.com}")
    private String fromEmail;

    @Value("${app.notification.base-url:http://localhost:3000}")
    private String baseUrl;

    @Async
    public CompletableFuture<Boolean> sendRestaurantApprovalEmail(String ownerEmail, String ownerName, 
                                                                 String restaurantName, String status, 
                                                                 String rejectionReason) {
        try {
            MimeMessage message = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(message, true, "UTF-8");
            
            helper.setFrom(fromEmail);
            helper.setTo(ownerEmail);
            
            String subject;
            String htmlContent;
            
            switch (status.toUpperCase()) {
                case "APPROVED":
                    subject = "🎉 Your Restaurant has been Approved - QuickBite";
                    htmlContent = generateApprovedTemplate(ownerName, restaurantName);
                    break;
                case "REJECTED":
                    subject = "Restaurant Application Update - QuickBite";
                    htmlContent = generateRejectedTemplate(ownerName, restaurantName, rejectionReason);
                    break;
                case "PENDING_APPROVAL":
                    subject = "Restaurant Application Received - QuickBite";
                    htmlContent = generatePendingTemplate(ownerName, restaurantName);
                    break;
                default:
                    subject = "Restaurant Status Update - QuickBite";
                    htmlContent = generateStatusUpdateTemplate(ownerName, restaurantName, status);
            }
            
            helper.setSubject(subject);
            helper.setText(htmlContent, true);
            
            mailSender.send(message);
            log.info("Restaurant approval email sent successfully to: {} for restaurant: {}", ownerEmail, restaurantName);
            return CompletableFuture.completedFuture(true);
        } catch (MessagingException e) {
            log.error("Failed to send restaurant approval email to: {} for restaurant: {}", ownerEmail, restaurantName, e);
            return CompletableFuture.completedFuture(false);
        }
    }

    private String generateApprovedTemplate(String ownerName, String restaurantName) {
        return String.format("""
            <!DOCTYPE html>
            <html>
            <head>
                <meta charset="UTF-8">
                <title>Restaurant Approved - QuickBite</title>
                <style>
                    body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
                    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
                    .header { background-color: #ff6b35; color: white; padding: 20px; text-align: center; border-radius: 8px 8px 0 0; }
                    .content { padding: 30px; background-color: #f9f9f9; border-radius: 0 0 8px 8px; }
                    .button { display: inline-block; background-color: #ff6b35; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; margin: 15px 0; }
                    .footer { text-align: center; padding: 20px; color: #666; font-size: 12px; }
                    .success-icon { font-size: 48px; text-align: center; margin: 20px 0; }
                </style>
            </head>
            <body>
                <div class="container">
                    <div class="header">
                        <h1>🎉 Restaurant Approved!</h1>
                    </div>
                    <div class="content">
                        <div class="success-icon">✅</div>
                        <h2>Congratulations, %s!</h2>
                        <p>We're excited to inform you that your restaurant <strong>"%s"</strong> has been approved and is now live on QuickBite!</p>
                        
                        <p><strong>What's next?</strong></p>
                        <ul>
                            <li>✅ Your restaurant is now visible to customers</li>
                            <li>📋 You can manage your menu and update items</li>
                            <li>📦 Start receiving and processing orders</li>
                            <li>📊 Track your restaurant's performance</li>
                        </ul>
                        
                        <p style="text-align: center;">
                            <a href="%s/restaurant-owner" class="button">Access Your Dashboard</a>
                        </p>
                        
                        <p>If you have any questions or need assistance getting started, our support team is here to help.</p>
                        
                        <p><strong>Welcome to the QuickBite family!</strong></p>
                    </div>
                    <div class="footer">
                        <p>© 2024 QuickBite. All rights reserved.</p>
                        <p>This is an automated message, please do not reply to this email.</p>
                    </div>
                </div>
            </body>
            </html>
            """, ownerName, restaurantName, baseUrl);
    }

    private String generateRejectedTemplate(String ownerName, String restaurantName, String rejectionReason) {
        return String.format("""
            <!DOCTYPE html>
            <html>
            <head>
                <meta charset="UTF-8">
                <title>Restaurant Application Update - QuickBite</title>
                <style>
                    body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
                    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
                    .header { background-color: #dc3545; color: white; padding: 20px; text-align: center; border-radius: 8px 8px 0 0; }
                    .content { padding: 30px; background-color: #f9f9f9; border-radius: 0 0 8px 8px; }
                    .button { display: inline-block; background-color: #ff6b35; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; margin: 15px 0; }
                    .footer { text-align: center; padding: 20px; color: #666; font-size: 12px; }
                    .reason-box { background-color: #fff3cd; border: 1px solid #ffeaa7; padding: 20px; border-radius: 5px; margin: 20px 0; }
                </style>
            </head>
            <body>
                <div class="container">
                    <div class="header">
                        <h1>Restaurant Application Update</h1>
                    </div>
                    <div class="content">
                        <h2>Dear %s,</h2>
                        <p>Thank you for your interest in joining QuickBite. After careful review, we regret to inform you that your restaurant application for <strong>"%s"</strong> has not been approved at this time.</p>
                        
                        <div class="reason-box">
                            <h3>📋 Reason for rejection:</h3>
                            <p><strong>%s</strong></p>
                        </div>
                        
                        <p><strong>What can you do next?</strong></p>
                        <ul>
                            <li>📝 Review and address the mentioned concerns</li>
                            <li>📋 Update your restaurant information</li>
                            <li>🔄 Resubmit your application</li>
                            <li>📞 Contact our support team for guidance</li>
                        </ul>
                        
                        <p style="text-align: center;">
                            <a href="%s/restaurant-owner" class="button">Update & Reapply</a>
                        </p>
                        
                        <p>We encourage you to address the mentioned concerns and reapply. Our team is here to help you succeed on QuickBite.</p>
                        
                        <p>Thank you for your understanding.</p>
                    </div>
                    <div class="footer">
                        <p>© 2024 QuickBite. All rights reserved.</p>
                        <p>This is an automated message, please do not reply to this email.</p>
                    </div>
                </div>
            </body>
            </html>
            """, ownerName, restaurantName, 
            rejectionReason != null ? rejectionReason : "Please review our restaurant guidelines and ensure all requirements are met.", 
            baseUrl);
    }

    private String generatePendingTemplate(String ownerName, String restaurantName) {
        return String.format("""
            <!DOCTYPE html>
            <html>
            <head>
                <meta charset="UTF-8">
                <title>Restaurant Application Received - QuickBite</title>
                <style>
                    body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
                    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
                    .header { background-color: #ffc107; color: #333; padding: 20px; text-align: center; border-radius: 8px 8px 0 0; }
                    .content { padding: 30px; background-color: #f9f9f9; border-radius: 0 0 8px 8px; }
                    .footer { text-align: center; padding: 20px; color: #666; font-size: 12px; }
                    .pending-icon { font-size: 48px; text-align: center; margin: 20px 0; }
                </style>
            </head>
            <body>
                <div class="container">
                    <div class="header">
                        <h1>📋 Application Under Review</h1>
                    </div>
                    <div class="content">
                        <div class="pending-icon">⏳</div>
                        <h2>Dear %s,</h2>
                        <p>Thank you for submitting your restaurant application for <strong>"%s"</strong> to QuickBite!</p>
                        
                        <p><strong>What happens next?</strong></p>
                        <p>Your application is currently under review by our team. We'll carefully evaluate:</p>
                        <ul>
                            <li>📋 Restaurant information and documentation</li>
                            <li>🍽️ Menu details and pricing</li>
                            <li>⭐ Compliance with our quality standards</li>
                            <li>🚚 Service area and delivery capabilities</li>
                        </ul>
                        
                        <p><strong>Timeline:</strong> We typically complete our review process within 2-3 business days. You'll receive an email notification once a decision has been made.</p>
                        
                        <p>Thank you for your patience and for choosing QuickBite!</p>
                    </div>
                    <div class="footer">
                        <p>© 2024 QuickBite. All rights reserved.</p>
                        <p>This is an automated message, please do not reply to this email.</p>
                    </div>
                </div>
            </body>
            </html>
            """, ownerName, restaurantName);
    }

    private String generateStatusUpdateTemplate(String ownerName, String restaurantName, String status) {
        return String.format("""
            <!DOCTYPE html>
            <html>
            <head>
                <meta charset="UTF-8">
                <title>Restaurant Status Update - QuickBite</title>
                <style>
                    body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
                    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
                    .header { background-color: #17a2b8; color: white; padding: 20px; text-align: center; border-radius: 8px 8px 0 0; }
                    .content { padding: 30px; background-color: #f9f9f9; border-radius: 0 0 8px 8px; }
                    .footer { text-align: center; padding: 20px; color: #666; font-size: 12px; }
                </style>
            </head>
            <body>
                <div class="container">
                    <div class="header">
                        <h1>Restaurant Status Update</h1>
                    </div>
                    <div class="content">
                        <h2>Dear %s,</h2>
                        <p>This is to inform you that the status of your restaurant <strong>"%s"</strong> has been updated to: <strong>%s</strong></p>
                        
                        <p>If you have any questions about this status change, please contact our support team.</p>
                        
                        <p>Thank you for being part of QuickBite!</p>
                    </div>
                    <div class="footer">
                        <p>© 2024 QuickBite. All rights reserved.</p>
                        <p>This is an automated message, please do not reply to this email.</p>
                    </div>
                </div>
            </body>
            </html>
            """, ownerName, restaurantName, status);
    }
}
