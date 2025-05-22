// src/main/java/com/boulevardsecurity/securitymanagementapp/service/TarificationDomainService.java
package com.boulevardsecurity.securitymanagementapp.service;

import com.boulevardsecurity.securitymanagementapp.Enums.TypeMission;
import com.boulevardsecurity.securitymanagementapp.model.Mission;
import com.boulevardsecurity.securitymanagementapp.model.TarifMission;
import com.boulevardsecurity.securitymanagementapp.repository.TarifMissionRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.*;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;

@Service
@RequiredArgsConstructor
public class TarificationDomainService {

  /* ==== constantes ==== */
  private static final LocalTime DEBUT_NUIT = LocalTime.of(21, 0);
  private static final LocalTime FIN_NUIT   = LocalTime.of(6 , 0);

  /* ==== dépendances ==== */
  private final TarifMissionRepository tarifMissionRepository;
  private final JourFerieService       jourFerieService;

  /* ==== cache “maison” des tarifs ==== */
  private final Map<TypeMission, TarifMission> tarifCache = new ConcurrentHashMap<>();

  /* --------------------------------------------------------- */
  /*              CALCULS PRINCIPAUX                           */
  /* --------------------------------------------------------- */

  /**
   * Calcul du montant HT d’une mission en appliquant les majorations
   * (nuit, week-end, dimanche, jours fériés).
   */
  public BigDecimal montantHT(Mission m) {

    LocalDateTime debut = LocalDateTime.of(m.getDateDebut(), m.getHeureDebut());
    LocalDateTime fin   = LocalDateTime.of(m.getDateFin()  , m.getHeureFin());

    BigDecimal totalHT = BigDecimal.ZERO;

    LocalDateTime courant = debut;
    while (courant.isBefore(fin)) {

      LocalDateTime trancheFin = courant.plusHours(1).isAfter(fin) ? fin : courant.plusHours(1);

      BigDecimal prixBase = m.getTarif().getPrixUnitaireHT();
      BigDecimal majoration = BigDecimal.ZERO;

      if (jourFerieService.estFerie(courant.toLocalDate())) {
        majoration = majoration.add(m.getTarif().getMajorationFerie());
      } else {
        if (isWeekend(courant.toLocalDate())) {
          majoration = majoration.add(m.getTarif().getMajorationWeekend());
        }
        if (isDimanche(courant.toLocalDate())) {
          majoration = majoration.add(m.getTarif().getMajorationDimanche());
        }
        if (isNuit(courant.toLocalTime())) {
          majoration = majoration.add(m.getTarif().getMajorationNuit());
        }
      }

      BigDecimal prixHeure = prixBase.multiply(BigDecimal.ONE.add(majoration));

      BigDecimal proportion =
              BigDecimal.valueOf(Duration.between(courant, trancheFin).toMinutes() / 60.0);

      totalHT = totalHT.add(prixHeure.multiply(proportion));

      courant = trancheFin;
    }

    return totalHT
            .multiply(BigDecimal.valueOf(m.getNombreAgents()))
            .multiply(BigDecimal.valueOf(m.getQuantite()))
            .setScale(2, RoundingMode.HALF_UP);
  }

  public BigDecimal tva(BigDecimal ht, BigDecimal taux) {
    return ht.multiply(taux).setScale(2, RoundingMode.HALF_UP); }
  public BigDecimal ttc(BigDecimal ht, BigDecimal tva) {
    return ht.add(tva).setScale(2, RoundingMode.HALF_UP); }

  /* --------------------------------------------------------- */
  /*              utilitaires date/heure                       */
  /* --------------------------------------------------------- */

  private boolean isNuit(LocalTime t)   {
    return !t.isBefore(DEBUT_NUIT) || t.isBefore(FIN_NUIT); }
  private boolean isWeekend(LocalDate d){
    return d.getDayOfWeek() == DayOfWeek.SATURDAY; }  private boolean isDimanche(LocalDate d){
    return d.getDayOfWeek() == DayOfWeek.SUNDAY; }

  /* --------------------------------------------------------- */
  /*           méthode utilitaire pour appliquer le chiffrage  */
  /* --------------------------------------------------------- */
  
  /**
   * Méthode utilitaire pour appliquer le chiffrage à une mission
   */
  public void appliquerChiffrage(Mission mission) {
      if (mission.getTarif() == null) {
          return;
      }
      
      // Calcule le montant HT
      BigDecimal ht = montantHT(mission);
      
      // Calcule la TVA
      BigDecimal tva = tva(ht, mission.getTarif().getTauxTVA());
      
      // Stocke les montants calculés dans la mission
      mission.setMontantHT(ht);
      mission.setMontantTVA(tva);
      mission.setMontantTTC(ttc(ht, tva));
  }

  /* --------------------------------------------------------- */
  /*           accès tarif (avec mini-cache)                   */
  /* --------------------------------------------------------- */

  private TarifMission tarif(TypeMission type) {
    return tarifCache.computeIfAbsent(type,
            t -> tarifMissionRepository.findByTypeMission(t)
                    .orElseThrow(() -> new IllegalStateException("Tarif manquant : " + t)));
  }
}
