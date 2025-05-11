import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Toast, ToastContainer } from "react-bootstrap";
import { FaCheck, FaExclamationTriangle } from "react-icons/fa";
import CarteProService from "../../services/CarteProService";
import CarteProForm from "./CarteProForm";

const CarteProCreate = () => {
    const navigate = useNavigate();
    const [data, setData] = useState({
        agentId: "",
        typeCarte: "CQP_APS",
        numeroCarte: "",
        dateDebut: "",
        dateFin: ""
    });
    const [error, setError] = useState(null);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [showToast, setShowToast] = useState(false);
    const [toastMessage, setToastMessage] = useState({ text: '', variant: 'success' });

    const handleSubmit = async e => {
        e.preventDefault();
        setError(null);
        setIsSubmitting(true);
        
        try {
            // S'assurer que agentId est un nombre
            const formattedData = {
                ...data,
                agentId: parseInt(data.agentId, 10)
            };
            
            // Vérifier que toutes les données requises sont présentes
            if (!formattedData.agentId || isNaN(formattedData.agentId)) {
                throw new Error("Veuillez sélectionner un agent valide");
            }
            
            const response = await CarteProService.create(formattedData);
            
            // Afficher un toast de succès
            setToastMessage({
                text: `Carte professionnelle ${response.data.numeroCarte || ''} créée avec succès !`,
                variant: 'success'
            });
            setShowToast(true);
            
            // Redirection après un court délai
            setTimeout(() => {
                navigate("/cartes-professionnelles");
            }, 1500);
        } catch (err) {
            console.error("Erreur lors de la création:", err);
            setError(err.response?.data?.message || err.message || "Échec de la création de la carte professionnelle");
            setIsSubmitting(false);
            
            // Afficher un toast d'erreur
            setToastMessage({
                text: "Erreur lors de la création de la carte professionnelle",
                variant: 'danger'
            });
            setShowToast(true);
        }
    };

    return (
        <>
            <CarteProForm
                title="Créer"
                data={data}
                setData={setData}
                onSubmit={handleSubmit}
                error={error}
                isSubmitting={isSubmitting}
            />
            
            <ToastContainer position="top-end" className="p-3" style={{ zIndex: 1060 }}>
                <Toast 
                    show={showToast} 
                    onClose={() => setShowToast(false)} 
                    delay={5000} 
                    autohide
                    bg={toastMessage.variant}
                    className="shadow-sm"
                >
                    <Toast.Header closeButton>
                        {toastMessage.variant === 'success' ? (
                            <FaCheck className="me-2 text-success" />
                        ) : (
                            <FaExclamationTriangle className="me-2 text-danger" />
                        )}
                        <strong className="me-auto">
                            {toastMessage.variant === 'success' ? 'Succès' : 'Erreur'}
                        </strong>
                    </Toast.Header>
                    <Toast.Body className={toastMessage.variant === 'success' ? 'text-white' : ''}>
                        {toastMessage.text}
                    </Toast.Body>
                </Toast>
            </ToastContainer>
        </>
    );
};

export default CarteProCreate;
