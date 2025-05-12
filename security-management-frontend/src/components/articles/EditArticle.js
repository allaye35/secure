import React, { useEffect, useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import ArticleService  from "../../services/ArticleService";
import ArticleForm     from "./ArticleForm";
import { Container, Row, Col, Card, Breadcrumb, Alert, Spinner } from 'react-bootstrap';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faEdit, faHome, faArrowLeft, faListUl, faPencilAlt, faFileAlt, faExclamationTriangle } from '@fortawesome/free-solid-svg-icons';
import "../../styles/ArticleForm.css";

export default function ArticleEdit() {
    const { id } = useParams();
    const navigate = useNavigate();
    const [initial, setInitial] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error,   setError]   = useState(null);
    const [saving,  setSaving]  = useState(false);

    useEffect(() => {
        ArticleService.getById(id)
            .then(res => {
                console.log("Données de l'article chargées:", res.data);
                setInitial(res.data);
            })
            .catch(err => {
                console.error(err);
                setError("Impossible de charger l'article.");
            })
            .finally(() => setLoading(false));
    }, [id]);

    const handleSubmit = async data => {
        try {
            setSaving(true);
            await ArticleService.update(id, data);
            navigate("/articles");
        } catch (e) {
            console.error(e);
            setError("Échec de la mise à jour.");
        } finally {
            setSaving(false);
        }
    };

    if (loading) {
        return (
            <Container className="py-5 text-center">
                <Spinner animation="border" variant="primary" />
                <p className="mt-3">Chargement de l'article...</p>
            </Container>
        );
    }
        
    if (error) {
        return (
            <Container className="py-5">
                <Alert variant="danger">
                    <FontAwesomeIcon icon={faExclamationTriangle} className="me-2" />
                    {error}
                </Alert>
                <div className="text-center mt-3">
                    <Link to="/articles" className="btn btn-outline-secondary">
                        <FontAwesomeIcon icon={faArrowLeft} className="me-2" />
                        Retour à la liste des articles
                    </Link>
                </div>
            </Container>
        );
    }

    return (
        <Container fluid className="article-edit-container py-4">
            <Breadcrumb className="article-breadcrumb mb-4">
                <Breadcrumb.Item linkAs={Link} linkProps={{ to: "/" }}>
                    <FontAwesomeIcon icon={faHome} className="me-2" /> Accueil
                </Breadcrumb.Item>
                <Breadcrumb.Item linkAs={Link} linkProps={{ to: "/articles" }}>
                    <FontAwesomeIcon icon={faListUl} className="me-2" /> Articles
                </Breadcrumb.Item>
                <Breadcrumb.Item active>
                    <FontAwesomeIcon icon={faPencilAlt} className="me-2" /> Modifier
                </Breadcrumb.Item>
            </Breadcrumb>
            
            <Card className="shadow-sm mb-4">
                <Card.Header className="bg-primary text-white">
                    <div className="d-flex justify-content-between align-items-center">
                        <h3 className="mb-0">
                            <FontAwesomeIcon icon={faEdit} className="me-2" />
                            Modifier l'Article #{initial?.numero || id}
                        </h3>
                    </div>
                </Card.Header>
                <Card.Body>
                    <ArticleForm
                        initialData={initial}
                        onSubmit={handleSubmit}
                        loading={saving}
                    />
                </Card.Body>
            </Card>
        </Container>
    );
}
