import React, { useState, useRef, useEffect } from 'react';
import { TargetArtifact, McpToolDefinition } from '../types/rea';
import { MCP_TOOLS } from '../data/mcpCatalog';
import { 
  Terminal as TerminalIcon, 
  Play, 
  RotateCcw, 
  Send, 
  Code, 
  CheckCircle2, 
  AlertCircle,
  Copy,
  Check
} from 'lucide-react';

interface McpTerminalViewProps {
  target: TargetArtifact;
}

export const McpTerminalView: React.FC<McpTerminalViewProps> = ({ target }) => {
  const [activeTab, setActiveTab] = useState<'terminal' | 'mcp_playground'>('terminal');

  // Terminal state
  const [commandInput, setCommandInput] = useState('');
  const [history, setHistory] = useState<string[]>([
    'REA v6.5.0 - Reverse Engineer Anything (CLI & MCP Workbench)',
    'Loaded session target: ' + target.name + ' (' + target.architecture + ')',
    'Type "rea --help", "rea doctor", or "rea analyze ' + target.name + '" to begin.',
    ''
  ]);
  const terminalBottomRef = useRef<HTMLDivElement>(null);

  // MCP playground state
  const [selectedToolIndex, setSelectedToolIndex] = useState(0);
  const [toolParamsJson, setToolParamsJson] = useState('{\n  "filePath": "' + target.name + '",\n  "engine": "ghidra"\n}');
  const [toolResponseJson, setToolResponseJson] = useState<string | null>(null);
  const [toolExecuting, setToolExecuting] = useState(false);
  const [copiedResponse, setCopiedResponse] = useState(false);

  useEffect(() => {
    terminalBottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [history]);

  const handleRunCommand = (e: React.FormEvent) => {
    e.preventDefault();
    const cmd = commandInput.trim();
    if (!cmd) return;

    const newHistory = [...history, `$ ${cmd}`];

    if (cmd === 'clear') {
      setHistory([]);
      setCommandInput('');
      return;
    } else if (cmd === 'rea --help' || cmd === 'rea -h' || cmd === 'help') {
      newHistory.push(
        'Usage: rea <command> [options]',
        '',
        'Commands:',
        '  rea analyze <path>              Analyze a native binary, APK, or bundle',
        '  rea inspect-javascript <path>   Inspect Electron/Node directory or ASAR',
        '  rea inspect-wasm <path>         Disassemble and validate WebAssembly module',
        '  rea inspect-sqlite <path>       Inspect tables, schema, and query SQLite database',
        '  rea inspect-capture <path>      Dissect HAR, SAZ, or PCAP network streams',
        '  rea doctor                      Check local engine dependencies & paths',
        '  rea setup                       Configure agent MCP registrations',
        '  rea evidence export             Dump current Evidence Ledger to JSON',
        '  rea status                      Print active session and loaded target info',
        ''
      );
    } else if (cmd === 'rea doctor') {
      newHistory.push(
        'REA Doctor Diagnostics (v6.5.0):',
        '  [+] Node.js v22.19.0       -> PASS (Standard toolchain)',
        '  [+] Ghidra Headless 12.1.4 -> PASS (/opt/ghidra/support/analyzeHeadless)',
        '  [+] Hopper v4.8.1          -> PASS (/usr/bin/hopper-v4)',
        '  [+] JADX Decompiler 1.5.0  -> PASS (/usr/local/bin/jadx)',
        '  [+] WABT 1.0.42            -> PASS (/usr/bin/wasm2wat)',
        '  [+] TShark Dissector 4.2.2 -> PASS (/usr/bin/tshark)',
        '  [~] IDA Pro                -> OPTIONAL (Not configured)',
        'All critical reverse engineering engines verified and fail-closed isolated.'
      );
    } else if (cmd.startsWith('rea analyze')) {
      newHistory.push(
        `[REA] Dispatching static & Ghidra analysis on "${target.name}"...`,
        `  Format: ${target.format}`,
        `  Architecture: ${target.architecture}`,
        `  Entry Point: ${target.entryPoint}`,
        `  Found ${target.functions.length} functions, ${target.symbols.length} symbols, ${target.strings.length} string literals.`,
        `  Mitigations: NX=${target.mitigations[0]?.enabled ? 'YES' : 'NO'}, ASLR=${target.mitigations[1]?.enabled ? 'YES' : 'NO'}.`,
        `Analysis completed in 184ms. Evidence ledger updated.`
      );
    } else if (cmd === 'rea evidence export') {
      newHistory.push(
        JSON.stringify(target.evidence, null, 2),
        `Exported ${target.evidence.length} evidence facts with full provenance.`
      );
    } else if (cmd === 'rea status') {
      newHistory.push(
        `Active Target: ${target.name}`,
        `Kind: ${target.kind}`,
        `SHA-256: ${target.sha256}`,
        `Evidence items: ${target.evidence.length}`
      );
    } else {
      newHistory.push(`rea: command not recognized: "${cmd}". Type "rea --help" for available commands.`);
    }

    setHistory(newHistory);
    setCommandInput('');
  };

  const handleExecuteMcpTool = () => {
    const selectedTool = MCP_TOOLS[selectedToolIndex];
    setToolExecuting(true);

    setTimeout(() => {
      let resultData: any;
      try {
        const parsed = JSON.parse(toolParamsJson);
        resultData = {
          tool: selectedTool.name,
          status: 'success',
          timestamp: new Date().toISOString(),
          target: target.name,
          evidenceCount: target.evidence.length,
          response: {
            artifact: {
              name: target.name,
              format: target.format,
              architecture: target.architecture,
              entryPoint: target.entryPoint
            },
            decompilation: target.functions[0] || null,
            symbolsCount: target.symbols.length,
            stringsSample: target.strings.slice(0, 3),
            evidence: target.evidence
          }
        };
      } catch (err: any) {
        resultData = {
          tool: selectedTool.name,
          status: 'error',
          error: 'Invalid JSON parameters: ' + err.message
        };
      }

      setToolResponseJson(JSON.stringify(resultData, null, 2));
      setToolExecuting(false);
    }, 400);
  };

  const handleCopyMcp = () => {
    if (!toolResponseJson) return;
    navigator.clipboard.writeText(toolResponseJson);
    setCopiedResponse(true);
    setTimeout(() => setCopiedResponse(false), 2000);
  };

  return (
    <div className="flex-1 flex flex-col bg-slate-950 overflow-hidden font-mono">
      {/* Header Tabs */}
      <div className="p-3 border-b border-slate-800 bg-slate-900/90 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <TerminalIcon className="w-4 h-4 text-cyan-400" />
          <h2 className="font-semibold text-sm text-slate-100">
            REA Execution Bridge & Model Context Protocol Playground
          </h2>
        </div>

        <div className="flex items-center gap-1 bg-slate-950 p-1 rounded-lg border border-slate-800 text-xs">
          <button
            onClick={() => setActiveTab('terminal')}
            className={`px-3 py-1 rounded transition font-medium ${
              activeTab === 'terminal' ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/30' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Interactive CLI Terminal
          </button>
          <button
            onClick={() => setActiveTab('mcp_playground')}
            className={`px-3 py-1 rounded transition font-medium ${
              activeTab === 'mcp_playground' ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/30' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            MCP Tool Playground ({MCP_TOOLS.length} tools)
          </button>
        </div>
      </div>

      {/* Tab 1: Terminal */}
      {activeTab === 'terminal' && (
        <div className="flex-1 flex flex-col p-4 bg-slate-950 overflow-hidden">
          <div className="flex-1 overflow-y-auto space-y-1 text-xs leading-relaxed text-slate-300 pr-2">
            {history.map((line, idx) => (
              <div key={idx} className={line.startsWith('$') ? 'text-cyan-400 font-bold pt-1' : 'text-slate-300'}>
                {line}
              </div>
            ))}
            <div ref={terminalBottomRef} />
          </div>

          <form onSubmit={handleRunCommand} className="mt-3 flex items-center gap-2 pt-3 border-t border-slate-800">
            <span className="text-cyan-400 font-bold">$</span>
            <input
              type="text"
              value={commandInput}
              onChange={(e) => setCommandInput(e.target.value)}
              placeholder='Type "rea --help", "rea doctor", "rea analyze", "clear"...'
              className="flex-1 bg-slate-900 border border-slate-800 rounded px-3 py-2 text-xs text-slate-100 focus:outline-none focus:border-cyan-500"
              autoFocus
            />
            <button
              type="submit"
              className="px-4 py-2 rounded bg-cyan-600 hover:bg-cyan-500 text-slate-950 font-bold text-xs flex items-center gap-1.5 transition"
            >
              <Send className="w-3.5 h-3.5" />
              <span>Send</span>
            </button>
          </form>
        </div>
      )}

      {/* Tab 2: MCP Tool Playground */}
      {activeTab === 'mcp_playground' && (
        <div className="flex-1 flex overflow-hidden">
          {/* Tool Selector */}
          <div className="w-72 border-r border-slate-800 bg-slate-950/70 p-2 overflow-y-auto space-y-1">
            <div className="p-2 text-[10px] uppercase font-semibold text-slate-400">
              Registered MCP Tools
            </div>
            {MCP_TOOLS.map((tool, idx) => (
              <button
                key={tool.name}
                onClick={() => {
                  setSelectedToolIndex(idx);
                  setToolParamsJson(JSON.stringify({
                    filePath: target.name,
                    engine: 'ghidra'
                  }, null, 2));
                  setToolResponseJson(null);
                }}
                className={`w-full text-left p-2 rounded text-xs transition cursor-pointer ${
                  selectedToolIndex === idx
                    ? 'bg-cyan-500/15 text-cyan-300 border border-cyan-500/30'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900 border border-transparent'
                }`}
              >
                <div className="font-bold truncate text-[11px]">{tool.name}</div>
                <div className="text-[10px] text-slate-500 truncate mt-0.5">{tool.category}</div>
              </button>
            ))}
          </div>

          {/* Tool Parameters & Result View */}
          <div className="flex-1 flex flex-col p-4 overflow-y-auto space-y-4">
            <div className="bg-slate-900/60 p-4 rounded-lg border border-slate-800">
              <div className="flex items-center justify-between mb-2">
                <span className="font-bold text-slate-100 text-sm">
                  {MCP_TOOLS[selectedToolIndex].name}
                </span>
                <span className="text-[10px] px-2 py-0.5 rounded bg-slate-800 text-cyan-300">
                  {MCP_TOOLS[selectedToolIndex].category}
                </span>
              </div>
              <p className="text-xs text-slate-400 font-sans">
                {MCP_TOOLS[selectedToolIndex].description}
              </p>
            </div>

            {/* Input JSON */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between text-xs text-slate-400">
                <span>Arguments (JSON):</span>
                <button
                  onClick={handleExecuteMcpTool}
                  disabled={toolExecuting}
                  className="px-3 py-1 rounded bg-cyan-600 hover:bg-cyan-500 text-slate-950 font-bold flex items-center gap-1.5 transition disabled:opacity-50"
                >
                  <Play className="w-3.5 h-3.5 fill-current" />
                  <span>{toolExecuting ? 'Invoking MCP...' : 'Invoke Tool'}</span>
                </button>
              </div>
              <textarea
                rows={5}
                value={toolParamsJson}
                onChange={(e) => setToolParamsJson(e.target.value)}
                className="w-full bg-slate-900 border border-slate-800 rounded p-3 text-xs text-slate-200 focus:outline-none focus:border-cyan-500 font-mono"
              />
            </div>

            {/* Response Output */}
            {toolResponseJson && (
              <div className="space-y-1.5">
                <div className="flex items-center justify-between text-xs text-slate-400">
                  <span className="text-emerald-400 font-bold flex items-center gap-1">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    MCP Output Payload
                  </span>
                  <button
                    onClick={handleCopyMcp}
                    className="flex items-center gap-1 text-[11px] text-slate-400 hover:text-slate-200"
                  >
                    {copiedResponse ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                    <span>{copiedResponse ? 'Copied' : 'Copy Response'}</span>
                  </button>
                </div>
                <pre className="p-4 bg-slate-900/80 border border-slate-800 rounded-lg text-xs text-slate-200 overflow-x-auto max-h-96 leading-relaxed">
                  <code>{toolResponseJson}</code>
                </pre>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
