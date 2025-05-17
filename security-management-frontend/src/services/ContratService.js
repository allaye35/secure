// src/services/ContratService.js
import api from "./api";          // <-- le bon chemin

const RESOURCE = "/contrats";

// helper : construit le multipart dto + file
const buildFormData = (dtoData, file) => {
  try {
    const fd = new FormData();
    
    // CRUCIAL: Le backend attend exactement:
    // 1. Une partie nommée 'dto' contenant le JSON stringifié
    // Vérification explicite des données avant stringification
    if (typeof dtoData !== 'object' || dtoData === null) {
      console.error("ERREUR: dtoData n'est pas un objet valide:", dtoData);
      // Utiliser un objet vide plutôt que null/undefined
      dtoData = {};
    }
    
    // Vérification de la présence de la référence (seul champ obligatoire)
    if (!dtoData.referenceContrat) {
      console.error("ERREUR: la référence du contrat est obligatoire");
      throw new Error("La référence du contrat est obligatoire");
    }
    
    // Gestion des champs optionnels
    const cleanedData = { ...dtoData };
    // Liste des champs optionnels avec valeurs par défaut
    const optionalFields = {
      devisId: null,
      dateSignature: null,
      dureeMois: null,
      taciteReconduction: false,
      preavisMois: null,
      missionIds: [],
      articleIds: []
    };
    
    // Application des valeurs par défaut pour tous les champs non fournis
    Object.keys(optionalFields).forEach(field => {
      if (cleanedData[field] === undefined || cleanedData[field] === null) {
        console.log(`Champ ${field} non fourni, utilisation de la valeur par défaut`);
        cleanedData[field] = optionalFields[field];
      }
    });
    
    // Selon le contrôleur (@RequestPart("dto") ContratCreateDto dto),
    // Spring attend un JSON avec Content-Type application/json
    const jsonString = JSON.stringify(cleanedData);
    
    // CRUCIAL: Pour Spring Boot @RequestPart, créer un Blob avec le bon Content-Type
    const jsonBlob = new Blob([jsonString], { type: 'application/json' });
    fd.append("dto", jsonBlob);
    
    // 2. Ajouter le fichier PDF s'il existe, en tant que 'file' (pas 'documentPdf')
    // Rendre le fichier PDF optionnel
    if (file instanceof File) {
      console.log("Ajout du fichier PDF:", file.name, file.type, file.size, "bytes");
      fd.append("file", file);
    } else {
      console.log("Pas de fichier PDF fourni ou invalide - c'est optionnel");
    }
    
    // Pour déboguer
    console.log("FormData créé avec la structure correcte:");
    console.log("- dto (JSON blob):", jsonString); // Affiche juste la chaîne pour debug
    console.log("- file présent:", !!file);
    
    try {
      // Lister toutes les entrées pour vérifier
      console.log("Contenu final du FormData:");
      for (let [key, value] of fd.entries()) {
        console.log(`- ${key}: ${typeof value === 'object' ? 'File/Blob' : value}`);
      }
    } catch (err) {
      console.error("Erreur lors de l'inspection du FormData:", err);
    }
    
    return fd;
  } catch (error) {
    console.error("Erreur critique lors de la création du FormData:", error);
    // En cas d'erreur, retourner un FormData vide mais valide
    const emptyFd = new FormData();
    emptyFd.append("dto", "{}");
    return emptyFd;
  }
};

