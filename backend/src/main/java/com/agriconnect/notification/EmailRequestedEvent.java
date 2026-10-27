package com.agriconnect.notification;

/**
 * Published by services that want an email sent. Delivery happens after the
 * surrounding transaction commits, so a rolled-back order never sends mail.
 */
public record EmailRequestedEvent(String to, String subject, String body) {
}
