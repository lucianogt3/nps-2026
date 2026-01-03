import React, { useState, useEffect } from 'react';
import { createRoot } from 'react-dom/client';
import { Activity, LayoutDashboard, ClipboardList, Users, Settings, LogOut, Menu, MonitorPlay, Globe, BookOpenCheck, LockKeyhole } from 'lucide-react';

// Componentes
import Portfolio from './Portfolio';
import Dashboard from './Dashboard';
import Sectors from './Sectors';
import UsersPage from './Users';
import Questions from './Questions';
import ActionsPage from './Actions';
import GlobalSettings from './GlobalSettings';
import Kiosk from './Kiosk'; // Componente Separado
import { Sector, User, QuestionCategory, SurveyResponse, AppConfig, ViewState, MonthlyActionPlan } from './types';
import { fetchFromServer, sendToServer } from './api';

// Dados Iniciais e Configurações
const DEFAULT_CONFIG: AppConfig = { 
  hospitalName: 'Hospital Santa Helena', 
  logoUrl: '', 
  brandColor: '#be123c',
  sidebarBgColor: '#0f172a', // Slate 900
  sidebarTextColor: '#ffffff',
  kioskBgColor: '#f8fafc', // Slate 50
  kioskTextColor: '#1e293b', // Slate 800
  kioskCardBgColor: '#ffffff',
  // Configuração Padrão para conectar ao Servidor Local criado (Porta 4000)
  customApiUrl: 'http://localhost:4000/api/sync',
  customApiKey: 'segredo-123'
};

const DEFAULT_ADMIN: User = { id: 'admin', name: 'Administrador', email: 'admin@sistema.com', password: '123', role: 'admin', avatarColor: 'bg-slate-800', isActive: true };

// --- DADOS EXTRAÍDOS DO PDF ---
// Serão usados apenas se o banco de dados (db.json) estiver vazio ou offline.

