import React, { useState, useEffect, useRef } from "react";
import { useParams, Link } from "react-router-dom";
import ContratDeTravailService from "../../services/ContratDeTravailService";
import ArticleContratTravailService from "../../services/ArticleContratTravailService";
import FicheDePaieService from "../../services/FicheDePaieService";
import AgentService from "../../services/AgentService";
import EntrepriseService from "../../services/EntrepriseService";
import { usePDF } from "react-to-pdf";
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import "../../styles/ContratDetail.css"; // Utilisation du fichier CSS dédié

const ContratDeTravailDetail = () => {
    const { id } = useParams();
    const [contrat, setContrat] = useState(null);
    const [agent, setAgent] = useState(null);
    const [entreprise, setEntreprise] = useState(null);
    const [articles, setArticles] = useState([]);
    const [fichesDePaie, setFichesDePaie] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);    const [selectedArticle, setSelectedArticle] = useState(null);
    const [showPdfPreview, setShowPdfPreview] = useState(false);
    const [exportInProgress, setExportInProgress] = useState(false);
      // Options pour l'export PDF
    const { toPDF, targetRef } = usePDF({
        filename: `contrat-de-travail-${id}.pdf`,
        page: { margin: 20 },
        method: 'save'
    });
    
    // Fonction pour imprimer le contrat
    const handlePrint = () => {
        toPDF();
    };

    useEffect(() => {

        console.log("Chargement des détails du contrat avec ID:", id);
        setLoading(true);

        // Charger le contrat principal - en s'assurant d'utiliser getById avec B majuscule
        ContratDeTravailService.getById(id)
            .then(res => {
                const contratData = res.data;
                setContrat(contratData);
                console.log("Contrat chargé:", contratData);

                // Charger les données associées
                return Promise.all([
                    // Charger les infos de l'agent
                    contratData.agentDeSecuriteId ?
                        AgentService.getAgentById(contratData.agentDeSecuriteId) :
                        Promise.resolve({ data: null }),

                    // Charger les infos de l'entreprise
                    contratData.entrepriseId ?
                        EntrepriseService.getEntrepriseById(contratData.entrepriseId) :
                        Promise.resolve({ data: null }),

                    // Charger les articles du contrat - utilisation de l'ID du paramètre d'URL
                    ArticleContratTravailService.getByContratTravail(Number(id)),

                    // Charger les fiches de paie par contrat (si disponible) ou sinon toutes les fiches
                    FicheDePaieService.getAll()
                ]);
            })
            .then(([agentRes, entrepriseRes, articlesRes, fichesRes]) => {
                setAgent(agentRes.data);
                setEntreprise(entrepriseRes.data);

                // Debuggage des articles
                console.log("Articles récupérés (brut):", articlesRes);
                console.log("Articles récupérés (données):", articlesRes.data);                // S'assurer que les articles sont bien un tableau et les trier par ordre croissant
                const articlesData = Array.isArray(articlesRes.data) ? articlesRes.data : [];
                // Trier les articles par ordre croissant de leur ID
                const articlesTries = articlesData.sort((a, b) => a.id - b.id);
                console.log("Articles après traitement et tri:", articlesTries);
                setArticles(articlesTries);

                // Debuggage des fiches de paie
                console.log("Fiches de paie récupérées:", fichesRes.data);

                // Filtrer les fiches de paie qui correspondent à ce contrat
                // Convertir les deux IDs en number pour s'assurer d'une comparaison correcte
                const contratId = Number(id);
                const fichesDuContrat = Array.isArray(fichesRes.data)
                    ? fichesRes.data.filter(fiche => {
                        const ficheContratId = Number(fiche.contratDeTravailId);
                        console.log(`Fiche ${fiche.id}: contrat=${ficheContratId}, comparé avec ${contratId}, égal: ${ficheContratId === contratId}`);
                        return ficheContratId === contratId;
                    })
                    : [];
                console.log("Fiches de paie filtrées:", fichesDuContrat);
                setFichesDePaie(fichesDuContrat);
            })
            .catch(err => {
                console.error("Erreur lors du chargement des données:", err);
                setError("Impossible de charger les détails du contrat.");
            })
            .finally(() => {
                setLoading(false);
            });


        ArticleContratTravailService.getByContratTravail(id)
            .then(refreshResponse => {
                console.log("Articles rafraîchis:", refreshResponse.data);
                setArticles(refreshResponse.data || []);
            })
            .catch(refreshError => {
                console.error("Erreur lors du rafraîchissement des articles:", refreshError);
            });

    }, [id]);

    if (error) return <p className="error">{error}</p>;
    if (loading) return <p className="loading">Chargement des données du contrat...</p>;
    if (!contrat) return <p>Contrat non trouvé.</p>;

    // Formater une date pour l'affichage
    const formatDate = (dateString) => {
        if (!dateString) return "–";
        return dateString.slice(0, 10).split('-').reverse().join('/');
    };    // Fonction pour télécharger ou afficher le PDF du contrat
    const handleViewPdf = () => {
        if (contrat.documentPdf) {
            setShowPdfPreview(!showPdfPreview);
        } else {
            alert("Aucun document PDF disponible pour ce contrat.");
        }
    };    // Fonction pour exporter la page en PDF avec html2canvas et jsPDF
    const exportToPDF = () => {
        setExportInProgress(true);
        const element = targetRef.current;
        const fileName = `contrat-travail-${contrat?.referenceContrat || id}.pdf`;
        
        const pdfOptions = {
            margin: 10,
            filename: fileName,
            image: { type: 'jpeg', quality: 0.98 },
            html2canvas: { scale: 2 },
            jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' }
        };
        
        html2canvas(element, {
            scale: 2,
            useCORS: true,
            logging: false
        }).then(canvas => {
            const imgData = canvas.toDataURL('image/jpeg', 0.98);
            const pdf = new jsPDF('p', 'mm', 'a4');
            const pdfWidth = pdf.internal.pageSize.getWidth();
            const pdfHeight = pdf.internal.pageSize.getHeight();
            const imgWidth = canvas.width;
            const imgHeight = canvas.height;
            const ratio = Math.min(pdfWidth / imgWidth, pdfHeight / imgHeight);
            const imgX = (pdfWidth - imgWidth * ratio) / 2;
            const imgY = 20;
            
            pdf.addImage(imgData, 'JPEG', imgX, imgY, imgWidth * ratio, imgHeight * ratio);
            pdf.save(fileName);
            setExportInProgress(false);
        }).catch(err => {
            console.error("Erreur lors de l'export PDF:", err);
            setExportInProgress(false);
            alert("Une erreur s'est produite lors de l'export en PDF.");
        });
    };

    // Fonction pour afficher le détail d'un article
    const toggleArticleDetail = (article) => {
        if (selectedArticle && selectedArticle.id === article.id) {
            setSelectedArticle(null);
        } else {
            setSelectedArticle(article);
        }
    };    // Aucune fonction nécessaire pour l'ajout d'articles (fonctionnalité retirée)
    
    return (
        <div className="contrat-detail modern">
            <div className="contrat-header">
                <h2 className="title">📄 Contrat de Travail: {contrat.referenceContrat}</h2>
                
                <div className="action-buttons">
                    <button 
                        className="btn btn-print action-btn" 
                        onClick={handlePrint}
                        disabled={exportInProgress}
                        title="Imprimer le contrat"
                    >
                        <span className="btn-icon">🖨️</span> Imprimer
                    </button>
                      <button 
                        className="btn btn-export action-btn" 
                        onClick={exportToPDF}
                        disabled={exportInProgress}
                        title="Exporter en PDF"
                    >
                        <span className="btn-icon">📥</span> Exporter en PDF
                        {exportInProgress && <span className="spinner"></span>}
                    </button>
                    
                    {contrat.documentPdf && (
                        <button
                            className="btn pdf-button action-btn"
                            onClick={handleViewPdf}
                        >
                            <span className="btn-icon">📑</span> {showPdfPreview ? 'Masquer le PDF' : 'PDF Original'}
                        </button>
                    )}
                </div>
            </div>
            
            <div className="contrat-status">
                <span className={`status-badge ${contrat.dateFin ? (new Date(contrat.dateFin) < new Date() ? 'expired' : 'active') : 'active'}`}>
                    {contrat.dateFin ? (new Date(contrat.dateFin) < new Date() ? 'Expiré' : 'Actif') : 'En cours'}
                </span>
            </div>
            
            {/* Prévisualiseur de PDF conditionnel */}
            {showPdfPreview && contrat.documentPdf && (
                <div className="pdf-preview-container">
                    <h3>Document PDF Original</h3>
                    <div className="pdf-viewer">
                        <iframe
                            src={`data:application/pdf;base64,${contrat.documentPdf}`}
                            title={`Contrat de travail ${contrat.referenceContrat}`}
                            width="100%"
                            height="500px"
                        />
                    </div>
                    <div className="pdf-download">
                        <a
                            href={`data:application/pdf;base64,${contrat.documentPdf}`}
                            download={`contrat_${contrat.referenceContrat}.pdf`}
                            className="btn download-btn"
                        >
                            ⬇️ Télécharger le PDF original
                        </a>
                    </div>
                </div>
            )}
              {/* Zone pour l'impression/export PDF */}
            <div className="printable-content" ref={targetRef}>

            {/* Informations générales du contrat */}
            <div className="info-section">
                <h3>Informations générales</h3>
                <div className="info-block">
                    <p><strong>Type de contrat :</strong> {contrat.typeContrat}</p>
                    <p><strong>Début :</strong> {formatDate(contrat.dateDebut)}</p>
                    <p><strong>Fin :</strong> {formatDate(contrat.dateFin)}</p>
                    <p><strong>Salaire :</strong> {contrat.salaireDeBase} € ({contrat.periodiciteSalaire})</p>
                    <p><strong>Créé le :</strong> {contrat.createdAt ? contrat.createdAt.replace("T"," ").slice(0,19) : "–"}</p>
                    <p><strong>Mis à jour :</strong> {contrat.updatedAt ? contrat.updatedAt.replace("T"," ").slice(0,19) : "–"}</p>
                </div>
            </div>            {/* Informations sur l'agent */}
            <div className="info-section agent-highlight">
                <h3>Agent de sécurité</h3>
                <div className="info-block agent-info-block">
                    {agent ? (
                        <>
                            <div className="agent-primary-info">
                                <div className="agent-avatar">
                                    {agent.photo ? 
                                        <img src={agent.photo} alt={`${agent.nom} ${agent.prenom}`} /> : 
                                        <div className="avatar-placeholder">
                                            {agent.nom && agent.prenom ? 
                                                `${agent.nom.charAt(0)}${agent.prenom.charAt(0)}` : 
                                                "AS"}
                                        </div>
                                    }
                                </div>
                                <div className="agent-main-details">
                                    <h4 className="agent-name">{agent.nom} {agent.prenom}</h4>
                                    <div className="agent-badge">Matricule: {agent.numeroMatricule}</div>
                                    <p className="agent-position">{agent.fonction || "Agent de sécurité"}</p>
                                </div>
                            </div>
                            
                            <div className="agent-secondary-info">
                                <div className="info-grid">
                                    <div className="info-item">
                                        <p className="info-label">Contact</p>
                                        <p className="info-value">{agent.telephone || "Non renseigné"}</p>
                                    </div>
                                    <div className="info-item">
                                        <p className="info-label">Email</p>
                                        <p className="info-value">{agent.email || "Non renseigné"}</p>
                                    </div>
                                    {agent.dateNaissance && (
                                        <div className="info-item">
                                            <p className="info-label">Date de naissance</p>
                                            <p className="info-value">{formatDate(agent.dateNaissance)}</p>
                                        </div>
                                    )}
                                    {agent.adresse && (
                                        <div className="info-item">
                                            <p className="info-label">Adresse</p>
                                            <p className="info-value">{agent.adresse}</p>
                                        </div>
                                    )}
                                </div>
                                
                                <div className="agent-action">
                                    <Link to={`/agents/${agent.id}`} className="detail-link">
                                        Voir le profil complet de l'agent
                                    </Link>
                                </div>
                            </div>
                        </>
                    ) : (
                        <p>Aucune information d'agent disponible.</p>
                    )}
                </div>
            </div>

            {/* Informations sur l'entreprise */}
            <div className="info-section">
                <h3>Entreprise</h3>
                <div className="info-block">
                    {entreprise ? (
                        <>
                            <p><strong>Nom :</strong> {entreprise.raisonSociale}</p>
                            <p><strong>SIRET :</strong> {entreprise.siret}</p>
                            <p><strong>Adresse :</strong> {entreprise.adresse}</p>
                            <p><strong>Contact :</strong> {entreprise.telephone}</p>
                            <Link to={`/entreprises/${entreprise.id}`} className="detail-link">
                                Voir le profil complet de l'entreprise
                            </Link>
                        </>
                    ) : (
                        <p>Aucune information d'entreprise disponible.</p>
                    )}
                </div>
            </div>

            {/* Description du contrat */}
            {contrat.description && (
                <div className="info-section">
                    <h3>Description</h3>
                    <div className="info-block">
                        <p>{contrat.description}</p>
                    </div>
                </div>
            )}

            {/* Articles du contrat - Version plus conviviale quand vide */}            <div className="info-section">
                <div className="section-header" style={{ marginBottom: '20px' }}>
                    <h3>Articles du contrat ({articles.length})</h3>
                </div>

                {/* Liste des articles - toujours affichée */}
                {articles.length > 0 ? (
                    <div className="articles-list">
                        {articles.map(article => (
                            <div key={article.id} className="article-item" style={{
                                border: '1px solid #ddd',
                                borderRadius: '5px',
                                margin: '10px 0',
                                padding: '15px',
                                backgroundColor: '#f9f9f9'
                            }}>
                                <div className="article-header"
                                    onClick={() => toggleArticleDetail(article)}
                                    style={{ cursor: 'pointer' }}>
                                    <h4 className="article-title" style={{
                                        fontWeight: 'bold',
                                        marginBottom: '10px',
                                        color: '#333',
                                        borderBottom: '1px solid #eee',
                                        paddingBottom: '8px'
                                    }}>
                                        {selectedArticle && selectedArticle.id === article.id ? '▼' : '▶'} {article.libelle || 'Article sans titre'}
                                    </h4>
                                </div>

                                {/* Affichage détaillé de l'article */}
                                {selectedArticle && selectedArticle.id === article.id && (
                                    <div className="article-content" style={{
                                        padding: '10px',
                                        backgroundColor: '#fff',
                                        border: '1px solid #eee',
                                        borderRadius: '4px'
                                    }}>
                                        <div className="article-metadata" style={{marginBottom: '12px'}}>
                                            <p><strong>Identifiant :</strong> {article.id}</p>
                                            <p><strong>Titre :</strong> {article.libelle || 'Non spécifié'}</p>
                                            {article.createdAt && <p><strong>Date de création :</strong> {new Date(article.createdAt).toLocaleString()}</p>}
                                            {article.updatedAt && <p><strong>Dernière mise à jour :</strong> {new Date(article.updatedAt).toLocaleString()}</p>}
                                        </div>

                                        <div className="article-text" style={{
                                            whiteSpace: 'pre-wrap',
                                            padding: '15px',
                                            border: '1px solid #eee',
                                            borderRadius: '4px',
                                            backgroundColor: '#fafafa',
                                            marginBottom: '10px',
                                            fontFamily: 'Georgia, serif',
                                            lineHeight: '1.6'
                                        }}>
                                            <h5 style={{marginTop: 0, color: '#555'}}>Contenu de l'article :</h5>
                                            {article.contenu || 'Aucun contenu disponible.'}
                                        </div>

                                        <div className="article-meta">
                                            <p className="article-relation-info" style={{fontSize: '0.9em', color: '#666'}}>
                                                <small>Cet article est associé au contrat de travail #{article.contratDeTravailId}</small>
                                            </p>
                                        </div>
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="info-block empty-state" style={{
                        padding: '20px',
                        backgroundColor: '#f8f9fa',
                        borderRadius: '4px',
                        textAlign: 'center'
                    }}>
                        <p style={{ margin: '10px 0', color: '#6c757d' }}>
                            <span role="img" aria-label="information" style={{ fontSize: '24px', marginRight: '10px' }}>ℹ️</span>
                            Aucun article associé à ce contrat.
                        </p>
                    </div>
                )}
            </div>

            {/* Fiches de paie - Version plus conviviale quand vide */}
            <div className="info-section">
                <h3>Fiches de paie ({fichesDePaie.length})</h3>
                {fichesDePaie.length > 0 ? (
                    <div className="table-wrapper">
                        <table>
                            <thead>
                                <tr>
                                    <th>Référence</th>
                                    <th>Période</th>
                                    <th>Net à payer</th>
                                    <th>Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {fichesDePaie.map(fiche => (
                                    <tr key={fiche.id}>
                                        <td>{fiche.reference}</td>
                                        <td>{formatDate(fiche.periodeDebut)} - {formatDate(fiche.periodeFin)}</td>
                                        <td>{fiche.netAPayer} €</td>
                                        <td>
                                            <Link to={`/fiches-de-paie/${fiche.id}`} className="btn view">
                                                Voir
                                            </Link>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                ) : (
                    <div className="info-block empty-state" style={{
                        padding: '20px',
                        backgroundColor: '#f8f9fa',
                        borderRadius: '4px',
                        textAlign: 'center'
                    }}>
                        <p style={{ margin: '10px 0', color: '#6c757d' }}>
                            <span role="img" aria-label="information" style={{ fontSize: '24px', marginRight: '10px' }}>ℹ️</span>
                            Aucune fiche de paie associée à ce contrat.
                        </p>
                    </div>
                )}
            </div>            {/* Actions et liens */}
            <div className="actions-container">
                <Link to="/contrats-de-travail" className="back-link">⬅ Retour à la liste</Link>
                <Link to={`/contrats-de-travail/edit/${id}`} className="edit-link">✏️ Modifier ce contrat</Link>
            </div>
            </div> {/* Fermeture de la div printable-content */}
        </div>
    );
};

export default ContratDeTravailDetail;
