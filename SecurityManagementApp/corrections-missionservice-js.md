# Corrections proposées pour MissionService.js

Voici les modifications à apporter au fichier `MissionService.js` pour assurer la compatibilité avec le backend:

## 1. Modifier les méthodes de mise à jour pour utiliser PATCH

```javascript
/**
 * Mettre à jour une mission
 */
update: (id, missionData, nouvelleAdresse) => {
  let url = `${PATH}/${id}`;
  if (nouvelleAdresse) {
    url += `?nouvelleAdresse=${encodeURIComponent(nouvelleAdresse)}`;
  }
  return api.patch(url, missionData).then(response => response.data);
},

/**
 * Mettre à jour une mission (alias pour update)
 */
updateMission: (id, missionData, nouvelleAdresse) => {
  let url = `${PATH}/${id}`;
  if (nouvelleAdresse) {
    url += `?nouvelleAdresse=${encodeURIComponent(nouvelleAdresse)}`;
  }
  return api.patch(url, missionData).then(response => response.data);
},
```

## 2. Corriger l'URL pour associer une facture

```javascript
/**
 * Associer une facture à une mission (corrigé pour utiliser le pluriel 'factures')
 */
associerFacture: (missionId, factureId) => api.put(`${PATH}/${missionId}/factures/${factureId}`).then(response => response.data),

/**
 * Associer une facture à une mission (alias pour associerFacture)
 */
assignFacture: (missionId, factureId) => api.put(`${PATH}/${missionId}/factures/${factureId}`).then(response => response.data),
```

## Comment intégrer ces modifications

Pour intégrer ces modifications, vous pouvez:

1. Ouvrir le fichier `MissionService.js`
2. Remplacer les méthodes existantes par les versions corrigées ci-dessus
3. Tester la mise à jour d'une mission pour confirmer que les corrections fonctionnent

## Impact sur les composants frontend

Les composants frontend qui utilisent ces méthodes devront également être mis à jour pour:
- Passer le paramètre `nouvelleAdresse` lorsqu'il est disponible
- S'assurer que les handlers de mise à jour sont adaptés aux nouvelles signatures de méthodes

Par exemple, dans un composant de formulaire de mission:

```javascript
const handleSubmit = (formData) => {
  // Vérifier si une nouvelle adresse a été fournie
  const nouvelleAdresse = formData.nouvelleAdresse || null;
  
  // Appeler la méthode mise à jour avec le nouveau paramètre
  MissionService.updateMission(id, formData, nouvelleAdresse)
    .then(response => {
      // Gérer le succès
    })
    .catch(error => {
      // Gérer l'erreur
    });
};
```
