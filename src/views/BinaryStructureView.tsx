import React, { useState } from 'react';
import { TargetArtifact, SectionInfo, SymbolInfo, StringEntry, MitigationStatus } from '../types/rea';
import { 
  Binary, 
  ShieldCheck, 
  ShieldAlert, 
  Hash, 
  Search, 
  Tag, 
  Layers, 
  Filter, 
  CheckCircle2, 
  XCircle,
  ExternalLink
} from 'lucide-react';

interface BinaryStructureViewProps {
  target: TargetArtifact;
}

export const BinaryStructureView: React.FC<BinaryStructureViewProps> = ({ target }) => {
  const [subTab, setSubTab] = useState<'symbols' | 'strings' | 'sections' | 'mitigations'>('symbols');
  const [symbolQuery, setSymbolQuery] = useState('');
  const [stringQuery, setStringQuery] = useState('');
  const [symbolFilter, setSymbolFilter] = useState<'all' | 'function' | 'import' | 'export' | 'object'>('all');

  const filteredSymbols = target.symbols.filter(sym => {
    const matchesQuery = sym.name.toLowerCase().includes(symbolQuery.toLowerCase()) || 
                         sym.address.toLowerCase().includes(symbolQuery.toLowerCase());
    const matchesType = symbolFilter === 'all' || sym.type === symbolFilter;
    return matchesQuery && matchesType;
  });

  const filteredStrings = target.strings.filter(str => {
    return str.value.toLowerCase().includes(stringQuery.toLowerCase()) || 
           str.virtualAddress.toLowerCase().includes(stringQuery.toLowerCase());
  });

  return (
    <div className="flex-1 flex flex-col bg-slate-950 overflow-hidden">
      {/* Subtab Header */}
      <div className="p-3 border-b border-slate-800 bg-slate-900/90 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <Binary className="w-4 h-4 text-cyan-400" />
          <h2 className="font-semibold text-sm text-slate-100 font-mono">Binary Layout & Diagnostics</h2>
          <span className="text-xs text-slate-400 font-mono">[{target.format}]</span>
        </div>

        {/* Tab Buttons */}
        <div className="flex items-center gap-1 bg-slate-950 p-1 rounded-lg border border-slate-800">
          <button
            onClick={() => setSubTab('symbols')}
            className={`px-3 py-1 rounded text-xs font-mono font-medium transition ${
              subTab === 'symbols' ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/30' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Symbols ({target.symbols.length})
          </button>
          <button
            onClick={() => setSubTab('strings')}
            className={`px-3 py-1 rounded text-xs font-mono font-medium transition ${
              subTab === 'strings' ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/30' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Strings ({target.strings.length})
          </button>
          <button
            onClick={() => setSubTab('sections')}
            className={`px-3 py-1 rounded text-xs font-mono font-medium transition ${
              subTab === 'sections' ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/30' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Sections ({target.sections.length})
          </button>
          <button
            onClick={() => setSubTab('mitigations')}
            className={`px-3 py-1 rounded text-xs font-mono font-medium transition ${
              subTab === 'mitigations' ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/30' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Mitigations ({target.mitigations.length})
          </button>
        </div>
      </div>

      {/* Main Tab Panels */}
      <div className="flex-1 overflow-auto p-4">
        {/* SYMBOLS TAB */}
        {subTab === 'symbols' && (
          <div className="space-y-3">
            <div className="flex flex-wrap items-center justify-between gap-3 bg-slate-900/60 p-2.5 rounded-lg border border-slate-800">
              <div className="relative flex-1 max-w-sm">
                <Search className="w-3.5 h-3.5 text-slate-500 absolute left-2 top-2.5" />
                <input
                  type="text"
                  placeholder="Filter symbols or addresses..."
                  value={symbolQuery}
                  onChange={(e) => setSymbolQuery(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded pl-7 pr-2.5 py-1 text-xs text-slate-200 focus:outline-none focus:border-cyan-500 font-mono"
                />
              </div>

              <div className="flex items-center gap-1 text-xs font-mono">
                <span className="text-slate-500 mr-1 flex items-center gap-1">
                  <Filter className="w-3 h-3" /> Type:
                </span>
                {(['all', 'function', 'import', 'export', 'object'] as const).map(type => (
                  <button
                    key={type}
                    onClick={() => setSymbolFilter(type)}
                    className={`px-2 py-0.5 rounded uppercase text-[10px] ${
                      symbolFilter === type
                        ? 'bg-cyan-500 text-slate-950 font-bold'
                        : 'bg-slate-800 text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    {type}
                  </button>
                ))}
              </div>
            </div>

            {/* Symbols Table */}
            <div className="border border-slate-800 rounded-lg overflow-hidden bg-slate-900/40">
              <table className="w-full text-left font-mono text-xs border-collapse">
                <thead>
                  <tr className="border-b border-slate-800 bg-slate-900 text-slate-400 text-[11px] select-none">
                    <th className="p-2.5 font-semibold">Address</th>
                    <th className="p-2.5 font-semibold">Symbol Name</th>
                    <th className="p-2.5 font-semibold">Type</th>
                    <th className="p-2.5 font-semibold">Binding</th>
                    <th className="p-2.5 font-semibold">Section</th>
                    <th className="p-2.5 font-semibold text-right">Size</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60">
                  {filteredSymbols.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="p-6 text-center text-slate-500 italic">
                        No symbols match the current search filter.
                      </td>
                    </tr>
                  ) : (
                    filteredSymbols.map((sym, idx) => (
                      <tr key={idx} className="hover:bg-slate-800/40 transition">
                        <td className="p-2.5 text-cyan-400 font-semibold">{sym.address}</td>
                        <td className="p-2.5 text-slate-200 font-medium">
                          {sym.name}
                          {sym.demangledName && (
                            <span className="block text-[10px] text-slate-500 truncate">{sym.demangledName}</span>
                          )}
                        </td>
                        <td className="p-2.5">
                          <span className={`px-1.5 py-0.5 rounded text-[10px] uppercase font-semibold ${
                            sym.type === 'function' ? 'bg-purple-950 text-purple-300 border border-purple-800' :
                            sym.type === 'import' ? 'bg-blue-950 text-blue-300 border border-blue-800' :
                            sym.type === 'export' ? 'bg-emerald-950 text-emerald-300 border border-emerald-800' :
                            'bg-slate-800 text-slate-300'
                          }`}>
                            {sym.type}
                          </span>
                        </td>
                        <td className="p-2.5 text-slate-400 text-[11px]">{sym.binding}</td>
                        <td className="p-2.5 text-amber-400/90 text-[11px]">{sym.section}</td>
                        <td className="p-2.5 text-right text-slate-400">{sym.size > 0 ? `${sym.size} B` : '-'}</td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* STRINGS TAB */}
        {subTab === 'strings' && (
          <div className="space-y-3">
            <div className="flex items-center justify-between gap-3 bg-slate-900/60 p-2.5 rounded-lg border border-slate-800">
              <div className="relative flex-1 max-w-md">
                <Search className="w-3.5 h-3.5 text-slate-500 absolute left-2 top-2.5" />
                <input
                  type="text"
                  placeholder="Search extracted ASCII/UTF string literals..."
                  value={stringQuery}
                  onChange={(e) => setStringQuery(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded pl-7 pr-2.5 py-1 text-xs text-slate-200 focus:outline-none focus:border-cyan-500 font-mono"
                />
              </div>
              <div className="text-xs text-slate-400 font-mono">
                Showing {filteredStrings.length} of {target.strings.length} extracted literals
              </div>
            </div>

            <div className="border border-slate-800 rounded-lg overflow-hidden bg-slate-900/40">
              <table className="w-full text-left font-mono text-xs border-collapse">
                <thead>
                  <tr className="border-b border-slate-800 bg-slate-900 text-slate-400 text-[11px] select-none">
                    <th className="p-2.5 font-semibold">Virtual Addr</th>
                    <th className="p-2.5 font-semibold">File Offset</th>
                    <th className="p-2.5 font-semibold">String Content</th>
                    <th className="p-2.5 font-semibold">Encoding</th>
                    <th className="p-2.5 font-semibold">Section</th>
                    <th className="p-2.5 font-semibold text-right">XRefs</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60">
                  {filteredStrings.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="p-6 text-center text-slate-500 italic">
                        No string literals match the filter query.
                      </td>
                    </tr>
                  ) : (
                    filteredStrings.map((str, idx) => (
                      <tr key={idx} className="hover:bg-slate-800/40 transition">
                        <td className="p-2.5 text-cyan-400">{str.virtualAddress}</td>
                        <td className="p-2.5 text-slate-500 text-[11px]">{str.offset}</td>
                        <td className="p-2.5 text-emerald-300 font-semibold max-w-md truncate">
                          "{str.value.replace('\n', '\\n')}"
                        </td>
                        <td className="p-2.5 text-slate-400 text-[10px]">{str.encoding}</td>
                        <td className="p-2.5 text-amber-400/90 text-[11px]">{str.section}</td>
                        <td className="p-2.5 text-right">
                          <span className="px-1.5 py-0.5 rounded bg-slate-800 text-[11px] text-slate-300">
                            {str.xrefCount} refs
                          </span>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* SECTIONS TAB */}
        {subTab === 'sections' && (
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
              {target.sections.map((sec, idx) => (
                <div key={idx} className="p-3.5 rounded-lg bg-slate-900/60 border border-slate-800 flex flex-col justify-between">
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-mono text-sm font-bold text-cyan-300">{sec.name}</span>
                      <span className="font-mono text-[10px] px-2 py-0.5 rounded bg-slate-800 text-slate-300 border border-slate-700">
                        {sec.permissions}
                      </span>
                    </div>
                    <div className="text-xs text-slate-400 mb-3">{sec.purpose}</div>
                    
                    <div className="space-y-1 font-mono text-[11px] text-slate-400">
                      <div className="flex justify-between">
                        <span>V. Address:</span>
                        <span className="text-slate-200">{sec.virtualAddress}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Raw Size:</span>
                        <span className="text-slate-200">{sec.rawSize}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Offset:</span>
                        <span className="text-slate-200">{sec.fileOffset}</span>
                      </div>
                    </div>
                  </div>

                  {/* Entropy bar */}
                  <div className="mt-3 pt-2.5 border-t border-slate-800/80">
                    <div className="flex justify-between text-[10px] font-mono mb-1">
                      <span className="text-slate-400">Entropy:</span>
                      <span className={sec.entropy > 7.0 ? 'text-amber-400 font-bold' : 'text-slate-300'}>
                        {sec.entropy.toFixed(2)} / 8.0
                      </span>
                    </div>
                    <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden">
                      <div
                        className={`h-full ${
                          sec.entropy > 7.0 ? 'bg-amber-400' : sec.entropy > 5.0 ? 'bg-cyan-400' : 'bg-slate-500'
                        }`}
                        style={{ width: `${(sec.entropy / 8) * 100}%` }}
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* MITIGATIONS TAB */}
        {subTab === 'mitigations' && (
          <div className="space-y-4 max-w-4xl">
            <div className="p-3.5 bg-slate-900/60 border border-slate-800 rounded-lg">
              <h3 className="text-xs font-semibold text-slate-200 font-mono mb-1">
                Binary Security Mitigations & Exploit Defense Audit
              </h3>
              <p className="text-xs text-slate-400">
                Static binary diagnostics checking for modern OS compiler mitigations and hardening primitives.
              </p>
            </div>

            <div className="space-y-2">
              {target.mitigations.map((mit, idx) => (
                <div
                  key={idx}
                  className={`p-3.5 rounded-lg border flex items-start justify-between gap-4 font-mono ${
                    mit.enabled
                      ? 'bg-emerald-950/20 border-emerald-800/40'
                      : 'bg-rose-950/20 border-rose-800/40'
                  }`}
                >
                  <div className="flex items-start gap-3">
                    {mit.enabled ? (
                      <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
                    ) : (
                      <XCircle className="w-5 h-5 text-rose-400 shrink-0 mt-0.5" />
                    )}
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold text-slate-100">{mit.name}</span>
                        <span className={`text-[10px] uppercase px-1.5 py-0.5 rounded font-semibold ${
                          mit.enabled ? 'bg-emerald-900/80 text-emerald-300' : 'bg-rose-900/80 text-rose-300'
                        }`}>
                          {mit.enabled ? 'Enabled' : 'Disabled / Missing'}
                        </span>
                      </div>
                      <p className="text-xs text-slate-400 mt-1 font-sans">{mit.details}</p>
                    </div>
                  </div>

                  <span className={`text-[10px] uppercase font-semibold px-2 py-0.5 rounded shrink-0 ${
                    mit.severity === 'high' ? 'bg-rose-950 text-rose-400 border border-rose-800' :
                    mit.severity === 'medium' ? 'bg-amber-950 text-amber-400 border border-amber-800' :
                    'bg-slate-800 text-slate-400'
                  }`}>
                    Risk: {mit.severity}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
