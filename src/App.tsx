import React, { useState } from 'react';
import { TargetArtifact, EvidenceItem } from './types/rea';
import { MOCK_TARGETS } from './data/mockTargets';
import { Navbar } from './components/Navbar';
import { Sidebar, ViewType } from './components/Sidebar';
import { DecompilerView } from './views/DecompilerView';
import { BinaryStructureView } from './views/BinaryStructureView';
import { JavaScriptElectronView } from './views/JavaScriptElectronView';
import { NetworkAnalyzerView } from './views/NetworkAnalyzerView';
import { EvidenceLedgerView } from './views/EvidenceLedgerView';
import { ShowcasesView } from './views/ShowcasesView';
import { McpTerminalView } from './views/McpTerminalView';
import { DoctorView } from './views/DoctorView';
import { UploadModal } from './components/UploadModal';
import { Check, Download, AlertCircle } from 'lucide-react';

export const App: React.FC = () => {
  const [targets, setTargets] = useState<TargetArtifact[]>(MOCK_TARGETS);
  const [activeTarget, setActiveTarget] = useState<TargetArtifact>(MOCK_TARGETS[0]);
  const [activeView, setActiveView] = useState<ViewType>('decompiler');
  const [uploadModalOpen, setUploadModalOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  const handleSelectTarget = (target: TargetArtifact) => {
    setActiveTarget(target);
    // Switch to target's best initial view
    if (target.kind === 'javascript_electron') {
      setActiveView('electron');
    } else if (target.kind === 'network_capture') {
      setActiveView('network');
    } else {
      setActiveView('decompiler');
    }
    showToast(`Loaded ${target.name} into REA session.`);
  };

  const handleTargetLoaded = (newTarget: TargetArtifact) => {
    setTargets([newTarget, ...targets]);
    setActiveTarget(newTarget);
    setActiveView('decompiler');
    showToast(`Parsed and loaded ${newTarget.name}`);
  };

  const handleAddEvidence = (item: EvidenceItem) => {
    const updated = {
      ...activeTarget,
      evidence: [item, ...activeTarget.evidence]
    };
    setActiveTarget(updated);
    setTargets(targets.map(t => t.id === updated.id ? updated : t));
    showToast('Evidence fact added to ledger.');
  };

  const handleExportEvidence = () => {
    const bundle = {
      target: {
        name: activeTarget.name,
        sha256: activeTarget.sha256,
        format: activeTarget.format,
        architecture: activeTarget.architecture,
        entryPoint: activeTarget.entryPoint
      },
      exportTimestamp: new Date().toISOString(),
      generator: 'REA v6.5.0 MCP Evidence Ledger',
      factsCount: activeTarget.evidence.length,
      evidence: activeTarget.evidence
    };

    const blob = new Blob([JSON.stringify(bundle, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `rea-evidence-${activeTarget.id}.json`;
    a.click();
    URL.revokeObjectURL(url);
    showToast('Evidence bundle exported as JSON.');
  };

  return (
    <div className="flex flex-col h-screen w-screen overflow-hidden bg-slate-950 text-slate-100 font-sans">
      {/* Top Navbar */}
      <Navbar
        targets={targets}
        activeTarget={activeTarget}
        onSelectTarget={handleSelectTarget}
        onOpenUpload={() => setUploadModalOpen(true)}
        onOpenTerminal={() => setActiveView('terminal')}
        onExportReport={handleExportEvidence}
        activeView={activeView}
      />

      {/* Main Workbench Body */}
      <div className="flex-1 flex overflow-hidden">
        {/* Left Workbench Sidebar */}
        <Sidebar
          activeView={activeView}
          onSelectView={setActiveView}
          activeTarget={activeTarget}
        />

        {/* Center/Right Dynamic View */}
        <main className="flex-1 flex flex-col min-w-0 overflow-hidden relative">
          {activeView === 'decompiler' && (
            <DecompilerView target={activeTarget} />
          )}
          {activeView === 'structure' && (
            <BinaryStructureView target={activeTarget} />
          )}
          {activeView === 'electron' && (
            <JavaScriptElectronView target={activeTarget} />
          )}
          {activeView === 'network' && (
            <NetworkAnalyzerView target={activeTarget} />
          )}
          {activeView === 'evidence' && (
            <EvidenceLedgerView
              target={activeTarget}
              onAddEvidence={handleAddEvidence}
              onExportEvidence={handleExportEvidence}
            />
          )}
          {activeView === 'showcases' && (
            <ShowcasesView />
          )}
          {activeView === 'terminal' && (
            <McpTerminalView target={activeTarget} />
          )}
          {activeView === 'doctor' && (
            <DoctorView />
          )}
        </main>
      </div>

      {/* Target Upload Modal */}
      <UploadModal
        isOpen={uploadModalOpen}
        onClose={() => setUploadModalOpen(false)}
        onTargetLoaded={handleTargetLoaded}
      />

      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-4 right-4 z-50 bg-slate-900 border border-cyan-500/50 text-cyan-200 px-4 py-2.5 rounded-lg shadow-xl font-mono text-xs flex items-center gap-2 animate-bounce">
          <Check className="w-4 h-4 text-cyan-400" />
          <span>{toastMessage}</span>
        </div>
      )}
    </div>
  );
};
