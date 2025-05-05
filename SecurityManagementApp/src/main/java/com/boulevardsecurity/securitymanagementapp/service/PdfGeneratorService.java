//package com.boulevardsecurity.securitymanagementapp.service;
//
//import com.boulevardsecurity.securitymanagementapp.model.*;
//import com.openhtmltopdf.pdfboxout.PdfRendererBuilder;
//import org.springframework.stereotype.Service;
//
//import java.io.ByteArrayOutputStream;
//
//@Service
//public class PdfGeneratorService {
//
//    /**
//     * Génère un PDF (en bytes) pour une facture donnée.
//     */
//    public byte[] generateFacturePdf(Facture facture) {
//        // 1) Construire du HTML (ici, on le fait "en dur")
//        String htmlContent = buildFactureHtml(facture);
//
//        // 2) Convertir HTML → PDF avec openhtmltopdf
//        try (ByteArrayOutputStream outputStream = new ByteArrayOutputStream()) {
//            PdfRendererBuilder builder = new PdfRendererBuilder();
//            builder.useFastMode();
//            builder.withHtmlContent(htmlContent, null);
//            builder.toStream(outputStream);
//            builder.run();
//            return outputStream.toByteArray();
//        } catch (Exception e) {
//            throw new RuntimeException("Erreur lors de la génération du PDF", e);
//        }
//    }
//
//    /**
//     * Construit une chaîne HTML basique pour la Facture.
//     */
//    private String buildFactureHtml(Facture facture) {
//        return """
//                <!DOCTYPE html>
//                <html>
//                  <head>
//                    <meta charset="UTF-8"/>
//                    <title>Facture</title>
//                  </head>
//                  <body>
//                    <h1>Facture #%s</h1>
//                    <p>Date d'émission : %s</p>
//                    <p>Statut : %s</p>
//
//                    <hr/>
//                    <h3>Détails :</h3>
//                    <p>Total HT : %s</p>
//                    <p>TVA : %s %%</p>
//                    <p>Total TTC : %s</p>
//
//                    <!-- Exemple : si tu veux afficher le client -->
//                    <p>Client : %s</p>
//                  </body>
//                </html>
//                """.formatted(
//                facture.getNumeroFacture(),
//                facture.getDateEmission(),
//                facture.getStatut(),
//                facture.getTotalHT(),
//                facture.getTauxTVA(),
//                facture.getTotalTTC(),
//                (facture.getClient() != null)
//                        ? facture.getClient().getNom() + " (" + facture.getClient().getEmail() + ")"
//                        : "N/A"
//        );
//    }
//
//// ========================================================================
//    // ==================== PARTIE DEVIS PDF ICI ==============================
//    // ========================================================================
//
//    /**
//     * Génère un PDF (en bytes) pour un devis donné.
//     */
//    public byte[] generateDevisPdf(Devis devis) {
//        // 1) Construire du HTML
//        String htmlContent = buildDevisHtml(devis);
//
//        // 2) Convertir HTML → PDF
//        try (ByteArrayOutputStream outputStream = new ByteArrayOutputStream()) {
//            PdfRendererBuilder builder = new PdfRendererBuilder();
//            builder.useFastMode();
//            builder.withHtmlContent(htmlContent, null);
//            builder.toStream(outputStream);
//            builder.run();
//            return outputStream.toByteArray();
//        } catch (Exception e) {
//            throw new RuntimeException("Erreur lors de la génération du PDF Devis", e);
//        }
//    }
//
//    /**
//     * Construit le HTML pour le Devis
//     */
//    private String buildDevisHtml(Devis devis) {
//
//        String clientStr = (devis.getClient() != null)
//                ? devis.getClient().getNom() + " (" + devis.getClient().getEmail() + ")"
//                : "N/A";
//
//        String entrepriseStr = (devis.getEntreprise() != null)
//                ? devis.getEntreprise().getNom() + " (" + devis.getEntreprise().getAdresse() + ")"
//                : "N/A";
//
//        // Missions ?
//        StringBuilder missionsHtml = new StringBuilder();
//        if (devis.getMissions() != null && !devis.getMissions().isEmpty()) {
//            missionsHtml.append("<h3>Liste des missions :</h3><ul>");
//            devis.getMissions().forEach(m -> {
//                missionsHtml.append("<li>")
//                        .append("Mission : ").append(m.getTitre()).append(" — ")
//                        .append("Description : ").append(m.getDescription())
//                        .append("</li>");
//            });
//            missionsHtml.append("</ul>");
//        }
//
//        return """
//                <!DOCTYPE html>
//                <html>
//                  <head>
//                    <meta charset="UTF-8"/>
//                    <title>Devis</title>
//                  </head>
//                  <body>
//                    <h1>Devis #%s</h1>
//                    <p>Date de création : %s</p>
//                    <p>Date de validité : %s</p>
//                    <p>Statut : %s</p>
//
//                    <hr/>
//                    <h3>Détails :</h3>
//                    <p>Description : %s</p>
//                    <p>Montant : %s €</p>
//                    <p>Montant HT : %s €</p>
//                    <p>TVA : %s €</p>
//                    <p>Montant TTC : %s €</p>
//                    <p>Conditions générales : %s</p>
//
//                    <hr/>
//                    <p>Client : %s</p>
//                    <p>Entreprise : %s</p>
//
//                    %s <!-- missionsHtml -->
//
//                  </body>
//                </html>
//                """.formatted(
//                devis.getReferenceDevis(),
//                devis.getDateCreation(),
//                devis.getDateValidite(),
//                devis.getStatut(),
//                devis.getDescription(),
//                devis.getMontant() != null ? devis.getMontant() : "N/A",
//                devis.getMontantHT() != null ? devis.getMontantHT() : "N/A",
//                devis.getMontantTVA() != null ? devis.getMontantTVA() : "N/A",
//                devis.getMontantTTC() != null ? devis.getMontantTTC() : "N/A",
//                (devis.getConditionsGenerales() != null ? devis.getConditionsGenerales() : ""),
//                clientStr,
//                entrepriseStr,
//                missionsHtml
//        );
//    }
//
//    // =====================================================
//    // ======= NOUVEAU : GÉNÉRER PDF POUR UNE FICHE DE PAIE =
//    // =====================================================
//    public byte[] generateFicheDePaiePdf(FicheDePaie fiche) {
//        // 1) Construire le HTML
//        String htmlContent = buildFicheDePaieHtml(fiche);
//
//        // 2) Convertir HTML → PDF via openhtmltopdf
//        try (ByteArrayOutputStream outputStream = new ByteArrayOutputStream()) {
//            PdfRendererBuilder builder = new PdfRendererBuilder();
//            builder.useFastMode();
//            builder.withHtmlContent(htmlContent, null);
//            builder.toStream(outputStream);
//            builder.run();
//
//            return outputStream.toByteArray();
//        } catch (Exception e) {
//            throw new RuntimeException("Erreur lors de la génération du PDF de la fiche de paie", e);
//        }
//    }
//
//    /**
//     * Construit le HTML pour la Fiche de Paie.
//     */
//    private String buildFicheDePaieHtml(FicheDePaie fiche) {
//
//        // Info sur le contrat ? (optionnel)
//        String contratInfo = "";
//        if (fiche.getContratDeTravail() != null) {
//            // Par exemple : afficher ID et typeContrat
//            contratInfo = """
//                    <p>Contrat ID : %d</p>
//                    <p>Type de contrat : %s</p>
//                    """.formatted(
//                    fiche.getContratDeTravail().getId(),
//                    fiche.getContratDeTravail().getTypeContrat()
//            );
//        }
//
//
//        // On peut afficher la période (ex: "du 01/01/2023 au 31/01/2023")
//        String periodeStr = "";
//        if (fiche.getDebutPeriode() != null && fiche.getFinPeriode() != null) {
//            periodeStr = "Du %s au %s".formatted(
//                    fiche.getDebutPeriode(),
//                    fiche.getFinPeriode()
//            );
//        } else {
//            periodeStr = "(période non renseignée)";
//        }
//
//        return """
//                <!DOCTYPE html>
//                <html>
//                  <head>
//                    <meta charset="UTF-8"/>
//                    <title>Fiche de Paie</title>
//                  </head>
//                  <body>
//                    <h1>Fiche de paie #%s</h1>
//                    <p>Date d'émission : %s</p>
//                    <p>Période : %s</p>
//
//                    <hr/>
//                    <h3>Détails du Salaire :</h3>
//                    <p>Salaire Brut : %.2f €</p>
//                    <p>Cotisations : %.2f €</p>
//                    <p>Salaire Net : %.2f €</p>
//
//                    <hr/>
//                    <p>Prime Nuit : %.2f €</p>
//                    <p>Prime Transport : %.2f €</p>
//
//                    <hr/>
//                    %s <!-- Contrat info -->
//
//                  </body>
//                </html>
//                """.formatted(
//                fiche.getReferenceBulletin(),
//                fiche.getDateEmission() != null ? fiche.getDateEmission() : "N/A",
//                periodeStr,
//                fiche.getSalaireBrut() != null ? fiche.getSalaireBrut() : 0.0,
//                fiche.getCotisations() != null ? fiche.getCotisations() : 0.0,
//                fiche.getSalaireNet() != null ? fiche.getSalaireNet() : 0.0,
//                fiche.getPrimeNuit() != null ? fiche.getPrimeNuit() : 0.0,
//                fiche.getPrimeTransport() != null ? fiche.getPrimeTransport() : 0.0,
//                contratInfo
//        );
//    }
//
//
//    /**
//     * Génère un PDF (sous forme de tableau d'octets) pour une CarteProfessionnelle donnée.
//     */
//    public byte[] generateCarteProPdf(CarteProfessionnelle carte) {
//        // 1) Construire le contenu HTML à partir de la carte
//        String htmlContent = buildCarteProHtml(carte);
//
//        // 2) Convertir le HTML en PDF à l'aide d'openhtmltopdf
//        try (ByteArrayOutputStream outputStream = new ByteArrayOutputStream()) {
//            PdfRendererBuilder builder = new PdfRendererBuilder();
//            builder.useFastMode();
//            // Le second paramètre représente l'URL de base en cas de références relatives dans le HTML (ici null)
//            builder.withHtmlContent(htmlContent, null);
//            builder.toStream(outputStream);
//            builder.run();
//            return outputStream.toByteArray();
//        } catch (Exception e) {
//            throw new RuntimeException("Erreur lors de la génération du PDF de la carte professionnelle", e);
//        }
//    }
//
//    /**
//     * Construit le HTML représentant la CarteProfessionnelle.
//     */
//    private String buildCarteProHtml(CarteProfessionnelle carte) {
//        // Récupération des informations de l'agent
//        String agentInfo = (carte.getAgentDeSecurite() != null)
//                ? carte.getAgentDeSecurite().getNom() + " " + carte.getAgentDeSecurite().getPrenom()
//                : "Agent inconnu";
//
//        String dateDebut = (carte.getDateDebut() != null) ? carte.getDateDebut().toString() : "N/A";
//        String dateFin = (carte.getDateFin() != null) ? carte.getDateFin().toString() : "N/A";
//
//        // Construit un HTML simple à personnaliser selon vos besoins
//        return """
//                <!DOCTYPE html>
//                <html>
//                  <head>
//                    <meta charset="UTF-8"/>
//                    <title>Carte Professionnelle</title>
//                    <style>
//                      body { font-family: Arial, sans-serif; }
//                      h1 { color: #333; }
//                      p { font-size: 14px; }
//                    </style>
//                  </head>
//                  <body>
//                    <h1>Carte Professionnelle</h1>
//                    <p><strong>Type :</strong> %s</p>
//                    <p><strong>Numéro :</strong> %s</p>
//                    <p><strong>Agent :</strong> %s</p>
//                    <p><strong>Date Début :</strong> %s</p>
//                    <p><strong>Date Fin :</strong> %s</p>
//                  </body>
//                </html>
//                """.formatted(
//                carte.getTypeCarte(),    // Par exemple "APS", "SSIAP", etc.
//                carte.getNumeroCarte(),  // Par exemple "CP-2025-001"
//                agentInfo,               // Nom et prénom de l'agent
//                dateDebut,               // Date de début
//                dateFin                  // Date de fin (ou "N/A")
//        );
//    }
//
//    /**
//     * Génère un PDF (sous forme de tableau d'octets) pour un planning donné.
//     *
//     * @param planning L'objet Planning à convertir en PDF.
//     * @return Le PDF généré sous forme de byte[].
//     */
//    public byte[] generatePlanningPdf(Planning planning) {
//        // 1) Construire le HTML à partir du planning
//        String htmlContent = buildPlanningHtml(planning);
//
//        // 2) Convertir le HTML en PDF avec openhtmltopdf
//        try (ByteArrayOutputStream outputStream = new ByteArrayOutputStream()) {
//            PdfRendererBuilder builder = new PdfRendererBuilder();
//            builder.useFastMode();
//            // Le second paramètre est l'URL base, ici non utilisée (null)
//            builder.withHtmlContent(htmlContent, null);
//            builder.toStream(outputStream);
//            builder.run();
//            return outputStream.toByteArray();
//        } catch (Exception e) {
//            throw new RuntimeException("Erreur lors de la génération du PDF du planning", e);
//        }
//    }
//
//    /**
//     * Construit le HTML qui représente le planning.
//     *
//     * @param planning L'objet Planning dont on veut générer le PDF.
//     * @return Le contenu HTML sous forme de String.
//     */
//    private String buildPlanningHtml(Planning planning) {
//        // Construit la partie missions (si présentes)
//        StringBuilder missionsHtml = new StringBuilder();
//        if (planning.getMissions() != null && !planning.getMissions().isEmpty()) {
//            missionsHtml.append("<h3>Missions du planning :</h3><ul>");
//            planning.getMissions().forEach(mission -> {
//                // Ici, on suppose que l'objet Mission possède les méthodes getTitre() et getDescription()
//                missionsHtml.append("<li>")
//                        .append("Mission : ").append(mission.getTitre())
//                        .append(" - Description : ").append(mission.getDescription())
//                        .append("</li>");
//            });
//            missionsHtml.append("</ul>");
//        } else {
//            missionsHtml.append("<p>Aucune mission associée.</p>");
//        }
//
//        // Création du HTML complet pour le planning
//        return """
//                <!DOCTYPE html>
//                <html>
//                  <head>
//                    <meta charset="UTF-8"/>
//                    <title>Planning</title>
//                    <style>
//                      body { font-family: Arial, sans-serif; margin: 20px; }
//                      h1, h3 { color: #333; }
//                      p { font-size: 14px; }
//                      ul { list-style-type: disc; margin-left: 20px; }
//                    </style>
//                  </head>
//                  <body>
//                    <h1>Planning</h1>
//                    <p><strong>ID :</strong> %d</p>
//                    <p><strong>Date de création :</strong> %s</p>
//                    <p><strong>Date de modification :</strong> %s</p>
//                    %s
//                  </body>
//                </html>
//                """.formatted(
//                planning.getId(),
//                planning.getDateCreation() != null ? planning.getDateCreation().toString() : "N/A",
//                planning.getDateModification() != null ? planning.getDateModification().toString() : "N/A",
//                missionsHtml.toString()
//        );
//    }
//
//
//    // =========================
//    // Génération du PDF pour un RapportIntervention
//    // =========================
//    public byte[] generateRapportInterventionPdf(RapportIntervention rapport) {
//        String htmlContent = buildRapportInterventionHtml(rapport);
//        try (ByteArrayOutputStream outputStream = new ByteArrayOutputStream()) {
//            PdfRendererBuilder builder = new PdfRendererBuilder();
//            builder.useFastMode();
//            // Le deuxième paramètre correspond à l'URL de base (ici null)
//            builder.withHtmlContent(htmlContent, null);
//            builder.toStream(outputStream);
//            builder.run();
//            return outputStream.toByteArray();
//        } catch (Exception e) {
//            throw new RuntimeException("Erreur lors de la génération du PDF du rapport d'intervention", e);
//        }
//    }
//
//    /**
//     * Construit le HTML pour représenter le RapportIntervention.
//     */
//    private String buildRapportInterventionHtml(RapportIntervention rapport) {
//        // Exemple d'affichage des informations du rapport
//        return """
//                <!DOCTYPE html>
//                <html>
//                  <head>
//                    <meta charset="UTF-8"/>
//                    <title>Rapport d'Intervention</title>
//                    <style>
//                      body { font-family: Arial, sans-serif; margin: 20px; }
//                      h1 { color: #333; }
//                      p { font-size: 14px; }
//                    </style>
//                  </head>
//                  <body>
//                    <h1>Rapport d'Intervention #%s</h1>
//                    <p><strong>Date d'intervention :</strong> %s</p>
//                    <p><strong>Description :</strong> %s</p>
//                    <p><strong>Agent :</strong> %s</p>
//                    <p><strong>Email de l'agent :</strong> %s</p>
//                    <p><strong>Téléphone de l'agent :</strong> %s</p>
//                    <p><strong>Contenu :</strong> %s</p>
//                    <p><strong>Status :</strong> %s</p>
//                    <p><strong>Date Création :</strong> %s</p>
//                    <p><strong>Date Modification :</strong> %s</p>
//                  </body>
//                </html>
//                """.formatted(
//                rapport.getId(),
//                rapport.getDateIntervention() != null ? rapport.getDateIntervention().toString() : "N/A",
//                rapport.getDescription() != null ? rapport.getDescription() : "N/A",
//                rapport.getAgentNom() != null ? rapport.getAgentNom() : "N/A",
//                rapport.getAgentEmail() != null ? rapport.getAgentEmail() : "N/A",
//                rapport.getAgentTelephone() != null ? rapport.getAgentTelephone() : "N/A",
//                rapport.getContenu() != null ? rapport.getContenu() : "N/A",
//                rapport.getStatus() != null ? rapport.getStatus() : "N/A",
//                rapport.getDateCreation() != null ? rapport.getDateCreation() : "N/A",
//                rapport.getDateModification() != null ? rapport.getDateModification() : "N/A"
//        );
//    }
//
//    public byte[] generateContratDeTravailPdf(ContratDeTravail contrat) {
//        String htmlContent = buildContratHtml(contrat);
//
//        try (ByteArrayOutputStream outputStream = new ByteArrayOutputStream()) {
//            PdfRendererBuilder builder = new PdfRendererBuilder();
//            builder.useFastMode();
//            builder.withHtmlContent(htmlContent, null);
//            builder.toStream(outputStream);
//            builder.run();
//            return outputStream.toByteArray();
//        } catch (Exception e) {
//            throw new RuntimeException("Erreur lors de la génération du PDF du contrat de travail", e);
//        }
//    }
//
//    private String buildContratHtml(ContratDeTravail contrat) {
//        String agent = contrat.getAgentDeSecurite() != null
//                ? contrat.getAgentDeSecurite().getNom() + " " + contrat.getAgentDeSecurite().getPrenom()
//                : "Inconnu";
//
//        return """
//                <!DOCTYPE html>
//                <html>
//                  <head>
//                    <meta charset="UTF-8"/>
//                    <title>Contrat de Travail</title>
//                  </head>
//                  <body>
//                    <h1>Contrat de Travail</h1>
//                    <p><strong>Agent :</strong> %s</p>
//                    <p><strong>Type de contrat :</strong> %s</p>
//                    <p><strong>Date de début :</strong> %s</p>
//                    <p><strong>Date de fin :</strong> %s</p>
//                    <p><strong>Salaire de base :</strong> %.2f €</p>
//                  </body>
//                </html>
//                """.formatted(
//                agent,
//                contrat.getTypeContrat(),
//                contrat.getDateDebut() != null ? contrat.getDateDebut().toString() : "Non renseignée",
//                contrat.getDateFin() != null ? contrat.getDateFin().toString() : "Non renseignée",
//                contrat.getSalaireDeBase() != null ? contrat.getSalaireDeBase() : 0.0
//        );
//    }
//
//
//    public byte[] generateContratPdf(Contrat contrat) {
//        String htmlContent = buildContratHtml(contrat);
//
//        try (ByteArrayOutputStream outputStream = new ByteArrayOutputStream()) {
//            PdfRendererBuilder builder = new PdfRendererBuilder();
//            builder.useFastMode();
//            builder.withHtmlContent(htmlContent, null);
//            builder.toStream(outputStream);
//            builder.run();
//            return outputStream.toByteArray();
//        } catch (Exception e) {
//            throw new RuntimeException("Erreur lors de la génération du PDF du contrat", e);
//        }
//    }
//
//    private String buildContratHtml(Contrat contrat) {
//        String client = contrat.getClient() != null
//                ? contrat.getClient().getNom()
//                : "Inconnu";
//
//        String entreprise = contrat.getEntreprise() != null
//                ? contrat.getEntreprise().getNom()
//                : "Inconnue";
//
//        String missionsHtml = "";
//        if (contrat.getMissions() != null && !contrat.getMissions().isEmpty()) {
//            StringBuilder sb = new StringBuilder("<ul>");
//            contrat.getMissions().forEach(m -> sb.append("<li>").append(m.getTitre()).append("</li>"));
//            sb.append("</ul>");
//            missionsHtml = sb.toString();
//        }
//
//        return """
//                <!DOCTYPE html>
//                <html>
//                  <head>
//                    <meta charset="UTF-8"/>
//                    <title>Contrat</title>
//                  </head>
//                  <body>
//                    <h1>Contrat</h1>
//                    <p><strong>Date début :</strong> %s</p>
//                    <p><strong>Date fin :</strong> %s</p>
//                    <p><strong>Montant :</strong> %s €</p>
//                    <p><strong>Client :</strong> %s</p>
//                    <p><strong>Entreprise :</strong> %s</p>
//                    <p><strong>Missions :</strong> %s</p>
//                    <hr/>
//                    <p><strong>Contenu :</strong></p>
//                    <p>%s</p>
//                  </body>
//                </html>
//                """.formatted(
//                contrat.getDateDebut() != null ? contrat.getDateDebut().toString() : "Non renseignée",
//                contrat.getDateFin() != null ? contrat.getDateFin().toString() : "Non renseignée",
//                contrat.getMontant() != null ? contrat.getMontant().toPlainString() : "0.00",
//                client,
//                entreprise,
//                missionsHtml,
//                contrat.getContenuContrat() != null ? contrat.getContenuContrat() : ""
//        );
//    }
//}
