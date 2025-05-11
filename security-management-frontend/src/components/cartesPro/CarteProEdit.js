import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Toast, ToastContainer, Alert, Spinner } from "react-bootstrap";
import { FaCheck, FaExclamationTriangle } from "react-icons/fa";
import CarteProService from "../../services/CarteProService";
import CarteProForm from "./CarteProForm";

const CarteProEdit = () => {
    const { id } = useParams();
    const navigate = useNavigate();

    const [data, setData] = useState({
        agentId: "",
        typeCarte: "CQP_APS",
        numeroCarte: "",
        dateDebut: "",
        dateFin: ""
    });
    const [error, setError] = useState(null);
    const [loading, setLoading] = useState(true);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [showToast, setShowToast] = useState(false);
    const [toastMessage, setToastMessage] = useState({ text: '', variant: 'success' });
    const [originalNumero, setOriginalNumero] = useState("");

    useEffect(() => {
        setLoading(true);
        CarteProService.getById(id)
            .then(res => {
                const dto = res.data;
                setOriginalNumero(dto.numeroCarte || "");
                setData({
                    agentId:     dto.agentId || "",
                    typeCarte:   dto.typeCarte || "CQP_APS",
                    numeroCarte: dto.numeroCarte || "",
                    dateDebut:   dto.dateDebut ? dto.dateDebut.slice(0,10) : "",
                    dateFin:     dto.dateFin ? dto.dateFin.slice(0,10) : ""
                });
                setLoading(false);
            })
            .catch(err => {
                console.error("Erreur lors du chargement:", err);
                setError("Impossible de charger la carte professionnelle.");
                setLoading(false);
            });
    }, [id]);

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
            
            await CarteProService.update(id, formattedData);
            
            // Afficher un toast de succès
            setToastMessage({
                text: `Carte professionnelle ${data.numeroCarte || originalNumero} mise à jour avec succès !`,
                variant: 'success'
            });
            setShowToast(true);
            
            // Redirection après un court délai
            setTimeout(() => {
                navigate("/cartes-professionnelles");
            }, 1500);
        } catch (err) {
            console.error("Erreur lors de la mise à jour:", err);
            setError(err.response?.data?.message || err.message || "Échec de la mise à jour de la carte professionnelle");
            setIsSubmitting(false);
            
            // Afficher un toast d'erreur
            setToastMessage({
                text: "Erreur lors de la mise à jour de la carte professionnelle",
                variant: 'danger'
            });
            setShowToast(true);
        }
    };

    if (loading) {
        return (
            <div className="d-flex justify-content-center align-items-center" style={{height: "60vh"}}>
                <div className="text-center">
                    <Spinner animation="border" variant="primary" style={{width: "3rem", height: "3rem"}} />
                    <p className="mt-3">Chargement de la carte professionnelle...</p>
                </div>
            </div>
        );
    }

    if (error && !data.numeroCarte) {
        return (
            <Alert variant="danger" className="m-4 shadow-sm">
                <Alert.Heading><FaExclamationTriangle className="me-2" />Erreur</Alert.Heading>
                <p>{error}</p>
                <hr />
                <div className="d-flex justify-content-end">
                    <button 
                        className="btn btn-outline-danger" 
                        onClick={() => navigate("/cartes-professionnelles")}
                    >
                        Retour à la liste
                    </button>
                </div>
            </Alert>
        );
    }

    return (
        <>
            <CarteProForm
                title="Modifier"
                data={data}
                setData={setData}
                onSubmit={handleSubmit}
                error={error}
                isSubmitting={isSubmitting}
                loading={loading}
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

export default CarteProEdit;
