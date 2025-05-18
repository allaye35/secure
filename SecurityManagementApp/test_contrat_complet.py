import requests
import json

print("Test de création d'un contrat avec Python\n")

# Charger les données JSON
with open('test-contrat-complet.json', 'r') as file:
    data = json.load(file)

print("Données à envoyer:")
print(json.dumps(data, indent=2))

# Envoi de la requête POST
print("\nEnvoi de la requête...")
try:
    response = requests.post(
        "http://localhost:8080/api/contrats",
        json=data,
        headers={"Content-Type": "application/json"}
    )
    
    # Affichage du code de statut
    print(f"Code statut: {response.status_code}")
    
    # Tentative de décodage de la réponse JSON
    if response.ok:
        result = response.json()
        print("\nContrat créé avec succès!")
        print(f"ID du contrat: {result.get('id')}")
        print(f"Référence: {result.get('referenceContrat')}")
        print(f"Date de signature: {result.get('dateSignature')}")
        
        # Vérifier les missions
        missions = result.get('missionIds', [])
        if missions:
            print("\nMissions associées:")
            for mission_id in missions:
                print(f"  - Mission ID: {mission_id}")
        else:
            print("\nAucune mission associée")
            
        # Sauvegarder l'ID pour des tests ultérieurs
        with open('contrat-complet-id.txt', 'w') as f:
            f.write(str(result.get('id')))
        print("\nID du contrat sauvegardé dans 'contrat-complet-id.txt'")
    else:
        print("\nErreur lors de la création du contrat")
        print(f"Message d'erreur: {response.text}")
except Exception as e:
    print(f"\nErreur: {str(e)}")
