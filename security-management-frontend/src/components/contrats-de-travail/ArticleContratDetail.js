import React, { useState } from "react";
import { Button, Badge, Row, Col, Card } from "react-bootstrap"; // Import des composants Bootstrap

const ArticleContratDetail = ({ article }) => {
    // État pour gérer l'impression
    const [isPrinting, setIsPrinting] = useState(false);

    // Fonction pour formater une date
    const formatDate = (dateString) => {
        if (!dateString) return "–";
        return new Date(dateString).toLocaleString();
    };

    // Fonction pour gérer l'impression
    const handlePrint = () => {
        setIsPrinting(true);
        setTimeout(() => {
            window.print();
            setIsPrinting(false);
        }, 300);
    };

    return (
        <Card className="article-item shadow" style={{
            borderRadius: '10px',
            margin: '15px auto 25px',
            padding: '0',
            backgroundColor: '#fff',
            overflow: 'hidden',
            maxWidth: '800px',           // Largeur approximative A4
            minHeight: '1123px',         // Hauteur approximative A4 (297mm)
            width: '100%',
            position: 'relative'
        }}>
            <Card.Header style={{
                backgroundColor: '#3498db',
                padding: '20px 30px',
                color: 'white',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center'
            }}>
                <h4 className="article-title m-0 fw-bold" style={{ fontSize: '1.8rem' }}>
                    {article.libelle || 'Article sans titre'}
                </h4>
                <div className="d-none d-print-none">
                    <Badge bg="light" text="dark" className="me-2">
                        Article #{article.id || '0'}
                    </Badge>
                </div>
            </Card.Header>

            <Card.Body style={{ padding: '30px 40px' }}>
                {/* Actions buttons - visible only on screen, not when printing */}
                <div className="mb-4 d-print-none">
                    <Row className="justify-content-end">
                        <Col xs="auto">
                            <Button 
                                variant="outline-primary" 
                                className="me-2"
                                onClick={handlePrint}
                                disabled={isPrinting}
                            >
                                <i className="bi bi-printer"></i> Imprimer
                            </Button>
                            <Button 
                                variant="outline-secondary" 
                                className="me-2"
                            >
                                <i className="bi bi-download"></i> Exporter en PDF
                            </Button>
                            <Button 
                                variant="outline-info"
                            >
                                <i className="bi bi-share"></i> Partager
                            </Button>
                        </Col>
                    </Row>
                </div>

                <div className="article-metadata p-3 mb-4 bg-light rounded" style={{
                    display: 'flex', 
                    flexWrap: 'wrap', 
                    gap: '40px'
                }}>
                    {article.createdAt && (
                        <div>
                            <Badge bg="secondary" className="me-2">Créé le</Badge>
                            <span style={{ fontSize: '1.2rem' }}>{formatDate(article.createdAt)}</span>
                        </div>
                    )}
                    {article.updatedAt && (
                        <div>
                            <Badge bg="info" className="me-2">Mis à jour le</Badge>
                            <span style={{ fontSize: '1.2rem' }}>{formatDate(article.updatedAt)}</span>
                        </div>
                    )}
                </div>

                <Card className="article-text mb-4">
                    <Card.Header className="bg-light">
                        <h5 className="m-0 fw-bold" style={{ fontSize: '1.4rem', color: '#2c3e50' }}>
                            Contenu de l'article
                        </h5>
                    </Card.Header>
                    <Card.Body style={{
                        whiteSpace: 'pre-wrap',
                        fontFamily: "'Times New Roman', serif", 
                        lineHeight: '1.8',
                        fontSize: '1.25rem'
                    }}>
                        {article.contenu || 'Aucun contenu disponible.'}
                    </Card.Body>
                </Card>

                <Row className="mt-5 pt-3 border-top">
                    <Col>
                        <div className="d-flex justify-content-between align-items-center">
                            <div>
                                <Button variant="success" size="sm" className="me-2">
                                    <i className="bi bi-check-circle"></i> Valider
                                </Button>
                                <Button variant="warning" size="sm">
                                    <i className="bi bi-pencil"></i> Modifier
                                </Button>
                            </div>
                            <p className="article-relation-info text-muted fst-italic mb-0" style={{ fontSize: '1.1rem' }}>
                                Article du contrat de travail
                            </p>
                        </div>
                    </Col>
                </Row>
            </Card.Body>
        </Card>
    );
};

export default ArticleContratDetail;
