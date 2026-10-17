import { McpToolDefinition } from '../types/rea';

export const MCP_TOOLS: McpToolDefinition[] = [
  {
    name: 'rea_analyze_binary',
    description: 'Inspects a native executable (ELF, PE, Mach-O) and returns pseudocode, disassembly, symbols, strings, and cross-references.',
    category: 'Native Analysis',
    parameters: {
      type: 'object',
      properties: {
        filePath: { type: 'string', description: 'Absolute path to target binary executable' },
        engine: { type: 'string', enum: ['ghidra', 'hopper', 'ida', 'auto'], default: 'auto' },
        focusSymbol: { type: 'string', description: 'Optional specific symbol or address to decompile' }
      },
      required: ['filePath']
    }
  },
  {
    name: 'rea_inspect_javascript_application',
    description: 'Analyzes unpacked Electron or Node.js directory / ASAR archive. Returns module graph, IPC channels, and security fuses.',
    category: 'JavaScript & Electron',
    parameters: {
      type: 'object',
      properties: {
        targetPath: { type: 'string', description: 'Path to app folder or .asar archive' },
        extractSourceMaps: { type: 'boolean', default: true },
        scanIpcBridges: { type: 'boolean', default: true }
      },
      required: ['targetPath']
    }
  },
  {
    name: 'rea_inspect_wasm_artifact',
    description: 'Parses a WebAssembly binary (.wasm), validates section headers, extracts export/import signatures, and decompiles to WAT.',
    category: 'WebAssembly',
    parameters: {
      type: 'object',
      properties: {
        wasmPath: { type: 'string', description: 'Path to .wasm file' },
        disassembleToWat: { type: 'boolean', default: true }
      },
      required: ['wasmPath']
    }
  },
  {
    name: 'rea_inspect_evm_bytecode',
    description: 'Disassembles raw EVM bytecode, identifies function dispatch selectors, resolves signatures via 4byte catalog, and infers state mutability.',
    category: 'Smart Contracts',
    parameters: {
      type: 'object',
      properties: {
        bytecodeHex: { type: 'string', description: 'Hex-encoded EVM runtime bytecode' },
        resolveSelectors: { type: 'boolean', default: true }
      },
      required: ['bytecodeHex']
    }
  },
  {
    name: 'rea_inspect_sqlite_database',
    description: 'Inspects SQLite schema, triggers, views, page statistics, and executes safe read-only queries against ordinary tables.',
    category: 'Storage',
    parameters: {
      type: 'object',
      properties: {
        dbPath: { type: 'string', description: 'Path to SQLite .db or .sqlite file' },
        sqlQuery: { type: 'string', description: 'Optional read-only SQL query to execute' }
      },
      required: ['dbPath']
    }
  },
  {
    name: 'rea_inspect_network_capture',
    description: 'Parses HAR, SAZ, or PCAP network captures. Analyzes request/response streams, headers, payloads, and highlights security leakages.',
    category: 'Network & PCAP',
    parameters: {
      type: 'object',
      properties: {
        capturePath: { type: 'string', description: 'Path to .har, .saz, or .pcap file' },
        filterDomain: { type: 'string', description: 'Optional domain filter' }
      },
      required: ['capturePath']
    }
  },
  {
    name: 'rea_get_evidence_ledger',
    description: 'Retrieves all recorded observations, derivations, inferences, and explicit unknowns with provenance and confidence scores.',
    category: 'Evidence & Provenance',
    parameters: {
      type: 'object',
      properties: {
        category: { type: 'string', enum: ['all', 'observation', 'derivation', 'inference', 'unknown'], default: 'all' },
        minConfidence: { type: 'number', minimum: 0, maximum: 1, default: 0.0 }
      }
    }
  },
  {
    name: 'rea_doctor',
    description: 'Runs diagnostic checks on local reverse engineering engines (Ghidra, Hopper, IDA, JADX, WABT, TShark, pwntools) and prints setup advice.',
    category: 'System Diagnostics',
    parameters: {
      type: 'object',
      properties: {
        verbose: { type: 'boolean', default: false }
      }
    }
  }
];

export interface DoctorCheckItem {
  id: string;
  name: string;
  category: 'Native Engine' | 'Platform Tool' | 'Decompiler' | 'Environment';
  status: 'installed' | 'missing' | 'optional' | 'ready';
  version?: string;
  path?: string;
  guidance: string;
}

export const DOCTOR_CHECKS: DoctorCheckItem[] = [
  {
    id: 'node',
    name: 'Node.js Runtime',
    category: 'Environment',
    status: 'ready',
    version: 'v22.19.0',
    path: '/usr/local/bin/node',
    guidance: 'Compatible with REA requirements (>=22.19.0).'
  },
  {
    id: 'ghidra',
    name: 'Ghidra Headless Decompiler',
    category: 'Native Engine',
    status: 'installed',
    version: '12.1.4',
    path: '/opt/ghidra/support/analyzeHeadless',
    guidance: 'Ephemeral headless mode ready for Linux & Windows P0 targets.'
  },
  {
    id: 'hopper',
    name: 'Hopper Disassembler v4',
    category: 'Native Engine',
    status: 'ready',
    version: '4.8.1',
    path: '/usr/bin/hopper-v4',
    guidance: 'Active headless bridge configured.'
  },
  {
    id: 'ida',
    name: 'IDA Pro / IDA Home',
    category: 'Native Engine',
    status: 'optional',
    version: 'Not detected (Bring-your-own)',
    path: 'None',
    guidance: 'Optional read-only bridge available if IDA is installed locally.'
  },
  {
    id: 'jadx',
    name: 'JADX Android Decompiler',
    category: 'Decompiler',
    status: 'installed',
    version: '1.5.0',
    path: '/usr/local/bin/jadx',
    guidance: 'Ready for APK Dalvik/Smali decompilation.'
  },
  {
    id: 'wabt',
    name: 'WABT (WebAssembly Binary Toolkit)',
    category: 'Platform Tool',
    status: 'installed',
    version: '1.0.42',
    path: '/usr/bin/wasm2wat',
    guidance: 'Ready for WASM validation and WAT decompilation.'
  },
  {
    id: 'tshark',
    name: 'TShark / Wireshark CLI',
    category: 'Platform Tool',
    status: 'installed',
    version: '4.2.2',
    path: '/usr/bin/tshark',
    guidance: 'Ready for PCAP packet inspection and dissections.'
  },
  {
    id: 'pwntools',
    name: 'pwntools & pwndbg',
    category: 'Platform Tool',
    status: 'installed',
    version: '4.12.0',
    path: '/usr/local/bin/pwn',
    guidance: 'Ready for ELF diagnostics and recorded crash forensics.'
  }
];
