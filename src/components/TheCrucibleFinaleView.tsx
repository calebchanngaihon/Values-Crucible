import React, { useRef } from 'react';
import { motion } from 'motion/react';
import { ValueNode } from '../types';
import { toPng } from 'html-to-image';
import jsPDF from 'jspdf';

interface TheCrucibleFinaleViewProps {
  coreValues: ValueNode[];
  allValues: ValueNode[];
  dilemma: string;
  hardenedDefinitions: Record<string, string>;
  operationalRule: string;
  quenchingAssignments: { drive: string; base: string; flow: string };
  manifesto: string;
  userName?: string;
}

export const TheCrucibleFinaleView: React.FC<TheCrucibleFinaleViewProps> = ({
  coreValues,
  allValues,
  dilemma,
  hardenedDefinitions,
  operationalRule,
  quenchingAssignments,
  manifesto,
  userName = "User",
}) => {
  const printRef = useRef<HTMLDivElement>(null);

  const getPoleName = (pole: number) => {
    const names: Record<number, string> = {
      1: 'Self-Direction',
      2: 'Stimulation',
      3: 'Hedonism',
      4: 'Achievement',
      5: 'Power',
      6: 'Security',
      7: 'Conformity',
      8: 'Tradition',
      9: 'Benevolence',
      10: 'Universalism'
    };
    return names[pole] || 'Unknown';
  };

  const handleExportPDF = async () => {
    if (!printRef.current) return;

    try {
      const dataUrl = await toPng(printRef.current, { 
        cacheBust: true,
        pixelRatio: 2,
        backgroundColor: '#FFFFFF',
      });

      const pdf = new jsPDF({
        orientation: 'portrait',
        unit: 'px',
        format: [800, printRef.current.offsetHeight]
      });

      pdf.addImage(dataUrl, 'PNG', 0, 0, 800, printRef.current.offsetHeight);
      const dateStr = new Date().toISOString().split('T')[0];
      pdf.save(`Crucible_Blueprint_${userName}_${dateStr}.pdf`);
    } catch (err) {
      console.error("PDF generation failed", err);
    }
  };

  let cleanManifesto = manifesto.includes('[YOUR CRUCIBLE]') 
    ? manifesto.split('[YOUR CRUCIBLE]')[1].trim() 
    : manifesto;

  // Sometimes the AI might output a preamble even without [YOUR CRUCIBLE], or attach it. 
  // Let's strip out common conversational filler if it's there.
  cleanManifesto = cleanManifesto.replace(/^.*Here is your final( operating)? algorithm/i, '').trim();
  cleanManifesto = cleanManifesto.replace(/^.*Here is your final.*?"/i, '"').trim();
  cleanManifesto = cleanManifesto.replace(/^"|"/g, '').trim(); // strip leading/trailing quotes

  return (
    <motion.div 
      initial={{ opacity: 0 }} 
      animate={{ opacity: 1 }} 
      className="flex-1 flex flex-col p-4 md:p-8 max-w-4xl mx-auto w-full text-zinc-100 font-sans h-full overflow-y-auto"
    >
      <header className="mb-12">
        <span className="font-mono text-xs text-zinc-500 uppercase tracking-widest block mb-4">
          [FINAL SYSTEM STATE // VERIFIED]
        </span>
        <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight uppercase mb-8">
          Your Crucible
        </h1>

        <div className="bg-[#18181b] border border-[#27272a] rounded-xl p-6 md:p-8 shadow-xl">
          <p className="text-xl md:text-2xl text-zinc-100 font-sans leading-relaxed tracking-tight">
            "{cleanManifesto}"
          </p>
        </div>
      </header>

      <div className="mb-12">
        <h3 className="font-mono text-xs text-blue-500 uppercase tracking-widest mb-8 pb-4 border-b border-zinc-800">
          The Mechanical Breakdown
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {[
            { role: 'THE DRIVE', value: quenchingAssignments.drive },
            { role: 'THE BASE', value: quenchingAssignments.base },
            { role: 'THE FLOW', value: quenchingAssignments.flow }
          ].map(({ role, value }) => {
            const valueObj = coreValues.find(v => v.label === value);
            return (
              <div key={role} className="flex flex-col bg-zinc-900/50 border border-zinc-800 p-6 rounded-2xl shadow-sm">
                <span className="font-mono text-[10px] text-zinc-500 uppercase tracking-widest mb-2 block">
                  [{role}]
                </span>
                <span className="font-bold text-xl text-zinc-100 mb-4 block">
                  {value || 'Unassigned'}
                </span>
                {valueObj && hardenedDefinitions[valueObj.id] && (
                  <p className="text-sm text-zinc-400 leading-relaxed font-sans border-t border-zinc-800/50 pt-4 mt-auto">
                    {hardenedDefinitions[valueObj.id]}
                  </p>
                )}
              </div>
            );
          })}
        </div>
      </div>

      <div className="mb-12">
         <h3 className="font-mono text-xs text-blue-500 uppercase tracking-widest mb-8 pb-4 border-b border-zinc-800">
          The Crucible (The Dilemma)
        </h3>
        <div className="bg-[#09090b] border border-[#27272a] p-6 rounded-xl shadow-sm text-zinc-300 text-sm leading-relaxed mb-6 font-serif">
          {dilemma}
        </div>
        <div className="bg-[#18181b] border border-zinc-800 p-6 rounded-xl text-zinc-300 text-sm leading-relaxed font-serif border-l-2 border-l-blue-500">
           {operationalRule}
        </div>
      </div>

      <div className="mb-12">
         <h3 className="font-mono text-xs text-blue-500 uppercase tracking-widest mb-8 pb-4 border-b border-zinc-800">
          Complete Value Stack
        </h3>
        <div className="flex flex-wrap gap-2">
           {[...allValues].sort((a, b) => {
             const aCore = coreValues.some(cv => cv.id === a.id);
             const bCore = coreValues.some(cv => cv.id === b.id);
             if (aCore && !bCore) return -1;
             if (!aCore && bCore) return 1;
             
             if (a.status === 'resonated' && b.status !== 'resonated') return -1;
             if (a.status !== 'resonated' && b.status === 'resonated') return 1;

             return b.elo - a.elo;
           }).map((v, i) => {
             const isCore = coreValues.some(cv => cv.id === v.id);
             const isPruned = v.status === 'discarded';
             return (
               <div key={v.id} title={`ELO: ${Math.round(v.elo)}`} className={`px-3 py-1.5 rounded-full text-xs font-mono uppercase tracking-widest border ${isCore ? 'bg-blue-900/20 border-blue-500/50 text-blue-400' : (isPruned ? 'bg-[#09090b]/50 border-[#27272a]/50 text-zinc-600 line-through' : 'bg-[#09090b] border-[#27272a] text-zinc-400')}`}>
                 {i + 1}. {v.label}
               </div>
             )
           })}
        </div>
      </div>

      <div className="mt-auto pt-8 border-t border-zinc-800 flex justify-center">
        <button
          onClick={handleExportPDF}
          className="px-8 py-4 bg-white text-black font-mono text-xs uppercase font-bold tracking-widest rounded transition-transform hover:scale-105 shadow-xl"
        >
          [GENERATE SYSTEM BLUEPRINT (.PDF)]
        </button>
      </div>

      {/* HIDDEN PRINT DOCUMENT */}
      <div className="absolute -left-[9999px] top-0">
        <div 
          ref={printRef} 
          style={{ backgroundColor: '#FFFFFF', color: '#000000', padding: '60px', width: '800px', WebkitPrintColorAdjust: 'exact', printColorAdjust: 'exact' }}
          className="font-sans"
        >
          <div className="flex justify-between items-start mb-12 font-mono text-xs pb-4" style={{ color: '#000000', borderBottom: '2px solid #000000' }}>
          <span className="uppercase tracking-widest font-bold">CRUCIBLE // SYSTEM BLUEPRINT</span>
          <span className="uppercase tracking-widest">{new Date().toLocaleDateString()}</span>
        </div>

        <h1 className="text-[40px] font-bold uppercase tracking-tight mb-4 text-center">
          OPERATING ARCHITECTURE
        </h1>
        <div className="w-full h-[2px] mb-12" style={{ backgroundColor: '#000000' }}></div>

        {/* Section 01: THE SOVEREIGNTY TRIAD */}
        <div className="mb-12">
          <h2 className="font-mono text-sm uppercase tracking-widest font-bold mb-6">Section 01: The Sovereignty Triad</h2>
          <div className="flex justify-between items-center p-6 rounded" style={{ backgroundColor: '#F9FAFB', border: '1px solid #E5E7EB' }}>
            {coreValues.map((v) => (
              <div key={v.id} className="text-center w-1/3 px-2">
                <div className="font-bold text-lg uppercase mb-1">{v.label}</div>
                <div className="font-mono text-xs uppercase tracking-widest" style={{ color: '#6B7280' }}>[{getPoleName(v.pole)}]</div>
              </div>
            ))}
          </div>
        </div>

        {/* Section 02: THE HONING (DEFINITIONS) */}
        <div className="mb-12">
          <h2 className="font-mono text-sm uppercase tracking-widest font-bold mb-6">Section 02: The Honing (Anchor Statements)</h2>
          <div className="space-y-6">
            {coreValues.map((v) => (
              <div key={`def-${v.id}`} className="pl-4 py-1" style={{ borderLeft: '4px solid #D1D5DB' }}>
                <h3 className="font-bold text-sm uppercase mb-2">{v.label}</h3>
                <p className="text-sm leading-relaxed font-serif" style={{ color: '#1F2937' }}>
                  {hardenedDefinitions[v.id] || "No definition recorded."}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* Section 03: THE ANVIL (IF/THEN DIRECTIVES) */}
        <div className="mb-12">
          <h2 className="font-mono text-sm uppercase tracking-widest font-bold mb-6">Section 03: The Anvil (Operational Directive)</h2>
          <div className="p-6 rounded text-sm leading-relaxed font-serif" style={{ backgroundColor: '#F9FAFB', border: '1px solid #E5E7EB', color: '#1F2937' }}>
            {/* Find and bold IF and THEN */}
            {operationalRule ? (
              <div dangerouslySetInnerHTML={{ 
                __html: operationalRule
                  .replace(/\bIF\b/g, '<strong>IF</strong>')
                  .replace(/\bTHEN\b/g, '<strong>THEN</strong>') 
              }} />
            ) : "No directive recorded."}
          </div>
        </div>

        {/* Section 04: THE QUENCHING (FUNCTIONAL HIERARCHY) */}
        <div className="mb-12">
          <h2 className="font-mono text-sm uppercase tracking-widest font-bold mb-6">Section 04: The Quenching (Functional Hierarchy)</h2>
          <div className="space-y-4 font-mono text-sm">
            <div className="flex pb-2" style={{ borderBottom: '1px solid #E5E7EB' }}>
              <span className="w-64 font-bold uppercase" style={{ color: '#4B5563' }}>THE DRIVE:</span>
              <span className="font-bold uppercase">{quenchingAssignments.drive || 'Unassigned'}</span>
            </div>
            <div className="flex pb-2" style={{ borderBottom: '1px solid #E5E7EB' }}>
              <span className="w-64 font-bold uppercase" style={{ color: '#4B5563' }}>THE BASE:</span>
              <span className="font-bold uppercase">{quenchingAssignments.base || 'Unassigned'}</span>
            </div>
            <div className="flex pb-2" style={{ borderBottom: '1px solid #E5E7EB' }}>
              <span className="w-64 font-bold uppercase" style={{ color: '#4B5563' }}>THE FLOW:</span>
              <span className="font-bold uppercase">{quenchingAssignments.flow || 'Unassigned'}</span>
            </div>
          </div>
        </div>

        <div className="mt-16">
          <h2 className="font-mono text-sm uppercase tracking-widest font-bold mb-6">Section 05: The Complete Value Stack</h2>
          <div className="flex flex-wrap gap-2">
            {[...allValues].sort((a, b) => {
              const aCore = coreValues.some(cv => cv.id === a.id);
              const bCore = coreValues.some(cv => cv.id === b.id);
              if (aCore && !bCore) return -1;
              if (!aCore && bCore) return 1;
              if (a.status === 'resonated' && b.status !== 'resonated') return -1;
              if (a.status !== 'resonated' && b.status === 'resonated') return 1;
              return b.elo - a.elo;
            }).map((v, i) => {
              const isCore = coreValues.some(cv => cv.id === v.id);
              const isPruned = v.status === 'discarded';
              return (
                <div key={v.id} style={{ 
                  padding: '4px 8px', 
                  fontSize: '11px', 
                  border: isCore ? '1px solid #3B82F6' : (isPruned ? '1px solid #E5E7EB' : '1px solid #D1D5DB'),
                  backgroundColor: isCore ? '#EFF6FF' : (isPruned ? '#F9FAFB' : '#F3F4F6'),
                  color: isCore ? '#1D4ED8' : (isPruned ? '#9CA3AF' : '#4B5563'),
                  borderRadius: '9999px',
                  textDecoration: isPruned ? 'line-through' : 'none',
                }}>
                  {i + 1}. {v.label}
                </div>
              )
            })}
          </div>
        </div>

        {/* Section 06: COMMAND LOGIC */}
        <div className="mt-16">
          <h2 className="font-mono text-sm uppercase tracking-widest font-bold mb-6">Section 06: Command Logic</h2>
          <div className="p-8 text-center rounded" style={{ backgroundColor: '#F3F4F6', border: '2px solid #D1D5DB' }}>
            <p className="text-[18pt] font-serif leading-relaxed font-bold" style={{ color: '#000000' }}>
              "{cleanManifesto}"
            </p>
          </div>
        </div>

      </div>
      </div>
    </motion.div>
  );
};
