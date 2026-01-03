
import React from 'react';
import { Activity, LayoutDashboard, Globe, Bot, ClipboardList, BarChart3, Code2, Database, Lock, Shield } from 'lucide-react';

interface PortfolioProps {
  onBack: () => void;
  onDemo: () => void;
}

export default function Portfolio({ onBack, onDemo }: PortfolioProps) {
  return (
    <div className="min-h-screen bg-slate-950 text-white overflow-y-auto">
      <header className="bg-slate-900/80 backdrop-blur border-b border-slate-800 sticky top-0 z-50 px-6 py-4 flex justify-between items-center">
        <div className="flex items-center gap-3">
          <div className="bg-indigo-600 p-2 rounded-lg"><Activity size={24} /></div>
          <span className="font-bold text-xl tracking-tight">NurseTec Solutions</span>
        </div>
        <button onClick={onBack} className="text-slate-400 hover:text-white transition-colors">Voltar para Login</button>
      </header>

      <section className="relative py-24 px-6 text-center overflow-hidden">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[500px] bg-indigo-600/20 rounded-full blur-3xl -z-10"></div>
        <h1 className="text-5xl md:text-7xl font-extrabold mb-8 bg-clip-text text-transparent bg-gradient-to-r from-indigo-400 via-purple-400 to-pink-400">
          Excelência na <br/> Jornada do Paciente
        </h1>
        <p className="text-xl md:text-2xl text-slate-400 max-w-3xl mx-auto mb-12 leading-relaxed">
          A primeira plataforma que unifica <b>NPS em Tempo Real</b>, <b>Gestão de Riscos (5W2H)</b> e <b>Inteligência Artificial</b> para hospitais de alta performance.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <button onClick={onDemo} className="bg-white text-slate-900 px-8 py-4 rounded-xl font-bold hover:bg-indigo-50 transition-all flex items-center justify-center gap-2 shadow-xl shadow-white/10">
            <LayoutDashboard size={20} /> Ver Demonstração Agora
          </button>
          <button onClick={() => window.open('https://nursetec.com.br', '_blank')} className="bg-slate-800 text-white px-8 py-4 rounded-xl font-bold hover:bg-slate-700 transition-all border border-slate-700 flex items-center justify-center gap-2">
            <Globe size={20} /> Visitar Site Oficial
          </button>
        </div>
      </section>

      <section className="py-20 px-6 max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-8">
        <div className="bg-slate-900 p-8 rounded-3xl border border-slate-800 hover:border-indigo-500/50 transition-all group">
          <div className="w-14 h-14 bg-indigo-900/50 rounded-2xl flex items-center justify-center mb-6 group-hover:bg-indigo-600 transition-colors">
            <Bot className="text-indigo-400 group-hover:text-white" size={32} />
          </div>
          <h3 className="text-2xl font-bold mb-4">IA Generativa</h3>
          <p className="text-slate-400 leading-relaxed">Nossa IA analisa comentários abertos, identifica padrões de risco e sugere planos de ação automáticos para a equipe.</p>
        </div>
        <div className="bg-slate-900 p-8 rounded-3xl border border-slate-800 hover:border-pink-500/50 transition-all group">
          <div className="w-14 h-14 bg-pink-900/50 rounded-2xl flex items-center justify-center mb-6 group-hover:bg-pink-600 transition-colors">
            <ClipboardList className="text-pink-400 group-hover:text-white" size={32} />
          </div>
          <h3 className="text-2xl font-bold mb-4">Metodologia 5W2H</h3>
          <p className="text-slate-400 leading-relaxed">Transforme feedbacks em ações concretas. Acompanhe status, prazos e responsáveis em um painel integrado.</p>
        </div>
        <div className="bg-slate-900 p-8 rounded-3xl border border-slate-800 hover:border-teal-500/50 transition-all group">
          <div className="w-14 h-14 bg-teal-900/50 rounded-2xl flex items-center justify-center mb-6 group-hover:bg-teal-600 transition-colors">
            <BarChart3 className="text-teal-400 group-hover:text-white" size={32} />
          </div>
          <h3 className="text-2xl font-bold mb-4">KPIs em Tempo Real</h3>
          <p className="text-slate-400 leading-relaxed">Dashboards de NPS, CSAT e indicadores operacionais atualizados instantaneamente após cada pesquisa.</p>
        </div>
      </section>

      <section className="py-16 border-t border-slate-800 bg-slate-950">
        <div className="max-w-7xl mx-auto px-6 text-center">
          <p className="text-slate-500 font-medium mb-8">DESENVOLVIDO COM TECNOLOGIA DE PONTA</p>
          <div className="flex flex-wrap justify-center gap-12 opacity-70 grayscale hover:grayscale-0 transition-all">
            <div className="flex items-center gap-2 text-xl font-bold text-slate-300"><Code2 /> React & TypeScript</div>
            <div className="flex items-center gap-2 text-xl font-bold text-slate-300"><Database /> Google Gemini AI</div>
            <div className="flex items-center gap-2 text-xl font-bold text-slate-300"><Shield /> Enterprise Security</div>
          </div>
        </div>
      </section>
    </div>
  );
}
