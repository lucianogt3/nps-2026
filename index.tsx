import React, { useEffect, useMemo, useState } from "react";
import { createRoot } from "react-dom/client";
import { apiFetch, setToken, clearToken, getToken, setBaseUrl, setApiKey } from "./apiClient";
import {
  Activity,
  LayoutDashboard,
  ClipboardList,
  Users as UsersIcon,
  Settings,
  LogOut,
  Menu,
  MonitorPlay,
  BookOpenCheck,
  LockKeyhole,
} from "lucide-react";

import Portfolio from "./Portfolio";
import Dashboard from "./Dashboard";
import Sectors from "./Sectors";
import UsersPage from "./Users";
import Questions from "./Questions";
import ActionsPage from "./Actions";
import GlobalSettings from "./GlobalSettings";
import Kiosk from "./Kiosk";

import {
  AppConfig,
  MonthlyActionPlan,
  QuestionCategory,
  Sector,
  SurveyResponse,
  User,
  ViewState,
} from "./types";

// ✅ Backend db.json
const API_BASE = import.meta.env.VITE_API_BASE || "http://localhost:3333";
const API_KEY = import.meta.env.VITE_API_KEY || "Admin@2026**##"; // depois você troca

const DEFAULT_CONFIG: AppConfig = {
  hospitalName: "Hospital Santa Helena",
  logoUrl: "",
  brandColor: "#be123c",
  sidebarBgColor: "#0f172a",
  sidebarTextColor: "#ffffff",
  kioskBgColor: "#f8fafc",
  kioskTextColor: "#1e293b",
  kioskCardBgColor: "#ffffff",
  customApiUrl: "",
  customApiKey: "",
};

type SyncDB = {
  config?: Partial<AppConfig>;
  users?: User[];
  sectors?: Sector[];
  categories?: QuestionCategory[];
  responses?: SurveyResponse[];
  actionPlans?: MonthlyActionPlan[];
};

