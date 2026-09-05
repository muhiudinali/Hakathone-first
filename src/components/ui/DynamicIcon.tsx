'use client';

import React from 'react';
import {
  Building2, FolderKanban, Briefcase, Layers, Code2, Rocket,
  Palette, Target, BarChart3, Globe, Zap, Shield,
  Cpu, Smartphone, Compass, Sparkles, Home, Lightbulb,
  Wrench, FileText, TrendingUp, Users, CheckSquare, Layout,
  Gamepad2, User, type LucideIcon,
} from 'lucide-react';

/**
 * Universal registry mapping both semantic icon keys AND legacy cartoonish emojis
 * to ultra-clean, professional vector Lucide icons.
 */
export const ICON_REGISTRY: Record<string, LucideIcon> = {
  // Semantic keys
  building: Building2,
  briefcase: Briefcase,
  folder: FolderKanban,
  home: Home,
  globe: Globe,
  rocket: Rocket,
  target: Target,
  barchart: BarChart3,
  chart: BarChart3,
  wrench: Wrench,
  palette: Palette,
  notes: FileText,
  filetext: FileText,
  code: Code2,
  laptop: Code2,
  smartphone: Smartphone,
  mobile: Smartphone,
  zap: Zap,
  shield: Shield,
  lightbulb: Lightbulb,
  layers: Layers,
  cpu: Cpu,
  sparkles: Sparkles,
  trending: TrendingUp,
  users: Users,
  compass: Compass,
  check: CheckSquare,
  layout: Layout,
  game: Gamepad2,
  user: User,

  // Legacy cartoonish emoji mappings (auto-converts all legacy data to vector icons)
  '🏢': Building2,
  '💼': Briefcase,
  '📁': FolderKanban,
  '🏠': Home,
  '🌐': Globe,
  '🚀': Rocket,
  '🎯': Target,
  '📊': BarChart3,
  '📈': TrendingUp,
  '🔧': Wrench,
  '🎨': Palette,
  '📝': FileText,
  '💻': Code2,
  '📱': Smartphone,
  '⚡': Zap,
  '🛡️': Shield,
  '💡': Lightbulb,
  '🏗️': Layers,
  '🔬': Cpu,
  '✨': Sparkles,
  '👥': Users,
  '🧭': Compass,
  '🎮': Gamepad2,
  '👨‍💼': Briefcase,
  '👩‍💼': Briefcase,
  '👨‍💻': Code2,
  '👩‍💻': Code2,
  '🦉': Compass,
  '🦊': Sparkles,
  '🐱': Sparkles,
};

/**
 * Curated list of professional icons available for selection in workspace & project creation
 */
export const PROFESSIONAL_ICONS: { id: string; label: string; icon: LucideIcon }[] = [
  { id: 'building', label: 'Company / HQ', icon: Building2 },
  { id: 'briefcase', label: 'Business & Ops', icon: Briefcase },
  { id: 'folder', label: 'Project Suite', icon: FolderKanban },
  { id: 'code', label: 'Engineering', icon: Code2 },
  { id: 'layers', label: 'Architecture', icon: Layers },
  { id: 'palette', label: 'Design & Creative', icon: Palette },
  { id: 'rocket', label: 'Product & Launch', icon: Rocket },
  { id: 'target', label: 'Goals & Milestones', icon: Target },
  { id: 'barchart', label: 'Analytics & Growth', icon: BarChart3 },
  { id: 'globe', label: 'Web & Growth', icon: Globe },
  { id: 'shield', label: 'Security & DevOps', icon: Shield },
  { id: 'zap', label: 'Sprints & Speed', icon: Zap },
  { id: 'cpu', label: 'Hardware / AI', icon: Cpu },
  { id: 'smartphone', label: 'Mobile Apps', icon: Smartphone },
  { id: 'notes', label: 'Docs & Research', icon: FileText },
  { id: 'home', label: 'General / Home', icon: Home },
];

export interface DynamicIconProps {
  icon?: string | null;
  size?: number;
  className?: string;
  fallback?: LucideIcon;
}

export function DynamicIcon({
  icon,
  size = 16,
  className,
  fallback = FolderKanban,
}: DynamicIconProps) {
  if (!icon) {
    const FallbackIcon = fallback;
    return <FallbackIcon size={size} className={className} />;
  }

  const IconComponent = ICON_REGISTRY[icon.trim()] || fallback;
  return <IconComponent size={size} className={className} />;
}

export default DynamicIcon;
