package com.boulevardsecurity.securitymanagementapp.controller;


import com.boulevardsecurity.securitymanagementapp.dto.auth.LoginRequest;
import com.boulevardsecurity.securitymanagementapp.model.AgentDeSecurite;
import com.boulevardsecurity.securitymanagementapp.model.Client;
import com.boulevardsecurity.securitymanagementapp.repository.AgentDeSecuriteRepository;
import com.boulevardsecurity.securitymanagementapp.repository.ClientRepository;
import com.boulevardsecurity.securitymanagementapp.security.user.AppUserDetails;
import com.boulevardsecurity.securitymanagementapp.security.jwt.JwtService; // ✅ bon package

import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

import com.boulevardsecurity.securitymanagementapp.dto.auth.LoginRequest;


import java.util.Map;

@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
public class AuthController {

    private final AuthenticationManager authManager;
    private final JwtService jwtService;
    private final AgentDeSecuriteRepository agentRepo;
    private final ClientRepository clientRepo;

    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody LoginRequest req) {
        Authentication auth = authManager.authenticate(
                new UsernamePasswordAuthenticationToken(req.getEmail(), req.getPassword())
        );
        AppUserDetails user = (AppUserDetails) auth.getPrincipal();

        String access  = jwtService.generateAccessToken(user.getId(), user.getEmail(), user.getRole(), user.getUserType());
        String refresh = jwtService.generateRefreshToken(user.getId(), user.getEmail());

        String nom = null, prenom = null;
        if ("AGENT".equals(user.getUserType())) {
            AgentDeSecurite a = agentRepo.findByEmail(user.getEmail()).orElse(null);
            if (a != null) { nom = a.getNom(); prenom = a.getPrenom(); }
        } else {
            Client c = clientRepo.findByEmail(user.getEmail()).orElse(null);
            if (c != null) { nom = c.getNom(); prenom = c.getPrenom(); }
        }

        return ResponseEntity.ok(Map.of(
            "accessToken",  access,
            "refreshToken", refresh,
            "userId",       user.getId(),
            "role",         user.getRole().name(),
            "userType",     user.getUserType(),
            "email",        user.getEmail(),
            "nom",          nom,
            "prenom",       prenom
        ));
    }

    @PostMapping("/refresh")
    public ResponseEntity<?> refresh(@RequestBody Map<String, String> body) {
        String refresh = body.get("refreshToken");
        if (refresh == null || !jwtService.isValid(refresh)) {
            return ResponseEntity.status(401).body(Map.of("message", "Refresh token invalide"));
        }
        String email = jwtService.getSubject(refresh);

        var agent = agentRepo.findByEmail(email).orElse(null);
        if (agent != null) {
            String access = jwtService.generateAccessToken(agent.getId(), agent.getEmail(), agent.getRole(), "AGENT");
            return ResponseEntity.ok(Map.of("accessToken", access));
        }
        var client = clientRepo.findByEmail(email).orElse(null);
        if (client != null) {
            String access = jwtService.generateAccessToken(client.getId(), client.getEmail(), client.getRole(), "CLIENT");
            return ResponseEntity.ok(Map.of("accessToken", access));
        }
        return ResponseEntity.status(401).body(Map.of("message", "Utilisateur introuvable"));
    }

    @PostMapping("/logout")
    public ResponseEntity<?> logout() {
        return ResponseEntity.ok(Map.of("message", "Déconnecté (supprime les tokens côté client)"));
    }
}
