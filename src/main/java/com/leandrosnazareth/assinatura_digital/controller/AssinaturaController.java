package com.leandrosnazareth.assinatura_digital.controller;

import com.leandrosnazareth.assinatura_digital.model.Assinatura;
import com.leandrosnazareth.assinatura_digital.repository.AssinaturaRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestParam;

import java.time.LocalDateTime;

@Controller
public class AssinaturaController {
    @Autowired
    private AssinaturaRepository assinaturaRepository;


    @GetMapping("/")
    public String formAssinatura() {
        return "form-assinatura";
    }

    @GetMapping("/assinaturas")
    public String listarAssinaturas(Model model) {
        model.addAttribute("assinaturas", assinaturaRepository.findAll());
        return "lista-assinaturas";
    }

    @PostMapping("/salvar")
    public String salvarAssinatura(@RequestParam String nome,
                                   @RequestParam String email,
                                   @RequestParam("imagemBase64") String imagemBase64,
                                   Model model) {
        Assinatura assinatura = new Assinatura(nome, email, LocalDateTime.now(), imagemBase64);
        assinaturaRepository.save(assinatura);
        model.addAttribute("mensagem", "Assinatura salva com sucesso!");
        return "form-assinatura";
    }
}
