package br.com.uphub.backend.seguranca;

import br.com.uphub.backend.repository.PessoaRepository;
import br.com.uphub.backend.service.TokenAcesso;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Component;
import org.springframework.web.cors.CorsUtils;
import org.springframework.web.method.HandlerMethod;
import org.springframework.web.server.ResponseStatusException;
import org.springframework.web.servlet.HandlerInterceptor;

@Component
public class FiltroDeToken implements HandlerInterceptor {

    public static final String ATRIBUTO_PESSOA = "uphub.pessoaId";

    private final TokenAcesso tokenAcesso;
    private final PessoaRepository pessoaRepository;

    public FiltroDeToken(TokenAcesso tokenAcesso, PessoaRepository pessoaRepository) {
        this.tokenAcesso = tokenAcesso;
        this.pessoaRepository = pessoaRepository;
    }

    @Override
    public boolean preHandle(HttpServletRequest request, HttpServletResponse response, Object handler) {
        if (CorsUtils.isPreFlightRequest(request)) {
            return true;
        }
        if (!(handler instanceof HandlerMethod metodo)) {
            return true;
        }
        if (metodo.hasMethodAnnotation(Publico.class) || metodo.getBeanType().isAnnotationPresent(Publico.class)) {
            return true;
        }

        String cabecalho = request.getHeader(HttpHeaders.AUTHORIZATION);
        if (cabecalho == null || !cabecalho.startsWith("Bearer ")) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Entre na sua conta para continuar");
        }
        Long pessoaId = tokenAcesso.pessoaIdDoToken(cabecalho.substring("Bearer ".length()));

        if (!pessoaRepository.existsByIdAndExcluidaEmIsNull(pessoaId)) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Sessão inválida ou expirada. Entre de novo");
        }

        request.setAttribute(ATRIBUTO_PESSOA, pessoaId);
        return true;
    }
}
