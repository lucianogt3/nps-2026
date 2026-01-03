
export type ViewState = 'login' | 'force-change-password' | 'portfolio' | 'kiosk-mode' | 'dashboard' | 'actions' | 'settings' | 'users' | 'questions' | 'global-settings';
export type UserRole = 'admin' | 'manager';

export interface AppConfig {
  hospitalName: string;
  logoUrl: string;
  brandColor: string; // Cor Principal (Botões, Destaques)
  
  // Personalização do Menu Lateral
  sidebarBgColor: string;
  sidebarTextColor: string;
  
  // Personalização do Totem (Kiosk)
  kioskBgColor: string;
  kioskTextColor: string;
  kioskCardBgColor: string;
}

export interface User {
  id: string;
  name: string;
  email: string;
  password?: string; 
  role: UserRole;
  avatarColor?: string;
  isActive: boolean;
}

export interface QuestionCategory {
  id: string;
  label: string;
  iconName: string;
  questions: string[];
}

export interface Sector {
  id: string;
  name: string;
  managerId: string;
  isActive: boolean;
  iconName: string;
  categories: string[];
}

export interface SurveyResponse {
  id: number;
  sectorId: string;
  npsScore: number;
  tags: string[];
  comment: string;
  date: string;
  ratings: Record<string, number>;
}

export interface ActionItem5W2H {
  id: string;
  what: string;       // O que será feito
  why: string;        // Por que
  where: string;      // Onde
  who: string;        // Quem
  when: string;       // Quando (Prazo)
  how: string;        // Como
  howMuch: string;    // Quanto custa
  status: 'pending' | 'in_progress' | 'done' | 'overdue';
}

export interface MonthlyActionPlan {
  id: string;
  month: number;
  year: number;
  sectorId: string;
  managerId: string;
  items: ActionItem5W2H[];
  createdAt: string;
  updatedAt: string;
}
