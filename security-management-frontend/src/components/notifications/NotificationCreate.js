import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import NotificationService from "../../services/NotificationService";
import NotificationForm    from "./NotificationForm";

const NotificationCreate = () => {
    const navigate = useNavigate();
    const [data, setData] = useState({
        titre: "",
        message: "",
        destinataire: "",
        typeNotification: "INFO",
        agentId: null,
        clientId: null
    });
    const [error, setError] = useState(null);

    const handleSubmit = async e => {
        e.preventDefault();
        setError(null);
        try {
            await NotificationService.create({
                ...data,
                agentId: data.agentId || null,
                clientId: data.clientId || null
            });
            navigate("/notifications");
        } catch {
            setError("Échec de la création.");
        }
    };

    return (
        <NotificationForm
            title="Créer"
            data={data}
            setData={setData}
            onSubmit={handleSubmit}
            error={error}
        />
    );
};

export default NotificationCreate;
