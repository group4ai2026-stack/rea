import React, { useState } from 'react';
import { TargetArtifact } from '../types/rea';
import { 
  FileCode, 
  FolderTree, 
  Radio, 
  ShieldCheck, 
  ShieldAlert, 
  Layers, 
  File, 
  Folder, 
  Copy, 
  Check,
  Zap,
  Cpu
} from 'lucide-react';

interface JavaScriptElectronViewProps {
  target: TargetArtifact;
}

export const JavaScriptElectronView: React.FC<JavaScriptElectronViewProps> = ({ target }) => {
  const [selectedFile, setSelectedFile] = useState('dist/preload/index.js');
  const [copied, setCopied] = useState(false);

  // ASAR file tree mock
  const fileTree = [
    { path: 'package.json', type: 'file', size: '1.2 KB' },
    { path: 'dist/main/main.js', type: 'file', size: '420 KB' },
    { path: 'dist/main/clipboardHandler.js', type: 'file', size: '18 KB' },
    { path: 'dist/preload/index.js', type: 'file', size: '45 KB' },
    { path: 'dist/renderer/index.html', type: 'file', size: '3.4 KB' },
    { path: 'dist/renderer/bundle.js', type: 'file', size: '890 KB' },
    { path: 'dist/renderer/bundle.js.map', type: 'file', size: '2.1 MB' },
    { path: 'node_modules/electron-updater/package.json', type: 'file', size: '2.4 KB' }
  ];

  const fileContents: Record<string, string> = {
    'package.json': `{
  "name": "desktop-client",
  "version": "2.40.1",
  "main": "dist/main/main.js",
  "description": "Desktop Application Client",
  "dependencies": {
    "electron-updater": "^6.1.4",
    "ws": "^8.16.0"
  }
}`,
    'dist/main/main.js': `// REA Decompiled Main Process
const { app, BrowserWindow, ipcMain } = require('electron');
const path = require('path');
const { setupClipboardIpc } = require('./clipboardHandler');

let mainWindow = null;

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1200,
    height: 800,
    webPreferences: {
      preload: path.join(__dirname, '../preload/index.js'),
      contextIsolation: true,  // Mitigation verified
      nodeIntegration: false,   // Mitigation verified
      sandbox: true
    }
  });

  mainWindow.loadFile(path.join(__dirname, '../renderer/index.html'));
}

app.whenReady().then(() => {
  setupClipboardIpc();
  createWindow();
});`,
    'dist/preload/index.js': `// REA Decompiled Preload Script
const { contextBridge, ipcRenderer } = require('electron');

// Expose safe, validated API to renderer context
contextBridge.exposeInMainWorld('notionClipboard', {
  writeRichClipboard: (payload) => {
    // Validate schema before dispatching over IPC
    if (!payload || typeof payload !== 'object') {
      throw new Error('Invalid clipboard payload');
    }
    return ipcRenderer.invoke('notion:write-rich-clipboard', payload);
  },
  
  readRichClipboard: () => {
    return ipcRenderer.invoke('notion:read-rich-clipboard');
  }
});`,
    'dist/main/clipboardHandler.js': `// REA Decompiled Clipboard Native Dispatcher
const { ipcMain, clipboard } = require('electron');

function setupClipboardIpc() {
  ipcMain.handle('notion:write-rich-clipboard', async (event, payload) => {
    const { html, text, rtf, metadata } = payload;
    
    // Write standard clipboard representations
    clipboard.write({
      text: text || '',
      html: html || '',
      rtf: rtf || undefined
    });

    // Write proprietary serialized block buffer
    if (metadata) {
      const buffer = Buffer.from(JSON.stringify(metadata), 'utf-8');
      clipboard.writeBuffer('application/x-notion-blocks', buffer);
    }

    return { success: true };
  });

  ipcMain.handle('notion:read-rich-clipboard', async () => {
    const hasCustom = clipboard.has('application/x-notion-blocks');
    let blocks = null;
    if (hasCustom) {
      const raw = clipboard.readBuffer('application/x-notion-blocks');
      blocks = JSON.parse(raw.toString('utf-8'));
    }
    return {
      text: clipboard.readText(),
      html: clipboard.readHTML(),
      blocks
    };
  });
}

module.exports = { setupClipboardIpc };`,
    'dist/renderer/index.html': `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>Desktop Application Client</title>
</head>
<body>
  <div id="app"></div>
  <script src="bundle.js"></script>
</body>
</html>`
  };

  const ipcChannels = [
    {
      channel: 'notion:write-rich-clipboard',
      direction: 'Renderer -> Preload -> Main',
      invoker: 'ipcRenderer.invoke',
      handler: 'ipcMain.handle',
      payload: '{ html: string, text: string, metadata: object }',
      security: 'Validated in Preload'
    },
    {
      channel: 'notion:read-rich-clipboard',
      direction: 'Renderer -> Preload -> Main',
      invoker: 'ipcRenderer.invoke',
      handler: 'ipcMain.handle',
      payload: 'void -> { text, html, blocks }',
      security: 'Safe'
    },
    {
      channel: 'notion:window-minimize',
      direction: 'Renderer -> Preload -> Main',
      invoker: 'ipcRenderer.send',
      handler: 'ipcMain.on',
      payload: 'void',
      security: 'Window Control'
    },
    {
      channel: 'notion:open-external-url',
      direction: 'Renderer -> Preload -> Main',
      invoker: 'ipcRenderer.invoke',
      handler: 'ipcMain.handle',
      payload: '{ url: string }',
      security: 'Protocols Checked (http/https only)'
    }
  ];

  const fuses = [
    { fuse: 'RunAsNode', state: 'Disabled (0)', desc: 'Prevents ELECTRON_RUN_AS_NODE override exploit', safe: true },
    { fuse: 'EnableCookieEncryption', state: 'Enabled (1)', desc: 'OS keychain cookie store encryption', safe: true },
    { fuse: 'NodeCliInspect', state: 'Disabled (0)', desc: 'Blocks --inspect remote debugger attachment', safe: true },
    { fuse: 'OnlyLoadAppFromAsar', state: 'Enabled (1)', desc: 'Prevents running loose external files', safe: true }
  ];

  const handleCopy = () => {
    navigator.clipboard.writeText(fileContents[selectedFile] || '');
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="flex-1 flex flex-col bg-slate-950 overflow-hidden">
      {/* Top Banner */}
      <div className="p-3 border-b border-slate-800 bg-slate-900/90 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <FileCode className="w-4 h-4 text-cyan-400" />
          <h2 className="font-semibold text-sm text-slate-100 font-mono">
            JavaScript & Electron Application Graph
          </h2>
          <span className="text-xs text-slate-400 font-mono">
            [ASAR Archive: {target.name}]
          </span>
        </div>

        <div className="flex items-center gap-3 text-xs font-mono">
          <div className="px-2 py-0.5 rounded bg-cyan-950 text-cyan-400 border border-cyan-800">
            Source Maps: <span className="font-bold">Available (V8)</span>
          </div>
          <div className="px-2 py-0.5 rounded bg-emerald-950 text-emerald-400 border border-emerald-800">
            Context Bridge: <span className="font-bold">Active</span>
          </div>
        </div>
      </div>

      <div className="flex-1 flex overflow-hidden">
        {/* Left: ASAR Archive Filesystem Explorer */}
        <div className="w-72 border-r border-slate-800 bg-slate-950/70 flex flex-col shrink-0">
          <div className="p-3 border-b border-slate-800 text-[10px] uppercase font-mono font-semibold text-slate-400 flex items-center gap-2">
            <FolderTree className="w-3.5 h-3.5 text-cyan-400" />
            <span>ASAR Filesystem ({fileTree.length} entries)</span>
          </div>

          <div className="flex-1 overflow-y-auto p-2 space-y-1">
            {fileTree.map((item) => {
              const isSelected = selectedFile === item.path;
              return (
                <button
                  key={item.path}
                  onClick={() => setSelectedFile(item.path)}
                  className={`w-full text-left px-2.5 py-1.5 rounded font-mono text-xs transition flex items-center justify-between cursor-pointer ${
                    isSelected
                      ? 'bg-cyan-500/15 text-cyan-300 border border-cyan-500/30'
                      : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900 border border-transparent'
                  }`}
                >
                  <div className="flex items-center gap-2 truncate min-w-0">
                    <File className={`w-3.5 h-3.5 shrink-0 ${isSelected ? 'text-cyan-400' : 'text-slate-500'}`} />
                    <span className="truncate">{item.path}</span>
                  </div>
                  <span className="text-[10px] text-slate-500 shrink-0 ml-1">{item.size}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Right: File Viewer & IPC Matrix */}
        <div className="flex-1 flex flex-col min-w-0 overflow-y-auto p-4 space-y-4">
          {/* File Editor Preview */}
          <div className="bg-slate-900/60 rounded-lg border border-slate-800 overflow-hidden">
            <div className="p-2.5 border-b border-slate-800 bg-slate-900 flex items-center justify-between">
              <div className="flex items-center gap-2 font-mono text-xs text-slate-200">
                <File className="w-3.5 h-3.5 text-cyan-400" />
                <span>{selectedFile}</span>
              </div>
              <button
                onClick={handleCopy}
                className="p-1.5 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 text-xs flex items-center gap-1 font-mono transition"
              >
                {copied ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                <span>{copied ? 'Copied' : 'Copy'}</span>
              </button>
            </div>

            <pre className="p-4 font-mono text-xs text-slate-200 leading-relaxed overflow-x-auto max-h-72 bg-slate-950/80">
              <code>{fileContents[selectedFile] || '// File contents indexed in binary bundle.'}</code>
            </pre>
          </div>

          {/* Electron IPC Matrix */}
          <div className="bg-slate-900/60 rounded-lg border border-slate-800 p-4">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <Radio className="w-4 h-4 text-cyan-400" />
                <h3 className="font-mono text-xs font-semibold text-slate-100">
                  Electron Inter-Process Communication (IPC) Channels
                </h3>
              </div>
              <span className="text-[11px] font-mono text-slate-400">{ipcChannels.length} Registered Channels</span>
            </div>

            <div className="border border-slate-800 rounded-lg overflow-hidden">
              <table className="w-full text-left font-mono text-xs border-collapse">
                <thead>
                  <tr className="bg-slate-900 text-slate-400 border-b border-slate-800 text-[11px]">
                    <th className="p-2.5">Channel Name</th>
                    <th className="p-2.5">Trajectory</th>
                    <th className="p-2.5">API Invoker</th>
                    <th className="p-2.5">Payload Type</th>
                    <th className="p-2.5">Security Gate</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800">
                  {ipcChannels.map((c, idx) => (
                    <tr key={idx} className="hover:bg-slate-800/40 transition">
                      <td className="p-2.5 font-bold text-cyan-300">{c.channel}</td>
                      <td className="p-2.5 text-slate-300 text-[11px]">{c.direction}</td>
                      <td className="p-2.5 text-purple-400">{c.invoker}</td>
                      <td className="p-2.5 text-amber-300/90 text-[11px]">{c.payload}</td>
                      <td className="p-2.5">
                        <span className="px-2 py-0.5 rounded text-[10px] bg-emerald-950 text-emerald-400 border border-emerald-800">
                          {c.security}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Electron Fuses Hardening Audit */}
          <div className="bg-slate-900/60 rounded-lg border border-slate-800 p-4">
            <div className="flex items-center gap-2 mb-3">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              <h3 className="font-mono text-xs font-semibold text-slate-100">
                Electron Fuses Static Audit (Header Inspection)
              </h3>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {fuses.map((fuse, idx) => (
                <div key={idx} className="p-3 rounded-lg bg-slate-950 border border-slate-800 font-mono text-xs flex flex-col justify-between">
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-semibold text-slate-200">{fuse.fuse}</span>
                    <span className="text-[10px] px-1.5 py-0.5 rounded bg-emerald-950 text-emerald-300 border border-emerald-800 font-bold">
                      {fuse.state}
                    </span>
                  </div>
                  <div className="text-[11px] text-slate-400 mt-1 font-sans">{fuse.desc}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
