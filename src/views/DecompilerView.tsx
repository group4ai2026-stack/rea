import React, { useState } from 'react';
import { TargetArtifact, DecompiledFunction, InstructionLine } from '../types/rea';
import { 
  Code2, 
  Terminal, 
  Hash, 
  Search, 
  GitBranch, 
  Copy, 
  Check, 
  ArrowUpRight, 
  ExternalLink,
  Layers
} from 'lucide-react';
import { HexViewer } from '../components/HexViewer';

interface DecompilerViewProps {
  target: TargetArtifact;
}

export const DecompilerView: React.FC<DecompilerViewProps> = ({ target }) => {
  const [selectedFuncIndex, setSelectedFuncIndex] = useState(0);
  const [activeTab, setActiveTab] = useState<'pseudocode' | 'disassembly' | 'hex' | 'xrefs'>('pseudocode');
  const [searchFunc, setSearchFunc] = useState('');
  const [copied, setCopied] = useState(false);
  const [highlightedAddress, setHighlightedAddress] = useState<string | null>(null);

  const functions = target.functions;
  const filteredFunctions = functions.filter(f => 
    f.name.toLowerCase().includes(searchFunc.toLowerCase()) || 
    f.address.toLowerCase().includes(searchFunc.toLowerCase())
  );

  const currentFunc: DecompiledFunction | undefined = functions[selectedFuncIndex] || functions[0];

  const handleCopyCode = () => {
    if (!currentFunc) return;
    navigator.clipboard.writeText(currentFunc.code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (!currentFunc) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center p-8 text-center text-slate-400">
        <Code2 className="w-12 h-12 text-slate-600 mb-3" />
        <h3 className="text-base font-semibold text-slate-200">No Disassembler Routines in Target</h3>
        <p className="text-xs max-w-md mt-1 text-slate-500">
          This target artifact ({target.format}) is analyzed via higher-level structural, network, or storage engines. Switch to the corresponding tabs on the left.
        </p>
      </div>
    );
  }

  return (
    <div className="flex-1 flex overflow-hidden">
      {/* Left: Function Navigator */}
      <div className="w-72 border-r border-slate-800 bg-slate-950/70 flex flex-col shrink-0">
        {/* Search Header */}
        <div className="p-3 border-b border-slate-800">
          <div className="text-[10px] uppercase font-mono font-semibold text-slate-400 mb-1.5 flex items-center justify-between">
            <span>Functions & Symbols</span>
            <span className="text-cyan-400">{filteredFunctions.length} / {functions.length}</span>
          </div>
          <div className="relative">
            <Search className="w-3.5 h-3.5 text-slate-500 absolute left-2 top-2.5" />
            <input
              type="text"
              placeholder="Filter function or addr..."
              value={searchFunc}
              onChange={(e) => setSearchFunc(e.target.value)}
              className="w-full bg-slate-900 border border-slate-800 rounded pl-7 pr-2.5 py-1.5 text-xs text-slate-200 focus:outline-none focus:border-cyan-500 font-mono"
            />
          </div>
        </div>

        {/* Function List */}
        <div className="flex-1 overflow-y-auto p-1.5 space-y-1">
          {filteredFunctions.map((fn, idx) => {
            const isSelected = fn.name === currentFunc.name;
            return (
              <button
                key={fn.address + fn.name}
                onClick={() => setSelectedFuncIndex(functions.findIndex(f => f.name === fn.name))}
                className={`w-full text-left p-2 rounded-md font-mono text-xs transition cursor-pointer ${
                  isSelected
                    ? 'bg-cyan-500/15 text-cyan-300 border border-cyan-500/30'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900 border border-transparent'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="font-semibold truncate">{fn.name}</span>
                  <span className="text-[10px] text-slate-500 shrink-0 ml-1">{fn.address}</span>
                </div>
                <div className="text-[10px] text-slate-500 truncate mt-0.5">
                  {fn.instructions.length} insns · {fn.xrefs.length} xrefs
                </div>
              </button>
            );
          })}
        </div>

        {/* Function Summary Stats */}
        <div className="p-3 border-t border-slate-800 text-[11px] font-mono text-slate-400 bg-slate-900/40">
          <div>Engine: <span className="text-slate-200">Ghidra Decompiler v12.1</span></div>
          <div>Calling Conv: <span className="text-cyan-400">__fastcall / SysV</span></div>
        </div>
      </div>

      {/* Right: Code & Disassembly Panes */}
      <div className="flex-1 flex flex-col min-w-0 bg-slate-950">
        {/* Function Signature Banner */}
        <div className="p-3 border-b border-slate-800 bg-slate-900/90 flex flex-wrap items-center justify-between gap-3">
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <span className="px-1.5 py-0.5 rounded text-[10px] font-mono bg-cyan-950 text-cyan-400 border border-cyan-800">
                {currentFunc.address}
              </span>
              <h2 className="text-sm font-semibold text-slate-100 font-mono truncate">
                {currentFunc.name}
              </h2>
            </div>
            <div className="text-xs font-mono text-slate-400 mt-1 truncate">
              {currentFunc.signature}
            </div>
          </div>

          {/* Code View Mode Tabs */}
          <div className="flex items-center gap-1 bg-slate-950 p-1 rounded-lg border border-slate-800">
            <button
              onClick={() => setActiveTab('pseudocode')}
              className={`px-3 py-1 rounded text-xs font-medium font-mono flex items-center gap-1.5 transition ${
                activeTab === 'pseudocode'
                  ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/30'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Code2 className="w-3.5 h-3.5" />
              <span>Pseudocode</span>
            </button>
            <button
              onClick={() => setActiveTab('disassembly')}
              className={`px-3 py-1 rounded text-xs font-medium font-mono flex items-center gap-1.5 transition ${
                activeTab === 'disassembly'
                  ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/30'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Terminal className="w-3.5 h-3.5" />
              <span>Disassembly</span>
            </button>
            <button
              onClick={() => setActiveTab('hex')}
              className={`px-3 py-1 rounded text-xs font-medium font-mono flex items-center gap-1.5 transition ${
                activeTab === 'hex'
                  ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/30'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Hash className="w-3.5 h-3.5" />
              <span>Hex Dump</span>
            </button>
            <button
              onClick={() => setActiveTab('xrefs')}
              className={`px-3 py-1 rounded text-xs font-medium font-mono flex items-center gap-1.5 transition ${
                activeTab === 'xrefs'
                  ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/30'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <GitBranch className="w-3.5 h-3.5" />
              <span>XRefs ({currentFunc.xrefs.length})</span>
            </button>
          </div>
        </div>

        {/* Tab Content Panes */}
        <div className="flex-1 overflow-auto p-4">
          {activeTab === 'pseudocode' && (
            <div className="relative group">
              <button
                onClick={handleCopyCode}
                className="absolute top-3 right-3 p-1.5 rounded bg-slate-800/80 hover:bg-slate-700 text-slate-300 border border-slate-700 text-xs flex items-center gap-1 font-mono transition"
                title="Copy Decompiled Pseudocode"
              >
                {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copied ? 'Copied' : 'Copy'}</span>
              </button>

              <pre className="font-mono text-xs text-slate-200 leading-relaxed bg-slate-900/60 p-4 rounded-lg border border-slate-800/80 overflow-x-auto">
                <code>
                  {currentFunc.code.split('\n').map((line, i) => (
                    <div key={i} className="table-row hover:bg-slate-800/30">
                      <span className="table-cell select-none text-slate-600 text-right pr-4 text-[11px]">
                        {i + 1}
                      </span>
                      <span className="table-cell">
                        {line.includes('//') ? (
                          <span className="text-slate-500 italic">{line}</span>
                        ) : line.includes('return') || line.includes('if') || line.includes('for') ? (
                          <span className="text-cyan-400 font-semibold">{line}</span>
                        ) : line.includes('uint8_t') || line.includes('int') || line.includes('const') || line.includes('size_t') ? (
                          <span className="text-amber-300">{line}</span>
                        ) : (
                          line
                        )}
                      </span>
                    </div>
                  ))}
                </code>
              </pre>
            </div>
          )}

          {activeTab === 'disassembly' && (
            <div className="font-mono text-xs space-y-1 bg-slate-900/60 p-4 rounded-lg border border-slate-800/80">
              <div className="grid grid-cols-12 pb-2 mb-2 border-b border-slate-800 text-[11px] font-semibold text-slate-500 select-none">
                <div className="col-span-2">Address</div>
                <div className="col-span-2">Opcode Bytes</div>
                <div className="col-span-2">Instruction</div>
                <div className="col-span-3">Operands</div>
                <div className="col-span-3">Analysis Notes / Targets</div>
              </div>

              {currentFunc.instructions.length === 0 ? (
                <div className="text-slate-500 italic py-6 text-center text-xs">
                  Native x86/ARM disassembly is compiled into higher-level runtime for this target type.
                </div>
              ) : (
                currentFunc.instructions.map((ins, idx) => {
                  const isHighlighted = highlightedAddress === ins.address;
                  const isJump = ins.mnemonic.startsWith('j');
                  const isCall = ins.mnemonic === 'call';

                  return (
                    <div
                      key={idx}
                      className={`grid grid-cols-12 py-1 px-1 rounded transition items-center ${
                        isHighlighted ? 'bg-cyan-500/20 text-cyan-200' : 'hover:bg-slate-800/50'
                      }`}
                    >
                      <div className="col-span-2 text-cyan-400 font-medium select-none">
                        {ins.address}
                      </div>
                      <div className="col-span-2 text-slate-500 text-[11px] tracking-wider">
                        {ins.bytes}
                      </div>
                      <div className={`col-span-2 font-bold ${
                        isJump ? 'text-amber-400' : isCall ? 'text-emerald-400' : 'text-slate-200'
                      }`}>
                        {ins.mnemonic}
                      </div>
                      <div className="col-span-3 text-slate-300 truncate">
                        {ins.operands}
                      </div>
                      <div className="col-span-3 text-slate-500 text-[11px] truncate flex items-center gap-1">
                        {ins.jumpTarget && (
                          <button
                            onClick={() => setHighlightedAddress(ins.jumpTarget || null)}
                            className="text-cyan-400 hover:underline flex items-center gap-0.5"
                          >
                            <ArrowUpRight className="w-3 h-3" />
                            <span>{ins.jumpTarget}</span>
                          </button>
                        )}
                        {ins.comment && <span>; {ins.comment}</span>}
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          )}

          {activeTab === 'hex' && (
            <HexViewer samples={target.hexSample} baseAddress={currentFunc.address} />
          )}

          {activeTab === 'xrefs' && (
            <div className="space-y-4">
              <div className="p-4 rounded-lg bg-slate-900/60 border border-slate-800">
                <h3 className="text-xs font-semibold text-slate-200 font-mono mb-2 flex items-center gap-2">
                  <GitBranch className="w-4 h-4 text-cyan-400" />
                  <span>Callers & Cross-References to {currentFunc.name}</span>
                </h3>
                {currentFunc.xrefs.length === 0 ? (
                  <p className="text-xs text-slate-500 italic">No incoming cross-references recorded (possibly isolated or dynamic dispatch).</p>
                ) : (
                  <div className="space-y-2">
                    {currentFunc.xrefs.map((xref, idx) => (
                      <div key={idx} className="p-2.5 rounded bg-slate-950 border border-slate-800 flex items-center justify-between text-xs font-mono">
                        <div className="flex items-center gap-2">
                          <span className="px-1.5 py-0.5 rounded bg-emerald-950 text-emerald-400 text-[10px] border border-emerald-800">
                            {xref.type}
                          </span>
                          <span className="text-slate-200">{xref.from}</span>
                        </div>
                        <span className="text-[11px] text-cyan-400">Direct Reference</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Local Variables */}
              <div className="p-4 rounded-lg bg-slate-900/60 border border-slate-800">
                <h3 className="text-xs font-semibold text-slate-200 font-mono mb-2 flex items-center gap-2">
                  <Layers className="w-4 h-4 text-purple-400" />
                  <span>Stack Frame & Local Variables</span>
                </h3>
                {currentFunc.localVariables.length === 0 ? (
                  <p className="text-xs text-slate-500 italic">No stack frame variable allocations recorded.</p>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {currentFunc.localVariables.map((lv, idx) => (
                      <div key={idx} className="p-2 rounded bg-slate-950 border border-slate-800/80 text-xs font-mono">
                        <div className="flex justify-between text-slate-200 font-semibold">
                          <span>{lv.name}</span>
                          <span className="text-purple-400 text-[11px]">{lv.offset}</span>
                        </div>
                        <div className="text-[11px] text-slate-400 mt-0.5">{lv.type}</div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
