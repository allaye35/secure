package com.boulevardsecurity.securitymanagementapp.service;

import com.boulevardsecurity.securitymanagementapp.Enums.TypeMission;
import com.boulevardsecurity.securitymanagementapp.model.Mission;
import com.boulevardsecurity.securitymanagementapp.model.TarifMission;
import com.boulevardsecurity.securitymanagementapp.repository.TarifMissionRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.DayOfWeek;
import java.time.Duration;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.util.Collections;
import java.util.HashSet;
import java.util.Map;
import java.util.Set;
import java.util.concurrent.ConcurrentHashMap;

@Service
public class TarificationDomainService {

  // Définition des plages horaires pour la nuit (21h00 - 06h00)
  private static final LocalTime DEBUT_NUIT = LocalTime.of(21, 0);
  private static final LocalTime FIN_NUIT = LocalTime.of(6, 0);

  // Cache pour stocker les tarifs par type de mission
  private final Map<TypeMission, TarifMission> tarifCache = new ConcurrentHashMap<>();
  
  @Autowired
  private TarifMissionRepository tarifMissionRepository;

  // Set des jours fériés (à compléter selon les besoins)
  private static final Set<LocalDate> JOURS_FERIES_2025 = new HashSet<>();
  static {
    // Jours fériés français 2025
    Collections.addAll(JOURS_FERIES_2025,
        LocalDate.of(2025, 1, 1),  // Jour de l'an
        LocalDate.of(2025, 4, 21), // Lundi de Pâques
        LocalDate.of(2025, 5, 1),  // Fête du Travail
        LocalDate.of(2025, 5, 8),  // Victoire 1945
        LocalDate.of(2025, 5, 29), // Ascension
        LocalDate.of(2025, 6, 9),  // Lundi de Pentecôte
        LocalDate.of(2025, 7, 14), // Fête nationale
        LocalDate.of(2025, 8, 15), // Assomption
        LocalDate.of(2025, 11, 1), // Toussaint
        LocalDate.of(2025, 11, 11), // Armistice
        LocalDate.of(2025, 12, 25)  // Noël
    );
  }

  /**
   * Récupère le tarif mission correspondant au type de mission donné
   */
  private TarifMission getTarifByTypeMission(TypeMission typeMission) {
    // Utilisation d'un cache pour éviter des requêtes à répétition
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
    LocalDateTime fin = LocalDateTime.of(m.getDateFin(), m.getHeureFin());
    
    // Création de structures pour stocker les heures avec leurs majorations applicables
    // Chaque heure peut avoir plusieurs majorations
    BigDecimal totalMontantHT = BigDecimal.ZERO;
    
    // On décompose la mission en tranches horaires d'une heure
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
      
      // Les majorations sont désormais cumulatives
      BigDecimal totalMajoration = BigDecimal.ZERO;
      
      // Application des majorations selon les conditions
      // Jours fériés (toujours appliqué peu importe les autres conditions)
      if (isFerie(currentDate)) {
        totalMajoration = totalMajoration.add(m.getTarif().getMajorationFerie());
      } else {
        // Application cumulative des autres majorations si ce n'est pas férié
        // Weekend (samedi)
        if (isWeekend(currentDate)) {
          totalMajoration = totalMajoration.add(m.getTarif().getMajorationWeekend());
        }
        
        // Dimanche
        if (isDimanche(currentDate)) {
          totalMajoration = totalMajoration.add(m.getTarif().getMajorationDimanche());
        }
        
        // Heures de nuit
        if (isNuit(currentTime)) {
          totalMajoration = totalMajoration.add(m.getTarif().getMajorationNuit());
        }
      }
      
      // Calcul du montant pour cette heure avec toutes les majorations applicables
      if (totalMajoration.compareTo(BigDecimal.ZERO) > 0) {
        montantHeure = prixUnitaire.multiply(BigDecimal.ONE.add(totalMajoration));
      }
      
      // Pour une heure partielle, on calcule la proportion exacte
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
           (time.isBefore(FIN_NUIT)); // Correction: 6:00 n'est plus inclus
  }
  
  /**
   * Vérifie si la date donnée est un weekend (samedi ou dimanche)
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
   * Vérifie si la date donnée est un jour férié
   */
  private boolean isFerie(LocalDate date) {
    return JOURS_FERIES_2025.contains(date);
  }
}