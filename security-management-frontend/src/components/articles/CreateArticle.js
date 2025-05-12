import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import ArticleService from "../../services/ArticleService";
import ArticleForm from "./ArticleForm";
import { Container, Card, Alert, Breadcrumb } from 'react-bootstrap';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPlus, faListUl, faFileAlt, faHome } from '@fortawesome/free-solid-svg-icons';
import "../../styles/ArticleDetail.css";

export default function ArticleCreate() {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const handleSubmit = async data => {
        try {
            setLoading(true);
            await ArticleService.create(data);
            navigate("/articles");
        } catch (e) {
            console.error(e);
            setError("Échec de la création de l'article. Veuillez vérifier les informations et réessayer.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <Container fluid className="py-4">
            <div className="page-header mb-4">
                <div className="d-flex flex-wrap justify-content-between align-items-center mb-2">
                    <h2 className="page-title">
                        <FontAwesomeIcon icon={faPlus} className="me-2 text-success" />
                        Créer un nouvel article
                    </h2>
                </div>
                
                <Breadcrumb>
                    <Breadcrumb.Item href="/">
                        <FontAwesomeIcon icon={faHome} className="me-1" /> Accueil
                    </Breadcrumb.Item>
                    <Breadcrumb.Item href="/articles">
                        <FontAwesomeIcon icon={faListUl} className="me-1" /> Articles
                    </Breadcrumb.Item>
                    <Breadcrumb.Item active>
                        <FontAwesomeIcon icon={faPlus} className="me-1" /> Nouveau
                    </Breadcrumb.Item>
                </Breadcrumb>
            </div>
            
            {error && (
                <Alert variant="danger" className="mb-4">
                    {error}
                </Alert>
            )}
            
            <Card className="shadow-sm mb-4">
                <Card.Body>
                    <ArticleForm onSubmit={handleSubmit} loading={loading} />
                </Card.Body>
            </Card>
        </Container>
    );
}
