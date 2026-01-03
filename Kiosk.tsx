
import React, { useState, useEffect } from 'react';
import { AppConfig, Sector, QuestionCategory, SurveyResponse } from './types';
import { HOSPITAL_ICONS } from './icons';
import { Activity, Star, LogOut, ChevronRight, CheckCircle2, Smile, Meh, Frown, MousePointerClick, MapPin } from 'lucide-react';

interface KioskProps {
  config: AppConfig;
  sectors: Sector[];
  categories: QuestionCategory[];
  onSubmit: (response: SurveyResponse) => void;
  onExit: () => void;
}

type KioskStep = 'idle' | 'sector-select' | 'nps' | 'details' | 'thankyou';

export default function Kiosk({ config, sectors, categories, onSubmit, onExit }: KioskProps) {
  const [step, setStep] = useState<KioskStep>('idle');
  const [selectedSectorId, setSelectedSectorId] = useState<string>('');
  const [npsScore, setNpsScore] = useState<number | null>(null);
  const [ratings, setRatings] = useState<Record<string, number>>({});
  
  // Verificação de segurança: Se setores não existirem, evitar crash
  if (!sectors) {
      return <div className="p-10 text-center text-red-500">Erro: Setores não carregados. Configure-os no painel.</div>;
  }

  // Reset automático se ficar inativo por muito tempo (exceto na tela idle)
  useEffect(() => {
    if (step === 'idle') return;
    const timer = setTimeout(() => {
      resetKiosk();
    }, 60000); // 60 segundos de inatividade reseta
    return () => clearTimeout(timer);
  }, [step, npsScore, ratings]);

  const resetKiosk = () => {
    setStep('idle');
    setSelectedSectorId('');
    setNpsScore(null);
    setRatings({});
  };

  const handleNpsSelect = (score: number) => {
    setNpsScore(score);
    // Se tiver categorias configuradas para o setor, vai para detalhes. Se não, finaliza.
    const sector = sectors.find(s => s.id === selectedSectorId);
    
    // Verificação de segurança para categorias
    if (sector && sector.categories && sector.categories.length > 0) {
      setStep('details');
    } else {
      finishSurvey(score, {});
    }
  };

  const finishSurvey = (finalScore: number, finalRatings: Record<string, number>) => {
    // CORREÇÃO DE DATA: Usa o objeto Date diretamente para garantir fuso local no Dashboard
    // O toISOString() converte para UTC, o que pode mudar o mês/dia dependendo do fuso.
    // Vamos criar uma data ajustada para o offset local para garantir consistência visual no dashboard.
    const now = new Date();
    const localDate = new Date(now.getTime() - (now.getTimezoneOffset() * 60000)).toISOString();

    const response: SurveyResponse = {
      id: Date.now(),
      sectorId: selectedSectorId,
      npsScore: finalScore,
      tags: [],
      comment: '',
      date: localDate, // Salva com fuso compensado para aparecer no dia correto
      ratings: finalRatings
    };
    
    // Envia para o App (index.tsx)
    onSubmit(response);
    
    setStep('thankyou');
    setTimeout(() => {
      resetKiosk();
    }, 4000);
  };

  // Componente Auxiliar de Cabeçalho Interno
  const KioskHeader = () => {
      const sectorName = sectors.find(s => s.id === selectedSectorId)?.name;
      return (
        <div className="absolute top-0 left-0 right-0 p-4 md:p-8 flex justify-between items-start md:items-center z-10 pointer-events-none">
            <div className="flex items-center gap-3 opacity-80 pointer-events-auto">
                <div className="p-2 bg-white/10 rounded-lg backdrop-blur-md shadow-sm">
                    <Activity size={20} className="md:w-6 md:h-6"/>
                </div>
                <span className="font-bold text-sm md:text-lg uppercase tracking-wide hidden sm:block">{config.hospitalName}</span>
            </div>
            
            {sectorName && (
                <div className="flex items-center gap-2 bg-white/90 text-slate-800 px-3 py-1.5 md:px-4 md:py-2 rounded-full border border-black/5 shadow-sm backdrop-blur-sm pointer-events-auto">
                    <MapPin size={14} className="md:w-4 md:h-4 opacity-50"/>
                    <span className="text-xs md:text-sm font-bold uppercase tracking-wider text-center max-w-[150px] truncate">{sectorName}</span>
                </div>
            )}
        </div>
      );
  }

  // --- RENDERIZADORES DE CADA ETAPA ---

  // 1. TELA DE DESCANSO (ATTRACT SCREEN)
  if (step === 'idle') {
    return (
      <div 
        onClick={() => setStep('sector-select')}
        className="min-h-screen flex flex-col items-center justify-center cursor-pointer relative overflow-hidden px-4"
        style={{ backgroundColor: config.kioskBgColor, color: config.kioskTextColor }}
      >
        {/* Botão de Saída Discreto */}
        <button onClick={(e) => { e.stopPropagation(); onExit(); }} className="absolute top-4 right-4 opacity-10 p-4 z-50 hover:opacity-100 transition-opacity">
           <LogOut size={24}/>
        </button>

        <div className="absolute inset-0 bg-gradient-to-t from-black/10 to-transparent pointer-events-none"/>
        
        <div className="animate-pulse mb-8 relative">
           <div className="absolute inset-0 bg-current opacity-20 blur-3xl rounded-full scale-150"></div>
           <div className="w-32 h-32 md:w-40 md:h-40 rounded-3xl flex items-center justify-center shadow-2xl relative z-10" style={{backgroundColor: config.brandColor}}>
              <Activity className="text-white w-16 h-16 md:w-20 md:h-20"/>
           </div>
        </div>

        <h1 className="text-4xl md:text-7xl font-bold mb-4 md:mb-6 text-center tracking-tight max-w-4xl leading-tight">
          {config.hospitalName}
        </h1>
        <p className="text-lg md:text-3xl opacity-70 mb-12 text-center font-light">
          Sua opinião transforma nosso cuidado.
        </p>

        <div className="bg-white/10 backdrop-blur-sm border border-current/10 px-6 py-3 md:px-8 md:py-4 rounded-full flex items-center gap-3 md:gap-4 animate-bounce shadow-lg">
            <MousePointerClick size={24} className="md:w-8 md:h-8"/>
            <span className="text-lg md:text-xl font-bold uppercase tracking-widest">Toque para avaliar</span>
        </div>
      </div>
    );
  }

  // 2. SELEÇÃO DE SETOR
  if (step === 'sector-select') {
    return (
      <div className="min-h-screen flex flex-col p-6 md:p-12 animate-fade-in" style={{ backgroundColor: config.kioskBgColor, color: config.kioskTextColor }}>
         {/* Cabeçalho Simplificado */}
         <div className="flex justify-between items-center mb-8 md:mb-12">
            <button onClick={resetKiosk} className="text-sm opacity-50 uppercase font-bold tracking-wider hover:opacity-100 flex items-center gap-2">
                ← Voltar
            </button>
            <span className="opacity-30 font-bold uppercase text-xs md:text-sm">{config.hospitalName}</span>
         </div>
         
         <div className="text-center mb-8 md:mb-12">
            <h2 className="text-2xl md:text-4xl font-bold mb-2 md:mb-4">Qual setor você deseja avaliar?</h2>
            <p className="text-base md:text-xl opacity-60">Selecione o local do seu atendimento hoje.</p>
         </div>

         <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6 max-w-6xl mx-auto w-full pb-8">
            {sectors.filter(s => s.isActive).map(sector => (
               <button
                 key={sector.id}
                 onClick={() => { setSelectedSectorId(sector.id); setStep('nps'); }}
                 className="group relative aspect-square rounded-2xl md:rounded-3xl border-2 border-transparent hover:border-current transition-all duration-300 shadow-lg hover:shadow-2xl flex flex-col items-center justify-center gap-4 md:gap-6 p-4"
                 style={{ backgroundColor: config.kioskCardBgColor }}
               >
                  <div className="p-4 md:p-6 rounded-full bg-slate-50 group-hover:bg-indigo-50 transition-colors">
                     <div className="text-slate-700 group-hover:text-indigo-600 transition-colors transform scale-110 md:scale-125">
                        {/* Fallback para ícone padrão se o nome do ícone não existir */}
                        {HOSPITAL_ICONS[sector.iconName] || <Activity size={32}/>}
                     </div>
                  </div>
                  <span className="text-sm md:text-xl font-bold text-center leading-tight" style={{color: config.kioskTextColor}}>
                    {sector.name}
                  </span>
               </button>
            ))}
         </div>
      </div>
    );
  }

  // 3. NPS (0-10)
  if (step === 'nps') {
    return (
      <div className="min-h-screen flex flex-col relative animate-fade-in" style={{ backgroundColor: config.kioskBgColor, color: config.kioskTextColor }}>
         <KioskHeader />

         <div className="flex-1 flex flex-col items-center justify-center p-4 md:p-8 pt-20">
             <div className="max-w-5xl w-full text-center">
                 <h2 className="text-2xl md:text-5xl font-bold mb-4 md:mb-6">Em uma escala de 0 a 10</h2>
                 <p className="text-lg md:text-2xl opacity-70 mb-8 md:mb-12 max-w-3xl mx-auto">
                   O quanto você recomendaria este atendimento a um amigo ou familiar?
                 </p>

                 {/* VISUAL REDESENHADO: Botões Redondos e Espaçados (Sem cara de calculadora) */}
                 <div className="flex flex-wrap justify-center gap-3 md:gap-4 mb-10 max-w-4xl mx-auto">
                    {[0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((num) => {
                        let colorClass = '';
                        // Cores mais suaves e modernas
                        if (num <= 6) { colorClass = 'bg-white border-2 border-red-100 text-red-600 hover:bg-red-500 hover:text-white hover:border-red-500 shadow-red-100'; }
                        else if (num <= 8) { colorClass = 'bg-white border-2 border-amber-100 text-amber-500 hover:bg-amber-400 hover:text-white hover:border-amber-400 shadow-amber-100'; }
                        else { colorClass = 'bg-white border-2 border-emerald-100 text-emerald-600 hover:bg-emerald-500 hover:text-white hover:border-emerald-500 shadow-emerald-100'; }

                        return (
                          <button 
                            key={num}
                            onClick={() => handleNpsSelect(num)}
                            className={`
                              w-14 h-14 sm:w-16 sm:h-16 md:w-20 md:h-20 rounded-full 
                              flex items-center justify-center
                              text-xl md:text-3xl font-bold
                              transition-all duration-300 transform hover:scale-110 active:scale-90
                              shadow-lg hover:shadow-xl
                              ${colorClass}
                            `}
                          >
                            {num}
                          </button>
                        )
                    })}
                 </div>
                 
                 <div className="flex justify-between w-full px-6 max-w-3xl mx-auto opacity-60 text-xs md:text-sm font-bold uppercase tracking-widest">
                     <div className="flex items-center gap-2">
                        <Frown className="text-red-500"/> <span>Jamais recomendaria</span>
                     </div>
                     <div className="flex items-center gap-2">
                        <span>Com certeza</span> <Smile className="text-emerald-500"/>
                     </div>
                 </div>
             </div>
         </div>
      </div>
    );
  }

  // 4. DETALHES (CATEGORIAS)
  if (step === 'details') {
    const sector = sectors.find(s => s.id === selectedSectorId);
    
    // SAFETY CHECK: Se o setor não for encontrado, volta para o início
    if (!sector) {
        resetKiosk();
        return null;
    }

    // Fallback: se categories for undefined, usa array vazio
    const activeCategories = (sector.categories || [])
      .map(id => categories.find(c => c.id === id))
      .filter(c => c !== undefined) as QuestionCategory[];

    return (
      <div className="min-h-screen flex flex-col relative animate-fade-in" style={{ backgroundColor: config.kioskBgColor, color: config.kioskTextColor }}>
          <KioskHeader />
          
          <div className="flex-1 flex flex-col items-center justify-start md:justify-center p-4 md:p-8 pt-24 md:pt-12 overflow-y-auto">
              <div className="max-w-3xl mx-auto w-full pb-8">
                <h2 className="text-2xl md:text-3xl font-bold mb-2 text-center">Avaliação Detalhada</h2>
                <p className="text-center opacity-60 mb-6 md:mb-8 text-sm md:text-base">Conte-nos um pouco mais sobre sua experiência.</p>

                <div className="space-y-3 md:space-y-4 mb-8">
                   {activeCategories.map(cat => (
                     <div key={cat.id} className="p-4 md:p-6 rounded-2xl shadow-sm flex flex-col sm:flex-row items-center justify-between gap-3 sm:gap-4 border border-slate-100" style={{ backgroundColor: config.kioskCardBgColor }}>
                        <div className="flex flex-col sm:flex-row items-center gap-3 sm:gap-4 text-center sm:text-left">
                            <div className="p-2 md:p-3 rounded-xl bg-slate-50 text-slate-600">
                               {/* Fallback de ícone */}
                               {HOSPITAL_ICONS[cat.iconName] || <Activity/>}
                            </div>
                            <span className="font-bold text-base md:text-lg leading-tight text-slate-700">{cat.label}</span>
                        </div>
                        <div className="flex gap-2">
                           {[1, 2, 3, 4, 5].map(star => (
                              <button
                                key={star}
                                onClick={() => setRatings(prev => ({ ...prev, [`${cat.id}:geral`]: star }))}
                                className="transition-transform hover:scale-125 focus:scale-110 active:scale-90 p-1"
                              >
                                 <Star 
                                   size={32} 
                                   className={`w-8 h-8 md:w-10 md:h-10 drop-shadow-sm ${(ratings[`${cat.id}:geral`] || 0) >= star ? 'fill-amber-400 text-amber-400' : 'text-slate-200'}`}
                                 />
                              </button>
                           ))}
                        </div>
                     </div>
                   ))}
                   {activeCategories.length === 0 && (
                       <p className="text-center italic opacity-50">Nenhuma categoria adicional configurada para este setor.</p>
                   )}
                </div>

                <button 
                  onClick={() => finishSurvey(npsScore!, ratings)}
                  className="w-full py-4 md:py-5 rounded-xl md:rounded-2xl font-bold text-lg md:text-xl text-white shadow-xl hover:brightness-110 active:scale-95 transition-all flex items-center justify-center gap-3"
                  style={{ backgroundColor: config.brandColor }}
                >
                   Concluir Avaliação <ChevronRight size={24}/>
                </button>
              </div>
          </div>
      </div>
    );
  }

  // 5. THANK YOU
  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-8 text-center animate-slide-up" style={{ backgroundColor: config.kioskBgColor, color: config.kioskTextColor }}>
       <div className="w-24 h-24 md:w-32 md:h-32 bg-emerald-100 rounded-full flex items-center justify-center mb-6 md:mb-8 shadow-lg">
          <CheckCircle2 size={48} className="md:w-16 md:h-16 text-emerald-600"/>
       </div>
       <h1 className="text-3xl md:text-5xl font-bold mb-4">Obrigado!</h1>
       <p className="text-lg md:text-2xl opacity-60 max-w-lg">Sua avaliação foi registrada com sucesso e ajuda a melhorar nosso hospital.</p>
       <div className="mt-12 opacity-40 font-mono text-xs md:text-sm animate-pulse">
          Retornando ao início em instantes...
       </div>
    </div>
  );
}
