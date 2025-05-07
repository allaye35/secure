package com.boulevardsecurity.securitymanagementapp.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class PeriodeFacturationDto {
    
    private Long clientId;
    private LocalDate dateDebut;
    private LocalDate dateFin;
}