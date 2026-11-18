package br.com.uphub.backend;

import java.time.OffsetDateTime;
import java.util.Map;

import br.com.uphub.backend.seguranca.Publico;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@Publico
@RestController
@RequestMapping("/api")
public class PingController {

    @GetMapping("/ping")
    public Map<String, Object> ping() {
        return Map.of(
                "servico", "uphub-backend",
                "momento", OffsetDateTime.now()
        );
    }
}