const ContratService = {
  /* ---------- Lecture ---------- */  getAll: (options = {}) => {
    console.log("ContratService.getAll() appelé", options);
    
    // Si mode test activé, retourner des données simulées
    if (options.testMode) {
      console.log("Mode TEST activé - Simulation de la liste des contrats");
      return Promise.resolve({
        data: [
          {
            id: 1,
            reference: "CONT-TEST-001",
            titre: "Contrat de test 1",
            dateDebut: "2025-01-01",
            dateFin: "2025-12-31",
            statut: "ACTIF"
          },
          {
            id: 2,
            reference: "CONT-TEST-002",
            titre: "Contrat de test 2",
            dateDebut: "2025-02-01",
            dateFin: "2025-11-30",
            statut: "EN_ATTENTE"
          }
        ]
      });
    }
    
    return api.get(RESOURCE);
  },
  
  getById: (id, options = {}) => {
    console.log("ContratService.getById() appelé avec id:", id);
    
    // Si mode test activé, retourner des données simulées
    if (options.testMode) {
      console.log("Mode TEST activé - Simulation de détail d'un contrat");
      return Promise.resolve({
        data: {
          id,
          reference: `CONT-TEST-${id}`,
          titre: `Contrat de test ${id}`,
          description: "Description du contrat de test",
          dateDebut: "2025-01-01",
          dateFin: "2025-12-31",
          statut: "ACTIF",
          montantHT: 10000,
          montantTVA: 2000,
          montantTTC: 12000
        }
      });
    }
    
    return api.get(`${RESOURCE}/${id}`);
  },
  
  getByReference: (ref, options = {}) => {
    console.log("ContratService.getByReference() appelé avec ref:", ref);
    
    // Si mode test activé, retourner des données simulées
    if (options.testMode) {
      console.log("Mode TEST activé - Simulation de recherche par référence");
      return Promise.resolve({
        data: {
          id: 999,
          reference: ref,
          titre: `Contrat ${ref}`,
          description: `Description du contrat ${ref}`,
          dateDebut: "2025-01-01",
          dateFin: "2025-12-31",
          statut: "ACTIF"
        }
      });
    }
    
    return api.get(`${RESOURCE}/ref/${ref}`);
  },
  /* ---------- Création ---------- */  create: (data, file = null) => {
    console.log("ContratService.create() appelé avec:", data, "et fichier:", file ? file.name : "aucun");
    
    try {
      // Vérifier que la référence est présente (seul champ obligatoire)
      if (!data.referenceContrat) {
        console.error("Erreur: la référence du contrat est obligatoire");
        return Promise.reject(new Error("La référence du contrat est obligatoire"));
      }
      
      // Construire un objet FormData avec les données et le fichier séparé
      const formData = buildFormData(data, file);
      
      console.log("Envoi des données en FormData");
      
      // Mode test simplifié - si le paramètre 'testMode' est présent, utiliser un mock pour le test frontend
      if (data.testMode) {
        console.log("Mode TEST activé - Simulation de la création d'un contrat");
        return Promise.resolve({
          data: {
            id: Date.now(), // Simuler un ID généré
            reference: `REF-${Math.floor(Math.random() * 10000)}`,
            ...data,
            pdfUrl: file ? `uploads/contrats/${Date.now()}-${file.name}` : null,
            createdAt: new Date().toISOString()
          }
        });
      }
      
      // IMPORTANT: Pour MultipartFile en Spring, il ne faut PAS définir manuellement le Content-Type
      // car le navigateur doit générer le boundary correct automatiquement
      return api.post(RESOURCE, formData);
    } catch (error) {
      console.error("Erreur lors de la création du contrat:", error);
      return Promise.reject(error);
    }
  },/* ---------- Mise à jour ---------- */  update: (id, data, file = null) => {
    console.log("ContratService.update() appelé avec id:", id, "et data:", data, "et fichier:", file ? file.name : "aucun");
    
    try {
      // Utiliser FormData avec les données et le fichier séparé
      const formData = buildFormData(data, file);
      
      console.log("Envoi des données en FormData pour mise à jour");
      
      // Mode test simplifié - si le paramètre 'testMode' est présent, utiliser un mock pour le test frontend
      if (data.testMode) {
        console.log("Mode TEST activé - Simulation de la mise à jour d'un contrat");
        return Promise.resolve({
          data: {
            id,
            ...data,
            pdfUrl: file ? `uploads/contrats/${Date.now()}-${file.name}` : data.pdfUrl,
            updatedAt: new Date().toISOString()
          }
        });
      }
      
      // Ne PAS définir de headers pour laisser Axios gérer correctement le FormData
      return api.put(`${RESOURCE}/${id}`, formData);
    } catch (error) {
      console.error("Erreur lors de la mise à jour du contrat:", error);
      return Promise.reject(error);
    }
  },
  /* ---------- Suppression ---------- */
  remove: (id, options = {}) => {
    console.log("ContratService.remove() appelé avec id:", id);
    
    // Si mode test activé, simuler la suppression
    if (options.testMode) {
      console.log("Mode TEST activé - Simulation de la suppression d'un contrat");
      return Promise.resolve({
        status: 204,
        statusText: "No Content"
      });
    }
    
    return api.delete(`${RESOURCE}/${id}`);
  },
  
  /* ---------- Méthodes pour les tests ---------- */
  // Cette méthode permet de savoir si le mode test est disponible
  isTestModeAvailable: () => true,
};

export default ContratService;
