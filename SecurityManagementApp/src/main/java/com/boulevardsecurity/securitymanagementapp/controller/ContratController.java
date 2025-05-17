package com.boulevardsecurity.securitymanagementapp.controller;

import com.boulevardsecurity.securitymanagementapp.dto.*;
import com.boulevardsecurity.securitymanagementapp.service.ContratService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.*;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;

@RestController @RequestMapping("/api/contrats")
 @CrossOrigin(origins = "http://localhost:3000")
@RequiredArgsConstructor 
@Slf4j
public class ContratController {

    private final ContratService service;    /* ---------- CREATE ---------- */
    @PostMapping(consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<ContratDto> create(
            @RequestPart("dto") @jakarta.validation.Valid ContratCreateDto dto,
            @RequestPart(value = "file", required = false) MultipartFile file) {

        return ResponseEntity.status(HttpStatus.CREATED)
                .body(service.createContrat(dto, file));
    }

    /* ---------- UPDATE ---------- */
    @PutMapping(value = "/{id}", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<ContratDto> update(
            @PathVariable Long id,
            @RequestPart("dto")  ContratCreateDto dto,
            @RequestPart(value = "file", required = false) MultipartFile file) {

        return ResponseEntity.ok(service.updateContrat(id, dto, file));
    }

    /* ---------- READ ---------- */
    @GetMapping
    public List<ContratDto> getAll()               { return service.getAllContrats(); }
    @GetMapping("/{id}")
    public ResponseEntity<ContratDto> getById(@PathVariable Long id) {
        return service.getContratById(id).map(ResponseEntity::ok).orElse(ResponseEntity.notFound().build());
    }
    @GetMapping("/ref/{ref}")
    public ResponseEntity<ContratDto> getByRef(@PathVariable String ref) {
        return service.getContratByReference(ref).map(ResponseEntity::ok).orElse(ResponseEntity.notFound().build());
    }

    /* ---------- DELETE ---------- */
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        service.deleteContrat(id); return ResponseEntity.noContent().build();
    }
}
