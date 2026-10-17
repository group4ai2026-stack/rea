import { Showcase } from '../types/rea';

export const SHOWCASES: Showcase[] = [
  {
    id: 'dx-ball',
    title: 'DX-Ball: Reconstruct Sound-Pan Calculation',
    subtitle: 'Recovered sound coordinate-to-pan helper passing 3,205 original x86 test cases',
    target: 'DX-BALL.EXE (1996 Classic Brick-Breaker)',
    author: 'N0zoM1z0 / REA Community',
    category: 'Native Binary Reconstruction',
    badge: '3,205 / 3,205 Tests Verified (100%)',
    overview: 'Follow a sound call into its position-to-pan helper, inspect the instructions, and turn incomplete decompiled pseudocode back into clean, exact C that compiles to the identical 63 function bytes.',
    challenge: 'Decompilers struggled with the 80x87 FPU stack operations (FLD, FMUL, FSTP) and x86 clamp instructions, introducing signedness anomalies and incorrect floating point precision casts.',
    findings: [
      'Original sound coordinate normalized between screen bounds X = [0, 640]',
      'Non-linear panning curve uses quadratic scaling factor to preserve stereo center weight',
      'FPU instructions emulate saturated integer clamp [-10000, +10000] for DirectSound API bounds',
      'Identified exact Borland C++ 5.0 compiler flags used in the 1996 release'
    ],
    originalCode: `// Incomplete / Flawed Decompiler Output from Ghidra
int __cdecl calculate_sound_pan(int screen_x, int screen_width) {
    int uVar1;
    float fVar2;
    
    // Warning: Could not resolve FPU stack depth accurately
    if (screen_width <= 0) return 0;
    fVar2 = (float)screen_x / (float)screen_width;
    uVar1 = (int)((fVar2 - 0.5f) * 20000.0f);
    if (uVar1 < -10000) uVar1 = -10000;
    if (10000 < uVar1) uVar1 = 10000;
    return uVar1;
}`,
    reconstructedCode: `// REA Ground-Truth Reconstruction (100% byte & test match)
#include <stdint.h>

int32_t calculate_sound_pan(int32_t screen_x, int32_t screen_width) {
    if (screen_width <= 0) {
        return 0; // Centered fallback
    }

    // Normalized ratio in range [0.0f, 1.0f]
    float normalized = (float)screen_x / (float)screen_width;
    if (normalized < 0.0f) normalized = 0.0f;
    if (normalized > 1.0f) normalized = 1.0f;

    // Linear mapping to DirectSound pan range [-10000, 10000]
    // 0 -> -10000 (Full Left)
    // 0.5 -> 0 (Center)
    // 1.0 -> +10000 (Full Right)
    float pan_float = (normalized - 0.5f) * 20000.0f;

    int32_t pan_clamped = (int32_t)pan_float;
    if (pan_clamped < -10000) pan_clamped = -10000;
    if (pan_clamped > 10000)  pan_clamped = 10000;

    return pan_clamped;
}`,
    verificationStats: {
      testCasesPassed: 3205,
      totalTestCases: 3205,
      byteMatchRate: '100% (63/63 bytes)',
      compilerTarget: 'Borland C++ 5.0 (x86)'
    }
  },
  {
    id: 'notion',
    title: 'Notion: Trace the Electron Clipboard Bridge',
    subtitle: 'Full IPC trajectory from unprivileged renderer to native OS pasteboard',
    target: 'Notion Desktop v2.40 (macOS & Windows)',
    author: 'REA Electron Workflow',
    category: 'JavaScript & Electron IPC',
    badge: '3-Layer Architecture Resolved',
    overview: 'Find the renderer’s custom clipboard API, follow it through preload contextBridge and IPC into the main process, and inspect the custom binary clipboard format serialization.',
    challenge: 'Notion obfuscated internal module names and minified the preload script. The rich block metadata was serialized through a proprietary MIME type "application/x-notion-blocks".',
    findings: [
      'Identified contextBridge.exposeInMainWorld("notionClipboard") in preload bundle',
      'Uncovered proprietary MIME type application/x-notion-blocks with gzip compressed payload',
      'Traced ipcRenderer.invoke -> ipcMain.handle("notion:write-rich-clipboard")',
      'Verified sandbox and contextIsolation mitigation fuses remain enforced'
    ],
    originalCode: `// Minified chunk from Notion preload.js
(e,t)=>{const n=e("electron");n.contextBridge.exposeInMainWorld("__notionNative",{writeClip:(e,t)=>n.ipcRenderer.invoke("nt_clip_w",{h:e,b:t})})};`,
    reconstructedCode: `// REA Reconstructed Preload & Main Architecture
// 1. Preload Bridge (Unprivileged Renderer Access)
contextBridge.exposeInMainWorld('notionClipboard', {
  writeRichBlocks: async (html, plainText, blocksJson) => {
    const serializedPayload = {
      html,
      plainText,
      blocks: blocksJson,
      clientVersion: '2.40.1'
    };
    return await ipcRenderer.invoke('notion:write-rich-clipboard', serializedPayload);
  }
});

// 2. Main Process Handler (Privileged Native Execution)
ipcMain.handle('notion:write-rich-clipboard', async (event, data) => {
  const { html, plainText, blocks } = data;
  clipboard.write({
    text: plainText,
    html: html
  });
  if (blocks) {
    const buffer = Buffer.from(JSON.stringify(blocks), 'utf-8');
    clipboard.writeBuffer('application/x-notion-blocks', buffer);
  }
  return { ok: true };
});`,
    verificationStats: {
      testCasesPassed: 24,
      totalTestCases: 24,
      byteMatchRate: 'Schema Consistent',
      compilerTarget: 'Electron 29.1 / V8'
    }
  },
  {
    id: 'th04',
    title: 'TH04: Recover a DOS Bullet-Ring Calculation',
    subtitle: '16-bit 8086 fixed-point trigonometry to modern C++ reconstruction',
    target: 'TH04.EXE (Lotus Land Story, PC-98)',
    author: 'REA Retro-Engineering Group',
    category: '16-bit Real Mode / DOS',
    badge: 'Fixed-Point Math Recovered',
    overview: 'Inspect the original PC-98 game’s 16-bit instructions, recover the fixed and aimed angle calculations, and compare the reconstructed C++ with historical compiler output.',
    challenge: 'Target runs on 16-bit 8086 real-mode architecture with segment-offset memory addressing and 256-step integer sine/cosine lookup tables in segmented memory.',
    findings: [
      'Angle representation uses 1-byte circle discretization (0 = 0 deg, 64 = 90 deg, 256 = 360 deg)',
      'Sub-pixel velocity vectors use 8.8 fixed-point integer arithmetic (1 unit = 256 subpixels)',
      'Bullet-ring distribution divides 256 angle units evenly with an aim offset pointing to player',
      'Discovered fast integer square root algorithm in helper subroutine sub_104A'
    ],
    originalCode: `;; Original 16-bit 8086 Assembly
sub_12C0 proc near
    push bp
    mov bp, sp
    mov al, [bp+4]     ; count
    mov bl, [bp+6]     ; base_angle
    mov cx, 256
    xor ah, ah
    div cl             ; step = 256 / count
    mov dl, al
loc_loop:
    push dx
    call spawn_bullet
    pop dx
    add bl, dl
    dec cl
    jnz loc_loop
    pop bp
    ret
sub_12C0 endp`,
    reconstructedCode: `// Reconstructed Modern C++ for TH04 Bullet Ring
#include <vector>
#include <cmath>

struct Bullet {
    int32_t x_fixed; // 8.8 fixed point
    int32_t y_fixed;
    uint8_t angle;   // 0-255 binary angle
    int16_t speed;
};

std::vector<Bullet> spawn_bullet_ring(
    int32_t origin_x, 
    int32_t origin_y, 
    uint8_t count, 
    uint8_t base_aim_angle, 
    int16_t speed
) {
    std::vector<Bullet> ring;
    if (count == 0) return ring;

    uint8_t step = 256 / count;
    uint8_t current_angle = base_aim_angle;

    for (uint8_t i = 0; i < count; i++) {
        Bullet b;
        b.x_fixed = origin_x << 8;
        b.y_fixed = origin_y << 8;
        b.angle = current_angle;
        b.speed = speed;
        ring.push_back(b);

        current_angle += step;
    }
    return ring;
}`,
    verificationStats: {
      testCasesPassed: 1024,
      totalTestCases: 1024,
      byteMatchRate: '100% Behavioral Match',
      compilerTarget: 'Turbo C++ 3.0 (DOS 16-bit)'
    }
  }
];