export default function App() {
  const [tenantSlug, setTenantSlug] = useState<string>(() => localStorage.getItem("nps_tenantSlug") || "hospital-demo");

  const [view, setView] = useState<ViewState>("login");
  const [user, setUser] = useState<User | null>(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // Estado vindo do DB
  const [config, setConfig] = useState<AppConfig>(DEFAULT_CONFIG);
  const [sectors, setSectors] = useState<Sector[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [categories, setCategories] = useState<QuestionCategory[]>([]);
  const [responses, setResponses] = useState<SurveyResponse[]>([]);
  const [actionPlans, setActionPlans] = useState<MonthlyActionPlan[]>([]);

  // Base URL + API key do client
  useEffect(() => {
    setBaseUrl(API_BASE);
    setApiKey(API_KEY);
  }, []);

  // CSS variables
  useEffect(() => {
    const root = document.documentElement;
    root.style.setProperty("--brand-color", config.brandColor);
    root.style.setProperty("--sidebar-bg", config.sidebarBgColor);
    root.style.setProperty("--sidebar-text", config.sidebarTextColor);
    root.style.setProperty("--kiosk-bg", config.kioskBgColor);
    root.style.setProperty("--kiosk-text", config.kioskTextColor);
    root.style.setProperty("--kiosk-card-bg", config.kioskCardBgColor);
  }, [config]);

  // --------------------------
  // DB Helpers (sync)
  // --------------------------
  const loadSync = async () => {
    const data = (await apiFetch("/api/sync")) as SyncDB;

    if (data?.config) setConfig({ ...DEFAULT_CONFIG, ...data.config });
    else setConfig(DEFAULT_CONFIG);

    setSectors(data?.sectors || []);
    setUsers(data?.users || []);
    setCategories(data?.categories || []);
    setResponses(data?.responses || []);
    setActionPlans(data?.actionPlans || []);

    // Login "local": se existir um admin no DB, usa; senão cria um padrão
    const admin =
      (data?.users || []).find((u) => (u as any).role === "admin") ||
      ({
        id: "admin",
        name: "Administrador",
        email: "admin@local",
        role: "admin",
        avatarColor: "bg-slate-800",
      } as any);

    setUser(admin);
  };

  const saveSync = async (type: keyof SyncDB, data: any) => {
    await apiFetch("/api/sync", {
      method: "POST",
      body: JSON.stringify({ type, data }),
    });
  };

  // bootstrap baseado em /api/sync (não depende de token real)
  const bootstrap = async () => {
    await loadSync();
  };

  useEffect(() => {
    // se já tiver "token fake", carrega; senão, deixa pra carregar no login
    const token = getToken();
    if (token) bootstrap().catch((e) => console.warn("Bootstrap falhou:", e));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tenantSlug]);

  // Permissão de setores
  const visibleSectors = useMemo(() => {
    if (!user) return [];
    if ((user as any).role === "admin") return sectors;
    return sectors.filter((s: any) => s.managerId === (user as any).id);
  }, [sectors, user]);

  // Logout
  const handleLogout = () => {
    clearToken();
    setUser(null);
    setView("login");
  };

  // Kiosk submit -> salva em responses + sync
  const handleKioskSubmit = async (response: SurveyResponse) => {
    const next = [{ ...(response as any), tenant: tenantSlug }, ...responses];
    setResponses(next);
    await saveSync("responses", next);
  };

  // --------------------------
  // Views extras
  // --------------------------
  if (view === "portfolio") {
    return <Portfolio onBack={() => setView("login")} onDemo={() => alert("Demo: agora vem do DB (/api/sync)")} />;
  }

  if (view === "kiosk-mode") {
    return (
      <Kiosk
        config={config}
        sectors={sectors}
        categories={categories}
        onSubmit={handleKioskSubmit}
        onExit={() => setView("login")}
      />
    );
  }

  // --------------------------
  // LOGIN (local)
  // --------------------------
  if (view === "login") {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center relative overflow-hidden">
        <div className="bg-white/10 backdrop-blur-lg p-8 rounded-3xl border border-white/10 shadow-2xl w-full max-w-md relative z-10 text-center">
          <div
            className="w-20 h-20 rounded-2xl mx-auto flex items-center justify-center mb-6 shadow-lg"
            style={{ backgroundColor: config.brandColor }}
          >
            <Activity className="text-white w-10 h-10" />
          </div>

          <h1 className="text-3xl font-bold text-white mb-2">{config.hospitalName || "NurseTec"}</h1>
          <p className="text-blue-200 mb-6">Gestão de Experiência Hospitalar</p>

          <input
            value={tenantSlug}
            onChange={(e) => {
              setTenantSlug(e.target.value);
              localStorage.setItem("nps_tenantSlug", e.target.value);
            }}
            placeholder="Tenant (ex: santa-helena)"
            className="w-full bg-slate-800/50 border border-slate-700 rounded-xl p-4 text-white outline-none mb-3"
          />

          <form
            className="space-y-4"
            onSubmit={async (e) => {
              e.preventDefault();
              const pass = (document.getElementById("login-pass") as HTMLInputElement).value;

              try {
                // “Token” fake só pra manter o fluxo atual do seu app
                setToken("ok");

                // carrega do db.json
                await bootstrap();

                if (pass === "123456") setView("force-change-password");
                else setView("dashboard");
              } catch (err) {
                console.error(err);
                alert("Servidor offline ou API KEY inválida.");
              }
            }}
          >
            <input
              id="login-email"
              placeholder="Email (local)"
              className="w-full bg-slate-800/50 border border-slate-700 rounded-xl p-4 text-white outline-none"
            />
            <input
              id="login-pass"
              type="password"
              placeholder="Senha (local)"
              className="w-full bg-slate-800/50 border border-slate-700 rounded-xl p-4 text-white outline-none"
            />
            <button
              type="submit"
              className="w-full text-white font-bold py-4 rounded-xl transition-all shadow-lg hover:brightness-110"
              style={{ backgroundColor: config.brandColor }}
            >
              Entrar
            </button>
          </form>

          <div className="mt-6 flex gap-3">
            <button
              onClick={() => setView("portfolio")}
              className="flex-1 py-3 rounded-xl bg-slate-800 text-slate-300 text-sm hover:bg-slate-700 border border-slate-700"
            >
              Portfólio
            </button>
            <button
              onClick={() => setView("kiosk-mode")}
              className="flex-1 py-3 rounded-xl bg-slate-800 text-slate-300 text-sm hover:bg-slate-700 border border-slate-700 flex items-center justify-center gap-2"
            >
              <MonitorPlay size={14} /> Modo Totem
            </button>
          </div>

          <div className="mt-4 text-xs text-slate-400">
            API: {API_BASE} • Key: {API_KEY ? "OK" : "vazia"}
          </div>
        </div>
      </div>
    );
  }

  // --------------------------
  // Force change password (local)
  // --------------------------
  if (view === "force-change-password") {
    return (
      <div className="min-h-screen bg-slate-100 flex items-center justify-center">
        <div className="bg-white p-8 rounded-2xl shadow-xl w-full max-w-md border border-slate-200">
          <div className="w-16 h-16 bg-amber-100 text-amber-600 rounded-full flex items-center justify-center mx-auto mb-4">
            <LockKeyhole size={32} />
          </div>
          <h2 className="text-2xl font-bold text-center text-slate-800 mb-2">Redefinição Obrigatória</h2>
          <p className="text-center text-slate-500 mb-6 text-sm">Crie uma nova senha agora (modo local).</p>

          <form
            onSubmit={async (e) => {
              e.preventDefault();
              const p1 = (document.getElementById("new-p1") as HTMLInputElement).value;
              const p2 = (document.getElementById("new-p2") as HTMLInputElement).value;
              if (p1 !== p2) return alert("As senhas não coincidem.");
              if (p1.length < 4 || p1 === "123456") return alert("Escolha uma senha mais forte.");

              // aqui você pode depois salvar senha no db.json se quiser.
              setView("dashboard");
            }}
          >
            <div className="space-y-4">
              <input id="new-p1" type="password" placeholder="Nova Senha" className="w-full border p-3 rounded-lg outline-none focus:ring-2 focus:ring-amber-500" />
              <input id="new-p2" type="password" placeholder="Confirme a Senha" className="w-full border p-3 rounded-lg outline-none focus:ring-2 focus:ring-amber-500" />
              <button type="submit" className="w-full bg-amber-500 text-white font-bold py-3 rounded-lg hover:bg-amber-600 transition-colors">
                Atualizar Senha e Entrar
              </button>
            </div>
          </form>
        </div>
      </div>
    );
  }

  // --------------------------
  // Layout admin
  // --------------------------
  return (
    <div className="flex h-screen bg-slate-50 overflow-hidden">
      <aside
        className={`fixed inset-y-0 left-0 z-30 w-64 transform ${sidebarOpen ? "translate-x-0" : "-translate-x-full"} md:translate-x-0 transition-transform duration-300 ease-in-out shadow-2xl flex flex-col`}
        style={{ backgroundColor: config.sidebarBgColor, color: config.sidebarTextColor }}
      >
        <div className="p-6 border-b border-white/10 flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center">
            {config.logoUrl ? <img src={config.logoUrl} className="w-8 h-8 object-contain" /> : <Activity className="text-current" />}
          </div>
          <div>
            <h1 className="font-bold leading-tight">{config.hospitalName}</h1>
            <span className="text-xs opacity-60">Gestão de Experiência</span>
          </div>
        </div>

        <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
          <button
            onClick={() => setView("dashboard")}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${
              view === "dashboard" ? "bg-white/10 font-bold" : "hover:bg-white/5 opacity-80"
            }`}
          >
            <LayoutDashboard size={20} /> Dashboard
          </button>

          <button
            onClick={() => setView("actions")}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${
              view === "actions" ? "bg-white/10 font-bold" : "hover:bg-white/5 opacity-80"
            }`}
          >
            <ClipboardList size={20} /> Planos de Ação
          </button>

          {(user as any)?.role === "admin" && (
            <>
              <div className="pt-4 pb-2 text-xs font-bold uppercase opacity-40 px-4">Administração</div>

              <button
                onClick={() => setView("questions")}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${
                  view === "questions" ? "bg-white/10 font-bold" : "hover:bg-white/5 opacity-80"
                }`}
              >
                <BookOpenCheck size={20} /> Perguntas
              </button>

              <button
                onClick={() => setView("sectors")}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${
                  view === "sectors" ? "bg-white/10 font-bold" : "hover:bg-white/5 opacity-80"
                }`}
              >
                <Activity size={20} /> Setores
              </button>

              <button
                onClick={() => setView("users")}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${
                  view === "users" ? "bg-white/10 font-bold" : "hover:bg-white/5 opacity-80"
                }`}
              >
                <UsersIcon size={20} /> Usuários
              </button>

              <button
                onClick={() => setView("global-settings")}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${
                  view === "global-settings" ? "bg-white/10 font-bold" : "hover:bg-white/5 opacity-80"
                }`}
              >
                <Settings size={20} /> Configurações
              </button>
            </>
          )}
        </nav>

        <div className="p-4 border-t border-white/10">
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-red-500/20 text-red-300 hover:text-red-100 transition-all"
          >
            <LogOut size={20} /> Sair do Sistema
          </button>
        </div>
      </aside>

      {sidebarOpen && <div className="fixed inset-0 bg-black/50 z-20 md:hidden" onClick={() => setSidebarOpen(false)} />}

      <main className="flex-1 md:ml-64 h-full flex flex-col overflow-hidden">
        <header className="bg-white border-b border-slate-200 p-4 flex justify-between items-center shadow-sm z-10">
          <div className="flex items-center gap-3">
            <button onClick={() => setSidebarOpen(true)} className="md:hidden p-2 text-slate-600 hover:bg-slate-100 rounded-lg">
              <Menu />
            </button>
            <h2 className="font-bold text-slate-700 capitalize text-lg">{view.replace("-", " ")}</h2>
          </div>
          <div className="flex items-center gap-4">
            <div className="text-right hidden sm:block">
              <p className="text-sm font-bold text-slate-800">{user?.name}</p>
              <p className="text-xs text-slate-500 capitalize">{(user as any)?.role === "admin" ? "Administrador" : "Gestor de Setor"}</p>
            </div>
            <div className={`w-10 h-10 rounded-full flex items-center justify-center text-white font-bold shadow-md ${(user as any)?.avatarColor || "bg-slate-800"}`}>
              {user?.name?.charAt(0) || "U"}
            </div>
          </div>
        </header>

        <div className="flex-1 overflow-y-auto p-4 md:p-8">
          {view === "dashboard" && (
            <Dashboard
              user={user}
              responses={responses}
              sectors={visibleSectors}
              categories={categories}
              actionPlans={actionPlans}
              onViewActions={() => setView("actions")}
            />
          )}

          {view === "actions" && (
            <ActionsPage
              plans={actionPlans}
              sectors={visibleSectors}
              users={users}
              onSavePlan={async (p) => {
                const next = actionPlans.some((x) => x.id === p.id) ? actionPlans.map((x) => (x.id === p.id ? p : x)) : [p, ...actionPlans];
                setActionPlans(next);
                await saveSync("actionPlans", next);
              }}
            />
          )}

          {(user as any)?.role === "admin" && (
            <>
              {view === "sectors" && (
                <Sectors
                  sectors={sectors}
                  users={users}
                  categories={categories}
                  onSave={async (s) => {
                    const next = sectors.some((x) => x.id === s.id) ? sectors.map((x) => (x.id === s.id ? s : x)) : [s, ...sectors];
                    setSectors(next);
                    await saveSync("sectors", next);
                  }}
                />
              )}

              {view === "users" && (
                <UsersPage
                  users={users}
                  onSave={async (u) => {
                    const next = users.some((x) => x.id === u.id) ? users.map((x) => (x.id === u.id ? u : x)) : [u, ...users];
                    setUsers(next);
                    await saveSync("users", next);
                  }}
                  onResetPassword={() => alert("Reset (modo local) — depois você cria endpoint real")}
                />
              )}

              {view === "questions" && (
                <Questions
                  categories={categories}
                  onSave={async (c) => {
                    const next = categories.some((x) => x.id === c.id) ? categories.map((x) => (x.id === c.id ? c : x)) : [c, ...categories];
                    setCategories(next);
                    await saveSync("categories", next);
                  }}
                  onDelete={async (id) => {
                    const next = categories.filter((x) => x.id !== id);
                    setCategories(next);
                    await saveSync("categories", next);
                  }}
                />
              )}

              {view === "global-settings" && (
                <GlobalSettings
                  config={config}
                  onSave={async (cfg) => {
                    setConfig(cfg);
                    await saveSync("config", cfg);
                  }}
                  onReset={async () => {
                    setConfig(DEFAULT_CONFIG);
                    await saveSync("config", DEFAULT_CONFIG);
                  }}
                  onExportData={() => alert("Export (modo local): depois criamos endpoint /api/backup")}
                  onImportData={() => alert("Import (modo local): depois criamos endpoint /api/backup")}
                  onClearData={() => alert("Clear (modo local): depois criamos endpoint /api/clear")}
                />
              )}
            </>
          )}
        </div>
      </main>
    </div>
  );
}

// (recomendo mover para main.tsx, mas deixo aqui porque você está assim hoje)
const root = createRoot(document.getElementById("root")!);
root.render(<App />);
