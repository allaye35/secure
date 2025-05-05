package com.boulevardsecurity.securitymanagementapp.controller;

import com.boulevardsecurity.securitymanagementapp.model.GeoPoint;
import com.boulevardsecurity.securitymanagementapp.service.GeocodingService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/geocode")
public class GeocodingController {


    private GeocodingService geocodingService;

    @Autowired
    public GeocodingController( GeocodingService geocodingService) {
        this.geocodingService = geocodingService;

    }

    @GetMapping("/coordinates")
    public ResponseEntity<GeoPoint> getCoordinates(@RequestParam String address) {
        try {
            GeoPoint geoPoint = geocodingService.getCoordinatesFromAddress(address);
            return ResponseEntity.ok(geoPoint);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(null);
        }
    }
}
