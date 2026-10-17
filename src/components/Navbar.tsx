import React from 'react';
import { TargetArtifact } from '../types/rea';
import { 
  Terminal, 
  Upload, 
  FileText, 
  CheckCircle2, 
  Layers, 
  Cpu, 
  ShieldCheck, 
  Activity,
  Download
} from 'lucide-react';

interface NavbarProps {
  targets: TargetArtifact[];
  activeTarget: TargetArtifact;
  onSelectTarget: (target: TargetArtifact) => void;
  onOpenUpload: () => void;
  onOpenTerminal: () => void;
  onExportReport: () => void;
  activeView: string;
}

export const Navbar: React.FC<NavbarProps> = ({
  targets,
  activeTarget,
  onSelectTarget,
  onOpenUpload,
  onOpenTerminal,
  onExportReport,
}) => {
  return (
    <header className="h-14 border-b border-slate-800 bg-slate-900/95 backdrop-blur px-4 flex items-center justify-between z-30 sticky top-0">
      {/* Brand & Target Switcher */}
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-2">
          <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center shadow-lg shadow-cyan-500/20 font-mono font-bold text-slate-950 text-sm">
            REA
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-bold text-sm tracking-wider text-slate-100 font-mono">REA</span>
              <span className="text-[10px] uppercase font-semibold tracking-wider px-1.5 py-0.5 rounded bg-cyan-950/80 text-cyan-400 border border-cyan-800/60">
                v6.5.0 MCP
              </span>
            </div>
            <p className="text-[11px] text-slate-400 hidden sm:block">Reverse Engineer Anything</p>
          </div>
        </div>

        <div className="h-6 w-px bg-slate-800 mx-1" />

        {/* Target Selector */}
        <div className="flex items-center gap-2">
          <label htmlFor="target-select" className="text-xs text-slate-400 flex items-center gap-1 font-mono">
            <Layers className="w-3.5 h-3.5 text-slate-500" />
            <span className="hidden md:inline">Target:</span>
          </label>
          <select
            id="target-select"
            value={activeTarget.id}
            onChange={(e) => {
              const selected = targets.find((t) => t.id === e.target.value);
              if (selected) onSelectTarget(selected);
            }}
            className="bg-slate-950 border border-slate-700/80 rounded-md text-xs font-mono text-cyan-300 py-1 px-2.5 focus:outline-none focus:ring-1 focus:ring-cyan-500 hover:border-slate-600 cursor-pointer max-w-[200px] sm:max-w-[280px] truncate"
          >
            {targets.map((t) => (
              <option key={t.id} value={t.id} className="bg-slate-900 text-slate-200">
                {t.name} [{t.format.split(' ')[0]}]
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Target Status Info & Quick Actions */}
      <div className="flex items-center gap-2 sm:gap-3">
        {/* Architecture Badge */}
        <div className="hidden lg:flex items-center gap-1.5 px-2.5 py-1 rounded bg-slate-800/60 border border-slate-700/50 text-[11px] font-mono text-slate-300">
          <Cpu className="w-3.5 h-3.5 text-cyan-400" />
          <span>{activeTarget.architecture}</span>
        </div>

        {/* Evidence Count Pill */}
        <div className="hidden md:flex items-center gap-1.5 px-2.5 py-1 rounded bg-emerald-950/40 border border-emerald-800/50 text-[11px] font-mono text-emerald-400">
          <CheckCircle2 className="w-3.5 h-3.5" />
          <span>{activeTarget.evidence.length} Evidence Facts</span>
        </div>

        {/* Engine status */}
        <div className="hidden xl:flex items-center gap-1 px-2 py-1 rounded bg-slate-800/50 border border-slate-700/40 text-[11px] text-slate-400">
          <Activity className="w-3 h-3 text-emerald-400 animate-pulse" />
          <span>Engine: <strong className="text-slate-200 font-mono">Ghidra + REA Static</strong></span>
        </div>

        {/* Actions */}
        <button
          onClick={onOpenUpload}
          className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-md bg-slate-800 hover:bg-slate-700 text-xs font-medium text-slate-200 border border-slate-700 transition"
          title="Upload or Inspect a new binary file"
        >
          <Upload className="w-3.5 h-3.5 text-cyan-400" />
          <span className="hidden sm:inline">Load Target</span>
        </button>

        <button
          onClick={onExportReport}
          className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-md bg-slate-800 hover:bg-slate-700 text-xs font-medium text-slate-200 border border-slate-700 transition"
          title="Export Evidence & Analysis Report"
        >
          <Download className="w-3.5 h-3.5 text-emerald-400" />
          <span className="hidden sm:inline">Export</span>
        </button>

        <button
          onClick={onOpenTerminal}
          className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-md bg-cyan-600 hover:bg-cyan-500 text-xs font-medium text-slate-950 font-mono transition shadow-sm"
          title="Open interactive REA CLI & MCP Playground"
        >
          <Terminal className="w-3.5 h-3.5" />
          <span>CLI / MCP</span>
        </button>
      </div>
    </header>
  );
};
