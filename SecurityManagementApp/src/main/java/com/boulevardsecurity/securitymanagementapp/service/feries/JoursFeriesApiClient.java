// src/main/java/com/boulevardsecurity/securitymanagementapp/service/feries/JoursFeriesApiClient.java
package com.boulevardsecurity.securitymanagementapp.service.feries;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.http.client.SimpleClientHttpRequestFactory;
import org.springframework.stereotype.Component;
import org.springframework.web.client.RestClientException;
import org.springframework.web.client.RestTemplate;

import java.net.URI;
import java.util.Collections;
import java.util.Map;

@Component
public class JoursFeriesApiClient {

    private final RestTemplate restTemplate;
    private final String baseUrl;
    private final String zone;

    public JoursFeriesApiClient(
            @Value("${feries.base-url}") String baseUrl,
            @Value("${feries.zone:metropole}") String zone,
            @Value("${feries.timeout-ms:2500}") int timeoutMs
    ) {
        this.baseUrl = baseUrl.endsWith("/") ? baseUrl.substring(0, baseUrl.length() - 1) : baseUrl;
        this.zone = zone;

        SimpleClientHttpRequestFactory f = new SimpleClientHttpRequestFactory();
        f.setConnectTimeout(timeoutMs);
        f.setReadTimeout(timeoutMs);
        this.restTemplate = new RestTemplate(f);
    }

    /** Appelle /{zone}/{year}.json → map "yyyy-MM-dd" -> libellé */
    public Map<String, String> recupererAnnee(int annee) {
        String url = String.format("%s/%s/%d.json", baseUrl, zone, annee);
        try {
            var resp = restTemplate.getForEntity(URI.create(url), Map.class);
            if (resp.getStatusCode() == HttpStatus.OK && resp.getBody() != null) {
                return (Map<String, String>) resp.getBody();
            }
        } catch (RestClientException e) {
            // log si besoin
        }
        return Collections.emptyMap();
    }

    /** Option secours: /{zone}.json (multi-années), puis filtrage côté service */
    public Map<String, String> recupererToutesAnnees() {
        String url = String.format("%s/%s.json", baseUrl, zone);
        try {
            var resp = restTemplate.getForEntity(URI.create(url), Map.class);
            if (resp.getStatusCode() == HttpStatus.OK && resp.getBody() != null) {
                return (Map<String, String>) resp.getBody();
            }
        } catch (RestClientException e) {
        }
        return Collections.emptyMap();
    }
}
