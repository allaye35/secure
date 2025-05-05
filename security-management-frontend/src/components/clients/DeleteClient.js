// src/components/clients/DeleteClient.js
import { useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import ClientService from "../../services/ClientService";

export default function DeleteClient() {
    const { id } = useParams();
    const nav = useNavigate();

    useEffect(() => {
        if (window.confirm("Vraiment supprimer ce client ?")) {
            ClientService.deleteClient(id)
                .then(() => nav("/clients"))
                .catch(err => {
                    console.error(err);
                    nav("/clients");
                });
        } else {
            nav("/clients");
        }
    }, [id, nav]);

    return <p>Suppression en cours…</p>;
}
