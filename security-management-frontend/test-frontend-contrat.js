// Script pour tester le formulaire de création de contrat
// À exécuter dans la console du navigateur sur la page de création de contrat

// Préparer le test
const testContrat = {
  referenceContrat: `TEST-FRONTEND-${new Date().toISOString().slice(0,19).replace(/[T:-]/g, "")}`,
  dateSignature: "", // optionnel
  dureeMois: "6",
  taciteReconduction: true,
  preavisMois: "2"
};

// Simuler le remplissage du formulaire
function remplirFormulaire() {
  console.log("🧪 TEST: Remplissage automatique du formulaire");
  
  // Trouver les éléments du formulaire
  const refInput = document.querySelector('input[name="referenceContrat"]');
  const dureeMoisInput = document.querySelector('input[name="dureeMois"]');
  const preavisInput = document.querySelector('input[name="preavisMois"]');
  const taciteSwitch = document.querySelector('input[name="taciteReconduction"]');
  
  // Remplir les champs
  if (refInput) {
    refInput.value = testContrat.referenceContrat;
    refInput.dispatchEvent(new Event('change', { bubbles: true }));
    console.log("✅ Référence remplie:", testContrat.referenceContrat);
  } else {
    console.error("❌ Champ référence non trouvé");
  }
  
  if (dureeMoisInput) {
    dureeMoisInput.value = testContrat.dureeMois;
    dureeMoisInput.dispatchEvent(new Event('change', { bubbles: true }));
    console.log("✅ Durée remplie:", testContrat.dureeMois);
  }
  
  if (preavisInput) {
    preavisInput.value = testContrat.preavisMois;
    preavisInput.dispatchEvent(new Event('change', { bubbles: true }));
    console.log("✅ Préavis rempli:", testContrat.preavisMois);
  }
  
  if (taciteSwitch) {
    taciteSwitch.checked = testContrat.taciteReconduction;
    taciteSwitch.dispatchEvent(new Event('change', { bubbles: true }));
    console.log("✅ Tacite reconduction:", testContrat.taciteReconduction);
  }

  console.log("✅ Formulaire rempli");
}

// Simuler la soumission du formulaire
function soumettreFormulaire() {
  const submitBtn = Array.from(document.querySelectorAll('button')).find(b => 
    b.textContent.includes('Enregistrer'));
  
  if (submitBtn) {
    console.log("🚀 Soumission du formulaire...");
    submitBtn.click();
  } else {
    console.error("❌ Bouton d'envoi non trouvé");
  }
}

// Exécuter le test
setTimeout(() => {
  remplirFormulaire();
  
  // Attendre que React mette à jour l'état
  setTimeout(() => {
    soumettreFormulaire();
  }, 500);
}, 500);
