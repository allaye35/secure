import React from "react";
import "../../styles/NotificationForm.css";

const NotificationForm = ({ title, data, setData, onSubmit, error }) => (
    <div className="notification-form-container">
        <h2>{title} une notification</h2>
        {error && <p className="error">{error}</p>}
        <form onSubmit={onSubmit}>
            <label>
                Titre
                <input
                    name="titre"
                    value={data.titre}
                    onChange={e => setData({ ...data, titre: e.target.value })}
                    required
                />
            </label>

            <label>
                Message
                <textarea
                    name="message"
                    value={data.message}
                    onChange={e => setData({ ...data, message: e.target.value })}
                    required
                />
            </label>

            <label>
                Destinataire
                <input
                    name="destinataire"
                    value={data.destinataire}
                    onChange={e => setData({ ...data, destinataire: e.target.value })}
                    required
                />
            </label>

            <label>
                Type
                <select
                    name="typeNotification"
                    value={data.typeNotification}
                    onChange={e => setData({ ...data, typeNotification: e.target.value })}
                    required
                >
                    <option value="INFO">INFO</option>
                    <option value="WARNING">WARNING</option>
                    <option value="ALERT">ALERT</option>
                    <option value="SUCCESS">SUCCESS</option>
                </select>
            </label>

            <label>
                Agent (ID)
                <input
                    type="number"
                    name="agentId"
                    min="0"
                    value={data.agentId || ""}
                    onChange={e => setData({ ...data, agentId: e.target.value })}
                />
            </label>

            <label>
                Client (ID)
                <input
                    type="number"
                    name="clientId"
                    min="0"
                    value={data.clientId || ""}
                    onChange={e => setData({ ...data, clientId: e.target.value })}
                />
            </label>

            <button type="submit" className="btn submit-btn">
                {title}
            </button>
        </form>
    </div>
);

export default NotificationForm;