const INITIAL_CATEGORIES: QuestionCategory[] = [
  // 1. Recepção
  { 
    id: 'CAT_RECEP_CONS', 
    label: 'Recepção (Consultórios)', 
    iconName: 'UserPlus', 
    questions: ['Tratamento com cortesia e respeito?', 'Escuta atenta?', 'Comunicação efetiva?', 'Facilidade para agendar retorno?'] 
  },
  { 
    id: 'CAT_RECEP_IMG', 
    label: 'Recepção (Imagem)', 
    iconName: 'UserPlus', 
    questions: ['Tratamento com cortesia e respeito?', 'Escuta atenta?', 'Comunicação efetiva?', 'Facilidade para agendar?', 'Entregas de resultados?'] 
  },
   { 
    id: 'CAT_RECEP_PS', 
    label: 'Recepção (PS)', 
    iconName: 'UserPlus', 
    questions: ['Tratamento com cortesia e respeito?', 'Escuta atenta?', 'Comunicação efetiva?', 'Demora para início do atendimento?'] 
  },

  // 2. Equipes Médicas
  { 
    id: 'CAT_MED_CONS', 
    label: 'Médicos (Consultório)', 
    iconName: 'Stethoscope', 
    questions: ['Tratamento com cortesia e respeito?', 'Escuta atenta?', 'Comunicação efetiva?', 'Explicação do uso de medicamentos?', 'Demora para início da consulta?'] 
  },
  { 
    id: 'CAT_MED_GERAL', 
    label: 'Equipe Médica (Geral)', 
    iconName: 'Stethoscope', 
    questions: ['Tratamento com cortesia e respeito?', 'Escuta atenta?', 'Comunicação efetiva?', 'Explicação do diagnóstico?'] 
  },

  // 3. Enfermagem
  { 
    id: 'CAT_ENF_PS', 
    label: 'Enfermagem (Acolhimento PS)', 
    iconName: 'Heart', 
    questions: ['Tratamento com cortesia e respeito?', 'Escuta atenta?', 'Comunicação efetiva?', 'Demora para início do atendimento?'] 
  },
  { 
    id: 'CAT_ENF_GERAL', 
    label: 'Equipe de Enfermagem', 
    iconName: 'Heart', 
    questions: ['Tratamento com cortesia e respeito?', 'Escuta atenta?', 'Comunicação efetiva?', 'Ajudou logo que necessitava?', 'Explicação do uso de medicamentos?', 'Demora para passar visita?'] 
  },
  {
    id: 'CAT_TEC_IMG',
    label: 'Técnicos (Imagem)',
    iconName: 'Eye',
    questions: ['Tratamento com cortesia e respeito?', 'Escuta atenta?', 'Comunicação efetiva?', 'Demora para início do exame?']
  },
  {
    id: 'CAT_TEC_LAB',
    label: 'Técnicos (Laboratório)',
    iconName: 'Beaker',
    questions: ['Tratamento com cortesia e respeito?', 'Escuta atenta?', 'Comunicação efetiva?', 'Demora para início da coleta?']
  },

  // 4. Multidisciplinar
  { id: 'CAT_FISIO', label: 'Fisioterapia', iconName: 'Activity', questions: ['Tratamento com cortesia e respeito?', 'Escuta atenta?', 'Comunicação efetiva?'] },
  { id: 'CAT_NUTRI', label: 'Nutricionistas', iconName: 'Utensils', questions: ['Tratamento com cortesia e respeito?', 'Escuta atenta?', 'Comunicação efetiva?'] },
  { id: 'CAT_FONO', label: 'Fonoaudiologia', iconName: 'Ear', questions: ['Tratamento com cortesia e respeito?', 'Escuta atenta?', 'Comunicação efetiva?'] },
  { id: 'CAT_PSICO', label: 'Psicologia', iconName: 'Brain', questions: ['Tratamento com cortesia e respeito?', 'Escuta atenta?', 'Comunicação efetiva?'] },

  // 5. Apoio e Hotelaria
  { id: 'CAT_COND', label: 'Condutores / Maqueiros', iconName: 'Truck', questions: ['Tratamento com cortesia e respeito?', 'Demora para transportar?'] },
  { id: 'CAT_AMB', label: 'Ambiente', iconName: 'Sparkles', questions: ['Limpeza do local?', 'Nível de silêncio?', 'Conforto térmico?'] },
  { id: 'CAT_REF', label: 'Refeição', iconName: 'Utensils', questions: ['Apresentação?', 'Quantidade?', 'Sabor?', 'Temperatura?', 'Variedade?'] },
  
  // 6. Especial
  { id: 'CAT_CUIDADO', label: 'Cuidado Centrado no Paciente', iconName: 'Heart', questions: ['Consideração das suas preferências?', 'Envolvimento da família nas decisões?'] },
  { id: 'CAT_INTERNACAO', label: 'Necessidade de Internação', iconName: 'Bed', questions: ['Clareza nas informações sobre a internação?'] }
];

