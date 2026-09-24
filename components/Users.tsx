
import React, { useState } from 'react';
import { Plus, Edit2, Lock, Power, Eye, EyeOff, KeyRound } from 'lucide-react';
import { User, UserRole } from './types';

interface UsersProps {
  users: User[];
  onSave: (user: User) => void;
  onResetPassword: (userId: string) => void;
}

export default function Users({ users, onSave, onResetPassword }: UsersProps) {
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [showPassword, setShowPassword] = useState(false);

  const handleSave = () => {
    if (editingUser) {
      if (editingUser.id === 'new' && !editingUser.password) {
        alert("Para novos usuários, a senha é obrigatória.");
        return;
      }
      onSave(editingUser);
      setEditingUser(null);
      setShowPassword(false);
    }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-slate-800">Gestão de Usuários</h2>
        <button
          onClick={() => {
              setEditingUser({ id: 'new', name: '', email: '', password: '', role: 'manager', isActive: true });
              setShowPassword(false);
          }}
          className="bg-indigo-600 text-white px-4 py-2 rounded-lg flex gap-2 font-bold shadow-lg hover:bg-indigo-700"
        >
          <Plus size={18}/> Novo Usuário
        </button>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
        <table className="w-full text-left text-sm">
          <thead className="bg-slate-50 text-slate-500 font-bold uppercase border-b">
            <tr>
              <th className="p-4">Nome</th>
              <th className="p-4">Email</th>
              <th className="p-4">Função</th>
              <th className="p-4">Status</th>
              <th className="p-4 text-right">Ações</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {users.map(u => (
              <tr key={u.id} className="hover:bg-slate-50">
                <td className="p-4 flex items-center gap-3">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center text-white font-bold ${u.avatarColor || 'bg-slate-400'}`}>
                    {u.name.charAt(0)}
                  </div>
                  <span className="font-medium text-slate-700">{u.name}</span>
                </td>
                <td className="p-4 text-slate-600">{u.email}</td>
                <td className="p-4">
                  <span className={`px-2 py-1 rounded text-xs font-bold ${u.role === 'admin' ? 'bg-purple-100 text-purple-700' : 'bg-blue-100 text-blue-700'}`}>
                    {u.role === 'admin' ? 'Administrador' : 'Gestor'}
                  </span>
                </td>
                <td className="p-4">
                  <span className={`px-2 py-1 rounded text-xs font-bold ${u.isActive ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                    {u.isActive ? 'Ativo' : 'Inativo'}
                  </span>
                </td>
                <td className="p-4 text-right">
                  <div className="flex items-center justify-end gap-2">
                    <button 
                        onClick={() => {
                            if(confirm(`Deseja redefinir a senha de "${u.name}" para o padrão (123456)?`)) {
                                onResetPassword(u.id);
                            }
                        }}
                        title="Redefinir Senha Padrão (123456)"
                        className="text-amber-500 hover:bg-amber-50 p-2 rounded"
                    >
                        <KeyRound size={16}/>
                    </button>
                    <button 
                        onClick={() => {
                            // Ao editar, limpa a senha visualmente para segurança.
                            setEditingUser({ ...u, password: '' });
                            setShowPassword(false);
                        }} 
                        className="text-blue-500 hover:bg-blue-50 p-2 rounded"
                        title="Editar Usuário"
                    >
                        <Edit2 size={16}/>
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* MODAL USUÁRIO */}
      {editingUser && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl p-6 w-full max-w-md shadow-2xl">
            <h3 className="font-bold text-xl mb-6">
              {editingUser.id === 'new' ? 'Novo Usuário' : 'Editar Usuário'}
            </h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-bold mb-1">Nome Completo</label>
                <input
                  className="w-full border p-2 rounded-lg"
                  value={editingUser.name}
                  onChange={e => setEditingUser({...editingUser, name: e.target.value})}
                />
              </div>
              <div>
                <label className="block text-sm font-bold mb-1">Email Corporativo</label>
                <input
                  className="w-full border p-2 rounded-lg"
                  value={editingUser.email}
                  onChange={e => setEditingUser({...editingUser, email: e.target.value})}
                />
              </div>
              <div>
                <label className="block text-sm font-bold mb-1">Senha</label>
                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    className="w-full border p-2 rounded-lg pr-10"
                    placeholder={editingUser.id === 'new' ? "Defina a senha obrigatória" : "Deixe em branco para manter a atual"}
                    value={editingUser.password || ''}
                    onChange={e => setEditingUser({...editingUser, password: e.target.value})}
                  />
                  <button 
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-2.5 text-slate-400 hover:text-slate-600"
                  >
                    {showPassword ? <EyeOff size={18}/> : <Eye size={18}/>}
                  </button>
                </div>
                {editingUser.id !== 'new' && (
                    <p className="text-xs text-slate-400 mt-1">
                        * A senha atual não é exibida por segurança. Digite uma nova para redefinir.
                    </p>
                )}
              </div>
              <div>
                <label className="block text-sm font-bold mb-1">Função</label>
                <select
                  className="w-full border p-2 rounded-lg"
                  value={editingUser.role}
                  onChange={e => setEditingUser({...editingUser, role: e.target.value as UserRole})}
                >
                  <option value="manager">Gestor de Setor</option>
                  <option value="admin">Administrador Geral</option>
                </select>
              </div>
              <label className="flex items-center gap-2 p-2 border rounded-lg bg-slate-50 cursor-pointer">
                <input
                  type="checkbox"
                  checked={editingUser.isActive}
                  onChange={e => setEditingUser({...editingUser, isActive: e.target.checked})}
                />
                <span className="text-sm font-bold">Usuário Ativo</span>
              </label>
            </div>
            <div className="mt-6 flex justify-end gap-2">
              <button onClick={() => setEditingUser(null)} className="px-4 py-2 text-slate-500 hover:bg-slate-100 rounded-lg">Cancelar</button>
              <button onClick={handleSave} className="px-4 py-2 bg-indigo-600 text-white font-bold rounded-lg hover:bg-indigo-700">Salvar</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
