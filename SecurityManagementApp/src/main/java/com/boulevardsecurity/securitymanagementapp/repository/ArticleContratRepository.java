package com.boulevardsecurity.securitymanagementapp.repository;

import com.boulevardsecurity.securitymanagementapp.model.ArticleContrat;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface ArticleContratRepository extends JpaRepository<ArticleContrat, Long> {
    List<ArticleContrat> findByContrat_IdOrderByNumero(Long contratId);

}
