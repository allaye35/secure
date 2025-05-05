package com.boulevardsecurity.securitymanagementapp.dto;



import lombok.*;

import java.util.List;

@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class GeolocalisationGpsDto {
    private Long id;
    private float gpsPrecision;
    private GeoPointDto position;
    private List<MissionDto> missions;
}