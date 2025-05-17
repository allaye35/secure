import requests
import json
import os

# URL de l'API
url = "http://localhost:8080/api/contrats"

# Charger les données JSON
with open("contrat-test.json", "r") as f:
    contrat_data = f.read()

# Préparer les fichiers à envoyer
files = {
    'dto': ('contrat-test.json', contrat_data, 'application/json'),
    'file': ('contrat-test.pdf', open('contrat-test.txt', 'rb'), 'application/pdf')
}

# Envoyer la requête POST
response = requests.post(url, files=files)

# Afficher la réponse
print("Statut de la réponse:", response.status_code)
print("Réponse:", response.text)
