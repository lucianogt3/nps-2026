
import React, { useState } from 'react';
import { Plus, Calendar, FileText, Printer, CheckCircle2, Circle, AlertCircle, Clock, Trash2, Edit2, ChevronDown, ChevronUp } from 'lucide-react';
import { MonthlyActionPlan, Sector, User, ActionItem5W2H } from './types';

interface ActionsProps {
  plans: MonthlyActionPlan[];
  sectors: Sector[];
  users: User[];
  onSavePlan: (plan: MonthlyActionPlan) => void;
}

export default function ActionsPage({ plans, sectors, users, onSavePlan }: ActionsProps) {
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth());
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [selectedSector, setSelectedSector] = useState<string>('all');
  
  const [editingPlan, setEditingPlan] = useState<MonthlyActionPlan | null>(null);
  const [editingItem, setEditingItem] = useState<Partial<ActionItem5W2H> | null>(null);

  // Filtrar planos visíveis
  const filteredPlans = plans.filter(p => {
    return p.month === selectedMonth && 
           p.year === selectedYear && 
           (selectedSector === 'all' || p.sectorId === selectedSector);
  });

  const handleCreatePlan = () => {
    if (selectedSector === 'all') {
        alert("Selecione um setor específico para criar um plano.");
        return;
    }
    const newPlan: MonthlyActionPlan = {
        id: `plan-${Date.now()}`,
        month: selectedMonth,
        year: selectedYear,
        sectorId: selectedSector,
        managerId: sectors.find(s => s.id === selectedSector)?.managerId || '',
        items: [],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
    };
    setEditingPlan(newPlan);
  };

  const handleSaveItem = () => {
    if (!editingPlan || !editingItem || !editingItem.what) return;
    
    const newItem: ActionItem5W2H = {
        id: editingItem.id || `item-${Date.now()}`,
        what: editingItem.what || '',
        why: editingItem.why || '',
        where: editingItem.where || '',
        who: editingItem.who || '',
        when: editingItem.when || '',
        how: editingItem.how || '',
        howMuch: editingItem.howMuch || '',
        status: editingItem.status || 'pending'
    };

    const updatedItems = editingItem.id 
        ? editingPlan.items.map(i => i.id === newItem.id ? newItem : i)
        : [...editingPlan.items, newItem];

    setEditingPlan({ ...editingPlan, items: updatedItems, updatedAt: new Date().toISOString() });
    setEditingItem(null);
  };

  const handlePrint = () => {
    window.print();
  };

  // Status Badge Helper
  const StatusBadge = ({ status, date }: { status: string, date: string }) => {
    const isOverdue = new Date(date) < new Date() && status !== 'done';
    
    if (status === 'done') return <span className="bg-emerald-100 text-emerald-700 px-2 py-1 rounded text-xs font-bold flex items-center gap-1 w-fit"><CheckCircle2 size={12}/> Concluído</span>;
    if (isOverdue) return <span className="bg-red-100 text-red-700 px-2 py-1 rounded text-xs font-bold flex items-center gap-1 w-fit"><AlertCircle size={12}/> Atrasado</span>;
    if (status === 'in_progress') return <span className="bg-blue-100 text-blue-700 px-2 py-1 rounded text-xs font-bold flex items-center gap-1 w-fit"><Clock size={12}/> Andamento</span>;
    return <span className="bg-slate-100 text-slate-600 px-2 py-1 rounded text-xs font-bold flex items-center gap-1 w-fit"><Circle size={12}/> Pendente</span>;
  };

  return (
    <div className="space-y-6 animate-fade-in print:p-0 print:bg-white">
      {/* HEADER CONTROLS (Hide on Print) */}
      <div className="flex flex-col md:flex-row justify-between items-center bg-white p-4 rounded-xl border border-slate-200 shadow-sm print:hidden">
        <div>
           <h2 className="text-2xl font-bold text-slate-800">Planos de Ação 5W2H</h2>
           <p className="text-sm text-slate-500">Gestão e acompanhamento de melhorias</p>
        </div>
        <div className="flex gap-2 items-center mt-4 md:mt-0">
            <select 
              value={selectedSector} 
              onChange={e => setSelectedSector(e.target.value)}
              className="bg-slate-50 border border-slate-200 rounded-lg p-2 text-sm font-bold outline-none"
            >
              <option value="all">Todos os Setores</option>
              {sectors.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
            </select>
            <div className="flex bg-slate-50 rounded-lg border border-slate-200">
               <select 
                  value={selectedMonth} 
                  onChange={e => setSelectedMonth(Number(e.target.value))}
                  className="bg-transparent p-2 text-sm outline-none font-bold"
                >
                  {Array.from({length: 12}).map((_, i) => (
                    <option key={i} value={i}>{new Date(2024, i, 1).toLocaleDateString('pt-BR', {month: 'long'})}</option>
                  ))}
                </select>
                <select 
                  value={selectedYear} 
                  onChange={e => setSelectedYear(Number(e.target.value))}
                  className="bg-transparent p-2 text-sm outline-none font-bold border-l border-slate-200"
                >
                  <option value={2024}>2024</option>
                  <option value={2025}>2025</option>
                </select>
            </div>
            <button onClick={handleCreatePlan} className="bg-indigo-600 hover:bg-indigo-700 text-white p-2 rounded-lg transition-colors">
                <Plus size={20}/>
            </button>
        </div>
      </div>

      {/* LISTA DE PLANOS */}
      {!editingPlan ? (
          <div className="space-y-4">
              {filteredPlans.length === 0 ? (
                  <div className="text-center py-20 bg-white rounded-2xl border border-dashed border-slate-300">
                      <FileText size={48} className="mx-auto text-slate-300 mb-4"/>
                      <h3 className="text-lg font-bold text-slate-600">Nenhum plano encontrado</h3>
                      <p className="text-slate-400">Selecione um setor e clique em + para iniciar um plano 5W2H.</p>
                  </div>
              ) : (
                  <div className="grid grid-cols-1 gap-4">
                      {filteredPlans.map(plan => (
                          <div key={plan.id} className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm hover:shadow-md transition-all cursor-pointer group" onClick={() => setEditingPlan(plan)}>
                              <div className="flex justify-between items-start">
                                  <div>
                                      <h3 className="text-lg font-bold text-slate-800 flex items-center gap-2">
                                          {sectors.find(s => s.id === plan.sectorId)?.name}
                                          <span className="text-xs font-normal text-slate-400 bg-slate-100 px-2 py-0.5 rounded-full">
                                              {new Date(2024, plan.month, 1).toLocaleDateString('pt-BR', {month:'long'})}/{plan.year}
                                          </span>
                                      </h3>
                                      <p className="text-sm text-slate-500 mt-1">
                                          Gestor: {users.find(u => u.id === plan.managerId)?.name || 'N/A'} • {plan.items.length} ações mapeadas
                                      </p>
                                  </div>
                                  <div className="flex items-center gap-4">
                                      <div className="text-right">
                                         <span className="block text-2xl font-bold text-slate-700">{plan.items.filter(i => i.status === 'done').length}/{plan.items.length}</span>
                                         <span className="text-[10px] uppercase font-bold text-slate-400">Concluídos</span>
                                      </div>
                                      <div className="h-10 w-10 rounded-full bg-slate-50 flex items-center justify-center group-hover:bg-indigo-50 group-hover:text-indigo-600 transition-colors">
                                          <Edit2 size={18} />
                                      </div>
                                  </div>
                              </div>
                              {/* Barra de Progresso */}
                              <div className="mt-4 h-2 bg-slate-100 rounded-full overflow-hidden">
                                  <div 
                                    className="h-full bg-indigo-500 transition-all duration-500" 
                                    style={{ width: `${plan.items.length > 0 ? (plan.items.filter(i => i.status === 'done').length / plan.items.length) * 100 : 0}%` }}
                                  ></div>
                              </div>
                          </div>
                      ))}
                  </div>
              )}
          </div>
      ) : (
          // --- MODO EDIÇÃO / VISUALIZAÇÃO DETALHADA ---
          <div className="bg-white min-h-[80vh] rounded-xl shadow-lg flex flex-col print:shadow-none">
              
              {/* Toolbar */}
              <div className="p-6 border-b border-slate-200 flex justify-between items-center bg-slate-50 rounded-t-xl print:hidden">
                  <button onClick={() => {onSavePlan(editingPlan); setEditingPlan(null);}} className="text-slate-500 hover:text-slate-800 font-bold flex items-center gap-2 text-sm">
                      <ChevronDown className="rotate-90" size={16}/> Voltar para Lista
                  </button>
                  <div className="flex gap-2">
                      <button onClick={handlePrint} className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-300 rounded-lg text-slate-700 font-bold hover:bg-slate-50">
                          <Printer size={16}/> Imprimir
                      </button>
                      <button onClick={() => {onSavePlan(editingPlan); setEditingPlan(null);}} className="flex items-center gap-2 px-6 py-2 bg-indigo-600 text-white rounded-lg font-bold hover:bg-indigo-700 shadow-lg">
                          Salvar Plano
                      </button>
                  </div>
              </div>

              {/* Cabeçalho do Relatório (Visible on Print) */}
              <div className="p-8 pb-4">
                  <div className="flex justify-between items-end border-b-2 border-slate-800 pb-4 mb-6">
                      <div>
                          <h1 className="text-3xl font-extrabold text-slate-900 uppercase tracking-tight">Plano de Ação 5W2H</h1>
                          <p className="text-slate-500 font-medium mt-1">Setor: {sectors.find(s => s.id === editingPlan.sectorId)?.name}</p>
                      </div>
                      <div className="text-right">
                          <p className="text-sm font-bold text-slate-400 uppercase">Referência</p>
                          <p className="text-xl font-bold text-slate-800 capitalize">{new Date(2024, editingPlan.month, 1).toLocaleDateString('pt-BR', {month: 'long'})} {editingPlan.year}</p>
                      </div>
                  </div>

                  {/* Tabela de Ações */}
                  <div className="overflow-x-auto">
                      <table className="w-full text-left text-sm border-collapse">
                          <thead>
                              <tr className="bg-slate-100 text-slate-600 uppercase text-xs font-extrabold tracking-wider">
                                  <th className="p-3 border border-slate-200">Status</th>
                                  <th className="p-3 border border-slate-200 w-1/4">What (O que)</th>
                                  <th className="p-3 border border-slate-200">Why (Por que)</th>
                                  <th className="p-3 border border-slate-200">Who (Quem)</th>
                                  <th className="p-3 border border-slate-200">When (Quando)</th>
                                  <th className="p-3 border border-slate-200">How Much (Custo)</th>
                                  <th className="p-3 border border-slate-200 print:hidden text-center">Ações</th>
                              </tr>
                          </thead>
                          <tbody>
                              {editingPlan.items.map((item, idx) => (
                                  <tr key={item.id} className={idx % 2 === 0 ? 'bg-white' : 'bg-slate-50/50'}>
                                      <td className="p-3 border border-slate-200">
                                          <StatusBadge status={item.status} date={item.when} />
                                      </td>
                                      <td className="p-3 border border-slate-200 font-medium text-slate-800">{item.what}</td>
                                      <td className="p-3 border border-slate-200 text-slate-600">{item.why}</td>
                                      <td className="p-3 border border-slate-200">{item.who}</td>
                                      <td className="p-3 border border-slate-200 whitespace-nowrap">{new Date(item.when).toLocaleDateString()}</td>
                                      <td className="p-3 border border-slate-200">{item.howMuch}</td>
                                      <td className="p-3 border border-slate-200 print:hidden text-center">
                                          <div className="flex justify-center gap-2">
                                              <button onClick={() => setEditingItem(item)} className="text-blue-500 hover:bg-blue-50 p-1.5 rounded"><Edit2 size={14}/></button>
                                              <button onClick={() => setEditingPlan({...editingPlan, items: editingPlan.items.filter(i => i.id !== item.id)})} className="text-red-500 hover:bg-red-50 p-1.5 rounded"><Trash2 size={14}/></button>
                                          </div>
                                      </td>
                                  </tr>
                              ))}
                              {editingPlan.items.length === 0 && (
                                  <tr>
                                      <td colSpan={7} className="p-8 text-center text-slate-400 italic">Nenhuma ação cadastrada neste plano.</td>
                                  </tr>
                              )}
                          </tbody>
                      </table>
                  </div>

                  <button 
                    onClick={() => setEditingItem({})} 
                    className="mt-6 w-full py-3 border-2 border-dashed border-slate-300 rounded-lg text-slate-500 font-bold hover:border-indigo-500 hover:text-indigo-600 hover:bg-indigo-50 transition-all flex items-center justify-center gap-2 print:hidden"
                  >
                      <Plus size={20}/> Adicionar Nova Ação 5W2H
                  </button>
              </div>
          </div>
      )}

      {/* MODAL EDITAR ITEM */}
      {editingItem && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 backdrop-blur-sm print:hidden">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
                <div className="p-6 border-b border-slate-100 flex justify-between items-center">
                    <h3 className="text-xl font-bold text-slate-800">Detalhes da Ação (5W2H)</h3>
                    <button onClick={() => setEditingItem(null)} className="text-slate-400 hover:text-slate-600"><ChevronDown/></button>
                </div>
                
                <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="col-span-2">
                        <label className="block text-xs font-bold text-slate-500 uppercase mb-1">WHAT (O que será feito?)</label>
                        <input className="w-full p-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none" 
                            placeholder="Descreva a ação..." 
                            value={editingItem.what || ''} 
                            onChange={e => setEditingItem({...editingItem, what: e.target.value})}
                        />
                    </div>
                    <div>
                        <label className="block text-xs font-bold text-slate-500 uppercase mb-1">WHY (Por que?)</label>
                        <textarea className="w-full p-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none h-24 resize-none" 
                            placeholder="Justificativa..." 
                            value={editingItem.why || ''} 
                            onChange={e => setEditingItem({...editingItem, why: e.target.value})}
                        />
                    </div>
                    <div className="space-y-4">
                         <div>
                            <label className="block text-xs font-bold text-slate-500 uppercase mb-1">WHO (Quem fará?)</label>
                            <input className="w-full p-3 border border-slate-300 rounded-lg outline-none" 
                                placeholder="Responsável" 
                                value={editingItem.who || ''} 
                                onChange={e => setEditingItem({...editingItem, who: e.target.value})}
                            />
                         </div>
                         <div>
                            <label className="block text-xs font-bold text-slate-500 uppercase mb-1">WHEN (Prazo)</label>
                            <input type="date" className="w-full p-3 border border-slate-300 rounded-lg outline-none" 
                                value={editingItem.when || ''} 
                                onChange={e => setEditingItem({...editingItem, when: e.target.value})}
                            />
                         </div>
                    </div>
                    
                    <div>
                        <label className="block text-xs font-bold text-slate-500 uppercase mb-1">HOW (Como?)</label>
                        <input className="w-full p-3 border border-slate-300 rounded-lg outline-none" 
                            placeholder="Método..." 
                            value={editingItem.how || ''} 
                            onChange={e => setEditingItem({...editingItem, how: e.target.value})}
                        />
                    </div>
                    <div>
                        <label className="block text-xs font-bold text-slate-500 uppercase mb-1">HOW MUCH (Quanto Custa?)</label>
                        <input className="w-full p-3 border border-slate-300 rounded-lg outline-none" 
                            placeholder="R$ 0,00" 
                            value={editingItem.howMuch || ''} 
                            onChange={e => setEditingItem({...editingItem, howMuch: e.target.value})}
                        />
                    </div>
                    <div className="col-span-2 mt-2 pt-4 border-t border-slate-100">
                         <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Status da Ação</label>
                         <div className="flex gap-4">
                             {['pending', 'in_progress', 'done'].map(s => (
                                 <label key={s} className={`flex-1 p-3 rounded-lg border cursor-pointer flex items-center justify-center gap-2 transition-all ${editingItem.status === s ? 'bg-indigo-50 border-indigo-500 ring-1 ring-indigo-500' : 'bg-white border-slate-200 hover:bg-slate-50'}`}>
                                     <input type="radio" name="status" className="hidden" 
                                        checked={editingItem.status === s} 
                                        onChange={() => setEditingItem({...editingItem, status: s as any})}
                                     />
                                     <span className="text-sm font-bold capitalize">{s === 'pending' ? 'Pendente' : s === 'in_progress' ? 'Em Andamento' : 'Concluído'}</span>
                                 </label>
                             ))}
                         </div>
                    </div>
                </div>

                <div className="p-6 border-t border-slate-100 flex justify-end gap-3 bg-slate-50 rounded-b-2xl">
                    <button onClick={() => setEditingItem(null)} className="px-5 py-2.5 text-slate-500 hover:text-slate-800 font-bold">Cancelar</button>
                    <button onClick={handleSaveItem} className="px-6 py-2.5 bg-indigo-600 text-white rounded-lg font-bold hover:bg-indigo-700 shadow-lg">Confirmar Ação</button>
                </div>
            </div>
        </div>
      )}
    </div>
  );
}
