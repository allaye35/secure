// Ce fichier contient des exemples d'utilisation du ContratService en mode test
// pour faciliter le développement et les tests du frontend

import ContratService from './ContratService';

// Exemple d'utilisation du mode test pour lister tous les contrats
async function testListeContrats() {
  try {
    const result = await ContratService.getAll({ testMode: true });
    console.log("Liste des contrats (mode test):", result.data);
    return result.data;
  } catch (error) {
    console.error("Erreur:", error);
  }
}

// Exemple d'utilisation du mode test pour obtenir un contrat par ID
async function testGetContratById(id = 1) {
  try {
    const result = await ContratService.getById(id, { testMode: true });
    console.log(`Contrat #${id} (mode test):`, result.data);
    return result.data;
  } catch (error) {
    console.error("Erreur:", error);
  }
}

// Exemple d'utilisation du mode test pour créer un nouveau contrat
async function testCreationContrat() {
  const nouveauContrat = {
    titre: "Contrat de test",
    reference: "REF-TEST-" + Date.now(),
    description: "Description du contrat de test",
    dateDebut: "2025-01-01",
    dateFin: "2025-12-31",
    montantHT: 1000,
    // Notez l'absence de plusieurs champs optionnels (devisId, missionId, document, etc.)
    testMode: true // Activer le mode test
  };
  
  try {
    const result = await ContratService.create(nouveauContrat);
    console.log("Contrat créé (mode test):", result.data);
    return result.data;
  } catch (error) {
    console.error("Erreur:", error);
  }
}

// Exemple d'utilisation du mode test pour mettre à jour un contrat
async function testMiseAJourContrat(id = 1) {
  const majContrat = {
    titre: "Contrat mis à jour",
    description: "Description modifiée",
    montantHT: 1500,
    testMode: true // Activer le mode test
  };
  
  try {
    const result = await ContratService.update(id, majContrat);
    console.log(`Contrat #${id} mis à jour (mode test):`, result.data);
    return result.data;
  } catch (error) {
    console.error("Erreur:", error);
  }
}

// Exemple d'utilisation du mode test pour supprimer un contrat
async function testSuppressionContrat(id = 1) {
  try {
    const result = await ContratService.remove(id, { testMode: true });
    console.log(`Contrat #${id} supprimé (mode test)`, result);
    return true;
  } catch (error) {
    console.error("Erreur:", error);
    return false;
  }
}

// Exemple d'utilisation complet
async function testComplet() {
  console.log("=== TEST COMPLET DU SERVICE CONTRAT ===");
  
  // Lister les contrats
  await testListeContrats();
  
  // Obtenir un contrat spécifique
  await testGetContratById(2);
  
  // Créer un nouveau contrat
  const nouveauContrat = await testCreationContrat();
  
  // Mettre à jour le contrat créé
  if (nouveauContrat && nouveauContrat.id) {
    await testMiseAJourContrat(nouveauContrat.id);
    
    // Supprimer le contrat
    await testSuppressionContrat(nouveauContrat.id);
  }
  
  console.log("=== FIN DU TEST ===");
}

export {
  testListeContrats,
  testGetContratById,
  testCreationContrat,
  testMiseAJourContrat,
  testSuppressionContrat,
  testComplet
};

// Si ce fichier est exécuté directement (par exemple avec Node.js)
if (typeof window === 'undefined' && require.main === module) {
  testComplet().then(() => console.log("Tests terminés"));
}
