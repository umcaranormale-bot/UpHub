package br.com.uphub.backend.service;

import br.com.uphub.backend.candidatura.EtapaDoEnvio;
import br.com.uphub.backend.dto.ExtratoElegibilidadeResponse;
import br.com.uphub.backend.dto.ExtratoRequisitoResponse;
import br.com.uphub.backend.elegibilidade.MotorElegibilidade;
import br.com.uphub.backend.model.Candidatura;
import br.com.uphub.backend.model.RequisitoElegibilidade;
import br.com.uphub.backend.model.ResultadoRequisito;
import br.com.uphub.backend.model.VersaoOportunidade;
import br.com.uphub.backend.repository.RequisitoElegibilidadeRepository;
import br.com.uphub.backend.repository.ResultadoRequisitoRepository;
import org.springframework.core.annotation.Order;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;
import tools.jackson.databind.JsonNode;
import tools.jackson.databind.json.JsonMapper;

import java.time.OffsetDateTime;
import java.util.Comparator;
import java.util.List;
import java.util.Map;
import java.util.function.Function;
import java.util.stream.Collectors;

// Guarda o extrato da elegibilidade no envio, requisito por requisito, para ninguém precisar recalcular depois.
@Service
@Order(100)
public class ResultadoRequisitoService implements EtapaDoEnvio {

    private static final JsonMapper JSON = JsonMapper.builder().build();

    private final ResultadoRequisitoRepository resultadoRepository;
    private final RequisitoElegibilidadeRepository requisitoRepository;
    private final CandidaturaService candidaturaService;

    public ResultadoRequisitoService(ResultadoRequisitoRepository resultadoRepository,
                                     RequisitoElegibilidadeRepository requisitoRepository,
                                     CandidaturaService candidaturaService) {
        this.resultadoRepository = resultadoRepository;
        this.requisitoRepository = requisitoRepository;
        this.candidaturaService = candidaturaService;
    }

    @Override
    public void depoisDoEnvio(Candidatura candidatura, VersaoOportunidade versao, MotorElegibilidade.Resultado resultado) {
        OffsetDateTime agora = OffsetDateTime.now();
        List<ResultadoRequisito> linhas = resultado.requisitos().stream()
                .map(r -> new ResultadoRequisito(candidatura.getId(), r.requisitoId(), r.situacao(),
                        texto(r.valorInformado()), agora))
                .toList();
        resultadoRepository.saveAll(linhas);
    }

    // o extrato guardado no envio: quem vê a candidatura vê o extrato
    @Transactional(readOnly = true)
    public ExtratoElegibilidadeResponse extrato(Long candidaturaId, Long pessoaId) {
        Candidatura candidatura = candidaturaService.paraLeitura(candidaturaId, pessoaId);
        if (candidatura.getEnviadaEm() == null) {
            throw new ResponseStatusException(HttpStatus.CONFLICT,
                    "A elegibilidade fica registrada quando a candidatura é enviada");
        }
        Map<Long, RequisitoElegibilidade> requisitos = requisitoRepository
                .findAllById(resultadoRepository.findById_CandidaturaId(candidaturaId).stream()
                        .map(r -> r.getId().getRequisitoId()).toList())
                .stream().collect(Collectors.toMap(RequisitoElegibilidade::getId, Function.identity()));

        List<ExtratoRequisitoResponse> linhas = resultadoRepository.findById_CandidaturaId(candidaturaId).stream()
                .map(r -> linha(r, requisitos.get(r.getId().getRequisitoId())))
                .sorted(Comparator.comparing(ExtratoRequisitoResponse::ordem, Comparator.nullsLast(Comparator.naturalOrder())))
                .toList();

        boolean naoAtendida = linhas.stream().anyMatch(l -> l.obrigatoria() && MotorElegibilidade.NAO_ATENDIDO.equals(l.situacao()));
        boolean pendente = linhas.stream().anyMatch(l -> l.obrigatoria() && MotorElegibilidade.PENDENTE.equals(l.situacao()));
        String situacao = naoAtendida ? MotorElegibilidade.INELEGIVEL
                : pendente ? MotorElegibilidade.PENDENTE : MotorElegibilidade.ELEGIVEL;
        List<String> faltou = linhas.stream()
                .filter(l -> l.obrigatoria() && !MotorElegibilidade.ATENDIDO.equals(l.situacao()))
                .map(l -> l.campo() + ": " + l.situacao()).toList();

        return new ExtratoElegibilidadeResponse(candidatura.getId(), candidatura.getVersaoId(), candidatura.getEstado(),
                situacao, linhas, faltou);
    }

    private ExtratoRequisitoResponse linha(ResultadoRequisito r, RequisitoElegibilidade req) {
        return new ExtratoRequisitoResponse(r.getId().getRequisitoId(), req.getOrdem(), req.getCampo(), req.getOperador(),
                json(req.getValor()), req.isObrigatoria(), r.getValorInformado(), r.getSituacao(), r.getAvaliadoEm());
    }

    private static String texto(Object valor) {
        if (valor == null) {
            return null;
        }
        return valor instanceof String s ? s : JSON.writeValueAsString(valor);
    }

    private static JsonNode json(String valor) {
        return valor == null ? null : JSON.readTree(valor);
    }
}
