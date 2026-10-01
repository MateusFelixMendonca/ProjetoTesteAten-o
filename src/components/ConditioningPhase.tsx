import React, { useState, useEffect } from 'react';
import { GrupoTeste } from '../types';
import { VideoFeed } from './VideoFeed';
import { TextReader } from './TextReader';
import { Timer, ArrowRight, Zap } from 'lucide-react';

interface ConditioningPhaseProps {
  grupo: GrupoTeste;
  onComplete: () => void;
}

export const ConditioningPhase: React.FC<ConditioningPhaseProps> = ({ grupo, onComplete }) => {
  // Default conditioning time: 180 seconds (3 min), with a fast test mode button (15s) for instant research testing
  const [timeLeft, setTimeLeft] = useState(180);
  const [fastMode, setFastMode] = useState(false);

  useEffect(() => {
    if (timeLeft <= 0) {
      onComplete();
      return;
    }
    const timer = setInterval(() => {
      setTimeLeft((prev) => prev - 1);
    }, 1000);
    return () => clearInterval(timer);
  }, [timeLeft, onComplete]);

  const handleFastForward = () => {
    setFastMode(true);
    setTimeLeft(5);
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };

  const isVideo = grupo === 'EXPERIMENTAL_VIDEOS_CURTOS';

  return (
    <div className="w-full max-w-md mx-auto flex flex-col justify-between min-h-[calc(100vh-5rem)] p-4 space-y-4">
      {/* Top Phase Header & Timer */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-4 flex items-center justify-between shadow-lg">
        <div>
          <div className="text-[10px] font-mono text-cyan-400 uppercase tracking-widest font-semibold">
            Fase 1: Condicionamento ({isVideo ? 'Grupo A - Vídeos' : 'Grupo B - Texto'})
          </div>
          <div className="text-xs text-slate-400 mt-0.5">
            {isVideo ? 'Exposição a estímulos de rápida alternância' : 'Leitura contínua com foco linear'}
          </div>
        </div>

        <div className="flex items-center gap-2 px-3 py-1.5 bg-slate-950 border border-slate-700 rounded-xl">
          <Timer className="w-4 h-4 text-cyan-400 animate-pulse" />
          <span className="font-mono font-bold text-sm text-cyan-300">{formatTime(timeLeft)}</span>
        </div>
      </div>

      {/* Main Content Component */}
      <div className="flex-1 flex items-center justify-center">
        {isVideo ? <VideoFeed /> : <TextReader />}
      </div>

      {/* Footer Controls & Quick Test Mode */}
      <div className="flex items-center justify-between gap-3 pt-2">
        <button
          onClick={handleFastForward}
          className="text-xs text-slate-400 hover:text-cyan-400 flex items-center gap-1 bg-slate-900 px-3 py-2 rounded-xl border border-slate-800 transition-all"
          title="Avançar rapidamente para acelerar testes"
        >
          <Zap className="w-3.5 h-3.5 text-amber-400" />
          <span>{fastMode ? 'Acelerado (5s)' : 'Acelerar Teste (Modo Demo)'}</span>
        </button>

        <button
          onClick={onComplete}
          className="py-2.5 px-4 bg-cyan-600 hover:bg-cyan-500 text-slate-950 font-bold text-xs rounded-xl flex items-center gap-2 transition-all shadow-md active:scale-95"
        >
          <span>Ir para Fase 2</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};
