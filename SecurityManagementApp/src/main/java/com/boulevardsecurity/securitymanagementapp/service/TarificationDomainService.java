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
    
    // Calcul des heures par type pour appliquer les différentes majorations
    int heuresNormales = 0;
    int heuresNuit = 0;
    int heuresWeekend = 0;
    int heuresDimanche = 0;
    int heuresFerie = 0;
    
    // On décompose la mission en tranches horaires d'une heure
    LocalDateTime current = debut;
    while (current.isBefore(fin)) {
      LocalDateTime nextHour = current.plusHours(1);
      if (nextHour.isAfter(fin)) {
        nextHour = fin;
      }
      
      LocalDate currentDate = current.toLocalDate();
      LocalTime currentTime = current.toLocalTime();
      
      // Vérifier le type d'heure pour cette tranche
      if (isFerie(currentDate)) {
        heuresFerie++;
      } else if (isDimanche(currentDate)) {
        heuresDimanche++;
      } else if (isWeekend(currentDate)) {
        heuresWeekend++;
      } else if (isNuit(currentTime)) {
        heuresNuit++;
      } else {
        heuresNormales++;
      }
      
      current = nextHour;
    }
    
    // Récupération du tarif spécifique au type de mission
    // Prix unitaire de base pour une heure normale, selon le type de mission
    BigDecimal prixUnitaire = m.getTarif().getPrixUnitaireHT();
    
    // Calcul du montant pour chaque type d'heure
    BigDecimal montantNormal = prixUnitaire.multiply(BigDecimal.valueOf(heuresNormales));
    
    BigDecimal montantNuit = prixUnitaire
        .multiply(BigDecimal.ONE.add(m.getTarif().getMajorationNuit()))
        .multiply(BigDecimal.valueOf(heuresNuit));
    
    BigDecimal montantWeekend = prixUnitaire
        .multiply(BigDecimal.ONE.add(m.getTarif().getMajorationWeekend()))
        .multiply(BigDecimal.valueOf(heuresWeekend));
    
    BigDecimal montantDimanche = prixUnitaire
        .multiply(BigDecimal.ONE.add(m.getTarif().getMajorationDimanche()))
        .multiply(BigDecimal.valueOf(heuresDimanche));
    
    BigDecimal montantFerie = prixUnitaire
        .multiply(BigDecimal.ONE.add(m.getTarif().getMajorationFerie()))
        .multiply(BigDecimal.valueOf(heuresFerie));
    
    // Somme de tous les montants
    BigDecimal totalHT = montantNormal
        .add(montantNuit)
        .add(montantWeekend)
        .add(montantDimanche)
        .add(montantFerie);
    
    // Multiplication par le nombre d'agents et la quantité
    return totalHT
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
           (time.isBefore(FIN_NUIT) || time.equals(FIN_NUIT));
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