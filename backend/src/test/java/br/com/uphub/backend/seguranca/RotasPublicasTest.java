package br.com.uphub.backend.seguranca;

import org.junit.jupiter.api.Test;
import org.springframework.context.annotation.ClassPathScanningCandidateComponentProvider;
import org.springframework.core.annotation.AnnotatedElementUtils;
import org.springframework.core.type.filter.AnnotationTypeFilter;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.lang.reflect.Method;
import java.util.Set;
import java.util.TreeSet;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertTrue;

// RBAC: tudo exige o token, menos os endereços marcados com @Publico.
// Se alguém deixar um endereço novo público (ou tirar um), este teste avisa.
class RotasPublicasTest {

    private static final Set<String> PUBLICAS = Set.of(
            "AuthController.entrar",
            "PessoaController.cadastrar",
            "ConfirmacaoEmailController.confirmar", "ConfirmacaoEmailController.reenviar",
            "RedefinicaoSenhaController.solicitar", "RedefinicaoSenhaController.redefinir",
            "ConviteController.validar", "ConviteController.aceitar", "ConviteController.recusar",
            "TrilhaController.listar", "TrilhaController.buscarPorCodigo",
            "PingController.ping");

    @Test
    void soOsEnderecosCombinadosSaoPublicos() throws Exception {
        ClassPathScanningCandidateComponentProvider busca = new ClassPathScanningCandidateComponentProvider(false);
        busca.addIncludeFilter(new AnnotationTypeFilter(RestController.class));
        Set<String> publicas = new TreeSet<>();
        int enderecos = 0;
        for (var bean : busca.findCandidateComponents("br.com.uphub.backend")) {
            Class<?> classe = Class.forName(bean.getBeanClassName());
            for (Method m : classe.getDeclaredMethods()) {
                if (!AnnotatedElementUtils.hasAnnotation(m, RequestMapping.class)) {
                    continue;
                }
                enderecos++;
                if (classe.isAnnotationPresent(Publico.class) || m.isAnnotationPresent(Publico.class)) {
                    publicas.add(classe.getSimpleName() + "." + m.getName());
                }
            }
        }
        assertEquals(new TreeSet<>(PUBLICAS), publicas);
        // a imensa maioria exige login
        assertTrue(enderecos > 100, "achou " + enderecos + " endereços");
    }
}
