package br.com.uphub.backend;

import br.com.uphub.backend.seguranca.PessoaLogada;
import io.swagger.v3.oas.models.Components;
import io.swagger.v3.oas.models.OpenAPI;
import io.swagger.v3.oas.models.info.Info;
import io.swagger.v3.oas.models.security.SecurityRequirement;
import io.swagger.v3.oas.models.security.SecurityScheme;
import org.springdoc.core.utils.SpringDocUtils;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

// A documentação da API no próprio back-end. No Swagger, clique em "Authorize" e cole o token do login.
@Configuration
public class ConfiguracaoSwagger {

    static {
        // o id de quem está logado vem do token, não é parâmetro: fica fora da documentação
        SpringDocUtils.getConfig().addAnnotationsToIgnore(PessoaLogada.class);
    }

    @Bean
    public OpenAPI openApi() {
        return new OpenAPI()
                .info(new Info()
                        .title("Up Hub API")
                        .version("v1")
                        .description("Uma plataforma só para as três trilhas do ecossistema (Fomento, Investimento e Formação). "
                                + "Quase todos os endereços exigem o token do login (POST /api/auth/login) no cabeçalho Authorization."))
                .components(new Components().addSecuritySchemes("token",
                        new SecurityScheme().type(SecurityScheme.Type.HTTP).scheme("bearer").bearerFormat("JWT")))
                .addSecurityItem(new SecurityRequirement().addList("token"));
    }
}
