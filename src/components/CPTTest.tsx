import React, { useState, useEffect, useRef, useCallback } from 'react';
import { MetricasComportamentais, MetricasBiometricas } from '../types';
import { useFaceTracker } from '../hooks/useFaceTracker';
import { Eye, ShieldAlert, Target, Zap, Activity, Camera } from 'lucide-react';

interface CPTTestProps {
  onComplete: (behavioral: MetricasComportamentais, biometric: MetricasBiometricas) => void;
}

interface StimulusTrial {
  symbol: string;
  isTarget: boolean;
  startTime: number;
}

const TARGET_SYMBOL = 'X';
const NON_TARGET_SYMBOLS = ['O', 'A', 'B', 'M', 'K', 'Z'];

export const CPTTest: React.FC<CPTTestProps> = ({ onComplete }) => {
  const [testStarted, setTestStarted] = useState(false);
  const [currentSymbol, setCurrentSymbol] = useState<string | null>(null);
  const [isTargetActive, setIsTargetActive] = useState(false);
  const [feedback, setFeedback] = useState<'HIT' | 'MISS' | 'COMMISSION' | null>(null);
  const [trialIndex, setTrialIndex] = useState(0);

  // Hook for MediaPipe biometric face tracking
  const { videoRef, cameraActive, earValue, isGazeDeviated, getMetrics } = useFaceTracker(testStarted);

  // Reaction time and error tracking
  const reactionTimesMinute1Ref = useRef<number[]>([]);
  const reactionTimesMinute3Ref = useRef<number[]>([]);

  const totalTargetsRef = useRef(0);
  const totalHitsRef = useRef(0);
  const omissionErrorsRef = useRef(0);
  const commissionErrorsRef = useRef(0);

  const trialStartTimeRef = useRef<number>(0);
  const hasRespondedThisTrialRef = useRef<boolean>(false);
  const currentTrialIsTargetRef = useRef<boolean>(false);
  const testStartTimeRef = useRef<number>(0);

  const TOTAL_TRIALS = 35; // Total trials for full test
  const DISPLAY_DURATION_MS = 600; // Stimulus visible for 600ms
  const ISI_DURATION_MS = 1200; // Inter-stimulus interval 1200ms

  // Generate next trial
  const runNextTrial = useCallback((index: number) => {
    if (index >= TOTAL_TRIALS) {
      // Test finished - calculate final statistics
      const allRts = [...reactionTimesMinute1Ref.current, ...reactionTimesMinute3Ref.current];
      const avgRt = allRts.length > 0
        ? parseFloat((allRts.reduce((a, b) => a + b, 0) / allRts.length).toFixed(1))
        : 350;

      const avgMin1 = reactionTimesMinute1Ref.current.length > 0
        ? reactionTimesMinute1Ref.current.reduce((a, b) => a + b, 0) / reactionTimesMinute1Ref.current.length
        : avgRt;

      const avgMin3 = reactionTimesMinute3Ref.current.length > 0
        ? reactionTimesMinute3Ref.current.reduce((a, b) => a + b, 0) / reactionTimesMinute3Ref.current.length
        : avgRt;

      const degradationPercent = avgMin1 > 0
        ? parseFloat((((avgMin3 - avgMin1) / avgMin1) * 100).toFixed(1))
        : 0;

      const behavioral: MetricasComportamentais = {
        total_estimulos_alvo: totalTargetsRef.current,
        total_acertos: totalHitsRef.current,
        erros_omissao: omissionErrorsRef.current,
        erros_comissao_impulsividade: commissionErrorsRef.current,
        tempo_medio_reacao_ms: avgRt,
        degradacao_tempo_reacao_min3_vs_min1_percent: Math.max(0, degradationPercent)
      };

      const biometric = getMetrics();
      onComplete(behavioral, biometric);
      return;
    }

    setTrialIndex(index + 1);
    hasRespondedThisTrialRef.current = false;
    setFeedback(null);

    // 30% chance of Target 'X', 70% chance of Non-Target
    const isTarget = Math.random() < 0.35;
    const symbol = isTarget
      ? TARGET_SYMBOL
      : NON_TARGET_SYMBOLS[Math.floor(Math.random() * NON_TARGET_SYMBOLS.length)];

    currentTrialIsTargetRef.current = isTarget;
    if (isTarget) totalTargetsRef.current += 1;

    setCurrentSymbol(symbol);
    setIsTargetActive(true);
    trialStartTimeRef.current = performance.now();

    // Hide stimulus after DISPLAY_DURATION_MS
    setTimeout(() => {
      setIsTargetActive(false);

      // Check for Omission error when stimulus disappears without response
      setTimeout(() => {
        if (currentTrialIsTargetRef.current && !hasRespondedThisTrialRef.current) {
          omissionErrorsRef.current += 1;
          setFeedback('MISS');
        }
        // Proceed to next trial after ISI
        setTimeout(() => runNextTrial(index + 1), 300);
      }, ISI_DURATION_MS - DISPLAY_DURATION_MS);
    }, DISPLAY_DURATION_MS);
  }, [getMetrics, onComplete]);

  const startTest = () => {
    setTestStarted(true);
    testStartTimeRef.current = performance.now();
    runNextTrial(0);
  };

  // High-precision pointerdown event handler for touch/click
  const handlePointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!testStarted || hasRespondedThisTrialRef.current || !currentSymbol) return;

    hasRespondedThisTrialRef.current = true;
    const rt = performance.now() - trialStartTimeRef.current;
    const elapsedTimeSec = (performance.now() - testStartTimeRef.current) / 1000;

    if (currentTrialIsTargetRef.current) {
      // HIT - Correct response to Target
      totalHitsRef.current += 1;
      setFeedback('HIT');

      if (elapsedTimeSec < 60) {
        reactionTimesMinute1Ref.current.push(rt);
      } else {
        reactionTimesMinute3Ref.current.push(rt);
      }
    } else {
      // COMMISSION ERROR - Impulsive response to non-target
      commissionErrorsRef.current += 1;
      setFeedback('COMMISSION');
    }
  };

  return (
    <div className="w-full max-w-md mx-auto flex flex-col justify-between min-h-[calc(100vh-5rem)] p-4 space-y-4 select-none">
      {/* Hidden camera video element for MediaPipe processing */}
      <video ref={videoRef} className="hidden" playsInline muted />

      {/* Header bar with Biometric Monitor */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-4 flex items-center justify-between shadow-lg">
        <div>
          <div className="text-[10px] font-mono text-cyan-400 uppercase tracking-widest font-semibold flex items-center gap-1.5">
            <Target className="w-3.5 h-3.5 text-rose-500 animate-pulse" />
            <span>Fase 2: Teste CPT de Atenção Sustentada</span>
          </div>
          <div className="text-xs text-slate-400 mt-0.5">
            {testStarted ? `Estímulo ${trialIndex} de ${TOTAL_TRIALS}` : 'Aguardando Início do Teste'}
          </div>
        </div>

        {/* Biometric Status Badge */}
        <div className={`px-2.5 py-1.5 rounded-xl border text-[11px] font-mono flex items-center gap-1.5 ${
          cameraActive
            ? 'bg-emerald-950/60 border-emerald-700/60 text-emerald-400'
            : 'bg-amber-950/60 border-amber-700/60 text-amber-300'
        }`}>
          <Camera className="w-3.5 h-3.5" />
          <span>{cameraActive ? 'MediaPipe ON' : 'Biometria Ativa'}</span>
        </div>
      </div>

      {/* Main CPT Canvas & Touch Zone */}
      {!testStarted ? (
        <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-6 space-y-5 text-center shadow-xl my-auto">
          <div className="w-16 h-16 rounded-full bg-rose-500/10 border border-rose-500/30 flex items-center justify-center mx-auto text-rose-400 shadow-inner">
            <Target className="w-8 h-8" />
          </div>

          <div className="space-y-2">
            <h2 className="text-xl font-bold text-white">Instruções do CPT</h2>
            <p className="text-sm text-slate-300 leading-relaxed">
              Letras aparecerão rapidamente na tela uma de cada vez.
            </p>
          </div>

          <div className="p-4 bg-slate-950 rounded-xl border border-slate-800 space-y-3 text-left">
            <div className="flex items-center gap-3 text-xs text-emerald-400">
              <span className="w-8 h-8 rounded-lg bg-rose-500/20 border border-rose-500/40 flex items-center justify-center font-bold text-lg text-rose-400">X</span>
              <span><strong>ALVO (Toque o mais RÁPIDO possível!):</strong> Toque na tela quando vir a letra <strong>X</strong>.</span>
            </div>
            <div className="flex items-center gap-3 text-xs text-slate-400 pt-2 border-t border-slate-800">
              <span className="w-8 h-8 rounded-lg bg-slate-800 border border-slate-700 flex items-center justify-center font-bold text-lg text-slate-300">O</span>
              <span><strong>NÃO-ALVO (NÃO toque!):</strong> Se vir qualquer outra letra (O, A, B, Z...), <strong>NÃO TOQUE</strong>.</span>
            </div>
          </div>

          <button
            onClick={startTest}
            className="w-full py-4 bg-gradient-to-r from-rose-500 to-pink-600 hover:from-rose-400 hover:to-pink-500 text-white font-bold text-base rounded-xl transition-all shadow-lg shadow-rose-500/25 active:scale-95 flex items-center justify-center gap-2"
          >
            <Zap className="w-5 h-5 fill-current" />
            <span>Começar Teste CPT</span>
          </button>
        </div>
      ) : (
        <div
          onPointerDown={handlePointerDown}
          className="relative flex-1 min-h-[400px] bg-slate-950 border-2 border-slate-800 rounded-2xl flex flex-col items-center justify-center shadow-inner cursor-pointer overflow-hidden touch-none active:bg-slate-900/50 transition-colors"
        >
          {/* Top Realtime Biometric Telemetry overlay */}
          <div className="absolute top-4 left-4 right-4 flex items-center justify-between pointer-events-none text-[11px] font-mono text-slate-400 bg-slate-900/80 px-3 py-1.5 rounded-xl border border-slate-800 backdrop-blur-md">
            <div className="flex items-center gap-2">
              <Eye className="w-3.5 h-3.5 text-cyan-400" />
              <span>EAR: <strong className="text-cyan-300">{earValue.toFixed(2)}</strong></span>
            </div>
            {isGazeDeviated && (
              <div className="flex items-center gap-1 text-amber-400 animate-pulse">
                <ShieldAlert className="w-3.5 h-3.5" />
                <span>Desvio de Olhar!</span>
              </div>
            )}
            <div>
              <span>Progresso: <strong className="text-white">{trialIndex}/{TOTAL_TRIALS}</strong></span>
            </div>
          </div>

          {/* Stimulus Render */}
          <div className="flex flex-col items-center justify-center">
            {isTargetActive && currentSymbol ? (
              <span className={`text-8xl font-black font-mono tracking-wider transition-transform scale-110 ${
                currentSymbol === TARGET_SYMBOL ? 'text-rose-400 drop-shadow-[0_0_25px_rgba(244,63,94,0.6)]' : 'text-slate-200'
              }`}>
                {currentSymbol}
              </span>
            ) : (
              <div className="w-4 h-4 rounded-full bg-slate-800 animate-ping" />
            )}
          </div>

          {/* Immediate Touch Feedback */}
          {feedback && (
            <div className={`absolute bottom-6 px-4 py-1.5 rounded-full text-xs font-bold font-mono tracking-wider animate-bounce ${
              feedback === 'HIT'
                ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/50'
                : feedback === 'COMMISSION'
                ? 'bg-rose-500/20 text-rose-400 border border-rose-500/50'
                : 'bg-amber-500/20 text-amber-400 border border-amber-500/50'
            }`}>
              {feedback === 'HIT' ? '✓ ACERTO (Rápido!)' : feedback === 'COMMISSION' ? '✕ ERRO DE COMISSÃO (Impulsivo!)' : '⚠ ERRO DE OMISSÃO (Perdeu Alvo)'}
            </div>
          )}

          {/* Touch instruction overlay at bottom */}
          <div className="absolute bottom-2 text-[10px] text-slate-600 font-mono pointer-events-none">
            Toque em qualquer lugar da tela ao ver X
          </div>
        </div>
      )}
    </div>
  );
};
