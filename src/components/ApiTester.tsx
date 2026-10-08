import React, { useState } from 'react';
import { CraftRequestDto } from '../types/albion';
import { Terminal, Copy, Check, Send, AlertCircle, Sparkles, Globe, Server, CheckCircle2 } from 'lucide-react';

interface ApiTesterProps {
  currentRequest: CraftRequestDto;
}

export const ApiTester: React.FC<ApiTesterProps> = ({ currentRequest }) => {
  const [targetEndpoint, setTargetEndpoint] = useState<string>('/calculaViabilidadePorRecurso');
  const [customUrl, setCustomUrl] = useState<string>('http://localhost:8080/calculaViabilidadePorRecurso');
  const [useCustomUrl, setUseCustomUrl] = useState<boolean>(false);

  const [jsonInput, setJsonInput] = useState<string>(() =>
    JSON.stringify(currentRequest, null, 2)
  );
  const [jsonResponse, setJsonResponse] = useState<string | null>(null);
  const [httpStatus, setHttpStatus] = useState<number | null>(null);
  const [latency, setLatency] = useState<number | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [copiedResponse, setCopiedResponse] = useState<boolean>(false);
  const [copiedCurl, setCopiedCurl] = useState<boolean>(false);

  const syncFromCurrent = () => {
    setJsonInput(JSON.stringify(currentRequest, null, 2));
    setErrorMsg(null);
  };

  const activeUrl = useCustomUrl ? customUrl : targetEndpoint;

  const handleExecuteApi = async () => {
    setIsLoading(true);
    setErrorMsg(null);
    setJsonResponse(null);
    setHttpStatus(null);

    const startTime = performance.now();
    try {
      let parsed: CraftRequestDto;
      try {
        parsed = JSON.parse(jsonInput);
      } catch (e: any) {
        throw new Error(`JSON de entrada inválido: ${e.message}`);
      }

      let res: Response;

      // Se for uma URL externa (ex: http://localhost:8080), usa o proxy para evitar bloqueios de CORS/mixed content
      if (useCustomUrl && (customUrl.startsWith('http://') || customUrl.startsWith('https://'))) {
        res = await fetch('/api/proxy-craft', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            targetUrl: customUrl,
            payload: parsed,
          }),
        });
      } else {
        res = await fetch(activeUrl, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(parsed),
        });
      }

      const endTime = performance.now();
      setLatency(Math.round(endTime - startTime));
      setHttpStatus(res.status);

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || `Erro HTTP ${res.status}`);
      }

      setJsonResponse(JSON.stringify(data, null, 2));
    } catch (err: any) {
      const endTime = performance.now();
      setLatency(Math.round(endTime - startTime));
      setErrorMsg(err.message || 'Erro ao chamar a API');
    } finally {
      setIsLoading(false);
    }
  };

  const copyToClipboard = (text: string, type: 'response' | 'curl') => {
    navigator.clipboard.writeText(text);
    if (type === 'response') {
      setCopiedResponse(true);
      setTimeout(() => setCopiedResponse(false), 2000);
    } else {
      setCopiedCurl(true);
      setTimeout(() => setCopiedCurl(false), 2000);
    }
  };

  const curlCommand = `curl -X POST ${activeUrl.startsWith('/') ? 'http://localhost:3000' + activeUrl : activeUrl} \\
  -H "Content-Type: application/json" \\
  -d '${jsonInput.replace(/'/g, "'\\''")}'`;

  return (
    <div className="space-y-6">
      {/* Target Backend Selector */}
      <div className="bg-slate-900/90 rounded-2xl p-5 border border-slate-800 shadow-xl space-y-3">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <Server className="w-4 h-4 text-amber-400" />
            <h3 className="text-sm font-bold text-slate-200">
              Destino da Requisição (Onde o cálculo é executado)
            </h3>
          </div>
          <div className="flex items-center gap-2 text-xs">
            <button
              onClick={() => setUseCustomUrl(false)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-medium transition-colors ${
                !useCustomUrl
                  ? 'bg-amber-500 text-slate-950 font-bold'
                  : 'bg-slate-800 text-slate-400 hover:text-slate-200'
              }`}
            >
              <CheckCircle2 className="w-3.5 h-3.5" />
              API Embutida (/calculaViabilidadePorRecurso)
            </button>

            <button
              onClick={() => setUseCustomUrl(true)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-medium transition-colors ${
                useCustomUrl
                  ? 'bg-cyan-500 text-slate-950 font-bold'
                  : 'bg-slate-800 text-slate-400 hover:text-slate-200'
              }`}
            >
              <Globe className="w-3.5 h-3.5" />
              Meu Backend Spring Boot Local (porta 8080)
            </button>
          </div>
        </div>

        {useCustomUrl && (
          <div className="flex items-center gap-2 pt-2 border-t border-slate-800">
            <span className="text-xs text-slate-400 font-mono">URL:</span>
            <input
              type="text"
              value={customUrl}
              onChange={(e) => setCustomUrl(e.target.value)}
              className="flex-1 bg-slate-950 border border-slate-700 rounded-lg px-3 py-1.5 text-xs font-mono text-cyan-300 focus:outline-none focus:border-cyan-500"
              placeholder="http://localhost:8080/calculaViabilidadePorRecurso"
            />
            <span className="text-[11px] text-slate-400">
              (Roteado com proxy automático para evitar erros de CORS)
            </span>
          </div>
        )}
      </div>

      <div className="bg-slate-900/90 rounded-2xl p-6 border border-slate-800 shadow-xl space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-800/80 pb-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="px-2 py-0.5 rounded text-xs font-black bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                POST
              </span>
              <span className="font-mono text-sm font-bold text-slate-100">
                {activeUrl}
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-1">
              Testador em tempo real 100% compatível com seu DTO de Request e Response.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={syncFromCurrent}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs text-slate-200 transition-colors border border-slate-700"
            >
              <Sparkles className="w-3.5 h-3.5 text-amber-400" />
              Sincronizar com a Calculadora
            </button>
            <button
              onClick={handleExecuteApi}
              disabled={isLoading}
              className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-gradient-to-r from-cyan-500 to-cyan-600 hover:from-cyan-400 hover:to-cyan-500 text-slate-950 font-bold text-xs shadow-lg shadow-cyan-500/20 active:scale-95 transition-all cursor-pointer"
            >
              <Send className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} />
              {isLoading ? 'Executando...' : 'Enviar Request'}
            </button>
          </div>
        </div>

        {/* 2 Panes: Request JSON and Response JSON */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {/* Request Pane */}
          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs text-slate-300 font-semibold">
              <span className="flex items-center gap-1.5">
                <Terminal className="w-3.5 h-3.5 text-cyan-400" />
                CraftRequestDto (JSON Body)
              </span>
              <span className="text-[10px] text-slate-500 font-mono">application/json</span>
            </div>
            <textarea
              value={jsonInput}
              onChange={(e) => setJsonInput(e.target.value)}
              rows={14}
              className="w-full bg-slate-950 font-mono text-xs text-cyan-300 p-4 rounded-xl border border-slate-800 focus:outline-none focus:border-cyan-500 leading-relaxed"
              spellCheck={false}
            />
          </div>

          {/* Response Pane */}
          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs text-slate-300 font-semibold">
              <span className="flex items-center gap-1.5">
                <Terminal className="w-3.5 h-3.5 text-emerald-400" />
                CraftResponseDto (Resposta da API)
              </span>
              <div className="flex items-center gap-2">
                {httpStatus && (
                  <span
                    className={`text-[10px] px-2 py-0.5 rounded font-mono font-bold ${
                      httpStatus === 200
                        ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                        : 'bg-rose-500/20 text-rose-400'
                    }`}
                  >
                    HTTP {httpStatus} {latency !== null ? `(${latency}ms)` : ''}
                  </span>
                )}
                {jsonResponse && (
                  <button
                    onClick={() => copyToClipboard(jsonResponse, 'response')}
                    className="flex items-center gap-1 text-[11px] text-slate-400 hover:text-slate-100 bg-slate-800/80 px-2 py-1 rounded border border-slate-700 transition-colors"
                  >
                    {copiedResponse ? (
                      <>
                        <Check className="w-3 h-3 text-emerald-400" />
                        Copiado!
                      </>
                    ) : (
                      <>
                        <Copy className="w-3 h-3" />
                        Copiar
                      </>
                    )}
                  </button>
                )}
              </div>
            </div>

            <div className="w-full bg-slate-950 font-mono text-xs p-4 rounded-xl border border-slate-800 h-[280px] overflow-auto leading-relaxed relative">
              {errorMsg ? (
                <div className="text-rose-400 flex items-start gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                  <div>
                    <div className="font-bold">Erro na requisição:</div>
                    <div className="text-xs mt-1 text-rose-300 leading-relaxed">{errorMsg}</div>
                    {useCustomUrl && (
                      <p className="text-[11px] text-slate-400 mt-2">
                        Dica: Certifique-se de que sua aplicação Spring Boot está rodando localmente (ex: no IntelliJ executando <code className="text-amber-400">ApiApplication</code> na porta 8080).
                      </p>
                    )}
                  </div>
                </div>
              ) : jsonResponse ? (
                <pre className="text-emerald-300">{jsonResponse}</pre>
              ) : (
                <div className="text-slate-600 italic h-full flex items-center justify-center">
                  Clique em &quot;Enviar Request&quot; para executar a chamada HTTP POST.
                </div>
              )}
            </div>
          </div>
        </div>

        {/* cURL Snippet */}
        <div className="mt-4 pt-4 border-t border-slate-800/80 space-y-2">
          <div className="flex items-center justify-between text-xs text-slate-400 font-semibold">
            <span>Comando cURL (para testar no terminal ou Postman / Insomnia):</span>
            <button
              onClick={() => copyToClipboard(curlCommand, 'curl')}
              className="flex items-center gap-1 text-[11px] text-slate-400 hover:text-slate-100 bg-slate-800/80 px-2.5 py-1 rounded border border-slate-700 transition-colors"
            >
              {copiedCurl ? (
                <>
                  <Check className="w-3 h-3 text-emerald-400" />
                  cURL Copiado!
                </>
              ) : (
                <>
                  <Copy className="w-3 h-3" />
                  Copiar cURL
                </>
              )}
            </button>
          </div>
          <pre className="bg-slate-950 p-3 rounded-lg text-[11px] font-mono text-slate-400 overflow-x-auto border border-slate-850">
            {curlCommand}
          </pre>
        </div>
      </div>
    </div>
  );
};
