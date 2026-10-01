import React, { useState, useEffect, useMemo } from 'react';
import { SessionPayload, GrupoTeste } from '../types';
import { getStoredSessions } from '../services/supabase';
import { Download, ArrowLeft, BarChart3, Search, Filter, RefreshCw, CheckCircle2, ShieldAlert, Sparkles } from 'lucide-react';

interface ResearcherDashboardProps {
  onBack: () => void;
}

export const ResearcherDashboard: React.FC<ResearcherDashboardProps> = ({ onBack }) => {
  const [selectedGrupo, setSelectedGrupo] = useState<GrupoTeste | 'ALL'>('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [allSessions, setAllSessions] = useState<SessionPayload[]>([]);

  const loadSessions = () => {
    setAllSessions(getStoredSessions());
  };

  useEffect(() => {
    loadSessions();
  }, []);

  const filteredSessions = useMemo(() => {
    return getStoredSessions({
      grupo: selectedGrupo,
      searchQuery: searchQuery
    });
  }, [selectedGrupo, searchQuery, allSessions]);

  const groupA = useMemo(() => allSessions.filter(s => s.grupo_teste === 'EXPERIMENTAL_VIDEOS_CURTOS'), [allSessions]);
  const groupB = useMemo(() => allSessions.filter(s => s.grupo_teste === 'CONTROLE_TEXTO_LINEAR'), [allSessions]);

  const calcAvg = (arr: number[]) => arr.length > 0 ? (arr.reduce((a, b) => a + b, 0) / arr.length).toFixed(1) : '0';

  const groupAStats = useMemo(() => ({
    count: groupA.length,
    avgImpulsivity: calcAvg(groupA.map(s => s.metricas_comportamentais.erros_comissao_impulsividade)),
    avgOmission: calcAvg(groupA.map(s => s.metricas_comportamentais.erros_omissao)),
    avgRtMs: calcAvg(groupA.map(s => s.metricas_comportamentais.tempo_medio_reacao_ms)),
    avgBlinkRate: calcAvg(groupA.map(s => s.metricas_biometricas.taxa_piscadas_por_minuto)),
    avgFatigueBlinks: calcAvg(groupA.map(s => s.metricas_biometricas.piscadas_fadiga_longa_count))
  }), [groupA]);

  const groupBStats = useMemo(() => ({
    count: groupB.length,
    avgImpulsivity: calcAvg(groupB.map(s => s.metricas_comportamentais.erros_comissao_impulsividade)),
    avgOmission: calcAvg(groupB.map(s => s.metricas_comportamentais.erros_omissao)),
    avgRtMs: calcAvg(groupB.map(s => s.metricas_comportamentais.tempo_medio_reacao_ms)),
    avgBlinkRate: calcAvg(groupB.map(s => s.metricas_biometricas.taxa_piscadas_por_minuto)),
    avgFatigueBlinks: calcAvg(groupB.map(s => s.metricas_biometricas.piscadas_fadiga_longa_count))
  }), [groupB]);

  const exportCSV = () => {
    if (allSessions.length === 0) {
      alert('Nenhuma sessão registrada para exportar.');
      return;
    }

    const headers = [
      'session_id',
      'created_at',
      'grupo_teste',
      'user_agent',
      'screen_width',
      'screen_height',
      'total_estimulos_alvo',
      'total_acertos',
      'erros_omissao',
      'erros_comissao_impulsividade',
      'tempo_medio_reacao_ms',
      'degradacao_tempo_reacao_min3_vs_min1_percent',
      'tempo_total_desvio_olhar_segundos',
      'total_piscadas',
      'taxa_piscadas_por_minuto',
      'piscadas_fadiga_longa_count'
    ];

    const rows = allSessions.map(s => [
      s.session_id,
      s.created_at,
      s.grupo_teste,
      `"${s.dispositivo.user_agent.replace(/"/g, '""')}"`,
      s.dispositivo.screen_width,
      s.dispositivo.screen_height,
      s.metricas_comportamentais.total_estimulos_alvo,
      s.metricas_comportamentais.total_acertos,
      s.metricas_comportamentais.erros_omissao,
      s.metricas_comportamentais.erros_comissao_impulsividade,
      s.metricas_comportamentais.tempo_medio_reacao_ms,
      s.metricas_comportamentais.degradacao_tempo_reacao_min3_vs_min1_percent,
      s.metricas_biometricas.tempo_total_desvio_olhar_segundos,
      s.metricas_biometricas.total_piscadas,
      s.metricas_biometricas.taxa_piscadas_por_minuto,
      s.metricas_biometricas.piscadas_fadiga_longa_count
    ]);

    const csvContent = [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `pesquisa_atencao_dados_consolidados_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="w-full max-w-xl mx-auto flex flex-col justify-between min-h-[calc(100vh-5rem)] p-4 space-y-5">
      {/* Top Bar */}
      <div className="flex items-center justify-between bg-slate-900/90 border border-slate-800 rounded-2xl p-4 shadow-xl backdrop-blur-md">
        <div className="flex items-center gap-3">
          <button
            onClick={onBack}
            className="p-2.5 rounded-xl bg-slate-950 hover:bg-slate-800 border border-slate-700 text-slate-300 transition-all active:scale-95"
          >
            <ArrowLeft className="w-4 h-4" />
          </button>
          <div>
            <h1 className="text-base font-extrabold text-white flex items-center gap-2">
              <BarChart3 className="w-4 h-4 text-cyan-400" />
              <span>Painel do Pesquisador (Dashboard)</span>
            </h1>
            <p className="text-xs text-slate-400">Análise A/B & Exportação para SPSS / Pandas</p>
          </div>
        </div>

        <button
          onClick={exportCSV}
          className="py-2.5 px-4 bg-gradient-to-r from-emerald-500 to-teal-400 text-slate-950 font-bold text-xs rounded-xl flex items-center gap-1.5 shadow-lg shadow-emerald-500/20 hover:brightness-110 active:scale-95 transition-all"
        >
          <Download className="w-4 h-4" />
          <span>Exportar CSV</span>
        </button>
      </div>

      {/* Statistical A/B Overview */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5 space-y-4 shadow-xl">
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <span className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-purple-400" />
            <span>Médias Estatísticas dos Grupos</span>
          </span>
          <span className="text-xs font-mono text-cyan-400 bg-slate-950 px-2.5 py-0.5 rounded border border-slate-800">
            Total Amostral: {allSessions.length} Sessões
          </span>
        </div>

        <div className="grid grid-cols-2 gap-4">
          {/* Group A Card */}
          <div className="p-4 bg-purple-950/30 border border-purple-800/60 rounded-2xl space-y-3 shadow-inner">
            <div className="flex items-center justify-between border-b border-purple-900/60 pb-2">
              <span className="text-xs font-bold text-purple-300">Grupo A (Vídeos)</span>
              <span className="text-[10px] font-mono bg-purple-950 text-purple-200 px-2 py-0.5 rounded border border-purple-700">
                N = {groupAStats.count}
              </span>
            </div>

            <div className="space-y-2 text-xs">
              <div>
                <div className="flex justify-between text-slate-300 mb-1">
                  <span>Impulsividade:</span>
                  <strong className="text-rose-400 font-mono">{groupAStats.avgImpulsivity}</strong>
                </div>
                <div className="w-full h-1 bg-slate-950 rounded-full overflow-hidden">
                  <div className="h-full bg-rose-500" style={{ width: `${Math.min(100, Number(groupAStats.avgImpulsivity) * 15)}%` }} />
                </div>
              </div>

              <div className="flex justify-between text-slate-300 pt-1">
                <span>Erros Omissão:</span>
                <strong className="text-purple-300 font-mono">{groupAStats.avgOmission}</strong>
              </div>

              <div className="flex justify-between text-slate-300">
                <span>Tempo Reação:</span>
                <strong className="text-cyan-300 font-mono">{groupAStats.avgRtMs} ms</strong>
              </div>

              <div className="flex justify-between text-slate-300">
                <span>Taxa Piscadas:</span>
                <strong className="text-emerald-300 font-mono">{groupAStats.avgBlinkRate}/min</strong>
              </div>
            </div>
          </div>

          {/* Group B Card */}
          <div className="p-4 bg-emerald-950/30 border border-emerald-800/60 rounded-2xl space-y-3 shadow-inner">
            <div className="flex items-center justify-between border-b border-emerald-900/60 pb-2">
              <span className="text-xs font-bold text-emerald-300">Grupo B (Leitura)</span>
              <span className="text-[10px] font-mono bg-emerald-950 text-emerald-200 px-2 py-0.5 rounded border border-emerald-700">
                N = {groupBStats.count}
              </span>
            </div>

            <div className="space-y-2 text-xs">
              <div>
                <div className="flex justify-between text-slate-300 mb-1">
                  <span>Impulsividade:</span>
                  <strong className="text-rose-400 font-mono">{groupBStats.avgImpulsivity}</strong>
                </div>
                <div className="w-full h-1 bg-slate-950 rounded-full overflow-hidden">
                  <div className="h-full bg-emerald-500" style={{ width: `${Math.min(100, Number(groupBStats.avgImpulsivity) * 15)}%` }} />
                </div>
              </div>

              <div className="flex justify-between text-slate-300 pt-1">
                <span>Erros Omissão:</span>
                <strong className="text-emerald-300 font-mono">{groupBStats.avgOmission}</strong>
              </div>

              <div className="flex justify-between text-slate-300">
                <span>Tempo Reação:</span>
                <strong className="text-cyan-300 font-mono">{groupBStats.avgRtMs} ms</strong>
              </div>

              <div className="flex justify-between text-slate-300">
                <span>Taxa Piscadas:</span>
                <strong className="text-emerald-300 font-mono">{groupBStats.avgBlinkRate}/min</strong>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Filtering and Search Controls */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-4 space-y-3 shadow-xl">
        <div className="flex flex-col sm:flex-row gap-3 items-center justify-between">
          {/* Search bar */}
          <div className="relative w-full sm:w-64">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Buscar por Session ID..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-9 pr-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500"
            />
          </div>

          {/* Group Filter tabs */}
          <div className="flex items-center gap-1 bg-slate-950 p-1 rounded-xl border border-slate-800 w-full sm:w-auto">
            <button
              onClick={() => setSelectedGrupo('ALL')}
              className={`px-3 py-1 rounded-lg text-xs font-medium transition-all ${
                selectedGrupo === 'ALL' ? 'bg-cyan-600 text-slate-950 font-bold' : 'text-slate-400 hover:text-white'
              }`}
            >
              Todos ({allSessions.length})
            </button>
            <button
              onClick={() => setSelectedGrupo('EXPERIMENTAL_VIDEOS_CURTOS')}
              className={`px-3 py-1 rounded-lg text-xs font-medium transition-all ${
                selectedGrupo === 'EXPERIMENTAL_VIDEOS_CURTOS' ? 'bg-purple-600 text-white font-bold' : 'text-slate-400 hover:text-white'
              }`}
            >
              Vídeos
            </button>
            <button
              onClick={() => setSelectedGrupo('CONTROLE_TEXTO_LINEAR')}
              className={`px-3 py-1 rounded-lg text-xs font-medium transition-all ${
                selectedGrupo === 'CONTROLE_TEXTO_LINEAR' ? 'bg-emerald-600 text-white font-bold' : 'text-slate-400 hover:text-white'
              }`}
            >
              Leitura
            </button>
          </div>
        </div>
      </div>

      {/* Raw Session Logs Table */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5 space-y-3 shadow-xl">
        <div className="flex items-center justify-between">
          <span className="text-xs font-bold text-slate-300 uppercase tracking-wider">
            Registros Filtrados ({filteredSessions.length})
          </span>
          <button onClick={loadSessions} className="text-xs text-cyan-400 flex items-center gap-1 hover:text-cyan-300">
            <RefreshCw className="w-3 h-3" />
            <span>Atualizar</span>
          </button>
        </div>

        {filteredSessions.length === 0 ? (
          <div className="p-8 text-center text-xs text-slate-500 bg-slate-950 rounded-xl border border-slate-800">
            Nenhuma sessão encontrada com os filtros selecionados.
          </div>
        ) : (
          <div className="max-h-64 overflow-y-auto space-y-2 pr-1">
            {filteredSessions.map((s) => (
              <div
                key={s.session_id}
                className="p-3 bg-slate-950 rounded-xl border border-slate-800 flex items-center justify-between text-xs font-mono hover:border-slate-700 transition-colors"
              >
                <div>
                  <div className="text-white font-bold flex items-center gap-2">
                    <span>{s.session_id.slice(0, 8)}...</span>
                    <span className={`text-[9px] px-1.5 py-0.2 rounded border ${
                      s.grupo_teste === 'EXPERIMENTAL_VIDEOS_CURTOS'
                        ? 'bg-purple-950 text-purple-300 border-purple-800'
                        : 'bg-emerald-950 text-emerald-300 border-emerald-800'
                    }`}>
                      {s.grupo_teste === 'EXPERIMENTAL_VIDEOS_CURTOS' ? 'Vídeos' : 'Leitura'}
                    </span>
                  </div>
                  <div className="text-[10px] text-slate-500 mt-1">
                    {new Date(s.created_at).toLocaleString('pt-BR')}
                  </div>
                </div>

                <div className="text-right text-[11px]">
                  <div className="text-cyan-300">RT: {s.metricas_comportamentais.tempo_medio_reacao_ms}ms</div>
                  <div className="text-rose-400">Impulsividade: {s.metricas_comportamentais.erros_comissao_impulsividade}</div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
