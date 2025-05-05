package com.boulevardsecurity.securitymanagementapp.security;

import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;

@Service
public class CustomUserDetailsService implements UserDetailsService {

    // Normalement, ceci serait lié à un UserRepository
    // private final UserRepository userRepository;

    @Override
    public UserDetails loadUserByUsername(String username) throws UsernameNotFoundException {
        // En production, cette méthode devrait chercher l'utilisateur dans la base de données
        // User user = userRepository.findByEmail(username)
        //        .orElseThrow(() -> new UsernameNotFoundException("Utilisateur non trouvé: " + username));
        // return new CustomUserDetails(user);
        
        // Pour le moment, retournons simplement un utilisateur fictif pour permettre le démarrage de l'application
        throw new UsernameNotFoundException("Méthode non encore implémentée - cette classe est un placeholder");
    }
}
