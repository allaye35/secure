// src/main/java/com/boulevardsecurity/securitymanagementapp/config/HttpClientConfig.java
package com.boulevardsecurity.securitymanagementapp.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.client.SimpleClientHttpRequestFactory;
import org.springframework.web.client.RestTemplate;

@Configuration
public class HttpClientConfig {

    @Bean
    public RestTemplate restTemplate() {
        SimpleClientHttpRequestFactory factory = new SimpleClientHttpRequestFactory();
        factory.setConnectTimeout(5_000);   // 5 s
        factory.setReadTimeout(5_000);
        return new RestTemplate(factory);
    }
}
