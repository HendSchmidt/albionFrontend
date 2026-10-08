export interface JavaSnippet {
  filename: string;
  pacote: string;
  descricao: string;
  codigo: string;
}

export const JAVA_SNIPPETS: JavaSnippet[] = [
  {
    filename: 'CalculaViabilidadeDeProdcao.java',
    pacote: 'com.albion.api.service',
    descricao: 'Classe de Serviço que executa as regras de negócio de cálculo de custos, taxa de retorno e desconto de conta premium.',
    codigo: `package com.albion.api.service;

import com.albion.api.dto.CraftRequestDto;
import com.albion.api.dto.CraftResponseDto;
import com.albion.api.dto.RecursoRequestDto;
import com.albion.api.dto.RecursoResponseDto;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.util.ArrayList;
import java.util.List;

/**
 * Serviço responsável por calcular a viabilidade econômica e faturamento
 * da produção de itens no Albion Online.
 */
@Service
public class CalculaViabilidadeDeProdcao {

    // Taxas do mercado:
    // Com Conta Premium: 6% de taxa (0.06).
    // Sem Conta Premium: 12% de taxa (0.12), pois a Conta Premium equivale a 6% de desconto no mercado.
    private static final BigDecimal TAXA_MERCADO_COM_PREMIUM = new BigDecimal("0.06");
    private static final BigDecimal TAXA_MERCADO_SEM_PREMIUM = new BigDecimal("0.12");
    private static final BigDecimal CEM = new BigDecimal("100");

    /**
     * Calcula o custo por recurso, o custo total de fabricação e o lucro final.
     *
     * @param request DTO com recursos, quantidade, taxa de retorno, preço de venda e status premium.
     * @return CraftResponseDto com o custo total, lista de custos por recurso e o lucro líquido.
     */
    public CraftResponseDto calcular(CraftRequestDto request) {
        if (request == null || request.recurso() == null) {
            throw new IllegalArgumentException("O pedido e a lista de recursos não podem ser nulos.");
        }

        int quantidadeProducao = Math.max(1, request.quantidadeParaProducao());
        int taxaRetorno = Math.max(0, request.taxaDeRetorno());

        // Fator de Retorno de Recursos: taxaDeRetorno / 100 (ex: 20% -> 0.2000)
        BigDecimal fatorRetorno = BigDecimal.valueOf(taxaRetorno)
                .divide(CEM, 4, RoundingMode.HALF_UP);

        // Fator de Consumo Efetivo: 1 - fatorRetorno (ex: 1 - 0.20 = 0.80)
        BigDecimal fatorConsumo = BigDecimal.ONE.subtract(fatorRetorno);

        List<RecursoResponseDto> custosPorRecurso = new ArrayList<>();
        BigDecimal custoTotalProducao = BigDecimal.ZERO;

        // 1. Cálculo de custo de cada recurso considerando a taxa de retorno
        for (RecursoRequestDto recurso : request.recurso()) {
            if (recurso == null) continue;

            // Quantidade total bruta necessária para iniciar o craft
            BigDecimal qtdTotal = BigDecimal.valueOf((long) recurso.quantidade() * quantidadeProducao);

            // Quantidade consumida líquida (após o retorno devolvido pelo jogo)
            BigDecimal qtdConsumidaEfetiva = qtdTotal.multiply(fatorConsumo);

            // Custo do recurso = qtdConsumidaEfetiva * valorUnitario
            BigDecimal valorUnitario = recurso.valor() != null ? recurso.valor() : BigDecimal.ZERO;
            BigDecimal custoRecurso = qtdConsumidaEfetiva
                    .multiply(valorUnitario)
                    .setScale(2, RoundingMode.HALF_UP);

            custosPorRecurso.add(new RecursoResponseDto(recurso.nome(), custoRecurso));
            custoTotalProducao = custoTotalProducao.add(custoRecurso);
        }

        // 2. Cálculo da Receita de Venda no Mercado
        BigDecimal precoVenda = request.precoDeVenda() != null ? request.precoDeVenda() : BigDecimal.ZERO;
        BigDecimal receitaBruta = precoVenda
                .multiply(BigDecimal.valueOf(quantidadeProducao))
                .setScale(2, RoundingMode.HALF_UP);

        // 3. Regra da Conta Premium e Taxa de Mercado:
        // Com Conta Premium: taxa é de 6% (0.06).
        // Sem Conta Premium: taxa é de 12% (0.12) (6% a mais sem o desconto premium).
        BigDecimal taxaMercado = request.contaPremium() 
                ? TAXA_MERCADO_COM_PREMIUM 
                : TAXA_MERCADO_SEM_PREMIUM;

        BigDecimal valorTaxaMercado = receitaBruta
                .multiply(taxaMercado)
                .setScale(2, RoundingMode.HALF_UP);

        BigDecimal receitaLiquida = receitaBruta.subtract(valorTaxaMercado);

        // 4. Lucro = Receita Líquida - Custo Total da Produção
        BigDecimal lucro = receitaLiquida
                .subtract(custoTotalProducao)
                .setScale(2, RoundingMode.HALF_UP);

        return new CraftResponseDto(
                custoTotalProducao,
                custosPorRecurso,
                lucro
        );
    }
}
`,
  },
  {
    filename: 'ProjecaoDeFaturamentoController.java',
    pacote: 'com.albion.api.controller',
    descricao: 'Controller REST Spring Boot que recebe o JSON de entrada (CraftRequestDto) e retorna o CraftResponseDto formatado.',
    codigo: `package com.albion.api.controller;

import com.albion.api.dto.CraftRequestDto;
import com.albion.api.dto.CraftResponseDto;
import com.albion.api.service.CalculaViabilidadeDeProdcao;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

/**
 * Controller responsável pelos endpoints de projeção de faturamento e viabilidade.
 */
@RestController
@RequestMapping
public class ProjecaoDeFaturamentoController {

    private final CalculaViabilidadeDeProdcao calculaViabilidadeDeProdcao;

    // Injeção de dependência via construtor (melhor prática Spring Boot)
    public ProjecaoDeFaturamentoController(CalculaViabilidadeDeProdcao calculaViabilidadeDeProdcao) {
        this.calculaViabilidadeDeProdcao = calculaViabilidadeDeProdcao;
    }

    /**
     * Endpoint POST /calculaViabilidadePorRecurso
     * Recebe o payload do craft e retorna a análise de custos e lucro líquido.
     *
     * @param request DTO com dados dos recursos, taxa de retorno, preço de venda e status premium.
     * @return CraftResponseDto com os custos e projeção de lucro.
     */
    @PostMapping(value = "/calculaViabilidadePorRecurso")
    public ResponseEntity<CraftResponseDto> calculaFaturamento(@RequestBody CraftRequestDto request) {
        CraftResponseDto response = calculaViabilidadeDeProdcao.calcular(request);
        return ResponseEntity.ok(response);
    }
}
`,
  },
  {
    filename: 'CraftRequestDto.java',
    pacote: 'com.albion.api.dto',
    descricao: 'Record de entrada contendo a lista de recursos, quantidade, taxa de retorno e status premium.',
    codigo: `package com.albion.api.dto;

import java.math.BigDecimal;
import java.util.List;

public record CraftRequestDto(
        List<RecursoRequestDto> recurso,
        int quantidadeParaProducao,
        int taxaDeRetorno,
        BigDecimal precoDeVenda,
        boolean contaPremium
) {}
`,
  },
  {
    filename: 'CraftResponseDto.java',
    pacote: 'com.albion.api.dto',
    descricao: 'Record de resposta contendo o custo total, detalhamento por recurso e o lucro.',
    codigo: `package com.albion.api.dto;

import java.math.BigDecimal;
import java.util.List;

public record CraftResponseDto(
        BigDecimal custoTotalDaProdcao,
        List<RecursoResponseDto> custoPorRecurso,
        BigDecimal lucro
) {}
`,
  },
  {
    filename: 'RecursoRequestDto.java',
    pacote: 'com.albion.api.dto',
    descricao: 'Record que define cada recurso de entrada com nome, quantidade por item e preço unitário.',
    codigo: `package com.albion.api.dto;

import java.math.BigDecimal;

public record RecursoRequestDto(
        String nome,
        int quantidade,
        BigDecimal valor
) {}
`,
  },
  {
    filename: 'RecursoResponseDto.java',
    pacote: 'com.albion.api.dto',
    descricao: 'Record que define o custo final calculado de cada recurso após a taxa de retorno.',
    codigo: `package com.albion.api.dto;

import java.math.BigDecimal;

public record RecursoResponseDto(
        String nome,
        BigDecimal valor
) {}
`,
  },
  {
    filename: 'CalculaViabilidadeDeProdcaoTest.java',
    pacote: 'com.albion.api.service',
    descricao: 'Testes unitários JUnit 5 para validação de cenários com e sem Conta Premium e com Taxa de Retorno.',
    codigo: `package com.albion.api.service;

import com.albion.api.dto.CraftRequestDto;
import com.albion.api.dto.CraftResponseDto;
import com.albion.api.dto.RecursoRequestDto;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;

import java.math.BigDecimal;
import java.util.List;

import static org.junit.jupiter.api.Assertions.*;

class CalculaViabilidadeDeProdcaoTest {

    private CalculaViabilidadeDeProdcao service;

    @BeforeEach
    void setUp() {
        service = new CalculaViabilidadeDeProdcao();
    }

    @Test
    @DisplayName("Deve calcular corretamente com taxa de retorno de 20% e Conta Premium (desconto de 6%)")
    void deveCalcularComRetornoEContaPremium() {
        // Cenário:
        // Item precisa de 10 barras de ferro (valor 100 cada)
        // Produz 1 item
        // Taxa de retorno: 20% -> Consumo efetivo = 8 barras = 8 * 100 = 800.00
        // Preço de venda: 1200.00
        // Conta Premium = true -> 0% taxa de mercado (desconto de 6% concedido)
        // Lucro = 1200.00 - 800.00 = 400.00
        CraftRequestDto request = new CraftRequestDto(
                List.of(new RecursoRequestDto("Barra de Ferro", 10, new BigDecimal("100.00"))),
                1,
                20,
                new BigDecimal("1200.00"),
                true
        );

        CraftResponseDto response = service.calcular(request);

        assertNotNull(response);
        assertEquals(new BigDecimal("800.00"), response.custoTotalDaProdcao());
        assertEquals(1, response.custoPorRecurso().size());
        assertEquals("Barra de Ferro", response.custoPorRecurso().get(0).nome());
        assertEquals(new BigDecimal("800.00"), response.custoPorRecurso().get(0).valor());
        assertEquals(new BigDecimal("400.00"), response.lucro());
    }

    @Test
    @DisplayName("Deve aplicar 6% de taxa de mercado quando Conta Premium for falsa")
    void deveCalcularSemContaPremiumComTaxaDeMercado() {
        // Cenário:
        // Custo = 800.00
        // Preço de venda = 1000.00
        // Sem Premium -> Taxa de mercado de 6% = 60.00. Receita líquida = 940.00
        // Lucro = 940.00 - 800.00 = 140.00
        CraftRequestDto request = new CraftRequestDto(
                List.of(new RecursoRequestDto("Barra de Ferro", 10, new BigDecimal("100.00"))),
                1,
                20,
                new BigDecimal("1000.00"),
                false
        );

        CraftResponseDto response = service.calcular(request);

        assertNotNull(response);
        assertEquals(new BigDecimal("800.00"), response.custoTotalDaProdcao());
        assertEquals(new BigDecimal("140.00"), response.lucro());
    }
}
`,
  },
];
