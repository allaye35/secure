//package com.boulevardsecurity.securitymanagementapp.security;
//
//import com.boulevardsecurity.securitymanagementapp.model.AgentDeSecurite;
//import com.boulevardsecurity.securitymanagementapp.model.Client;
//import com.boulevardsecurity.securitymanagementapp.Enums.Role;
//import lombok.AllArgsConstructor;
//import org.springframework.security.core.GrantedAuthority;
//import org.springframework.security.core.authority.SimpleGrantedAuthority;
//import org.springframework.security.core.userdetails.UserDetails;
//
//import java.util.Collection;
//import java.util.List;
//
///** Adaptateur Spring-Security pour *tous* nos types d’utilisateurs. */
//@AllArgsConstructor
//public class AppUserDetails implements UserDetails {
//
//    private final String username;      // ← l’email
//    private final String password;
//    private final Role   role;
//
//    /* ---------- Factories ---------- */
//    public static AppUserDetails of(Client c)           { return new AppUserDetails(c.getEmail(), c.getPassword(), c.getRole()); }
//    public static AppUserDetails of(AgentDeSecurite a)  { return new AppUserDetails(a.getEmail(), a.getPassword(), a.getRole()); }
//
//    /* ---------- UserDetails ---------- */
//    @Override public Collection<? extends GrantedAuthority> getAuthorities() {
//        return List.of(new SimpleGrantedAuthority("ROLE_" + role.name()));
//    }
//    @Override public String getPassword()             { return password; }
//    @Override public String getUsername()             { return username; }
//    @Override public boolean isAccountNonExpired()    { return true; }
//    @Override public boolean isAccountNonLocked()     { return true; }
//    @Override public boolean isCredentialsNonExpired(){ return true; }
//    @Override public boolean isEnabled()              { return true; }
//}
