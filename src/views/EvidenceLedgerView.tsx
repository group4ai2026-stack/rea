import React, { useState } from 'react';
import { TargetArtifact, EvidenceItem, EvidenceCategory } from '../types/rea';
import { 
  ScrollText, 
  CheckCircle2, 
  Calculator, 
  Lightbulb, 
  HelpCircle, 
  Filter, 
  Search, 
  Plus, 
  Download, 
  ShieldCheck, 
  Tag, 
  Clock, 
  Cpu
} from 'lucide-react';

interface EvidenceLedgerViewProps {
  target: TargetArtifact;
  onAddEvidence: (item: EvidenceItem) => void;
  onExportEvidence: () => void;
}

export const EvidenceLedgerView: React.FC<EvidenceLedgerViewProps> = ({
  target,
  onAddEvidence,
  onExportEvidence,
}) => {
  const [selectedCategory, setSelectedCategory] = useState<'all' | EvidenceCategory>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [minConfidence, setMinConfidence] = useState(0);
  const [showAddModal, setShowAddModal] = useState(false);

  // New Evidence Form State
  const [newSummary, setNewSummary] = useState('');
  const [newDetails, setNewDetails] = useState('');
  const [newCategory, setNewCategory] = useState<EvidenceCategory>('observation');
  const [newConfidence, setNewConfidence] = useState(0.95);
  const [newOffset, setNewOffset] = useState('0x00401000');
  const [newEngine, setNewEngine] = useState<EvidenceItem['sourceEngine']>('rea_static');

  const evidenceList = target.evidence;

  const filteredEvidence = evidenceList.filter((item) => {
    const matchesCat = selectedCategory === 'all' || item.category === selectedCategory;
    const matchesQuery = item.summary.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         item.details.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         (item.sourceOffset && item.sourceOffset.toLowerCase().includes(searchQuery.toLowerCase()));
    const matchesConf = item.confidence >= minConfidence;
    return matchesCat && matchesQuery && matchesConf;
  });

  const getCategoryMeta = (cat: EvidenceCategory) => {
    switch (cat) {
      case 'observation':
        return {
          label: 'Observation',
          icon: CheckCircle2,
          color: 'text-emerald-400',
          bg: 'bg-emerald-950/40 border-emerald-800/60',
          badge: 'bg-emerald-950 text-emerald-300 border-emerald-700',
          desc: 'Direct, immutable byte facts, strings, headers, and exported symbols'
        };
      case 'derivation':
        return {
          label: 'Derivation',
          icon: Calculator,
          color: 'text-cyan-400',
          bg: 'bg-cyan-950/40 border-cyan-800/60',
          badge: 'bg-cyan-950 text-cyan-300 border-cyan-700',
          desc: 'Algorithmic calculations, mathematical transformations, and trace results'
        };
      case 'inference':
        return {
          label: 'Inference',
          icon: Lightbulb,
          color: 'text-amber-400',
          bg: 'bg-amber-950/40 border-amber-800/60',
          badge: 'bg-amber-950 text-amber-300 border-amber-700',
          desc: 'Heuristic patterns, decompiler type approximations, probable libraries'
        };
      case 'unknown':
        return {
          label: 'Unknown',
          icon: HelpCircle,
          color: 'text-purple-400',
          bg: 'bg-purple-950/40 border-purple-800/60',
          badge: 'bg-purple-950 text-purple-300 border-purple-700',
          desc: 'Explicitly unresolved gaps, indirect branch targets, missing symbols'
        };
    }
  };

  const handleCreateEvidence = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newSummary.trim()) return;

    const item: EvidenceItem = {
      id: `ev-manual-${Date.now()}`,
      category: newCategory,
      summary: newSummary,
      details: newDetails,
      confidence: Number(newConfidence),
      sourceOffset: newOffset,
      sourceEngine: newEngine,
      timestamp: new Date().toLocaleTimeString()
    };

    onAddEvidence(item);
    setShowAddModal(false);
    setNewSummary('');
    setNewDetails('');
  };

  return (
    <div className="flex-1 flex flex-col bg-slate-950 overflow-hidden">
      {/* Header Banner */}
      <div className="p-3 border-b border-slate-800 bg-slate-900/90 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <ScrollText className="w-4 h-4 text-cyan-400" />
          <h2 className="font-semibold text-sm text-slate-100 font-mono">
            REA Evidence Ledger & Provenance Authority
          </h2>
          <span className="text-xs text-slate-400 font-mono">
            [{evidenceList.length} recorded items]
          </span>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowAddModal(true)}
            className="flex items-center gap-1.5 px-2.5 py-1.5 rounded bg-cyan-600 hover:bg-cyan-500 text-slate-950 font-mono text-xs font-semibold transition"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Add Fact / Note</span>
          </button>

          <button
            onClick={onExportEvidence}
            className="flex items-center gap-1.5 px-2.5 py-1.5 rounded bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 font-mono text-xs transition"
          >
            <Download className="w-3.5 h-3.5 text-emerald-400" />
            <span>Export Bundle</span>
          </button>
        </div>
      </div>

      {/* Epistemological Categories Explanation Bar */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-2 p-3 bg-slate-900/40 border-b border-slate-800 text-xs font-mono">
        {(['observation', 'derivation', 'inference', 'unknown'] as EvidenceCategory[]).map(cat => {
          const meta = getCategoryMeta(cat);
          const Icon = meta.icon;
          const count = evidenceList.filter(e => e.category === cat).length;
          const isSelected = selectedCategory === cat;

          return (
            <button
              key={cat}
              onClick={() => setSelectedCategory(isSelected ? 'all' : cat)}
              className={`p-2.5 rounded-lg border text-left transition cursor-pointer ${
                isSelected ? meta.bg : 'bg-slate-950/60 border-slate-800 hover:bg-slate-900'
              }`}
            >
              <div className="flex items-center justify-between mb-1">
                <span className={`flex items-center gap-1.5 font-bold ${meta.color}`}>
                  <Icon className="w-3.5 h-3.5" />
                  <span>{meta.label}</span>
                </span>
                <span className="px-1.5 py-0.2 rounded text-[10px] bg-slate-800 text-slate-300 font-bold">
                  {count}
                </span>
              </div>
              <p className="text-[10px] text-slate-400 font-sans line-clamp-1">{meta.desc}</p>
            </button>
          );
        })}
      </div>

      {/* Filter and Search Bar */}
      <div className="p-3 border-b border-slate-800 bg-slate-950/60 flex flex-wrap items-center justify-between gap-3">
        <div className="relative flex-1 max-w-md">
          <Search className="w-3.5 h-3.5 text-slate-500 absolute left-2 top-2.5" />
          <input
            type="text"
            placeholder="Search evidence summaries, offsets, or details..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-slate-900 border border-slate-800 rounded pl-7 pr-2.5 py-1 text-xs text-slate-200 focus:outline-none focus:border-cyan-500 font-mono"
          />
        </div>

        <div className="flex items-center gap-3 text-xs font-mono text-slate-400">
          <span>Min Confidence:</span>
          <input
            type="range"
            min="0"
            max="1"
            step="0.05"
            value={minConfidence}
            onChange={(e) => setMinConfidence(parseFloat(e.target.value))}
            className="w-24 accent-cyan-400"
          />
          <span className="text-cyan-400 font-semibold w-10 text-right">
            {(minConfidence * 100).toFixed(0)}%
          </span>
        </div>
      </div>

      {/* Evidence Items List */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        {filteredEvidence.length === 0 ? (
          <div className="p-12 text-center text-slate-500 font-mono text-xs">
            No evidence items match the selected category and confidence thresholds.
          </div>
        ) : (
          filteredEvidence.map((item) => {
            const meta = getCategoryMeta(item.category);
            const Icon = meta.icon;

            return (
              <div
                key={item.id}
                className="p-4 rounded-lg bg-slate-900/60 border border-slate-800 hover:border-slate-700/80 transition flex flex-col gap-2 font-mono"
              >
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <span className={`px-2 py-0.5 rounded text-[10px] uppercase font-bold border flex items-center gap-1 ${meta.badge}`}>
                      <Icon className="w-3 h-3" />
                      <span>{meta.label}</span>
                    </span>
                    <h3 className="text-xs font-semibold text-slate-100 font-sans">
                      {item.summary}
                    </h3>
                  </div>

                  <div className="flex items-center gap-3 text-[11px] text-slate-400">
                    {item.sourceOffset && (
                      <span className="text-cyan-400 bg-slate-950 px-2 py-0.5 rounded border border-slate-800">
                        {item.sourceOffset}
                      </span>
                    )}
                    <span className="text-slate-400 flex items-center gap-1">
                      <Cpu className="w-3 h-3 text-slate-500" /> {item.sourceEngine}
                    </span>
                    <span className="flex items-center gap-1 text-slate-500">
                      <Clock className="w-3 h-3" /> {item.timestamp}
                    </span>
                  </div>
                </div>

                <p className="text-xs text-slate-300 font-sans leading-relaxed">
                  {item.details}
                </p>

                {/* Confidence meter & metadata footer */}
                <div className="flex items-center justify-between pt-2 border-t border-slate-800/60 text-[11px] text-slate-400">
                  <div className="flex items-center gap-2">
                    <span>Evidence Confidence:</span>
                    <div className="w-24 bg-slate-800 h-1.5 rounded-full overflow-hidden">
                      <div
                        className={`h-full ${
                          item.confidence >= 0.9 ? 'bg-emerald-400' :
                          item.confidence >= 0.7 ? 'bg-cyan-400' :
                          item.confidence >= 0.5 ? 'bg-amber-400' : 'bg-purple-400'
                        }`}
                        style={{ width: `${item.confidence * 100}%` }}
                      />
                    </div>
                    <span className="font-semibold text-slate-200">
                      {(item.confidence * 100).toFixed(0)}%
                    </span>
                  </div>

                  {item.targetSymbol && (
                    <div className="text-slate-400">
                      Target Symbol: <span className="text-purple-300">{item.targetSymbol}</span>
                    </div>
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Add Evidence Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <form
            onSubmit={handleCreateEvidence}
            className="bg-slate-900 border border-slate-700 rounded-xl max-w-md w-full p-5 space-y-4 shadow-2xl font-mono text-xs"
          >
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <span className="font-bold text-slate-100 text-sm">Add Evidence to Ledger</span>
              <button
                type="button"
                onClick={() => setShowAddModal(false)}
                className="text-slate-400 hover:text-slate-200"
              >
                ✕
              </button>
            </div>

            <div>
              <label className="block text-slate-400 mb-1">Category:</label>
              <select
                value={newCategory}
                onChange={(e) => setNewCategory(e.target.value as EvidenceCategory)}
                className="w-full bg-slate-950 border border-slate-800 rounded p-2 text-slate-200 focus:outline-none focus:border-cyan-500"
              >
                <option value="observation">Observation (Factual raw bytes/symbols)</option>
                <option value="derivation">Derivation (Algorithmic / calculated result)</option>
                <option value="inference">Inference (Heuristic guess / decompiler assumption)</option>
                <option value="unknown">Unknown (Explicitly unverified gap / limitation)</option>
              </select>
            </div>

            <div>
              <label className="block text-slate-400 mb-1">Summary (Short fact statement):</label>
              <input
                type="text"
                required
                value={newSummary}
                onChange={(e) => setNewSummary(e.target.value)}
                placeholder="e.g., Hardcoded AES initialization vector found at 0x00402010"
                className="w-full bg-slate-950 border border-slate-800 rounded p-2 text-slate-200 focus:outline-none focus:border-cyan-500"
              />
            </div>

            <div>
              <label className="block text-slate-400 mb-1">Detailed Findings & Provenance:</label>
              <textarea
                rows={3}
                value={newDetails}
                onChange={(e) => setNewDetails(e.target.value)}
                placeholder="Explain the instructions, byte sequence, and limitations..."
                className="w-full bg-slate-950 border border-slate-800 rounded p-2 text-slate-200 focus:outline-none focus:border-cyan-500 font-sans"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-slate-400 mb-1">Source Offset / Addr:</label>
                <input
                  type="text"
                  value={newOffset}
                  onChange={(e) => setNewOffset(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded p-2 text-slate-200 focus:outline-none focus:border-cyan-500"
                />
              </div>

              <div>
                <label className="block text-slate-400 mb-1">Engine / Bridge:</label>
                <select
                  value={newEngine}
                  onChange={(e) => setNewEngine(e.target.value as any)}
                  className="w-full bg-slate-950 border border-slate-800 rounded p-2 text-slate-200 focus:outline-none focus:border-cyan-500"
                >
                  <option value="rea_static">rea_static</option>
                  <option value="ghidra">ghidra</option>
                  <option value="hopper">hopper</option>
                  <option value="ida">ida</option>
                  <option value="jadx">jadx</option>
                  <option value="wabt">wabt</option>
                </select>
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-3 border-t border-slate-800">
              <button
                type="button"
                onClick={() => setShowAddModal(false)}
                className="px-3 py-1.5 rounded bg-slate-800 text-slate-300"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-1.5 rounded bg-cyan-600 hover:bg-cyan-500 text-slate-950 font-bold"
              >
                Save Evidence
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};
