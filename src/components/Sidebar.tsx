import React from 'react';
import { 
  Code2, 
  Binary, 
  FileCode, 
  Network, 
  ScrollText, 
  Trophy, 
  Terminal, 
  Stethoscope,
  ChevronRight,
  ShieldCheck,
  Zap
} from 'lucide-react';
import { TargetArtifact } from '../types/rea';

export type ViewType = 
  | 'decompiler' 
  | 'structure' 
  | 'electron' 
  | 'network' 
  | 'evidence' 
  | 'showcases' 
  | 'terminal' 
  | 'doctor';

interface SidebarProps {
  activeView: ViewType;
  onSelectView: (view: ViewType) => void;
  activeTarget: TargetArtifact;
}

export const Sidebar: React.FC<SidebarProps> = ({
  activeView,
  onSelectView,
  activeTarget,
}) => {
  const navItems: {
    id: ViewType;
    label: string;
    description: string;
    icon: React.ElementType;
    badge?: string;
    enabledForTarget?: boolean;
  }[] = [
    {
      id: 'decompiler',
      label: 'Decompiler & ASM',
      description: 'Pseudocode, Assembly & Hex',
      icon: Code2,
      badge: activeTarget.functions.length > 0 ? `${activeTarget.functions.length} fn` : undefined
    },
    {
      id: 'structure',
      label: 'Binary & Headers',
      description: 'Symbols, Strings & Mitigations',
      icon: Binary,
      badge: `${activeTarget.symbols.length + activeTarget.strings.length}`
    },
    {
      id: 'electron',
      label: 'JS & Electron',
      description: 'ASAR, IPC Channels & Fuses',
      icon: FileCode,
      badge: activeTarget.kind === 'javascript_electron' ? 'Active' : undefined
    },
    {
      id: 'network',
      label: 'Network & PCAP',
      description: 'HTTP streams, Payloads & Leaks',
      icon: Network,
      badge: activeTarget.kind === 'network_capture' ? 'Capture' : undefined
    },
    {
      id: 'evidence',
      label: 'Evidence Ledger',
      description: 'Provenance & Unknowns',
      icon: ScrollText,
      badge: `${activeTarget.evidence.length} facts`
    },
    {
      id: 'showcases',
      label: 'REA Showcases',
      description: 'DX-Ball, Notion & TH04',
      icon: Trophy,
      badge: '3 Studies'
    },
    {
      id: 'terminal',
      label: 'CLI & MCP Playground',
      description: 'Interactive REA & Tools',
      icon: Terminal,
      badge: 'CLI'
    },
    {
      id: 'doctor',
      label: 'Doctor & Setup',
      description: 'Toolchain Health & MCP Config',
      icon: Stethoscope,
      badge: 'Diagnostics'
    }
  ];

  return (
    <aside className="w-64 border-r border-slate-800 bg-slate-900/60 flex flex-col shrink-0 select-none">
      {/* Target Quick Card */}
      <div className="p-3.5 border-b border-slate-800/80 bg-slate-950/40">
        <div className="text-[10px] font-mono uppercase tracking-wider text-slate-400 font-semibold mb-1">
          Active Artifact
        </div>
        <div className="font-mono text-xs font-semibold text-slate-100 truncate" title={activeTarget.name}>
          {activeTarget.name}
        </div>
        <div className="flex items-center justify-between text-[11px] text-slate-400 mt-1 font-mono">
          <span className="text-cyan-400">{activeTarget.format.split(' ')[0]}</span>
          <span>{(activeTarget.fileSize / 1024).toFixed(1)} KB</span>
        </div>
        <div className="mt-2 text-[10px] font-mono text-slate-400 truncate bg-slate-900/90 px-2 py-1 rounded border border-slate-800 flex items-center justify-between">
          <span className="text-slate-400">Entry:</span>
          <span className="text-emerald-400">{activeTarget.entryPoint}</span>
        </div>
      </div>

      {/* Navigation List */}
      <nav className="p-2 space-y-1 flex-1 overflow-y-auto">
        <div className="px-2 py-1 text-[10px] uppercase tracking-wider font-mono text-slate-400 font-semibold">
          Workbench Views
        </div>
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeView === item.id;
          return (
            <button
              key={item.id}
              onClick={() => onSelectView(item.id)}
              className={`w-full text-left px-2.5 py-2 rounded-lg flex items-center justify-between transition group cursor-pointer ${
                isActive
                  ? 'bg-cyan-500/10 text-cyan-300 border border-cyan-500/30'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60 border border-transparent'
              }`}
            >
              <div className="flex items-center gap-2.5 min-w-0">
                <Icon className={`w-4 h-4 shrink-0 ${isActive ? 'text-cyan-400' : 'text-slate-400 group-hover:text-slate-300'}`} />
                <div className="truncate">
                  <div className="text-xs font-medium tracking-tight truncate leading-tight">
                    {item.label}
                  </div>
                  <div className="text-[10px] text-slate-400 truncate leading-tight mt-0.5">
                    {item.description}
                  </div>
                </div>
              </div>

              {item.badge && (
                <span
                  className={`text-[9px] font-mono px-1.5 py-0.5 rounded shrink-0 ml-1.5 ${
                    isActive
                      ? 'bg-cyan-400/20 text-cyan-300 border border-cyan-400/30 font-semibold'
                      : 'bg-slate-800 text-slate-400'
                  }`}
                >
                  {item.badge}
                </span>
              )}
            </button>
          );
        })}
      </nav>

      {/* Bottom Authority & Evidence Philosophy */}
      <div className="p-3 border-t border-slate-800 bg-slate-950/60 text-[10px] text-slate-400 font-mono leading-relaxed">
        <div className="flex items-center gap-1.5 text-cyan-400 font-semibold mb-1">
          <ShieldCheck className="w-3.5 h-3.5" />
          <span>Evidence Provenance</span>
        </div>
        <p className="line-clamp-2">
          Observation · Derivation · Inference · Unknown. Zero ungrounded speculation.
        </p>
      </div>
    </aside>
  );
};
