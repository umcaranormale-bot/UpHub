package br.com.uphub.backend.service;

import java.nio.charset.StandardCharsets;
import java.util.Base64;
import java.util.regex.Matcher;
import java.util.regex.Pattern;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Component;
import org.springframework.util.LinkedMultiValueMap;
import org.springframework.util.MultiValueMap;
import org.springframework.web.client.RestClient;

@Component
public class EnvioEmail {

    private static final Logger log = LoggerFactory.getLogger(EnvioEmail.class);
    private static final Pattern ACCESS_TOKEN = Pattern.compile("\"access_token\"\\s*:\\s*\"([^\"]+)\"");

    private final RestClient http = RestClient.create();
    private final String clientId;
    private final String clientSecret;
    private final String refreshToken;
    private final String remetente;

    public EnvioEmail(@Value("${uphub.gmail.client-id}") String clientId,
                      @Value("${uphub.gmail.client-secret}") String clientSecret,
                      @Value("${uphub.gmail.refresh-token}") String refreshToken,
                      @Value("${uphub.mail.remetente}") String remetente) {
        this.clientId = clientId;
        this.clientSecret = clientSecret;
        this.refreshToken = refreshToken;
        this.remetente = remetente;
    }

    public void enviar(String para, String assunto, String texto) {
        if (para.contains("\r") || para.contains("\n")) {
            throw new IllegalArgumentException("E-mail de destino inválido");
        }
        if (clientId.isBlank() || clientSecret.isBlank() || refreshToken.isBlank()) {
            log.warn("[e-mail não enviado: Gmail não configurado] Para: {} | Assunto: {}\n{}", para, assunto, texto);
            return;
        }
        String raw = Base64.getUrlEncoder().withoutPadding()
                .encodeToString(montarMensagem(para, assunto, texto).getBytes(StandardCharsets.UTF_8));
        http.post()
                .uri("https://gmail.googleapis.com/gmail/v1/users/me/messages/send")
                .header("Authorization", "Bearer " + pedirAccessToken())
                .contentType(MediaType.APPLICATION_JSON)
                .body("{\"raw\":\"" + raw + "\"}")
                .retrieve()
                .toBodilessEntity();
    }

    private String pedirAccessToken() {
        MultiValueMap<String, String> form = new LinkedMultiValueMap<>();
        form.add("client_id", clientId);
        form.add("client_secret", clientSecret);
        form.add("refresh_token", refreshToken);
        form.add("grant_type", "refresh_token");
        String resposta = http.post()
                .uri("https://oauth2.googleapis.com/token")
                .contentType(MediaType.APPLICATION_FORM_URLENCODED)
                .body(form)
                .retrieve()
                .body(String.class);
        Matcher m = ACCESS_TOKEN.matcher(resposta == null ? "" : resposta);
        if (!m.find()) {
            throw new IllegalStateException("O Google não devolveu o access_token");
        }
        return m.group(1);
    }

    private String montarMensagem(String para, String assunto, String texto) {
        String assuntoCodificado = "=?UTF-8?B?" + Base64.getEncoder()
                .encodeToString(assunto.getBytes(StandardCharsets.UTF_8)) + "?=";
        String corpo = Base64.getMimeEncoder()
                .encodeToString(texto.getBytes(StandardCharsets.UTF_8));
        return "From: Up Hub <" + remetente + ">\r\n"
                + "To: " + para + "\r\n"
                + "Subject: " + assuntoCodificado + "\r\n"
                + "MIME-Version: 1.0\r\n"
                + "Content-Type: text/plain; charset=UTF-8\r\n"
                + "Content-Transfer-Encoding: base64\r\n"
                + "\r\n"
                + corpo;
    }
}