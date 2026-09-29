package com.eyewear.backend.config;

import com.eyewear.backend.entity.User;
import com.eyewear.backend.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
public class DataSeeder implements CommandLineRunner {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    @Value("${app.admin.email:admin@eyewear.com}")
    private String adminEmail;

    @Value("${app.admin.password:admin123}")
    private String adminPassword;

    @Override
    public void run(String... args) {
        User admin = userRepository.findByEmail(adminEmail).orElseGet(() ->
            User.builder()
                .name("Admin User")
                .email(adminEmail)
                .role("ADMIN")
                .build()
        );
        admin.setPassword(passwordEncoder.encode(adminPassword));
        admin.setRole("ADMIN");
        userRepository.save(admin);
        System.out.println("Admin account ready: " + adminEmail);
    }
}
