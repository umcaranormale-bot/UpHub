package br.com.uphub.backend.service;

import com.nimbusds.jose.JOSEException;
import com.nimbusds.jose.JWSAlgorithm;
import com.nimbusds.jose.JWSHeader;
import com.nimbusds.jose.crypto.MACSigner;
import com.nimbusds.jose.crypto.MACVerifier;
import com.nimbusds.jwt.JWTClaimsSet;
import com.nimbusds.jwt.SignedJWT;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Component;
import org.springframework.web.server.ResponseStatusException;

import java.security.SecureRandom;
import java.text.ParseException;
import java.time.Duration;
import java.time.Instant;
import java.time.OffsetDateTime;
import java.time.ZoneOffset;
import java.util.Base64;
import java.util.Date;

@Component
public class TokenAcesso {

    public static final Duration VALIDADE = Duration.ofHours(8);

    private static final Logger log = LoggerFactory.getLogger(TokenAcesso.class);

    private final byte[] chave;

    public TokenAcesso(@Value("${uphub.jwt.segredo}") String segredo) {
        if (segredo == null || segredo.isBlank()) {
            this.chave = new byte[32];
            new SecureRandom().nextBytes(this.chave);
            log.warn("JWT_SECRET não configurado: usando chave temporária. Os logins caem quando o back-end reinicia.");
            return;
        }
        try {
            this.chave = Base64.getDecoder().decode(segredo.trim());
        } catch (IllegalArgumentException e) {
            throw new IllegalStateException("JWT_SECRET não é um texto Base64 válido");
        }
        if (this.chave.length < 32) {
            throw new IllegalStateException("JWT_SECRET precisa ter pelo menos 32 bytes (44 caracteres em Base64)");
        }
    }

    public TokenGerado gerar(Long pessoaId) {
        Instant agora = Instant.now();
        Instant expira = agora.plus(VALIDADE);

        JWTClaimsSet dados = new JWTClaimsSet.Builder()
                .subject(String.valueOf(pessoaId))
                .issueTime(Date.from(agora))
                .expirationTime(Date.from(expira))
                .build();

        SignedJWT jwt = new SignedJWT(new JWSHeader(JWSAlgorithm.HS256), dados);
        try {
            jwt.sign(new MACSigner(chave));
        } catch (JOSEException e) {
            throw new IllegalStateException("Não foi possível assinar o token", e);
        }
        return new TokenGerado(jwt.serialize(), OffsetDateTime.ofInstant(expira, ZoneOffset.UTC));
    }

    public Long pessoaIdDoToken(String token) {
        if (token == null || token.isBlank()) {
            throw invalido();
        }
        try {
            SignedJWT jwt = SignedJWT.parse(token.trim());
            if (!JWSAlgorithm.HS256.equals(jwt.getHeader().getAlgorithm())
                    || !jwt.verify(new MACVerifier(chave))) {
                throw invalido();
            }
            Date expira = jwt.getJWTClaimsSet().getExpirationTime();
            if (expira == null || expira.toInstant().isBefore(Instant.now())) {
                throw invalido();
            }
            return Long.valueOf(jwt.getJWTClaimsSet().getSubject());
        } catch (ParseException | JOSEException | NumberFormatException e) {
            throw invalido();
        }
    }

    private ResponseStatusException invalido() {
        return new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Sessão inválida ou expirada. Entre de novo");
    }

    public record TokenGerado(String token, OffsetDateTime expiraEm) {
    }
}