import React, { useEffect, useState } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { FaFileInvoice, FaPrint, FaEdit, FaArrowLeft, FaDownload, FaFileAlt, FaInfoCircle } from "react-icons/fa";
import FactureService from "../../services/FactureService";
import ClientService from "../../services/ClientService";
import EntrepriseService from "../../services/EntrepriseService";
import MissionService from "../../services/MissionService";
import DevisService from "../../services/DevisService";
import "../../styles/FactureDetail.css";

export default function FactureDetail() {
    const { id } = useParams();
    const navigate = useNavigate();
    const [facture, setFacture] = useState(null);
    const [client, setClient] = useState(null);
    const [entreprise, setEntreprise] = useState(null);
    const [missions, setMissions] = useState([]);
    const [devis, setDevis] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    useEffect(() => {
        setLoading(true);
        setError("");

        // Récupérer les détails de la facture
        FactureService.getById(id)
            .then(({ data }) => {
                console.log("Facture récupérée:", data);
                setFacture(data);
                
                // Stocker les promesses à résoudre
                const promises = [];
                
                // Récupérer les infos du client
                if (data.clientId) {
                    promises.push(
                        ClientService.getById(data.clientId)
                            .then(res => {
                                console.log("Client récupéré:", res.data);
                                setClient(res.data);
                            })
                            .catch(err => {
                                console.error("Erreur lors du chargement du client:", err);
                                setError("Impossible de charger les informations du client");
                            })
                    );
                }
                
                // Récupérer les infos de l'entreprise - CORRECTION : utiliser getEntrepriseById au lieu de getById
                if (data.entrepriseId) {
                    promises.push(
                        EntrepriseService.getEntrepriseById(data.entrepriseId)
                            .then(res => {
                                console.log("Entreprise récupérée:", res.data);
                                setEntreprise(res.data);
                            })
                            .catch(err => {
                                console.error("Erreur lors du chargement de l'entreprise:", err);
                                setError("Impossible de charger les informations de l'entreprise");
                            })
                    );
                }
                
                // Récupérer les infos du devis si présent
                if (data.devisId) {
                    promises.push(
                        DevisService.getById(data.devisId)
                            .then(res => {
                                console.log("Devis récupéré:", res.data);
                                setDevis(res.data);
                            })
                            .catch(err => {
                                console.error("Erreur lors du chargement du devis:", err);
                            })
                    );
                }
                
                // Récupérer les missions associées
                if (data.missionIds && data.missionIds.length > 0) {
                    const missionPromises = data.missionIds.map(missionId => 
                        MissionService.getMissionById(missionId)
                            .then(response => response.data)
                            .catch(err => {
                                console.error(`Erreur lors du chargement de la mission ${missionId}:`, err);
                                return null;
                            })
                    );
                    
                    promises.push(
                        Promise.all(missionPromises)
                            .then(missionsData => {
                                console.log("Missions récupérées:", missionsData);
                                setMissions(missionsData.filter(m => m !== null));
                            })
                    );
                }
                
                // Attendre que toutes les promesses soient résolues
                return Promise.all(promises);
            })
            .then(() => {
                setLoading(false);
            })
            .catch(err => {
                console.error("Erreur lors du chargement des données:", err);
                setError("Impossible de charger les détails de la facture");
                setLoading(false);
            });
    }, [id]);

    // Formatter les dates dans un format plus lisible
    const formatDate = (dateString) => {
        if (!dateString) return "-";
        const date = new Date(dateString);
        return date.toLocaleDateString('fr-FR', { 
            day: '2-digit', 
            month: '2-digit', 
            year: 'numeric' 
        });
    };

    // Formatter les montants avec 2 décimales et séparateur de milliers
    const formatMontant = (montant) => {
        if (montant === null || montant === undefined) return "-";
        return parseFloat(montant).toLocaleString('fr-FR', {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2
        }) + " €";
    };

    // Obtenir la classe CSS pour le statut
    const getStatusClass = (statut) => {
        switch (statut) {
            case "PAYEE":
                return "status-paid";
            case "EN_RETARD":
                return "status-late";
            case "EN_ATTENTE":
                return "status-pending";
            default:
                return "";
        }
    };

    // Imprimer la facture
    const handlePrint = () => {
        window.print();
    };

    // Télécharger en tant que PDF
    const handleDownload = () => {
        // Message d'information spécifique indiquant que l'endpoint backend n'est pas implémenté
        const confirmAction = window.confirm(
            "L'endpoint API backend '/factures/{id}/pdf' n'est pas encore implémenté sur le serveur.\n\n" +
            "Pour résoudre ce problème, vous devez implémenter l'endpoint suivant côté serveur :\n" +
            "GET /api/factures/{id}/pdf qui génère et renvoie un fichier PDF.\n\n" +
            "Souhaitez-vous utiliser l'option d'impression du navigateur comme alternative ?"
        );
        
        if (confirmAction) {
            // Ouvrir la vue d'impression dans un nouvel onglet
            window.open(`/factures/print/${id}`, '_blank');
        } else {
            // Essayer quand même si l'utilisateur insiste
            const tryAnyway = window.confirm("Voulez-vous quand même essayer l'appel à l'API? (Générera une erreur 404)");
            
            if (tryAnyway) {
                setLoading(true);
                FactureService.getPdf(id)
                    .then(response => {
                        // Créer un URL pour le blob PDF
                        const url = window.URL.createObjectURL(new Blob([response.data]));
                        
                        // Créer un lien de téléchargement temporaire
                        const link = document.createElement('a');
                        link.href = url;
                        
                        // Définir le nom du fichier téléchargé
                        const filename = `facture-${facture.referenceFacture || id}.pdf`;
                        link.setAttribute('download', filename);
                        
                        // Ajouter le lien au DOM, cliquer dessus, puis le supprimer
                        document.body.appendChild(link);
                        link.click();
                        document.body.removeChild(link);
                        
                        // Libérer l'URL de l'objet après le téléchargement
                        window.URL.revokeObjectURL(url);
                        setLoading(false);
                    })
                    .catch(err => {
                        console.error("Erreur lors du téléchargement du PDF:", err);
                        setLoading(false);
                        alert("Erreur 404 : L'endpoint API '/factures/{id}/pdf' n'est pas implémenté sur le serveur backend.");
                    });
            }
        }
    };

    if (error) {
        return (
            <div className="error-container">
                <FaInfoCircle className="error-icon" />
                <h2>Erreur</h2>
                <p className="error-message">{error}</p>
                <button onClick={() => navigate("/factures")} className="btn-secondary">
                    <FaArrowLeft /> Retour à la liste
                </button>
            </div>
        );
    }

    if (loading || !facture) {
        return (
            <div className="loading-container">
                <div className="loading-spinner"></div>
                <p>Chargement des détails de la facture...</p>
            </div>
        );
    }

    return (
        <div className="facture-detail">
            <div className="facture-header">
                <div className="facture-title">
                    <FaFileInvoice className="facture-icon" />
                    <h1>Facture #{facture.referenceFacture}</h1>
                </div>
                <div className="facture-actions">
                    <button onClick={handlePrint} className="btn-action">
                        <FaPrint /> Imprimer
                    </button>
                    <button onClick={handleDownload} className="btn-action">
                        <FaDownload /> Télécharger PDF
                    </button>
                    <Link to={`/factures/edit/${id}`} className="btn-action">
                        <FaEdit /> Modifier
                    </Link>
                    <button onClick={() => navigate("/factures")} className="btn-action">
                        <FaArrowLeft /> Retour
                    </button>
                </div>
            </div>

            <div className="facture-status-bar">
                <div className={`facture-status ${getStatusClass(facture.statut)}`}>
                    Statut: {facture.statut}
                </div>
                <div className="facture-date">
                    Date d'émission: {formatDate(facture.dateEmission)}
                </div>
                {facture.dateDebut && facture.dateFin && (
                    <div className="facture-period">
                        Période: {formatDate(facture.dateDebut)} - {formatDate(facture.dateFin)}
                    </div>
                )}
                {devis && (
                    <div className="facture-devis">
                        <FaFileAlt /> Devis: {devis.referenceDevis || `#${devis.id}`}
                    </div>
                )}
            </div>

            <div className="facture-content">
                <div className="facture-parties">
                    <div className="facture-party company">
                        <h3>Émetteur</h3>
                        {entreprise ? (
                            <>
                                <p className="party-name">{entreprise.nom}</p>
                                <p>{entreprise.adresse || 'Adresse non spécifiée'}</p>
                                <p>{entreprise.codePostal || ''} {entreprise.ville || ''}</p>
                                <p>SIREN: {entreprise.siren || 'Non spécifié'}</p>
                                <p>Tél: {entreprise.telephone || 'Non spécifié'}</p>
                                <p>Email: {entreprise.email || 'Non spécifié'}</p>
                            </>
                        ) : (
                            <p>Informations entreprise non disponibles</p>
                        )}
                    </div>

                    <div className="facture-party client">
                        <h3>Client</h3>
                        {client ? (
                            <>
                                <p className="party-name">{client.nom} {client.prenom || ''}</p>
                                <p>{client.adresse || 'Adresse non spécifiée'}</p>
                                <p>{client.codePostal || ''} {client.ville || ''}</p>
                                {client.numeroSiret && <p>SIRET: {client.numeroSiret}</p>}
                                <p>Tél: {client.telephone || 'Non spécifié'}</p>
                                <p>Email: {client.email || 'Non spécifié'}</p>
                            </>
                        ) : (
                            <p>Informations client non disponibles</p>
                        )}
                    </div>
                </div>

                <div className="facture-details">
                    <h3>Détails de la facture</h3>
                    
                    {missions.length > 0 ? (
                        <div className="missions-table-container">
                            <table className="missions-table">
                                <thead>
                                    <tr>
                                        <th>Description</th>
                                        <th>Période</th>
                                        <th>Type</th>
                                        <th>Agents</th>
                                        <th>Quantité</th>
                                        <th>Montant HT</th>
                                        <th>TVA</th>
                                        <th>Montant TTC</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {missions.map(mission => (
                                        <tr key={mission.id}>
                                            <td>{mission.titre || `Mission #${mission.id}`}</td>
                                            <td>
                                                {formatDate(mission.dateDebut)} - {formatDate(mission.dateFin)}
                                            </td>
                                            <td>{mission.typeMission || 'Standard'}</td>
                                            <td>{mission.nombreAgents || 1}</td>
                                            <td>{mission.quantite || 1}</td>
                                            <td>{formatMontant(mission.montantHT)}</td>
                                            <td>{formatMontant(mission.montantTVA)}</td>
                                            <td>{formatMontant(mission.montantTTC)}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    ) : (
                        <p className="no-missions">Aucune mission associée à cette facture</p>
                    )}

                    <div className="facture-summary">
                        <div className="summary-item">
                            <span>Montant HT:</span>
                            <span className="amount">{formatMontant(facture.montantHT)}</span>
                        </div>
                        <div className="summary-item">
                            <span>TVA:</span>
                            <span className="amount">{formatMontant(facture.montantTVA)}</span>
                        </div>
                        <div className="summary-item total">
                            <span>Total TTC:</span>
                            <span className="amount">{formatMontant(facture.montantTTC)}</span>
                        </div>
                    </div>
                </div>

                <div className="facture-footer">
                    <p className="payment-terms">
                        Paiement à réception de facture. Merci pour votre confiance.
                    </p>
                    {facture.statut === "EN_ATTENTE" && (
                        <div className="payment-info">
                            <p><strong>Instructions de paiement</strong></p>
                            <p>Virement bancaire</p>
                            <p>IBAN: FR76 XXXX XXXX XXXX XXXX XXXX XXX</p>
                            <p>BIC: XXXXXXXX</p>
                            <p>Référence à indiquer: {facture.referenceFacture}</p>
                        </div>
                    )}
                    {facture.statut === "PAYEE" && (
                        <div className="payment-confirmation">
                            <p><strong>FACTURE ACQUITTÉE</strong></p>
                            <p>Nous vous remercions pour votre paiement.</p>
                        </div>
                    )}
                    {facture.statut === "EN_RETARD" && (
                        <div className="payment-reminder">
                            <p><strong>RAPPEL DE PAIEMENT</strong></p>
                            <p>Cette facture est en retard de paiement. Merci de procéder au règlement dans les plus brefs délais.</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
