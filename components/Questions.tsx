
import React, { useState } from 'react';
import { Plus, Trash2, Activity } from 'lucide-react';
import { QuestionCategory } from './types';
import { HOSPITAL_ICONS } from './icons';

interface QuestionsProps {
  categories: QuestionCategory[];
  onSave: (category: QuestionCategory) => void;
  onDelete: (id: string) => void;
}

export default function Questions({ categories, onSave, onDelete }: QuestionsProps) {
  const [editingCategory, setEditingCategory] = useState<QuestionCategory | null>(null);
  const [newQuestionText, setNewQuestionText] = useState('');

  const handleSave = () => {
    if (editingCategory) {
      if (!editingCategory.label) return alert("O nome da categoria é obrigatório");
      onSave(editingCategory);
      setEditingCategory(null);
    }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-slate-800">Categorias & Perguntas</h2>
        <button 
          onClick={() => setEditingCategory({ id: 'new', label: '', iconName: 'Activity', questions: [] })}
          className="bg-indigo-600 text-white px-4 py-2 rounded-lg flex gap-2 font-bold shadow-lg hover:bg-indigo-700"
        >
          <Plus size={18}/> Nova Categoria
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {categories.map(cat => (
          <div key={cat.id} className="bg-white p-6 rounded-xl shadow-sm border border-slate-200 flex flex-col justify-between h-full hover:shadow-md transition-shadow">
            <div>
              <div className="flex justify-between items-start mb-4">
                <div className="flex items-center gap-3">
                  <div className="p-2.5 bg-indigo-50 text-indigo-600 rounded-xl shadow-sm">
                    {HOSPITAL_ICONS[cat.iconName] || <Activity size={20}/>}
                  </div>
                  <h3 className="font-bold text-lg text-slate-800">{cat.label}</h3>
                </div>
                <button 
                  onClick={() => onDelete(cat.id)}
                  className="text-red-400 hover:text-red-600 hover:bg-red-50 p-1.5 rounded transition-colors"
                  title="Excluir Categoria"
                >
                  <Trash2 size={18}/>
                </button>
              </div>
              
              <div className="bg-slate-50 rounded-lg p-3 mb-4">
                <p className="text-xs font-bold text-slate-400 uppercase mb-2">Perguntas Ativas</p>
                <ul className="text-sm text-slate-600 space-y-2">
                  {cat.questions.slice(0, 4).map((q, i) => (
                    <li key={i} className="flex items-start gap-2">
                      <div className="w-1.5 h-1.5 bg-indigo-400 rounded-full mt-1.5 shrink-0"/> 
                      <span className="line-clamp-2">{q}</span>
                    </li>
                  ))}
                  {cat.questions.length > 4 && (
                    <li className="text-xs text-indigo-500 font-medium pl-3.5">
                      +{cat.questions.length - 4} perguntas...
                    </li>
                  )}
                  {cat.questions.length === 0 && (
                    <li className="text-slate-400 italic text-xs">Nenhuma pergunta cadastrada.</li>
                  )}
                </ul>
              </div>
            </div>
            
            <button 
              onClick={() => setEditingCategory(cat)}
              className="w-full border border-slate-200 py-2.5 rounded-lg text-sm text-slate-600 hover:bg-slate-50 font-bold transition-colors"
            >
              Gerenciar Perguntas
            </button>
          </div>
        ))}
      </div>

      {/* MODAL EDIÇÃO */}
      {editingCategory && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
          <div className="bg-white rounded-2xl p-6 w-full max-w-lg shadow-2xl max-h-[90vh] overflow-y-auto">
            <h3 className="font-bold text-xl mb-6 text-slate-800">
              {editingCategory.id === 'new' ? 'Nova Categoria' : 'Editar Categoria'}
            </h3>
            
            <div className="grid grid-cols-2 gap-4 mb-6">
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-1">Nome da Categoria</label>
                <input 
                  className="w-full border border-slate-300 p-2.5 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none" 
                  value={editingCategory.label} 
                  onChange={e => setEditingCategory({...editingCategory, label: e.target.value})}
                  placeholder="Ex: Nutrição"
                />
              </div>
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-1">Ícone</label>
                <select 
                  className="w-full border border-slate-300 p-2.5 rounded-lg bg-white focus:ring-2 focus:ring-indigo-500 outline-none"
                  value={editingCategory.iconName} 
                  onChange={e => setEditingCategory({...editingCategory, iconName: e.target.value})}
                >
                  {Object.keys(HOSPITAL_ICONS).map(k => <option key={k} value={k}>{k}</option>)}
                </select>
              </div>
            </div>

            <div className="border-t border-slate-100 pt-4">
              <h4 className="font-bold text-sm text-slate-700 mb-3 flex items-center gap-2">
                Perguntas Vinculadas <span className="bg-slate-100 text-slate-500 px-2 py-0.5 rounded-full text-xs">{editingCategory.questions.length}</span>
              </h4>
              
              <ul className="space-y-2 mb-4 max-h-60 overflow-y-auto custom-scrollbar pr-1">
                {editingCategory.questions.map((q, i) => (
                  <li key={i} className="flex justify-between items-center bg-slate-50 p-3 rounded-lg border border-slate-100 group hover:border-red-100 transition-colors">
                    <span className="text-sm text-slate-700">{q}</span>
                    <button 
                      onClick={() => setEditingCategory({
                        ...editingCategory, 
                        questions: editingCategory.questions.filter((_, idx) => idx !== i)
                      })}
                      className="text-slate-400 hover:text-red-500 p-1 rounded transition-colors"
                    >
                      <Trash2 size={16}/>
                    </button>
                  </li>
                ))}
              </ul>

              <div className="flex gap-2">
                <input 
                  className="flex-1 border border-slate-300 p-2.5 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 outline-none" 
                  placeholder="Digite uma nova pergunta..." 
                  value={newQuestionText} 
                  onChange={e => setNewQuestionText(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && newQuestionText.trim()) {
                      setEditingCategory({
                        ...editingCategory, 
                        questions: [...editingCategory.questions, newQuestionText.trim()]
                      });
                      setNewQuestionText('');
                    }
                  }}
                />
                <button 
                  onClick={() => {
                    if (newQuestionText.trim()) {
                      setEditingCategory({
                        ...editingCategory, 
                        questions: [...editingCategory.questions, newQuestionText.trim()]
                      });
                      setNewQuestionText('');
                    }
                  }} 
                  className="bg-slate-800 text-white px-4 rounded-lg font-bold text-sm hover:bg-slate-700 transition-colors"
                >
                  <Plus size={18}/>
                </button>
              </div>
            </div>

            <div className="mt-8 flex justify-end gap-3 pt-4 border-t border-slate-100">
              <button onClick={() => setEditingCategory(null)} className="px-5 py-2.5 text-slate-600 hover:bg-slate-100 rounded-lg font-medium transition-colors">Cancelar</button>
              <button onClick={handleSave} className="px-6 py-2.5 bg-indigo-600 text-white font-bold rounded-lg hover:bg-indigo-700 shadow-lg transition-colors">Salvar Alterações</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
