import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Toast, ToastContainer } from "react-bootstrap";
import { FaExclamationTriangle, FaCheckCircle, FaBell } from 'react-icons/fa';
import DisponibiliteService from "../../services/DisponibiliteService";
import AgentService from "../../services/AgentService";
import DisponibiliteForm from "./DisponibiliteForm";

const DisponibiliteCreate = () => {
    const navigate = useNavigate();
    const [data, setData] = useState({
        agentId: "",
        dateDebut: "",
        dateFin: ""
    });
    const [agents, setAgents] = useState([]);
    const [error, setError] = useState(null);
    const [loading, setLoading] = useState(true);
    const [showToast, setShowToast] = useState(false);
    const [toastMessage, setToastMessage] = useState({ title: '', message: '', type: 'success' });

    // Chargement de la liste des agents au montage du composant
    useEffect(() => {
        setLoading(true);
        AgentService.getAllAgents()
            .then(response => {
                setAgents(response.data);
                setLoading(false);
            })
            .catch(err => {
                console.error("Erreur lors du chargement des agents", err);
                setError("Impossible de charger la liste des agents. Veuillez réessayer plus tard.");
                setLoading(false);
                
                // Afficher un toast d'erreur
                showNotification(
                    "Erreur de chargement",
                    "Impossible de récupérer la liste des agents. Veuillez réessayer.",
                    "danger"
                );
            });
            
        // Pré-remplir les dates avec l'heure actuelle
        const now = new Date();
        const nowString = now.toISOString().slice(0, 16);
        
        // Par défaut, proposer une disponibilité de 4h
        const later = new Date(now.getTime() + 4 * 60 * 60 * 1000);
        const laterString = later.toISOString().slice(0, 16);
        
        setData(prev => ({
            ...prev,
            dateDebut: nowString,
            dateFin: laterString
        }));
    }, []);

    // Afficher une notification toast
    const showNotification = (title, message, type = 'success') => {
        setToastMessage({ title, message, type });
        setShowToast(true);
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
            
            await DisponibiliteService.create(formattedData);
            
            // Afficher une notification de succès
            showNotification(
                "Disponibilité créée",
                "La disponibilité a été créée avec succès.",
                "success"
            );
            
            // Rediriger vers la liste des disponibilités après un court délai
            setTimeout(() => {
                navigate("/disponibilites");
            }, 2000);
            
            return Promise.resolve();
        } catch (err) {
            console.error("Erreur lors de la création de la disponibilité:", err);
            
            // Message d'erreur personnalisé selon le type d'erreur
            let errorMessage = "Échec de la création de la disponibilité.";
            
            if (err.response) {
                // Le serveur a répondu avec un code d'erreur
                if (err.response.status === 409) {
                    errorMessage = "Cette disponibilité est en conflit avec une autre période pour cet agent.";
                } else if (err.response.status === 400) {
                    errorMessage = "Données invalides. Veuillez vérifier les informations saisies.";
                } else if (err.response.status === 403) {
                    errorMessage = "Vous n'avez pas les droits nécessaires pour effectuer cette action.";
                }
            }
            
            setError(errorMessage);
            return Promise.reject(err);
        }
    };

    return (
        <>
            <DisponibiliteForm
                title="Créer"
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
                        {toastMessage.type === 'warning' && <FaBell className="me-2 text-warning" />}
                        <strong className="me-auto">{toastMessage.title}</strong>
                        <small>à l'instant</small>
                    </Toast.Header>
                    <Toast.Body className={toastMessage.type === 'success' ? 'text-white' : ''}>
                        {toastMessage.message}
                    </Toast.Body>
                </Toast>
            </ToastContainer>
        </>
    );
};

export default DisponibiliteCreate;
