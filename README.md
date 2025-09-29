# Assinatura Digital

Aplicação web em Spring Boot com Thymeleaf para coleta, armazenamento e validação de assinaturas digitais manuscritas.

## Funcionalidades
- Assinatura digital manuscrita via HTML5 Canvas (PC, tablet ou celular)
- Assinatura digital diretamente em arquivos PDF (upload, visualização, assinatura e download do PDF assinado)
- Geração de token único para cada assinatura
- Armazenamento das assinaturas e dados no banco H2
- Listagem de todas as assinaturas
- Validação de assinatura por token
- Interface responsiva e moderna (Bootstrap)

## Rotas principais
- `/` — Menu principal
- `/nova-assinatura` — Nova assinatura digital
- `/assinaturas` — Listar assinaturas
- `/validar` — Validação de assinatura por token
- `/upload-assinatura` — Assinar um arquivo PDF

## Como usar

### 1. Requisitos
- Java 17+
- Maven

### 2. Executando o projeto

```bash
./mvnw spring-boot:run
```

Acesse [http://localhost:8080](http://localhost:8080) no navegador.


### 3. Fluxo de uso
1. No menu principal, clique em "Nova Assinatura" para assinar manualmente.
2. Preencha nome, email e assine no campo interativo. Você pode ampliar o campo de assinatura.
3. Após salvar, o token da assinatura será exibido. Guarde esse token!
4. Consulte todas as assinaturas em "Listar Assinaturas".
5. Valide uma assinatura informando o token em "Validar Assinatura".

#### Assinando um PDF
1. Acesse a rota `/upload-assinatura`.
2. Preencha nome, email e selecione o arquivo PDF desejado.
3. Clique em "Carregar PDF" para visualizar o documento.
4. Assine no campo de assinatura (pode ampliar se desejar) e posicione a assinatura no local desejado do PDF.
5. Clique em "Aplicar Assinatura no PDF" para baixar o arquivo PDF assinado digitalmente, contendo também o nome, token e data/hora abaixo da assinatura.

## Banco de dados
- Utiliza H2 em memória (console disponível em `/h2-console`)
- As entidades são criadas automaticamente

## Estrutura do projeto
```
src/
  main/
    java/com/leandrosnazareth/assinatura_digital/
      controller/AssinaturaController.java
      model/Assinatura.java
      repository/AssinaturaRepository.java
    resources/
      templates/
        index.html
        form-assinatura.html
        lista-assinaturas.html
        validar-assinatura.html
      application.properties
```

## Tecnologias
- Java 17
- Spring Boot 3
- Spring Data JPA
- Thymeleaf
- H2 Database
- Bootstrap 5

## Observações
- O token é obrigatório para validação e consulta segura da assinatura.
- O campo de assinatura é responsivo e pode ser ampliado para melhor experiência.
- O PDF assinado contém a imagem da assinatura, nome, token e data/hora, garantindo rastreabilidade.
- O projeto é apenas para fins didáticos e não substitui soluções de assinatura digital com validade jurídica.

---

Desenvolvido por [leandrosnazareth]
(https://github.com/leandrosnazareth)
