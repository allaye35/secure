// src/services/AuthService.js
// VERSION COMPLÈTEMENT DÉSACTIVÉE - AUCUNE AUTHENTIFICATION

const AuthService = {
    /**
     * Version complètement désactivée - simule toujours une connexion réussie
     */
    login: async () => {
        // On ne stocke même plus de token - la sécurité est complètement désactivée
        console.log("SÉCURITÉ DÉSACTIVÉE - Login automatiquement réussi");
        return Promise.resolve({ success: true });
    },

    /** Déconnexion - ne fait rien */
    logout: () => {
        console.log("SÉCURITÉ DÉSACTIVÉE - Logout ignoré");
    },

    /**
     * Inscription - ne fait rien
     */
    register: () => {
        console.log("SÉCURITÉ DÉSACTIVÉE - Registration automatiquement réussie");
        return Promise.resolve({ success: true });
    },

    /**
     * Toujours considéré comme connecté
     */
    isLoggedIn: () => {
        // On considère toujours l'utilisateur comme connecté
        return true;
    }
};

export default AuthService;
