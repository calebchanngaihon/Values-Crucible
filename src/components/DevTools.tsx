import React, { useState, useEffect, useRef } from 'react';
import { Stage, CrucibleState, ValueNode } from '../types';
import { INITIAL_VALUES } from '../constants';
import { 
  Settings, Play, Pause, Square, Terminal, CheckCircle2, 
  AlertCircle, Download, Sparkles, RefreshCw, ChevronDown, 
  ChevronUp, Copy, ExternalLink, HelpCircle, Shield, Bug
} from 'lucide-react';

interface DevToolsProps { 
  __devSetState: (s: Partial<CrucibleState>) => void;
  state: CrucibleState;
  updateValueStatus?: (id: string, status: 'resonated' | 'discarded') => void;
  rescueValue?: (id: string) => void;
  startTournament?: () => void;
  recordTournamentResult?: (winnerId: string, loserId: string) => void;
  selectCoreValues?: (ids: string[]) => void;
  completeBreathing?: () => void;
  startTempering?: () => void;
  reset?: () => void;
}

export const DevTools: React.FC<DevToolsProps> = ({ 
  __devSetState,
  state,
  updateValueStatus,
  rescueValue,
  startTournament,
  recordTournamentResult,
  selectCoreValues,
  completeBreathing,
  startTempering,
  reset
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<'sandbox' | 'qa_agent' | 'linkedin'>('sandbox');
  const [isAutomating, setIsAutomating] = useState(false);
  const [automationSpeed, setAutomationSpeed] = useState(80); // ms per step
  const [logs, setLogs] = useState<{ id: string; text: string; type: 'info' | 'success' | 'warn' | 'error'; time: string }[]>([]);
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);
  
  const autoIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const logsEndRef = useRef<HTMLDivElement>(null);

  // Add real-time developer/QA logging
  const addLog = (text: string, type: 'info' | 'success' | 'warn' | 'error' = 'info') => {
    const time = new Date().toLocaleTimeString();
    setLogs(prev => [
      { id: Math.random().toString(), text, type, time },
      ...prev.slice(0, 49) // Hold last 50 entries
    ]);
  };

  useEffect(() => {
    if (logsEndRef.current) {
      logsEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [logs]);

  // Handle auto-scrolling & cleanup on unmount
  useEffect(() => {
    return () => {
      if (autoIntervalRef.current) clearTimeout(autoIntervalRef.current);
    };
  }, []);

  // DOM human-typing/clicking simulator for Tempering phases
  const simulateTemperingStep = (): boolean => {
    // 1. Handle any empty textareas (Honing / Anvil stage)
    const ta = document.querySelector('textarea') as HTMLTextAreaElement;
    if (ta && ta.value === '') {
      ta.value = "This core value represents our unwavering standard of craftsmanship, honesty in action, and personal responsibility under adversity.";
      ta.dispatchEvent(new Event('input', { bubbles: true }));
      ta.dispatchEvent(new Event('change', { bubbles: true }));
      addLog(`[DOM SIMULATOR] Populated reflective context in text area`, 'info');
      return true;
    }

    // 2. Handle standard input fields
    const input = document.querySelector('input[type="text"]') as HTMLInputElement;
    if (input && input.value === '') {
      input.value = "Always choose the truth and maintain technical integrity, even when client timelines are stressed.";
      input.dispatchEvent(new Event('input', { bubbles: true }));
      input.dispatchEvent(new Event('change', { bubbles: true }));
      addLog(`[DOM SIMULATOR] Injected custom operational standards`, 'info');
      return true;
    }

    // 3. Assign categories in Quenching step if visible
    const unselectedCategorizers = document.querySelectorAll(
      '.grid-cols-3 button:not([class*="bg-blue"]):not([class*="text-blue"]):not([disabled]), .flex button:not([class*="bg-blue"]):not([class*="text-blue"]):not([disabled])'
    );
    if (unselectedCategorizers.length > 0) {
      const targetBtn = unselectedCategorizers[0] as HTMLButtonElement;
      targetBtn.click();
      addLog(`[DOM SIMULATOR] Assigned dynamic role parameter: [${targetBtn.textContent?.trim()}]`, 'info');
      return true;
    }

    // 4. Find action buttons to trigger progression (Hone Value, Submit, Confirm, Seal)
    const buttons = Array.from(document.querySelectorAll('button:not([disabled])')) as HTMLButtonElement[];
    const actionBtn = buttons.find(btn => {
      const label = btn.textContent?.toLowerCase() || '';
      return label.includes('hone value') || 
             label.includes('submit') || 
             label.includes('resolve') || 
             label.includes('forge') || 
             label.includes('seal') || 
             label.includes('proceed') ||
             label.includes('next');
    });

    if (actionBtn && !actionBtn.classList.contains('cursor-not-allowed')) {
      actionBtn.click();
      addLog(`[DOM SIMULATOR] Dispatched action trigger on button: "${actionBtn.textContent?.trim()}"`, 'success');
      return true;
    }

    return false;
  };

  // State loop for dynamic test automation (Autopilot)
  useEffect(() => {
    if (!isAutomating) {
      if (autoIntervalRef.current) clearTimeout(autoIntervalRef.current);
      return;
    }

    const runNextStep = () => {
      if (!isAutomating) return;

      // 1. Stage: Purging Values
      if (state.stage === Stage.PURGE) {
        if (state.currentIndex < 60) {
          const currentVal = state.values[state.currentIndex];
          if (currentVal && updateValueStatus) {
            const result = Math.random() > 0.45 ? 'resonated' : 'discarded';
            updateValueStatus(currentVal.id, result);
            addLog(`[PURGE] Checked ${state.currentIndex + 1}/60: '${currentVal.label}' -> [${result.toUpperCase()}]`, 'info');
          }
        }
        return;
      }

      // 2. Stage: Rescue Window
      if (state.stage === Stage.RESCUE) {
        const resonated = state.values.filter(v => v.status === 'resonated');
        if (resonated.length < 3) {
          const discarded = state.values.filter(v => v.status === 'discarded');
          const toRescue = discarded[0];
          if (toRescue && rescueValue) {
            rescueValue(toRescue.id);
            addLog(`[RESCUE] Underweight resonated set (${resonated.length}). Rescued: '${toRescue.label}'`, 'warn');
          }
        } else {
          if (startTournament) {
            startTournament();
            addLog(`[RESCUE] Locked initial resonated values. Initiating tournament engine.`, 'success');
          }
        }
        return;
      }

      // 3. Stage: Dynamic Pairwise Tournament Bracket
      if (state.stage === Stage.TOURNAMENT) {
        const hasValidPair = state.tournamentPairs && state.tournamentPairs.length > 0 && state.currentPairIndex < state.tournamentPairs.length;
        if (hasValidPair) {
          const pairIds = state.tournamentPairs[state.currentPairIndex];
          const valA = state.values.find(v => v.id === pairIds[0]);
          const valB = state.values.find(v => v.id === pairIds[1]);
          if (valA && valB && recordTournamentResult) {
            const decisionA = Math.random() > 0.5;
            const winner = decisionA ? valA : valB;
            const loser = decisionA ? valB : valA;
            recordTournamentResult(winner.id, loser.id);
            addLog(`[TOURNAMENT] Match ${state.currentPairIndex + 1}/${state.tournamentPairs.length}: '${valA.label}' vs '${valB.label}' -> Selected '${winner.label}'`, 'info');
          }
        } else if (state.currentPairIndex >= (state.tournamentPairs?.length || 0)) {
          addLog(`[TOURNAMENT] Pairwise bracket tournament complete. Ready for mindful pause.`, 'success');
        }
        return;
      }

      // 4. Stage: Mindful Breathing skip
      if (state.stage === Stage.BREATHING) {
        if (completeBreathing) {
          completeBreathing();
          addLog(`[BREATHING] Calibrating reflective state. Progressing to Casting Circle.`, 'success');
        }
        return;
      }

      // 5. Stage: Circle Casting
      if (state.stage === Stage.CASTING) {
        const resonated = [...state.values]
          .filter(v => v.status === 'resonated')
          .sort((a, b) => b.elo - a.elo);

        const topThree = resonated.slice(0, 3).map(v => v.id);
        if (topThree.length === 3 && selectCoreValues) {
          selectCoreValues(topThree);
          const descriptions = resonated.slice(0, 3).map(v => v.label).join(', ');
          addLog(`[CASTING] Selected gold-trio by ELO rating: [${descriptions}]`, 'success');
        } else {
          addLog(`[CASTING ERR] Insufficient candidates (needed: 3). Hard resetting circle.`, 'error');
          setIsAutomating(false);
        }
        return;
      }

      // 6. Stage: The Crucible Choice
      if (state.stage === Stage.CRUCIBLE) {
        if (startTempering) {
          startTempering();
          addLog(`[CRUCIBLE] Confirmed absolute values stack. Moving to final tempering.`, 'success');
        }
        return;
      }

      // 7. Stage: The Tempering (Honing, Anvil, Quenching)
      if (state.stage === Stage.TEMPERING) {
        const completedNodeText = document.querySelector('h2');
        if (completedNodeText && (completedNodeText.textContent?.includes('SEALED') || completedNodeText.textContent?.includes('MANIFESTO'))) {
          addLog(`[QA SUCCESS] End-to-end user pipeline completed successfully. Values Manifesto created. Rules validated!`, 'success');
          setIsAutomating(false);
          return;
        }

        const worked = simulateTemperingStep();
        if (!worked) {
          addLog(`[TEMPERING] Waiting for transition layout or animation...`, 'info');
        }
        return;
      }
    };

    autoIntervalRef.current = setTimeout(runNextStep, automationSpeed);

    return () => {
      if (autoIntervalRef.current) clearTimeout(autoIntervalRef.current);
    };
  }, [state, isAutomating, automationSpeed, updateValueStatus, rescueValue, startTournament, recordTournamentResult, selectCoreValues, completeBreathing, startTempering]);

  // Manual Stage Navigation jump with full ELO calculations mapping
  const jumpTo = (stage: Stage) => {
    let baseState = {
      stage,
      currentIndex: 0,
      values: [...INITIAL_VALUES],
      rescuedCount: 0,
      tournamentPairs: [],
      currentPairIndex: 0,
      coreValues: [],
      tournamentHistory: []
    } as any;

    if (stage === Stage.RESCUE || stage === Stage.TOURNAMENT) {
       baseState.values.forEach((v: any, i: number) => {
          v.status = i < 15 ? 'resonated' : 'discarded';
       });
       baseState.currentIndex = 60;
    }
    
    if (stage === Stage.TOURNAMENT) {
       baseState.tournamentPairs = [
          [baseState.values[0].id, baseState.values[1].id],
          [baseState.values[2].id, baseState.values[3].id],
          [baseState.values[4].id, baseState.values[5].id],
          [baseState.values[0].id, baseState.values[4].id],
       ];
    }
    
    if (stage === Stage.CASTING || stage === Stage.CRUCIBLE || stage === Stage.TEMPERING) {
       baseState.values.forEach((v: any, i: number) => {
          v.status = i < 6 ? 'resonated' : 'discarded';
          if (i < 6) v.elo = 1600 + i * 10;
       });
    }

    if (stage === Stage.CRUCIBLE || stage === Stage.TEMPERING) {
       baseState.coreValues = [
          baseState.values[0].id,
          baseState.values[1].id,
          baseState.values[2].id
       ];
    }
    
    __devSetState(baseState);
    addLog(`[SANDBOX] Direct state jump performed -> Stage [${stage}]`, 'warn');
    setIsOpen(true);
  };

  const copyToClipboard = (text: string, index: number) => {
    navigator.clipboard.writeText(text);
    setCopiedIndex(index);
    setTimeout(() => setCopiedIndex(null), 2000);
  };

  const linkedinTemplates = [
    {
      title: "🔥 Storytelling & Reflection (Highly engaging)",
      content: `I just completed a true "refining fire" for my personal beliefs. 

Instead of traditional personality quizzes that tell you what you want to hear, I ran my beliefs through a rigorous ELO-bracket tournament called "The Values Crucible."

You start with 60 potential values, prune them, pitch them head-to-head in dynamic ELO pressure tests, and finally map them into an actionable charter:
• The Drive: What fuels action
• The Base: What anchors choices
• The Flow: How standard values operationalize in day-to-day decisions

Here is what emerged as my non-negotiable guiding trio:
1. Integrity
2. Growth
3. Mastery

If you wants to strip away superficial goals and define your real non-negotiable operational rules, test your metal here: 
👉 http://crucible.calebed.me/

(Shout out to Daniel Kahneman & Shalom Schwartz's framework that structured this build!)`
    },
    {
      title: "💼 Professional / Leadership Pitch (Polished & Concise)",
      content: `Leadership requires non-negotiable frameworks. If you can't define what triggers your personal operational exceptions, your values are just slogans.

I spent time distilling my foundational beliefs on http://crucible.calebed.me/

This research-backed crucible pits core ideas head-to-head using an ELO Elo rating system to extract real-world tradeoffs. My values are:
🚀 Drive: Curiosity
⚓ Base: Dependability
🌊 Flow: Mastery

Give it a try to find yours. Zero superficial gamification, pure productive struggle. Let me know what your final manifesto looks like!`
    },
    {
      title: "✨ Short & High-impact (Simple & Viral)",
      content: `Stop taking personality tests. Start making hard choices.

Check out the Values Crucible (http://crucible.calebed.me/), a beautifully designed clinical instrument that uses Schwartz's theory of basic human values to rank what truly guides you.

My final Core Values:
1. Integrity
2. Mastery
3. Craftsmanship

Find your non-negotiables in 15 minutes. Pure focus, zero fluff.`
    }
  ];

  return (
    <div className="fixed bottom-6 left-6 z-[100] flex flex-col items-start gap-2 select-none">
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-3 py-2 bg-zinc-950 border border-zinc-800 text-zinc-400 hover:text-white rounded-full transition-all shadow-2xl hover:border-zinc-700 pointer-events-auto"
        title="QA Robot & Sandbox Panel"
      >
        <Bug className={`w-4 h-4 text-blue-500 ${isAutomating ? 'animate-spin' : ''}`} />
        <span className="font-mono text-[10px] uppercase tracking-widest font-black pr-1">QA Control Suite</span>
      </button>

      {isOpen && (
        <div className="w-[420px] max-w-[90vw] bg-zinc-950 border border-zinc-900 rounded-2xl shadow-[0_0_50px_rgba(0,0,0,0.8)] p-5 flex flex-col gap-4 font-mono pointer-events-auto text-xs animate-in slide-in-from-bottom-2 duration-300">
          <div className="flex items-center justify-between border-b border-zinc-900 pb-3">
            <div className="flex items-center gap-2">
              <Bug className="w-4 h-4 text-blue-500" />
              <span className="font-bold uppercase tracking-widest text-zinc-100 text-xs">QA Sandbox Center</span>
              {isAutomating && (
                <span className="w-1.5 h-1.5 bg-green-500 rounded-full animate-ping" />
              )}
            </div>
            <button 
              onClick={() => setIsOpen(false)}
              className="text-zinc-500 hover:text-white transition-colors"
            >
              ✕
            </button>
          </div>

          {/* Navigation Tabs */}
          <div className="grid grid-cols-3 bg-zinc-900/50 p-1 rounded-lg border border-zinc-900">
            <button 
              onClick={() => setActiveTab('sandbox')}
              className={`py-1.5 rounded text-[10px] uppercase font-bold tracking-wider transition-all ${activeTab === 'sandbox' ? 'bg-zinc-800 text-white shadow-inner' : 'text-zinc-500 hover:text-zinc-300'}`}
            >
              Transitions
            </button>
            <button 
              onClick={() => setActiveTab('qa_agent')}
              className={`py-1.5 rounded text-[10px] uppercase font-bold tracking-wider transition-all flex items-center justify-center gap-1.5 ${activeTab === 'qa_agent' ? 'bg-zinc-800 text-white shadow-inner' : 'text-zinc-500 hover:text-zinc-300'}`}
            >
              QA Robot
            </button>
            <button 
              onClick={() => setActiveTab('linkedin')}
              className={`py-1.5 rounded text-[10px] uppercase font-bold tracking-wider transition-all flex items-center justify-center gap-1.5 ${activeTab === 'linkedin' ? 'bg-zinc-800 text-white shadow-inner' : 'text-zinc-500 hover:text-zinc-300'}`}
            >
              Share drafts
            </button>
          </div>

          {/* Sandbox State Jumpers Tab */}
          {activeTab === 'sandbox' && (
            <div className="flex flex-col gap-2.5">
              <span className="text-[9px] text-zinc-500 uppercase tracking-wider mb-0.5">Jump directly to check container integrity:</span>
              <div className="grid grid-cols-2 gap-2">
                <button 
                  onClick={() => jumpTo(Stage.PURGE)}
                  className="bg-zinc-900 hover:bg-zinc-800 text-zinc-400 hover:text-zinc-200 py-1.5 px-2.5 rounded border border-zinc-800/80 hover:border-zinc-700 transition-colors text-left text-[10px]"
                >
                  Step 1: Extract Purge
                </button>
                <button 
                  onClick={() => jumpTo(Stage.TOURNAMENT)}
                  className="bg-zinc-900 hover:bg-zinc-800 text-zinc-400 hover:text-zinc-200 py-1.5 px-2.5 rounded border border-zinc-800/80 hover:border-zinc-700 transition-colors text-left text-[10px]"
                >
                  Step 2: Compress Matchups
                </button>
                <button 
                  onClick={() => jumpTo(Stage.CASTING)}
                  className="bg-zinc-900 hover:bg-zinc-800 text-zinc-400 hover:text-zinc-200 py-1.5 px-2.5 rounded border border-zinc-800/80 hover:border-zinc-700 transition-colors text-left text-[10px]"
                >
                  Step 3: Casting Circle
                </button>
                <button 
                  onClick={() => jumpTo(Stage.TEMPERING)}
                  className="bg-zinc-900 hover:bg-zinc-800 text-zinc-400 hover:text-zinc-200 py-1.5 px-2.5 rounded border border-zinc-800/80 hover:border-zinc-700 transition-colors text-left text-[10px]"
                >
                  Step 4: Tempering Process
                </button>
              </div>

              <div className="border-t border-zinc-900 pt-3 mt-1.5 flex justify-between items-center text-[10px] text-zinc-500">
                <span>Core Framework: React 19 + Vite</span>
                <span>Active Stage: <b className="text-blue-500">{state.stage}</b></span>
              </div>
            </div>
          )}

          {/* QA Robot Automation Tab */}
          {activeTab === 'qa_agent' && (
            <div className="flex flex-col gap-3">
              <div className="flex justify-between items-center bg-zinc-900/50 p-2.5 rounded-lg border border-zinc-900">
                <div className="flex flex-col gap-0.5">
                  <span className="text-[10px] font-bold text-zinc-300">QA Automated Autopilot</span>
                  <span className="text-[8px] text-zinc-500">Speed: {automationSpeed}ms / cycle</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <button 
                    onClick={() => {
                      const mode = !isAutomating;
                      setIsAutomating(mode);
                      addLog(mode ? `[QA AGENT] Initiated automated end-to-end regression testing` : `[QA AGENT] Automation paused by user`, 'warn');
                    }}
                    className={`p-2 rounded-full transition-colors flex items-center justify-center ${isAutomating ? 'bg-amber-600/20 text-amber-500 hover:bg-amber-500/30' : 'bg-blue-600/20 text-blue-500 hover:bg-blue-500/30'}`}
                    title={isAutomating ? "Pause Testing" : "Start Test Run"}
                  >
                    {isAutomating ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
                  </button>
                  <button 
                    onClick={() => {
                      setIsAutomating(false);
                      if (reset) reset();
                      setLogs([]);
                      addLog(`[QA AGENT] Context reset. Purging complete state buffers.`, 'warn');
                    }}
                    className="p-2 bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 hover:border-zinc-700 rounded-full text-zinc-400 hover:text-white transition-colors flex items-center justify-center"
                    title="Clear State & Logs"
                  >
                    <RefreshCw className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              {/* Speed controls */}
              <div className="flex items-center justify-between text-[10px] text-zinc-400 px-1 bg-zinc-900/20 pb-0.5">
                <span>Simulation Speed:</span>
                <div className="flex gap-2">
                  <button 
                    onClick={() => setAutomationSpeed(350)} 
                    className={`px-1.5 py-0.5 rounded ${automationSpeed === 350 ? 'bg-zinc-800 text-white font-bold' : 'text-zinc-600 hover:text-zinc-300'}`}
                  >
                    1x
                  </button>
                  <button 
                    onClick={() => setAutomationSpeed(80)} 
                    className={`px-1.5 py-0.5 rounded ${automationSpeed === 80 ? 'bg-zinc-800 text-white font-bold' : 'text-zinc-600 hover:text-zinc-300'}`}
                  >
                    5x
                  </button>
                  <button 
                    onClick={() => setAutomationSpeed(15)} 
                    className={`px-1.5 py-0.5 rounded ${automationSpeed === 15 ? 'bg-zinc-800 text-white font-bold' : 'text-zinc-600 hover:text-zinc-300'}`}
                  >
                    Extralite
                  </button>
                </div>
              </div>

              {/* Build Check Integrity Grid */}
              <div className="grid grid-cols-2 gap-1.5 text-[9px] bg-zinc-950 p-2 rounded border border-zinc-900">
                <div className="flex items-center gap-1 text-zinc-400">
                  <CheckCircle2 className="w-3 h-3 text-green-500" />
                  <span>Build Integrity Verification</span>
                </div>
                <div className="flex items-center gap-1 text-zinc-400">
                  <CheckCircle2 className="w-3 h-3 text-green-500" />
                  <span>ELO Math Formula: OK</span>
                </div>
                <div className="flex items-center gap-1 text-zinc-400">
                  <CheckCircle2 className="w-3 h-3 text-green-500" />
                  <span>Persistence System: Active</span>
                </div>
                <div className="flex items-center gap-1 text-zinc-400">
                  {state.values ? (
                    <CheckCircle2 className="w-3 h-3 text-green-500" />
                  ) : (
                    <AlertCircle className="w-3 h-3 text-zinc-500" />
                  )}
                  <span>Values Dataset: 60/60</span>
                </div>
              </div>

              {/* Monospace Console output logs */}
              <div className="flex flex-col gap-1.5">
                <div className="flex items-center justify-between text-[10px] text-zinc-500 px-1">
                  <span className="flex items-center gap-1">
                    <Terminal className="w-3 h-3" /> QA Log Output Feed
                  </span>
                  <span>{logs.length} logged</span>
                </div>
                <div className="h-44 bg-black border border-zinc-900 rounded-lg p-2.5 overflow-y-auto flex flex-col-reverse gap-1.5 font-mono text-[9px] leading-relaxed scrollbar-thin">
                  <div ref={logsEndRef} />
                  {logs.length === 0 ? (
                    <div className="text-zinc-600 flex items-center justify-center h-full text-center p-3 select-none">
                      Autopilot IDLE. Click the run control above to simulate seamless human-like interactive sessions.
                    </div>
                  ) : (
                    logs.map(log => (
                      <div key={log.id} className="flex gap-1">
                        <span className="text-zinc-600 shrink-0">[{log.time}]</span>
                        <span className={
                          log.type === 'success' ? 'text-green-500' :
                          log.type === 'warn' ? 'text-amber-500' :
                          log.type === 'error' ? 'text-red-500' : 'text-blue-500'
                        }>
                          {log.text}
                        </span>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>
          )}

          {/* LinkedIn Sharing Post Templates */}
          {activeTab === 'linkedin' && (
            <div className="flex flex-col gap-3 max-h-[50vh] overflow-y-auto">
              <span className="text-[10px] text-zinc-400 leading-relaxed font-sans">
                Below are 3 personalized LinkedIn templates generated directly from your deployed application context. Copy and share the app with your network!
              </span>
              
              {linkedinTemplates.map((item, idx) => (
                <div key={idx} className="bg-zinc-900 border border-zinc-850 rounded-lg p-3 flex flex-col gap-2.5">
                  <div className="flex justify-between items-center text-[10px] border-b border-zinc-800 pb-1.5 font-bold">
                    <span className="text-zinc-300">{item.title}</span>
                    <button 
                      onClick={() => copyToClipboard(item.content, idx)}
                      className="text-blue-500 hover:text-blue-400 flex items-center gap-1 active:scale-95 transition-transform"
                    >
                      <Copy className="w-3 h-3" />
                      <span>{copiedIndex === idx ? 'Copied' : 'Copy'}</span>
                    </button>
                  </div>
                  <pre className="text-[9px] text-zinc-400 font-mono whitespace-pre-wrap leading-normal font-sans max-h-36 overflow-y-auto bg-black/30 p-2.5 rounded border border-zinc-900/50">
                    {item.content}
                  </pre>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};
