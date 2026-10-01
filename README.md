# 📱 Quantização do Foco e Atenção Sustentada (React Mobile PWA)

Aplicativo Web Mobile (PWA em React + TypeScript + Vite + Tailwind CSS) desenvolvido para quantificação e comparação da persistência da atenção sustentada e impulsividade de indivíduos expostos a diferentes estímulos de mídia.

---

## 🎯 Hipótese Científica & Metodologia

- **Grupo A (Experimental - Vídeos Curtos):** Exposição a feed vertical interativo estilo Reels/TikTok.
- **Grupo B (Controle - Leitura Linear):** Exposição a artigo científico linear contínuo com barra de progresso.
- **Biometria Computacional Ocular:** Processamento via **MediaPipe Face Mesh** rodando no navegador (WebGL/WASM) para cálculo do **EAR (Eye Aspect Ratio)**, identificação de **piscadas por fadiga (>400ms)** e **desvios de olhar**.
- **Teste Cognitivo CPT (Continuous Performance Test):** Medição com precisão de milissegundos de **tempo de reação**, **erros de omissão** (perda de vigilância) e **erros de comissão** (impulsividade).

---

## 🛠️ Stack Tecnológica

- **Core:** React 18 + TypeScript + Vite 6
- **Estilização:** Tailwind CSS v4 + Lucide React Icons
- **Visão Computacional (Edge AI):** `@mediapipe/face_mesh` & `@mediapipe/camera_utils`
- **Backend & Dados:** Supabase (`@supabase/supabase-js`) + LocalStorage Fallback + Exportação CSV

---

## 🚀 Como Executar Localmente

### 1. Instalação de Dependências
```bash
npm install
```

### 2. Rodar Servidor de Desenvolvimento Mobile
```bash
npm run dev
```
Acesse no navegador ou smartphone via Wi-Fi no endereço exibido no terminal (ex: `http://192.168.x.x:3000`).

### 3. Compilar para Produção (PWA)
```bash
npm run build
```

---

## 🗄️ Estrutura de Tabela no Supabase (`sessoes_pesquisa`)

Caso deseje sincronizar em nuvem com o Supabase, crie uma tabela chamada `sessoes_pesquisa` com as seguintes colunas JSON / Texto:

```sql
create table sessoes_pesquisa (
  session_id uuid primary key,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  grupo_teste text not null,
  dispositivo jsonb not null,
  metricas_comportamentais jsonb not null,
  metricas_biometricas jsonb not null
);
```

Configure as variáveis de ambiente `.env.local`:
```env
VITE_SUPABASE_URL=https://seu-projeto.supabase.co
VITE_SUPABASE_ANON_KEY=sua-anon-key
```

*Nota: Caso as variáveis não sejam informadas, o sistema salva automaticamente todas as sessões no `localStorage` do dispositivo e permite a exportação para CSV pelo Painel do Pesquisador.*
