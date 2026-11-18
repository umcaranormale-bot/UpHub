package br.com.uphub.backend.service;

import br.com.uphub.backend.dto.ResultadoProvaRequest;
import br.com.uphub.backend.dto.ResultadoProvaResponse;
import br.com.uphub.backend.model.ResultadoProva;
import br.com.uphub.backend.repository.ResultadoProvaRepository;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDate;
import java.time.format.DateTimeFormatter;
import java.util.List;

@Service
public class ResultadoProvaService {

    private static final BigDecimal CEM = new BigDecimal("100");
    private static final int DIAS_PARA_RETESTE = 30;

    private final ResultadoProvaRepository provaRepository;

    public ResultadoProvaService(ResultadoProvaRepository provaRepository) {
        this.provaRepository = provaRepository;
    }

    // a pessoa registra a própria nota; a nota é dela, nunca da organização
    @Transactional
    public ResultadoProvaResponse registrar(ResultadoProvaRequest dados, Long pessoaId) {
        if (dados.nota() == null) {
            throw erro(HttpStatus.BAD_REQUEST, "O campo nota é obrigatório");
        }
        if (dados.nota().signum() < 0 || dados.nota().compareTo(CEM) > 0) {
            throw erro(HttpStatus.BAD_REQUEST, "A nota vai de 0 a 100");
        }
        if (dados.dataProva() == null) {
            throw erro(HttpStatus.BAD_REQUEST, "O campo dataProva é obrigatório");
        }
        if (dados.dataProva().isAfter(LocalDate.now())) {
            throw erro(HttpStatus.BAD_REQUEST, "A data da prova não pode ser no futuro");
        }
        String area = null;
        if (dados.area() != null && !dados.area().isBlank()) {
            area = dados.area().trim();
            if (area.length() > 80) {
                throw erro(HttpStatus.BAD_REQUEST, "O campo area aceita no máximo 80 caracteres");
            }
        }

        // reteste: só 30 dias depois da última prova na mesma área
        String areaFinal = area;
        provaRepository.ultimaNaArea(pessoaId, area).ifPresent(ultima -> {
            LocalDate liberado = ultima.getDataProva().plusDays(DIAS_PARA_RETESTE);
            if (dados.dataProva().isBefore(liberado)) {
                throw erro(HttpStatus.CONFLICT, "A prova " + (areaFinal == null ? "" : "de " + areaFinal + " ")
                        + "só pode ser refeita 30 dias depois da última. Liberado a partir de "
                        + liberado.format(DateTimeFormatter.ofPattern("dd/MM/yyyy")));
            }
        });

        ResultadoProva prova = new ResultadoProva(pessoaId, area, dados.nota().setScale(2, RoundingMode.HALF_UP),
                dados.dataProva());
        return ResultadoProvaResponse.de(provaRepository.saveAndFlush(prova));
    }

    @Transactional(readOnly = true)
    public List<ResultadoProvaResponse> listarMinhas(Long pessoaId) {
        return provaRepository.findByPessoaIdOrderByDataProvaDesc(pessoaId).stream()
                .map(ResultadoProvaResponse::de)
                .toList();
    }

    private ResponseStatusException erro(HttpStatus status, String mensagem) {
        return new ResponseStatusException(status, mensagem);
    }
}
