import { describe, it, expect, beforeEach } from 'vitest';
import { saveSessionPayload, getStoredSessions } from './supabase';
import { SessionPayload } from '../types';

// In-memory localStorage mock for node environment
const store: Record<string, string> = {};
global.localStorage = {
  getItem: (key: string) => store[key] || null,
  setItem: (key: string, value: string) => { store[key] = value.toString(); },
  removeItem: (key: string) => { delete store[key]; },
  clear: () => { Object.keys(store).forEach(k => delete store[k]); },
  length: 0,
  key: (index: number) => null
};

describe('Supabase & Storage Service', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  const mockSessionA: SessionPayload = {
    session_id: 'session-aaaa-1111',
    created_at: new Date().toISOString(),
    grupo_teste: 'EXPERIMENTAL_VIDEOS_CURTOS',
    dispositivo: { user_agent: 'Mobile Test', screen_width: 390, screen_height: 844 },
    metricas_comportamentais: {
      total_estimulos_alvo: 20,
      total_acertos: 18,
      erros_omissao: 2,
      erros_comissao_impulsividade: 4,
      tempo_medio_reacao_ms: 320,
      degradacao_tempo_reacao_min3_vs_min1_percent: 10
    },
    metricas_biometricas: {
      tempo_total_desvio_olhar_segundos: 5,
      total_piscadas: 30,
      taxa_piscadas_por_minuto: 15,
      piscadas_fadiga_longa_count: 1
    }
  };

  const mockSessionB: SessionPayload = {
    session_id: 'session-bbbb-2222',
    created_at: new Date().toISOString(),
    grupo_teste: 'CONTROLE_TEXTO_LINEAR',
    dispositivo: { user_agent: 'Mobile Test', screen_width: 390, screen_height: 844 },
    metricas_comportamentais: {
      total_estimulos_alvo: 20,
      total_acertos: 19,
      erros_omissao: 1,
      erros_comissao_impulsividade: 1,
      tempo_medio_reacao_ms: 310,
      degradacao_tempo_reacao_min3_vs_min1_percent: 5
    },
    metricas_biometricas: {
      tempo_total_desvio_olhar_segundos: 2,
      total_piscadas: 25,
      taxa_piscadas_por_minuto: 12.5,
      piscadas_fadiga_longa_count: 0
    }
  };

  it('should save session payload to local storage', async () => {
    const res = await saveSessionPayload(mockSessionA);
    expect(res.success).toBe(true);

    const stored = getStoredSessions();
    expect(stored).toHaveLength(1);
    expect(stored[0].session_id).toBe('session-aaaa-1111');
  });

  it('should filter sessions by grupo_teste correctly', async () => {
    await saveSessionPayload(mockSessionA);
    await saveSessionPayload(mockSessionB);

    const groupASessions = getStoredSessions({ grupo: 'EXPERIMENTAL_VIDEOS_CURTOS' });
    expect(groupASessions).toHaveLength(1);
    expect(groupASessions[0].session_id).toBe('session-aaaa-1111');

    const groupBSessions = getStoredSessions({ grupo: 'CONTROLE_TEXTO_LINEAR' });
    expect(groupBSessions).toHaveLength(1);
    expect(groupBSessions[0].session_id).toBe('session-bbbb-2222');
  });
});
