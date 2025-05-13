import React from "react";

const ArticleContratDetail = ({ article }) => {
    // Fonction pour formater une date
    const formatDate = (dateString) => {
        if (!dateString) return "–";
        return new Date(dateString).toLocaleString();
    };

    return (
        <div className="article-item" style={{
            border: '1px solid #e2e8f0',
            borderRadius: '10px',
            margin: '15px auto 25px',
            padding: '0',
            backgroundColor: '#fff',
            boxShadow: '0 4px 6px rgba(0,0,0,0.05)',
            overflow: 'hidden',
            maxWidth: '800px',           // Largeur approximative A4
            minHeight: '1123px',         // Hauteur approximative A4 (297mm)
            width: '100%',
            position: 'relative'
        }}>
            <div className="article-header" style={{
                backgroundColor: '#3498db',
                padding: '20px 30px',    // Padding augmenté
                color: 'white'
            }}>
                <h4 className="article-title" style={{
                    fontWeight: '700',   // Plus en gras
                    margin: '0',
                    fontSize: '1.8rem'   // Titre plus grand
                }}>
                    {article.libelle || 'Article sans titre'}
                </h4>
            </div>

            {/* Affichage détaillé de l'article (toujours visible) */}
            <div className="article-content" style={{
                padding: '30px 40px',    // Padding augmenté pour ressembler à une page A4
                backgroundColor: '#fff'
            }}>
                <div className="article-metadata" style={{
                    display: 'flex', 
                    flexWrap: 'wrap', 
                    gap: '40px',         // Plus d'espacement
                    marginBottom: '30px',
                    background: '#f8fafc',
                    padding: '20px',
                    borderRadius: '8px'  // Bordures plus arrondies
                }}>
                    {article.createdAt && <p style={{margin: '0', fontSize: '1.2rem'}}><strong>Créé le :</strong> {formatDate(article.createdAt)}</p>}
                    {article.updatedAt && <p style={{margin: '0', fontSize: '1.2rem'}}><strong>Mis à jour le :</strong> {formatDate(article.updatedAt)}</p>}
                </div>

                <div className="article-text" style={{
                    whiteSpace: 'pre-wrap',
                    padding: '30px',     // Padding augmenté
                    border: '1px solid #e2e8f0',
                    borderRadius: '8px',
                    backgroundColor: '#fff',
                    marginBottom: '30px',
                    fontFamily: "'Times New Roman', serif", // Police plus formelle pour un contrat
                    lineHeight: '1.8',
                    fontSize: '1.25rem', // Taille de texte augmentée 
                    boxShadow: 'inset 0 2px 4px rgba(0,0,0,0.03)'
                }}>
                    <h5 style={{marginTop: 0, color: '#2c3e50', fontWeight: '600', marginBottom: '20px', fontSize: '1.4rem', borderBottom: '1px solid #eaeaea', paddingBottom: '10px'}}>
                        Contenu de l'article :
                    </h5>
                    {article.contenu || 'Aucun contenu disponible.'}
                </div>

                <div className="article-meta" style={{
                    textAlign: 'right',
                    position: 'relative',
                    marginTop: '40px',
                    paddingTop: '20px',
                    borderTop: '1px solid #eaeaea'
                }}>
                    <p className="article-relation-info" style={{
                        fontSize: '1.1rem',
                        color: '#718096',
                        fontStyle: 'italic',
                        marginBottom: '0'
                    }}>
                        Article du contrat de travail
                    </p>
                </div>
            </div>
        </div>
    );
};

export default ArticleContratDetail;
