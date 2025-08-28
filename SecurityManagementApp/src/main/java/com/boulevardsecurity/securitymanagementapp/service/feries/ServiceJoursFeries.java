// src/main/java/com/boulevardsecurity/securitymanagementapp/service/feries/ServiceJoursFeries.java
package com.boulevardsecurity.securitymanagementapp.service.feries;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.util.*;
import java.util.concurrent.ConcurrentHashMap;

@Service
public class ServiceJoursFeries {

    private final JoursFeriesApiClient apiClient;
    private final int nbAnneesMaxEnCache;

    // Cache année -> Set<LocalDate>
    private final Map<Integer, Set<LocalDate>> cacheParAnnee = new ConcurrentHashMap<>();
    // mini-LRU pour éviter que le cache ne grossisse trop
    private final Deque<Integer> lru = new ArrayDeque<>();

    public ServiceJoursFeries(JoursFeriesApiClient apiClient,
                              @Value("${feries.cache-years:5}") int nbAnneesMaxEnCache) {
        this.apiClient = apiClient;
        this.nbAnneesMaxEnCache = Math.max(1, nbAnneesMaxEnCache);
    }

    /** Renvoie true si la date est fériée (zone configurée). */
    public boolean estFerie(LocalDate date) {
        int annee = date.getYear();
        Set<LocalDate> feries = cacheParAnnee.computeIfAbsent(annee, this::chargerAnnee);
        toucher(annee);
        return feries.contains(date);
    }

    /** Liste des fériés pour une année donnée. */
    public Set<LocalDate> joursFeriesDeLAnnee(int annee) {
        Set<LocalDate> feries = cacheParAnnee.computeIfAbsent(annee, this::chargerAnnee);
        toucher(annee);
        return Collections.unmodifiableSet(feries);
    }

    private Set<LocalDate> chargerAnnee(int annee) {
        Map<String, String> json = apiClient.recupererAnnee(annee);
        if (json.isEmpty()) {
            // secours: multi-années puis filtrage par yyyy-
            Map<String, String> toutes = apiClient.recupererToutesAnnees();
            if (!toutes.isEmpty()) {
                Set<LocalDate> set = new HashSet<>();
                toutes.keySet().stream()
                        .filter(s -> s != null && s.startsWith(annee + "-"))
                        .forEach(s -> set.add(LocalDate.parse(s)));
                evicterSiNecessaire(annee);
                return set;
            }
            return Collections.emptySet();
        }
        Set<LocalDate> set = new HashSet<>();
        json.keySet().forEach(s -> set.add(LocalDate.parse(s)));
        evicterSiNecessaire(annee);
        return set;
    }

    private void evicterSiNecessaire(int anneeChargee) {
        lru.addLast(anneeChargee);
        while (cacheParAnnee.size() > nbAnneesMaxEnCache) {
            Integer plusAncienne = lru.pollFirst();
            if (plusAncienne != null && !plusAncienne.equals(anneeChargee)) {
                cacheParAnnee.remove(plusAncienne);
            }
        }
    }

    private void toucher(int annee) {
        lru.remove(annee);
        lru.addLast(annee);
    }
}
