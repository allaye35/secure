// src/main/java/com/boulevardsecurity/securitymanagementapp/service/TarificationDomainService.java
package com.boulevardsecurity.securitymanagementapp.service;

import com.boulevardsecurity.securitymanagementapp.Enums.TypeMission;
import com.boulevardsecurity.securitymanagementapp.model.Mission;
import com.boulevardsecurity.securitymanagementapp.model.TarifMission;
import com.boulevardsecurity.securitymanagementapp.repository.TarifMissionRepository;
import com.boulevardsecurity.securitymanagementapp.service.feries.ServiceJoursFeries;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.*;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;

@Service
public class TarificationDomainService {

  // Définition des plages horaires pour la nuit (21h00 - 06h00)
  private static final LocalTime DEBUT_NUIT = LocalTime.of(21, 0);
  private static final LocalTime FIN_NUIT   = LocalTime.of(6, 0);

  // Cache pour stocker les tarifs par type de mission
  private final Map<TypeMission, TarifMission> tarifCache = new ConcurrentHashMap<>();

  @Autowired
  private TarifMissionRepository tarifMissionRepository;

  @Autowired
  private ServiceJoursFeries serviceJoursFeries;

  /**
   * Récupère le tarif mission correspondant au type de mission donné
   */
  private TarifMission getTarifByTypeMission(TypeMission typeMission) {
    return tarifCache.computeIfAbsent(typeMission, type ->
        tarifMissionRepository.findByTypeMission(type)
            .orElseThrow(() -> new IllegalStateException("Tarif non trouvé pour le type de mission: " + type)));
  }

  /**
   * Calcule le montant HT d'une mission en tenant compte des majorations
   * pour heures de nuit, weekend, dimanche et jours fériés, et du type de mission
   */
  public BigDecimal montantHT(Mission m) {
    LocalDateTime debut = LocalDateTime.of(m.getDateDebut(), m.getHeureDebut());
    LocalDateTime fin   = LocalDateTime.of(m.getDateFin(),   m.getHeureFin());

    BigDecimal totalMontantHT = BigDecimal.ZERO;

    LocalDateTime current = debut;
    while (current.isBefore(fin)) {

      LocalDateTime nextHour = current.plusHours(1);
      if (nextHour.isAfter(fin)) {
        nextHour = fin;
      }

      LocalDate currentDate = current.toLocalDate();
      LocalTime currentTime = current.toLocalTime();

      // Prix unitaire de base pour une heure normale, selon le type de mission
      BigDecimal prixUnitaire = m.getTarif().getPrixUnitaireHT();
      BigDecimal montantHeure = prixUnitaire;

      // Les majorations sont cumulatives
      BigDecimal totalMajoration = BigDecimal.ZERO;

      // Jours fériés (toujours appliqué)
      if (isFerie(currentDate)) {
        if (m.getTarif().getMajorationFerie() != null) {
          totalMajoration = totalMajoration.add(m.getTarif().getMajorationFerie());
        }
      } else {
        // Weekend (samedi)
        if (isWeekend(currentDate) && m.getTarif().getMajorationWeekend() != null) {
          totalMajoration = totalMajoration.add(m.getTarif().getMajorationWeekend());
        }

        // Dimanche
        if (isDimanche(currentDate) && m.getTarif().getMajorationDimanche() != null) {
          totalMajoration = totalMajoration.add(m.getTarif().getMajorationDimanche());
        }

        // Heures de nuit
        if (isNuit(currentTime) && m.getTarif().getMajorationNuit() != null) {
          totalMajoration = totalMajoration.add(m.getTarif().getMajorationNuit());
        }
      }

      // Montant horaire avec majorations
      if (totalMajoration.compareTo(BigDecimal.ZERO) > 0) {
        montantHeure = prixUnitaire.multiply(BigDecimal.ONE.add(totalMajoration));
      }

      // Proportion si heure partielle
      BigDecimal proportionHeure = BigDecimal.valueOf(
          (double) Duration.between(current, nextHour).toMinutes() / 60.0);

      montantHeure = montantHeure.multiply(proportionHeure);
      totalMontantHT = totalMontantHT.add(montantHeure);

      current = nextHour;
    }

    // Multiplication par le nombre d'agents et la quantité
    return totalMontantHT
        .multiply(BigDecimal.valueOf(m.getNombreAgents()))
        .multiply(BigDecimal.valueOf(m.getQuantite()))
        .setScale(2, RoundingMode.HALF_UP);
  }

  public BigDecimal tva(BigDecimal ht, BigDecimal taux) {
    return ht.multiply(taux).setScale(2, RoundingMode.HALF_UP);
  }

  public BigDecimal ttc(BigDecimal ht, BigDecimal tva) {
    return ht.add(tva).setScale(2, RoundingMode.HALF_UP);
  }

  /**
   * Vérifie si l'heure donnée fait partie des heures de nuit
   */
  private boolean isNuit(LocalTime time) {
    return (time.isAfter(DEBUT_NUIT) || time.equals(DEBUT_NUIT)) ||
           (time.isBefore(FIN_NUIT)); // 6:00 non inclus
  }

  /**
   * Vérifie si la date donnée est un weekend (samedi)
   */
  private boolean isWeekend(LocalDate date) {
    DayOfWeek day = date.getDayOfWeek();
    return day == DayOfWeek.SATURDAY;  // Le dimanche est géré séparément
  }

  /**
   * Vérifie si la date donnée est un dimanche
   */
  private boolean isDimanche(LocalDate date) {
    return date.getDayOfWeek() == DayOfWeek.SUNDAY;
  }

  /**
   * Vérifie si la date donnée est un jour férié (via l'API + cache)
   */
  private boolean isFerie(LocalDate date) {
    return serviceJoursFeries.estFerie(date);
  }
}
