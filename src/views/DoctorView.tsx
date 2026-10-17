import React, { useState } from 'react';
import { DOCTOR_CHECKS } from '../data/mcpCatalog';
import { 
  Stethoscope, 
  CheckCircle2, 
  AlertCircle, 
  Check, 
  Copy, 
  Cpu, 
  Terminal, 
  ExternalLink,
  ShieldCheck,
  Bot
} from 'lucide-react';

export const DoctorView: React.FC = () => {
  const [selectedAgent, setSelectedAgent] = useState<'claude' | 'cursor' | 'gemini' | 'codex'>('claude');
  const [copiedConfig, setCopiedConfig] = useState(false);

  const agentConfigs: Record<string, { file: string; config: string }> = {
    claude: {
      file: '~/Library/Application Support/Claude/claude_desktop_config.json (macOS)\n%APPDATA%\\Claude\\claude_desktop_config.json (Windows)',
      config: JSON.stringify({
        mcpServers: {
          rea: {
            command: "npx",
            args: ["-y", "rea-agents@latest", "mcp"]
          }
        }
      }, null, 2)
    },
    cursor: {
      file: '.cursor/mcp.json (Project or Global)',
      config: JSON.stringify({
        mcpServers: {
          rea: {
            command: "npx",
            args: ["-y", "rea-agents@latest", "mcp"]
          }
        }
      }, null, 2)
    },
    gemini: {
      file: '~/.gemini/mcp_config.json',
      config: JSON.stringify({
        servers: [
          {
            name: "rea",
            command: "npx",
            args: ["-y", "rea-agents@latest", "mcp"],
            env: {
              REA_DEFAULT_ENGINE: "ghidra"
            }
          }
        ]
      }, null, 2)
    },
    codex: {
      file: '~/.codex/config.json',
      config: JSON.stringify({
        mcp_servers: {
          rea: {
            command: "npx",
            args: ["-y", "rea-agents@latest", "mcp"]
          }
        }
      }, null, 2)
    }
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(agentConfigs[selectedAgent].config);
    setCopiedConfig(true);
    setTimeout(() => setCopiedConfig(false), 2000);
  };

  return (
    <div className="flex-1 flex flex-col bg-slate-950 overflow-hidden font-mono">
      {/* Top Banner */}
      <div className="p-3 border-b border-slate-800 bg-slate-900/90 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <Stethoscope className="w-4 h-4 text-cyan-400" />
          <h2 className="font-semibold text-sm text-slate-100">
            REA Doctor Diagnostics & Agent Integrations
          </h2>
        </div>

        <div className="flex items-center gap-2 text-xs">
          <span className="px-2.5 py-1 rounded bg-emerald-950 text-emerald-400 border border-emerald-800 flex items-center gap-1.5 font-bold">
            <CheckCircle2 className="w-3.5 h-3.5" />
            Core Engines Verified
          </span>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-5">
        {/* Quick CLI command banner */}
        <div className="p-4 rounded-xl bg-slate-900/70 border border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <div className="text-xs text-slate-400 font-sans">Automated Zero-Config Installation via Terminal:</div>
            <div className="text-sm font-bold text-cyan-300 mt-1 flex items-center gap-2">
              <Terminal className="w-4 h-4 text-cyan-400" />
              <span>npx rea-agents setup</span>
            </div>
          </div>
          <div className="text-xs text-slate-400 font-sans max-w-sm">
            Automatically detects installed agents, proposes additive config with backup snapshots, and writes MCP records.
          </div>
        </div>

        {/* Engine Diagnostics Table */}
        <div className="space-y-2">
          <h3 className="text-xs font-bold text-slate-200 uppercase tracking-wider flex items-center gap-2">
            <Cpu className="w-3.5 h-3.5 text-cyan-400" />
            <span>Local Engine & Toolchain Diagnostics</span>
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {DOCTOR_CHECKS.map((check) => {
              const isReady = check.status === 'ready' || check.status === 'installed';
              return (
                <div
                  key={check.id}
                  className="p-3.5 rounded-lg bg-slate-900/60 border border-slate-800 flex flex-col justify-between"
                >
                  <div>
                    <div className="flex items-center justify-between mb-1.5">
                      <span className="font-bold text-slate-200 text-xs">{check.name}</span>
                      <span
                        className={`text-[10px] uppercase font-bold px-1.5 py-0.5 rounded border ${
                          isReady
                            ? 'bg-emerald-950 text-emerald-300 border-emerald-800'
                            : 'bg-slate-800 text-slate-400 border-slate-700'
                        }`}
                      >
                        {check.status}
                      </span>
                    </div>

                    <div className="text-[11px] text-slate-400 space-y-0.5">
                      {check.version && <div>Version: <span className="text-slate-200">{check.version}</span></div>}
                      {check.path && <div>Binary: <span className="text-slate-400 truncate">{check.path}</span></div>}
                    </div>
                  </div>

                  <p className="text-[11px] text-slate-400 font-sans mt-2 pt-2 border-t border-slate-800/60">
                    {check.guidance}
                  </p>
                </div>
              );
            })}
          </div>
        </div>

        {/* MCP Agent Client Configurator */}
        <div className="space-y-3 pt-2">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-bold text-slate-200 uppercase tracking-wider flex items-center gap-2">
              <Bot className="w-3.5 h-3.5 text-purple-400" />
              <span>MCP Client Configuration Generator</span>
            </h3>

            {/* Agent Select Pills */}
            <div className="flex items-center gap-1 bg-slate-950 p-1 rounded-lg border border-slate-800 text-xs">
              {(['claude', 'cursor', 'gemini', 'codex'] as const).map(agent => (
                <button
                  key={agent}
                  onClick={() => setSelectedAgent(agent)}
                  className={`px-3 py-1 rounded capitalize transition ${
                    selectedAgent === agent
                      ? 'bg-purple-500/20 text-purple-300 border border-purple-500/30 font-bold'
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  {agent}
                </button>
              ))}
            </div>
          </div>

          <div className="bg-slate-900/60 p-4 rounded-lg border border-slate-800 space-y-2">
            <div className="flex items-center justify-between text-xs">
              <span className="text-slate-400">Target Config File:</span>
              <button
                onClick={handleCopy}
                className="px-2.5 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs flex items-center gap-1.5 transition"
              >
                {copiedConfig ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copiedConfig ? 'Copied' : 'Copy JSON'}</span>
              </button>
            </div>
            <div className="text-[11px] text-cyan-400 bg-slate-950 p-2 rounded border border-slate-800">
              {agentConfigs[selectedAgent].file}
            </div>

            <pre className="p-3 bg-slate-950 rounded border border-slate-800 text-xs text-purple-200 overflow-x-auto leading-relaxed">
              <code>{agentConfigs[selectedAgent].config}</code>
            </pre>
          </div>
        </div>
      </div>
    </div>
  );
};
