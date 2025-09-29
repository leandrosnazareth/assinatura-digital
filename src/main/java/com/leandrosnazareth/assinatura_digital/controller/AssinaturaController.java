// ...existing code...

package com.leandrosnazareth.assinatura_digital.controller;

import com.leandrosnazareth.assinatura_digital.model.Assinatura;
import com.leandrosnazareth.assinatura_digital.repository.AssinaturaRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.ResponseBody;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.http.ResponseEntity;
import org.springframework.http.MediaType;
import java.util.Base64;
import javax.imageio.ImageIO;
import java.awt.image.BufferedImage;
import java.io.*;
import org.apache.pdfbox.pdmodel.PDDocument;
import org.apache.pdfbox.pdmodel.PDPage;
import org.apache.pdfbox.pdmodel.PDPageContentStream;
import org.apache.pdfbox.pdmodel.graphics.image.PDImageXObject;

import java.time.LocalDateTime;

@Controller
public class AssinaturaController {
    @Autowired
    private AssinaturaRepository assinaturaRepository;

    @GetMapping("/")
    public String index() {
        return "index";
    }
    @GetMapping("/upload-assinatura")
    public String uploadAssinatura() {
        return "upload-assinatura";
    }
    // Recebe upload do PDF e retorna o PDF para visualização
    @PostMapping("/upload-pdf")
    @ResponseBody
    public ResponseEntity<Void> uploadPdf(@RequestParam("file") MultipartFile file) throws IOException {
        // Salva o PDF temporariamente para uso posterior
        File tempDir = new File("uploads/pdf");
        if (!tempDir.exists()) tempDir.mkdirs();
        File tempFile = new File(tempDir, "temp.pdf");
        try (FileOutputStream fos = new FileOutputStream(tempFile)) {
            fos.write(file.getBytes());
        }
        return ResponseEntity.ok().build();
    }


    // Recebe assinatura, posição e aplica no PDF (exemplo simplificado: PDF de 1 página, posição absoluta)
    @PostMapping(value = "/apply-signature", produces = MediaType.APPLICATION_PDF_VALUE)
    @ResponseBody
    public ResponseEntity<byte[]> applySignature(@RequestBody SignatureRequest req) throws IOException {
        // Para simplificação, espera-se que o PDF original esteja em disco ou em memória (ajuste conforme sua lógica)
        File pdfFile = new File("uploads/pdf/temp.pdf"); // Exemplo: PDF temporário
        if (!pdfFile.exists()) {
            return ResponseEntity.badRequest().body(null);
        }

        PDDocument document = PDDocument.load(pdfFile);
        PDPage page = document.getPage(0);

        // Decodifica imagem da assinatura
        String base64Image = req.getSignature().replaceFirst("^data:image/[^;]+;base64,", "");
        byte[] imageBytes = Base64.getDecoder().decode(base64Image);
        BufferedImage signatureImage = ImageIO.read(new ByteArrayInputStream(imageBytes));
        PDImageXObject pdImage = PDImageXObject.createFromByteArray(document, imageBytes, "signature");

        // Ajuste de escala: pega o tamanho do PDF real e do canvas exibido (frontend usa scale 1.5)
        float pdfWidth = page.getMediaBox().getWidth();
        float pdfHeight = page.getMediaBox().getHeight();
        float canvasScale = 1.5f;

        // Calcula posição e tamanho reais
        float assinaturaX = req.getX() / canvasScale;
        float assinaturaY = req.getY() / canvasScale;
        float assinaturaW = signatureImage.getWidth() / canvasScale;
        float assinaturaH = signatureImage.getHeight() / canvasScale;

        // No PDF, o (0,0) é canto inferior esquerdo, então precisa inverter o Y
        float yPdf = pdfHeight - assinaturaY - assinaturaH;

    // Gera token e data/hora
    String token = java.util.UUID.randomUUID().toString();
    String dataHora = java.time.format.DateTimeFormatter.ofPattern("dd/MM/yyyy HH:mm:ss").format(java.time.LocalDateTime.now());
    String nome = req.getNome() != null ? req.getNome() : "";

    PDPageContentStream contentStream = new PDPageContentStream(document, page, PDPageContentStream.AppendMode.APPEND, true);
    contentStream.drawImage(pdImage, assinaturaX, yPdf, assinaturaW, assinaturaH);

    // Escreve 'Assinado por', token e data/hora
    float fontSize = 10f;

    float textX = assinaturaX;
    float yAssinadoPor = yPdf - fontSize - 2; // 2px abaixo da assinatura
    float yToken = yAssinadoPor - fontSize - 2;
    float yDataHora = yToken - fontSize - 2;

    // Assinado digitalmente por: <nome>
    contentStream.beginText();
    contentStream.setFont(org.apache.pdfbox.pdmodel.font.PDType1Font.HELVETICA, fontSize);
    contentStream.newLineAtOffset(textX, yAssinadoPor);
    contentStream.showText("Assinado digitalmente por: " + nome);
    contentStream.endText();

    // Token
    contentStream.beginText();
    contentStream.setFont(org.apache.pdfbox.pdmodel.font.PDType1Font.HELVETICA, fontSize);
    contentStream.newLineAtOffset(textX, yToken);
    contentStream.showText("Token: " + token);
    contentStream.endText();

    // Data/Hora
    contentStream.beginText();
    contentStream.setFont(org.apache.pdfbox.pdmodel.font.PDType1Font.HELVETICA, fontSize);
    contentStream.newLineAtOffset(textX, yDataHora);
    contentStream.showText("Data/Hora: " + dataHora);
    contentStream.endText();

    contentStream.close();

        ByteArrayOutputStream baos = new ByteArrayOutputStream();
        document.save(baos);
        document.close();
        return ResponseEntity.ok()
                .contentType(MediaType.APPLICATION_PDF)
                .body(baos.toByteArray());
    }

    // Classe auxiliar para receber JSON da assinatura
    public static class SignatureRequest {
        private String signature;
        private int x;
        private int y;
        private String nome;
        private String email;
        public String getSignature() { return signature; }
        public void setSignature(String signature) { this.signature = signature; }
        public int getX() { return x; }
        public void setX(int x) { this.x = x; }
        public int getY() { return y; }
        public void setY(int y) { this.y = y; }
        public String getNome() { return nome; }
        public void setNome(String nome) { this.nome = nome; }
        public String getEmail() { return email; }
        public void setEmail(String email) { this.email = email; }
    }
    @GetMapping("/nova-assinatura")
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
        model.addAttribute("tokenAssinatura", assinatura.getToken());
        return "form-assinatura";
    }

    @GetMapping("/validar")
    public String formValidar() {
        return "validar-assinatura";
    }

    @PostMapping("/validar")
    public String validarAssinatura(@RequestParam String token, Model model) {
        var assinaturaOpt = assinaturaRepository.findAll().stream()
                .filter(a -> a.getToken().equals(token))
                .findFirst();
        if (assinaturaOpt.isPresent()) {
            model.addAttribute("assinatura", assinaturaOpt.get());
        } else {
            model.addAttribute("erro", "Assinatura não encontrada para o token informado.");
        }
        return "validar-assinatura";
    }
}
