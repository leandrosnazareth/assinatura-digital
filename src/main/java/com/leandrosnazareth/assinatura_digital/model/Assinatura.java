package com.leandrosnazareth.assinatura_digital.model;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
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

    public Assinatura() {}

    public Assinatura(String nome, String email, LocalDateTime dataHora, String imagemBase64) {
        this.nome = nome;
        this.email = email;
        this.dataHora = dataHora;
        this.imagemBase64 = imagemBase64;
    }

    // Getters e setters
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public String getNome() { return nome; }
    public void setNome(String nome) { this.nome = nome; }
    public String getEmail() { return email; }
    public void setEmail(String email) { this.email = email; }
    public LocalDateTime getDataHora() { return dataHora; }
    public void setDataHora(LocalDateTime dataHora) { this.dataHora = dataHora; }
    public String getImagemBase64() { return imagemBase64; }
    public void setImagemBase64(String imagemBase64) { this.imagemBase64 = imagemBase64; }
}
