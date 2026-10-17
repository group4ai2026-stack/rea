import React, { useState } from 'react';
import { Search, Hash, Info } from 'lucide-react';

interface HexViewerProps {
  samples: { offset: number; bytes: number[] }[];
  baseAddress?: string;
}

export const HexViewer: React.FC<HexViewerProps> = ({ samples, baseAddress = '0x00401000' }) => {
  const [selectedByte, setSelectedByte] = useState<{ offset: number; value: number } | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  // Fallback demo bytes if target has no explicit hex sample
  const effectiveSamples = samples.length > 0 ? samples : [
    { offset: 0x00, bytes: [0x7f, 0x45, 0x4c, 0x46, 0x02, 0x01, 0x01, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00] },
    { offset: 0x10, bytes: [0x02, 0x00, 0x3e, 0x00, 0x01, 0x00, 0x00, 0x00, 0x20, 0x11, 0x40, 0x00, 0x00, 0x00, 0x00, 0x00] },
    { offset: 0x20, bytes: [0x40, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0xb8, 0x3f, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00] },
    { offset: 0x30, bytes: [0x00, 0x00, 0x00, 0x00, 0x40, 0x00, 0x38, 0x00, 0x0b, 0x00, 0x40, 0x00, 0x1d, 0x00, 0x1c, 0x00] },
    { offset: 0x40, bytes: [0x06, 0x00, 0x00, 0x00, 0x04, 0x00, 0x00, 0x00, 0x40, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00] },
    { offset: 0x50, bytes: [0x40, 0x00, 0x40, 0x00, 0x00, 0x00, 0x00, 0x00, 0x40, 0x00, 0x40, 0x00, 0x00, 0x00, 0x00, 0x00] }
  ];

  const formatOffset = (offset: number) => {
    return '0x' + offset.toString(16).padStart(8, '0');
  };

  const toAscii = (b: number) => {
    return b >= 32 && b <= 126 ? String.fromCharCode(b) : '.';
  };

  return (
    <div className="flex flex-col h-full bg-slate-950 font-mono text-xs rounded-lg border border-slate-800 overflow-hidden">
      {/* Hex Toolbar */}
      <div className="p-2.5 border-b border-slate-800 bg-slate-900/80 flex items-center justify-between gap-3">
        <div className="flex items-center gap-2 text-slate-300">
          <Hash className="w-4 h-4 text-cyan-400" />
          <span className="font-semibold text-slate-200">Raw Binary Inspector</span>
          <span className="text-[11px] text-slate-400">(Base: {baseAddress})</span>
        </div>

        <div className="flex items-center gap-2">
          <div className="relative">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2 top-2" />
            <input
              type="text"
              placeholder="Search hex / ASCII..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="bg-slate-950 border border-slate-700/80 rounded pl-7 pr-2.5 py-1 text-[11px] text-slate-200 focus:outline-none focus:border-cyan-500 w-44"
            />
          </div>
        </div>
      </div>

      {/* Hex Matrix */}
      <div className="flex-1 overflow-auto p-4 select-text">
        <div className="min-w-[620px]">
          {/* Header row */}
          <div className="flex pb-2 border-b border-slate-800/80 text-slate-400 font-semibold select-none">
            <div className="w-24">Offset</div>
            <div className="flex-1 grid grid-cols-16 gap-1 px-4">
              {Array.from({ length: 16 }).map((_, i) => (
                <span key={i} className="text-center">{i.toString(16).toUpperCase().padStart(2, '0')}</span>
              ))}
            </div>
            <div className="w-36 text-center">ASCII Dump</div>
          </div>

          {/* Hex Rows */}
          <div className="space-y-1.5 pt-2">
            {effectiveSamples.map((row) => (
              <div key={row.offset} className="flex items-center hover:bg-slate-900/60 py-0.5 rounded transition">
                {/* Offset */}
                <div className="w-24 text-cyan-400 font-medium select-none">
                  {formatOffset(row.offset)}
                </div>

                {/* 16 Hex Bytes */}
                <div className="flex-1 grid grid-cols-16 gap-1 px-4">
                  {row.bytes.map((byte, idx) => {
                    const isSelected = selectedByte?.offset === row.offset + idx;
                    const isNull = byte === 0;
                    const isPrintable = byte >= 32 && byte <= 126;

                    return (
                      <button
                        key={idx}
                        onClick={() => setSelectedByte({ offset: row.offset + idx, value: byte })}
                        className={`text-center py-0.5 rounded text-[11px] transition ${
                          isSelected
                            ? 'bg-cyan-500 text-slate-950 font-bold'
                            : isNull
                            ? 'text-slate-400 hover:bg-slate-800 hover:text-slate-300'
                            : isPrintable
                            ? 'text-emerald-300 hover:bg-slate-800'
                            : 'text-slate-200 hover:bg-slate-800'
                        }`}
                      >
                        {byte.toString(16).toUpperCase().padStart(2, '0')}
                      </button>
                    );
                  })}
                </div>

                {/* ASCII Representation */}
                <div className="w-36 font-mono text-[11px] text-slate-400 px-2 tracking-widest bg-slate-900/40 rounded border border-slate-800/40">
                  {row.bytes.map((byte) => toAscii(byte)).join('')}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Selected Byte Inspector */}
      {selectedByte && (
        <div className="p-3 border-t border-slate-800 bg-slate-900/90 flex flex-wrap items-center justify-between gap-3 text-[11px]">
          <div className="flex items-center gap-2">
            <Info className="w-4 h-4 text-cyan-400" />
            <span className="text-slate-300 font-semibold">Byte at {formatOffset(selectedByte.offset)}:</span>
          </div>
          <div className="flex items-center gap-4 text-slate-300">
            <div>Hex: <span className="text-cyan-300 font-bold">0x{selectedByte.value.toString(16).toUpperCase().padStart(2, '0')}</span></div>
            <div>Dec: <span className="text-emerald-300 font-bold">{selectedByte.value}</span></div>
            <div>Char: <span className="text-amber-300 font-bold">'{toAscii(selectedByte.value)}'</span></div>
            <div>Binary: <span className="text-purple-300 font-bold">{selectedByte.value.toString(2).padStart(8, '0')}</span></div>
            <div>Signed Int8: <span className="text-slate-200 font-bold">{(selectedByte.value << 24) >> 24}</span></div>
          </div>
        </div>
      )}
    </div>
  );
};
