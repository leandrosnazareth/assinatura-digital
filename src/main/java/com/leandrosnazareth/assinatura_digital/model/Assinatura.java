package com.leandrosnazareth.assinatura_digital.model;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Entity
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Assinatura {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String nome;
    private String email;
    private LocalDateTime dataHora;

    @Lob
    @Column(columnDefinition = "CLOB")
    private String imagemBase64;

    @Column(unique = true, nullable = false, updatable = false)
    private String token;

    public Assinatura(String nome, String email, LocalDateTime dataHora, String imagemBase64) {
        this.nome = nome;
        this.email = email;
        this.dataHora = dataHora;
        this.imagemBase64 = imagemBase64;
        this.token = java.util.UUID.randomUUID().toString();
    }
}
