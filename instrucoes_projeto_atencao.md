# Documentação do Projeto: Quantização do Foco e Atenção Sustentada (React Mobile PWA)

Este documento serve como guia completo de especificações técnicas, arquitetura e metodologia para o desenvolvimento do Web App Mobile (PWA) voltado à pesquisa acadêmica sobre o impacto de vídeos curtos na atenção humana.

---

## 1. Escopo do Projeto e Hipótese Científica

* **Objetivo Geral:** Desenvolver um aplicativo web mobile (PWA em React) que quantifique e compare a persistência da atenção e a impulsividade de indivíduos expostos a diferentes estímulos de mídia.
* **Hipótese Central:** Usuários expostos a estímulos de alta recompensa e rápida alternância (vídeos curtos estilo Reels/TikTok/Shorts) apresentarão uma degradação mais severa e precoce na atenção sustentada, além de maiores índices de impulsividade, em comparação ao grupo controle.
* **Espaço Amostral:** Estudantes universitários divididos aleatoriamente entre Grupo A (Experimental - Vídeos Curtos) e Grupo B (Controle - Texto/Leitura Linear).
* **Formato de Aplicação:** Acesso instantâneo via QR Code no próprio smartphone do estudante (sem necessidade de instalação de APK/App Nativo).

---

## 2. Arquitetura do Fluxo do Usuário (User Flow)

O aplicativo operará em um ciclo linear e controlado contendo três fases principais:

```
[QR Code / Link Mobile] 
        │
        ▼
[Tela Inicial & Seleção de Grupo (A/B)]
        │
        ▼
[Fase 1: Condicionamento/Estímulo] (3 a 5 min)
        │
        ▼
[Fase 2: Calibração de Câmera + Teste de Atenção CPT] (2 a 3 min) 
        ├─► [Coleta de Biometria em Background via MediaPipe JS]
        └─► [Coleta de Métricas Comportamentais via Toque de Tela]
        │
        ▼
[Fase 3: Envio de Dados & Tela de Agradecimento/Feedback] -> [Upload para Supabase]
```

### Detalhamento das Fases
1. **Fase 1 - Tela de Estímulo (Input Controlado):**
   * **Grupo A (Experimental):** O app renderiza um componente de feed de vídeo vertical em React com suporte a gestos swipe, onde o usuário assiste a vídeos curtos locais/stream.
   * **Grupo B (Controle):** O app exibe uma tela de leitura acadêmica linear e contínua com barra de progresso de rolagem pelo mesmo período.
2. **Fase 2 - O Teste Cognitivo (Continuous Performance Test - CPT):**
   * O aplicativo solicita permissão de câmera frontal e inicia a captura via MediaPipe JS (`@mediapipe/face_mesh`).
   * Transição imediata para o **Teste de Desempenho Contínuo (CPT)** na tela.
   * Enquanto o usuário interage com o teste, o app calcula de forma silenciosa e local:
     * Piscadas (Eye Aspect Ratio - EAR)
     * Desvios de Olhar
     * Tempo de Reação (evento `pointerdown`)
     * Erros de Omissão e Comissão
3. **Fase 3 - Encerramento e Upload:**
   * Finalização do teste, estruturação do payload em formato JSON e gravação direta no banco de dados **Supabase / Firebase**.

---

## 3. Stack Tecnológica Definitiva

A stack escolhida visa garantir **alta performance no navegador mobile**, facilidade de testes em campo e rápida implementação para o trabalho de faculdade.

### Core Framework & Estilização
* **React 18 + Vite:** Ambiente de desenvolvimento ultra-rápido com bundling otimizado para produção PWA.
* **Tailwind CSS / Vanilla CSS:** Layouts responsivos mobile-first (Viewport otimizado para smartphones: `390x844px`).
* **Lucide React & Framer Motion / Canvas API:** Ícones e renderização fluida do teste cognitivo CPT.

### Visão Computacional no Navegador (Edge AI)
* **MediaPipe Face Mesh JS (`@mediapipe/face_mesh` + `@mediapipe/camera_utils`):** Solução open-source executada 100% no navegador via WebGL/WASM. Mapeia 468 pontos faciais sem enviar vídeo para servidores externos, garantindo privacidade total e latência zero.
* **HTML5 Canvas & getUserMedia API:** Captura direta do fluxo da câmera frontal do celular.

### Backend & Armazenamento
* **Supabase (PostgreSQL / Serverless API):** Banco de dados em nuvem para armazenamento em tempo real dos JSONs de cada sessão.
* **Exportação CSV:** Dashboard simples do pesquisador para baixar a base consolidada para análise estatística no Python/Excel.

---

## 4. Métricas Computacionais e Algoritmos (A "Quantização")

Como traduzir as reações faciais e os toques na tela do celular em dados científicos quantitativos:

### A. Fadiga Cognitiva e Piscadas via EAR (Eye Aspect Ratio)
Utilizando os pontos faciais do MediaPipe correspondentes às pálpebras dos olhos:
* **Fórmula do EAR:**
  $$\text{EAR} = \frac{||p_2 - p_6|| + ||p_3 - p_5||}{2 \cdot ||p_1 - p_4||}$$
