//package com.boulevardsecurity.securitymanagementapp.security;
//
//import io.jsonwebtoken.Claims;
//import io.jsonwebtoken.Jws;
//import io.jsonwebtoken.Jwts;
//import io.jsonwebtoken.SignatureAlgorithm;
//import io.jsonwebtoken.security.Keys;
//import lombok.Getter;
//import lombok.Setter;
//import org.springframework.boot.context.properties.ConfigurationProperties;
//import org.springframework.security.core.userdetails.UserDetails;
//import org.springframework.stereotype.Component;
//
//import java.nio.charset.StandardCharsets;
//import java.util.Date;
//
//@Component
//@ConfigurationProperties(prefix = "jwt")   // -> jwt.secret & jwt.expiration
//@Getter @Setter
//public class JwtUtil {
//
//    private String secret;
//    private long   expiration;          // en millisecondes
//
//    /* ---------- génération ---------- */
//    public String generateToken(UserDetails user) {
//        Date now = new Date();
//        return Jwts.builder()
//                .setSubject(user.getUsername())
//                .claim("role", user.getAuthorities().iterator().next().getAuthority())
//                .setIssuedAt(now)
//                .setExpiration(new Date(now.getTime() + expiration))
//                .signWith(
//                        Keys.hmacShaKeyFor(secret.getBytes(StandardCharsets.UTF_8)),
//                        SignatureAlgorithm.HS512)
//                .compact();
//    }
//
//    /* ---------- lecture / validation ---------- */
//    public String getUsername(String token) {
//        return parse(token).getBody().getSubject();
//    }
//
//    public boolean isValid(String token, UserDetails ud) {
//        return getUsername(token).equals(ud.getUsername()) &&
//                !parse(token).getBody().getExpiration().before(new Date());
//    }
//
//    /* ---------- interne ---------- */
//    private Jws<Claims> parse(String token) {
//        return Jwts.parserBuilder()
//                .setSigningKey(Keys.hmacShaKeyFor(secret.getBytes(StandardCharsets.UTF_8)))
//                .build()
//                .parseClaimsJws(token);
//    }
//}
