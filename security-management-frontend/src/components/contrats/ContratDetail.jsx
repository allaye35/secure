// filepath: c:\Users\allay\Documents\java_Project_2025\security-management-frontend\src\components\contrats\ContratDetail.jsx
import React, { useEffect, useState, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import ContratService from "../../services/ContratService";
import DevisService from "../../services/DevisService";
import MissionService from "../../services/MissionService";
import ArticleService from "../../services/ArticleService";
import { Container, Row, Col, Card, Table, Button, Badge, Spinner, Alert, ProgressBar } from "react-bootstrap";
import { useReactToPrint } from "react-to-print";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { 
    faFileContract, faArrowLeft, faPencilAlt, faCalendarAlt, 
    faFileInvoice, faTasks, faFilePdf, faClock, faCheck, faTimes, 
    faExclamationTriangle, faEuroSign, faBuilding,
    faUserTie, faInfoCircle, faCalendarCheck, 
    faDownload, faEye, faHandshake,
    faCalendarTimes, faCalendarPlus,
    faPrint, faFileAlt, faParagraph
} from "@fortawesome/free-solid-svg-icons";
import "../../styles/ContratDetailEnhanced.css";
import "../../styles/ContratPrintStyles.css";

export default function ContratDetail() {
    const { id } = useParams();
    const navigate = useNavigate();    const [contrat, setContrat] = useState(null);
    const [devis, setDevis] = useState(null);
    const [missions, setMissions] = useState(null);
    const [articles, setArticles] = useState(null);
    const [client, setClient] = useState(null);      // on garde l'état
    const [entreprise, setEntreprise] = useState(null);      // mais plus de fetch dédié
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
      // Référence pour l'impression
    const componentRef = useRef();
      // État pour suivre si l'impression est en cours
    const [isPrinting, setIsPrinting] = useState(false);
      // Fonction pour gérer les erreurs d'impression
    const handlePrintError = (error) => {
        console.error("Erreur lors de l'impression:", error);
        setIsPrinting(false);
        
        // Message d'erreur plus détaillé selon le type d'erreur
        let errorMessage = "Une erreur est survenue lors de l'impression. ";
        
        if (error && error.message) {
            // Ajouter des détails spécifiques selon le message d'erreur
            if (error.message.includes("timeout")) {
                errorMessage += "Délai d'attente dépassé. ";
            } else if (error.message.includes("network") || error.message.includes("connexion")) {
                errorMessage += "Problème de connexion réseau. ";
            }
        }
        
        errorMessage += "Veuillez réessayer ou vérifier votre connexion.";
        setError(errorMessage);
        
        // Effacer le message d'erreur après un délai
        setTimeout(() => setError(""), 8000);  // Message affiché plus longtemps
        
        // Log pour diagnostic
        console.log("État du document au moment de l'erreur:", componentRef.current ? "Disponible" : "Non disponible");
    };
      // Configuration de l'impression - déplacé avant les conditionnels pour respecter les règles des Hooks
    const handlePrint = useReactToPrint({
        content: () => componentRef.current,
        documentTitle: `Contrat_${contrat?.referenceContrat || id}`,
        onBeforeGetContent: () => {
            setIsPrinting(true);
            setError(""); // Réinitialisation des erreurs avant impression
            console.log("Début préparation impression...");
            return new Promise(resolve => {
                // Donner du temps pour que les styles soient correctement appliqués
                setTimeout(() => {
                    console.log("Contenu prêt pour impression");
                    resolve();
                }, 500); // Augmentation du temps d'attente
            });
        },
        onAfterPrint: () => {
            setIsPrinting(false);
            console.log("Impression terminée avec succès");
        },
        onPrintError: handlePrintError,
        removeAfterPrint: false, // Conserver l'iframe pour debug si nécessaire
        copyStyles: true, // Assurer la copie des styles
        pageStyle: `
            @page {
                size: A4;
                margin: 10mm;
                -webkit-print-color-adjust: exact;
                color-adjust: exact;
                print-color-adjust: exact;
            }
            @media print {
                html, body {
                    height: 100%;
                    margin: 0 !important;
                    padding: 0 !important;
                    overflow: hidden;
                    -webkit-print-color-adjust: exact !important;
                    print-color-adjust: exact !important;
                    color-adjust: exact !important;
                }
                .no-print {
                    display: none !important;
                }
                .page-break {
                    page-break-before: always;
                }
                body {
                    font-size: 12pt;
                }
                .print-container {
                    width: 100%;
                    padding: 0;
                    margin: 0;
                }
                .print-header {
                    text-align: center;
                    margin-bottom: 20px;
                }
                .print-section {
                    margin-bottom: 15px;
                }
                .partie-card {
                    border: 1px solid #dee2e6 !important;
                    break-inside: avoid;
                    page-break-inside: avoid;
                }
                .partie-card .card-header {
                    background-color: #f8f9fa !important;
                    -webkit-print-color-adjust: exact !important;
                    print-color-adjust: exact !important;
                }
                .parties-details h3 {
                    color: #007bff !important;
                }
                table { page-break-inside: auto }
                tr { page-break-inside: avoid; page-break-after: auto }
                thead { display: table-header-group }
                tfoot { display: table-footer-group }
                .contrat-header {
                    background: linear-gradient(135deg, #6a11cb 0%, #2575fc 100%) !important;
                    -webkit-print-color-adjust: exact !important;
                    print-color-adjust: exact !important;
                    color-adjust: exact !important;
                }
                img, .badge {
                    -webkit-print-color-adjust: exact !important;
                    print-color-adjust: exact !important;
                    color-adjust: exact !important;
                }
            }
        `
    });    useEffect(() => {
        const fetchData = async () => {
            try {
                setLoading(true);

                /* ----------- CONTRAT ----------- */
                const { data: contratData } = await ContratService.getById(id);
                setContrat(contratData);

                /* ----------- DEVIS (+ client / entreprise) ----------- */
                if (contratData.devisId) {
                    try {
                        const { data: devisData } = await DevisService.getById(contratData.devisId);

                        setDevis(devisData);
                        // ⬇️  on récupère directement les infos des parties
                        setClient(devisData.client);
                        setEntreprise(devisData.entreprise);
                    } catch (err) {
                        console.error("Erreur chargement devis :", err);
                        setDevis(null);
                    }
                }

                /* ----------- MISSIONS ----------- */
                const missionsRes = await MissionService.getAllMissions();
                setMissions(missionsRes.data.filter(m => m.contratId === Number(id)));

                /* ----------- ARTICLES ----------- */
                try {
                    const artRes = await ArticleService.getByContratId(id);
                    setArticles(artRes.data);
                } catch (err) {
                    console.error("Erreur chargement articles :", err);
                    setArticles([]);
                }

                setLoading(false);
            } catch (err) {
                console.error("Erreur chargement données :", err);
                setError("Impossible de charger les détails du contrat. Veuillez réessayer ultérieurement.");
                setLoading(false);
            }
        };
        
        fetchData();
    }, [id]);

    const formatDate = (dateString) => {
        if (!dateString) return "—";
        const date = new Date(dateString);
        return date.toLocaleDateString();
    };

    // Calculer les dates importantes et l'état du contrat
    const calculateContratStatus = () => {
        if (!contrat || !contrat.dateSignature) {
            return { status: "inconnu", label: "Inconnu", color: "secondary" };
        }

        const today = new Date();
        const signatureDate = new Date(contrat.dateSignature);
        
        // Si une durée est spécifiée, calculer la date de fin
        if (contrat.dureeMois) {
            const endDate = new Date(signatureDate);
            endDate.setMonth(endDate.getMonth() + parseInt(contrat.dureeMois));
            
            if (today > endDate) {
                return { 
                    status: "expiré", 
                    label: "Expiré", 
                    color: "danger",
                    expirationDate: endDate.toLocaleDateString()
                };
            } else if (today < signatureDate) {
                return { 
                    status: "futur", 
                    label: "À venir", 
                    color: "warning",
                    startDate: signatureDate.toLocaleDateString()
                };
            } else {
                // Calculer le pourcentage d'avancement
                const totalDuration = endDate.getTime() - signatureDate.getTime();
                const elapsed = today.getTime() - signatureDate.getTime();
                const percent = Math.round((elapsed / totalDuration) * 100);
                
                return { 
                    status: "actif", 
                    label: "En cours", 
                    color: "success",
                    percent: percent,
                    endDate: endDate.toLocaleDateString()
                };
            }
        } else {
            // Si pas de durée spécifiée
            if (today < signatureDate) {
                return { 
                    status: "futur", 
                    label: "À venir", 
                    color: "warning",
                    startDate: signatureDate.toLocaleDateString()
                };
            } else {                return { 
                    status: "actif", 
                    label: "En cours (durée indéfinie)", 
                    color: "info" 
                };
            }
        }
    };

    if (loading) {
        return (
            <Container className="contrat-detail-container">
                <Card className="shadow-sm">
                    <Card.Header className="bg-light text-center p-4">
                        <div className="mb-3">
                            <Spinner animation="border" variant="primary" style={{ width: "3rem", height: "3rem" }} />
                        </div>
                        <h4>Chargement du contrat</h4>
                        <p className="text-muted mb-0">Récupération des informations en cours...</p>
                    </Card.Header>
                    <Card.Body>
                        <div className="text-center mb-4">
                            <ProgressBar animated now={75} variant="primary" className="mb-3" />
                            <p className="text-muted">Veuillez patienter pendant le chargement des détails du contrat et des informations associées.</p>
                        </div>
                    </Card.Body>
                </Card>
            </Container>
        );
    }
    
    if (error) {
        return (
            <Container className="contrat-detail-container">
                <Card className="shadow-sm">
                    <Card.Header className="bg-danger text-white p-4">
                        <h4 className="mb-0">
                            <FontAwesomeIcon icon={faExclamationTriangle} className="me-2" />
                            Erreur lors du chargement du contrat
                        </h4>
                    </Card.Header>
                    <Card.Body className="p-4">
                        <div className="text-center mb-4">
                            <div className="mb-3">
                                <FontAwesomeIcon icon={faExclamationTriangle} size="3x" className="text-danger" />
                            </div>
                            <p className="lead">{error}</p>
                            <p className="text-muted">Veuillez vérifier votre connexion ou réessayer ultérieurement.</p>
                        </div>
                        <div className="d-flex justify-content-center mt-4">
                            <Button 
                                variant="outline-secondary" 
                                onClick={() => navigate('/contrats')}
                                className="me-3"
                            >
                                <FontAwesomeIcon icon={faArrowLeft} className="me-2" />
                                Retour à la liste
                            </Button>
                            <Button 
                                variant="primary" 
                                onClick={() => window.location.reload()}
                            >
                                <FontAwesomeIcon icon={faCheck} className="me-2" />
                                Réessayer
                            </Button>
                        </div>
                    </Card.Body>
                </Card>
            </Container>
        );    }
    
    const contratStatus = calculateContratStatus();
    
    return (
        <Container className="contrat-detail-container">
            {/* Barre d'actions - ne sera pas imprimée */}
            <div className="d-flex justify-content-between align-items-center mb-4 no-print">
                <div>
                    <Button 
                        variant="light" 
                        className="btn-outline-action me-2" 
                        onClick={() => navigate("/contrats")}
                    >
                        <FontAwesomeIcon icon={faArrowLeft} className="me-2" />
                        Retour à la liste
                    </Button>
                </div>
                
                {/* Afficher un avertissement si des erreurs de connexion se produisent */}
                {error && (
                    <Alert variant="danger" className="mt-2 mb-2 w-100">
                        <FontAwesomeIcon icon={faExclamationTriangle} className="me-2" />
                        {error}
                    </Alert>
                )}
                  <div className="d-flex">
                    <Button
                        variant={isPrinting ? "secondary" : "success"}
                        className="me-2 print-button"
                        onClick={handlePrint}
                        disabled={isPrinting || loading}
                        title="Imprimer le contrat"
                    >
                        {isPrinting ? (
                            <>
                                <Spinner as="span" animation="border" size="sm" role="status" aria-hidden="true" className="me-2" />
                                Préparation de l'impression...
                            </>
                        ) : (
                            <>
                                <FontAwesomeIcon icon={faPrint} className="me-2" />
                                Imprimer le contrat
                            </>
                        )}
                    </Button>
                    <Button 
                        variant="warning" 
                        className="btn-action"
                        onClick={() => navigate(`/contrats/edit/${id}`)}
                        title="Modifier ce contrat"
                    >
                        <FontAwesomeIcon icon={faPencilAlt} className="me-2" />
                        Modifier
                    </Button>
                </div>
            </div>
            
            {/* Contenu à imprimer */}
            <div ref={componentRef} className="print-container">
                <Card className="shadow mb-4">                
                    <Card.Header className="contrat-header">
                        {/* En-tête principal du contrat */}
                        <div className="d-flex justify-content-between align-items-center">
                            <div className="d-flex align-items-center">
                                <h2 className="contrat-title text-white">
                                    <FontAwesomeIcon icon={faFileContract} className="me-3" />
                                    {contrat.referenceContrat}
                                    <Badge className="contrat-id-badge bg-white text-primary">
                                        #{contrat.id}
                                    </Badge>
                                </h2>
                            </div>
                            <div className="print-meta d-flex align-items-center">
                                <Badge bg="light" text="dark" className="info-badge me-2">
                                    <FontAwesomeIcon icon={faCalendarAlt} className="me-1" />
                                    Signé le {formatDate(contrat.dateSignature)}
                                </Badge>
                                <Badge 
                                    bg={contratStatus.color} 
                                    className="status-badge"
                                >
                                    <FontAwesomeIcon 
                                        icon={
                                            contratStatus.status === "actif" ? faCheck :
                                            contratStatus.status === "expiré" ? faCalendarTimes :
                                            contratStatus.status === "futur" ? faCalendarPlus :
                                            faInfoCircle
                                        }
                                        className="status-badge-icon me-1"
                                    />
                                    {contratStatus.label}
                                </Badge>
                            </div>
                        </div>
                          {/* Parties contractantes */}
                        <div className="mt-4 d-flex justify-content-between flex-wrap parties-contractantes">
                            {/* Prestataire - depuis le devis ou directement depuis entreprise */}
                            {(devis?.entreprise || entreprise) && (
                                <div className="partie text-white">
                                    <h5 className="mb-2">
                                        <FontAwesomeIcon icon={faBuilding} className="me-2" />
                                        Prestataire
                                    </h5>
                                    <div className="ps-4">
                                        <h4>{devis?.entreprise?.nom || entreprise?.nom}</h4>
                                        {(devis?.entreprise?.formeJuridique || entreprise?.formeJuridique) && (
                                            <div>Forme juridique: {devis?.entreprise?.formeJuridique || entreprise?.formeJuridique}</div>
                                        )}
                                        {(devis?.entreprise?.siret || entreprise?.siret) && 
                                            <div>SIRET: {devis?.entreprise?.siret || entreprise?.siret}</div>
                                        }
                                        {(devis?.entreprise?.numeroTva || entreprise?.numeroTva) && 
                                            <div>N° TVA: {devis?.entreprise?.numeroTva || entreprise?.numeroTva}</div>
                                        }
                                        {(devis?.entreprise?.adresse || entreprise?.adresse) && (
                                            <div>
                                                {devis?.entreprise?.adresse || entreprise?.adresse}
                                                {(devis?.entreprise?.codePostal || entreprise?.codePostal) && (devis?.entreprise?.ville || entreprise?.ville) && (
                                                    <span>, {devis?.entreprise?.codePostal || entreprise?.codePostal} {devis?.entreprise?.ville || entreprise?.ville}</span>
                                                )}
                                            </div>
                                        )}
                                    </div>
                                </div>
                            )}
                            
                            {/* Client - depuis le devis ou directement depuis client */}
                            {(devis?.client || client) && (
                                <div className="partie text-white">
                                    <h5 className="mb-2">
                                        <FontAwesomeIcon icon={faUserTie} className="me-2" />
                                        Client
                                    </h5>
                                    <div className="ps-4">
                                        <h4>{devis?.client?.nom || client?.nom} {devis?.client?.prenom || client?.prenom}</h4>
                                        {(devis?.client?.type || client?.type) && (
                                            <div>Type: {(devis?.client?.type || client?.type) === "PROFESSIONNEL" ? "Professionnel" : "Particulier"}</div>
                                        )}
                                        {(devis?.client?.siret || client?.siret) && 
                                            <div>SIRET: {devis?.client?.siret || client?.siret}</div>
                                        }
                                        {(devis?.client?.adresse || client?.adresse) && (
                                            <div>
                                                {devis?.client?.adresse || client?.adresse}
                                                {(devis?.client?.codePostal || client?.codePostal) && (devis?.client?.ville || client?.ville) && (
                                                    <span>, {devis?.client?.codePostal || client?.codePostal} {devis?.client?.ville || client?.ville}</span>
                                                )}
                                            </div>
                                        )}
                                        {(devis?.client?.email || client?.email) && 
                                            <div>Email: {devis?.client?.email || client?.email}</div>
                                        }
                                        {(devis?.client?.telephone || client?.telephone) && 
                                            <div>Tél: {devis?.client?.telephone || client?.telephone}</div>
                                        }
                                    </div>
                                </div>
                            )}
                        </div>
                          {/* Infos complémentaires */}
                        <div className="mt-3 d-flex flex-wrap contrat-meta-infos">
                            {(devis?.montantTotal || contrat?.montantTotal) && (
                                <div className="info-box me-3">
                                    <div className="info-label">Montant total</div>
                                    <div className="info-value">
                                        <Badge bg="success" className="info-badge">
                                            <FontAwesomeIcon icon={faEuroSign} className="info-icon me-1" />
                                            {devis?.montantTotal || contrat?.montantTotal} €
                                        </Badge>
                                    </div>
                                </div>
                            )}
                            
                            {contrat.dureeMois && (
                                <div className="info-box me-3">
                                    <div className="info-label">Durée</div>
                                    <div className="info-value">
                                        <Badge bg="info" className="info-badge">
                                            <FontAwesomeIcon icon={faClock} className="info-icon me-1" />
                                            {contrat.dureeMois} mois
                                        </Badge>
                                    </div>
                                </div>
                            )}
                            
                            {contratStatus.endDate && (
                                <div className="info-box me-3">
                                    <div className="info-label">Date d'expiration</div>
                                    <div className="info-value">
                                        <Badge bg="warning" text="dark" className="info-badge">
                                            <FontAwesomeIcon icon={faCalendarCheck} className="info-icon me-1" />
                                            {contratStatus.endDate}
                                        </Badge>
                                    </div>
                                </div>
                            )}
                            
                            <div className="info-box">
                                <div className="info-label">Reconduction tacite</div>
                                <div className="info-value">
                                    <Badge bg={contrat.taciteReconduction ? "success" : "danger"} className="info-badge">
                                        <FontAwesomeIcon icon={contrat.taciteReconduction ? faCheck : faTimes} className="info-icon me-1" />
                                        {contrat.taciteReconduction ? "Oui" : "Non"}
                                    </Badge>
                                </div>
                            </div>
                        </div>
                    </Card.Header>
                    
                    <Card.Body className="contrat-body p-4">
                        {/* Section Informations Générales */}
                        <Row className="mb-4">
                            <Col>
                                <div className="print-section">
                                    <h3 className="text-primary mb-3">
                                        <FontAwesomeIcon icon={faFileContract} className="me-2" />
                                        Informations Générales
                                    </h3>
                                    <Table hover bordered responsive className="detail-table">
                                        <tbody>
                                            <tr>
                                                <th width="30%">Référence contrat</th>
                                                <td>{contrat.referenceContrat}</td>
                                            </tr>
                                            <tr>
                                                <th>Date de signature</th>
                                                <td>{formatDate(contrat.dateSignature)}</td>
                                            </tr>
                                            {contrat.description && (
                                                <tr>
                                                    <th>Description</th>
                                                    <td>{contrat.description}</td>
                                                </tr>
                                            )}
                                            <tr>
                                                <th>Durée</th>
                                                <td>
                                                    {contrat.dureeMois ? 
                                                        `${contrat.dureeMois} mois` : 
                                                        <span className="fst-italic text-muted">Non spécifiée</span>
                                                    }
                                                </td>
                                            </tr>
                                            <tr>
                                                <th>Reconduction tacite</th>
                                                <td>
                                                    {contrat.taciteReconduction ? 
                                                        <Badge bg="success">Oui</Badge> : 
                                                        <Badge bg="danger">Non</Badge>
                                                    }
                                                </td>
                                            </tr>
                                            {contrat.preavisMois && (
                                                <tr>
                                                    <th>Préavis</th>
                                                    <td>{contrat.preavisMois} mois</td>
                                                </tr>
                                            )}
                                        </tbody>
                                    </Table>
                                </div>
                            </Col>
                        </Row>                        {/* Section Informations Détaillées sur le Prestataire et le Client */}
                        {((devis && (devis.entreprise || devis.client)) || entreprise || client) && (
                            <Row className="mb-4">
                                <Col>
                                    <div className="print-section parties-details">
                                        <h3 className="text-primary mb-3">
                                            <FontAwesomeIcon icon={faHandshake} className="me-2" />
                                            Informations Détaillées des Parties
                                        </h3>
                                        
                                        <Row>
                                            {/* Informations du Prestataire - depuis le devis ou directement*/}
                                            {(devis?.entreprise || entreprise) && (
                                                <Col md={6} className="mb-4 mb-md-0">
                                                    <Card className="h-100 partie-card">
                                                        <Card.Header className="bg-light">
                                                            <h4 className="mb-0">
                                                                <FontAwesomeIcon icon={faBuilding} className="me-2 text-primary" />
                                                                Prestataire
                                                            </h4>
                                                        </Card.Header>
                                                        <Card.Body>
                                                            <Table hover responsive className="detail-table">
                                                                <tbody>
                                                                    <tr>
                                                                        <th>Nom</th>
                                                                        <td>{devis?.entreprise?.nom || entreprise?.nom}</td>
                                                                    </tr>
                                                                    {(devis?.entreprise?.siret || entreprise?.siret) && (
                                                                        <tr>
                                                                            <th>SIRET</th>
                                                                            <td>{devis?.entreprise?.siret || entreprise?.siret}</td>
                                                                        </tr>
                                                                    )}
                                                                    {(devis?.entreprise?.formeJuridique || entreprise?.formeJuridique) && (
                                                                        <tr>
                                                                            <th>Forme juridique</th>
                                                                            <td>{devis?.entreprise?.formeJuridique || entreprise?.formeJuridique}</td>
                                                                        </tr>
                                                                    )}
                                                                    {(devis?.entreprise?.adresse || entreprise?.adresse) && (
                                                                        <tr>
                                                                            <th>Adresse</th>
                                                                            <td>{devis?.entreprise?.adresse || entreprise?.adresse}</td>
                                                                        </tr>
                                                                    )}
                                                                    {(devis?.entreprise?.codePostal || entreprise?.codePostal) && (
                                                                        <tr>
                                                                            <th>Code postal</th>
                                                                            <td>{devis?.entreprise?.codePostal || entreprise?.codePostal}</td>
                                                                        </tr>
                                                                    )}
                                                                    {(devis?.entreprise?.ville || entreprise?.ville) && (
                                                                        <tr>
                                                                            <th>Ville</th>
                                                                            <td>{devis?.entreprise?.ville || entreprise?.ville}</td>
                                                                        </tr>
                                                                    )}
                                                                    {(devis?.entreprise?.email || entreprise?.email) && (
                                                                        <tr>
                                                                            <th>Email</th>
                                                                            <td>{devis?.entreprise?.email || entreprise?.email}</td>
                                                                        </tr>
                                                                    )}
                                                                    {(devis?.entreprise?.telephone || entreprise?.telephone) && (
                                                                        <tr>
                                                                            <th>Téléphone</th>
                                                                            <td>{devis?.entreprise?.telephone || entreprise?.telephone}</td>
                                                                        </tr>
                                                                    )}
                                                                    {(devis?.entreprise?.numeroTva || entreprise?.numeroTva) && (
                                                                        <tr>
                                                                            <th>N° TVA</th>
                                                                            <td>{devis?.entreprise?.numeroTva || entreprise?.numeroTva}</td>
                                                                        </tr>
                                                                    )}
                                                                </tbody>
                                                            </Table>
                                                        </Card.Body>
                                                    </Card>
                                                </Col>
                                            )}
                                            
                                            {/* Informations du Client - depuis le devis ou directement */}
                                            {(devis?.client || client) && (
                                                <Col md={6}>
                                                    <Card className="h-100 partie-card">
                                                        <Card.Header className="bg-light">
                                                            <h4 className="mb-0">
                                                                <FontAwesomeIcon icon={faUserTie} className="me-2 text-primary" />
                                                                Client
                                                            </h4>
                                                        </Card.Header>
                                                        <Card.Body>
                                                            <Table hover responsive className="detail-table">
                                                                <tbody>
                                                                    <tr>
                                                                        <th>Nom</th>
                                                                        <td>{devis?.client?.nom || client?.nom}</td>
                                                                    </tr>
                                                                    {(devis?.client?.prenom || client?.prenom) && (
                                                                        <tr>
                                                                            <th>Prénom</th>
                                                                            <td>{devis?.client?.prenom || client?.prenom}</td>
                                                                        </tr>
                                                                    )}
                                                                    {(devis?.client?.type || client?.type) && (
                                                                        <tr>
                                                                            <th>Type</th>
                                                                            <td>
                                                                                <Badge bg="info">
                                                                                    {(devis?.client?.type || client?.type) === "PROFESSIONNEL" ? "Professionnel" : "Particulier"}
                                                                                </Badge>
                                                                            </td>
                                                                        </tr>
                                                                    )}
                                                                    {(devis?.client?.siret || client?.siret) && (
                                                                        <tr>
                                                                            <th>SIRET</th>
                                                                            <td>{devis?.client?.siret || client?.siret}</td>
                                                                        </tr>
                                                                    )}
                                                                    {(devis?.client?.adresse || client?.adresse) && (
                                                                        <tr>
                                                                            <th>Adresse</th>
                                                                            <td>{devis?.client?.adresse || client?.adresse}</td>
                                                                        </tr>
                                                                    )}
                                                                    {(devis?.client?.codePostal || client?.codePostal) && (
                                                                        <tr>
                                                                            <th>Code postal</th>
                                                                            <td>{devis?.client?.codePostal || client?.codePostal}</td>
                                                                        </tr>
                                                                    )}
                                                                    {(devis?.client?.ville || client?.ville) && (
                                                                        <tr>
                                                                            <th>Ville</th>
                                                                            <td>{devis?.client?.ville || client?.ville}</td>
                                                                        </tr>
                                                                    )}
                                                                    {(devis?.client?.email || client?.email) && (
                                                                        <tr>
                                                                            <th>Email</th>
                                                                            <td>{devis?.client?.email || client?.email}</td>
                                                                        </tr>
                                                                    )}
                                                                    {(devis?.client?.telephone || client?.telephone) && (
                                                                        <tr>
                                                                            <th>Téléphone</th>
                                                                            <td>{devis?.client?.telephone || client?.telephone}</td>
                                                                        </tr>
                                                                    )}
                                                                </tbody>
                                                            </Table>
                                                        </Card.Body>
                                                    </Card>
                                                </Col>
                                            )}
                                        </Row>
                                    </div>
                                </Col>
                            </Row>
                        )}
                        
                        {/* Section Articles du Contrat */}
                        <Row className="mb-4">
                            <Col>
                                <div className="print-section">
                                    <h3 className="text-primary mb-3">
                                        <FontAwesomeIcon icon={faParagraph} className="me-2" />
                                        Articles du Contrat
                                    </h3>
                                    {!articles || articles.length === 0 ? (
                                        <Alert variant="info">
                                            <div className="text-center">
                                                <FontAwesomeIcon icon={faFileAlt} size="2x" className="mb-2" />
                                                <p className="mb-0">Aucun article associé à ce contrat.</p>
                                            </div>
                                        </Alert>
                                    ) : (
                                        <div>
                                            {articles.map((article, index) => (
                                                <Card key={article.id} className="mb-3 article-card">
                                                    <Card.Header className="bg-light">
                                                        <h4 className="mb-0">
                                                            <span className="article-number">Article {index + 1}</span> - {article.titre}
                                                        </h4>
                                                    </Card.Header>
                                                    <Card.Body>
                                                        <div className="article-content">
                                                            {article.contenu}
                                                        </div>
                                                    </Card.Body>
                                                </Card>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            </Col>
                        </Row>
                        
                        {/* Section Missions associées */}
                        <Row className="mb-4">
                            <Col>
                                <div className="print-section">
                                    <h3 className="text-primary mb-3">
                                        <FontAwesomeIcon icon={faTasks} className="me-2" />
                                        Missions associées ({missions ? missions.length : 0})
                                    </h3>
                                    {!missions || missions.length === 0 ? (
                                        <Alert variant="info">
                                            <div className="text-center">
                                                <FontAwesomeIcon icon={faTasks} size="2x" className="mb-2" />
                                                <p className="mb-0">Aucune mission associée à ce contrat.</p>
                                            </div>
                                        </Alert>
                                    ) : (
                                        <Table hover bordered responsive className="mission-table">
                                            <thead className="table-light">
                                                <tr>
                                                    <th>Titre</th>
                                                    <th>Date de début</th>
                                                    <th>Date de fin</th>
                                                    <th>Statut</th>
                                                </tr>
                                            </thead>
                                            <tbody>                                                {missions.map(mission => {
                                                    const isCompleted = new Date(mission.dateFinMission) < new Date();
                                                    const isPending = new Date(mission.dateDebutMission) > new Date();
                                                    const statusColor = isCompleted ? "secondary" : isPending ? "warning" : "success";
                                                    const statusText = isCompleted ? "Terminée" : isPending ? "À venir" : "En cours";
                                                    
                                                    return (
                                                        <tr key={mission.id}>
                                                            <td className="fw-bold">{mission.titreMission}</td>
                                                            <td>{formatDate(mission.dateDebutMission)}</td>
                                                            <td>{formatDate(mission.dateFinMission)}</td>
                                                            <td>
                                                                <Badge bg={statusColor} pill>
                                                                    {statusText}
                                                                </Badge>
                                                            </td>
                                                        </tr>
                                                    );
                                                })}
                                            </tbody>
                                        </Table>
                                    )}
                                </div>
                            </Col>
                        </Row>
                        
                        {/* Section Détails du Devis */}
                        {devis && (
                            <Row className="mb-4">
                                <Col>
                                    <div className="print-section">
                                        <h3 className="text-primary mb-3">
                                            <FontAwesomeIcon icon={faFileInvoice} className="me-2" />
                                            Détails du devis associé
                                        </h3>
                                        <Table hover bordered responsive className="detail-table">
                                            <tbody>
                                                <tr>
                                                    <th width="30%">Référence devis</th>
                                                    <td>{devis.referenceDevis}</td>
                                                </tr>
                                                <tr>
                                                    <th>Date de création</th>
                                                    <td>{formatDate(devis.dateDevis)}</td>
                                                </tr>
                                                {devis.dateValidite && (
                                                    <tr>
                                                        <th>Date de validité</th>
                                                        <td>{formatDate(devis.dateValidite)}</td>
                                                    </tr>
                                                )}
                                                {devis.montantTotal && (
                                                    <tr>
                                                        <th>Montant total</th>
                                                        <td>{devis.montantTotal} €</td>
                                                    </tr>
                                                )}
                                            </tbody>
                                        </Table>
                                    </div>
                                </Col>
                            </Row>
                        )}
                        
                        {/* Section Signatures */}
                        <Row className="mt-5">
                            <Col>
                                <div className="print-section signatures">
                                    <h3 className="text-primary mb-4">Signatures</h3>
                                    <div className="d-flex justify-content-between">
                                        <div className="signature-block">
                                            <p className="signature-title">Pour le prestataire</p>
                                            {devis && devis.entreprise && (
                                                <p>{devis.entreprise.nom}</p>
                                            )}
                                            <div className="signature-line"></div>
                                            <p className="signature-info">Nom, prénom et signature</p>
                                        </div>
                                        
                                        <div className="signature-block">
                                            <p className="signature-title">Pour le client</p>
                                            {devis && devis.client && (
                                                <p>{devis.client.nom}</p>
                                            )}
                                            <div className="signature-line"></div>
                                            <p className="signature-info">Nom, prénom et signature</p>
                                        </div>
                                    </div>
                                </div>
                            </Col>
                        </Row>
                        
                        {/* Document PDF original - seulement pour l'affichage, pas pour l'impression */}
                        {contrat.documentPdf && (
                            <Row className="mt-4 no-print">
                                <Col>
                                    <Card className="border-0 shadow-sm">
                                        <Card.Header className="bg-light">
                                            <h4 className="mb-0">
                                                <FontAwesomeIcon icon={faFilePdf} className="me-2 text-danger" />
                                                Document contractuel original
                                            </h4>
                                        </Card.Header>
                                        <Card.Body className="text-center">
                                            <div className="d-flex justify-content-center mb-3">
                                                <Button
                                                    variant="danger"
                                                    className="me-3"
                                                    href={`data:application/pdf;base64,${contrat.documentPdf}`}
                                                    target="_blank"
                                                    rel="noreferrer"
                                                >
                                                    <FontAwesomeIcon icon={faEye} className="me-2" />
                                                    Visualiser
                                                </Button>
                                                <Button
                                                    variant="outline-secondary"
                                                    href={`data:application/pdf;base64,${contrat.documentPdf}`}
                                                    download={`contrat_${contrat.referenceContrat}.pdf`}
                                                >
                                                    <FontAwesomeIcon icon={faDownload} className="me-2" />
                                                    Télécharger
                                                </Button>
                                            </div>
                                        </Card.Body>
                                    </Card>
                                </Col>
                            </Row>
                        )}
                    </Card.Body>
                </Card>
            </div>
        </Container>
    );
}
