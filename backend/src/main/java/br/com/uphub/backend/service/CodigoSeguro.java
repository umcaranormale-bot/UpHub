package br.com.uphub.backend.service;

import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.security.NoSuchAlgorithmException;
import java.security.SecureRandom;
import java.util.Base64;
import java.util.HexFormat;
import org.springframework.stereotype.Component;

@Component
public class CodigoSeguro {

    private final SecureRandom aleatorio = new SecureRandom();

    /** Código de 6 dígitos para confirmar o e-mail, de 000000 a 999999. */
    public String codigoDeSeisDigitos() {
        return String.format("%06d", aleatorio.nextInt(1_000_000));
    }

    /** Token longo para o link de redefinir senha: 32 bytes sorteados, em texto seguro para URL. */
    public String tokenDeLink() {
        byte[] bytes = new byte[32];
        aleatorio.nextBytes(bytes);
        return Base64.getUrlEncoder().withoutPadding().encodeToString(bytes);
    }

    /** SHA-256 em 64 caracteres hexadecimais, o tamanho da coluna token_hash. */
    public String hash(String codigo) {
        try {
            byte[] bytes = MessageDigest.getInstance("SHA-256")
                    .digest(codigo.getBytes(StandardCharsets.UTF_8));
            return HexFormat.of().formatHex(bytes);
        } catch (NoSuchAlgorithmException e) {
            throw new IllegalStateException("SHA-256 indisponível", e);
        }
    }
}