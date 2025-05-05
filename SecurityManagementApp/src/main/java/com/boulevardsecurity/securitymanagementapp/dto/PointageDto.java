package com.boulevardsecurity.securitymanagementapp.dto;


import com.fasterxml.jackson.annotation.JsonFormat;
import lombok.*;

import java.util.Date;

@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class PointageDto {

    private Long id;

    @JsonFormat(pattern = "yyyy-MM-dd'T'HH:mm:ss")
    private Date datePointage;

    private boolean estPresent;
    private boolean estRetard;

    /* Position GPS (embedded) */
    private double latitude;
    private double longitude;

    /* Mission associée */
    private Long missionId;
}
