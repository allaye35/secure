package com.boulevardsecurity.securitymanagementapp.dto;


import com.fasterxml.jackson.annotation.JsonFormat;
import lombok.*;

import java.util.Date;

/** DTO pour une création / mise-à-jour partielle */
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class PointageCreateDto {

    @JsonFormat(pattern = "yyyy-MM-dd'T'HH:mm:ss")
    private Date datePointage;

    private boolean estPresent;
    private boolean estRetard;

    private double latitude;
    private double longitude;

    private Long missionId;
    private Long agentId;
}
