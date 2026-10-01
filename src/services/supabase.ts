import { createClient } from '@supabase/supabase-js';
import { SessionPayload, APIResult, SessionFilterParams, validateSessionPayload } from '../types';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || '';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

export const supabase = (supabaseUrl && supabaseAnonKey)
  ? createClient(supabaseUrl, supabaseAnonKey)
  : null;

const LOCAL_STORAGE_ALL_SESSIONS_KEY = 'pesquisa_atencao_all_sessions';

/**
 * Persists session payload with strict boundary validation and error contracts
 */
export async function saveSessionPayload(payload: SessionPayload): Promise<APIResult<SessionPayload>> {
  // 1. Boundary Validation
  const validation = validateSessionPayload(payload);
  if (!validation.isValid) {
    return {
      success: false,
      error: {
        code: 'VALIDATION_ERROR',
        message: 'Falha na validação do payload de dados',
        details: { errors: validation.errors }
      }
    };
  }

  // 2. Persist locally to localStorage
  try {
    const existingRaw = localStorage.getItem(LOCAL_STORAGE_ALL_SESSIONS_KEY);
    const existing: SessionPayload[] = existingRaw ? JSON.parse(existingRaw) : [];
    // Prevent duplicate session_id
    const updated = [payload, ...existing.filter(s => s.session_id !== payload.session_id)];
    localStorage.setItem(LOCAL_STORAGE_ALL_SESSIONS_KEY, JSON.stringify(updated));
  } catch (err: any) {
    console.warn('Local storage write warning:', err);
  }

  // 3. Sync to Supabase if client is initialized
  if (supabase) {
    try {
      const { data, error } = await supabase
        .from('sessoes_pesquisa')
        .insert([{
          session_id: payload.session_id,
          created_at: payload.created_at,
          grupo_teste: payload.grupo_teste,
          dispositivo: payload.dispositivo,
          metricas_comportamentais: payload.metricas_comportamentais,
          metricas_biometricas: payload.metricas_biometricas
        }])
        .select()
        .single();

      if (error) {
        return {
          success: false,
          data: payload,
          error: {
            code: 'STORAGE_ERROR',
            message: `Erro ao gravar no Supabase: ${error.message}`
          }
        };
      }
      return { success: true, data: payload };
    } catch (err: any) {
      return {
        success: false,
        data: payload,
        error: {
          code: 'NETWORK_ERROR',
          message: err?.message || 'Falha de conexão com o banco Supabase'
        }
      };
    }
  }

  return {
    success: true,
    data: payload,
    error: {
      code: 'STORAGE_ERROR',
      message: 'Sessão armazenada apenas no armazenamento local (Supabase não configurado)'
    }
  };
}

/**
 * Filtered and paginated session retriever for Researcher Dashboard
 */
export function getStoredSessions(params?: SessionFilterParams): SessionPayload[] {
  try {
    const existingRaw = localStorage.getItem(LOCAL_STORAGE_ALL_SESSIONS_KEY);
    let sessions: SessionPayload[] = existingRaw ? JSON.parse(existingRaw) : [];

    if (!params) return sessions;

    const { grupo, searchQuery, limit, offset } = params;

    if (grupo && grupo !== 'ALL') {
      sessions = sessions.filter(s => s.grupo_teste === grupo);
    }

    if (searchQuery && searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      sessions = sessions.filter(s =>
        s.session_id.toLowerCase().includes(q) ||
        s.dispositivo.user_agent.toLowerCase().includes(q)
      );
    }

    const start = offset || 0;
    const end = limit ? start + limit : sessions.length;

    return sessions.slice(start, end);
  } catch (err) {
    console.error('Error retrieving sessions:', err);
    return [];
  }
}
