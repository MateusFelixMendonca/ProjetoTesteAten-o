export type GrupoTeste = 'EXPERIMENTAL_VIDEOS_CURTOS' | 'CONTROLE_TEXTO_LINEAR';

export type AppStage = 'WELCOME' | 'CONDITIONING' | 'CPT_CALIBRATION' | 'CPT_TEST' | 'RESULTS' | 'DASHBOARD';

export interface DispositivoData {
  user_agent: string;
  screen_width: number;
  screen_height: number;
}

export interface MetricasComportamentais {
  total_estimulos_alvo: number;
  total_acertos: number;
  erros_omissao: number;
  erros_comissao_impulsividade: number;
  tempo_medio_reacao_ms: number;
  degradacao_tempo_reacao_min3_vs_min1_percent: number;
}

export interface MetricasBiometricas {
  tempo_total_desvio_olhar_segundos: number;
  total_piscadas: number;
  taxa_piscadas_por_minuto: number;
  piscadas_fadiga_longa_count: number;
}

export interface SessionPayload {
  session_id: string;
  created_at: string;
  grupo_teste: GrupoTeste;
  dispositivo: DispositivoData;
  metricas_comportamentais: MetricasComportamentais;
  metricas_biometricas: MetricasBiometricas;
}

// Consistent Error Contract across Service Boundaries
export interface APIError {
  code: 'VALIDATION_ERROR' | 'STORAGE_ERROR' | 'NETWORK_ERROR' | 'NOT_FOUND';
  message: string;
  details?: Record<string, any>;
}

export interface APIResult<T> {
  success: boolean;
  data?: T;
  error?: APIError;
}

export interface SessionFilterParams {
  grupo?: GrupoTeste | 'ALL';
  searchQuery?: string;
  limit?: number;
  offset?: number;
}

export interface VideoItem {
  id: string;
  title: string;
  author: string;
  videoUrl: string;
  tags: string[];
  likes: number;
}

export interface TextSection {
  id: number;
  title: string;
  content: string;
}

// Boundary Input Validation Helper
export function validateSessionPayload(data: any): { isValid: boolean; errors: string[] } {
  const errors: string[] = [];

  if (!data || typeof data !== 'object') {
    return { isValid: false, errors: ['Payload de sessão inválido (objeto ausente)'] };
  }

  if (!data.session_id || typeof data.session_id !== 'string') {
    errors.push('session_id é obrigatório e deve ser uma string UUID');
  }

  if (!['EXPERIMENTAL_VIDEOS_CURTOS', 'CONTROLE_TEXTO_LINEAR'].includes(data.grupo_teste)) {
    errors.push('grupo_teste deve ser EXPERIMENTAL_VIDEOS_CURTOS ou CONTROLE_TEXTO_LINEAR');
  }

  if (!data.metricas_comportamentais || typeof data.metricas_comportamentais !== 'object') {
    errors.push('metricas_comportamentais são obrigatórias');
  } else {
    const mc = data.metricas_comportamentais;
    if (typeof mc.total_estimulos_alvo !== 'number' || mc.total_estimulos_alvo < 0) {
      errors.push('metricas_comportamentais.total_estimulos_alvo deve ser um número >= 0');
    }
    if (typeof mc.tempo_medio_reacao_ms !== 'number' || mc.tempo_medio_reacao_ms < 0) {
      errors.push('metricas_comportamentais.tempo_medio_reacao_ms deve ser um número >= 0');
    }
  }

  if (!data.metricas_biometricas || typeof data.metricas_biometricas !== 'object') {
    errors.push('metricas_biometricas são obrigatórias');
  }

  return {
    isValid: errors.length === 0,
    errors
  };
}
