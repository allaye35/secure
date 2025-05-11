import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Toast, ToastContainer, Spinner } from "react-bootstrap";
import { FaExclamationTriangle, FaCheckCircle, FaInfoCircle } from 'react-icons/fa';
import DisponibiliteService from "../../services/DisponibiliteService";
import AgentService from "../../services/AgentService";
import DisponibiliteForm from "./DisponibiliteForm";

const DisponibiliteEdit = () => {
    const { id } = useParams();
    const navigate = useNavigate();

    const [data, setData] = useState({
        agentId: "",
        dateDebut: "",
        dateFin: ""
    });
    const [originalData, setOriginalData] = useState(null);
    const [agents, setAgents] = useState([]);
    const [error, setError] = useState(null);
    const [loading, setLoading] = useState(true);
    const [showToast, setShowToast] = useState(false);
    const [toastMessage, setToastMessage] = useState({ title: '', message: '', type: 'success' });

    useEffect(() => {
        const fetchDisponibiliteAndAgents = async () => {
            try {
                setLoading(true);
                
                // Chargement parallèle des données de la disponibilité et de la liste des agents
                const [dispoResponse, agentsResponse] = await Promise.all([
                    DisponibiliteService.getById(id),
                    AgentService.getAllAgents()
                ]);
                
                const disponibilite = dispoResponse.data;
                
                // Formater les dates pour les inputs datetime-local
                const formattedData = {
                    agentId: disponibilite.agentId,
                    dateDebut: new Date(disponibilite.dateDebut).toISOString().slice(0, 16),
                    dateFin: new Date(disponibilite.dateFin).toISOString().slice(0, 16)
                };
                
                setData(formattedData);
                setOriginalData(disponibilite);
                setAgents(agentsResponse.data);
                setLoading(false);
                
                // Afficher une notification pour confirmer le chargement
                showNotification(
                    "Disponibilité chargée",
                    "Vous pouvez maintenant modifier les informations.",
                    "info"
                );
            } catch (err) {
                console.error("Erreur lors du chargement:", err);
                setError("Impossible de charger les données. Vérifiez votre connexion ou réessayez plus tard.");
                setLoading(false);
                
                // Afficher un toast d'erreur
                showNotification(
                    "Erreur de chargement",
                    "Impossible de récupérer les détails de la disponibilité. Veuillez réessayer.",
                    "danger"
                );
            }
        };

        fetchDisponibiliteAndAgents();
    }, [id]);

    // Afficher une notification toast
    const showNotification = (title, message, type = 'success') => {
        setToastMessage({ title, message, type });
        setShowToast(true);
    };

    // Vérifier si des modifications ont été apportées
    const hasChanges = () => {
        if (!originalData) return false;
        
        return (
            parseInt(data.agentId) !== originalData.agentId ||
            new Date(data.dateDebut).toISOString() !== new Date(originalData.dateDebut).toISOString() ||
            new Date(data.dateFin).toISOString() !== new Date(originalData.dateFin).toISOString()
        );
    };

    // Validation des données avant soumission
    const validateDisponibilite = (disponibiliteData) => {
        const start = new Date(disponibiliteData.dateDebut);
        const end = new Date(disponibiliteData.dateFin);
        
        if (!disponibiliteData.agentId) {
            setError("Veuillez sélectionner un agent.");
            return false;
        }
        
        if (!disponibiliteData.dateDebut) {
            setError("Veuillez saisir une date de début.");
            return false;
        }
        
        if (!disponibiliteData.dateFin) {
            setError("Veuillez saisir une date de fin.");
            return false;
        }
        
        if (start >= end) {
            setError("La date de fin doit être postérieure à la date de début.");
            return false;
        }
        
        return true;
    };

    const handleSubmit = async e => {
        e.preventDefault();
        setError(null);
        
        // Ne rien faire si aucun changement
        if (!hasChanges()) {
            showNotification(
                "Aucun changement",
                "Aucune modification n'a été détectée. Les données n'ont pas été mises à jour.",
                "info"
            );
            return Promise.resolve();
        }
        
        // Validation des données avant envoi
        if (!validateDisponibilite(data)) {
            return Promise.reject();
        }
        
        try {
            const formattedData = {
                ...data,
                dateDebut: new Date(data.dateDebut).toISOString(),
                dateFin: new Date(data.dateFin).toISOString()
            };
            
            await DisponibiliteService.update(id, formattedData);
            
            // Afficher une notification de succès
            showNotification(
                "Disponibilité mise à jour",
                "La disponibilité a été modifiée avec succès.",
                "success"
            );
            
            // Rediriger vers la liste des disponibilités après un court délai
            setTimeout(() => {
                navigate(`/disponibilites/${id}`);
            }, 2000);
            
            return Promise.resolve();
        } catch (err) {
            console.error("Erreur lors de la mise à jour de la disponibilité:", err);
            
            // Message d'erreur personnalisé selon le type d'erreur
            let errorMessage = "Échec de la mise à jour de la disponibilité.";
            
            if (err.response) {
                if (err.response.status === 409) {
                    errorMessage = "Cette disponibilité est en conflit avec une autre période pour cet agent.";
                } else if (err.response.status === 400) {
                    errorMessage = "Données invalides. Veuillez vérifier les informations saisies.";
                } else if (err.response.status === 404) {
                    errorMessage = "La disponibilité que vous essayez de modifier n'a pas été trouvée.";
                } else if (err.response.status === 403) {
                    errorMessage = "Vous n'avez pas les droits nécessaires pour effectuer cette action.";
                }
            }
            
            setError(errorMessage);
            return Promise.reject(err);
        }
    };

    if (loading) {
        return (
            <div className="d-flex justify-content-center align-items-center" style={{ minHeight: "60vh" }}>
                <div className="text-center">
                    <Spinner animation="border" variant="primary" style={{ width: '3rem', height: '3rem' }} />
                    <p className="mt-3 text-muted">Chargement des données de la disponibilité...</p>
                </div>
            </div>
        );
    }

    return (
        <>
            <DisponibiliteForm
                title="Modifier"
                data={data}
                setData={setData}
                onSubmit={handleSubmit}
                error={error}
                agents={agents}
            />
            
            <ToastContainer position="top-end" className="p-3" style={{ zIndex: 1050 }}>
                <Toast 
                    show={showToast} 
                    onClose={() => setShowToast(false)} 
                    delay={5000} 
                    autohide
                    bg={toastMessage.type}
                >
                    <Toast.Header>
                        {toastMessage.type === 'success' && <FaCheckCircle className="me-2 text-success" />}
                        {toastMessage.type === 'danger' && <FaExclamationTriangle className="me-2 text-danger" />}
                        {toastMessage.type === 'info' && <FaInfoCircle className="me-2 text-info" />}
                        <strong className="me-auto">{toastMessage.title}</strong>
                        <small>à l'instant</small>
                    </Toast.Header>
                    <Toast.Body className={toastMessage.type === 'danger' ? 'text-white' : ''}>
                        {toastMessage.message}
                    </Toast.Body>
                </Toast>
            </ToastContainer>
        </>
    );
};

export default DisponibiliteEdit;