const INITIAL_SECTORS: Sector[] = [
  { 
    id: 'consultorios', 
    name: 'Consultórios Médicos', 
    managerId: '', 
    isActive: true, 
    iconName: 'Stethoscope', 
    categories: ['CAT_RECEP_CONS', 'CAT_MED_CONS', 'CAT_AMB'] 
  },
  { 
    id: 'imagem', 
    name: 'Diagnóstico por Imagem', 
    managerId: '', 
    isActive: true, 
    iconName: 'Eye', 
    categories: ['CAT_RECEP_IMG', 'CAT_TEC_IMG', 'CAT_AMB'] 
  },
  { 
    id: 'cardio', 
    name: 'Exames Cardiológicos', 
    managerId: '', 
    isActive: true, 
    iconName: 'Heart', 
    categories: ['CAT_RECEP_CONS', 'CAT_MED_GERAL', 'CAT_AMB'] 
  },
  { 
    id: 'hemo', 
    name: 'Hemodinâmica', 
    managerId: '', 
    isActive: true, 
    iconName: 'Activity', 
    categories: ['CAT_RECEP_CONS', 'CAT_ENF_GERAL', 'CAT_MED_GERAL', 'CAT_AMB', 'CAT_INTERNACAO'] 
  },
  { 
    id: 'lab', 
    name: 'Laboratório Saúde', 
    managerId: '', 
    isActive: true, 
    iconName: 'Beaker', 
    categories: ['CAT_RECEP_CONS', 'CAT_TEC_LAB', 'CAT_AMB'] 
  },
  { 
    id: 'ps', 
    name: 'Pronto Socorro', 
    managerId: '', 
    isActive: true, 
    iconName: 'Ambulance', 
    categories: [
      'CAT_RECEP_PS', 
      'CAT_ENF_PS', 
      'CAT_MED_GERAL', 
      'CAT_ENF_GERAL',
      'CAT_TEC_LAB', 
      'CAT_TEC_IMG', 
      'CAT_COND', 
      'CAT_AMB'
    ] 
  },
  { 
    id: 'internacao', 
    name: 'Unidades de Internação', 
    managerId: '', 
    isActive: true, 
    iconName: 'Bed', 
    categories: [
      'CAT_MED_GERAL', 
      'CAT_ENF_GERAL', 
      'CAT_FISIO', 
      'CAT_NUTRI', 
      'CAT_FONO', 
      'CAT_PSICO', 
      'CAT_TEC_LAB', 
      'CAT_TEC_IMG', 
      'CAT_REF', 
      'CAT_AMB', 
      'CAT_COND', 
      'CAT_CUIDADO'
    ] 
  },
  { 
    id: 'uti', 
    name: 'UTI (Terapia Intensiva)', 
    managerId: '', 
    isActive: true, 
    iconName: 'Siren', 
    categories: [
      'CAT_MED_GERAL', 
      'CAT_ENF_GERAL', 
      'CAT_FISIO', 
      'CAT_NUTRI', 
      'CAT_FONO', 
      'CAT_PSICO', 
      'CAT_TEC_LAB', 
      'CAT_TEC_IMG', 
      'CAT_REF', 
      'CAT_AMB', 
      'CAT_COND', 
      'CAT_CUIDADO'
    ] 
  }
];

