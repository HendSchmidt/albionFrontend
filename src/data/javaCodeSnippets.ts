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
    descricao: 'Classe de Serviço com a regra completa: compra de diários vazios, preenchimento, venda de cheios, taxa da barraca, taxas de mercado e SPF.',
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
	 * Calcula o custo por recurso, taxas de estação, ciclo completo dos diários de artesão
	 * (compra do vazio vs venda do cheio com taxas), taxas de mercado e Silver per Focus (SPF).
	 *
	 * @param request DTO com todos os parâmetros de craft do Albion Online.
	 * @return CraftResponseDto com detalhamento econômico completo.
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

		// 3. Taxas de Mercado (Itens Fabricados):
		BigDecimal precoVenda = request.precoDeVenda() != null ? request.precoDeVenda() : BigDecimal.ZERO;
		BigDecimal receitaBrutaItens = precoVenda
				.multiply(BigDecimal.valueOf(quantidadeProducao))
				.setScale(2, RoundingMode.HALF_UP);

		BigDecimal aliquotaVenda = request.contaPremium()
				? TAXA_MERCADO_COM_PREMIUM
				: TAXA_MERCADO_SEM_PREMIUM;
		BigDecimal taxaVendaItens = receitaBrutaItens
				.multiply(aliquotaVenda)
				.setScale(2, RoundingMode.HALF_UP);

		boolean ehOrdemDeVenda = request.ordemDeVenda() == null || request.ordemDeVenda();
		BigDecimal taxaMontagemOrdemAliquota = ehOrdemDeVenda ? TAXA_MONTAGEM_ORDEM : BigDecimal.ZERO;
		BigDecimal taxaMontagemItens = receitaBrutaItens
				.multiply(taxaMontagemOrdemAliquota)
				.setScale(2, RoundingMode.HALF_UP);

		BigDecimal receitaLiquidaItens = receitaBrutaItens
				.subtract(taxaVendaItens)
				.subtract(taxaMontagemItens)
				.setScale(2, RoundingMode.HALF_UP);

		// 4. Operação Completa com Diários de Artesão (Crafting Journals):
		BigDecimal custoDiariosVazios = BigDecimal.ZERO;
		BigDecimal receitaBrutaDiarios = BigDecimal.ZERO;
		BigDecimal taxaVendaDiarios = BigDecimal.ZERO;
		BigDecimal taxaMontagemDiarios = BigDecimal.ZERO;
		BigDecimal receitaLiquidaDiarios = BigDecimal.ZERO;
		BigDecimal lucroLiquidoDiarios = BigDecimal.ZERO;

		int qtdDiarios = request.quantidadeDiarios() != null ? Math.max(0, request.quantidadeDiarios()) : 0;
		if (qtdDiarios > 0) {
			BigDecimal precoCheio = request.precoDiarioCheio() != null && request.precoDiarioCheio().compareTo(BigDecimal.ZERO) > 0
					? request.precoDiarioCheio()
					: (request.valorVendaDiario() != null ? request.valorVendaDiario() : BigDecimal.ZERO);

			receitaBrutaDiarios = precoCheio.multiply(BigDecimal.valueOf(qtdDiarios)).setScale(2, RoundingMode.HALF_UP);
			BigDecimal precoVazio = request.precoDiarioVazio() != null ? request.precoDiarioVazio() : BigDecimal.ZERO;
			custoDiariosVazios = precoVazio.multiply(BigDecimal.valueOf(qtdDiarios)).setScale(2, RoundingMode.HALF_UP);

			taxaVendaDiarios = receitaBrutaDiarios.multiply(aliquotaVenda).setScale(2, RoundingMode.HALF_UP);
			taxaMontagemDiarios = receitaBrutaDiarios.multiply(taxaMontagemOrdemAliquota).setScale(2, RoundingMode.HALF_UP);

			receitaLiquidaDiarios = receitaBrutaDiarios.subtract(taxaVendaDiarios).subtract(taxaMontagemDiarios).setScale(2, RoundingMode.HALF_UP);
			lucroLiquidoDiarios = receitaLiquidaDiarios.subtract(custoDiariosVazios).setScale(2, RoundingMode.HALF_UP);
		}

		// 5. Consolidação de Custos, Taxas e Receitas:
		BigDecimal custoTotalProducao = custoInsumos
				.add(custoTaxaEstacao)
				.add(custoDiariosVazios)
				.setScale(2, RoundingMode.HALF_UP);

		BigDecimal taxaVendaTotal = taxaVendaItens.add(taxaVendaDiarios).setScale(2, RoundingMode.HALF_UP);
		BigDecimal taxaMontagemTotal = taxaMontagemItens.add(taxaMontagemDiarios).setScale(2, RoundingMode.HALF_UP);
		BigDecimal receitaLiquidaTotal = receitaLiquidaItens.add(receitaLiquidaDiarios).setScale(2, RoundingMode.HALF_UP);

		// 6. Lucro Líquido Final = Receita Líquida Total - Custo Total da Produção
		BigDecimal lucro = receitaLiquidaTotal.subtract(custoTotalProducao).setScale(2, RoundingMode.HALF_UP);

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
				receitaLiquidaDiarios,
				custoDiariosVazios,
				lucroLiquidoDiarios,
				taxaMontagemTotal,
				taxaVendaTotal,
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
    descricao: 'Record com suporte ao preço do diário vazio e diário cheio para apurar a viabilidade.',
    codigo: `package com.albion.api.dto;

import java.math.BigDecimal;
import java.util.List;

public record CraftRequestDto(
		List<RecursoRequestDto> recurso,
		int quantidadeParaProducao,
		int taxaDeRetorno,
		BigDecimal precoDeVenda,
		boolean contaPremium,
		BigDecimal taxaEstacaoPorCemNutricao,
		BigDecimal itemValue,
		Integer quantidadeDiarios,
		BigDecimal precoDiarioVazio,   // Preço de compra do diário vazio no mercado
		BigDecimal precoDiarioCheio,   // Preço de venda do diário cheio no mercado
		BigDecimal valorVendaDiario,   // Compatibilidade retroativa
		Boolean ordemDeVenda,
		Boolean usarFoco,
		Integer custoFocoTotal
) {
	public CraftRequestDto(
			List<RecursoRequestDto> recurso,
			int quantidadeParaProducao,
			int taxaDeRetorno,
			BigDecimal precoDeVenda,
			boolean contaPremium
	) {
		this(recurso, quantidadeParaProducao, taxaDeRetorno, precoDeVenda, contaPremium,
				null, null, null, null, null, null, true, false, null);
	}
}
`,
  },
  {
    filename: 'CraftResponseDto.java',
    pacote: 'com.albion.api.dto',
    descricao: 'Record com custo de compra dos diários vazios e lucro líquido real obtido com os diários.',
    codigo: `package com.albion.api.dto;

import java.math.BigDecimal;
import java.util.List;

public record CraftResponseDto(
		BigDecimal custoTotalDaProdcao,
		List<RecursoResponseDto> custoPorRecurso,
		BigDecimal lucro,
		BigDecimal custoTaxaEstacao,
		BigDecimal receitaDiarios,       // Receita líquida obtida na venda dos diários
		BigDecimal custoDiariosVazios,   // Custo total pago na compra dos diários vazios
		BigDecimal lucroLiquidoDiarios,  // Lucro limpo obtido com os diários após custo e taxas
		BigDecimal taxaMontagemOrdem,
		BigDecimal taxaVendaMercado,
		BigDecimal receitaLiquidaTotal,
		BigDecimal prataPorFoco
) {
	public CraftResponseDto(
			BigDecimal custoTotalDaProdcao,
			List<RecursoResponseDto> custoPorRecurso,
			BigDecimal lucro
	) {
		this(custoTotalDaProdcao, custoPorRecurso, lucro,
				BigDecimal.ZERO, BigDecimal.ZERO, BigDecimal.ZERO, BigDecimal.ZERO,
				BigDecimal.ZERO, BigDecimal.ZERO, BigDecimal.ZERO, BigDecimal.ZERO);
	}
}
`,
  },
  {
    filename: 'CalculaViabilidadeDeProdcaoTest.java',
    pacote: 'com.albion.api.service',
    descricao: 'Teste unitário JUnit 5 validando o ciclo de compra de diário vazio e venda do diário cheio.',
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
	@DisplayName("Deve calcular operação completa com compra de diário vazio e venda do diário cheio")
	void deveCalcularOperacaoComDiariosCompletos() {
		CraftRequestDto request = new CraftRequestDto(
				List.of(new RecursoRequestDto("Barra de Ferro T4", 16, new BigDecimal("200.00"))),
				5,
				25,
				new BigDecimal("6000.00"),
				true,
				new BigDecimal("500.00"),
				new BigDecimal("800.00"),
				2,
				new BigDecimal("1200.00"), // Compra vazio = 1.200 cada (Total = 2.400)
				new BigDecimal("5000.00"), // Venda cheio = 5.000 cada (Total bruto = 10.000)
				null,
				false,
				true,
				1000
		);

		CraftResponseDto response = service.calcular(request);

		assertNotNull(response);
		assertEquals(new BigDecimal("2400.00"), response.custoDiariosVazios());
		assertEquals(new BigDecimal("9400.00"), response.receitaDiarios());
		assertEquals(new BigDecimal("7000.00"), response.lucroLiquidoDiarios());
		assertEquals(new BigDecimal("16650.00"), response.custoTotalDaProdcao());
		assertEquals(new BigDecimal("37600.00"), response.receitaLiquidaTotal());
		assertEquals(new BigDecimal("20950.00"), response.lucro());
	}
}
`,
  },
];
