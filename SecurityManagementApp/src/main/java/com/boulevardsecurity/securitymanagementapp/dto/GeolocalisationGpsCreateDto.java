package com.boulevardsecurity.securitymanagementapp.dto;



import jakarta.validation.constraints.NotNull;
import lombok.*;

@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class GeolocalisationGpsCreateDto {

    private float gpsPrecision;

    @NotNull
    private Double latitude;

    @NotNull
    private Double longitude;
}