package com.boulevardsecurity.securitymanagementapp.api;

import java.time.Instant;

/** Format homogène pour toutes les réponses d’erreur REST. */
public record ApiErreur(
        Instant timestamp,
        int     status,
        String  erreur,
        String  message,
        String  path) {}

