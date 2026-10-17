export type TargetKind = 
  | 'native_binary' 
  | 'javascript_electron' 
  | 'wasm' 
  | 'evm' 
  | 'network_capture' 
  | 'android_apk' 
  | 'sqlite_db' 
  | 'dotnet_cil';

export type EvidenceCategory = 'observation' | 'derivation' | 'inference' | 'unknown';

export interface EvidenceItem {
  id: string;
  category: EvidenceCategory;
  summary: string;
  details: string;
  confidence: number; // 0.0 - 1.0
  sourceOffset?: string;
  sourceEngine: 'ghidra' | 'hopper' | 'ida' | 'jadx' | 'rea_static' | 'wabt' | 'pwntools' | 'tshark';
  targetSymbol?: string;
  timestamp: string;
}

export interface SymbolInfo {
  name: string;
  address: string;
  type: 'function' | 'object' | 'import' | 'export' | 'variable';
  size: number;
  binding: 'global' | 'local' | 'weak';
  section: string;
  demangledName?: string;
}

export interface StringEntry {
  offset: string;
  virtualAddress: string;
  length: number;
  encoding: 'ASCII' | 'UTF-8' | 'UTF-16LE';
  value: string;
  section: string;
  xrefCount: number;
}

export interface SectionInfo {
  name: string;
  virtualAddress: string;
  virtualSize: string;
  rawSize: string;
  fileOffset: string;
  permissions: string; // r-x, rw-, etc.
  entropy: number;
  purpose: string;
}

export interface MitigationStatus {
  name: string;
  enabled: boolean;
  details: string;
  severity: 'low' | 'medium' | 'high' | 'info';
}

export interface InstructionLine {
  address: string;
  bytes: string;
  mnemonic: string;
  operands: string;
  comment?: string;
  jumpTarget?: string;
}

export interface DecompiledFunction {
  name: string;
  address: string;
  returnType: string;
  signature: string;
  code: string;
  instructions: InstructionLine[];
  xrefs: { from: string; type: string }[];
  localVariables: { name: string; type: string; offset: string }[];
}

export interface TargetArtifact {
  id: string;
  name: string;
  kind: TargetKind;
  architecture: string;
  fileSize: number;
  format: string; // ELF64, PE32+, Mach-O, ASAR, WASM, EVM, APK, SQLite3, HAR
  sha256: string;
  md5: string;
  entryPoint: string;
  compiler?: string;
  evidence: EvidenceItem[];
  functions: DecompiledFunction[];
  symbols: SymbolInfo[];
  strings: StringEntry[];
  sections: SectionInfo[];
  mitigations: MitigationStatus[];
  hexSample: { offset: number; bytes: number[] }[];
  // Kind-specific extra data
  metadata?: Record<string, any>;
}

export interface Showcase {
  id: string;
  title: string;
  subtitle: string;
  target: string;
  author: string;
  category: string;
  badge: string;
  overview: string;
  challenge: string;
  findings: string[];
  originalCode: string;
  reconstructedCode: string;
  verificationStats: {
    testCasesPassed: number;
    totalTestCases: number;
    byteMatchRate: string;
    compilerTarget: string;
  };
}

export interface McpToolDefinition {
  name: string;
  description: string;
  category: string;
  parameters: Record<string, any>;
}
