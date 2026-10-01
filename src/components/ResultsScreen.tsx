import React from 'react';
import { SessionPayload } from '../types';
import { CheckCircle2, CloudUpload, Clock, AlertTriangle, Eye, Zap, RefreshCw, BarChart2, Check, Copy } from 'lucide-react';

interface ResultsScreenProps {
  payload: SessionPayload;
  uploadStatus: { success: boolean; error?: any };
  onRestart: () => void;
  onOpenDashboard: () => void;
}

export const ResultsScreen: React.FC<ResultsScreenProps> = ({
  payload,
  uploadStatus,
  onRestart,
  onOpenDashboard
}) => {
  const isVideoGroup = payload.grupo_teste === 'EXPERIMENTAL_VIDEOS_CURTOS';

  const [copied, setCopied] = React.useState(false);

  const copyJsonPayload = () => {
    navigator.clipboard.writeText(JSON.stringify(payload, null, 2));
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="w-full max-w-md mx-auto flex flex-col justify-between min-h-[calc(100vh-5rem)] p-4 space-y-5">
      {/* Thank you Banner */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5 text-center space-y-3 shadow-xl backdrop-blur-md">
        <div className="w-12 h-12 rounded-full bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center mx-auto text-emerald-400">
          <CheckCircle2 className="w-7 h-7" />
        </div>

        <h1 className="text-xl font-extrabold text-white">Sessão Concluída!</h1>
        <p className="text-xs text-slate-300">
          Obrigado por participar. Seus dados comportamentais e biométricos foram processados anonimamente.
        </p>

        {/* Sync Status Badge */}
        <div className={`p-3 rounded-xl border text-xs flex items-center justify-between ${
          uploadStatus.success
            ? 'bg-emerald-950/40 border-emerald-800/60 text-emerald-300'
            : 'bg-amber-950/40 border-amber-800/60 text-amber-300'
        }`}>
          <div className="flex items-center gap-2">
            <CloudUpload className="w-4 h-4 text-emerald-400" />
            <span>{uploadStatus.success ? 'Dados enviados ao Supabase!' : 'Armazenado no dispositivo (Offline)'}</span>
          </div>
          <span className="font-mono text-[10px] bg-slate-950 px-2 py-0.5 rounded text-slate-400 border border-slate-800">
            {payload.session_id.slice(0, 8)}...
          </span>
        </div>
      </div>

      {/* Behavioral Metrics Card */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5 space-y-4 shadow-xl">
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <div className="flex items-center gap-2 text-xs font-bold text-slate-300 uppercase tracking-wider">
            <Zap className="w-4 h-4 text-rose-400" />
            <span>Métricas Comportamentais (CPT)</span>
          </div>
          <span className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded border ${
            isVideoGroup ? 'bg-purple-950 text-purple-300 border-purple-800' : 'bg-emerald-950 text-emerald-300 border-emerald-800'
          }`}>
            {isVideoGroup ? 'Grupo A: Vídeos' : 'Grupo B: Leitura'}
          </span>
        </div>

        <div className="grid grid-cols-2 gap-3 text-center">
          <div className="p-3 bg-slate-950 rounded-xl border border-slate-800">
            <div className="text-[10px] text-slate-400 uppercase font-mono">Tempo Reação Médio</div>
            <div className="text-lg font-bold font-mono text-cyan-300 mt-1">
              {payload.metricas_comportamentais.tempo_medio_reacao_ms} ms
            </div>
          </div>

          <div className="p-3 bg-slate-950 rounded-xl border border-slate-800">
            <div className="text-[10px] text-slate-400 uppercase font-mono">Degradação (Min 3 vs 1)</div>
            <div className="text-lg font-bold font-mono text-amber-300 mt-1">
              +{payload.metricas_comportamentais.degradacao_tempo_reacao_min3_vs_min1_percent}%
            </div>
          </div>

          <div className="p-3 bg-slate-950 rounded-xl border border-slate-800">
            <div className="text-[10px] text-slate-400 uppercase font-mono">Impulsividade (Comissão)</div>
            <div className="text-lg font-bold font-mono text-rose-400 mt-1">
              {payload.metricas_comportamentais.erros_comissao_impulsividade}
            </div>
          </div>

          <div className="p-3 bg-slate-950 rounded-xl border border-slate-800">
            <div className="text-[10px] text-slate-400 uppercase font-mono">Perda Foco (Omissão)</div>
            <div className="text-lg font-bold font-mono text-indigo-300 mt-1">
              {payload.metricas_comportamentais.erros_omissao}
            </div>
          </div>
        </div>
      </div>

      {/* Biometric Metrics Card */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5 space-y-4 shadow-xl">
        <div className="flex items-center gap-2 text-xs font-bold text-slate-300 uppercase tracking-wider border-b border-slate-800 pb-3">
          <Eye className="w-4 h-4 text-cyan-400" />
          <span>Biometria Facial (MediaPipe Edge AI)</span>
        </div>

        <div className="grid grid-cols-2 gap-3 text-center">
          <div className="p-3 bg-slate-950 rounded-xl border border-slate-800">
            <div className="text-[10px] text-slate-400 uppercase font-mono">Taxa Piscadas / min</div>
            <div className="text-lg font-bold font-mono text-emerald-300 mt-1">
              {payload.metricas_biometricas.taxa_piscadas_por_minuto}
            </div>
          </div>

          <div className="p-3 bg-slate-950 rounded-xl border border-slate-800">
            <div className="text-[10px] text-slate-400 uppercase font-mono">Piscadas por Fadiga</div>
            <div className="text-lg font-bold font-mono text-purple-300 mt-1">
              {payload.metricas_biometricas.piscadas_fadiga_longa_count}
            </div>
          </div>
        </div>
      </div>

      {/* Actions */}
      <div className="space-y-3 pt-2">
        <button
          onClick={copyJsonPayload}
          className="w-full py-2.5 px-4 bg-slate-900 hover:bg-slate-800 text-slate-300 font-mono text-xs rounded-xl border border-slate-800 flex items-center justify-center gap-2 transition-all"
        >
          {copied ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4 text-slate-400" />}
          <span>{copied ? 'Payload JSON Copiado!' : 'Copiar JSON Payload Completo'}</span>
        </button>

        <button
          onClick={onOpenDashboard}
          className="w-full py-3.5 px-6 bg-gradient-to-r from-cyan-500 to-indigo-500 text-slate-950 font-bold text-sm rounded-xl flex items-center justify-center gap-2 shadow-lg shadow-cyan-500/20 hover:brightness-110 active:scale-95 transition-all"
        >
          <BarChart2 className="w-4 h-4" />
          <span>Abrir Dashboard de Pesquisa (CSV)</span>
        </button>

        <button
          onClick={onRestart}
          className="w-full py-3 px-6 bg-slate-800 hover:bg-slate-700 text-white font-medium text-xs rounded-xl flex items-center justify-center gap-2 transition-all"
        >
          <RefreshCw className="w-3.5 h-3.5 text-slate-400" />
          <span>Novo Participante</span>
        </button>
      </div>
    </div>
  );
};
