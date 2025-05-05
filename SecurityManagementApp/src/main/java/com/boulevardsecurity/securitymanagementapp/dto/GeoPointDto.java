package com.boulevardsecurity.securitymanagementapp.dto;



import lombok.*;

@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class GeoPointDto {
    private double latitude;
    private double longitude;
}