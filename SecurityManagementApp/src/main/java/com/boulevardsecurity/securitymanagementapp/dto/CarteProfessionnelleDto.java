package com.boulevardsecurity.securitymanagementapp.dto;
import com.boulevardsecurity.securitymanagementapp.Enums.TypeCarteProfessionnelle;
import lombok.*;

import java.util.Date;

@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class CarteProfessionnelleDto {
    private Long   id;
    private TypeCarteProfessionnelle typeCarte;
    private String numeroCarte;
    private Date   dateDebut;
    private Date   dateFin;
    private Long   agentId;          // ← relation
}
