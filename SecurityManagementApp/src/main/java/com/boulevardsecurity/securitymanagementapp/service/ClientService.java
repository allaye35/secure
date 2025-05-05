// src/main/java/com/boulevardsecurity/securitymanagementapp/service/ClientService.java
package com.boulevardsecurity.securitymanagementapp.service;

import com.boulevardsecurity.securitymanagementapp.dto.ClientCreateDto;
import com.boulevardsecurity.securitymanagementapp.dto.ClientDto;

import java.util.List;
import java.util.Optional;

public interface ClientService {

    ClientDto createClient(ClientCreateDto dto);

    List<ClientDto> getAllClients();

    Optional<ClientDto> getClientById(Long id);

    Optional<ClientDto> getClientByEmail(String email);

    Optional<ClientDto> getClientByNom(String nom);

    ClientDto updateClient(Long id, ClientDto dto);

    void deleteClient(Long id);

}
