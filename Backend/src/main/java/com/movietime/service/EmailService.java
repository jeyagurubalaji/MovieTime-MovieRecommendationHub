package com.movietime.service;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
@Slf4j
public class EmailService {

    private final JavaMailSender mailSender;

    @Value("${app.frontend-url}")
    private String frontendUrl;

    public void sendPasswordResetEmail(String toEmail, String resetToken) {
        String resetLink = frontendUrl + "/reset-password?token=" + resetToken;

        try {
            SimpleMailMessage message = new SimpleMailMessage();
            message.setTo(toEmail);
            message.setSubject("Reset your MovieTime password");
            message.setText("""
                    We received a request to reset your MovieTime password.

                    Reset it here (link expires in 1 hour):
                    %s

                    If you didn't request this, you can safely ignore this email.

                    - The MovieTime Team
                    """.formatted(resetLink));
            mailSender.send(message);
        } catch (Exception e) {
            // Don't let a mail-server misconfiguration break the forgot-password flow in dev.
            log.warn("Failed to send password reset email to {}: {}", toEmail, e.getMessage());
        }
    }
}
