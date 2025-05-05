package com.boulevardsecurity.securitymanagementapp.dto;


import com.boulevardsecurity.securitymanagementapp.Enums.NiveauSSIAP;
import jakarta.validation.constraints.NotNull;
import lombok.*;

import java.util.Date;

@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class DiplomeSsiapCreationDto {
    @NotNull
    private NiveauSSIAP niveau;
    private Date        dateObtention;
    private Date        dateExpiration;
    @NotNull
    private Long        agentId;
}
