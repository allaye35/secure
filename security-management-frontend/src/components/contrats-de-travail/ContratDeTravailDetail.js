import React, { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import ContratDeTravailService from "../../services/ContratDeTravailService";
import ArticleContratTravailService from "../../services/ArticleContratTravailService";
import FicheDePaieService from "../../services/FicheDePaieService";
import AgentService from "../../services/AgentService";
import EntrepriseService from "../../services/EntrepriseService";
import "../../styles/ContratDetail.css"; // Utilisation du fichier CSS dédié

const ContratDeTravailDetail = () => {
    const { id } = useParams();
    const [contrat, setContrat] = useState(null);
    const [agent, setAgent] = useState(null);
    const [entreprise, setEntreprise] = useState(null);
    const [articles, setArticles] = useState([]);
    const [fichesDePaie, setFichesDePaie] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [selectedArticle, setSelectedArticle] = useState(null);
    const [showPdfPreview, setShowPdfPreview] = useState(false);

    // Nouvel état pour le formulaire de création d'article
    const [showArticleForm, setShowArticleForm] = useState(false);
    const [newArticle, setNewArticle] = useState({
        libelle: "",
        contenu: "",
        contratDeTravailId: parseInt(id)
    });
    const [creatingArticle, setCreatingArticle] = useState(false);

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
                console.log("Articles récupérés (données):", articlesRes.data);

                // S'assurer que les articles sont bien un tableau
                const articlesData = Array.isArray(articlesRes.data) ? articlesRes.data : [];
                console.log("Articles après traitement:", articlesData);
                setArticles(articlesData);

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
    };

    // Fonction pour télécharger ou afficher le PDF du contrat
    const handleViewPdf = () => {
        if (contrat.documentPdf) {
            setShowPdfPreview(!showPdfPreview);
        } else {
            alert("Aucun document PDF disponible pour ce contrat.");
        }
    };

    // Fonction pour afficher le détail d'un article
    const toggleArticleDetail = (article) => {
        if (selectedArticle && selectedArticle.id === article.id) {
            setSelectedArticle(null);
        } else {
            setSelectedArticle(article);
        }
    };

    // Fonction pour gérer les changements dans le formulaire
    const handleArticleInputChange = (e) => {
        const { name, value } = e.target;
        setNewArticle({
            ...newArticle,
            [name]: value
        });
    };

    // Fonction pour soumettre le formulaire et créer un article
    const handleArticleSubmit = (e) => {
        e.preventDefault();
        setCreatingArticle(true);

        // S'assurer que l'ID du contrat est bien un nombre
        const articleData = {
            ...newArticle,
            contratDeTravailId: Number(id)
        };

        console.log("Données d'article à envoyer:", articleData);

        ArticleContratTravailService.create(articleData)
            .then(response => {
                console.log("Article créé:", response.data);

                // Ajouter le nouvel article à la liste des articles
                setArticles([...articles, response.data]);

                // Réinitialiser le formulaire
                setNewArticle({
                    libelle: "",
                    contenu: "",
                    contratDeTravailId: Number(id)
                });

                // Fermer le formulaire
                setShowArticleForm(false);

                // Rafraîchir les données des articles depuis le serveur
                ArticleContratTravailService.getByContratTravail(id)
                    .then(refreshResponse => {
                        console.log("Articles rafraîchis:", refreshResponse.data);
                        setArticles(refreshResponse.data || []);
                    })
                    .catch(refreshError => {
                        console.error("Erreur lors du rafraîchissement des articles:", refreshError);
                    });

                alert("L'article a été créé avec succès!");
            })
            .catch(err => {
                console.error("Erreur lors de la création de l'article:", err);
                alert("Erreur lors de la création de l'article. Veuillez réessayer.");
            })
            .finally(() => {
                setCreatingArticle(false);
            });
    };

    return (
        <div className="contrat-detail">
            <h2 className="title">📄 Contrat {contrat.referenceContrat}</h2>

            {/* Bouton pour visualiser le PDF du contrat */}
            <div className="pdf-actions">
                <button
                    className={`btn pdf-button ${contrat.documentPdf ? '' : 'disabled'}`}
                    onClick={handleViewPdf}
                    disabled={!contrat.documentPdf}
                >
                    📑 {showPdfPreview ? 'Masquer le PDF' : 'Visualiser le contrat PDF'}
                </button>
            </div>

            {/* Prévisualiseur de PDF conditionnel */}
            {showPdfPreview && contrat.documentPdf && (
                <div className="pdf-preview-container">
                    <h3>Aperçu du contrat</h3>
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
                            ⬇️ Télécharger le PDF
                        </a>
                    </div>
                </div>
            )}

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
            </div>

            {/* Informations sur l'agent */}
            <div className="info-section">
                <h3>Agent de sécurité</h3>
                <div className="info-block">
                    {agent ? (
                        <>
                            <p><strong>Nom :</strong> {agent.nom} {agent.prenom}</p>
                            <p><strong>Matricule :</strong> {agent.numeroMatricule}</p>
                            <p><strong>Contact :</strong> {agent.telephone}</p>
                            <p><strong>Email :</strong> {agent.email}</p>
                            <Link to={`/agents/${agent.id}`} className="detail-link">
                                Voir le profil complet de l'agent
                            </Link>
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

            {/* Articles du contrat - Version plus conviviale quand vide */}
            <div className="info-section">
                <div className="section-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                    <h3>Articles du contrat ({articles.length})</h3>

                    {/* Bouton pour ajouter un nouvel article - repositionné en haut à droite */}
                    <button
                        onClick={() => setShowArticleForm(!showArticleForm)}
                        className="btn"
                        style={{
                            backgroundColor: '#007bff',
                            color: 'white',
                            border: 'none',
                            padding: '8px 16px',
                            borderRadius: '4px',
                            cursor: 'pointer'
                        }}
                    >
                        {showArticleForm ? '❌ Annuler' : '➕ Ajouter un article'}
                    </button>
                </div>

                {/* Formulaire pour créer un nouvel article */}
                {showArticleForm && (
                    <div className="article-form" style={{
                        border: '1px solid #ddd',
                        borderRadius: '8px',
                        padding: '20px',
                        marginBottom: '30px',
                        backgroundColor: '#f9f9f9'
                    }}>
                        <h4 style={{ marginTop: 0 }}>Nouvel article pour le contrat</h4>
                        <form onSubmit={handleArticleSubmit}>
                            <div style={{ marginBottom: '15px' }}>
                                <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>
                                    Titre de l'article:
                                </label>
                                <input
                                    type="text"
                                    name="libelle"
                                    value={newArticle.libelle}
                                    onChange={handleArticleInputChange}
                                    required
                                    style={{
                                        width: '100%',
                                        padding: '8px',
                                        borderRadius: '4px',
                                        border: '1px solid #ddd'
                                    }}
                                />
                            </div>
                            <div style={{ marginBottom: '15px' }}>
                                <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>
                                    Contenu de l'article:
                                </label>
                                <textarea
                                    name="contenu"
                                    value={newArticle.contenu}
                                    onChange={handleArticleInputChange}
                                    required
                                    rows="10"
                                    style={{
                                        width: '100%',
                                        padding: '8px',
                                        borderRadius: '4px',
                                        border: '1px solid #ddd',
                                        fontFamily: 'inherit'
                                    }}
                                />
                            </div>
                            <div style={{ textAlign: 'right' }}>
                                <button
                                    type="submit"
                                    disabled={creatingArticle}
                                    style={{
                                        backgroundColor: '#28a745',
                                        color: 'white',
                                        border: 'none',
                                        padding: '10px 20px',
                                        borderRadius: '4px',
                                        cursor: creatingArticle ? 'not-allowed' : 'pointer',
                                        opacity: creatingArticle ? 0.7 : 1
                                    }}
                                >
                                    {creatingArticle ? 'Création en cours...' : '💾 Enregistrer l\'article'}
                                </button>
                            </div>
                        </form>
                    </div>
                )}

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
            </div>

            {/* Actions et liens */}
            <div className="actions-container">
                <Link to="/contrats-de-travail" className="back-link">⬅ Retour à la liste</Link>
                <Link to={`/contrats-de-travail/edit/${id}`} className="edit-link">✏️ Modifier ce contrat</Link>
            </div>
        </div>
    );
};

export default ContratDeTravailDetail;