* **Lógica:** Sempre que o valor de EAR cair abaixo de `0.20` e retornar em menos de `400ms`, incrementa-se o contador de **piscadas voluntárias**. Se o tempo de fechamento for entre `400ms` e `1500ms`, registra-se uma **piscada por fadiga**.

### B. Rastreamento de Desvio de Olhar (Eye-Tracking Simplificado)
* **Calibração:** Nos primeiros 5 segundos do CPT, o app estabelece a posição média dos vetores da íris enquanto o usuário olha fixo para o centro da tela.
* **Detecção:** Qualquer variação angular superior a um limiar $T$ mantida por mais de `1.2s` é contada como um **Desvio de Atenção Visual**.

### C. Impulsividade e Persistência Comportamental (Métricas CPT)
Métricas extraídas diretamente do log de interações com a tela do smartphone:
* **Tempo de Reação (Latência em ms):** Diferença de tempo entre a renderização do estímulo e o evento de toque (`pointerdown`).
* **Erros de Omissão:** O estímulo alvo apareceu e o usuário não tocou dentro da janela de resposta (indica desconcentração / perda de foco).
* **Erros de Comissão (Impulsividade):** O usuário tocou na tela quando apareceu um estímulo não-alvo (indica falta de controle inibitório gerada pelo condicionamento a estímulos rápidos).

---

## 5. Estrutura do Banco de Dados (Data Schema - Supabase)

Os dados salvos no Supabase ao fim de cada sessão devem seguir esta estrutura JSON:

```json
{
  "session_id": "c7a8b9f1-3d2e-4f5a-8b9c-1d2e3f4a5b6c",
  "created_at": "2026-10-01T16:00:00Z",
  "grupo_teste": "EXPERIMENTAL_VIDEOS_CURTOS", // ou "CONTROLE_TEXTO_LINEAR"
  "dispositivo": {
    "user_agent": "Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X)",
    "screen_width": 390,
    "screen_height": 844
  },
  "metricas_comportamentais": {
    "total_estimulos_alvo": 30,
    "total_acertos": 26,
    "erros_omissao": 4,
    "erros_comissao_impulsividade": 5,
    "tempo_medio_reacao_ms": 342.5,
    "degradacao_tempo_reacao_min3_vs_min1_percent": 14.2
  },
  "metricas_biometricas": {
    "tempo_total_desvio_olhar_segundos": 12.4,
    "total_piscadas": 45,
    "taxa_piscadas_por_minuto": 15.0,
    "piscadas_fadiga_longa_count": 3
  }
}
```

---

## 6. Diretrizes de Escopo e Decisões de Projeto (MVP & "Not Doing")

### O que ENTRA no MVP:
- 📱 Interface 100% responsiva mobile PWA (rodando no Safari iOS e Chrome Android).
- 🔀 Divisão automatizada de grupos (A/B) com código identificador de sessão.
- 👁️ Leitura de câmera com MediaPipe JS a ~15 FPS para economizar bateria e CPU no mobile.
- 🎮 Teste cognitivo CPT de 2 a 3 minutos responsivo ao toque.
- ☁️ Integração com Supabase para gravação de resultados.
- 📊 Painel de exportação CSV para análise estatística acadêmica.

### O que NÃO ENTRA (Not Doing & Motivos):
- ❌ **App Nativo (APK / App Store):** *Motivo:* Dificulta a aplicação dos testes em campo. O Web App funciona via QR Code em qualquer smartphone sem instalar nada.
- ❌ **Eye-tracking de precisão em pixels na tela:** *Motivo:* Exige calibração complexa e demorada. Focaremos em métricas robustas de desvio de foco e piscada (EAR).
- ❌ **Autenticação / Login de participantes:** *Motivo:* Elimina fricção. Participantes respondem de forma anônima e rápida.

---

## 7. Cronograma Recomendado de Execução (6 Semanas)

1. **Semana 1 (Setup & Validação de Câmera):**
   * Criar projeto React + Vite + Tailwind.
   * Validar execução do MediaPipe JS no Safari (iOS) e Chrome (Android) calculando o EAR em um protótipo simples.
2. **Semana 2 (Fase 1 - Condicionamento A/B):**
   * Desenvolver os componentes de Feed de Vídeos Curtos (Grupo A) e Leitor de Texto Linear (Grupo B).
3. **Semana 3 (Fase 2 - Teste Cognitivo CPT):**
   * Implementar a mecânica do jogo CPT com medição precisa de milissegundos via `pointerdown`.
4. **Semana 4 (Integração Supabase & Fluxo Completo):**
   * Conectar o app ao Supabase, implementar a gravação automática e a transição suave de telas.
5. **Semana 5 (Coleta de Campo na Faculdade):**
   * Gerar QR Code e aplicar os testes com 20 a 40 voluntários universitários.
6. **Semana 6 (Análise Estatística & Relatório Final):**
   * Exportar os dados do Supabase em CSV, gerar gráficos comparativos entre Grupo A e Grupo B e finalizar o relatório acadêmico.
