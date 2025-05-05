package com.boulevardsecurity.securitymanagementapp.repository;

import com.boulevardsecurity.securitymanagementapp.model.GeolocalisationGPS;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.Optional;

@Repository
public interface GeolocalisationGPSRepository extends JpaRepository<GeolocalisationGPS, Long> {
}
