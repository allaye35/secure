import React, { useEffect, useState } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import TarifMissionService from "../../services/TarifMissionService";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { 
    faTag, faEuroSign, faPercent, faMoon, faCalendarWeek, 
    faCalendarDay, faCalendarCheck, faArrowLeft, faEdit, faInfoCircle 
} from "@fortawesome/free-solid-svg-icons";
import "../../styles/TarifMissionDetail.css";

export default function TarifMissionDetail() {
    const { id } = useParams();
    const navigate = useNavigate();
    const [tarif, setTarif] = useState(null);
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        setLoading(true);
        TarifMissionService.getById(id)
            .then(({ data }) => {
                setTarif(data);
                setLoading(false);
            })
            .catch((err) => {
                setError("Impossible de charger les détails du tarif: " + (err.response?.data || err.message));
                setLoading(false);
            });
    }, [id]);

    // Formatage des valeurs
    const formatPrix = (prix) => {
        if (!prix && prix !== 0) return "-";
        return Number(prix).toLocaleString('fr-FR', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) + " €";
    };
    
    const formatPourcentage = (pourcentage) => {
        if (!pourcentage && pourcentage !== 0) return "-";
        return `${pourcentage}%`;
    };
    
    // Calcul du prix TTC
    const calculerPrixTTC = (prixHT, tauxTVA) => {
        if (!prixHT || !tauxTVA) return "-";
        const prixTTC = prixHT * (1 + tauxTVA / 100);
        return formatPrix(prixTTC);
    };

    // Exemples de calcul de prix avec majorations
    const calculerExemple = (prixBase, majoration) => {
        if (!prixBase || !majoration) return "-";
        return formatPrix(prixBase * (1 + majoration / 100));
    };

    if (loading) {
        return (
            <div className="tarif-detail">
                <div className="loading-spinner">
                    <div className="spinner"></div>
                    <p>Chargement des détails du tarif...</p>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="tarif-detail">
                <div className="error-message">
                    <p className="error">{error}</p>
                    <button className="tarif-btn tarif-btn-primary" onClick={() => navigate("/tarifs")}>
                        Retour à la liste
                    </button>
                </div>
            </div>
        );
    }

    if (!tarif) return null; // Éviter les erreurs si tarif est null après chargement
    
    return (
        <div className="tarif-detail">
            {/* En-tête */}
            <div className="tarif-detail-header">
                <div className="tarif-detail-title">
                    <span>Détail du tarif mission</span>
                    <span className="tarif-id-badge">ID: {tarif.id}</span>
                </div>
                <div className="tarif-detail-subtitle">{tarif.typeMission || "Type non défini"}</div>
            </div>
            
            {/* Corps */}
            <div className="tarif-detail-body">
                <div className="tarif-card">
                    <div className="tarif-card-header">
                        Tarification de base
                    </div>
                    <div className="tarif-card-body">
                        <div className="tarif-info-row">
                            <div className="tarif-info-label">                                <FontAwesomeIcon icon={faTag} className="me-2" />
                                Type de mission
                            </div>
                            <div className="tarif-info-value">
                                {tarif.typeMission || "Non défini"}
                            </div>
                        </div>
                        
                        <div className="tarif-info-row">
                            <div className="tarif-info-label">                                <FontAwesomeIcon icon={faEuroSign} className="me-2" />
                                Prix unitaire HT
                            </div>
                            <div className="tarif-info-value price-value">
                                {formatPrix(tarif.prixUnitaireHT)}
                            </div>
                        </div>
                        
                        <div className="tarif-info-row">
                            <div className="tarif-info-label">                                <FontAwesomeIcon icon={faPercent} className="me-2" />
                                Taux de TVA
                            </div>
                            <div className="tarif-info-value">
                                <span className="percentage-badge">{formatPourcentage(tarif.tauxTVA)}</span>
                            </div>
                        </div>
                        
                        <div className="tarif-info-row price-section">
                            <div className="tarif-info-label">                                <FontAwesomeIcon icon={faEuroSign} className="me-2" />
                                Prix unitaire TTC
                            </div>
                            <div className="tarif-info-value price-value">
                                {calculerPrixTTC(tarif.prixUnitaireHT, tarif.tauxTVA)}
                            </div>
                        </div>
                    </div>
                </div>
                
                <div className="tarif-card">
                    <div className="tarif-card-header">
                        Majorations applicables
                    </div>
                    <div className="tarif-card-body">
                        <div className="tarif-info-row">
                            <div className="tarif-info-label">                                <FontAwesomeIcon icon={faMoon} className="me-2" />
                                Majoration nuit
                            </div>
                            <div className="tarif-info-value">
                                <span className="percentage-badge">{formatPourcentage(tarif.majorationNuit)}</span>
                                {tarif.majorationNuit > 0 && (
                                    <div className="tarif-info-example">
                                        Soit {calculerExemple(tarif.prixUnitaireHT, tarif.majorationNuit)} HT
                                    </div>
                                )}
                            </div>
                        </div>
                        
                        <div className="tarif-info-row">
                            <div className="tarif-info-label">                                <FontAwesomeIcon icon={faCalendarWeek} className="me-2" />
                                Majoration week-end
                            </div>
                            <div className="tarif-info-value">
                                <span className="percentage-badge">{formatPourcentage(tarif.majorationWeekend)}</span>
                                {tarif.majorationWeekend > 0 && (
                                    <div className="tarif-info-example">
                                        Soit {calculerExemple(tarif.prixUnitaireHT, tarif.majorationWeekend)} HT
                                    </div>
                                )}
                            </div>
                        </div>
                        
                        <div className="tarif-info-row">
                            <div className="tarif-info-label">                                <FontAwesomeIcon icon={faCalendarDay} className="me-2" />
                                Majoration dimanche
                            </div>
                            <div className="tarif-info-value">
                                <span className="percentage-badge">{formatPourcentage(tarif.majorationDimanche)}</span>
                                {tarif.majorationDimanche > 0 && (
                                    <div className="tarif-info-example">
                                        Soit {calculerExemple(tarif.prixUnitaireHT, tarif.majorationDimanche)} HT
                                    </div>
                                )}
                            </div>
                        </div>
                        
                        <div className="tarif-info-row">
                            <div className="tarif-info-label">
                                <i className="fas fa-calendar-check"></i>
                                Majoration jours fériés
                            </div>
                            <div className="tarif-info-value">
                                <span className="percentage-badge">{formatPourcentage(tarif.majorationFerie)}</span>
                                {tarif.majorationFerie > 0 && (
                                    <div className="tarif-info-example">
                                        Soit {calculerExemple(tarif.prixUnitaireHT, tarif.majorationFerie)} HT
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>

                {tarif.missionIds && tarif.missionIds.length > 0 && (
                    <div className="tarif-card">
                        <div className="tarif-card-header">
                            Missions associées
                        </div>
                        <div className="tarif-card-body">
                            <p>{tarif.missionIds.length} mission(s) utilise(nt) ce tarif</p>
                            <div className="tarif-missions-list">
                                {tarif.missionIds.map(missionId => (
                                    <Link 
                                        key={missionId}
                                        to={`/missions/${missionId}`}
                                        className="tarif-mission-link"
                                    >
                                        Mission #{missionId}
                                    </Link>
                                ))}
                            </div>
                        </div>
                    </div>
                )}
            </div>
            
            {/* Pied de page */}
            <div className="tarif-detail-footer">
                <button 
                    className="tarif-btn tarif-btn-outline" 
                    onClick={() => navigate("/tarifs")}
                >
                    <i className="fas fa-arrow-left"></i>
                    Retour à la liste
                </button>
                
                <Link 
                    to={`/tarifs/edit/${id}`}
                    className="tarif-btn tarif-btn-primary"
                >
                    <i className="fas fa-edit"></i>
                    Modifier ce tarif
                </Link>
            </div>
        </div>
    );
}
