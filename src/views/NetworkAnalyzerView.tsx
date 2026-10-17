import React, { useState } from 'react';
import { TargetArtifact } from '../types/rea';
import { 
  Network, 
  AlertTriangle, 
  Clock, 
  ArrowDownRight, 
  ArrowUpRight, 
  Search, 
  Filter, 
  ShieldAlert, 
  CheckCircle,
  Copy
} from 'lucide-react';

interface NetworkAnalyzerViewProps {
  target: TargetArtifact;
}

export const NetworkAnalyzerView: React.FC<NetworkAnalyzerViewProps> = ({ target }) => {
  const [selectedEntryIndex, setSelectedEntryIndex] = useState(0);
  const [filterQuery, setFilterQuery] = useState('');

  const entries = [
    {
      id: 1,
      method: 'POST',
      url: 'https://api.gateway.internal/v2/auth/token',
      status: 200,
      mimeType: 'application/json',
      time: 215,
      size: '1.4 KB',
      requestHeaders: {
        'Content-Type': 'application/json',
        'User-Agent': 'REA-ReverseEngineer-Agent/6.5',
        'Accept': 'application/json'
      },
      responseHeaders: {
        'Server': 'cloudflare',
        'Content-Type': 'application/json; charset=utf-8',
        'Strict-Transport-Security': 'max-age=31536000; includeSubDomains'
      },
      requestBody: '{\n  "client_id": "rea_analyst_01",\n  "grant_type": "client_credentials"\n}',
      responseBody: '{\n  "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",\n  "token_type": "Bearer",\n  "expires_in": 3600\n}',
      issues: []
    },
    {
      id: 2,
      method: 'GET',
      url: 'https://api.gateway.internal/v2/receipt?order_id=ord_99812&auth_token=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.e30.t-ID123',
      status: 200,
      mimeType: 'application/json',
      time: 142,
      size: '3.8 KB',
      requestHeaders: {
        'Accept': 'application/json',
        'Origin': 'https://untrusted-thirdparty.io'
      },
      responseHeaders: {
        'Access-Control-Allow-Origin': '*',
        'Content-Type': 'application/json'
      },
      requestBody: '',
      responseBody: '{\n  "order_id": "ord_99812",\n  "amount_cents": 4900,\n  "currency": "USD",\n  "customer_email": "target_user@enterprise.com",\n  "status": "settled"\n}',
      issues: [
        'CRITICAL: JWT Bearer auth_token leaked in cleartext GET query parameter.',
        'HIGH: Wildcard Access-Control-Allow-Origin (*) returned on endpoint with private customer receipts.'
      ]
    },
    {
      id: 3,
      method: 'POST',
      url: 'https://api.gateway.internal/v2/charge',
      status: 201,
      mimeType: 'application/json',
      time: 412,
      size: '890 B',
      requestHeaders: {
        'Authorization': 'Bearer eyJhbGciOiJIUzI1Ni...',
        'Content-Type': 'application/json'
      },
      responseHeaders: {
        'X-Powered-By': 'Express',
        'Cache-Control': 'no-store'
      },
      requestBody: '{\n  "amount": 4900,\n  "currency": "USD",\n  "card_token": "tok_visa_4242"\n}',
      responseBody: '{\n  "charge_id": "ch_773199",\n  "status": "succeeded"\n}',
      issues: []
    },
    {
      id: 4,
      method: 'GET',
      url: 'https://static.cdn-vault.com/assets/telemetry.js',
      status: 304,
      mimeType: 'application/javascript',
      time: 38,
      size: '0 B',
      requestHeaders: {
        'If-None-Match': '"d891-231a"'
      },
      responseHeaders: {
        'ETag': '"d891-231a"',
        'CF-Cache-Status': 'HIT'
      },
      requestBody: '',
      responseBody: '// [Cache 304 Not Modified]',
      issues: []
    }
  ];

  const filteredEntries = entries.filter(e => 
    e.url.toLowerCase().includes(filterQuery.toLowerCase()) || 
    e.method.toLowerCase().includes(filterQuery.toLowerCase())
  );

  const currentEntry = entries[selectedEntryIndex] || entries[0];

  return (
    <div className="flex-1 flex flex-col bg-slate-950 overflow-hidden">
      {/* Top Banner */}
      <div className="p-3 border-b border-slate-800 bg-slate-900/90 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <Network className="w-4 h-4 text-cyan-400" />
          <h2 className="font-semibold text-sm text-slate-100 font-mono">
            Network & Packet Capture Inspection
          </h2>
          <span className="text-xs text-slate-400 font-mono">[{target.name}]</span>
        </div>

        <div className="flex items-center gap-2 text-xs font-mono">
          <span className="px-2 py-0.5 rounded bg-rose-950 text-rose-300 border border-rose-800 flex items-center gap-1 font-semibold">
            <AlertTriangle className="w-3 h-3 text-rose-400" />
            2 Security Leaks Flagged
          </span>
        </div>
      </div>

      <div className="flex-1 flex overflow-hidden">
        {/* Left: Request Stream List */}
        <div className="w-96 border-r border-slate-800 bg-slate-950/70 flex flex-col shrink-0">
          <div className="p-3 border-b border-slate-800">
            <div className="relative">
              <Search className="w-3.5 h-3.5 text-slate-500 absolute left-2 top-2.5" />
              <input
                type="text"
                placeholder="Filter requests, URLs or methods..."
                value={filterQuery}
                onChange={(e) => setFilterQuery(e.target.value)}
                className="w-full bg-slate-900 border border-slate-800 rounded pl-7 pr-2.5 py-1.5 text-xs text-slate-200 focus:outline-none focus:border-cyan-500 font-mono"
              />
            </div>
          </div>

          <div className="flex-1 overflow-y-auto p-1.5 space-y-1">
            {filteredEntries.map((item, idx) => {
              const isSelected = selectedEntryIndex === idx;
              const hasAlert = item.issues.length > 0;
              return (
                <button
                  key={item.id}
                  onClick={() => setSelectedEntryIndex(idx)}
                  className={`w-full text-left p-2.5 rounded-lg font-mono text-xs transition cursor-pointer ${
                    isSelected
                      ? 'bg-cyan-500/15 text-cyan-300 border border-cyan-500/30'
                      : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900 border border-transparent'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className={`px-1.5 py-0.5 rounded text-[10px] font-bold ${
                      item.method === 'POST' ? 'bg-purple-950 text-purple-300 border border-purple-800' :
                      item.method === 'GET' ? 'bg-blue-950 text-blue-300 border border-blue-800' :
                      'bg-slate-800 text-slate-300'
                    }`}>
                      {item.method}
                    </span>
                    <span className="text-[10px] text-slate-500 flex items-center gap-1">
                      <Clock className="w-3 h-3" /> {item.time}ms
                    </span>
                  </div>

                  <div className="text-slate-200 truncate font-medium text-[11px]" title={item.url}>
                    {item.url}
                  </div>

                  <div className="flex items-center justify-between mt-1 text-[10px] text-slate-500">
                    <span className={item.status < 300 ? 'text-emerald-400 font-bold' : 'text-amber-400'}>
                      Status {item.status}
                    </span>
                    <span>{item.size}</span>
                  </div>

                  {hasAlert && (
                    <div className="mt-1.5 text-[10px] text-rose-400 flex items-center gap-1 font-semibold">
                      <ShieldAlert className="w-3 h-3" />
                      <span>Security Leak Detected</span>
                    </div>
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* Right: Selected Request Details & Security Drawer */}
        <div className="flex-1 flex flex-col min-w-0 overflow-y-auto p-4 space-y-4">
          {/* Security Findings Alert Banner */}
          {currentEntry.issues.length > 0 && (
            <div className="p-3.5 bg-rose-950/40 border border-rose-800/80 rounded-lg text-rose-300 font-mono text-xs space-y-1.5">
              <div className="flex items-center gap-2 font-bold text-rose-200">
                <AlertTriangle className="w-4 h-4 text-rose-400" />
                <span>REA Automated Security & Privacy Audit Findings</span>
              </div>
              {currentEntry.issues.map((issue, idx) => (
                <div key={idx} className="text-[11px] leading-relaxed pl-6">
                  • {issue}
                </div>
              ))}
            </div>
          )}

          {/* URL & Flow Summary */}
          <div className="bg-slate-900/60 p-4 rounded-lg border border-slate-800 font-mono text-xs">
            <div className="flex items-center justify-between mb-2">
              <span className="text-slate-400">Request Flow</span>
              <span className="text-cyan-400 font-bold">{currentEntry.mimeType}</span>
            </div>
            <div className="p-2.5 rounded bg-slate-950 border border-slate-800 text-slate-200 break-all select-all">
              {currentEntry.url}
            </div>
          </div>

          {/* Request Headers & Response Headers Side-by-Side */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-slate-900/60 p-4 rounded-lg border border-slate-800 font-mono text-xs">
              <div className="flex items-center gap-2 font-semibold text-slate-200 mb-2">
                <ArrowUpRight className="w-4 h-4 text-cyan-400" />
                <span>Request Headers</span>
              </div>
              <div className="space-y-1.5">
                {Object.entries(currentEntry.requestHeaders).map(([k, v]) => (
                  <div key={k} className="text-[11px] flex flex-col">
                    <span className="text-slate-400 font-semibold">{k}:</span>
                    <span className="text-slate-200 pl-2 truncate">{v}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-slate-900/60 p-4 rounded-lg border border-slate-800 font-mono text-xs">
              <div className="flex items-center gap-2 font-semibold text-slate-200 mb-2">
                <ArrowDownRight className="w-4 h-4 text-emerald-400" />
                <span>Response Headers</span>
              </div>
              <div className="space-y-1.5">
                {Object.entries(currentEntry.responseHeaders).map(([k, v]) => (
                  <div key={k} className="text-[11px] flex flex-col">
                    <span className="text-slate-400 font-semibold">{k}:</span>
                    <span className="text-slate-200 pl-2 truncate">{v}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Request Body & Response Payload */}
          {currentEntry.requestBody && (
            <div className="bg-slate-900/60 p-4 rounded-lg border border-slate-800 font-mono text-xs">
              <div className="text-slate-300 font-semibold mb-2">Request Body Payload</div>
              <pre className="p-3 bg-slate-950 rounded border border-slate-800 text-slate-200 overflow-x-auto text-[11px]">
                <code>{currentEntry.requestBody}</code>
              </pre>
            </div>
          )}

          <div className="bg-slate-900/60 p-4 rounded-lg border border-slate-800 font-mono text-xs">
            <div className="text-slate-300 font-semibold mb-2">Response Payload</div>
            <pre className="p-3 bg-slate-950 rounded border border-slate-800 text-slate-200 overflow-x-auto text-[11px]">
              <code>{currentEntry.responseBody}</code>
            </pre>
          </div>
        </div>
      </div>
    </div>
  );
};
