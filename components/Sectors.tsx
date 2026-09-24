
import React, { useState } from 'react';
import { Plus, Edit2, Activity } from 'lucide-react';
import { Sector, User, QuestionCategory } from './types';
import { HOSPITAL_ICONS } from './icons';

interface SectorsProps {
  sectors: Sector[];
  users: User[];
  categories: QuestionCategory[];
  onSave: (sector: Sector) => void;
}

export default function Sectors({ sectors, users, categories, onSave }: SectorsProps) {
  const [editingSector, setEditingSector] = useState<Sector | null>(null);

  const handleSave = () => {
    if (editingSector) {
      onSave(editingSector);
      setEditingSector(null);
    }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-slate-800">Gestão de Setores</h2>
        <button
          onClick={() => setEditingSector({ id: 'new', name: '', managerId: '', isActive: true, iconName: 'Activity', categories: [] })}
          className="bg-indigo-600 text-white px-4 py-2 rounded-lg flex gap-2 font-bold shadow-lg hover:bg-indigo-700"
        >
          <Plus size={18}/> Novo Setor
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {sectors.map(s => (
          <div key={s.id} className={`bg-white p-6 rounded-2xl shadow-sm border border-slate-200 transition-opacity ${!s.isActive ? 'opacity-60' : ''}`}>
            <div className="flex justify-between mb-4">
              <div className="p-3 bg-indigo-50 text-indigo-600 rounded-xl">
                {HOSPITAL_ICONS[s.iconName] || <Activity size={24} />}
              </div>
              <span className={`px-2 py-1 rounded text-xs font-bold h-fit ${s.isActive ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                {s.isActive ? 'Ativo' : 'Inativo'}
              </span>
            </div>
            <h3 className="font-bold text-lg mb-1">{s.name}</h3>
            <p className="text-sm text-slate-400 mb-4">
              Gestor: {users.find(u => u.id === s.managerId)?.name || <span className="text-amber-500 italic">Não vinculado</span>}
            </p>
            <div className="flex gap-1 flex-wrap mb-4">
               {s.categories.map(catId => {
                   const cat = categories.find(c => c.id === catId);
                   return cat ? <span key={catId} className="text-[10px] bg-slate-100 px-2 py-1 rounded border">{cat.label}</span> : null;
               })}
            </div>
            <button onClick={() => setEditingSector(s)} className="w-full py-2 border rounded-lg text-sm hover:bg-slate-50 flex items-center justify-center gap-2">
                <Edit2 size={14}/> Editar Configurações
            </button>
          </div>
        ))}
      </div>

      {/* MODAL DE EDIÇÃO */}
      {editingSector && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto p-6">
            <h3 className="font-bold text-xl mb-6 border-b pb-4">
              {editingSector.id === 'new' ? 'Criar Novo Setor' : `Editar: ${editingSector.name}`}
            </h3>
            
            <div className="space-y-6">
              {/* Nome */}
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-1">Nome do Setor</label>
                <input
                  className="w-full p-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
                  value={editingSector.name}
                  onChange={e => setEditingSector({...editingSector, name: e.target.value})}
                  placeholder="Ex: UTI Neonatal"
                />
              </div>

              {/* Gestor */}
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-1">Gestor Responsável</label>
                <select
                  className="w-full p-2 border border-slate-300 rounded-lg"
                  value={editingSector.managerId}
                  onChange={e => setEditingSector({...editingSector, managerId: e.target.value})}
                >
                  <option value="">Selecione um gestor...</option>
                  {users.filter(u => u.role === 'manager' && u.isActive).map(u => (
                    <option key={u.id} value={u.id}>{u.name}</option>
                  ))}
                </select>
              </div>

              {/* Categorias (Checkboxes) */}
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-2">Categorias de Perguntas</label>
                <div className="grid grid-cols-2 gap-3 p-4 bg-slate-50 rounded-xl border border-slate-200">
                  {categories.map(cat => (
                    <label key={cat.id} className="flex items-center gap-2 cursor-pointer hover:bg-white p-2 rounded transition-colors">
                      <input
                        type="checkbox"
                        checked={editingSector.categories.includes(cat.id)}
                        onChange={e => {
                          const newCats = e.target.checked
                            ? [...editingSector.categories, cat.id]
                            : editingSector.categories.filter(c => c !== cat.id);
                          setEditingSector({...editingSector, categories: newCats});
                        }}
                        className="w-4 h-4 text-indigo-600 rounded focus:ring-indigo-500"
                      />
                      <span className="text-sm">{cat.label}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Seletor Visual de Ícones (GRID) */}
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-2">Selecione um Ícone</label>
                <div className="grid grid-cols-6 sm:grid-cols-8 gap-2 max-h-40 overflow-y-auto p-2 border border-slate-300 rounded-lg bg-slate-50">
                  {Object.keys(HOSPITAL_ICONS).map(iconKey => (
                    <button
                      key={iconKey}
                      onClick={() => setEditingSector({...editingSector, iconName: iconKey})}
                      className={`p-2 rounded-lg flex items-center justify-center transition-all ${
                        editingSector.iconName === iconKey
                          ? 'bg-indigo-600 text-white scale-110 shadow-md'
                          : 'bg-white text-slate-500 hover:bg-indigo-100'
                      }`}
                      title={iconKey}
                    >
                      {HOSPITAL_ICONS[iconKey]}
                    </button>
                  ))}
                </div>
              </div>

              {/* Ativo */}
              <label className="flex items-center gap-3 p-4 border rounded-lg cursor-pointer bg-slate-50 hover:bg-white transition-colors">
                <input
                  type="checkbox"
                  checked={editingSector.isActive}
                  onChange={e => setEditingSector({...editingSector, isActive: e.target.checked})}
                  className="w-5 h-5 text-indigo-600 rounded"
                />
                <div>
                  <span className="font-bold text-slate-800">Setor Ativo</span>
                  <p className="text-xs text-slate-500">Se desmarcado, não aparecerá no Totem de pesquisa.</p>
                </div>
              </label>
            </div>

            <div className="mt-8 flex justify-end gap-3 pt-4 border-t">
              <button onClick={() => setEditingSector(null)} className="px-4 py-2 text-slate-500 hover:bg-slate-100 rounded-lg">Cancelar</button>
              <button onClick={handleSave} className="px-6 py-2 bg-indigo-600 text-white font-bold rounded-lg hover:bg-indigo-700 shadow-lg">Salvar</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
