//package com.boulevardsecurity.securitymanagementapp.controller;
//
//import com.boulevardsecurity.securitymanagementapp.model.Administrateur;
//import com.boulevardsecurity.securitymanagementapp.service.AdministrateurService;
//import lombok.RequiredArgsConstructor;
//import org.springframework.http.ResponseEntity;
//import org.springframework.web.bind.annotation.*;
//
//import java.util.List;
//import java.util.Optional;
//
//@RestController
//@RequestMapping("/api/administrateurs")
//@RequiredArgsConstructor
//public class AdministrateurController {
//
//    private final AdministrateurService administrateurService;
//
//    @PostMapping("/ajouter")
//    public ResponseEntity<Administrateur> createAdmin(@RequestBody Administrateur administrateur) {
//        return ResponseEntity.ok(administrateurService.createAdmin(administrateur));
//    }
//
//    @GetMapping
//    public ResponseEntity<List<Administrateur>> getAllAdmins() {
//        return ResponseEntity.ok(administrateurService.getAllAdmins());
//    }
//
//    @GetMapping("/{id}")
//    public ResponseEntity<Administrateur> getAdminById(@PathVariable Long id) {
//        Optional<Administrateur> admin = administrateurService.getAdminById(id);
//        return admin.map(ResponseEntity::ok).orElseGet(() -> ResponseEntity.notFound().build());
//    }
//
//    @PutMapping("/modifier/{id}")
//    public ResponseEntity<Administrateur> updateAdmin(@PathVariable Long id, @RequestBody Administrateur administrateur) {
//        Administrateur updated = administrateurService.updateAdmin(id, administrateur);
//        return updated != null ? ResponseEntity.ok(updated) : ResponseEntity.notFound().build();
//    }
//
//    @DeleteMapping("/supprimer/{id}")
//    public ResponseEntity<Void> deleteAdmin(@PathVariable Long id) {
//        administrateurService.deleteAdmin(id);
//        return ResponseEntity.noContent().build();
//    }
//}
