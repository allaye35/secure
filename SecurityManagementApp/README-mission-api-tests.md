# Tests de l'API Mission

Ce dossier contient des scripts pour tester l'API REST du contrôleur `MissionControleur` de l'application Security Management.

## Scripts disponibles

- `test-mission-api.ps1` : Script PowerShell pour tester l'API
- `test-mission-api.bat` : Script Batch pour tester l'API (version simplifiée)
- `test-mission-api-advanced.ps1` : Script PowerShell avancé avec meilleure présentation des résultats

## Prérequis

- L'application backend doit être démarrée sur `http://localhost:8080`
- Pour les scripts PowerShell, PowerShell 5.1 ou supérieur est requis
- Pour le script batch, Windows est requis

## Guide d'utilisation

### Étape 1 : Lancer l'application backend

Assurez-vous que l'application backend Spring Boot est en cours d'exécution :

```
cd SecurityManagementApp
./gradlew bootRun
```

### Étape 2 : Choisir et exécuter un script

#### Pour utiliser le script PowerShell standard :

```powershell
cd SecurityManagementApp
.\test-mission-api.ps1
```

#### Pour utiliser le script batch :

```cmd
cd SecurityManagementApp
test-mission-api.bat
```

#### Pour utiliser le script PowerShell avancé :

```powershell
cd SecurityManagementApp
.\test-mission-api-advanced.ps1
```

## Ajustement des IDs

Les scripts utilisent des IDs prédéfinis pour les entités comme les agents, sites, plannings, etc. Vous devrez peut-être ajuster ces IDs en fonction des données présentes dans votre base de données :

- `tarifMissionId` : ID du tarif de mission (utilisé pour la création/mise à jour de mission)
- `devisId` : ID du devis (utilisé pour la création/mise à jour de mission)
- `agentIds` : IDs des agents à affecter à la mission
- `siteId` : ID du site à associer à la mission
- `planningId` : ID du planning à associer à la mission
- `factureId` : ID de la facture à associer à la mission

## Fonctionnalités testées

Les scripts testent les fonctionnalités suivantes du contrôleur MissionControleur :

1. Récupération de toutes les missions (`GET /api/missions`)
2. Récupération d'une mission par ID (`GET /api/missions/{id}`)
3. Simulation de calcul de montants (`POST /api/missions/simuler-calcul`)
4. Création d'une mission (`POST /api/missions`)
5. Mise à jour d'une mission (`PUT /api/missions/{id}`)
6. Affectation d'agents à une mission (`PUT /api/missions/{id}/agents`)
7. Retrait d'un agent d'une mission (`DELETE /api/missions/{id}/agent/{idAgent}`)
8. Association d'un site à une mission (`PUT /api/missions/{id}/site/{idSite}`)
9. Association d'un planning à une mission (`PUT /api/missions/{id}/planning/{idPlanning}`)
10. Association d'une facture à une mission (`PUT /api/missions/{id}/factures/{idFacture}`)
11. Association d'une géolocalisation à une mission (`PUT /api/missions/{id}/geoloc`)
12. Récupération des missions commençant après une date (`GET /api/missions/apres?date={date}`)
13. Récupération des missions finissant avant une date (`GET /api/missions/avant?date={date}`)
14. Récupération des missions par agent (`GET /api/missions/agent/{idAgent}`)
15. Suppression d'une mission (`DELETE /api/missions/{id}`)

## Notes importantes

- Les scripts créent une nouvelle mission au début et la suppriment à la fin
- Les erreurs sont affichées en rouge (dans les scripts PowerShell)
- Vous pouvez modifier les données de test dans les scripts selon vos besoins

## Dépannage

### Le script PowerShell ne s'exécute pas

Si vous rencontrez une erreur de sécurité avec PowerShell, vous devrez peut-être ajuster la politique d'exécution :

```powershell
Set-ExecutionPolicy -ExecutionPolicy Bypass -Scope Process
```

### Les requêtes échouent avec une erreur 404

Vérifiez que :
- L'application backend est bien démarrée
- L'URL de base est correcte (par défaut : http://localhost:8080/api)
- Les chemins d'accès à l'API correspondent bien aux endpoints du contrôleur

### Les requêtes échouent avec une erreur 400 (Bad Request)

Vérifiez que :
- Les IDs utilisés existent bien dans la base de données
- Les formats de date sont corrects (YYYY-MM-DD)
- Les formats d'heure sont corrects (HH:MM)
- Les données JSON envoyées correspondent bien au format attendu par le backend
