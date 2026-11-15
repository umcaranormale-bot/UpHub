package br.com.uphub.backend.controller;

import br.com.uphub.backend.dto.LoginRequest;
import br.com.uphub.backend.dto.LoginResponse;
import br.com.uphub.backend.dto.SessaoResponse;
import br.com.uphub.backend.service.LoginService;
import org.springframework.http.HttpHeaders;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

    private final LoginService loginService;

    public AuthController(LoginService loginService) {
        this.loginService = loginService;
    }

    @PostMapping("/login")
    public ResponseEntity<LoginResponse> entrar(@RequestBody LoginRequest dados) {
        return ResponseEntity.ok(loginService.entrar(dados));
    }

    @GetMapping("/eu")
    public ResponseEntity<SessaoResponse> eu(
            @RequestHeader(value = HttpHeaders.AUTHORIZATION, required = false) String authorization) {
        return ResponseEntity.ok(loginService.sessao(authorization));
    }
}