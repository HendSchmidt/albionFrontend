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
    descricao: 'Classe de Serviço que calcula custos de insumos (com RRR), taxa da barraca da cidade, receita de diários, taxas de mercado e Silver per Focus (SPF).',
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

@Service
public class CalculaViabilidadeDeProdcao {

	// Taxas do mercado:
	// Com Conta Premium: 6% de taxa (0.06).
	// Sem Conta Premium: 12% de taxa (0.12), pois a Conta Premium equivale a 6% de desconto.
	private static final BigDecimal TAXA_MERCADO_COM_PREMIUM = new BigDecimal("0.06");
	private static final BigDecimal TAXA_MERCADO_SEM_PREMIUM = new BigDecimal("0.12");

	// Taxa de montagem de ordem no mercado do Albion (Setup Fee): 2.5% (0.025)
	private static final BigDecimal TAXA_MONTAGEM_ORDEM = new BigDecimal("0.025");

	// Fator oficial de consumo de nutrição por Item Value no Albion: 0.1125
	private static final BigDecimal FATOR_NUTRICAO = new BigDecimal("0.1125");

	private static final BigDecimal CEM = new BigDecimal("100");

	/**
	 * Calcula o custo por recurso, taxas de estação, receitas de diários,
	 * taxas de mercado e o lucro líquido final com métrica de Silver per Focus (SPF).
	 *
	 * @param request DTO com todos os parâmetros de craft do Albion Online.
	 * @return CraftResponseDto detalhado.
	 */
	public CraftResponseDto calcular(CraftRequestDto request) {
		if (request == null || request.recurso() == null) {
			throw new IllegalArgumentException("O payload de fabricação e a lista de recursos não podem ser nulos.");
		}

		int quantidadeProducao = Math.max(1, request.quantidadeParaProducao());
		int taxaRetorno = Math.max(0, request.taxaDeRetorno());

		// 1. Fator de retorno de materiais (RRR)
		BigDecimal fatorRetorno = BigDecimal.valueOf(taxaRetorno)
				.divide(CEM, 4, RoundingMode.HALF_UP);
		BigDecimal fatorConsumo = BigDecimal.ONE.subtract(fatorRetorno);

		List<RecursoResponseDto> custosPorRecurso = new ArrayList<>();
		BigDecimal custoInsumos = BigDecimal.ZERO;

		// Cálculo do custo de cada recurso com a taxa de retorno
		for (RecursoRequestDto recurso : request.recurso()) {
			if (recurso == null) continue;

			BigDecimal qtdTotal = BigDecimal.valueOf((long) recurso.quantidade() * quantidadeProducao);
			BigDecimal qtdConsumidaEfetiva = qtdTotal.multiply(fatorConsumo);

			BigDecimal valorUnitario = recurso.valor() != null ? recurso.valor() : BigDecimal.ZERO;
			BigDecimal custoRecurso = qtdConsumidaEfetiva
					.multiply(valorUnitario)
					.setScale(2, RoundingMode.HALF_UP);

			custosPorRecurso.add(new RecursoResponseDto(recurso.nome(), custoRecurso));
			custoInsumos = custoInsumos.add(custoRecurso);
		}

		// 2. Cálculo da Taxa da Estação de Fabricação (Station / Nutrition Fee)
		BigDecimal custoTaxaEstacao = BigDecimal.ZERO;
		if (request.taxaEstacaoPorCemNutricao() != null && request.taxaEstacaoPorCemNutricao().compareTo(BigDecimal.ZERO) > 0) {
			BigDecimal iv = request.itemValue() != null && request.itemValue().compareTo(BigDecimal.ZERO) > 0
					? request.itemValue()
					: custoInsumos.divide(BigDecimal.valueOf(quantidadeProducao), 2, RoundingMode.HALF_UP);

			// Nutrição consumida = Item Value * 0.1125 * Quantidade
			BigDecimal nutricaoConsumida = iv
					.multiply(FATOR_NUTRICAO)
					.multiply(BigDecimal.valueOf(quantidadeProducao));

			// Custo = (Nutrição / 100) * Taxa por 100 de nutrição
			custoTaxaEstacao = nutricaoConsumida
					.divide(CEM, 4, RoundingMode.HALF_UP)
					.multiply(request.taxaEstacaoPorCemNutricao())
					.setScale(2, RoundingMode.HALF_UP);
		}

		// Custo Total da Produção = Custo de Insumos + Taxa da Estação
		BigDecimal custoTotalProducao = custoInsumos.add(custoTaxaEstacao).setScale(2, RoundingMode.HALF_UP);

		// 3. Receita Bruta da Venda dos Itens
		BigDecimal precoVenda = request.precoDeVenda() != null ? request.precoDeVenda() : BigDecimal.ZERO;
		BigDecimal receitaBrutaItens = precoVenda
				.multiply(BigDecimal.valueOf(quantidadeProducao))
				.setScale(2, RoundingMode.HALF_UP);

		// 4. Receita com Diários de Artesão (Crafting Journals)
		BigDecimal receitaDiarios = BigDecimal.ZERO;
		if (request.quantidadeDiarios() != null && request.quantidadeDiarios() > 0 &&
				request.valorVendaDiario() != null && request.valorVendaDiario().compareTo(BigDecimal.ZERO) > 0) {
			receitaDiarios = request.valorVendaDiario()
					.multiply(BigDecimal.valueOf(request.quantidadeDiarios()))
					.setScale(2, RoundingMode.HALF_UP);
		}

		// 5. Taxas do Mercado de Albion Online:
		// Taxa de Venda: 6% com Premium / 12% sem Premium
		BigDecimal aliquotaVenda = request.contaPremium()
				? TAXA_MERCADO_COM_PREMIUM
				: TAXA_MERCADO_SEM_PREMIUM;
		BigDecimal taxaVendaMercado = receitaBrutaItens
				.multiply(aliquotaVenda)
				.setScale(2, RoundingMode.HALF_UP);

		// Taxa de Montagem de Ordem (Setup Fee): 2.5% apenas se for vendido via Ordem de Venda
		boolean ehOrdemDeVenda = request.ordemDeVenda() == null || request.ordemDeVenda();
		BigDecimal taxaMontagemOrdem = ehOrdemDeVenda
				? receitaBrutaItens.multiply(TAXA_MONTAGEM_ORDEM).setScale(2, RoundingMode.HALF_UP)
				: BigDecimal.ZERO;

		BigDecimal totalTaxasMercado = taxaVendaMercado.add(taxaMontagemOrdem);

		// Receita Líquida Total = (Receita Bruta - Taxas de Mercado) + Receita de Diários
		BigDecimal receitaLiquidaTotal = receitaBrutaItens
				.subtract(totalTaxasMercado)
				.add(receitaDiarios)
				.setScale(2, RoundingMode.HALF_UP);

		// 6. Lucro Líquido Final = Receita Líquida Total - Custo Total da Produção
		BigDecimal lucro = receitaLiquidaTotal
				.subtract(custoTotalProducao)
				.setScale(2, RoundingMode.HALF_UP);

		// 7. Métrica de Prata por Ponto de Foco (Silver per Focus - SPF)
		BigDecimal prataPorFoco = BigDecimal.ZERO;
		if (Boolean.TRUE.equals(request.usarFoco()) && request.custoFocoTotal() != null && request.custoFocoTotal() > 0) {
			prataPorFoco = lucro
					.divide(BigDecimal.valueOf(request.custoFocoTotal()), 2, RoundingMode.HALF_UP);
		}

		return new CraftResponseDto(
				custoTotalProducao,
				custosPorRecurso,
				lucro,
				custoTaxaEstacao,
				receitaDiarios,
				taxaMontagemOrdem,
				taxaVendaMercado,
				receitaLiquidaTotal,
				prataPorFoco
		);
	}
}
`,
  },
  {
    filename: 'ProjecaoDeFaturamentoController.java',
    pacote: 'com.albion.api.controller',
    descricao: 'Controller REST com @CrossOrigin habilitado para comunicação com aplicações web.',
    codigo: `package com.albion.api.controller;

