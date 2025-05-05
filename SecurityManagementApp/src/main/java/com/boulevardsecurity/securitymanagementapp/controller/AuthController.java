//package com.boulevardsecurity.securitymanagementapp.controller;
//
//import com.boulevardsecurity.securitymanagementapp.Enums.Role;
//import com.boulevardsecurity.securitymanagementapp.dto.*;
//import com.boulevardsecurity.securitymanagementapp.model.Client;
//import com.boulevardsecurity.securitymanagementapp.repository.AgentDeSecuriteRepository;
//import com.boulevardsecurity.securitymanagementapp.repository.ClientRepository;
//import com.boulevardsecurity.securitymanagementapp.security.*;
//import lombok.RequiredArgsConstructor;
//import org.springframework.http.*;
//import org.springframework.security.authentication.*;
//import org.springframework.security.core.userdetails.UserDetails;
//import org.springframework.security.crypto.password.PasswordEncoder;
//import org.springframework.web.bind.annotation.*;
//
//@RestController
//@RequestMapping("/api/auth")
//@CrossOrigin(origins = "http://localhost:3000")
//@RequiredArgsConstructor
//public class AuthController {
//
//    private final AuthenticationManager  manager;
//    private final CustomUserDetailsService uds;
//    private final JwtUtil                util;
//    private final PasswordEncoder        encoder;
//    private final ClientRepository       clientRepo;
//    private final AgentDeSecuriteRepository agentRepo;
//
//    @PostMapping("/login")
//    public ResponseEntity<AuthResponse> login(@RequestBody AuthRequest req) {
//        manager.authenticate(
//                new UsernamePasswordAuthenticationToken(req.getEmail(), req.getPassword()));
//        String jwt = util.generateToken(uds.loadUserByUsername(req.getEmail()));
//        return ResponseEntity.ok(new AuthResponse(jwt));
//    }
//
//    @PostMapping("/register")
//    public ResponseEntity<AuthResponse> register(@RequestBody RegisterRequest req) {
//
//        if (clientRepo.existsByEmail(req.getEmail()) ||
//                agentRepo .existsByEmail(req.getEmail()))
//            return ResponseEntity.status(HttpStatus.CONFLICT).build();
//
//        Client c = Client.builder()
//                .nom(req.getUsername())
//                .email(req.getEmail())
//                .password(encoder.encode(req.getPassword()))
//                .role(Role.CLIENT)
//                .build();
//        clientRepo.save(c);
//
//        String jwt = util.generateToken(AppUserDetails.of(c));
//        return ResponseEntity.status(HttpStatus.CREATED).body(new AuthResponse(jwt));
//    }
//}
