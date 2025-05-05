import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import NotificationService from "../../services/NotificationService";
import NotificationForm    from "./NotificationForm";

const NotificationEdit = () => {
    const { id } = useParams();
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

    useEffect(() => {
        NotificationService.getById(id)
            .then(res => setData(res.data))
            .catch(() => setError("Impossible de charger la notification."));
    }, [id]);

    const handleSubmit = async e => {
        e.preventDefault();
        setError(null);
        try {
            await NotificationService.update(id, {
                ...data,
                agentId: data.agentId || null,
                clientId: data.clientId || null
            });
            navigate("/notifications");
        } catch {
            setError("Échec de la mise à jour.");
        }
    };

    return (
        <NotificationForm
            title="Modifier"
            data={data}
            setData={setData}
            onSubmit={handleSubmit}
            error={error}
        />
    );
};

export default NotificationEdit;
