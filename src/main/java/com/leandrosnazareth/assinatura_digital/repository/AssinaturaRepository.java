package com.leandrosnazareth.assinatura_digital.repository;

import com.leandrosnazareth.assinatura_digital.model.Assinatura;
import org.springframework.data.jpa.repository.JpaRepository;

public interface AssinaturaRepository extends JpaRepository<Assinatura, Long> {
}
