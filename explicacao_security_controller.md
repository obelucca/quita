# Explicação: SecurityConfig & DocumentController

Este documento apresenta uma explicação detalhada das duas classes do projeto **Quita**: `SecurityConfig` e `DocumentController`. Ambos os componentes trabalham em conjunto para garantir que o envio, a listagem e a limpeza de documentos sejam feitos de forma segura e restrita aos usuários autenticados via JWT.

---

## 1. SecurityConfig
A classe `SecurityConfig` está localizada em `quita-api/src/main/java/com/quita/api/auth/security/SecurityConfig.java`. Ela é a espinha dorsal da segurança da API Spring Boot.

### Configurações Principais:
* **Habilitação de Segurança (`@EnableWebSecurity`):** Ativa a integração do Spring Security na aplicação.
* **Sessão Stateless (`STATELESS`):** Como a aplicação utiliza autenticação baseada em tokens JWT, nenhuma sessão é mantida no servidor.
* **CORS (Cross-Origin Resource Sharing):**
  * Permite requisições originadas de `http://localhost:3000` (frontend local).
  * Métodos permitidos: `GET`, `POST`, `PUT`, `DELETE`, `OPTIONS`.
  * Cabeçalhos permitidos: `Authorization`, `Content-Type`.
  * Expõe o cabeçalho `Authorization` nas respostas para que o cliente possa capturar o token.
* **Desabilitação do CSRF:** Desabilitado por ser uma API Stateless que não utiliza cookies para autenticação.
* **Regras de Autorização de Rotas (`authorizeHttpRequests`):**
  * **Rotas Públicas (Permitidas sem autenticação):**
    * `/health` (Endpoint de verificação de integridade).
    * `/actuator/**` (Métricas e saúde do Spring Boot).
    * `POST /auth/register` (Criação de novos usuários).
    * `POST /auth/login` (Autenticação do usuário).
  * **Rotas Privadas:**
    * Qualquer outra rota (`anyRequest().authenticated()`), incluindo `/documents/**`, exige autenticação.
* **Filtro JWT (`jwtAuthenticationFilter`):** Inserido antes do filtro padrão `UsernamePasswordAuthenticationFilter`. Ele intercepta as requisições para verificar se um token JWT válido está presente no cabeçalho `Authorization`.
* **Tratamento de Exceções de Autenticação:**
  * Se uma requisição não autenticada tentar acessar `/debts` ou `/complaints`, retorna `401 Unauthorized`.
  * Para outras rotas não autenticadas, retorna `403 Forbidden`.

---

## 2. DocumentController
A classe `DocumentController` está localizada em `quita-api/src/main/java/com/quita/api/document/controller/DocumentController.java`. Ela expõe os endpoints REST para o gerenciamento de documentos enviados pelos usuários.

### Detalhes do Controller:
* **Mapeamento Base:** `@RequestMapping("/documents")` — Todas as rotas deste controller começam com `/documents`.
* **Autenticação:** Como não está explicitamente configurada como pública no `SecurityConfig`, toda e qualquer requisição enviada a este controller exige um cabeçalho `Authorization` válido contendo o JWT do usuário logado.

### Endpoints Disponibilizados:

#### A. Upload de Documento (`POST /documents/upload`)
* **Consome:** `multipart/form-data` (recebe um arquivo binário através do parâmetro `file`).
* **Funcionamento:**
  1. Recebe o arquivo e o objeto `Principal` (injetado automaticamente pelo Spring Security, representando o usuário autenticado atual).
  2. Recupera o e-mail do usuário logado a partir de `principal.getName()`.
  3. Busca a entidade `User` correspondente no banco de dados.
  4. Chama o serviço `documentService.uploadDocument(file, user.getId())` para processar e armazenar o arquivo.
  5. Retorna o status HTTP **201 Created** com o objeto `DocumentResponse` (contendo os metadados do documento gerado).

#### B. Listagem de Documentos (`GET /documents`)
* **Funcionamento:**
  1. Identifica o usuário logado a partir do `Principal`.
  2. Busca seus documentos chamando `documentService.listDocuments(user.getId())`.
  3. Retorna o status HTTP **200 OK** contendo a lista dos documentos vinculados exclusivamente a esse usuário (isolamento multi-tenant).

#### C. Limpeza de Documentos (`DELETE /documents/clear`)
* **Funcionamento:**
  1. Identifica o usuário logado a partir do `Principal`.
  2. Remove logicamente ou fisicamente todos os documentos associados a esse usuário chamando `documentService.clearUserDocuments(user.getId())`.
  3. Retorna o status HTTP **204 No Content** para sinalizar que a operação foi bem-sucedida e não possui corpo de resposta.

---

## Como eles interagem na prática?

1. **Requisição Enviada:** O frontend envia, por exemplo, um arquivo PDF para `POST /documents/upload` incluindo o cabeçalho `Authorization: Bearer <token_jwt>`.
2. **Interceptação pelo Filtro:** O `SecurityConfig` intercepta a chamada através do `jwtAuthenticationFilter`.
3. **Validação do Token:** O filtro valida a assinatura, expiração e extrai o e-mail do usuário contido no token JWT, injetando os detalhes na sessão de segurança do Spring.
4. **Roteamento:** A requisição é encaminhada para o `DocumentController` porque está autenticada.
5. **Resolução de Usuário:** O controller obtém o e-mail validado através do objeto `Principal` e executa a lógica de upload para o ID de usuário específico, garantindo que um usuário nunca acesse ou altere documentos pertencentes a outro.
