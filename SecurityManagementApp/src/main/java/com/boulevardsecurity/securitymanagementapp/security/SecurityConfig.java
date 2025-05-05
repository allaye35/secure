package com.boulevardsecurity.securitymanagementapp.security;

import jakarta.servlet.http.HttpServletRequest;
import lombok.RequiredArgsConstructor;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.dao.DaoAuthenticationProvider;
import org.springframework.security.config.Customizer;
import org.springframework.security.config.annotation.authentication.configuration.AuthenticationConfiguration;
import org.springframework.security.config.annotation.method.configuration.EnableMethodSecurity;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;

import java.util.List;

@Configuration
@EnableMethodSecurity
@RequiredArgsConstructor
public class SecurityConfig {

    private final JwtFilter filter;
    private final CustomUserDetailsService uds;

    /* ------------------------------------------------------------------ */
    /* ①  Beans techniques                                                */
    /* ------------------------------------------------------------------ */
    @Bean
    public PasswordEncoder encoder() {
        return new BCryptPasswordEncoder();
    }

    @Bean
    public DaoAuthenticationProvider provider(PasswordEncoder encoder) {
        DaoAuthenticationProvider p = new DaoAuthenticationProvider();
        p.setUserDetailsService(uds);
        p.setPasswordEncoder(encoder);
        return p;
    }

    /* ------------------------------------------------------------------ */
    /* ②  Chaîne de filtres & règles - SECURITÉ COMPLÈTEMENT DÉSACTIVÉE   */
    /* ------------------------------------------------------------------ */
    @Bean
    public SecurityFilterChain chain(HttpSecurity http,
                                     DaoAuthenticationProvider provider) throws Exception {

        http
                .csrf(csrf -> csrf.disable())
                .cors(Customizer.withDefaults())
                .sessionManagement(sm -> sm
                        .sessionCreationPolicy(SessionCreationPolicy.STATELESS))
                .authorizeHttpRequests(auth -> auth
                        // DÉSACTIVATION COMPLÈTE DE LA SÉCURITÉ - TOUS LES ENDPOINTS SONT PUBLICS
                        .anyRequest().permitAll());
                
                // On ne met plus le filtre JWT
                // .authenticationProvider(provider)
                // .addFilterBefore(filter, UsernamePasswordAuthenticationFilter.class);

        return http.build();
    }

    /* ------------------------------------------------------------------ */
    /* ③  Bean CORS global (autorise React en localhost:3000)             */
    /* ------------------------------------------------------------------ */
    @Bean
    public CorsConfigurationSource corsConfigurationSource() {

        CorsConfiguration cfg = new CorsConfiguration();
        cfg.setAllowedOrigins(List.of("http://localhost:3000"));
        cfg.setAllowedMethods(List.of("GET","POST","PUT","DELETE","OPTIONS"));
        cfg.setAllowedHeaders(List.of("*"));
        cfg.setAllowCredentials(true);

        UrlBasedCorsConfigurationSource src = new UrlBasedCorsConfigurationSource();
        src.registerCorsConfiguration("/**", cfg);
        return src;
    }

    /* ------------------------------------------------------------------ */
    /* ④  AuthenticationManager (pour AuthController)                     */
    /* ------------------------------------------------------------------ */
    @Bean
    public AuthenticationManager authManager(AuthenticationConfiguration cfg) throws Exception {
        return cfg.getAuthenticationManager();
    }
}
