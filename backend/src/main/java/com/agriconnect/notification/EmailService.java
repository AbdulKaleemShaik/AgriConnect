package com.agriconnect.notification;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.ObjectProvider;
import org.springframework.mail.MailException;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;
import org.springframework.transaction.event.TransactionalEventListener;

import com.agriconnect.config.AppProperties;

/**
 * Sends notification emails asynchronously. When {@code app.mail.enabled=false}
 * (the default) messages are only logged, so the app runs without SMTP credentials.
 */
@Service
public class EmailService {

    private static final Logger log = LoggerFactory.getLogger(EmailService.class);

    private final ObjectProvider<JavaMailSender> mailSender;
    private final AppProperties properties;

    public EmailService(ObjectProvider<JavaMailSender> mailSender, AppProperties properties) {
        this.mailSender = mailSender;
        this.properties = properties;
    }

    @Async
    @TransactionalEventListener(fallbackExecution = true)
    public void onEmailRequested(EmailRequestedEvent event) {
        send(event.to(), event.subject(), event.body());
    }

    public void send(String to, String subject, String body) {
        JavaMailSender sender = mailSender.getIfAvailable();
        if (!properties.mail().enabled() || sender == null) {
            log.info("Mail disabled - not sending '{}' to {}", subject, to);
            log.debug("Mail body:\n{}", body);
            return;
        }
        try {
            SimpleMailMessage message = new SimpleMailMessage();
            message.setFrom(properties.mail().from());
            message.setTo(to);
            message.setSubject(subject);
            message.setText(body);
            sender.send(message);
        } catch (MailException e) {
            // Notifications are best-effort and must never break the business operation.
            log.warn("Failed to send '{}' to {}: {}", subject, to, e.getMessage());
        }
    }
}
