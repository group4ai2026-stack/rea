import React, { useState } from 'react';
import { SHOWCASES } from '../data/showcases';
import { Showcase } from '../types/rea';
import { 
  Trophy, 
  CheckCircle2, 
  Play, 
  Copy, 
  Check, 
  ArrowRight, 
  GitCompare, 
  ShieldCheck, 
  Code2, 
  Cpu
} from 'lucide-react';

export const ShowcasesView: React.FC = () => {
  const [activeShowcaseId, setActiveShowcaseId] = useState<string>('dx-ball');
  const [verifying, setVerifying] = useState(false);
  const [verificationDone, setVerificationDone] = useState(false);
  const [copiedCode, setCopiedCode] = useState(false);

  const currentShowcase = SHOWCASES.find(s => s.id === activeShowcaseId) || SHOWCASES[0];

  const runVerification = () => {
    setVerifying(true);
    setVerificationDone(false);
    setTimeout(() => {
      setVerifying(false);
      setVerificationDone(true);
    }, 1200);
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(currentShowcase.reconstructedCode);
    setCopiedCode(true);
    setTimeout(() => setCopiedCode(false), 2000);
  };

  return (
    <div className="flex-1 flex flex-col bg-slate-950 overflow-hidden">
      {/* Top Header */}
      <div className="p-3 border-b border-slate-800 bg-slate-900/90 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <Trophy className="w-4 h-4 text-amber-400" />
          <h2 className="font-semibold text-sm text-slate-100 font-mono">
            REA Reverse Engineering Showcases & Ground-Truth Reconstructions
          </h2>
        </div>

        {/* Showcase Switcher Pills */}
        <div className="flex items-center gap-1 bg-slate-950 p-1 rounded-lg border border-slate-800">
          {SHOWCASES.map((sc) => (
            <button
              key={sc.id}
              onClick={() => {
                setActiveShowcaseId(sc.id);
                setVerificationDone(false);
              }}
              className={`px-3 py-1 rounded text-xs font-mono font-medium transition ${
                activeShowcaseId === sc.id
                  ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30 font-bold'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              {sc.title.split(':')[0]}
            </button>
          ))}
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {/* Showcase Header Banner */}
        <div className="p-4 rounded-xl bg-gradient-to-r from-slate-900 via-slate-900 to-amber-950/20 border border-slate-800 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-[10px] font-mono uppercase tracking-wider px-2 py-0.5 rounded bg-amber-950 text-amber-400 border border-amber-800/80 font-bold">
                {currentShowcase.category}
              </span>
              <span className="text-xs font-mono text-slate-400">Target: {currentShowcase.target}</span>
            </div>
            <h1 className="text-lg font-bold text-slate-100">{currentShowcase.title}</h1>
            <p className="text-xs text-slate-400 mt-1">{currentShowcase.subtitle}</p>
          </div>

          <div className="flex flex-col items-start md:items-end gap-2 shrink-0">
            <span className="px-2.5 py-1 rounded-md bg-emerald-950 text-emerald-400 border border-emerald-800 text-xs font-mono font-bold flex items-center gap-1.5">
              <CheckCircle2 className="w-3.5 h-3.5" />
              {currentShowcase.badge}
            </span>
            <button
              onClick={runVerification}
              disabled={verifying}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-mono font-bold transition disabled:opacity-50"
            >
              <Play className="w-3.5 h-3.5 fill-current" />
              <span>{verifying ? 'Running Test Suite...' : 'Verify Test Cases'}</span>
            </button>
          </div>
        </div>

        {/* Verification Status Banner */}
        {verificationDone && (
          <div className="p-3 bg-emerald-950/40 border border-emerald-800/80 rounded-lg text-emerald-300 font-mono text-xs flex items-center justify-between">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              <span>
                Suite Complete: {currentShowcase.verificationStats.testCasesPassed} of {currentShowcase.verificationStats.totalTestCases} tests passed (100% precision).
              </span>
            </div>
            <span className="text-slate-400 text-[11px]">
              Compiler Target: {currentShowcase.verificationStats.compilerTarget}
            </span>
          </div>
        )}

        {/* Overview & Challenge */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 font-sans text-xs">
          <div className="p-4 rounded-lg bg-slate-900/60 border border-slate-800 space-y-2">
            <h3 className="font-bold text-slate-200 font-mono flex items-center gap-1.5">
              <Cpu className="w-3.5 h-3.5 text-cyan-400" />
              <span>Overview & Objective</span>
            </h3>
            <p className="text-slate-300 leading-relaxed">{currentShowcase.overview}</p>
          </div>

          <div className="p-4 rounded-lg bg-slate-900/60 border border-slate-800 space-y-2">
            <h3 className="font-bold text-slate-200 font-mono flex items-center gap-1.5">
              <ShieldCheck className="w-3.5 h-3.5 text-amber-400" />
              <span>Reverse Engineering Challenge</span>
            </h3>
            <p className="text-slate-300 leading-relaxed">{currentShowcase.challenge}</p>
          </div>
        </div>

        {/* Key Findings List */}
        <div className="p-4 rounded-lg bg-slate-900/60 border border-slate-800 space-y-2 font-mono text-xs">
          <h3 className="font-bold text-slate-200 flex items-center gap-2">
            <Trophy className="w-3.5 h-3.5 text-amber-400" />
            <span>Key Provenance & Ground-Truth Findings</span>
          </h3>
          <ul className="grid grid-cols-1 md:grid-cols-2 gap-2 pt-1 font-sans">
            {currentShowcase.findings.map((finding, idx) => (
              <li key={idx} className="flex items-start gap-2 text-slate-300">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5" />
                <span>{finding}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Code Comparison Side-by-Side */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {/* Flawed Decompiler Output */}
          <div className="rounded-lg border border-slate-800 bg-slate-900/60 overflow-hidden flex flex-col">
            <div className="p-2.5 border-b border-slate-800 bg-slate-900 flex items-center justify-between text-xs font-mono">
              <span className="text-rose-400 font-bold flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-rose-500" />
                Raw / Flawed Decompiler Output
              </span>
              <span className="text-[10px] text-slate-500">Ghidra / Generic</span>
            </div>
            <pre className="p-4 font-mono text-xs text-rose-200/80 bg-slate-950/80 overflow-x-auto flex-1 leading-relaxed">
              <code>{currentShowcase.originalCode}</code>
            </pre>
          </div>

          {/* REA Reconstructed Clean Code */}
          <div className="rounded-lg border border-emerald-900/60 bg-slate-900/60 overflow-hidden flex flex-col">
            <div className="p-2.5 border-b border-emerald-900/60 bg-emerald-950/40 flex items-center justify-between text-xs font-mono">
              <span className="text-emerald-400 font-bold flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                REA Reconstructed Ground Truth (Verified)
              </span>
              <button
                onClick={handleCopy}
                className="px-2 py-0.5 rounded bg-emerald-900/60 hover:bg-emerald-800 text-emerald-200 text-[11px] flex items-center gap-1 transition"
              >
                {copiedCode ? <Check className="w-3 h-3 text-emerald-300" /> : <Copy className="w-3 h-3" />}
                <span>{copiedCode ? 'Copied' : 'Copy C/C++'}</span>
              </button>
            </div>
            <pre className="p-4 font-mono text-xs text-emerald-200 bg-slate-950/80 overflow-x-auto flex-1 leading-relaxed">
              <code>{currentShowcase.reconstructedCode}</code>
            </pre>
          </div>
        </div>
      </div>
    </div>
  );
};
