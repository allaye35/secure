package com.boulevardsecurity.securitymanagementapp.security.jwt;

import com.boulevardsecurity.securitymanagementapp.Enums.Role;
import io.jsonwebtoken.*;
import io.jsonwebtoken.SignatureAlgorithm;
import io.jsonwebtoken.security.Keys;
import org.springframework.stereotype.Service;

import java.security.Key;
import java.util.Date;
import java.util.Map;

@Service
public class JwtService {

    private final Key key;
    private final long accessValidityMs;
    private final long refreshValidityMs;

    public JwtService(JwtProperties props) {
        this.key = Keys.hmacShaKeyFor(props.getSecret().getBytes());
        this.accessValidityMs = props.getAccessTokenValidityMs();
        this.refreshValidityMs = props.getRefreshTokenValidityMs();
    }

    public String generateAccessToken(Long userId, String email, Role role, String userType) {
        Date now = new Date();
        Date exp = new Date(now.getTime() + accessValidityMs);
        return Jwts.builder()
                .setSubject(email)
                .addClaims(Map.of("uid", userId, "role", role.name(), "typ", userType))
                .setIssuedAt(now)
                .setExpiration(exp)
                .signWith(key, SignatureAlgorithm.HS256)
                .compact();
    }

    public String generateRefreshToken(Long userId, String email) {
        Date now = new Date();
        Date exp = new Date(now.getTime() + refreshValidityMs);
        return Jwts.builder()
                .setSubject(email)
                .addClaims(Map.of("uid", userId))
                .setIssuedAt(now)
                .setExpiration(exp)
                .signWith(key, SignatureAlgorithm.HS256)
                .compact();
    }

    public boolean isValid(String token) {
        try { Jwts.parserBuilder().setSigningKey(key).build().parseClaimsJws(token); return true; }
        catch (JwtException | IllegalArgumentException e) { return false; }
    }

    public String getSubject(String token) {
        return Jwts.parserBuilder().setSigningKey(key).build().parseClaimsJws(token).getBody().getSubject();
    }
}