export default function App() {
  // --- Estados Globais ---
  const [view, setView] = useState<ViewState>('login');
  const [user, setUser] = useState<User | null>(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // --- PERSISTÊNCIA LOCAL STORAGE (Fallback) ---
  const loadState = <T,>(key: string, defaultVal: T): T => {
    try {
      const saved = localStorage.getItem(key);
      return saved ? JSON.parse(saved) : defaultVal;
    } catch (e) {
      console.error("Erro ao carregar dados locais", e);
      return defaultVal;
    }
  };

  const [config, setConfig] = useState<AppConfig>(() => loadState('nps_config', DEFAULT_CONFIG));
  const [sectors, setSectors] = useState<Sector[]>(() => loadState('nps_sectors', INITIAL_SECTORS));
  const [users, setUsers] = useState<User[]>(() => loadState('nps_users', [DEFAULT_ADMIN]));
  const [categories, setCategories] = useState<QuestionCategory[]>(() => loadState('nps_categories', INITIAL_CATEGORIES));
  const [responses, setResponses] = useState<SurveyResponse[]>(() => loadState('nps_responses', []));
  const [actionPlans, setActionPlans] = useState<MonthlyActionPlan[]>(() => loadState('nps_actions', []));

  // --- SINCRONIZAÇÃO COM SERVIDOR (BACKEND) ---
  // Tenta carregar dados do servidor ao iniciar
  useEffect(() => {
    const initData = async () => {
        if (!config.customApiUrl) return;

        try {
            const data = await fetchFromServer(config.customApiUrl, config.customApiKey);
            console.log("Conectado ao Servidor Backend!", data);

            // Se o servidor retornar dados (mesmo que arrays vazios), usamos eles.
            // Isso garante que o DB do servidor seja a fonte da verdade.
            if (data) {
                if (data.config && Object.keys(data.config).length > 0) setConfig(data.config);
                if (data.sectors) setSectors(data.sectors.length > 0 ? data.sectors : INITIAL_SECTORS); // Usa inicial se vazio pra não quebrar
                if (data.users) setUsers(data.users.length > 0 ? data.users : [DEFAULT_ADMIN]);
                if (data.categories) setCategories(data.categories.length > 0 ? data.categories : INITIAL_CATEGORIES);
                if (data.responses) setResponses(data.responses);
                if (data.actionPlans) setActionPlans(data.actionPlans);
            }
        } catch (error) {
            console.warn("Servidor Backend Offline ou não configurado. Usando dados locais.", error);
        }
    };

    initData();
  }, [config.customApiUrl]); 

  // --- SINCRONIZADORES (Observam mudanças e enviam para o servidor) ---
  
  // Config
  useEffect(() => { 
      localStorage.setItem('nps_config', JSON.stringify(config));
      if(config.customApiUrl) sendToServer(config.customApiUrl, 'config', config, config.customApiKey);
  }, [config]);

  // Setores
  useEffect(() => { 
      localStorage.setItem('nps_sectors', JSON.stringify(sectors));
      if(config.customApiUrl) sendToServer(config.customApiUrl, 'sectors', sectors, config.customApiKey);
  }, [sectors]);

  // Usuários
  useEffect(() => { 
      localStorage.setItem('nps_users', JSON.stringify(users));
      if(config.customApiUrl) sendToServer(config.customApiUrl, 'users', users, config.customApiKey);
  }, [users]);

  // Categorias
  useEffect(() => { 
      localStorage.setItem('nps_categories', JSON.stringify(categories));
      if(config.customApiUrl) sendToServer(config.customApiUrl, 'categories', categories, config.customApiKey);
  }, [categories]);

  // Respostas
  useEffect(() => { 
      localStorage.setItem('nps_responses', JSON.stringify(responses));
      if(config.customApiUrl) sendToServer(config.customApiUrl, 'responses', responses, config.customApiKey);
  }, [responses]);

  // Planos de Ação
  useEffect(() => { 
      localStorage.setItem('nps_actions', JSON.stringify(actionPlans));
      if(config.customApiUrl) sendToServer(config.customApiUrl, 'actionPlans', actionPlans, config.customApiKey);
  }, [actionPlans]);
  
  // --- Efeito para CSS Variables ---
  useEffect(() => {
    const root = document.documentElement;
    root.style.setProperty('--brand-color', config.brandColor);
    root.style.setProperty('--sidebar-bg', config.sidebarBgColor);
    root.style.setProperty('--sidebar-text', config.sidebarTextColor);
    root.style.setProperty('--kiosk-bg', config.kioskBgColor);
    root.style.setProperty('--kiosk-text', config.kioskTextColor);
    root.style.setProperty('--kiosk-card-bg', config.kioskCardBgColor);
  }, [config]);

  // --- Lógica de Permissão de Setores ---
  const visibleSectors = React.useMemo(() => {
    if (!user) return [];
    if (user.role === 'admin') return sectors;
    return sectors.filter(s => s.managerId === user.id);
  }, [sectors, user]);

  // --- Handlers ---
  const handleSaveSector = (sector: Sector) => {
    if (sector.id === 'new') {
      setSectors([...sectors, { ...sector, id: `sec-${Date.now()}` }]);
    } else {
      setSectors(sectors.map(s => s.id === sector.id ? sector : s));
    }
  };

  const handleSaveUser = (u: User) => {
    if (u.id === 'new' || u.id.startsWith('new')) {
      setUsers([...users, { ...u, id: `usr-${Date.now()}` }]);
    } else {
      setUsers(users.map(x => {
        if (x.id === u.id) {
           return { ...u, password: u.password ? u.password : x.password };
        }
        return x;
      }));
    }
  };

  const handleResetPassword = (userId: string) => {
      setUsers(users.map(u => u.id === userId ? { ...u, password: '123456' } : u));
      alert("Senha redefinida para '123456'. O usuário deverá trocá-la no próximo login.");
  };

  const handleChangePassword = (newPass: string) => {
      if (!user) return;
      if (newPass === '123456' || newPass.length < 4) {
          alert("Por segurança, escolha uma senha diferente da padrão.");
          return;
      }
      const updatedUser = { ...user, password: newPass };
      setUsers(users.map(u => u.id === user.id ? updatedUser : u));
      setUser(updatedUser);
      setView('dashboard');
  };

  const handleSaveCategory = (cat: QuestionCategory) => {
    if (cat.id === 'new') {
      setCategories([...categories, { ...cat, id: `cat-${Date.now()}` }]);
    } else {
      setCategories(categories.map(c => c.id === cat.id ? cat : c));
    }
  };

  const handleDeleteCategory = (id: string) => {
    setCategories(categories.filter(c => c.id !== id));
  };

  const handleSavePlan = (plan: MonthlyActionPlan) => {
    if (actionPlans.find(p => p.id === plan.id)) {
      setActionPlans(actionPlans.map(p => p.id === plan.id ? plan : p));
    } else {
      setActionPlans([...actionPlans, plan]);
    }
  };

  const handleKioskSubmit = (response: SurveyResponse) => {
      setResponses(prev => [response, ...prev]);
  };

  const handleGenerateDemoData = () => {
    alert("Dados de demonstração gerados!");
  };

  // --- EXPORTAR DADOS ---
  const handleExportData = () => {
      const dataToExport = {
          version: '1.0',
          exportedAt: new Date().toISOString(),
          config,
          sectors,
          users,
          categories,
          responses,
          actionPlans
      };

      const blob = new Blob([JSON.stringify(dataToExport, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      
      const link = document.createElement('a');
      link.href = url;
      link.download = `nursetec-backup-${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
  };

  // --- IMPORTAR DADOS ---
  const handleImportData = (file: File) => {
      const reader = new FileReader();
      reader.onload = (e) => {
          try {
              const content = e.target?.result as string;
              const data = JSON.parse(content);

              if (data.config) setConfig(data.config);
              if (data.sectors) setSectors(data.sectors);
              if (data.users) setUsers(data.users);
              if (data.categories) setCategories(data.categories);
              if (data.responses) setResponses(data.responses);
              if (data.actionPlans) setActionPlans(data.actionPlans);
              
              alert("Base de dados importada com sucesso!");
          } catch (err) {
              console.error(err);
              alert("Erro ao importar arquivo. Verifique se é um backup válido.");
          }
      };
      reader.readAsText(file);
  };

  const handleClearDatabase = () => {
      if(confirm("Tem certeza absoluta? Isso apagará TODAS as respostas e planos de ação.")) {
        setResponses([]);
        setActionPlans([]);
        alert("Base de dados limpa com sucesso!");
      }
  };

  // --- Renderização ---

  if (view === 'portfolio') {
    return <Portfolio onBack={() => setView('login')} onDemo={handleGenerateDemoData} />;
  }

  if (view === 'kiosk-mode') {
      return (
          <Kiosk 
             config={config} 
             sectors={sectors} 
             categories={categories} 
             onSubmit={handleKioskSubmit}
             onExit={() => setView('login')}
          />
      );
  }

  // --- LOGIN ---
  if (view === 'login') {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center relative overflow-hidden">
        <div className="bg-white/10 backdrop-blur-lg p-8 rounded-3xl border border-white/10 shadow-2xl w-full max-w-md relative z-10 text-center">
          <div className="w-20 h-20 bg-[var(--brand-color)] rounded-2xl mx-auto flex items-center justify-center mb-6 shadow-lg" style={{backgroundColor: config.brandColor}}>
            <Activity className="text-white w-10 h-10"/>
          </div>
          <h1 className="text-3xl font-bold text-white mb-2">{config.hospitalName || 'NurseTec'}</h1>
          <p className="text-blue-200 mb-8">Gestão de Experiência Hospitalar</p>

          <form className="space-y-4" onSubmit={(e) => {
            e.preventDefault();
            const email = (document.getElementById('login-email') as HTMLInputElement).value;
            const pass = (document.getElementById('login-pass') as HTMLInputElement).value;
            
            const found = users.find(u => u.email === email && u.isActive);
            const isAdminFallback = email === 'admin@sistema.com' && pass === '123';

            if ((found && found.password === pass) || isAdminFallback) {
                const userToLogin = found || DEFAULT_ADMIN;
                setUser(userToLogin);
                if (pass === '123456') {
                    setView('force-change-password');
                } else {
                    setView('dashboard');
                }
            } else {
                alert('Credenciais inválidas.');
            }
          }}>
            <input id="login-email" placeholder="Email" className="w-full bg-slate-800/50 border border-slate-700 rounded-xl p-4 text-white outline-none focus:border-[var(--brand-color)]" style={{borderColor: config.brandColor}}/>
            <input id="login-pass" type="password" placeholder="Senha" className="w-full bg-slate-800/50 border border-slate-700 rounded-xl p-4 text-white outline-none focus:border-[var(--brand-color)]" style={{borderColor: config.brandColor}}/>
            <button type="submit" className="w-full text-white font-bold py-4 rounded-xl transition-all shadow-lg hover:brightness-110" style={{backgroundColor: config.brandColor}}>Entrar</button>
          </form>

          <div className="mt-6 flex gap-3">
            <button onClick={() => setView('portfolio')} className="flex-1 py-3 rounded-xl bg-slate-800 text-slate-300 text-sm hover:bg-slate-700 border border-slate-700">Portfólio</button>
            <button onClick={() => setView('kiosk-mode')} className="flex-1 py-3 rounded-xl bg-slate-800 text-slate-300 text-sm hover:bg-slate-700 border border-slate-700 flex items-center justify-center gap-2"><MonitorPlay size={14}/> Modo Totem</button>
          </div>
        </div>
      </div>
    );
  }

  // --- FORCE CHANGE PASSWORD ---
  if (view === 'force-change-password') {
      return (
          <div className="min-h-screen bg-slate-100 flex items-center justify-center">
              <div className="bg-white p-8 rounded-2xl shadow-xl w-full max-w-md border border-slate-200">
                  <div className="w-16 h-16 bg-amber-100 text-amber-600 rounded-full flex items-center justify-center mx-auto mb-4">
                      <LockKeyhole size={32} />
                  </div>
                  <h2 className="text-2xl font-bold text-center text-slate-800 mb-2">Redefinição Obrigatória</h2>
                  <p className="text-center text-slate-500 mb-6 text-sm">
                      Sua senha foi redefinida. Por segurança, crie uma nova senha agora.
                  </p>
                  
                  <form onSubmit={(e) => {
                      e.preventDefault();
                      const p1 = (document.getElementById('new-p1') as HTMLInputElement).value;
                      const p2 = (document.getElementById('new-p2') as HTMLInputElement).value;
                      if (p1 !== p2) {
                          alert("As senhas não coincidem.");
                          return;
                      }
                      handleChangePassword(p1);
                  }}>
                      <div className="space-y-4">
                          <input id="new-p1" type="password" placeholder="Nova Senha" className="w-full border p-3 rounded-lg outline-none focus:ring-2 focus:ring-amber-500"/>
                          <input id="new-p2" type="password" placeholder="Confirme a Senha" className="w-full border p-3 rounded-lg outline-none focus:ring-2 focus:ring-amber-500"/>
                          <button type="submit" className="w-full bg-amber-500 text-white font-bold py-3 rounded-lg hover:bg-amber-600 transition-colors">
                              Atualizar Senha e Entrar
                          </button>
                      </div>
                  </form>
              </div>
          </div>
      );
  }

  // --- LAYOUT ADMIN ---
  return (
    <div className="flex h-screen bg-slate-50 overflow-hidden">
      
      {/* SIDEBAR */}
      <aside 
        className={`fixed inset-y-0 left-0 z-30 w-64 transform ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'} md:translate-x-0 transition-transform duration-300 ease-in-out shadow-2xl flex flex-col`}
        style={{ backgroundColor: config.sidebarBgColor, color: config.sidebarTextColor }}
      >
        <div className="p-6 border-b border-white/10 flex items-center gap-3">
           <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center">
              {config.logoUrl ? <img src={config.logoUrl} className="w-8 h-8 object-contain"/> : <Activity className="text-current"/>}
           </div>
           <div>
               <h1 className="font-bold leading-tight">{config.hospitalName}</h1>
               <span className="text-xs opacity-60">Gestão de Experiência</span>
           </div>
        </div>

        <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
          <button onClick={() => setView('dashboard')} className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${view === 'dashboard' ? 'bg-white/10 font-bold' : 'hover:bg-white/5 opacity-80'}`}>
             <LayoutDashboard size={20}/> Dashboard
          </button>
          <button onClick={() => setView('actions')} className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${view === 'actions' ? 'bg-white/10 font-bold' : 'hover:bg-white/5 opacity-80'}`}>
             <ClipboardList size={20}/> Planos de Ação
          </button>

          {user?.role === 'admin' && (
            <>
              <div className="pt-4 pb-2 text-xs font-bold uppercase opacity-40 px-4">Administração</div>
              <button onClick={() => setView('questions')} className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${view === 'questions' ? 'bg-white/10 font-bold' : 'hover:bg-white/5 opacity-80'}`}>
                <BookOpenCheck size={20}/> Perguntas
              </button>
              <button onClick={() => setView('sectors')} className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${view === 'sectors' ? 'bg-white/10 font-bold' : 'hover:bg-white/5 opacity-80'}`}>
                <Activity size={20}/> Setores
              </button>
              <button onClick={() => setView('users')} className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${view === 'users' ? 'bg-white/10 font-bold' : 'hover:bg-white/5 opacity-80'}`}>
                <Users size={20}/> Usuários
              </button>
              <button onClick={() => setView('global-settings')} className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${view === 'global-settings' ? 'bg-white/10 font-bold' : 'hover:bg-white/5 opacity-80'}`}>
                <Settings size={20}/> Configurações
              </button>
            </>
          )}
        </nav>

        <div className="p-4 border-t border-white/10">
           <button onClick={() => { setUser(null); setView('login'); }} className="w-full flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-red-500/20 text-red-300 hover:text-red-100 transition-all">
             <LogOut size={20}/> Sair do Sistema
           </button>
        </div>
      </aside>

      {/* MOBILE OVERLAY */}
      {sidebarOpen && <div className="fixed inset-0 bg-black/50 z-20 md:hidden" onClick={() => setSidebarOpen(false)}/>}

      {/* MAIN CONTENT */}
      <main className="flex-1 md:ml-64 h-full flex flex-col overflow-hidden">
        
        {/* TOPBAR */}
        <header className="bg-white border-b border-slate-200 p-4 flex justify-between items-center shadow-sm z-10">
           <div className="flex items-center gap-3">
              <button onClick={() => setSidebarOpen(true)} className="md:hidden p-2 text-slate-600 hover:bg-slate-100 rounded-lg"><Menu/></button>
              <h2 className="font-bold text-slate-700 capitalize text-lg">{view.replace('-', ' ')}</h2>
           </div>
           <div className="flex items-center gap-4">
              <div className="text-right hidden sm:block">
                  <p className="text-sm font-bold text-slate-800">{user?.name}</p>
                  <p className="text-xs text-slate-500 capitalize">{user?.role === 'admin' ? 'Administrador' : 'Gestor de Setor'}</p>
              </div>
              <div className={`w-10 h-10 rounded-full flex items-center justify-center text-white font-bold shadow-md ${user?.avatarColor || 'bg-slate-800'}`}>
                  {user?.name.charAt(0)}
              </div>
           </div>
        </header>

        {/* CONTENT AREA */}
        <div className="flex-1 overflow-y-auto p-4 md:p-8">
           {view === 'dashboard' && (
             <Dashboard 
                user={user}
                responses={responses} 
                sectors={visibleSectors} 
                categories={categories}
                actionPlans={actionPlans}
                onViewActions={() => setView('actions')}
             />
           )}
           
           {view === 'actions' && (
             <ActionsPage 
                plans={actionPlans} 
                sectors={visibleSectors} 
                users={users} 
                onSavePlan={handleSavePlan}
             />
           )}

           {/* ADMIN VIEWS */}
           {user?.role === 'admin' && (
             <>
               {view === 'sectors' && (
                 <Sectors 
                   sectors={sectors} 
                   users={users} 
                   categories={categories}
                   onSave={handleSaveSector} 
                 />
               )}
               {view === 'users' && (
                 <UsersPage 
                    users={users} 
                    onSave={handleSaveUser}
                    onResetPassword={handleResetPassword}
                 />
               )}
               {view === 'questions' && (
                 <Questions 
                    categories={categories} 
                    onSave={handleSaveCategory} 
                    onDelete={handleDeleteCategory}
                 />
               )}
               {view === 'global-settings' && (
                 <GlobalSettings 
                    config={config} 
                    onSave={(c) => setConfig(c)}
                    onReset={() => setConfig(DEFAULT_CONFIG)}
                    onExportData={handleExportData}
                    onImportData={handleImportData}
                    onClearData={handleClearDatabase}
                 />
               )}
             </>
           )}
        </div>
      </main>
    </div>
  );
}
const root = createRoot(document.getElementById('root')!);
root.render(<App />);