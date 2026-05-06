import React from 'react';
import { motion } from 'motion/react';
import { BlockCard } from './BlockCard';
import { BLOCKS } from '../../data/blocks';
import type { CanvasData } from '../../hooks/useCanvases';

// ── Types ─────────────────────────────────────────────────────────────────────

interface CanvasGridProps {
  canvasData: CanvasData;
  selectedBlockId: number | null;
  canvasEntryKey: number;
  onSelectBlock: (id: number) => void;
}

// ── Helpers ───────────────────────────────────────────────────────────────────

function hasContent(canvasData: CanvasData, id: number): boolean {
  const val = canvasData[id];
  return typeof val === 'string' && val.trim() !== '';
}

// ── Component ─────────────────────────────────────────────────────────────────

export function CanvasGrid({ canvasData, selectedBlockId, canvasEntryKey, onSelectBlock }: CanvasGridProps) {
  const blockById = (id: number) => BLOCKS.find((b) => b.id === id)!;

  return (
    <motion.div layout transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }} className="flex-[1.5] xl:flex-[2] w-full flex flex-col gap-5">
      {/* Top 7 blocks (2-row grid) */}
      <div key={canvasEntryKey} className="grid grid-cols-1 md:grid-cols-10 md:grid-rows-[minmax(270px,auto)_minmax(270px,auto)] gap-5">
        <BlockCard index={0} data={blockById(1)} additionalClasses="md:col-span-2 md:row-span-2" isActive={selectedBlockId === 1} hasContent={hasContent(canvasData, 1)} canvasDataValue={canvasData[1] || ''} onClick={() => onSelectBlock(1)} />
        <BlockCard index={1} data={blockById(4)} additionalClasses="md:col-span-2 md:col-start-3 md:row-start-1" isActive={selectedBlockId === 4} hasContent={hasContent(canvasData, 4)} canvasDataValue={canvasData[4] || ''} onClick={() => onSelectBlock(4)} />
        <BlockCard index={2} data={blockById(8)} additionalClasses="md:col-span-2 md:col-start-3 md:row-start-2" isActive={selectedBlockId === 8} hasContent={hasContent(canvasData, 8)} canvasDataValue={canvasData[8] || ''} onClick={() => onSelectBlock(8)} />
        <BlockCard index={3} data={blockById(3)} additionalClasses="md:col-span-2 md:col-start-5 md:row-span-2" isActive={selectedBlockId === 3} hasContent={hasContent(canvasData, 3)} canvasDataValue={canvasData[3] || ''} onClick={() => onSelectBlock(3)} />
        <BlockCard index={4} data={blockById(9)} additionalClasses="md:col-span-2 md:col-start-7 md:row-start-1" isActive={selectedBlockId === 9} hasContent={hasContent(canvasData, 9)} canvasDataValue={canvasData[9] || ''} onClick={() => onSelectBlock(9)} />
        <BlockCard index={5} data={blockById(5)} additionalClasses="md:col-span-2 md:col-start-7 md:row-start-2" isActive={selectedBlockId === 5} hasContent={hasContent(canvasData, 5)} canvasDataValue={canvasData[5] || ''} onClick={() => onSelectBlock(5)} />
        <BlockCard index={6} data={blockById(2)} additionalClasses="md:col-span-2 md:col-start-9 md:row-span-2" isActive={selectedBlockId === 2} hasContent={hasContent(canvasData, 2)} canvasDataValue={canvasData[2] || ''} onClick={() => onSelectBlock(2)} />
      </div>

      {/* Bottom 2 blocks */}
      <div key={`${canvasEntryKey}-bottom`} className="grid grid-cols-1 md:grid-cols-10 gap-5">
        <BlockCard index={7} data={blockById(7)} additionalClasses="md:col-span-5 md:h-[230px]" isActive={selectedBlockId === 7} hasContent={hasContent(canvasData, 7)} canvasDataValue={canvasData[7] || ''} onClick={() => onSelectBlock(7)} />
        <BlockCard index={8} data={blockById(6)} additionalClasses="md:col-span-5 md:h-[230px]" isActive={selectedBlockId === 6} hasContent={hasContent(canvasData, 6)} canvasDataValue={canvasData[6] || ''} onClick={() => onSelectBlock(6)} />
      </div>
    </motion.div>
  );
}
