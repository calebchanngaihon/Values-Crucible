import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ValueNode } from '../types';
import { ClinicalScribe } from './ClinicalScribe';
import { Lock, HelpCircle } from 'lucide-react';

import { TheCrucibleFinaleView } from './TheCrucibleFinaleView';

interface TheTemperingProps {
  coreValues: ValueNode[];
  allValues: ValueNode[];
  onSubStageChange?: (title: string) => void;
}

type TemperingStage = 'STAGE_01_HONING' | 'STAGE_02_ANVIL' | 'STAGE_03_QUENCHING' | 'MANIFESTO_SEALED';

export const TheTempering: React.FC<TheTemperingProps> = ({ coreValues, allValues, onSubStageChange }) => {
  const [initialData] = useState(() => {
    const saved = localStorage.getItem('tempering_state');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        console.error('Failed to parse saved tempering state', e);
      }
    }
    return {};
  });

  const [stage, setStage] = useState<TemperingStage>(initialData.stage || 'STAGE_01_HONING');
  
  useEffect(() => {
    if (onSubStageChange) {
      if (stage === 'STAGE_01_HONING') onSubStageChange('Tempering - Honing');
      else if (stage === 'STAGE_02_ANVIL') onSubStageChange('Tempering - Anvil');
      else if (stage === 'STAGE_03_QUENCHING' || stage === 'MANIFESTO_SEALED') onSubStageChange('Tempering - Quenching');
    }
  }, [stage, onSubStageChange]);
  
  // STATE FOR 01: Honing
  const [honingIndex, setHoningIndex] = useState<number>(initialData.honingIndex !== undefined ? initialData.honingIndex : 0);
  const [iteration, setIteration] = useState<number>(initialData.iteration !== undefined ? initialData.iteration : 1);
  const [userInput, setUserInput] = useState<string>(initialData.userInput !== undefined ? initialData.userInput : '');
  const [honingPayload, setHoningPayload] = useState<any>(initialData.honingPayload !== undefined ? initialData.honingPayload : null);
  const [honingStatus, setHoningStatus] = useState<'idle' | 'processing' | 'needs_refinement' | 'completed'>(initialData.honingStatus !== undefined ? initialData.honingStatus : 'idle');
  const [hardenedDefinitions, setHardenedDefinitions] = useState<Record<string, string>>(initialData.hardenedDefinitions !== undefined ? initialData.hardenedDefinitions : {});
  const [honingHistory, setHoningHistory] = useState<{user: string, ai: string | null}[]>(initialData.honingHistory !== undefined ? initialData.honingHistory : []);

  // STATE FOR 02: Anvil
  const [anvilStep, setAnvilStep] = useState<'generate' | 'respond' | 'evaluate' | 'completed' | 'rejected'>(initialData.anvilStep !== undefined ? initialData.anvilStep : 'generate');
  const [anvilValA, setAnvilValA] = useState<string>(initialData.anvilValA !== undefined ? initialData.anvilValA : (coreValues[0]?.label || ''));
  const [anvilValB, setAnvilValB] = useState<string>(initialData.anvilValB !== undefined ? initialData.anvilValB : (coreValues[1]?.label || ''));
  const [anvilHistory, setAnvilHistory] = useState<{user: string, ai: string | null}[]>(initialData.anvilHistory !== undefined ? initialData.anvilHistory : []);
  const [dilemma, setDilemma] = useState<string>(initialData.dilemma !== undefined ? initialData.dilemma : '');
  const [anvilInput, setAnvilInput] = useState<string>(initialData.anvilInput !== undefined ? initialData.anvilInput : '');
  const [anvilPayload, setAnvilPayload] = useState<any>(initialData.anvilPayload !== undefined ? initialData.anvilPayload : null);
  const [operationalRule, setOperationalRule] = useState<string>(initialData.operationalRule !== undefined ? initialData.operationalRule : '');

  // STATE FOR 03: Quenching
  const [quenchingStep, setQuenchingStep] = useState<'prompt' | 'respond' | 'evaluate' | 'completed' | 'rejected'>(initialData.quenchingStep !== undefined ? initialData.quenchingStep : 'respond');
  const [quenchingHistory, setQuenchingHistory] = useState<{user: string, ai: string | null}[]>(initialData.quenchingHistory !== undefined ? initialData.quenchingHistory : []);
  const [quenchingInput, setQuenchingInput] = useState<string>(initialData.quenchingInput !== undefined ? initialData.quenchingInput : '');
  const [quenchingPrompt, setQuenchingPrompt] = useState<string>(initialData.quenchingPrompt !== undefined ? initialData.quenchingPrompt : '');
  const [quenchingPayload, setQuenchingPayload] = useState<any>(initialData.quenchingPayload !== undefined ? initialData.quenchingPayload : null);
  const [manifesto, setManifesto] = useState<string>(initialData.manifesto !== undefined ? initialData.manifesto : '');
  const [sealProgress, setSealProgress] = useState(0);
  const [quenchingAssignments, setQuenchingAssignments] = useState(initialData.quenchingAssignments !== undefined ? initialData.quenchingAssignments : {drive: '', base: '', flow: ''});
  const [showGuide, setShowGuide] = useState<boolean>(initialData.showGuide !== undefined ? initialData.showGuide : false);

  // Auto-Save Effect
  useEffect(() => {
    const dataToSave = {
      stage,
      honingIndex,
      iteration,
      userInput,
      honingPayload,
      honingStatus,
      hardenedDefinitions,
      honingHistory,
      anvilStep,
      anvilValA,
      anvilValB,
      anvilHistory,
      dilemma,
      anvilInput,
      anvilPayload,
      operationalRule,
      quenchingStep,
      quenchingHistory,
      quenchingInput,
      quenchingPrompt,
      quenchingPayload,
      manifesto,
      quenchingAssignments,
      showGuide
    };
    localStorage.setItem('tempering_state', JSON.stringify(dataToSave));
  }, [
    stage,
    honingIndex,
    iteration,
    userInput,
    honingPayload,
    honingStatus,
    hardenedDefinitions,
    honingHistory,
    anvilStep,
    anvilValA,
    anvilValB,
    anvilHistory,
    dilemma,
    anvilInput,
    anvilPayload,
    operationalRule,
    quenchingStep,
    quenchingHistory,
    quenchingInput,
    quenchingPrompt,
    quenchingPayload,
    manifesto,
    quenchingAssignments,
    showGuide
  ]);

  useEffect(() => {
    const fn_jump = ((e: CustomEvent) => {
       const targetStage = e.detail;
       if (targetStage === 'STAGE_01_HONING' || targetStage === 'STAGE_02_ANVIL' || targetStage === 'STAGE_03_QUENCHING') {
         setStage(targetStage as TemperingStage);
         if (targetStage === 'STAGE_02_ANVIL' || targetStage === 'STAGE_03_QUENCHING') {
             // prepopulate definitions if missing
             setHardenedDefinitions(prev => {
                const draft = { ...prev };
                coreValues.forEach(v => {
                   if (!draft[v.id]) draft[v.id] = `[${v.label}]: A strict protocol of acting deliberately despite friction, forcing alignment between stated intent and daily execution in all contexts.`;
                });
                return draft;
             });
         }
       }
    }) as EventListener;

    const fn_reset = () => {
      localStorage.removeItem('tempering_state');
      setStage(current => {
        if (current === 'STAGE_01_HONING') {
          setHoningIndex(0);
          setIteration(1);
          setUserInput('');
          setHoningPayload(null);
          setHoningStatus('idle');
          setHardenedDefinitions({});
          setHoningHistory([]);
        } else if (current === 'STAGE_02_ANVIL') {
          setAnvilStep('generate');
          setAnvilValA(coreValues[0]?.label || '');
          setAnvilValB(coreValues[1]?.label || '');
          setAnvilHistory([]);
          setDilemma('');
          setAnvilInput('');
          setAnvilPayload(null);
          setOperationalRule('');
        } else if (current === 'STAGE_03_QUENCHING') {
          setQuenchingStep('respond');
          setQuenchingHistory([]);
          setQuenchingInput('');
          setQuenchingPrompt('');
          setQuenchingPayload(null);
          setManifesto('');
          setQuenchingAssignments({drive: '', base: '', flow: ''});
        }
        return current;
      });
    };

    window.addEventListener('DEV_JUMP_TEMPERING', fn_jump);
    window.addEventListener('RESET_TEMPERING_STAGE', fn_reset);
    return () => {
      window.removeEventListener('DEV_JUMP_TEMPERING', fn_jump);
      window.removeEventListener('RESET_TEMPERING_STAGE', fn_reset);
    };
  }, [coreValues]);

  // === STAGE 01 CONTROLLERS ===
  const handleHoningSubmit = () => {
    if (!userInput.trim()) return;
    const currentVal = coreValues[honingIndex];
    setHoningStatus('processing');
    
    setHoningHistory(prev => [...prev, { user: userInput, ai: null }]);
    
    setHoningPayload({
      valueLabel: currentVal.label,
      currentDefinition: userInput,
      iteration: iteration,
      history: honingHistory.map((h, i) => `Iter ${i+1} User: ${h.user}\nIter ${i+1} AI: ${h.ai || ''}`).join('\n')
    });
  };

  const handleHoningTypingComplete = (text: string) => {
    if (text.includes('ERROR:')) {
      setHoningStatus('needs_refinement');
      setHoningHistory(prev => {
        const next = [...prev];
        next[next.length - 1].ai = text;
        return next;
      });
      return;
    }

    const isLogged = text.includes('[HARDENED DEFINITION LOGGED]');

    setHoningHistory(prev => {
      const next = [...prev];
      next[next.length - 1].ai = text.replace('[HARDENED DEFINITION LOGGED]:', '').replace('[HARDENED DEFINITION LOGGED]', '').trim();
      return next;
    });

    if (isLogged) {
       const loggedDef = text.replace('[HARDENED DEFINITION LOGGED]:', '').replace('[HARDENED DEFINITION LOGGED]', '').trim();
       setHardenedDefinitions(prev => ({
         ...prev,
         [coreValues[honingIndex].id]: loggedDef || userInput
       }));
       setHoningStatus('completed');
    } else {
       setHoningStatus('needs_refinement');
       setIteration(i => i + 1);
       setUserInput('');
    }
  };

  const handleNextHoningValue = () => {
    if (honingIndex < coreValues.length - 1) {
      setHoningIndex(i => i + 1);
      setIteration(1);
      setUserInput('');
      setHoningPayload(null);
      setHoningStatus('idle');
      setHoningHistory([]);
    } else {
      setStage('STAGE_02_ANVIL');
    }
  };

  // === STAGE 02 CONTROLLERS ===
  useEffect(() => {
    if (stage === 'STAGE_02_ANVIL' && anvilStep === 'generate' && !anvilPayload && !dilemma) {
      setAnvilPayload({
        step: 'generate_dilemma',
        value1: anvilValA,
        value2: anvilValB,
        anchor1: hardenedDefinitions[coreValues[0].id],
        anchor2: hardenedDefinitions[coreValues[1].id]
      });
    }
  }, [stage, anvilStep, anvilPayload, anvilValA, anvilValB, dilemma, hardenedDefinitions, coreValues]);

  const handleAnvilGenerateTypingComplete = (text: string) => {
    if (text && !text.includes('ERROR:')) {
      setDilemma(text);
      setAnvilStep('respond');
      setAnvilPayload(null);
    }
  };

  const handleAnvilSubmit = () => {
    if (!anvilInput.trim()) return;
    setAnvilStep('evaluate');
    setAnvilHistory(prev => [...prev, { user: anvilInput, ai: null }]);
    setAnvilPayload({
      step: 'evaluate',
      value1: anvilValA,
      value2: anvilValB,
      scenario: dilemma,
      userResponse: anvilInput,
      history: anvilHistory.map((h, i) => `User: ${h.user}\nAI: ${h.ai || ''}`).join('\n')
    });
    setAnvilInput('');
  };

  const handleAnvilEvaluateTypingComplete = (text: string) => {
    if (text.includes('[OPERATIONAL DIRECTIVE]')) {
      const rule = text.replace('[OPERATIONAL DIRECTIVE]', '').replace(':', '').trim();
      setAnvilHistory(prev => {
        const next = [...prev];
        next[next.length - 1].ai = text;
        return next;
      });
      setOperationalRule(rule);
      setAnvilStep('completed');
    } else {
      setAnvilHistory(prev => {
        const next = [...prev];
        next[next.length - 1].ai = text;
        return next;
      });
      setAnvilStep('rejected');
    }
  };

  const retryAnvil = () => {
    setAnvilStep('respond');
    setAnvilInput('');
    setAnvilPayload(null);
  };

  const proceedToQuenching = () => {
    setStage('STAGE_03_QUENCHING');
    setQuenchingStep('respond');
  };

  // === STAGE 03 CONTROLLERS ===
  useEffect(() => {
    if (stage === 'STAGE_03_QUENCHING' && quenchingStep === 'prompt' && !quenchingPayload && !quenchingPrompt) {
      setQuenchingPayload({
        step: 'prompt',
        values: coreValues.map(v => v.label)
      });
    }
  }, [stage, quenchingStep, quenchingPayload, quenchingPrompt, coreValues]);

  const handleQuenchingPromptTypingComplete = (text: string) => {
    if (text && !text.includes('ERROR:')) {
      setQuenchingPrompt(text);
      setQuenchingStep('respond');
      setQuenchingPayload(null);
    }
  };

  const handleQuenchingSubmit = () => {
    if (!quenchingInput.trim() || !quenchingAssignments.drive || !quenchingAssignments.base || !quenchingAssignments.flow) return;
    setQuenchingStep('evaluate');
    const formattedResponse = `Assignments:
- The Drive: ${quenchingAssignments.drive}
- The Base: ${quenchingAssignments.base}
- The Flow: ${quenchingAssignments.flow}

Explanation: ${quenchingInput}`;
    setQuenchingHistory(prev => [...prev, { user: formattedResponse, ai: null }]);
    setQuenchingPayload({
      step: 'evaluate',
      values: coreValues.map(v => v.label),
      userResponse: formattedResponse,
      history: quenchingHistory.map((h, i) => `User: ${h.user}\nAI: ${h.ai || ''}`).join('\n')
    });
  };

  const handleQuenchingEvaluateTypingComplete = (text: string) => {
    if (text.includes('[YOUR CRUCIBLE]')) {
      const result = text.replace('[YOUR CRUCIBLE]', '').replace(':', '').trim();
      setQuenchingHistory(prev => {
        const next = [...prev];
        next[next.length - 1].ai = text;
        return next;
      });
      setManifesto(result);
      setQuenchingStep('completed');
    } else {
      setQuenchingHistory(prev => {
        const next = [...prev];
        next[next.length - 1].ai = text;
        return next;
      });
      setQuenchingStep('rejected');
    }
  };

  const retryQuenching = () => {
    setQuenchingStep('respond');
    setQuenchingInput('');
    setQuenchingPayload(null);
  };

  // Seal Interaction
  useEffect(() => {
    let interval: any;
    if (sealProgress > 0 && sealProgress < 100) {
      interval = setInterval(() => {
        setSealProgress(s => Math.min(s + 5, 100));
      }, 75); // 1.5 seconds approx
    } else if (sealProgress === 100 && stage !== 'MANIFESTO_SEALED') {
      setStage('MANIFESTO_SEALED');
    }
    return () => clearInterval(interval);
  }, [sealProgress, stage]);

  const startSeal = () => {
    if (sealProgress === 0) setSealProgress(1);
  };
  const cancelSeal = () => {
    if (sealProgress < 100) setSealProgress(0);
  };


  return (
    <div className="flex-1 flex flex-col p-4 md:p-8 max-w-5xl mx-auto w-full text-zinc-100 font-sans h-full overflow-y-auto">
      
      <AnimatePresence mode="wait">
        
        {/* ================================================== */}
        {/* STAGE 01: HONING */}
        {/* ================================================== */}
        {stage === 'STAGE_01_HONING' && (
          <motion.div key="stage1" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="w-full max-w-3xl mx-auto py-12">
            <header className="mb-12">
              <span className="font-mono text-[10px] text-zinc-500 uppercase tracking-[0.2em] block mb-2">[Stage 01]</span>
              <h1 className="text-3xl font-extrabold tracking-tight uppercase">The Honing</h1>
              <p className="text-zinc-400 text-sm mt-3 leading-relaxed">
                A dictionary definition is useless. Define this value in <span className="text-blue-500">experiential</span> terms to you. What does it mean to you and what does it look like when you live it?
              </p>
            </header>

            <div className="bg-[#18181b] border border-[#27272a] rounded-xl p-8 mb-8">
              <div className="text-xs text-blue-500 font-mono mb-4 uppercase">
                Focus Value {honingIndex + 1}/{coreValues.length}
              </div>
              <h2 className="text-4xl font-bold uppercase mb-2">{coreValues[honingIndex].label}</h2>
              <p className="text-sm text-zinc-500 mb-8 italic">Initial definition: "{coreValues[honingIndex].simpleDefinition}"</p>

              <div className="space-y-6 mb-8">
                {honingHistory.map((item, idx) => {
                  const isLast = idx === honingHistory.length - 1;
                  return (
                    <div key={idx} className="space-y-4">
                      <div className="bg-[#09090b] border border-[#27272a] p-4 rounded-lg">
                        <div className="text-[10px] text-zinc-500 mb-2 uppercase tracking-widest">Iteration 0{idx + 1} // You</div>
                        <p className="text-zinc-300 font-mono text-xs whitespace-pre-wrap">{item.user}</p>
                      </div>
                      
                      {item.ai && (
                        <div className="font-mono text-sm leading-relaxed text-zinc-300 bg-black p-6 rounded-lg border border-zinc-800 shadow-inner">
                          <div className="text-[10px] text-blue-500 mb-4 uppercase tracking-widest bg-blue-500/10 inline-block px-2 py-1 rounded">
                            COGNITIVE MIRROR
                          </div>
                          <div className="whitespace-pre-wrap">{item.ai}</div>
                        </div>
                      )}

                      {isLast && !item.ai && honingPayload && honingStatus === 'processing' && (
                        <ClinicalScribe 
                          key={`honing-${honingIndex}-${honingPayload.iteration}`}
                          apiEndpoint="/api/honing"
                          payload={honingPayload}
                          trigger={true}
                          onTypingComplete={handleHoningTypingComplete}
                        />
                      )}
                    </div>
                  );
                })}
              </div>

              {honingStatus === 'completed' && (
                <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="mt-8 flex justify-end">
                  <button 
                    onClick={handleNextHoningValue}
                    className="px-6 py-2 bg-blue-600 text-white hover:bg-blue-500 font-mono text-[10px] uppercase font-bold tracking-widest rounded-full transition-all"
                  >
                    Proceed to Next Value
                  </button>
                </motion.div>
              )}

              {(honingStatus === 'idle' || honingStatus === 'needs_refinement') && (
                <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="mt-6 flex flex-col items-end gap-4">
                   <textarea 
                     value={userInput}
                     onChange={(e) => setUserInput(e.target.value)}
                     className="w-full bg-[#09090b] border border-[#27272a] text-zinc-100 p-4 rounded-lg focus:outline-none focus:border-blue-500/50 font-mono text-xs resize-none h-32 transition-colors"
                     placeholder={iteration === 1 ? `Define ${coreValues[honingIndex].label} by a past action or memory...` : `Iteration 0${iteration} / Refine your definition based on the feedback...`}
                   />
                   <button 
                     onClick={handleHoningSubmit}
                     disabled={!userInput.trim() || honingStatus === 'processing'}
                     className="px-6 py-2 bg-zinc-100 text-zinc-950 hover:bg-white disabled:opacity-50 disabled:cursor-not-allowed font-mono text-[10px] uppercase font-bold tracking-widest rounded-full transition-all"
                   >
                     Submit to Mirror
                   </button>
                </motion.div>
              )}
            </div>
          </motion.div>
        )}

        {/* ================================================== */}
        {/* STAGE 02: ANVIL */}
        {/* ================================================== */}
        {stage === 'STAGE_02_ANVIL' && (
          <motion.div key="stage2" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="w-full max-w-6xl mx-auto py-12 flex flex-col space-y-8">
            <header className="max-w-2xl">
              <span className="font-mono text-[10px] text-zinc-500 uppercase tracking-[0.2em] block mb-2">[Stage 02]</span>
              <h1 className="text-3xl font-extrabold tracking-tight uppercase">The Anvil</h1>
              <p className="text-zinc-400 text-sm mt-3 leading-relaxed">
                Values are meaningless until tested. We expose your Hardened Values to a Wicked Problem. Resolve the trade-off.
              </p>
            </header>

            <div className="flex flex-col md:flex-row gap-8">
              {/* Left Pane */}
              <div className="flex-1 flex flex-col">
                <div className="bg-[#18181b] border border-[#27272a] p-8 rounded-xl h-full flex flex-col">
                <h3 className="font-mono text-xs text-blue-500 uppercase mb-4">Conflict Simulation</h3>
                
                {anvilStep === 'generate' && anvilPayload && (
                  <ClinicalScribe 
                    apiEndpoint="/api/anvil"
                    payload={anvilPayload}
                    trigger={!!anvilPayload}
                    onTypingComplete={handleAnvilGenerateTypingComplete}
                    thinkingText="IDENTIFYING WICKED PROBLEM..."
                    label="SYNTHESIS ENGINE"
                  />
                )}

                {dilemma && (
                  <div className="mb-6 bg-black p-6 rounded-lg border border-red-900/40">
                    <span className="font-mono text-[10px] text-red-500 uppercase block mb-3">The Tension</span>
                    <p className="text-zinc-200 text-sm leading-relaxed whitespace-pre-wrap">{dilemma}</p>
                  </div>
                )}

                {(anvilStep === 'respond' || anvilStep === 'evaluate' || anvilStep === 'completed' || anvilStep === 'rejected') && dilemma && (
                  <div className="flex-1 flex flex-col mt-auto border-t border-[#27272a] pt-6 space-y-6">
                     <div className="flex items-center gap-2 mb-2">
                       <span className="font-mono text-[10px] text-zinc-500 uppercase tracking-widest">Synthesis Objective</span>
                       <div className="relative group flex items-center">
                          <HelpCircle className="w-3.5 h-3.5 text-zinc-500 cursor-help hover:text-zinc-300 transition-colors" />
                          <div className="absolute left-0 sm:left-1/2 sm:-translate-x-1/2 bottom-full mb-2 w-72 p-3 bg-zinc-900 border border-zinc-700 rounded-lg text-xs leading-relaxed text-zinc-300 font-sans shadow-xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 pointer-events-none z-50">
                             <div className="hidden sm:block absolute left-1/2 -translate-x-1/2 -bottom-1.5 w-3 h-3 bg-zinc-900 border-b border-r border-zinc-700 rotate-45" />
                             This situation pulls you in two directions at once. Most people would just pick a side—your task is to find a way to protect both. How do you change the situation so neither value is abandoned?
                          </div>
                       </div>
                     </div>
                     
                     <div className="space-y-6 flex-1 overflow-y-auto pr-2">
                       {anvilHistory.map((item, idx) => {
                         const isLast = idx === anvilHistory.length - 1;
                         return (
                           <div key={idx} className="space-y-4">
                             <div className="bg-[#09090b] border border-[#27272a] p-4 rounded-lg">
                               <div className="text-[10px] text-zinc-500 mb-2 uppercase tracking-widest">Iteration 0{idx + 1} // You</div>
                               <p className="text-zinc-300 font-mono text-xs whitespace-pre-wrap">{item.user}</p>
                             </div>
                             
                             {item.ai && (
                               <div className="font-mono text-sm leading-relaxed text-zinc-300 bg-black p-6 rounded-lg border border-zinc-800 shadow-inner">
                                 <div className="text-[10px] text-blue-500 mb-4 uppercase tracking-widest bg-blue-500/10 inline-block px-2 py-1 rounded">
                                   COGNITIVE MIRROR
                                 </div>
                                 <div className="whitespace-pre-wrap">{item.ai}</div>
                               </div>
                             )}

                             {isLast && !item.ai && anvilPayload && anvilStep === 'evaluate' && (
                               <ClinicalScribe 
                                 key={`anvil-${idx}`}
                                 apiEndpoint="/api/anvil"
                                 payload={anvilPayload}
                                 trigger={true}
                                 onTypingComplete={handleAnvilEvaluateTypingComplete}
                                 thinkingText="EVALUATING SYNTHESIS..."
                                 label="SYNTHESIS ENGINE"
                               />
                             )}
                           </div>
                         );
                       })}
                     </div>

                     {(anvilStep === 'respond' || anvilStep === 'rejected') && (
                       <div className="flex flex-col mt-4">
                         <textarea 
                           value={anvilInput}
                           onChange={(e) => setAnvilInput(e.target.value)}
                           className="w-full bg-[#09090b] border border-[#27272a] text-zinc-100 p-4 rounded-lg focus:outline-none focus:border-blue-500/50 font-mono text-xs resize-none min-h-[120px] transition-colors"
                           placeholder="Engineer a solution that structurally honors both values..."
                         />
                         <div className="flex justify-end mt-4">
                           <button 
                             onClick={handleAnvilSubmit}
                             disabled={!anvilInput.trim()}
                             className="px-6 py-2 bg-zinc-100 text-zinc-950 hover:bg-white disabled:opacity-50 disabled:cursor-not-allowed font-mono text-[10px] uppercase font-bold tracking-widest rounded-full transition-all"
                           >
                             Resolve
                           </button>
                         </div>
                       </div>
                     )}

                     {anvilStep === 'completed' && (
                        <div className="flex justify-end mt-4">
                           <button 
                             onClick={proceedToQuenching}
                             className="px-6 py-2 bg-blue-600 text-white hover:bg-blue-500 font-mono text-[10px] uppercase font-bold tracking-widest rounded-full transition-all"
                           >
                             Proceed to Quenching
                           </button>
                         </div>
                     )}
                  </div>
                )}
              </div>
            </div>

            {/* Right Pane (Filters) */}
            <div className="w-full md:w-64 shrink-0 flex flex-col gap-4">
              <span className="font-mono text-[10px] text-zinc-500 uppercase tracking-widest">Hardened Values</span>
              {coreValues.map((v, i) => (
                <div key={v.id} className="group relative bg-[#18181b] border border-[#27272a] p-4 rounded-lg shadow-sm cursor-help">
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-bold text-sm uppercase">{v.label}</span>
                    <span className="w-2 h-2 rounded-full bg-blue-500/50"></span>
                  </div>
                  <p className="text-[10px] text-zinc-500 font-mono line-clamp-3 group-hover:opacity-0 transition-opacity">
                    {hardenedDefinitions[v.id] || "Hardened Definition pending..."}
                  </p>
                  
                  {/* Full definition tooltip that overlays the card itself so it doesn't shift layout */}
                  <div className="absolute inset-x-0 inset-y-0 h-max min-h-[100%] bg-[#18181b] border border-[#27272a] p-4 rounded-lg shadow-xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50">
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-bold text-sm uppercase text-white">{v.label}</span>
                      <span className="w-2 h-2 rounded-full bg-blue-400"></span>
                    </div>
                    <p className="text-[10px] text-zinc-300 font-mono">
                      {hardenedDefinitions[v.id] || "Hardened Definition pending..."}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
          </motion.div>
        )}

        {/* ================================================== */}
        {/* STAGE 03: QUENCHING */}
        {/* ================================================== */}
        {stage === 'STAGE_03_QUENCHING' && (
          <motion.div key="stage3" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="w-full max-w-6xl mx-auto py-12 flex flex-col space-y-8">
            <header className="max-w-2xl pointer-events-none">
              <span className="font-mono text-[10px] text-zinc-500 uppercase tracking-[0.2em] block mb-2">[Stage 03]</span>
              <h1 className="text-4xl font-extrabold tracking-widest uppercase">The Quenching</h1>
              <p className="text-zinc-400 text-sm mt-3 pointer-events-auto leading-relaxed">
                To prevent decision paralysis, your Life Operating System needs a functional hierarchy. 
                Assign your three values to these distinct operational roles and justify your logic.
              </p>
            </header>

            {/* Main Pane */}
            <div className="bg-[#18181b] border border-[#27272a] p-8 rounded-xl h-full flex flex-col w-full">
               <h3 className="font-mono text-xs text-blue-500 uppercase mb-4">Structural Hierarchy</h3>

                {(quenchingStep === 'respond' || quenchingStep === 'evaluate' || quenchingStep === 'completed' || quenchingStep === 'rejected') && (
                  <div className="flex-1 flex flex-col space-y-6">
                     <div className="space-y-6 flex-1 overflow-y-auto pr-2">
                       {quenchingHistory.map((item, idx) => {
                         const isLast = idx === quenchingHistory.length - 1;
                         return (
                           <div key={idx} className="space-y-4">
                             <div className="bg-[#09090b] border border-[#27272a] p-4 rounded-lg">
                               <div className="text-[10px] text-zinc-500 mb-2 uppercase tracking-widest">Iteration 0{idx + 1} // You</div>
                               <p className="text-zinc-300 font-mono text-xs whitespace-pre-wrap">{item.user}</p>
                             </div>
                             
                             {item.ai && (
                               <div className="font-mono text-sm leading-relaxed text-zinc-300 bg-black p-6 rounded-lg border border-zinc-800 shadow-inner">
                                 <div className="text-[10px] text-blue-500 mb-4 uppercase tracking-widest bg-blue-500/10 inline-block px-2 py-1 rounded">
                                   THE ARCHITECT
                                 </div>
                                 <div className="whitespace-pre-wrap">{item.ai}</div>
                               </div>
                             )}

                             {isLast && !item.ai && quenchingPayload && quenchingStep === 'evaluate' && (
                               <ClinicalScribe 
                                 key={`quench-${idx}`}
                                 apiEndpoint="/api/quenching"
                                 payload={quenchingPayload}
                                 trigger={true}
                                 onTypingComplete={handleQuenchingEvaluateTypingComplete}
                                 thinkingText="LOCKING HIERARCHY..."
                                 label="THE ARCHITECT"
                               />
                             )}
                           </div>
                         );
                       })}
                     </div>

                     {(quenchingStep === 'respond' || quenchingStep === 'rejected') && (
                       <div className="flex flex-col mt-4">
                         
                         <div className="flex items-start justify-between mb-2">
                           <h4 className="font-mono text-xs text-blue-500 uppercase">Part 1: Structural Allocation</h4>
                           <button 
                             onClick={() => setShowGuide(!showGuide)}
                             className={`font-mono text-[10px] uppercase tracking-widest border border-[#27272a] px-2 py-1 rounded transition-colors ${showGuide ? 'bg-zinc-800 text-zinc-300' : 'text-zinc-500 hover:text-zinc-300 hover:bg-zinc-900'}`}
                           >
                             Guide
                           </button>
                         </div>
                         <p className="text-zinc-400 text-xs mb-4 max-w-2xl leading-relaxed">
                           Assign each of your three core values to exactly one operational role. This hierarchy will dictate how you break ties when values conflict.
                         </p>

                         {showGuide && (
                            <div className="bg-blue-900/10 border border-blue-900/30 p-4 rounded-lg mb-6 flex items-start gap-4">
                                <div className="mt-1 font-mono text-[10px] text-blue-400 uppercase tracking-widest">Guide</div>
                                <p className="text-zinc-300 text-sm leading-relaxed">
                                  You've picked your top three values. Now, imagine they are teammates. Who is the leader (Momentum), who is the guard (Integrity), and who is the support (Balance)? Drag them into their spots.
                                </p>
                            </div>
                         )}

                         {/* Value Pool */}
                         <div 
                           className="bg-[#09090b] border border-[#27272a] p-4 rounded-lg mb-6 min-h-[70px] flex flex-wrap gap-4 items-center"
                           onDragOver={(e) => { e.preventDefault(); e.dataTransfer.dropEffect = 'move'; }}
                           onDrop={(e) => {
                             e.preventDefault();
                             const valLabel = e.dataTransfer.getData('text/plain');
                             if (valLabel) {
                               setQuenchingAssignments(prev => {
                                 let next = { ...prev };
                                 if (next.drive === valLabel) next.drive = '';
                                 if (next.base === valLabel) next.base = '';
                                 if (next.flow === valLabel) next.flow = '';
                                 return next;
                               });
                             }
                           }}
                         >
                           <span className="font-mono text-[10px] text-zinc-500 uppercase tracking-widest mr-2">Unassigned Values:</span>
                           {coreValues.filter(v => 
                             v.label !== quenchingAssignments.drive && 
                             v.label !== quenchingAssignments.base && 
                             v.label !== quenchingAssignments.flow
                           ).map(v => (
                             <div
                               key={v.id}
                               draggable
                               onDragStart={(e) => {
                                 e.dataTransfer.setData('text/plain', v.label);
                                 e.dataTransfer.effectAllowed = 'move';
                               }}
                               className="px-4 py-2 bg-[#18181b] border border-zinc-800 hover:border-zinc-500 text-zinc-100 font-mono text-xs uppercase tracking-widest rounded cursor-grab active:cursor-grabbing transform transition-all shadow-sm relative group"
                             >
                               {v.label}
                               {hardenedDefinitions[v.id] && (
                                 <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-64 p-3 bg-[#09090b] border border-[#27272a] rounded shadow-xl opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-50 hidden group-hover:block">
                                     <p className="text-[10px] text-zinc-400 text-left normal-case leading-relaxed font-sans">{hardenedDefinitions[v.id]}</p>
                                 </div>
                               )}
                             </div>
                           ))}
                           {coreValues.filter(v => 
                             v.label !== quenchingAssignments.drive && 
                             v.label !== quenchingAssignments.base && 
                             v.label !== quenchingAssignments.flow
                           ).length === 0 && (
                             <span className="text-zinc-600 font-mono text-[10px] uppercase tracking-widest italic">All values deployed</span>
                           )}
                         </div>

                         <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8 mt-4">
                           {[
                             { id: 'drive', title: 'The Drive', desc: 'What gives you the energy to start?', placeholder: 'e.g., I lead with Curiosity to discover new ways of working...' },
                             { id: 'base', title: 'The Base', desc: 'What is the one thing you refuse to lose?', placeholder: '...but I never compromise my Autonomy by letting others dictate my schedule...' },
                             { id: 'flow', title: 'The Flow', desc: 'What makes this sustainable for you?', placeholder: '...and I use Creativity to find unique ways to keep my work interesting and avoid burnout.' }
                           ].map(role => {
                             const assignedValue = quenchingAssignments[role.id as keyof typeof quenchingAssignments];
                             return (
                             <div 
                               key={role.id} 
                               className={`border p-5 rounded-lg flex flex-col justify-between transition-colors ${
                                 assignedValue ? 'bg-[#18181b] border-blue-900/50' : 'bg-[#121214] border-zinc-700 border-dashed'
                               }`}
                               onDragOver={(e) => { e.preventDefault(); e.dataTransfer.dropEffect = 'move'; }}
                               onDrop={(e) => {
                                 e.preventDefault();
                                 const valLabel = e.dataTransfer.getData('text/plain');
                                 if (valLabel) {
                                   setQuenchingAssignments(prev => {
                                     let next = { ...prev };
                                     if (next.drive === valLabel) next.drive = '';
                                     if (next.base === valLabel) next.base = '';
                                     if (next.flow === valLabel) next.flow = '';
                                     next[role.id as keyof typeof quenchingAssignments] = valLabel;
                                     return next;
                                   });
                                 }
                               }}
                             >
                                <div>
                                  <div className="flex items-center gap-2 mb-1">
                                     <span className={`font-mono text-xs font-bold uppercase block ${assignedValue ? 'text-zinc-200' : 'text-zinc-500'}`}>{role.title}</span>

                                  </div>
                                  <span className="text-zinc-400 text-[10px] uppercase tracking-widest block mb-3 leading-relaxed">{role.desc}</span>
                                  {!assignedValue && <span className="text-zinc-600/70 text-[10px] italic leading-relaxed block">{role.placeholder}</span>}
                                </div>
                                <div className="flex flex-col gap-2 mt-4 min-h-[40px] justify-end">
                                  {assignedValue ? (
                                     <div
                                       draggable
                                       onDragStart={(e) => {
                                         e.dataTransfer.setData('text/plain', assignedValue);
                                         e.dataTransfer.effectAllowed = 'move';
                                       }}
                                       className="px-4 py-3 bg-blue-600/10 border border-blue-500/30 text-blue-400 font-mono text-xs uppercase tracking-widest rounded cursor-grab active:cursor-grabbing text-center shadow-inner relative group"
                                     >
                                       {assignedValue}
                                       {(() => {
                                         const v = coreValues.find(cv => cv.label === assignedValue);
                                         if (v && hardenedDefinitions[v.id]) {
                                           return (
                                             <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-64 p-3 bg-[#09090b] border border-[#27272a] rounded shadow-xl opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-50 hidden group-hover:block">
                                                 <p className="text-[10px] text-zinc-400 text-left normal-case leading-relaxed font-sans">{hardenedDefinitions[v.id]}</p>
                                             </div>
                                           );
                                         }
                                         return null;
                                       })()}
                                       <button 
                                         onClick={() => setQuenchingAssignments(prev => ({...prev, [role.id]: ''}))}
                                         className="absolute -top-2 -right-2 bg-[#18181b] text-zinc-400 hover:text-white rounded-full w-5 h-5 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity text-xs border border-[#27272a]"
                                       >
                                         ×
                                       </button>
                                     </div>
                                  ) : (
                                     <div className="px-4 py-3 border border-transparent text-zinc-600 font-mono text-[10px] uppercase tracking-widest rounded text-center">
                                       Drop Here
                                     </div>
                                  )}
                                </div>
                             </div>
                             );
                           })}
                         </div>

                         <div className="relative border-t border-[#27272a] pt-8">
                             <h4 className="font-mono text-xs text-blue-500 mb-2 uppercase">Part 2: Operational Justification</h4>
                             <p className="text-zinc-400 text-xs mb-4 max-w-2xl leading-relaxed">
                               Explain the logic behind this specific hierarchy. Why does this exact configuration make sense for your life operating system?
                             </p>
                            <textarea 
                              value={quenchingInput}
                              onChange={(e) => setQuenchingInput(e.target.value)}
                              disabled={quenchingStep === 'evaluate'}
                              placeholder="If my Momentum is X and my Integrity is Y, it means that..."
                              className="w-full bg-[#09090b] border border-[#27272a] text-zinc-100 placeholder:text-zinc-600/70 p-4 rounded-lg focus:outline-none focus:border-blue-500/50 font-mono text-xs resize-none min-h-[120px] transition-colors"
                            />
                            <div className="mt-4 flex justify-between items-center">
                              {quenchingStep === 'rejected' ? (
                                <>
                                  <span className="text-red-400 font-mono text-[10px] uppercase tracking-widest font-bold">Re-evaluate your structure</span>
                                  <div className="flex gap-4">
                                     <button onClick={retryQuenching} className="text-zinc-500 hover:text-white font-mono text-[10px] uppercase tracking-widest transition-colors">Retry</button>
                                     <button 
                                       onClick={handleQuenchingSubmit}
                                       disabled={!quenchingInput.trim() || !quenchingAssignments.drive || !quenchingAssignments.base || !quenchingAssignments.flow}
                                       className="px-6 py-2 bg-zinc-100 text-zinc-950 hover:bg-white disabled:opacity-50 disabled:cursor-not-allowed font-mono text-[10px] uppercase font-bold tracking-widest rounded-full transition-all"
                                     >
                                       Resolve
                                     </button>
                                  </div>
                                </>
                              ) : (
                                <>
                                  <span className="text-zinc-500 font-mono text-[10px] uppercase tracking-widest">Justify the configuration</span>
                                  <button 
                                    onClick={handleQuenchingSubmit}
                                    disabled={!quenchingInput.trim() || !quenchingAssignments.drive || !quenchingAssignments.base || !quenchingAssignments.flow}
                                    className="px-6 py-2 bg-zinc-100 text-zinc-950 hover:bg-white disabled:opacity-50 disabled:cursor-not-allowed font-mono text-[10px] uppercase font-bold tracking-widest rounded-full transition-all"
                                  >
                                    Lock In
                                  </button>
                                </>
                              )}
                            </div>
                         </div>
                       </div>
                     )}

                     {quenchingStep === 'completed' && manifesto && (
                        <div className="mt-8 border-t border-[#27272a] pt-8 flex flex-col items-center relative w-full">
                            <p className="font-mono text-xs text-blue-500 uppercase tracking-[0.3em] mb-4">Sovereignty Manifesto Synthesized</p>
                            <p className="font-mono text-[10px] text-zinc-500 uppercase tracking-widest mb-4">Press and hold to seal</p>
                            <button 
                              onPointerDown={startSeal}
                              onPointerUp={cancelSeal}
                              onPointerLeave={cancelSeal}
                              className="w-20 h-20 bg-zinc-950 border border-zinc-800 rounded-full flex items-center justify-center flex-col relative overflow-hidden group hover:border-zinc-700 transition-colors shadow-2xl"
                            >
                              <div 
                                className="absolute bottom-0 inset-x-0 bg-white transition-all duration-[75ms] ease-linear"
                                style={{ height: `${sealProgress}%` }}
                              />
                              <Lock className={`w-6 h-6 relative z-10 transition-colors ${sealProgress > 50 ? 'text-black' : 'text-zinc-600 group-hover:text-zinc-400'}`} />
                            </button>
                        </div>
                     )}
                  </div>
                )}
              </div>
          </motion.div>
        )}

        {/* ================================================== */}
        {/* SEALED END STATE */}
        {/* ================================================== */}
        {stage === 'MANIFESTO_SEALED' && (
           <TheCrucibleFinaleView 
             coreValues={coreValues}
             allValues={allValues}
             dilemma={dilemma}
             hardenedDefinitions={hardenedDefinitions}
             operationalRule={operationalRule}
             quenchingAssignments={quenchingAssignments}
             manifesto={manifesto}
             userName="Seeker"
           />
        )}

      </AnimatePresence>
    </div>
  );
};
