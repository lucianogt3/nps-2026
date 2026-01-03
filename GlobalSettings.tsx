
import React, { useEffect } from 'react';
import { Globe, Save, RotateCcw, Layout, Monitor } from 'lucide-react';
import { AppConfig } from './types';

interface GlobalSettingsProps {
  config: AppConfig;
  onSave: (config: AppConfig) => void;
  onReset?: () => void;
}

// Componente extraído para fora para evitar re-renderização ao digitar/selecionar cor
const ColorInput = ({ label, value, onChange }: { label: string, value: string, onChange: (val: string) => void }) => (
  <div>
      <label className="block text-xs font-bold text-slate-500 mb-1 uppercase">{label}</label>
      <div className="flex gap-2 items-center bg-slate-50 p-2 rounded-lg border border-slate-200">
          <input 
              type="color" 
              value={value}
              onChange={e => onChange(e.target.value)}
              className="h-8 w-8 rounded cursor-pointer border-none bg-transparent p-0"
          />
          <input 
              type="text" 
              value={value}
              onChange={e => onChange(e.target.value)}
              className="flex-1 bg-transparent text-sm font-mono uppercase outline-none text-slate-700"
          />
      </div>
  </div>
);

export default function GlobalSettings({ config, onSave, onReset }: GlobalSettingsProps) {
  const [localConfig, setLocalConfig] = React.useState<AppConfig>(config);

  // Garante que se o Pai resetar a config, o estado local atualiza visualmente
  useEffect(() => {
    setLocalConfig(config);
  }, [config]);

  return (
    <div className="max-w-4xl mx-auto space-y-6 animate-fade-in pb-12">
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-3">
            <div className="p-3 bg-indigo-100 text-indigo-700 rounded-xl">
                <Globe size={24} />
            </div>
            <div>
                <h2 className="text-2xl font-bold text-slate-800">Personalização Global</h2>
                <p className="text-slate-500">Identidade visual e temas do sistema.</p>
            </div>
        </div>
        {onReset && (
            <button 
                onClick={() => {
                    if(confirm("Tem certeza que deseja restaurar as cores originais?")) {
                        onReset();
                    }
                }}
                className="text-slate-500 hover:text-red-500 text-sm font-bold flex items-center gap-2 px-4 py-2 border rounded-lg hover:bg-slate-50 transition-colors"
            >
                <RotateCcw size={16}/> Restaurar Padrões
            </button>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          
          {/* Identidade Geral */}
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 col-span-1 md:col-span-2">
            <h3 className="font-bold text-lg mb-4 text-slate-800 flex items-center gap-2"><Layout size={20}/> Identidade Principal</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                    <label className="block text-sm font-bold text-slate-700 mb-2">Nome da Instituição</label>
                    <input 
                        type="text" 
                        value={localConfig.hospitalName}
                        onChange={e => setLocalConfig({...localConfig, hospitalName: e.target.value})}
                        className="w-full p-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none bg-white text-slate-900 shadow-sm"
                        placeholder="Ex: Hospital Santa Helena"
                    />
                </div>
                <div>
                   <label className="block text-sm font-bold text-slate-700 mb-2">URL do Logo</label>
                   <input 
                        type="text" 
                        value={localConfig.logoUrl}
                        onChange={e => setLocalConfig({...localConfig, logoUrl: e.target.value})}
                        className="w-full p-3 border border-slate-300 rounded-xl outline-none bg-white text-slate-900 shadow-sm"
                        placeholder="https://..."
                    />
                </div>
                <div className="md:col-span-2">
                    <ColorInput 
                        label="Cor da Marca (Botões e Destaques)" 
                        value={localConfig.brandColor} 
                        onChange={v => setLocalConfig({...localConfig, brandColor: v})}
                    />
                </div>
            </div>
          </div>

          {/* Menu Lateral */}
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
             <h3 className="font-bold text-lg mb-4 text-slate-800 flex items-center gap-2"><Monitor size={20}/> Menu Lateral</h3>
             <div className="space-y-4">
                 <ColorInput 
                    label="Cor de Fundo" 
                    value={localConfig.sidebarBgColor} 
                    onChange={v => setLocalConfig({...localConfig, sidebarBgColor: v})}
                 />
                 <ColorInput 
                    label="Cor do Texto" 
                    value={localConfig.sidebarTextColor} 
                    onChange={v => setLocalConfig({...localConfig, sidebarTextColor: v})}
                 />
                 
                 {/* Preview */}
                 <div className="mt-4 p-4 rounded-lg flex gap-4 items-center" style={{backgroundColor: localConfig.sidebarBgColor}}>
                     <div className="p-2 rounded bg-white/10">
                         <Layout size={20} style={{color: localConfig.sidebarTextColor}}/>
                     </div>
                     <div className="flex-1">
                         <div className="h-2 w-20 rounded mb-1 opacity-50" style={{backgroundColor: localConfig.sidebarTextColor}}></div>
                         <div className="h-2 w-12 rounded opacity-30" style={{backgroundColor: localConfig.sidebarTextColor}}></div>
                     </div>
                 </div>
             </div>
          </div>

          {/* Totem / Kiosk */}
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
             <h3 className="font-bold text-lg mb-4 text-slate-800 flex items-center gap-2"><Monitor size={20}/> Totem (Kiosk)</h3>
             <div className="space-y-4">
                 <ColorInput 
                    label="Fundo da Tela" 
                    value={localConfig.kioskBgColor} 
                    onChange={v => setLocalConfig({...localConfig, kioskBgColor: v})}
                 />
                 <ColorInput 
                    label="Cor dos Títulos/Textos" 
                    value={localConfig.kioskTextColor} 
                    onChange={v => setLocalConfig({...localConfig, kioskTextColor: v})}
                 />
                 <ColorInput 
                    label="Fundo dos Cards/Botões" 
                    value={localConfig.kioskCardBgColor} 
                    onChange={v => setLocalConfig({...localConfig, kioskCardBgColor: v})}
                 />

                 {/* Preview */}
                 <div className="mt-4 p-4 rounded-lg border border-slate-200" style={{backgroundColor: localConfig.kioskBgColor}}>
                     <h4 className="font-bold text-center mb-2" style={{color: localConfig.kioskTextColor}}>Olá!</h4>
                     <div className="p-3 rounded-lg text-center shadow-sm" style={{backgroundColor: localConfig.kioskCardBgColor}}>
                         <span className="text-xl">😍</span>
                     </div>
                 </div>
             </div>
          </div>
      </div>

      <div className="flex justify-end pt-4 sticky bottom-0 bg-slate-50/80 backdrop-blur p-4 border-t border-slate-200 -mx-6 -mb-6 mt-4">
        <button 
            onClick={() => onSave(localConfig)}
            className="flex items-center gap-2 bg-slate-900 text-white px-8 py-3 rounded-xl font-bold hover:bg-slate-800 shadow-xl transition-all"
        >
            <Save size={20} /> Aplicar Alterações
        </button>
      </div>
    </div>
  );
}
