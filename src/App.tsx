import React, { useState } from 'react';
import { AppStage, GrupoTeste, DispositivoData, SessionPayload, MetricasComportamentais, MetricasBiometricas } from './types';
import { WelcomeScreen } from './components/WelcomeScreen';
import { ConditioningPhase } from './components/ConditioningPhase';
import { CPTTest } from './components/CPTTest';
import { ResultsScreen } from './components/ResultsScreen';
import { ResearcherDashboard } from './components/ResearcherDashboard';
import { saveSessionPayload } from './services/supabase';

export default function App() {
  const [stage, setStage] = useState<AppStage>('WELCOME');
  const [grupo, setGrupo] = useState<GrupoTeste>('EXPERIMENTAL_VIDEOS_CURTOS');
  const [dispositivo, setDispositivo] = useState<DispositivoData | null>(null);
  const [sessionId, setSessionId] = useState<string>('');
  const [lastPayload, setLastPayload] = useState<SessionPayload | null>(null);
  const [uploadStatus, setUploadStatus] = useState<{ success: boolean; error?: any }>({ success: true });

  const handleStartExperiment = (selectedGrupo: GrupoTeste, deviceData: DispositivoData, newSessionId: string) => {
    setGrupo(selectedGrupo);
    setDispositivo(deviceData);
    setSessionId(newSessionId);
    setStage('CONDITIONING');
  };

  const handleConditioningComplete = () => {
    setStage('CPT_TEST');
  };

  const handleCPTComplete = async (behavioral: MetricasComportamentais, biometric: MetricasBiometricas) => {
    const payload: SessionPayload = {
      session_id: sessionId || crypto.randomUUID(),
      created_at: new Date().toISOString(),
      grupo_teste: grupo,
      dispositivo: dispositivo || {
        user_agent: navigator.userAgent,
        screen_width: window.innerWidth,
        screen_height: window.innerHeight
      },
      metricas_comportamentais: behavioral,
      metricas_biometricas: biometric
    };

    setLastPayload(payload);
    const res = await saveSessionPayload(payload);
    setUploadStatus(res);
    setStage('RESULTS');
  };

  const handleRestart = () => {
    setStage('WELCOME');
    setLastPayload(null);
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col items-center justify-between selection:bg-cyan-500 selection:text-slate-950">
      {/* Top Navbar */}
      <header className="w-full border-b border-slate-800/80 bg-slate-950/80 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-md mx-auto py-3 px-4 flex items-center justify-between">
          <div className="flex items-center gap-2 cursor-pointer" onClick={() => setStage('WELCOME')}>
            <div className="w-2.5 h-2.5 rounded-full bg-cyan-400 animate-ping" />
            <span className="font-bold tracking-wider text-xs uppercase text-slate-200">Lab Atenção Cognitiva</span>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-900 border border-slate-800 text-cyan-400">
              PWA 1.0
            </span>
          </div>
        </div>
      </header>

      {/* Dynamic Screen Stage */}
      <main className="w-full flex-1 flex flex-col items-center justify-center">
        {stage === 'WELCOME' && (
          <WelcomeScreen
            onStart={handleStartExperiment}
            onOpenDashboard={() => setStage('DASHBOARD')}
          />
        )}

        {stage === 'CONDITIONING' && (
          <ConditioningPhase
            grupo={grupo}
            onComplete={handleConditioningComplete}
          />
        )}

        {stage === 'CPT_TEST' && (
          <CPTTest
            onComplete={handleCPTComplete}
          />
        )}

        {stage === 'RESULTS' && lastPayload && (
          <ResultsScreen
            payload={lastPayload}
            uploadStatus={uploadStatus}
            onRestart={handleRestart}
            onOpenDashboard={() => setStage('DASHBOARD')}
          />
        )}

        {stage === 'DASHBOARD' && (
          <ResearcherDashboard
            onBack={() => setStage('WELCOME')}
          />
        )}
      </main>

      {/* Mobile-optimized Footer */}
      <footer className="w-full max-w-md py-3 text-center text-[11px] text-slate-500 border-t border-slate-900/60">
        Quantização da Atenção &bull; React Mobile PWA &bull; MediaPipe JS
      </footer>
    </div>
  );
}
