package com.boulevardsecurity.securitymanagementapp.service;

import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.MediaType;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.stereotype.Service;
import org.springframework.web.reactive.function.client.WebClient;
import reactor.core.publisher.Mono;

@Service
@RequiredArgsConstructor
public class NotificationService {

    private final JavaMailSender mailSender;

    // Récupération de la clé Textbelt depuis application.properties
    @Value("${textbelt.api.key}")
    private String textbeltApiKey;

    /**
     * Envoi d’un email de notification.
     * @param to       destinataire
     * @param subject  sujet
     * @param content  contenu
     */
    public void sendEmail(String to, String subject, String content) {
        try {
            SimpleMailMessage message = new SimpleMailMessage();
            message.setTo(to);
            message.setSubject(subject);
            message.setText(content);

            mailSender.send(message);

            System.out.println("✅ Email envoyé à " + to);
        } catch (Exception e) {
            System.err.println("❌ Erreur envoi email : " + e.getMessage());
        }
    }

    /**
     * Envoi d’un SMS via Textbelt (limitation : ~1 SMS gratuit/jour).
     * @param phoneNumber numéro de téléphone (format international, ex: "+33123456789")
     * @param message     contenu du SMS
     */
    public void sendSMS(String phoneNumber, String message) {
        // Construction du JSON pour l’API Textbelt
        // cf. https://textbelt.com/
        String apiUrl = "https://textbelt.com/text";

        WebClient webClient = WebClient.builder().baseUrl(apiUrl).build();

        webClient.post()
                .contentType(MediaType.APPLICATION_JSON)
                .bodyValue("""
                    {
                      "phone": "%s",
                      "message": "%s",
                      "key": "%s"
                    }
                    """.formatted(phoneNumber, message, textbeltApiKey))
                .retrieve()
                .bodyToMono(String.class)
                .onErrorResume(ex -> {
                    System.err.println("❌ Erreur envoi SMS : " + ex.getMessage());
                    return Mono.empty();
                })
                .subscribe(response -> {
                    System.out.println("Réponse de Textbelt : " + response);
                });
    }
}
