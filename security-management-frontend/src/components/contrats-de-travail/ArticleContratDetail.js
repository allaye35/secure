import React, { useState } from "react";
import { Button, Badge, Row, Col, Card, Dropdown, ButtonGroup, OverlayTrigger, Tooltip } from "react-bootstrap"; // Import des composants Bootstrap supplémentaires

const ArticleContratDetail = ({ article, onBack }) => {
    // État pour gérer l'impression et autres actions
    const [isPrinting, setIsPrinting] = useState(false);
    const [isExporting, setIsExporting] = useState(false);

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

    // Fonction pour gérer l'export en PDF
    const handleExportPDF = () => {
        setIsExporting(true);
        // Simuler un délai pour l'export (à remplacer par votre logique réelle d'export PDF)
        setTimeout(() => {
            alert("Le document a été exporté en PDF");
            setIsExporting(false);
        }, 1000);
        // Ici vous pouvez implémenter une vraie fonction d'export PDF
        // avec une bibliothèque comme jsPDF ou html2pdf.js
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
            {/* Navigation et Actions principales en haut */}
            <div className="d-flex justify-content-between align-items-center bg-light p-3 border-bottom d-print-none">
                <Button 
                    variant="outline-secondary" 
                    className="d-flex align-items-center"
                    onClick={onBack}
                >
                    <i className="bi bi-arrow-left me-2"></i>
                    Retour à la liste
                </Button>
                
                <ButtonGroup>
                    <OverlayTrigger
                        placement="top"
                        overlay={<Tooltip>Modifier ce contrat</Tooltip>}
                    >
                        <Button variant="outline-primary">
                            <i className="bi bi-pencil-square"></i>
                            <span className="d-none d-md-inline ms-2">Modifier</span>
                        </Button>
                    </OverlayTrigger>
                    
                    <Dropdown as={ButtonGroup}>
                        <Button 
                            variant="primary" 
                            onClick={handlePrint}
                            disabled={isPrinting}
                        >
                            <i className="bi bi-printer-fill me-1"></i> Imprimer
                        </Button>
                        <Dropdown.Toggle split variant="primary" />
                        <Dropdown.Menu>
                            <Dropdown.Item 
                                onClick={handleExportPDF}
                                disabled={isExporting}
                            >
                                <i className="bi bi-file-earmark-pdf me-2"></i>
                                {isExporting ? 'Exportation...' : 'Exporter en PDF'}
                            </Dropdown.Item>
                            <Dropdown.Item>
                                <i className="bi bi-file-earmark-word me-2"></i>
                                Exporter en Word
                            </Dropdown.Item>
                            <Dropdown.Divider />
                            <Dropdown.Item>
                                <i className="bi bi-envelope me-2"></i>
                                Envoyer par email
                            </Dropdown.Item>
                        </Dropdown.Menu>
                    </Dropdown>
                </ButtonGroup>
            </div>

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
                <div className="d-print-none">
                    <Badge bg="light" text="dark" className="me-2">
                        Article #{article.id || '0'}
                    </Badge>
                </div>
            </Card.Header>

            <Card.Body style={{ padding: '30px 40px' }}>
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
                                <Button variant="success" className="me-2">
                                    <i className="bi bi-check-circle"></i> Valider
                                </Button>
                                <Button variant="danger">
                                    <i className="bi bi-x-circle"></i> Rejeter
                                </Button>
                            </div>
                            <p className="article-relation-info text-muted fst-italic mb-0" style={{ fontSize: '1.1rem' }}>
                                Article du contrat de travail
                            </p>
                        </div>
                    </Col>
                </Row>
            </Card.Body>
            
            {/* Indicateur de chargement pour l'impression/export */}
            {(isPrinting || isExporting) && (
                <div style={{
                    position: 'fixed',
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
                    backgroundColor: 'rgba(255,255,255,0.7)',
                    display: 'flex',
                    justifyContent: 'center',
                    alignItems: 'center',
                    zIndex: 1050,
                    pointerEvents: 'none'
                }} className="d-print-none">
                    <div className="text-center">
                        <div className="spinner-border text-primary" role="status">
                            <span className="visually-hidden">Chargement...</span>
                        </div>
                        <p className="mt-2">{isPrinting ? 'Préparation de l\'impression...' : 'Génération du PDF...'}</p>
                    </div>
                </div>
            )}
        </Card>
    );
};

export default ArticleContratDetail;
