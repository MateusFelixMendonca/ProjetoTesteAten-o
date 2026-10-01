import React, { useState } from 'react';
import { GrupoTeste, DispositivoData, generateUUID } from '../types';
import { Play, Shield, Smartphone, Eye, Sparkles, CheckCircle2, Sliders } from 'lucide-react';

interface WelcomeScreenProps {
  onStart: (grupo: GrupoTeste, dispositivo: DispositivoData, sessionId: string) => void;
  onOpenDashboard: () => void;
}

export const WelcomeScreen: React.FC<WelcomeScreenProps> = ({ onStart, onOpenDashboard }) => {
  // Randomly assign group A or B by default for true A/B testing
  const [grupo, setGrupo] = useState<GrupoTeste>(() => Math.random() > 0.5 ? 'EXPERIMENTAL_VIDEOS_CURTOS' : 'CONTROLE_TEXTO_LINEAR');
  const [consentGiven, setConsentGiven] = useState(true);

  const handleStart = () => {
    if (!consentGiven) return;
    const sessionId = generateUUID();
    const dispositivo: DispositivoData = {
      user_agent: navigator.userAgent,
      screen_width: window.innerWidth,
      screen_height: window.innerHeight,
    };
    onStart(grupo, dispositivo, sessionId);
  };

  return (
    <div className="w-full max-w-md mx-auto flex flex-col justify-between min-h-[calc(100vh-5rem)] p-4 space-y-6">
      {/* Header Banner */}
      <div className="space-y-3 text-center">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-950/80 border border-cyan-800 text-cyan-400 text-xs font-medium">
          <Sparkles className="w-3.5 h-3.5" />
          <span>Pesquisa Científica &bull; Atenção Sustentada</span>
        </div>

        <h1 className="text-2xl font-black tracking-tight text-white sm:text-3xl bg-gradient-to-r from-cyan-400 via-teal-300 to-indigo-400 bg-clip-text text-transparent">
          Quantização do Foco Cognitivo
        </h1>

        <p className="text-slate-300 text-sm leading-relaxed px-2">
          Estudo comparativo de atenção e impulsividade entre estímulos de vídeos curtos vs. leitura linear acadêmica.
        </p>
      </div>

      {/* Group Selector / Info Card */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5 space-y-4 shadow-xl backdrop-blur-md">
        <div className="flex items-center justify-between border-b border-slate-800/80 pb-3">
          <div className="flex items-center gap-2 text-xs font-semibold text-slate-400 uppercase tracking-wider">
            <Sliders className="w-4 h-4 text-cyan-400" />
            <span>Condição Experimental</span>
          </div>
          <button
            onClick={() => setGrupo(g => g === 'EXPERIMENTAL_VIDEOS_CURTOS' ? 'CONTROLE_TEXTO_LINEAR' : 'EXPERIMENTAL_VIDEOS_CURTOS')}
            className="text-xs text-cyan-400 hover:text-cyan-300 underline underline-offset-2 transition-colors"
          >
            Alternar Grupo
          </button>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <button
            type="button"
            onClick={() => setGrupo('EXPERIMENTAL_VIDEOS_CURTOS')}
            className={`p-3.5 rounded-xl border text-left transition-all flex flex-col justify-between ${
              grupo === 'EXPERIMENTAL_VIDEOS_CURTOS'
                ? 'bg-gradient-to-b from-purple-950/70 to-purple-900/40 border-purple-500 shadow-lg shadow-purple-950/50 text-white'
                : 'bg-slate-950/40 border-slate-800 text-slate-400 hover:border-slate-700'
            }`}
          >
            <span className="text-[10px] font-mono tracking-wider text-purple-400 uppercase">Grupo A</span>
            <div className="mt-2 font-bold text-sm text-purple-200">Vídeos Curtos</div>
            <p className="text-[11px] text-purple-300/70 mt-1">Feed dinâmico estilo Reels/TikTok</p>
          </button>

          <button
            type="button"
            onClick={() => setGrupo('CONTROLE_TEXTO_LINEAR')}
            className={`p-3.5 rounded-xl border text-left transition-all flex flex-col justify-between ${
              grupo === 'CONTROLE_TEXTO_LINEAR'
                ? 'bg-gradient-to-b from-emerald-950/70 to-emerald-900/40 border-emerald-500 shadow-lg shadow-emerald-950/50 text-white'
                : 'bg-slate-950/40 border-slate-800 text-slate-400 hover:border-slate-700'
            }`}
          >
            <span className="text-[10px] font-mono tracking-wider text-emerald-400 uppercase">Grupo B</span>
            <div className="mt-2 font-bold text-sm text-emerald-200">Leitura Linear</div>
            <p className="text-[11px] text-emerald-300/70 mt-1">Texto contínuo de artigo científico</p>
          </button>
        </div>

        {/* Experiment Steps */}
        <div className="space-y-2 pt-2 border-t border-slate-800/80">
          <div className="text-xs font-semibold text-slate-400 mb-2">Etapas da Experiência (~5 min total):</div>
          <div className="flex items-center gap-3 text-xs text-slate-300">
            <span className="w-5 h-5 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center font-mono text-[10px] text-cyan-400">1</span>
            <span>Estímulo de Mídia (3 min)</span>
          </div>
          <div className="flex items-center gap-3 text-xs text-slate-300">
            <span className="w-5 h-5 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center font-mono text-[10px] text-cyan-400">2</span>
            <span>Permissão de Câmera (Biometria MediaPipe local)</span>
          </div>
          <div className="flex items-center gap-3 text-xs text-slate-300">
            <span className="w-5 h-5 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center font-mono text-[10px] text-cyan-400">3</span>
            <span>Teste Cognitivo de Atenção CPT (2 min)</span>
          </div>
        </div>

        {/* Privacy Note */}
        <div className="p-3 bg-cyan-950/40 border border-cyan-900/60 rounded-xl flex items-start gap-2.5 text-xs text-cyan-300">
          <Shield className="w-4 h-4 text-cyan-400 shrink-0 mt-0.5" />
          <p className="leading-snug">
            <strong>Privacidade Garantida:</strong> Nenhum vídeo é enviado a servidores. Todo o processamento facial (EAR/piscadas) ocorre em tempo real no seu próprio smartphone.
          </p>
        </div>
      </div>

      {/* Consent & Start Action */}
      <div className="space-y-4">
        <label className="flex items-center gap-3 text-xs text-slate-300 cursor-pointer px-1">
          <input
            type="checkbox"
            checked={consentGiven}
            onChange={(e) => setConsentGiven(e.target.checked)}
            className="w-4 h-4 rounded border-slate-700 bg-slate-900 text-cyan-500 focus:ring-cyan-500 focus:ring-offset-slate-950"
          />
          <span>Concordo voluntariamente em participar deste teste acadêmico anônimo.</span>
        </label>

        <button
          onClick={handleStart}
          disabled={!consentGiven}
          className={`w-full py-4 px-6 rounded-xl font-bold text-base flex items-center justify-center gap-3 transition-all shadow-lg ${
            consentGiven
              ? 'bg-gradient-to-r from-cyan-500 to-teal-400 text-slate-950 hover:brightness-110 active:scale-[0.98] shadow-cyan-500/25'
              : 'bg-slate-800 text-slate-500 cursor-not-allowed'
          }`}
        >
          <Play className="w-5 h-5 fill-current" />
          <span>Iniciar Experimento</span>
        </button>

        <div className="text-center pt-1">
          <button
            onClick={onOpenDashboard}
            className="text-xs text-slate-400 hover:text-slate-200 transition-colors"
          >
            📊 Ver Painel de Dados Coletados (Pesquisador)
          </button>
        </div>
      </div>
    </div>
  );
};
