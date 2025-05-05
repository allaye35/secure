//package com.boulevardsecurity.securitymanagementapp.service;
//
//import com.boulevardsecurity.securitymanagementapp.model.Administrateur;
//import com.boulevardsecurity.securitymanagementapp.repository.AdministrateurRepository;
//import lombok.RequiredArgsConstructor;
//import org.springframework.stereotype.Service;
//
//import java.util.List;
//import java.util.Optional;
//
//@Service
//@RequiredArgsConstructor
//public class AdministrateurService {
//
//    private final AdministrateurRepository administrateurRepository;
//
//    public Administrateur createAdmin(Administrateur administrateur) {
//        return administrateurRepository.save(administrateur);
//    }
//
//    public List<Administrateur> getAllAdmins() {
//        return administrateurRepository.findAll();
//    }
//
//    public Optional<Administrateur> getAdminById(Long id) {
//        return administrateurRepository.findById(id);
//    }
//
//    public Administrateur updateAdmin(Long id, Administrateur updatedAdmin) {
//        return administrateurRepository.findById(id).map(admin -> {
//            admin.setUsername(updatedAdmin.getUsername());
//            admin.setPassword(updatedAdmin.getPassword());
//            return administrateurRepository.save(admin);
//        }).orElse(null);
//    }
//
//    public void deleteAdmin(Long id) {
//        administrateurRepository.deleteById(id);
//    }
//}
