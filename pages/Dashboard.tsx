import React, { useMemo, useState, useEffect } from 'react';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer,
  AreaChart, Area, Cell, PieChart, Pie
} from 'recharts';
import { Activity, Users, TrendingUp, Building, ThumbsUp, ThumbsDown, AlertTriangle, Calendar, Star, ArrowRight, Zap, Filter, RotateCcw } from 'lucide-react';
import { SurveyResponse, Sector, QuestionCategory, MonthlyActionPlan, User } from './types';

interface DashboardProps {
  user: User | null;
  responses: SurveyResponse[];
  sectors: Sector[];
  categories: QuestionCategory[];
  actionPlans: MonthlyActionPlan[];
  onViewActions: () => void;
}

// Componente de Velocímetro (Gauge) NPS
const NPSGauge = ({ score }: { score: number }) => {
  const normalized = (score + 100) / 200; // 0 to 1
  const data = [
    { name: 'Score', value: normalized, color: score >= 50 ? '#10B981' : score >= 0 ? '#F59E0B' : '#EF4444' },
    { name: 'Remaining', value: 1 - normalized, color: '#E2E8F0' }
  ];

  return (
    <div className="relative h-48 flex items-center justify-center">
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie
            data={data}
            cx="50%"
            cy="70%"
            startAngle={180}
            endAngle={0}
            innerRadius={60}
            outerRadius={90}
            paddingAngle={0}
            dataKey="value"
            stroke="none"
          >
            {data.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={entry.color} />
            ))}
          </Pie>
        </PieChart>
      </ResponsiveContainer>
      <div className="absolute bottom-4 text-center">
        <span className="text-sm text-slate-400 font-bold uppercase block">NPS Global</span>
        <span className={`text-4xl font-extrabold ${score >= 50 ? 'text-emerald-600' : score >= 0 ? 'text-amber-500' : 'text-red-600'}`}>
          {score}
        </span>
      </div>
    </div>
  );
};

// Componente de Estrelas
const StarRating = ({ value }: { value: number }) => (
  <div className="flex gap-0.5">
    {[1, 2, 3, 4, 5].map(star => (
      <Star 
        key={star} 
        size={14} 
        className={`${star <= Math.round(value) ? 'fill-amber-400 text-amber-400' : 'text-slate-200'}`} 
      />
    ))}
  </div>
);

