package com.quickbite.authservice.config;

import com.quickbite.authservice.entity.User;
import com.quickbite.authservice.repository.UserRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.crypto.password.PasswordEncoder;

@Configuration
public class AdminSeeder implements CommandLineRunner {

    private static final Logger log = LoggerFactory.getLogger(AdminSeeder.class);

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Override
    public void run(String... args) {
        String adminEmail = System.getenv().getOrDefault("QB_ADMIN_EMAIL", "admin@gmail.com");
        String adminPassword = System.getenv().getOrDefault("QB_ADMIN_PASSWORD", "admin123");

        userRepository.findByEmail(adminEmail).ifPresentOrElse(u -> {
            log.info("Admin user already present: {}", adminEmail);
        }, () -> {
            User admin = User.builder()
                    .email(adminEmail)
                    .password(passwordEncoder.encode(adminPassword))
                    .role("ADMIN")
                    .name("Platform Admin")
                    .phone("+1-000-000-0000")
                    .active(true)
                    .build();
            userRepository.save(admin);
            log.info("Seeded default admin user: {}", adminEmail);
        });
    }
}