import com.albion.api.dto.CraftRequestDto;
import com.albion.api.dto.CraftResponseDto;
import com.albion.api.service.CalculaViabilidadeDeProdcao;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RestController;

@RestController
@CrossOrigin(origins = "*")
public class ProjecaoDeFaturamentoController {

	private final CalculaViabilidadeDeProdcao calculaViabilidadeDeProdcao;

	public ProjecaoDeFaturamentoController(CalculaViabilidadeDeProdcao calculaViabilidadeDeProdcao) {
		this.calculaViabilidadeDeProdcao = calculaViabilidadeDeProdcao;
	}

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
    descricao: 'Record de entrada com suporte a taxa da barraca, diários, foco e tipo de venda.',
    codigo: `package com.albion.api.dto;

import java.math.BigDecimal;
import java.util.List;

public record CraftRequestDto(
		List<RecursoRequestDto> recurso,
		int quantidadeParaProducao,
		int taxaDeRetorno,
		BigDecimal precoDeVenda,
		boolean contaPremium,
		// Funcionalidades avançadas da economia do Albion Online:
		BigDecimal taxaEstacaoPorCemNutricao, // Taxa da barraca (por 100 de nutrição)
		BigDecimal itemValue,                 // Item Value para cálculo da nutrição
		Integer quantidadeDiarios,            // Quantidade de diários preenchidos
		BigDecimal valorVendaDiario,          // Preço de venda de cada diário cheio
		Boolean ordemDeVenda,                 // true = Ordem de Venda (2.5%), false = Venda Instantânea
		Boolean usarFoco,                     // Se utilizou foco de produção
		Integer custoFocoTotal                // Quantidade total de pontos de foco gastos
) {
	public CraftRequestDto(
			List<RecursoRequestDto> recurso,
			int quantidadeParaProducao,
			int taxaDeRetorno,
			BigDecimal precoDeVenda,
			boolean contaPremium
	) {
		this(recurso, quantidadeParaProducao, taxaDeRetorno, precoDeVenda, contaPremium,
				null, null, null, null, true, false, null);
	}
}
`,
  },
  {
    filename: 'CraftResponseDto.java',
    pacote: 'com.albion.api.dto',
    descricao: 'Record de resposta com custo total, diários, taxas detalhadas e Silver per Focus (SPF).',
    codigo: `package com.albion.api.dto;

import java.math.BigDecimal;
import java.util.List;

public record CraftResponseDto(
		BigDecimal custoTotalDaProdcao,
		List<RecursoResponseDto> custoPorRecurso,
		BigDecimal lucro,
		// Detalhamento econômico avançado:
		BigDecimal custoTaxaEstacao,    // Valor pago ao dono da barraca de fabricação
		BigDecimal receitaDiarios,       // Receita extra obtida com diários cheios
		BigDecimal taxaMontagemOrdem,    // Taxa de 2.5% de setup fee (ordem de venda)
		BigDecimal taxaVendaMercado,     // Taxa de venda (6% premium / 12% sem premium)
		BigDecimal receitaLiquidaTotal,  // Receita líquida total
		BigDecimal prataPorFoco          // Métrica Silver per Focus (SPF)
) {
	public CraftResponseDto(
			BigDecimal custoTotalDaProdcao,
			List<RecursoResponseDto> custoPorRecurso,
			BigDecimal lucro
	) {
		this(custoTotalDaProdcao, custoPorRecurso, lucro,
				BigDecimal.ZERO, BigDecimal.ZERO, BigDecimal.ZERO, BigDecimal.ZERO, BigDecimal.ZERO, BigDecimal.ZERO);
	}
}
`,
  },
  {
    filename: 'CalculaViabilidadeDeProdcaoTest.java',
    pacote: 'com.albion.api.service',
    descricao: 'Testes unitários JUnit 5 para validação com taxa de estação, diários de artesão e SPF.',
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
	@DisplayName("Deve calcular com taxa da estação, diários de artesão e venda instantânea")
	void deveCalcularComTaxaEstacaoEDiarios() {
		CraftRequestDto request = new CraftRequestDto(
				List.of(new RecursoRequestDto("Barra de Ferro T4", 16, new BigDecimal("200.00"))),
				5,
				25,
				new BigDecimal("6000.00"),
				true,
				new BigDecimal("500.00"),
				new BigDecimal("800.00"),
				2,
				new BigDecimal("3500.00"),
				false,
				true,
				1000
		);

		CraftResponseDto response = service.calcular(request);

		assertNotNull(response);
		assertEquals(new BigDecimal("14250.00"), response.custoTotalDaProdcao());
		assertEquals(new BigDecimal("2250.00"), response.custoTaxaEstacao());
		assertEquals(new BigDecimal("7000.00"), response.receitaDiarios());
		assertEquals(new BigDecimal("0.00"), response.taxaMontagemOrdem());
		assertEquals(new BigDecimal("1800.00"), response.taxaVendaMercado());
		assertEquals(new BigDecimal("35200.00"), response.receitaLiquidaTotal());
		assertEquals(new BigDecimal("20950.00"), response.lucro());
		assertEquals(new BigDecimal("20.95"), response.prataPorFoco());
	}
}
`,
  },
];