export default function Dashboard({ user, responses, sectors, categories, actionPlans, onViewActions }: DashboardProps) {
  const [selectedMonth, setSelectedMonth] = useState<number>(new Date().getMonth());
  const [selectedYear, setSelectedYear] = useState<number>(new Date().getFullYear());
  
  // Inicialização do selectedSector baseada na role do usuário
  const [selectedSector, setSelectedSector] = useState<string>('all');

  useEffect(() => {
    // Se não for admin e tiver setores, selecionar o primeiro automaticamente
    if (user?.role !== 'admin' && sectors.length > 0) {
      // Se "all" estava selecionado ou o setor selecionado não está mais na lista (mudança de usuário), muda para o primeiro
      if (selectedSector === 'all' || !sectors.find(s => s.id === selectedSector)) {
         setSelectedSector(sectors[0].id);
      }
    } else if (user?.role === 'admin' && selectedSector !== 'all' && !sectors.find(s => s.id === selectedSector)) {
       // Fallback para admin se setor sumir
       setSelectedSector('all');
    }
  }, [user, sectors]);


  const [feedFilter, setFeedFilter] = useState<'all' | 'promoters' | 'detractors'>('all');

  // --- FILTRAGEM DE DADOS ---
  const filteredResponses = useMemo(() => {
    return responses.filter(r => {
      const d = new Date(r.date);
      const matchMonth = d.getMonth() === selectedMonth;
      const matchYear = d.getFullYear() === selectedYear;
      const matchSector = selectedSector === 'all' || r.sectorId === selectedSector;
      return matchMonth && matchYear && matchSector;
    });
  }, [responses, selectedMonth, selectedYear, selectedSector]);

  // --- CÁLCULOS ---
  
  // 1. NPS Score
  const npsScore = useMemo(() => {
    if (filteredResponses.length === 0) return 0;
    const promoters = filteredResponses.filter(r => r.npsScore >= 9).length;
    const detractors = filteredResponses.filter(r => r.npsScore <= 6).length;
    return Math.round(((promoters - detractors) / filteredResponses.length) * 100);
  }, [filteredResponses]);

  // 2. Timeline Data
  const timelineData = useMemo(() => {
    const yearResponses = responses.filter(r => new Date(r.date).getFullYear() === selectedYear && (selectedSector === 'all' || r.sectorId === selectedSector));
    
    const monthlyData = Array.from({ length: 12 }).map((_, i) => {
      const monthResps = yearResponses.filter(r => new Date(r.date).getMonth() === i);
      if (monthResps.length === 0) return { name: new Date(2024, i, 1).toLocaleDateString('pt-BR', {month:'short'}), nps: 0, count: 0 };
      
      const p = monthResps.filter(r => r.npsScore >= 9).length;
      const d = monthResps.filter(r => r.npsScore <= 6).length;
      const nps = Math.round(((p - d) / monthResps.length) * 100);
      
      return {
        name: new Date(2024, i, 1).toLocaleDateString('pt-BR', {month:'short'}),
        nps: nps,
        count: monthResps.length
      };
    });

    return monthlyData;
  }, [responses, selectedYear, selectedSector]);

  // 3. Category Performance
  const categoryStats = useMemo(() => {
    const stats: Record<string, {sum: number, count: number}> = {};
    
    filteredResponses.forEach(r => {
      Object.entries(r.ratings).forEach(([key, val]) => {
        const catId = key.split(':')[0]; 
        if (!stats[catId]) stats[catId] = { sum: 0, count: 0 };
        stats[catId].sum += (val as number);
        stats[catId].count += 1;
      });
    });

    return Object.keys(stats).map(catId => {
      const cat = categories.find(c => c.id === catId);
      const avg = stats[catId].sum / stats[catId].count;
      return {
        id: catId,
        name: cat?.label || catId,
        value: Number(avg.toFixed(1)),
        count: stats[catId].count
      };
    }).sort((a,b) => b.value - a.value);
  }, [filteredResponses, categories]);

  // 4. Planos de Ação Status
  const actionStats = useMemo(() => {
    let pending = 0, inProgress = 0, completed = 0, overdue = 0;
    
    actionPlans.forEach(plan => {
       // Filtra planos se um setor específico estiver selecionado
       if (selectedSector !== 'all' && plan.sectorId !== selectedSector) return;

       plan.items.forEach(item => {
           const isOverdue = new Date(item.when) < new Date() && item.status !== 'done';
           if (isOverdue) overdue++;
           else if (item.status === 'done') completed++;
           else if (item.status === 'in_progress') inProgress++;
           else pending++;
       });
    });
    return { pending, inProgress, completed, overdue };
  }, [actionPlans, selectedSector]);

  // 5. AI Analysis
  const aiAlerts = useMemo(() => {
    const negativeComments = filteredResponses.filter(r => r.npsScore <= 6 && r.comment.length > 5);
    const keywords = ['demora', 'sujo', 'limpeza', 'médico', 'recepção', 'comida', 'fria'];
    const counts: Record<string, number> = {};
    
    negativeComments.forEach(c => {
      keywords.forEach(k => {
        if (c.comment.toLowerCase().includes(k)) counts[k] = (counts[k] || 0) + 1;
      });
    });

    return Object.entries(counts)
      .sort((a,b) => b[1] - a[1])
      .slice(0, 3)
      .map(([key, count]) => ({ topic: key, count }));
  }, [filteredResponses]);

  const feedComments = filteredResponses
    .filter(r => r.comment.length > 0)
    .filter(r => {
      if (feedFilter === 'promoters') return r.npsScore >= 9;
      if (feedFilter === 'detractors') return r.npsScore <= 6;
      return true;
    })
    .slice(0, 5);

  return (
    <div className="space-y-6 animate-fade-in pb-10">
      {/* HEADER E FILTROS */}
      <div className="flex flex-col md:flex-row justify-between md:items-center gap-4 bg-white p-5 rounded-xl border border-slate-200 shadow-sm sticky top-0 z-20">
        <div>
          <h2 className="text-2xl font-bold text-slate-800 flex items-center gap-2">
            <Activity style={{color: 'var(--brand-color)'}}/> Dashboard Executivo
          </h2>
          <p className="text-sm text-slate-500">Visão geral de performance e qualidade</p>
        </div>
        
        <div className="flex flex-wrap gap-2">
            <select 
              value={selectedSector} 
              onChange={e => setSelectedSector(e.target.value)}
              className="bg-slate-50 border border-slate-200 text-slate-700 text-sm rounded-lg focus:ring-2 outline-none font-bold block p-2.5"
              style={{borderColor: 'var(--brand-color)'}}
            >
              {/* Opção 'Todos' só aparece para Admin */}
              {user?.role === 'admin' && <option value="all">Todos os Setores</option>}
              {sectors.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
              {sectors.length === 0 && user?.role !== 'admin' && <option disabled>Sem setores vinculados</option>}
            </select>
            
            <div className="flex border border-slate-200 rounded-lg overflow-hidden">
                <select 
                  value={selectedMonth} 
                  onChange={e => setSelectedMonth(Number(e.target.value))}
                  className="bg-slate-50 text-slate-700 text-sm p-2.5 outline-none font-bold border-r border-slate-200"
                >
                  {Array.from({length: 12}).map((_, i) => (
                    <option key={i} value={i}>{new Date(2024, i, 1).toLocaleDateString('pt-BR', {month: 'long'})}</option>
                  ))}
                </select>
                <select 
                  value={selectedYear} 
                  onChange={e => setSelectedYear(Number(e.target.value))}
                  className="bg-slate-50 text-slate-700 text-sm p-2.5 outline-none font-bold"
                >
                  <option value={2024}>2024</option>
                  <option value={2025}>2025</option>
                </select>
            </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* COLUNA ESQUERDA - NPS & ALERTS */}
        <div className="space-y-6">
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
             <div className="flex justify-between items-center mb-4">
               <h3 className="font-bold text-slate-700">NPS do Mês</h3>
               <span className="text-xs font-bold bg-slate-100 px-2 py-1 rounded text-slate-500">{filteredResponses.length} respostas</span>
             </div>
             <NPSGauge score={npsScore} />
             
             <div className="grid grid-cols-3 gap-2 mt-4 text-center">
               <div className="p-2 bg-emerald-50 rounded-lg border border-emerald-100">
                  <span className="block text-xl font-bold text-emerald-600">{filteredResponses.filter(r => r.npsScore >= 9).length}</span>
                  <span className="text-[10px] uppercase font-bold text-emerald-700/60">Promotores</span>
               </div>
               <div className="p-2 bg-amber-50 rounded-lg border border-amber-100">
                  <span className="block text-xl font-bold text-amber-600">{filteredResponses.filter(r => r.npsScore >= 7 && r.npsScore <= 8).length}</span>
                  <span className="text-[10px] uppercase font-bold text-amber-700/60">Neutros</span>
               </div>
               <div className="p-2 bg-red-50 rounded-lg border border-red-100">
                  <span className="block text-xl font-bold text-red-600">{filteredResponses.filter(r => r.npsScore <= 6).length}</span>
                  <span className="text-[10px] uppercase font-bold text-red-700/60">Detratores</span>
               </div>
             </div>
          </div>

          <div className="bg-gradient-to-br from-indigo-900 to-slate-900 p-6 rounded-2xl shadow-lg text-white relative overflow-hidden" style={{backgroundImage: 'linear-gradient(to bottom right, var(--brand-color), #0f172a)'}}>
             <div className="absolute top-0 right-0 p-4 opacity-10"><Zap size={100}/></div>
             <h3 className="font-bold text-lg mb-4 flex items-center gap-2 relative z-10">
               <Zap className="text-yellow-400 fill-yellow-400" size={20}/> Insights da IA
             </h3>
             {aiAlerts.length > 0 ? (
               <div className="space-y-3 relative z-10">
                 <p className="opacity-80 text-sm mb-2">Temas recorrentes em avaliações negativas:</p>
                 {aiAlerts.map((alert, idx) => (
                   <div key={idx} className="bg-white/10 backdrop-blur border border-white/10 p-3 rounded-xl flex justify-between items-center">
                     <span className="font-medium capitalize">{alert.topic}</span>
                     <span className="bg-red-500 text-white text-xs font-bold px-2 py-1 rounded-full">{alert.count} menções</span>
                   </div>
                 ))}
               </div>
             ) : (
               <p className="opacity-70 text-sm relative z-10">Dados insuficientes para análise de IA neste período.</p>
             )}
          </div>
        </div>

        {/* COLUNA CENTRAL - GRÁFICOS & CATEGORIAS */}
        <div className="space-y-6 lg:col-span-2">
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
               <button onClick={onViewActions} className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm hover:shadow-md transition-all text-left group">
                 <div className="flex justify-between items-start mb-2">
                   <div className="p-2 bg-slate-100 rounded-lg text-slate-600 group-hover:bg-slate-200"><Calendar size={18}/></div>
                   <ArrowRight size={16} className="text-slate-300 opacity-0 group-hover:opacity-100 transition-all -translate-x-2 group-hover:translate-x-0" style={{color: 'var(--brand-color)'}}/>
                 </div>
                 <span className="text-2xl font-bold text-slate-800">{actionStats.pending}</span>
                 <p className="text-xs text-slate-500 font-bold uppercase mt-1">Pendentes</p>
               </button>
               <button onClick={onViewActions} className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm hover:shadow-md transition-all text-left group">
                 <div className="flex justify-between items-start mb-2">
                   <div className="p-2 bg-blue-100 rounded-lg text-blue-600 group-hover:bg-blue-200"><Activity size={18}/></div>
                   <ArrowRight size={16} className="text-slate-300 opacity-0 group-hover:opacity-100 transition-all -translate-x-2 group-hover:translate-x-0" style={{color: 'var(--brand-color)'}}/>
                 </div>
                 <span className="text-2xl font-bold text-slate-800">{actionStats.inProgress}</span>
                 <p className="text-xs text-slate-500 font-bold uppercase mt-1">Em Andamento</p>
               </button>
               <button onClick={onViewActions} className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm hover:shadow-md transition-all text-left group">
                 <div className="flex justify-between items-start mb-2">
                   <div className="p-2 bg-red-100 rounded-lg text-red-600 group-hover:bg-red-200"><AlertTriangle size={18}/></div>
                   <ArrowRight size={16} className="text-slate-300 opacity-0 group-hover:opacity-100 transition-all -translate-x-2 group-hover:translate-x-0" style={{color: 'var(--brand-color)'}}/>
                 </div>
                 <span className="text-2xl font-bold text-slate-800">{actionStats.overdue}</span>
                 <p className="text-xs text-slate-500 font-bold uppercase mt-1">Atrasados</p>
               </button>
               <button onClick={onViewActions} className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm hover:shadow-md transition-all text-left group">
                 <div className="flex justify-between items-start mb-2">
                   <div className="p-2 bg-emerald-100 rounded-lg text-emerald-600 group-hover:bg-emerald-200"><ThumbsUp size={18}/></div>
                   <ArrowRight size={16} className="text-slate-300 opacity-0 group-hover:opacity-100 transition-all -translate-x-2 group-hover:translate-x-0" style={{color: 'var(--brand-color)'}}/>
                 </div>
                 <span className="text-2xl font-bold text-slate-800">{actionStats.completed}</span>
                 <p className="text-xs text-slate-500 font-bold uppercase mt-1">Concluídos</p>
               </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
                    <h3 className="font-bold text-slate-700 mb-6 flex items-center gap-2">
                        <TrendingUp size={20} className="text-blue-500"/> Evolução Anual
                    </h3>
                    <div className="h-56">
                        <ResponsiveContainer width="100%" height="100%">
                        <AreaChart data={timelineData}>
                            <defs>
                            <linearGradient id="colorNps" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor="var(--brand-color)" stopOpacity={0.8}/>
                                <stop offset="95%" stopColor="var(--brand-color)" stopOpacity={0}/>
                            </linearGradient>
                            </defs>
                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9"/>
                            <XAxis dataKey="name" tick={{fontSize: 10}} stroke="#94a3b8" interval={0} />
                            <YAxis hide domain={[-30, 100]}/>
                            <RechartsTooltip 
                                contentStyle={{borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'}}
                            />
                            <Area type="monotone" dataKey="nps" stroke="var(--brand-color)" strokeWidth={3} fillOpacity={1} fill="url(#colorNps)" />
                        </AreaChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 overflow-y-auto max-h-[320px]">
                    <h3 className="font-bold text-slate-700 mb-4 flex items-center gap-2 sticky top-0 bg-white pb-2 z-10">
                        <Building size={20} className="text-purple-500"/> Performance por Categoria
                    </h3>
                    <div className="space-y-4">
                        {categoryStats.map(cat => (
                        <div key={cat.id} className="flex items-center justify-between p-2 hover:bg-slate-50 rounded-lg transition-colors">
                            <div>
                                <span className="font-medium text-slate-700 block text-sm">{cat.name}</span>
                                <span className="text-[10px] text-slate-400">{cat.count} avaliações</span>
                            </div>
                            <div className="text-right">
                                <StarRating value={cat.value} />
                                <span className="text-xs font-bold text-slate-500 mt-1 block">{cat.value.toFixed(1)} / 5.0</span>
                            </div>
                        </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
      </div>
      
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6">
         <div className="flex flex-col sm:flex-row justify-between items-center mb-6 gap-4">
             <h3 className="font-bold text-slate-800 text-lg">Feedback dos Pacientes</h3>
             <div className="flex gap-2 bg-slate-100 p-1 rounded-lg">
                 <button 
                    onClick={() => setFeedFilter('all')}
                    className={`px-3 py-1.5 rounded-md text-xs font-bold transition-all ${feedFilter === 'all' ? 'bg-white shadow text-slate-800' : 'text-slate-500 hover:text-slate-700'}`}
                 >
                    Todos
                 </button>
                 <button 
                    onClick={() => setFeedFilter('promoters')}
                    className={`px-3 py-1.5 rounded-md text-xs font-bold transition-all flex items-center gap-1 ${feedFilter === 'promoters' ? 'bg-white shadow text-emerald-600' : 'text-slate-500 hover:text-slate-700'}`}
                 >
                    Promotores
                 </button>
                 <button 
                    onClick={() => setFeedFilter('detractors')}
                    className={`px-3 py-1.5 rounded-md text-xs font-bold transition-all flex items-center gap-1 ${feedFilter === 'detractors' ? 'bg-white shadow text-red-600' : 'text-slate-500 hover:text-slate-700'}`}
                 >
                    Detratores
                 </button>
             </div>
         </div>
         
         <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {feedComments.length > 0 ? feedComments.map((r, i) => (
                <div key={i} className={`p-4 rounded-xl border ${r.npsScore >= 9 ? 'bg-emerald-50/50 border-emerald-100' : r.npsScore <= 6 ? 'bg-red-50/50 border-red-100' : 'bg-slate-50 border-slate-100'}`}>
                    <div className="flex justify-between items-start mb-2">
                         <div className={`px-2 py-1 rounded text-xs font-bold ${r.npsScore >= 9 ? 'bg-emerald-100 text-emerald-700' : r.npsScore <= 6 ? 'bg-red-100 text-red-700' : 'bg-amber-100 text-amber-700'}`}>
                            NPS {r.npsScore}
                         </div>
                         <span className="text-[10px] text-slate-400">{new Date(r.date).toLocaleDateString()}</span>
                    </div>
                    <p className="text-sm text-slate-700 italic">"{r.comment}"</p>
                    <div className="mt-3 pt-3 border-t border-black/5 flex justify-between items-center">
                        <span className="text-[10px] font-bold text-slate-500 uppercase">{sectors.find(s => s.id === r.sectorId)?.name}</span>
                        <div className="flex items-center gap-1">
                             <AlertTriangle size={12} className="text-slate-400"/>
                        </div>
                    </div>
                </div>
            )) : (
                <div className="col-span-3 text-center py-10 text-slate-400">
                    <Filter size={40} className="mx-auto mb-2 opacity-20"/>
                    <p>Nenhum comentário encontrado com os filtros atuais.</p>
                    <button onClick={() => setFeedFilter('all')} className="mt-2 text-indigo-500 text-sm font-bold flex items-center justify-center gap-1 hover:underline">
                        <RotateCcw size={12}/> Limpar Filtros
                    </button>
                </div>
            )}
         </div>
      </div>

    </div>
  );
}