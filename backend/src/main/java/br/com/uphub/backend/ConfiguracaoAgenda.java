package br.com.uphub.backend;

import org.springframework.context.annotation.Configuration;
import org.springframework.scheduling.annotation.EnableScheduling;

// Liga as tarefas que rodam sozinhas, como a perda de prazo do ajuste.
@Configuration
@EnableScheduling
public class ConfiguracaoAgenda {
}
