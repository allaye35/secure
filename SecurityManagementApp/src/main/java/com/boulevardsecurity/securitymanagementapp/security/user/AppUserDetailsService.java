package com.boulevardsecurity.securitymanagementapp.security.user;


import com.boulevardsecurity.securitymanagementapp.model.AgentDeSecurite;
import com.boulevardsecurity.securitymanagementapp.model.Client;
import com.boulevardsecurity.securitymanagementapp.repository.AgentDeSecuriteRepository;
import com.boulevardsecurity.securitymanagementapp.repository.ClientRepository;

import lombok.RequiredArgsConstructor;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class AppUserDetailsService implements UserDetailsService {

    private final AgentDeSecuriteRepository agentRepo;
    private final ClientRepository clientRepo;

    @Override
    public UserDetails loadUserByUsername(String email) throws UsernameNotFoundException {
        AgentDeSecurite a = agentRepo.findByEmail(email).orElse(null);
        if (a != null) {
            return new AppUserDetails(a.getId(), a.getEmail(), a.getPassword(), a.getRole(), "AGENT");
        }
        Client c = clientRepo.findByEmail(email).orElse(null);
        if (c != null) {
            return new AppUserDetails(c.getId(), c.getEmail(), c.getPassword(), c.getRole(), "CLIENT");
        }
        throw new UsernameNotFoundException("Utilisateur introuvable: " + email);
    }
}
