import React, { useState, useRef, useEffect } from 'react';
import { BookOpen, CheckCircle } from 'lucide-react';
import { TextSection } from '../types';

const ACADEMIC_SECTIONS: TextSection[] = [
  {
    id: 1,
    title: "1. Introdução à Dinâmica da Atenção Sustentada",
    content: "A atenção sustentada refere-se à capacidade cognitiva de manter o foco mental em um estímulo ou tarefa específica durante um período prolongado. Na era digital contemporânea, a neurobiologia humana enfrenta demandas sem precedentes, em que o córtex pré-frontal precisa continuamente filtrar distrações e inibir impulsos de alternância rápida."
  },
  {
    id: 2,
    title: "2. Estímulos de Alta Recompensa e o Sistema Dopaminérgico",
    content: "A exposição contínua a mídias de ritmo veloz (como vídeos de 15 segundos com transições visuais a cada 2 segundos) desencadeia picos sucessivos de dopamina no circuito mesolímbico. Este padrão condiciona o cérebro a esperar novidade constante. Quando o indivíduo é posteriormente submetido a tarefas lineares que exigem perseverança (como leitura de textos extensos ou testes de desempenho contínuo), observa-se um aumento acentuado na fadiga perceptiva e na taxa de erros por impulsividade."
  },
  {
    id: 3,
    title: "3. O Teste de Desempenho Contínuo (CPT) como Métrica",
    content: "Para quantificar objetivamente o declínio na persistência focal, a psicofisiologia utiliza o Continuous Performance Test (CPT). O teste avalia duas variáveis fundamentais: erros de omissão (falha em responder ao estímulo alvo, associada à perda de vigilância) e erros de comissão (resposta inadequada a estímulos não-alvo, associada à impulsividade e falta de inibição comportamental)."
  },
  {
    id: 4,
    title: "4. Biomarcadores Oculares e Taxa de Piscadas (EAR)",
    content: "Paralelamente aos tempos de reação ao toque, a visão computacional mobile permite medir o Eye Aspect Ratio (EAR) sem o uso de sensores invasivos. Diminuições sustentadas no EAR combinadas com episódios de fechamento palpebral prolongado (> 400ms) servem como indicadores diretos de esgotamento cognitivo e sonolência induzida por esforço atencional."
  }
];

export const TextReader: React.FC = () => {
  const [scrollProgress, setScrollProgress] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);

  const handleScroll = () => {
    if (!containerRef.current) return;
    const { scrollTop, scrollHeight, clientHeight } = containerRef.current;
    const totalScroll = scrollHeight - clientHeight;
    if (totalScroll > 0) {
      const currentProgress = Math.min(100, Math.max(0, (scrollTop / totalScroll) * 100));
      setScrollProgress(currentProgress);
    }
  };

  useEffect(() => {
    const el = containerRef.current;
    if (el) {
      el.addEventListener('scroll', handleScroll);
      return () => el.removeEventListener('scroll', handleScroll);
    }
  }, []);

  return (
    <div className="w-full h-[600px] max-h-[75vh] bg-slate-900/90 rounded-2xl border border-emerald-900/50 shadow-2xl flex flex-col overflow-hidden">
      {/* Top Header & Scroll Progress */}
      <div className="bg-slate-950/90 p-4 border-b border-slate-800 flex flex-col space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 px-3 py-1 bg-emerald-950/80 rounded-full border border-emerald-700/60">
            <BookOpen className="w-3.5 h-3.5 text-emerald-400" />
            <span className="text-xs font-bold text-emerald-200 uppercase tracking-wider">Leitura Linear (Grupo B)</span>
          </div>
          <span className="text-xs font-mono text-emerald-400 font-semibold">{Math.round(scrollProgress)}% Lido</span>
        </div>

        {/* Progress bar */}
        <div className="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-emerald-500 to-teal-400 transition-all duration-150 ease-out"
            style={{ width: `${scrollProgress}%` }}
          />
        </div>
      </div>

      {/* Article Content Container */}
      <div
        ref={containerRef}
        onScroll={handleScroll}
        className="flex-1 p-5 overflow-y-auto space-y-6 text-slate-200 leading-relaxed text-sm scroll-smooth"
      >
        <div className="border-b border-slate-800 pb-4">
          <span className="text-[10px] font-mono uppercase tracking-widest text-emerald-400">Artigo de Revisão Neurocientífica</span>
          <h2 className="text-lg font-bold text-white mt-1 leading-snug">
            Impacto da Estimulação de Alta Frequência no Córtex Pré-Frontal Humano
          </h2>
          <p className="text-xs text-slate-400 mt-1">Laboratório de Cognição e Comportamento Computacional &bull; 2026</p>
        </div>

        {ACADEMIC_SECTIONS.map((section) => (
          <section key={section.id} className="space-y-2">
            <h3 className="font-semibold text-emerald-300 text-sm">{section.title}</h3>
            <p className="text-slate-300 text-sm leading-relaxed text-justify">
              {section.content}
            </p>
          </section>
        ))}

        <div className="p-4 bg-emerald-950/30 border border-emerald-800/40 rounded-xl text-xs text-emerald-300 flex items-center gap-2">
          <CheckCircle className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>Continue lendo com atenção até o término do tempo de condicionamento.</span>
        </div>
      </div>
    </div>
  );
};
