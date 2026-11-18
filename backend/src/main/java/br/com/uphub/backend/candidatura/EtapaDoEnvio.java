package br.com.uphub.backend.candidatura;

import br.com.uphub.backend.elegibilidade.MotorElegibilidade;
import br.com.uphub.backend.model.Candidatura;
import br.com.uphub.backend.model.VersaoOportunidade;

// Cada parte da candidatura (participantes, notas, anexos...) pode conferir algo antes do envio
// e registrar algo depois dele, sem mexer no CandidaturaService.
public interface EtapaDoEnvio {

    // lança ResponseStatusException para barrar o envio
    default void conferir(Candidatura candidatura, VersaoOportunidade versao) {
    }

    // roda depois que a candidatura saiu do rascunho, na mesma transação
    default void depoisDoEnvio(Candidatura candidatura, VersaoOportunidade versao, MotorElegibilidade.Resultado resultado) {
    }
}
