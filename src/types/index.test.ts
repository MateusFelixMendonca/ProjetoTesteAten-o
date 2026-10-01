import { describe, it, expect } from 'vitest';
import { validateSessionPayload, SessionPayload } from './index';

describe('validateSessionPayload - Boundary Validation', () => {
  it('should accept a valid SessionPayload', () => {
    const validPayload: SessionPayload = {
      session_id: '12345678-1234-1234-1234-123456789abc',
      created_at: new Date().toISOString(),
      grupo_teste: 'EXPERIMENTAL_VIDEOS_CURTOS',
      dispositivo: {
        user_agent: 'Mozilla/5.0 (iPhone)',
        screen_width: 390,
        screen_height: 844
      },
      metricas_comportamentais: {
        total_estimulos_alvo: 30,
        total_acertos: 26,
        erros_omissao: 4,
        erros_comissao_impulsividade: 5,
        tempo_medio_reacao_ms: 340.5,
        degradacao_tempo_reacao_min3_vs_min1_percent: 12.5
      },
      metricas_biometricas: {
        tempo_total_desvio_olhar_segundos: 10.0,
        total_piscadas: 40,
        taxa_piscadas_por_minuto: 13.3,
        piscadas_fadiga_longa_count: 2
      }
    };

    const result = validateSessionPayload(validPayload);
    expect(result.isValid).toBe(true);
    expect(result.errors).toHaveLength(0);
  });

  it('should reject invalid or missing fields', () => {
    const invalidPayload: any = {
      session_id: 12345, // invalid type
      grupo_teste: 'GRUPO_INVALIDO',
      metricas_comportamentais: null
    };

    const result = validateSessionPayload(invalidPayload);
    expect(result.isValid).toBe(false);
    expect(result.errors.length).toBeGreaterThan(0);
  });
});
