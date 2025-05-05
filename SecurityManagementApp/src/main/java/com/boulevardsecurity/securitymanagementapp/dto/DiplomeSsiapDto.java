package com.boulevardsecurity.securitymanagementapp.dto;


import com.boulevardsecurity.securitymanagementapp.Enums.NiveauSSIAP;
import lombok.*;

import java.util.Date;

@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class DiplomeSsiapDto {
    private Long        id;
    private NiveauSSIAP niveau;
    private Date        dateObtention;
    private Date        dateExpiration;
    private Long        agentId;     // ← relation
}

