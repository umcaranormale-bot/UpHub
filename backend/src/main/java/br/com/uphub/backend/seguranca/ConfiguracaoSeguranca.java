package br.com.uphub.backend.seguranca;

import org.springframework.context.annotation.Configuration;
import org.springframework.web.method.support.HandlerMethodArgumentResolver;
import org.springframework.web.servlet.config.annotation.InterceptorRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

import java.util.List;

@Configuration
public class ConfiguracaoSeguranca implements WebMvcConfigurer {

    private final FiltroDeToken filtroDeToken;

    public ConfiguracaoSeguranca(FiltroDeToken filtroDeToken) {
        this.filtroDeToken = filtroDeToken;
    }

    @Override
    public void addInterceptors(InterceptorRegistry registry) {
        registry.addInterceptor(filtroDeToken).addPathPatterns("/api/**");
    }

    @Override
    public void addArgumentResolvers(List<HandlerMethodArgumentResolver> resolvers) {
        resolvers.add(new ResolvedorPessoaLogada());
    }
}
