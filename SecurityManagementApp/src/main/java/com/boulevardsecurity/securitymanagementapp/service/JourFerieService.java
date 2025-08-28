// src/main/java/com/boulevardsecurity/securitymanagementapp/service/JourFerieService.java
package com.boulevardsecurity.securitymanagementapp.service;

import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestClientException;
import org.springframework.web.client.RestTemplate;

import jakarta.annotation.PostConstruct;
import java.time.LocalDate;
import java.util.*;
import java.util.concurrent.ConcurrentHashMap;

/**
 * Service qui interroge l’API open-source Nager.Date :
 *   https://date.nager.at/api/v3/PublicHolidays/{year}/{countryCode}
 */
@Service
@Slf4j
public class JourFerieService {

    private static final String URL_TEMPLATE =
            "https://date.nager.at/api/v3/PublicHolidays/%d/%s";

    private final RestTemplate restTemplate;
    private final String countryCode;

    /** Cache : année → ensemble de jours fériés de cette année */
    private final Map<Integer, Set<LocalDate>> feriesParAnnee = new ConcurrentHashMap<>();

    public JourFerieService(RestTemplate restTemplate,
                            @Value("${app.pays.jours-feries:FR}") String countryCode) {
        this.restTemplate = restTemplate;
        this.countryCode  = countryCode;
    }

    /** Pré-charge l’année en cours au démarrage pour des perfs optimales */
    @PostConstruct
    public void preLoad() {
        int anneeCourante = LocalDate.now().getYear();
        chargerAnneeSiNecessaire(anneeCourante);
    }

    /**
     * @return true si la date passée est un jour férié pour le pays configuré.
     */
    public boolean estFerie(LocalDate date) {
        Objects.requireNonNull(date, "date ne doit pas être nulle");
        chargerAnneeSiNecessaire(date.getYear());
        return feriesParAnnee
                .getOrDefault(date.getYear(), Collections.emptySet())
                .contains(date);
    }

    /* ========== Implémentation interne ========== */

    private void chargerAnneeSiNecessaire(int year) {
        feriesParAnnee.computeIfAbsent(year, this::interrogerApiNager);
    }

    /** Appel distant (une seule fois par année) */
    private Set<LocalDate> interrogerApiNager(int year) {
        String url = String.format(URL_TEMPLATE, year, countryCode);
        try {
            log.info("Appel Nager.Date pour charger les jours fériés {} – {}", countryCode, year);
            NagerHolidayDto[] dtos = restTemplate.getForObject(url, NagerHolidayDto[].class);
            if (dtos == null) {
                log.warn("Réponse vide de Nager.Date {} {}", countryCode, year);
                return Collections.emptySet();
            }
            Set<LocalDate> result = new HashSet<>();
            for (NagerHolidayDto dto : dtos) {
                result.add(dto.date);
            }
            log.info("  → {} jours fériés chargés", result.size());
            return Collections.unmodifiableSet(result);
        } catch (RestClientException ex) {
            log.error("Erreur lors de l’appel à Nager.Date ({}) : {}", url, ex.getMessage());
            // En cas d’erreur on renvoie un set vide pour ne pas bloquer la facturation
            return Collections.emptySet();
        }
    }

    /** Projection minimale du JSON Nager.Date */
    private record NagerHolidayDto(LocalDate date, String localName, String name) {}
}
