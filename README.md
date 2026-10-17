# REA: Reverse Engineer Anything (React Application)

### One MCP & Web Workbench for reverse engineering across binaries, applications, and runtime behavior.

**See a feature you like. Understand how it works, down to the binary level.**

This application is a full React rewrite of the REA (Reverse Engineer Anything) workbench platform.

---

## Features

- **Interactive Decompiler & Disassembly Workbench**:
  - Pseudocode decompilation (C/C++ reconstruction)
  - Full instruction disassembly with branch targeting and operands
  - Synchronous 16-byte raw Hex dump with byte-level inspector (Dec, Hex, Binary, ASCII, Signed int8)
  - Function caller/callee cross-references (XRefs) and stack frame variable inspection
- **Binary Layout & Security Diagnostics**:
  - Symbols table with address, type, binding, section, and demangled names
  - Extracted string literals pool with virtual address and cross-reference counts
  - Section and segment entropy visualizer (.text, .rodata, .data, .bss, .got)
  - Binary security mitigations audit (NX/DEP, ASLR/PIE, Stack Canaries, RELRO, Fortified Source)
- **JavaScript & Electron Application Graph**:
  - ASAR archive filesystem tree viewer
  - Electron IPC Matrix (Channel name, Trajectory, API Invoker, Payload schema, Security gate)
  - Electron Fuses static audit (RunAsNode, EnableCookieEncryption, NodeCliInspect)
- **Network & Packet Capture Inspection**:
  - HTTP/HTTPS and TCP capture streams (HAR, SAZ, PCAP)
  - Timing waterfall and request/response header analyzer
  - Automated security & privacy leak detector (e.g., token leaks in GET parameters, permissive CORS)
- **Signature REA Evidence Ledger & Provenance Authority**:
  - Epistemological classification of findings:
    - **Observation**: Factual raw bytes, strings, headers, and exported symbols
    - **Derivation**: Algorithmic calculations, mathematical transformations, and trace results
    - **Inference**: Heuristic patterns, decompiler type approximations, compiler detection
    - **Unknown**: Explicitly unresolved gaps, indirect branch targets, missing symbols
  - Evidence confidence scoring (0% - 100%)
  - Evidence bundle export (JSON / Markdown)
- **Real-World Showcases & Case Studies**:
  - **DX-Ball**: Reconstruct sound-pan calculation passing 3,205 / 3,205 x86 test cases
  - **Notion**: Trace Electron clipboard bridge across 3-layer architecture
  - **TH04**: 16-bit 8086 DOS fixed-point trigonometry to modern C++ reconstruction
- **Interactive CLI & Model Context Protocol (MCP) Playground**:
  - Built-in REA CLI Terminal (`rea --help`, `rea doctor`, `rea analyze`, `rea status`)
  - Direct execution of REA MCP Tools with JSON parameter configuration and response viewer
- **REA Doctor & MCP Agent Configurator**:
  - Local engine health diagnostics (Ghidra, Hopper, IDA Pro, JADX, WABT, TShark, pwntools)
  - 1-click configuration generator for Claude Desktop, Cursor, Gemini CLI, and Codex

---

## Development

```bash
npm install
npm run dev
```

Build for production:

```bash
npm run build
```
