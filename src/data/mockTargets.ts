import { TargetArtifact } from '../types/rea';

export const MOCK_TARGETS: TargetArtifact[] = [
  {
    id: 'crackme_x64',
    name: 'crackme_auth_x64.elf',
    kind: 'native_binary',
    architecture: 'x86_64 (AMD64)',
    fileSize: 18432,
    format: 'ELF64 Executable',
    sha256: '9f86d081884c7d659a2feaa0c55ad015a3bf4f1b2b0b822cd15d6c15b0f00a08',
    md5: '5d41402abc4b2a76b9719d911017c592',
    entryPoint: '0x00401120',
    compiler: 'GCC 13.2.0 (Ubuntu 24.04)',
    evidence: [
      {
        id: 'ev-1',
        category: 'observation',
        summary: 'ELF Header Machine Type is EM_X86_64 (0x3E)',
        details: 'Raw byte inspection at offset 0x12 verifies standard 64-bit little-endian x86 executable.',
        confidence: 1.0,
        sourceOffset: '0x00000012',
        sourceEngine: 'rea_static',
        timestamp: '15:32:01'
      },
      {
        id: 'ev-2',
        category: 'observation',
        summary: 'Hardcoded string literal "ACCESS_GRANTED_REA_TOKEN" in .rodata',
        details: 'String detected at virtual address 0x00402030, null-terminated ASCII length 24.',
        confidence: 1.0,
        sourceOffset: '0x00402030',
        sourceEngine: 'hopper',
        targetSymbol: 's_ACCESS_GRANTED',
        timestamp: '15:32:02'
      },
      {
        id: 'ev-3',
        category: 'derivation',
        summary: 'Function verify_license() performs byte-wise XOR with key 0x5A',
        details: 'Instruction loop at 0x0040126a iterates length 16, applying XOR AL, 0x5A before comparing to stored digest array.',
        confidence: 0.98,
        sourceOffset: '0x0040126a',
        sourceEngine: 'ghidra',
        targetSymbol: 'verify_license',
        timestamp: '15:32:04'
      },
      {
        id: 'ev-4',
        category: 'inference',
        summary: 'Probable anti-debugging call via ptrace(PTRACE_TRACEME, 0, 1, 0)',
        details: 'Call to syscall 101 or ptrace import found at entry point wrapper. Returns -1 if debugger attached, triggering premature exit(1).',
        confidence: 0.85,
        sourceOffset: '0x004011d0',
        sourceEngine: 'ghidra',
        targetSymbol: 'check_debugger',
        timestamp: '15:32:05'
      },
      {
        id: 'ev-5',
        category: 'unknown',
        summary: 'Indirect tail jump to RAX at 0x00401340 has unresolved targets',
        details: 'Function pointer calculated dynamically via GOT offset; static analysis cannot determine all runtime dispatch destinations.',
        confidence: 0.40,
        sourceOffset: '0x00401340',
        sourceEngine: 'ida',
        targetSymbol: 'dynamic_dispatch_handler',
        timestamp: '15:32:06'
      }
    ],
    functions: [
      {
        name: 'verify_license',
        address: '0x00401240',
        returnType: 'int',
        signature: 'int verify_license(const char* input_key, size_t len)',
        code: `int verify_license(const char* input_key, size_t len) {
    // REA Decompiler - Ghidra Engine output
    if (input_key == NULL || len != 16) {
        return 0; // Invalid key length
    }
    
    // Obfuscation mask recovered: 0x5A
    const uint8_t expected_hash[16] = {
        0x1B, 0x3F, 0x7A, 0x2C, 0x09, 0x54, 0x6E, 0x31,
        0x4B, 0x22, 0x18, 0x7F, 0x33, 0x0E, 0x65, 0x4D
    };
    
    for (size_t i = 0; i < 16; i++) {
        uint8_t transformed = (uint8_t)input_key[i] ^ 0x5A;
        if (transformed != expected_hash[i]) {
            return 0; // Checksum mismatch
        }
    }
    
    puts("[+] License key validated successfully!");
    grant_privileged_session();
    return 1;
}`,
        instructions: [
          { address: '0x00401240', bytes: '55', mnemonic: 'push', operands: 'rbp', comment: 'Prologue' },
          { address: '0x00401241', bytes: '48 89 e5', mnemonic: 'mov', operands: 'rbp, rsp' },
          { address: '0x00401244', bytes: '48 83 ec 30', mnemonic: 'sub', operands: 'rsp, 0x30' },
          { address: '0x00401248', bytes: '48 89 7d e8', mnemonic: 'mov', operands: 'qword ptr [rbp-0x18], rdi', comment: 'arg0: input_key' },
          { address: '0x0040124c', bytes: '48 89 75 e0', mnemonic: 'mov', operands: 'qword ptr [rbp-0x20], rsi', comment: 'arg1: len' },
          { address: '0x00401250', bytes: '48 83 7d e8 00', mnemonic: 'cmp', operands: 'qword ptr [rbp-0x18], 0' },
          { address: '0x00401255', bytes: '74 38', mnemonic: 'je', operands: '0x0040128f', jumpTarget: '0x0040128f' },
          { address: '0x00401257', bytes: '48 83 7d e0 10', mnemonic: 'cmp', operands: 'qword ptr [rbp-0x20], 16' },
          { address: '0x0040125c', bytes: '75 31', mnemonic: 'jne', operands: '0x0040128f', jumpTarget: '0x0040128f' },
          { address: '0x0040125e', bytes: 'c7 45 fc 00 00 00 00', mnemonic: 'mov', operands: 'dword ptr [rbp-4], 0', comment: 'i = 0' },
          { address: '0x00401265', bytes: 'eb 1a', mnemonic: 'jmp', operands: '0x00401281', jumpTarget: '0x00401281' },
          { address: '0x00401267', bytes: '8b 45 fc', mnemonic: 'mov', operands: 'eax, dword ptr [rbp-4]' },
          { address: '0x0040126a', bytes: '34 5a', mnemonic: 'xor', operands: 'al, 0x5a', comment: 'XOR with mask 0x5A' },
          { address: '0x0040126c', bytes: '0f b6 c0', mnemonic: 'movzx', operands: 'eax, al' },
          { address: '0x0040126f', bytes: '3a 44 05 d0', mnemonic: 'cmp', operands: 'al, byte ptr [rbp+rax-0x30]' },
          { address: '0x00401273', bytes: '75 1a', mnemonic: 'jne', operands: '0x0040128f', jumpTarget: '0x0040128f' },
          { address: '0x00401275', bytes: '83 45 fc 01', mnemonic: 'add', operands: 'dword ptr [rbp-4], 1' },
          { address: '0x00401279', bytes: '83 7d fc 0f', mnemonic: 'cmp', operands: 'dword ptr [rbp-4], 15' },
          { address: '0x0040127d', bytes: '7e e8', mnemonic: 'jle', operands: '0x00401267', jumpTarget: '0x00401267' },
          { address: '0x0040127f', bytes: 'b8 01 00 00 00', mnemonic: 'mov', operands: 'eax, 1' },
          { address: '0x00401284', bytes: 'e8 57 fe ff ff', mnemonic: 'call', operands: 'grant_privileged_session', jumpTarget: '0x004010e0' },
          { address: '0x00401289', bytes: 'c9', mnemonic: 'leave', operands: '' },
          { address: '0x0040128a', bytes: 'c3', mnemonic: 'ret', operands: '' }
        ],
        xrefs: [
          { from: '0x00401410 (main)', type: 'CALL' },
          { from: '0x00401560 (cli_test_hook)', type: 'CALL' }
        ],
        localVariables: [
          { name: 'input_key', type: 'char*', offset: 'rbp-0x18' },
          { name: 'len', type: 'size_t', offset: 'rbp-0x20' },
          { name: 'i', type: 'int', offset: 'rbp-0x04' },
          { name: 'expected_hash', type: 'uint8_t[16]', offset: 'rbp-0x30' }
        ]
      },
      {
        name: 'grant_privileged_session',
        address: '0x004010e0',
        returnType: 'void',
        signature: 'void grant_privileged_session(void)',
        code: `void grant_privileged_session(void) {
    setreuid(0, 0);
    system("/bin/sh -i");
}`,
        instructions: [
          { address: '0x004010e0', bytes: '55', mnemonic: 'push', operands: 'rbp' },
          { address: '0x004010e1', bytes: '48 89 e5', mnemonic: 'mov', operands: 'rbp, rsp' },
          { address: '0x004010e4', bytes: '31 f6', mnemonic: 'xor', operands: 'esi, esi' },
          { address: '0x004010e6', bytes: '31 ff', mnemonic: 'xor', operands: 'edi, edi' },
          { address: '0x004010e8', bytes: 'e8 23 00 00 00', mnemonic: 'call', operands: 'setreuid@plt' },
          { address: '0x004010ed', bytes: '48 8d 3d 4c 0f 00 00', mnemonic: 'lea', operands: 'rdi, [rip + 0xf4c]' },
          { address: '0x004010f4', bytes: 'e8 17 00 00 00', mnemonic: 'call', operands: 'system@plt' },
          { address: '0x004010f9', bytes: '5d', mnemonic: 'pop', operands: 'rbp' },
          { address: '0x004010fa', bytes: 'c3', mnemonic: 'ret', operands: '' }
        ],
        xrefs: [{ from: '0x00401284 (verify_license)', type: 'CALL' }],
        localVariables: []
      },
      {
        name: 'main',
        address: '0x00401400',
        returnType: 'int',
        signature: 'int main(int argc, char** argv)',
        code: `int main(int argc, char** argv) {
    if (argc < 2) {
        printf("Usage: %s <16-char-key>\\n", argv[0]);
        return 1;
    }
    
    if (check_debugger() != 0) {
        puts("[-] Debugger detected! Aborting.");
        return 2;
    }
    
    return verify_license(argv[1], strlen(argv[1])) ? 0 : 3;
}`,
        instructions: [
          { address: '0x00401400', bytes: '55', mnemonic: 'push', operands: 'rbp' },
          { address: '0x00401401', bytes: '48 89 e5', mnemonic: 'mov', operands: 'rbp, rsp' },
          { address: '0x00401404', bytes: '48 83 ec 10', mnemonic: 'sub', operands: 'rsp, 0x10' },
          { address: '0x00401408', bytes: '83 ff 01', mnemonic: 'cmp', operands: 'edi, 1' },
          { address: '0x0040140b', bytes: '7f 0a', mnemonic: 'jg', operands: '0x00401417' },
          { address: '0x0040140d', bytes: 'b8 01 00 00 00', mnemonic: 'mov', operands: 'eax, 1' },
          { address: '0x00401412', bytes: 'c9', mnemonic: 'leave', operands: '' },
          { address: '0x00401413', bytes: 'c3', mnemonic: 'ret', operands: '' }
        ],
        xrefs: [{ from: '0x00401120 (_start)', type: 'CALL' }],
        localVariables: [{ name: 'argc', type: 'int', offset: 'edi' }, { name: 'argv', type: 'char**', offset: 'rsi' }]
      }
    ],
    symbols: [
      { name: '_start', address: '0x00401120', type: 'function', size: 45, binding: 'global', section: '.text' },
      { name: 'main', address: '0x00401400', type: 'function', size: 92, binding: 'global', section: '.text' },
      { name: 'verify_license', address: '0x00401240', type: 'function', size: 124, binding: 'global', section: '.text' },
      { name: 'grant_privileged_session', address: '0x004010e0', type: 'function', size: 27, binding: 'local', section: '.text' },
      { name: 'check_debugger', address: '0x004011d0', type: 'function', size: 58, binding: 'local', section: '.text' },
      { name: 's_ACCESS_GRANTED', address: '0x00402030', type: 'object', size: 25, binding: 'local', section: '.rodata' },
      { name: 'puts@@GLIBC_2.2.5', address: '0x00401030', type: 'import', size: 16, binding: 'global', section: '.plt' },
      { name: 'system@@GLIBC_2.2.5', address: '0x00401040', type: 'import', size: 16, binding: 'global', section: '.plt' },
      { name: 'ptrace@@GLIBC_2.2.5', address: '0x00401050', type: 'import', size: 16, binding: 'global', section: '.plt' }
    ],
    strings: [
      { offset: '0x00002008', virtualAddress: '0x00402008', length: 28, encoding: 'ASCII', value: 'Usage: %s <16-char-key>\n', section: '.rodata', xrefCount: 1 },
      { offset: '0x00002028', virtualAddress: '0x00402028', length: 33, encoding: 'ASCII', value: '[-] Debugger detected! Aborting.\n', section: '.rodata', xrefCount: 1 },
      { offset: '0x0000204c', virtualAddress: '0x0040204c', length: 39, encoding: 'ASCII', value: '[+] License key validated successfully!\n', section: '.rodata', xrefCount: 1 },
      { offset: '0x00002078', virtualAddress: '0x00402078', length: 11, encoding: 'ASCII', value: '/bin/sh -i', section: '.rodata', xrefCount: 1 },
      { offset: '0x00002088', virtualAddress: '0x00402088', length: 24, encoding: 'ASCII', value: 'ACCESS_GRANTED_REA_TOKEN', section: '.rodata', xrefCount: 2 },
      { offset: '0x000020a4', virtualAddress: '0x004020a4', length: 15, encoding: 'ASCII', value: 'GCC: (Ubuntu) 13.2', section: '.comment', xrefCount: 0 }
    ],
    sections: [
      { name: '.text', virtualAddress: '0x00401000', virtualSize: '0x00000650', rawSize: '0x00000650', fileOffset: '0x00001000', permissions: 'r-x', entropy: 6.42, purpose: 'Executable Code' },
      { name: '.rodata', virtualAddress: '0x00402000', virtualSize: '0x00000240', rawSize: '0x00000240', fileOffset: '0x00002000', permissions: 'r--', entropy: 4.88, purpose: 'Constant Strings & Data' },
      { name: '.data', virtualAddress: '0x00403000', virtualSize: '0x00000080', rawSize: '0x00000080', fileOffset: '0x00003000', permissions: 'rw-', entropy: 2.15, purpose: 'Initialized Variables' },
      { name: '.bss', virtualAddress: '0x00403080', virtualSize: '0x00000120', rawSize: '0x00000000', fileOffset: '0x00003080', permissions: 'rw-', entropy: 0.0, purpose: 'Uninitialized Variables' },
      { name: '.got.plt', virtualAddress: '0x00403fc0', virtualSize: '0x00000040', rawSize: '0x00000040', fileOffset: '0x00003fc0', permissions: 'rw-', entropy: 3.10, purpose: 'Global Offset Table' },
      { name: '.dynsym', virtualAddress: '0x004002e8', virtualSize: '0x000000d8', rawSize: '0x000000d8', fileOffset: '0x000002e8', permissions: 'r--', entropy: 4.12, purpose: 'Dynamic Linker Symbols' }
    ],
    mitigations: [
      { name: 'NX / DEP', enabled: true, details: 'Non-Executable Stack enabled (GNU_STACK header flags: RW)', severity: 'high' },
      { name: 'ASLR / PIE', enabled: false, details: 'Position Independent Executable flag is NOT set (ET_EXEC fixed at 0x400000)', severity: 'high' },
      { name: 'Stack Canary', enabled: true, details: '__stack_chk_fail guard present around buffer operations', severity: 'medium' },
      { name: 'RELRO', enabled: true, details: 'Partial RELRO detected (.got is writeable after init)', severity: 'low' },
      { name: 'Fortified Source', enabled: false, details: 'No __sprintf_chk or __printf_chk symbols found', severity: 'low' }
    ],
    hexSample: [
      { offset: 0x1000, bytes: [0x55, 0x48, 0x89, 0xe5, 0x48, 0x83, 0xec, 0x30, 0x48, 0x89, 0x7d, 0xe8, 0x48, 0x89, 0x75, 0xe0] },
      { offset: 0x1010, bytes: [0x48, 0x83, 0x7d, 0xe8, 0x00, 0x74, 0x38, 0x48, 0x83, 0x7d, 0xe0, 0x10, 0x75, 0x31, 0xc7, 0x45] },
      { offset: 0x1020, bytes: [0xfc, 0x00, 0x00, 0x00, 0x00, 0xeb, 0x1a, 0x8b, 0x45, 0xfc, 0x34, 0x5a, 0x0f, 0xb6, 0xc0, 0x3a] },
      { offset: 0x1030, bytes: [0x44, 0x05, 0xd0, 0x75, 0x1a, 0x83, 0x45, 0xfc, 0x01, 0x83, 0x7d, 0xfc, 0x0f, 0x7e, 0xe8, 0xb8] }
    ]
  },
  {
    id: 'electron_notion',
    name: 'notion-desktop-bridge.asar',
    kind: 'javascript_electron',
    architecture: 'JavaScript / Node.js V8',
    fileSize: 4219080,
    format: 'Electron ASAR Archive',
    sha256: 'a12bc489f074d31298cdeaf658734a9b81203498172034981273981273981273',
    md5: '7823abce128934df7823abce128934df',
    entryPoint: 'dist/main/main.js',
    compiler: 'esbuild 0.20.1 + TypeScript 5.4',
    evidence: [
      {
        id: 'ev-notion-1',
        category: 'observation',
        summary: 'contextBridge.exposeInMainWorld registers "notionClipboard"',
        details: 'Found in preload script dist/preload/index.js exposing custom IPC channels to unprivileged renderer frame.',
        confidence: 1.0,
        sourceOffset: 'dist/preload/index.js:42',
        sourceEngine: 'rea_static',
        targetSymbol: 'contextBridge.exposeInMainWorld',
        timestamp: '15:32:10'
      },
      {
        id: 'ev-notion-2',
        category: 'derivation',
        summary: 'IPC Channel "notion:write-rich-clipboard" delegates to native electron clipboard',
        details: 'Main process handler receives { html, text, rtf, customData } and calls clipboard.writeBuffer with internal type ID.',
        confidence: 0.95,
        sourceOffset: 'dist/main/clipboardHandler.js:88',
        sourceEngine: 'rea_static',
        targetSymbol: 'ipcMain.handle',
        timestamp: '15:32:12'
      },
      {
        id: 'ev-notion-3',
        category: 'inference',
        summary: 'Electron Fuses: RunAsNode is explicitly disabled',
        details: 'ELECTRON_RUN_AS_NODE fuse set to 0 in binary header, preventing arbitrary child node execution by environment variables.',
        confidence: 0.90,
        sourceOffset: 'fuses_table:offset_0x34',
        sourceEngine: 'rea_static',
        timestamp: '15:32:14'
      }
    ],
    functions: [
      {
        name: 'setupClipboardIpc',
        address: 'dist/main/ipc.js',
        returnType: 'void',
        signature: 'function setupClipboardIpc(): void',
        code: `// REA JavaScript Recovery - Reconstructed from main bundle
import { ipcMain, clipboard, nativeImage } from 'electron';

export function setupClipboardIpc() {
  ipcMain.handle('notion:write-rich-clipboard', async (_event, payload) => {
    const { html, text, rtf, metadata } = payload;
    
    const writeData = {
      text: text || '',
      html: html || '',
      rtf: rtf || undefined
    };
    
    if (metadata) {
      const serialized = Buffer.from(JSON.stringify(metadata), 'utf-8');
      clipboard.writeBuffer('application/x-notion-blocks', serialized);
    }
    
    clipboard.write(writeData, 'clipboard');
    return { status: 'success', bytesWritten: (text?.length || 0) + (html?.length || 0) };
  });

  ipcMain.handle('notion:read-rich-clipboard', async () => {
    const hasCustomData = clipboard.has('application/x-notion-blocks');
    let customData = null;
    if (hasCustomData) {
      const raw = clipboard.readBuffer('application/x-notion-blocks');
      customData = JSON.parse(raw.toString('utf-8'));
    }
    return {
      text: clipboard.readText(),
      html: clipboard.readHTML(),
      customData
    };
  });
}`,
        instructions: [],
        xrefs: [{ from: 'dist/main/index.js (bootstrap)', type: 'CALL' }],
        localVariables: []
      }
    ],
    symbols: [
      { name: 'ipcMain.handle("notion:write-rich-clipboard")', address: 'ipc_table:0x01', type: 'function', size: 0, binding: 'global', section: 'IPC_HANDLERS' },
      { name: 'ipcMain.handle("notion:read-rich-clipboard")', address: 'ipc_table:0x02', type: 'function', size: 0, binding: 'global', section: 'IPC_HANDLERS' },
      { name: 'contextBridge.exposeInMainWorld', address: 'preload:0x15', type: 'function', size: 0, binding: 'global', section: 'PRELOAD' }
    ],
    strings: [
      { offset: '0x000104', virtualAddress: '0x00', length: 28, encoding: 'UTF-8', value: 'notion:write-rich-clipboard', section: 'JS_STRINGS', xrefCount: 4 },
      { offset: '0x000130', virtualAddress: '0x00', length: 27, encoding: 'UTF-8', value: 'notion:read-rich-clipboard', section: 'JS_STRINGS', xrefCount: 3 },
      { offset: '0x000160', virtualAddress: '0x00', length: 27, encoding: 'UTF-8', value: 'application/x-notion-blocks', section: 'JS_STRINGS', xrefCount: 5 }
    ],
    sections: [
      { name: 'dist/main/main.js', virtualAddress: '0x00000000', virtualSize: '1.2 MB', rawSize: '1.2 MB', fileOffset: '0x00000040', permissions: 'r--', entropy: 5.82, purpose: 'Main Process Bundle' },
      { name: 'dist/preload/index.js', virtualAddress: '0x00000000', virtualSize: '45 KB', rawSize: '45 KB', fileOffset: '0x0012f000', permissions: 'r--', entropy: 5.12, purpose: 'Preload Context Bridge' },
      { name: 'dist/renderer/index.html', virtualAddress: '0x00000000', virtualSize: '3.4 KB', rawSize: '3.4 KB', fileOffset: '0x0013b000', permissions: 'r--', entropy: 4.88, purpose: 'Renderer Entry' }
    ],
    mitigations: [
      { name: 'Context Isolation', enabled: true, details: 'webPreferences.contextIsolation is explicitly true', severity: 'high' },
      { name: 'Node Integration', enabled: false, details: 'webPreferences.nodeIntegration is disabled (secure)', severity: 'high' },
      { name: 'Sandbox', enabled: true, details: 'Renderer sandbox is active', severity: 'medium' },
      { name: 'RunAsNode Fuse', enabled: false, details: 'Fuse ELECTRON_RUN_AS_NODE is set to 0', severity: 'info' }
    ],
    hexSample: [],
    metadata: {
      asarFilesCount: 248,
      ipcChannels: ['notion:write-rich-clipboard', 'notion:read-rich-clipboard', 'notion:window-minimize', 'notion:window-maximize', 'notion:open-external-url'],
      sourceMapsAvailable: true,
      electronVersion: '29.1.5'
    }
  },
  {
    id: 'crypto_vault_wasm',
    name: 'crypto_wallet_vault.wasm',
    kind: 'wasm',
    architecture: 'WebAssembly (Wasm MVP + SIMD128)',
    fileSize: 84920,
    format: 'WebAssembly Binary (.wasm)',
    sha256: '4b227777d4dd1fc61c6f884f48641d02b4d121d3fd328cb08b5531fcacdabf8a',
    md5: '8b1a9953c4611296a827abf8c47804d7',
    entryPoint: 'export:sha256_hash_block',
    compiler: 'Rust 1.78 + wasm-bindgen',
    evidence: [
      {
        id: 'ev-wasm-1',
        category: 'observation',
        summary: 'WASM Magic bytes 0x00 0x61 0x73 0x6D (\\0asm) and version 0x01',
        details: 'Standard WebAssembly module header validated conforming to W3C Core 2.0 specification.',
        confidence: 1.0,
        sourceOffset: '0x00000000',
        sourceEngine: 'wabt',
        timestamp: '15:32:18'
      },
      {
        id: 'ev-wasm-2',
        category: 'derivation',
        summary: 'Exported function "sha256_hash_block" takes (i32, i32, i32) -> i32',
        details: 'Arguments map to (ptr_input, len_input, ptr_output_buffer) with 32-byte digest returned.',
        confidence: 1.0,
        sourceOffset: 'section_export:func_07',
        sourceEngine: 'wabt',
        targetSymbol: 'sha256_hash_block',
        timestamp: '15:32:20'
      },
      {
        id: 'ev-wasm-3',
        category: 'inference',
        summary: 'Memory 0 declared with initial 2 pages (128 KB), maximum 16 pages (1 MB)',
        details: 'Heap layout uses first 64KB for stack pointer (starting at __stack_pointer = 65536) followed by dynamic allocator.',
        confidence: 0.95,
        sourceOffset: 'section_memory:0x00',
        sourceEngine: 'rea_static',
        timestamp: '15:32:22'
      }
    ],
    functions: [
      {
        name: 'sha256_hash_block',
        address: 'func[7]',
        returnType: 'i32',
        signature: '(func $sha256_hash_block (param $ptr i32) (param $len i32) (param $out_ptr i32) (result i32))',
        code: `(module
  ;; Reconstructed WebAssembly Text (WAT) via WABT decompiler
  (func $sha256_hash_block (param $ptr i32) (param $len i32) (param $out i32) (result i32)
    (local $h0 i32) (local $h1 i32) (local $h2 i32) (local $h3 i32)
    (local $w0 i32) (local $round i32)
    
    ;; Initial SHA-256 H constants
    i32.const 0x6a09e667
    local.set $h0
    i32.const 0xbb67ae85
    local.set $h1
    
    ;; Memory boundary check
    local.get $ptr
    local.get $len
    i32.add
    i32.const 65536
    i32.gt_u
    if
      i32.const -1
      return
    end
    
    ;; Hash loop execution
    loop $compression
      ;; ... cryptographic SIMD instructions omitted ...
    end
    
    ;; Store 32-byte result to memory at $out
    local.get $out
    local.get $h0
    i32.store offset=0
    
    i32.const 0 ;; SUCCESS
  )
)`,
        instructions: [
          { address: '0x000210', bytes: '20 00', mnemonic: 'local.get', operands: '$ptr' },
          { address: '0x000212', bytes: '20 01', mnemonic: 'local.get', operands: '$len' },
          { address: '0x000214', bytes: '6a', mnemonic: 'i32.add', operands: '' },
          { address: '0x000215', bytes: '41 00 00 01 00', mnemonic: 'i32.const', operands: '65536' },
          { address: '0x00021a', bytes: '4a', mnemonic: 'i32.gt_u', operands: '' },
          { address: '0x00021b', bytes: '04 7f', mnemonic: 'if', operands: 'i32' },
          { address: '0x00021d', bytes: '41 7f', mnemonic: 'i32.const', operands: '-1' },
          { address: '0x00021f', bytes: '0f', mnemonic: 'return', operands: '' },
          { address: '0x000220', bytes: '0b', mnemonic: 'end', operands: '' }
        ],
        xrefs: [],
        localVariables: [{ name: '$ptr', type: 'i32', offset: 'param 0' }, { name: '$len', type: 'i32', offset: 'param 1' }, { name: '$out', type: 'i32', offset: 'param 2' }]
      }
    ],
    symbols: [
      { name: 'sha256_hash_block', address: 'export[0]', type: 'export', size: 312, binding: 'global', section: 'EXPORT' },
      { name: 'aes_gcm_encrypt', address: 'export[1]', type: 'export', size: 840, binding: 'global', section: 'EXPORT' },
      { name: 'allocate_buffer', address: 'export[2]', type: 'export', size: 88, binding: 'global', section: 'EXPORT' },
      { name: 'deallocate_buffer', address: 'export[3]', type: 'export', size: 64, binding: 'global', section: 'EXPORT' }
    ],
    strings: [
      { offset: '0x001004', virtualAddress: '0x00', length: 15, encoding: 'UTF-8', value: 'invalid_pointer', section: 'DATA', xrefCount: 2 },
      { offset: '0x001016', virtualAddress: '0x00', length: 18, encoding: 'UTF-8', value: 'memory_out_of_bound', section: 'DATA', xrefCount: 1 }
    ],
    sections: [
      { name: 'Type (1)', virtualAddress: '0x0000000a', virtualSize: '0x00000048', rawSize: '72 B', fileOffset: '0x0000000a', permissions: 'r--', entropy: 3.8, purpose: 'Function signatures' },
      { name: 'Function (3)', virtualAddress: '0x00000054', virtualSize: '0x00000020', rawSize: '32 B', fileOffset: '0x00000054', permissions: 'r--', entropy: 3.1, purpose: 'Function to type indices' },
      { name: 'Export (7)', virtualAddress: '0x00000076', virtualSize: '0x0000005e', rawSize: '94 B', fileOffset: '0x00000076', permissions: 'r--', entropy: 4.2, purpose: 'Public exports' },
      { name: 'Code (10)', virtualAddress: '0x00000100', virtualSize: '0x00013000', rawSize: '76 KB', fileOffset: '0x00000100', permissions: 'r-x', entropy: 6.9, purpose: 'Compiled bytecode' },
      { name: 'Data (11)', virtualAddress: '0x00013200', virtualSize: '0x00001800', rawSize: '6 KB', fileOffset: '0x00013200', permissions: 'rw-', entropy: 4.5, purpose: 'Constants & Static Heap' }
    ],
    mitigations: [
      { name: 'Memory Isolation', enabled: true, details: 'Sandboxed linear memory, no raw host pointer access', severity: 'high' },
      { name: 'Control Flow Integrity', enabled: true, details: 'Valid branch targets strictly verified by table & labels', severity: 'high' }
    ],
    hexSample: [
      { offset: 0x0, bytes: [0x00, 0x61, 0x73, 0x6d, 0x01, 0x00, 0x00, 0x00, 0x01, 0x08, 0x01, 0x60, 0x03, 0x7f, 0x7f, 0x7f] },
      { offset: 0x10, bytes: [0x01, 0x7f, 0x03, 0x02, 0x01, 0x00, 0x05, 0x03, 0x01, 0x00, 0x02, 0x07, 0x15, 0x01, 0x11, 0x73] }
    ]
  },
  {
    id: 'evm_uniswap',
    name: 'uniswap_v2_core.evm',
    kind: 'evm',
    architecture: 'Ethereum Virtual Machine (Shanghai)',
    fileSize: 9410,
    format: 'EVM Bytecode (.hex)',
    sha256: 'ef2d127de37b942baad06145e54b0c619a1f22327b2ebbcfbec78f5564afe39d',
    md5: 'c4ca4238a0b923820dcc509a6f75849b',
    entryPoint: '0x00000000',
    compiler: 'Solidity 0.8.20 + via-IR',
    evidence: [
      {
        id: 'ev-evm-1',
        category: 'observation',
        summary: 'Function dispatcher matches 4 selectors',
        details: '0xa9059cbb (transfer), 0x70a08231 (balanceOf), 0x022c0d62 (swap), 0x0902f1ac (getReserves).',
        confidence: 1.0,
        sourceOffset: '0x00000028',
        sourceEngine: 'rea_static',
        targetSymbol: 'Dispatcher',
        timestamp: '15:32:30'
      },
      {
        id: 'ev-evm-2',
        category: 'derivation',
        summary: 'Selector 0x022c0d62 decompiles to swap(uint256,uint256,address,bytes)',
        details: 'Validated via 4byte directory database and matching calldata unpack pattern (PUSH4, EQ, PUSH2 JUMPI).',
        confidence: 0.99,
        sourceOffset: '0x000001a4',
        sourceEngine: 'rea_static',
        targetSymbol: 'swap',
        timestamp: '15:32:32'
      },
      {
        id: 'ev-evm-3',
        category: 'inference',
        summary: 'Reentrancy guard mutex detected at storage slot 0x00',
        details: 'SLOAD at entry of swap() compares slot 0 == 1, writes 2 (locked), then restores 1 (unlocked) before exit.',
        confidence: 0.94,
        sourceOffset: '0x000001d8',
        sourceEngine: 'rea_static',
        targetSymbol: 'nonReentrant',
        timestamp: '15:32:34'
      }
    ],
    functions: [
      {
        name: 'swap',
        address: '0x000001a4',
        returnType: 'void',
        signature: 'function swap(uint amount0Out, uint amount1Out, address to, bytes calldata data) external',
        code: `// REA EVM Bytecode Decompiler - Reconstructed Solidity
function swap(uint amount0Out, uint amount1Out, address to, bytes calldata data) external {
    // Storage slot 0: Mutex lock (1 = UNLOCKED, 2 = LOCKED)
    require(sload(0) == 1, "REENTRANCY_GUARD");
    sstore(0, 2); // Lock
    
    require(amount0Out > 0 || amount1Out > 0, "INSUFFICIENT_OUTPUT_AMOUNT");
    
    (uint112 _reserve0, uint112 _reserve1,) = getReserves();
    require(amount0Out < _reserve0 && amount1Out < _reserve1, "INSUFFICIENT_LIQUIDITY");
    
    uint balance0;
    uint balance1;
    { // Optimistically transfer tokens to recipient
        address _token0 = token0;
        address _token1 = token1;
        require(to != _token0 && to != _token1, "INVALID_TO");
        if (amount0Out > 0) _safeTransfer(_token0, to, amount0Out);
        if (amount1Out > 0) _safeTransfer(_token1, to, amount1Out);
    }
    
    sstore(0, 1); // Unlock
}`,
        instructions: [
          { address: '0x000000', bytes: '60 80 60 40 52', mnemonic: 'PUSH1 0x80 PUSH1 0x40 MSTORE', operands: '', comment: 'Free mem ptr' },
          { address: '0x000005', bytes: '36 15', mnemonic: 'CALLDATASIZE ISZERO', operands: '' },
          { address: '0x000007', bytes: '61 00 24 57', mnemonic: 'PUSH2 0x0024 JUMPI', operands: '' },
          { address: '0x00000b', bytes: '60 00 35 60 e0 1c', mnemonic: 'PUSH1 0x00 CALLDATALOAD PUSH1 0xe0 SHR', operands: '', comment: 'Get selector' },
          { address: '0x000011', bytes: '63 02 2c 0d 62 14', mnemonic: 'PUSH4 0x022c0d62 EQ', operands: '', comment: 'swap(...) selector' },
          { address: '0x000017', bytes: '61 01 a4 57', mnemonic: 'PUSH2 0x01a4 JUMPI', operands: '' }
        ],
        xrefs: [],
        localVariables: []
      }
    ],
    symbols: [
      { name: 'swap(uint256,uint256,address,bytes)', address: '0x022c0d62', type: 'export', size: 248, binding: 'global', section: 'EVM_DISPATCH' },
      { name: 'getReserves()', address: '0x0902f1ac', type: 'export', size: 120, binding: 'global', section: 'EVM_DISPATCH' },
      { name: 'transfer(address,uint256)', address: '0xa9059cbb', type: 'export', size: 84, binding: 'global', section: 'EVM_DISPATCH' }
    ],
    strings: [
      { offset: '0x000840', virtualAddress: '0x00', length: 16, encoding: 'ASCII', value: 'REENTRANCY_GUARD', section: 'CONST', xrefCount: 1 },
      { offset: '0x000860', virtualAddress: '0x00', length: 26, encoding: 'ASCII', value: 'INSUFFICIENT_OUTPUT_AMOUNT', section: 'CONST', xrefCount: 1 }
    ],
    sections: [
      { name: 'Runtime Code', virtualAddress: '0x00000000', virtualSize: '9.4 KB', rawSize: '9.4 KB', fileOffset: '0x00000000', permissions: 'r-x', entropy: 6.8, purpose: 'EVM Instructions' }
    ],
    mitigations: [
      { name: 'Reentrancy Lock', enabled: true, details: 'Storage mutex active on state mutation', severity: 'high' },
      { name: 'SafeTransfer Check', enabled: true, details: 'Verifies return code of external ERC20 calls', severity: 'medium' }
    ],
    hexSample: [
      { offset: 0x0, bytes: [0x60, 0x80, 0x60, 0x40, 0x52, 0x34, 0x80, 0x15, 0x61, 0x00, 0x10, 0x57, 0x60, 0x00, 0x80, 0xfd] }
    ]
  },
  {
    id: 'network_api_har',
    name: 'payment_gateway_api.har',
    kind: 'network_capture',
    architecture: 'HTTP/2 & HTTP/1.1 Captures',
    fileSize: 128450,
    format: 'HTTP Archive (HAR 1.2)',
    sha256: 'c34b1279a0b12984ef123498bcead10928301928409182390182309182390182',
    md5: '9b12a830192840918239018230918239',
    entryPoint: 'https://api.gateway.internal/v2/auth',
    evidence: [
      {
        id: 'ev-net-1',
        category: 'observation',
        summary: 'Bearer JWT token leaked in Query Parameter on GET /v2/receipt',
        details: 'URL contains ?auth_token=eyJhbGciOi... in cleartext. Query strings are stored in browser history and proxy server logs.',
        confidence: 1.0,
        sourceOffset: 'entry[4].request.url',
        sourceEngine: 'rea_static',
        targetSymbol: 'GET /v2/receipt',
        timestamp: '15:32:38'
      },
      {
        id: 'ev-net-2',
        category: 'derivation',
        summary: 'Response time on POST /v2/charge averages 412ms with 98% TLS 1.3 handshake',
        details: 'Calculated across 14 transactions; cipher suite TLS_AES_128_GCM_SHA256.',
        confidence: 0.99,
        sourceOffset: 'timings_aggregation',
        sourceEngine: 'rea_static',
        timestamp: '15:32:40'
      },
      {
        id: 'ev-net-3',
        category: 'inference',
        summary: 'Backend architecture identified as Node.js Express behind Cloudflare edge',
        details: 'Header Server: cloudflare, X-Powered-By: Express, and cookie connect.sid pattern.',
        confidence: 0.92,
        sourceOffset: 'entry[0].response.headers',
        sourceEngine: 'rea_static',
        timestamp: '15:32:42'
      }
    ],
    functions: [],
    symbols: [],
    strings: [],
    sections: [],
    mitigations: [
      { name: 'HSTS (Strict-Transport-Security)', enabled: true, details: 'max-age=31536000; includeSubDomains', severity: 'high' },
      { name: 'CORS Wildcard Check', enabled: false, details: 'Access-Control-Allow-Origin: * on authenticated endpoints', severity: 'high' }
    ],
    hexSample: [],
    metadata: {
      entriesCount: 18,
      totalBytesTransferred: 98450,
      domains: ['api.gateway.internal', 'auth.gateway.internal', 'static.cdn-vault.com'],
      detectedIssues: [
        'Sensitive token exposed in GET query parameters',
        'CORS header allows wildcard origins with credentials flag set',
        'Weak Cache-Control header on account billing endpoint'
      ]
    }
  },
  {
    id: 'sqlite_telemetry',
    name: 'telemetry_store.sqlite',
    kind: 'sqlite_db',
    architecture: 'SQLite Format 3 (WAL mode)',
    fileSize: 65536,
    format: 'SQLite 3 Database',
    sha256: '5e884898da28047151d0e56f8dc6292773603d0d6aabbdd62a11ef721d1542d8',
    md5: '1bc29b36f623ba82aaf6724fd3b16718',
    entryPoint: 'sqlite_master',
    evidence: [
      {
        id: 'ev-sql-1',
        category: 'observation',
        summary: 'Database contains 4 user tables and 3 indices',
        details: 'Tables: sessions, events, crash_reports, config_kv. Page size: 4096 bytes.',
        confidence: 1.0,
        sourceOffset: 'page_header:0x00',
        sourceEngine: 'rea_static',
        timestamp: '15:32:46'
      },
      {
        id: 'ev-sql-2',
        category: 'derivation',
        summary: 'Table "sessions" stores plain text hardware identifiers (MAC, UUID, Hostname)',
        details: 'Column hw_fingerprint contains unhashed MAC addresses formatted XX:XX:XX:XX:XX:XX.',
        confidence: 0.97,
        sourceOffset: 'table:sessions.hw_fingerprint',
        sourceEngine: 'rea_static',
        targetSymbol: 'sessions',
        timestamp: '15:32:48'
      }
    ],
    functions: [],
    symbols: [],
    strings: [],
    sections: [],
    mitigations: [],
    hexSample: [],
    metadata: {
      pageSize: 4096,
      schemaVersion: 4,
      tables: [
        { name: 'sessions', rows: 142, sql: 'CREATE TABLE sessions (id INTEGER PRIMARY KEY, user_id TEXT, hw_fingerprint TEXT, created_at DATETIME, ip_address TEXT);' },
        { name: 'events', rows: 1890, sql: 'CREATE TABLE events (id INTEGER PRIMARY KEY, session_id INTEGER, action_name TEXT, payload_json TEXT, duration_ms REAL);' },
        { name: 'crash_reports', rows: 8, sql: 'CREATE TABLE crash_reports (id INTEGER PRIMARY KEY, crash_time DATETIME, signal INTEGER, backtrace TEXT, memory_usage_mb REAL);' },
        { name: 'config_kv', rows: 34, sql: 'CREATE TABLE config_kv (key TEXT PRIMARY KEY, val_blob BLOB, updated_at DATETIME);' }
      ]
    }
  }
];
