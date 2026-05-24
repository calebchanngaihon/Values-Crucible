import React, { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, ExternalLink } from 'lucide-react';

interface TheoryProps {
  isOpen: boolean;
  onClose: () => void;
}

type Tab = 'pillars' | 'flow' | 'schwartz' | 'tempering' | 'ledger' | 'citations';

const schwartzPoles: Record<number, any> = {
  1: {
      title: "Self-Direction",
      axis: "Openness to Change",
      deg: "18°",
      conflict: "Pole 06: Security (~180°)",
      desc: "Independent thought and action. Choosing, creating, and exploring. Anchored on personal freedom, autonomy, and the exploration of self-reliant capability."
  },
  2: {
      title: "Stimulation",
      axis: "Openness to Change",
      deg: "54°",
      conflict: "Pole 07: Conformity / Tradition (~180°)",
      desc: "Excitement, novelty, and challenge in life. Demands continuous psychological input to prevent boredom and cognitive stagnation."
  },
  3: {
      title: "Hedonism",
      axis: "Openness to Change / Self-Enhancement",
      deg: "90°",
      conflict: "Pole 08: Tradition (~180°)",
      desc: "Pleasure and sensuous gratification for oneself. Anchored on positive immediate physical/emotional sensation."
  },
  4: {
      title: "Achievement",
      axis: "Self-Enhancement",
      deg: "126°",
      conflict: "Pole 10: Universalism (~180°)",
      desc: "Personal success through demonstrating competence according to social standards. Focuses on social validation, performance, and efficiency metrics."
  },
  5: {
      title: "Power",
      axis: "Self-Enhancement",
      deg: "162°",
      conflict: "Pole 10: Universalism (~180°)",
      desc: "Social status, prestige, control or dominance over people and resources. Values systemic leverage and organizational command."
  },
  6: {
      title: "Security",
      axis: "Conservation",
      deg: "198°",
      conflict: "Pole 01: Self-Direction (~180°)",
      desc: "Safety, harmony, and stability of society, relationships, and the self. Prioritizes the mitigation of systemic risk and vulnerability."
  },
  7: {
      title: "Conformity",
      axis: "Conservation",
      deg: "234°",
      conflict: "Pole 02: Stimulation (~180°)",
      desc: "Restraint of actions, inclinations, and impulses likely to upset others or violate social standards. Prioritizes interpersonal harmony."
  },
  8: {
      title: "Tradition",
      axis: "Conservation",
      deg: "270°",
      conflict: "Pole 03: Hedonism (~180°)",
      desc: "Respect, commitment, and acceptance of cultural or religious customs. Prioritizes historical continuity and legacy."
  },
  9: {
      title: "Benevolence",
      axis: "Self-Transcendence",
      deg: "306°",
      conflict: "Pole 04: Achievement (~180°)",
      desc: "Preserving and enhancing the welfare of those in close personal contact. Grounded in in-group loyalty, support, and care."
  },
  10: {
      title: "Universalism",
      axis: "Self-Transcendence",
      deg: "342°",
      conflict: "Pole 05: Power (~180°)",
      desc: "Understanding, appreciation, tolerance, and protection for the welfare of all people and nature. Focuses on systemic justice and balance."
  }
};

export const Theory: React.FC<TheoryProps> = ({ isOpen, onClose }) => {
  const [activeTab, setActiveTab] = useState<Tab>('pillars');
  const [activeScholar, setActiveScholar] = useState<'miller' | 'schwartz' | 'kahneman'>('miller');

  const tabs: { id: Tab; label: string; num: string }[] = [
    { id: 'pillars', label: 'Theoretical Pillars', num: '01' },
    { id: 'flow', label: 'The Forge Flow', num: '02' },
    { id: 'schwartz', label: 'Schwartz Circumplex', num: '03' },
    { id: 'tempering', label: 'The Tempering Process', num: '04' },
    { id: 'ledger', label: 'Mathematical Ledger', num: '05' },
    { id: 'citations', label: 'References', num: '06' },
  ];

  /* Sandbox Mechanics */
  const [activeSandboxCard, setActiveSandboxCard] = useState<string | null>(null);
  const [sandboxProgress, setSandboxProgress] = useState(0);
  const [sandboxStatus, setSandboxStatus] = useState<'awaiting' | 'compressing_a' | 'compressing_b' | 'cast_a' | 'cast_b'>('awaiting');
  const sandboxHoldTimerRef = useRef<NodeJS.Timeout | null>(null);

  const startSandboxHold = (cardId: 'a' | 'b') => {
      setActiveSandboxCard(cardId);
      setSandboxProgress(0);
      setSandboxStatus(cardId === 'a' ? 'compressing_a' : 'compressing_b');

      if (sandboxHoldTimerRef.current) clearInterval(sandboxHoldTimerRef.current);
      sandboxHoldTimerRef.current = setInterval(() => {
          setSandboxProgress(p => {
              if (p >= 100) {
                  clearInterval(sandboxHoldTimerRef.current!);
                  triggerSandboxCommit(cardId);
                  return 100;
              }
              return p + 5;
          });
      }, 40); // 800ms
  };

  const cancelSandboxHold = () => {
      if (!activeSandboxCard && sandboxStatus === 'awaiting') return;
      if (sandboxStatus === 'cast_a' || sandboxStatus === 'cast_b') return; 
      if (sandboxHoldTimerRef.current) clearInterval(sandboxHoldTimerRef.current);
      setSandboxProgress(0);
      setSandboxStatus('awaiting');
      setActiveSandboxCard(null);
  }

  const triggerSandboxCommit = (cardId: 'a' | 'b') => {
      setSandboxStatus(cardId === 'a' ? 'cast_a' : 'cast_b');
      setTimeout(() => {
          if (sandboxHoldTimerRef.current) clearInterval(sandboxHoldTimerRef.current);
          setSandboxProgress(0);
          setSandboxStatus('awaiting');
          setActiveSandboxCard(null);
      }, 1500);
  }

  const [selectedPole, setSelectedPole] = useState<number>(1);
  const poleData = schwartzPoles[selectedPole];

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[9999] flex bg-zinc-950/95 backdrop-blur-md"
        >
          {/* Main Navigation Sidebar */}
          <aside className="w-[320px] bg-zinc-950 border-r border-zinc-800 flex-col justify-between p-8 shrink-0 hidden md:flex">
            <div>
              <div className="flex items-center gap-3 mb-12">
                  <span className="w-2.5 h-2.5 rounded-full bg-blue-500 animate-[pulse_3s_ease-in-out_infinite]"></span>
                  <span className="font-mono font-bold text-xs uppercase tracking-[0.2em] text-zinc-50">Crucible_v1.0_Arch</span>
              </div>
              
              <nav className="flex flex-col gap-3">
                {tabs.map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`w-full text-left py-3 px-4 rounded-lg text-sm transition-all flex items-center justify-between ${
                      activeTab === tab.id 
                      ? 'text-zinc-50 bg-zinc-900 border border-zinc-800' 
                      : 'text-zinc-500 hover:text-zinc-100 hover:bg-zinc-900/50 border border-transparent'
                    }`}
                  >
                    <span>{tab.label}</span>
                    <span className={`font-mono text-[10px] ${activeTab === tab.id ? 'opacity-100' : 'opacity-40'}`}>
                      {tab.num}
                    </span>
                  </button>
                ))}
              </nav>
            </div>
            
            <div className="border-t border-zinc-800 pt-6 flex flex-col gap-1">
                <span className="font-mono text-[10px] text-zinc-500 uppercase tracking-wider">Handoff Specifications</span>
                <span className="font-mono text-[9px] text-zinc-600">STABLE DEPLOYMENT: v2.7</span>
            </div>
          </aside>

          {/* Mobile Navigation */}
          <div className="md:hidden absolute top-0 left-0 w-full bg-zinc-950 border-b border-zinc-900 z-50">
             <div className="h-16 flex items-center justify-between px-6">
                <div className="flex items-center gap-2">
                  <div className="w-1.5 h-1.5 bg-blue-600 rounded-full" />
                  <div className="font-mono text-[10px] font-bold uppercase tracking-widest text-zinc-100">
                    Crucible_Arch
                  </div>
                </div>
                <button 
                  onClick={onClose}
                  className="w-8 h-8 bg-zinc-900 rounded-full flex items-center justify-center text-zinc-500"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
              <div className="flex overflow-x-auto scrollbar-none px-4 pb-4 gap-2">
                {tabs.map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`flex-shrink-0 px-4 py-2 rounded-lg transition-all text-[10px] font-mono uppercase tracking-widest ${
                      activeTab === tab.id 
                      ? 'bg-blue-600 text-white font-bold' 
                      : 'text-zinc-500 bg-zinc-900/50'
                    }`}
                  >
                    {tab.label}
                  </button>
                ))}
              </div>
          </div>

          {/* Close Button Desktop */}
          <button
            onClick={onClose}
            className="absolute top-12 right-12 z-[10000] w-12 h-12 bg-zinc-900/90 border border-zinc-700 hover:border-zinc-500 rounded-full flex items-center justify-center text-zinc-300 hover:text-white transition-all shadow-2xl hidden md:flex"
          >
            <X className="w-6 h-6" />
          </button>

          {/* Main Content Area */}
          <main className="flex-grow p-8 md:pt-40 md:pb-24 md:px-20 overflow-y-auto bg-zinc-950 mt-24 md:mt-0">
            <div className="max-w-4xl mx-auto">
              <AnimatePresence mode="wait">
                
                {/* SECTION 1: THE SCHOLARS */}
                {activeTab === 'pillars' && (
                  <motion.section 
                    key="pillars"
                    initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}
                    className="space-y-12"
                  >
                    <div>
                        <span className="font-mono text-xs text-blue-500 uppercase tracking-widest block mb-2">[01 // Conceptual Architecture]</span>
                        <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight text-white mb-6">Theoretical Pillars</h1>
                        <p className="text-lg text-zinc-400 leading-relaxed max-w-3xl">
                            Values Crucible does not treat values as arbitrary personal preferences. It treats them as an interconnected, functional network of behavioral constraints. We anchor this platform on three foundational research domains.
                        </p>
                    </div>

                    <div className="flex flex-wrap gap-2 border-b border-zinc-800 pb-4">
                        <button onClick={() => setActiveScholar('miller')} className={`py-2 px-4 rounded-md text-xs font-bold tracking-wider uppercase font-mono transition-all ${activeScholar === 'miller' ? 'text-blue-500 bg-blue-500/10 border border-blue-500/20' : 'text-zinc-500 hover:text-white border border-transparent'}`}>William R. Miller</button>
                        <button onClick={() => setActiveScholar('schwartz')} className={`py-2 px-4 rounded-md text-xs font-bold tracking-wider uppercase font-mono transition-all ${activeScholar === 'schwartz' ? 'text-blue-500 bg-blue-500/10 border border-blue-500/20' : 'text-zinc-500 hover:text-white border border-transparent'}`}>Shalom H. Schwartz</button>
                        <button onClick={() => setActiveScholar('kahneman')} className={`py-2 px-4 rounded-md text-xs font-bold tracking-wider uppercase font-mono transition-all ${activeScholar === 'kahneman' ? 'text-blue-500 bg-blue-500/10 border border-blue-500/20' : 'text-zinc-500 hover:text-white border border-transparent'}`}>Daniel Kahneman</button>
                    </div>

                    <div className="space-y-8">
                        {activeScholar === 'miller' && (
                          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-8">
                              <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-8 flex flex-col md:flex-row gap-8">
                                  <img 
                                      src="https://raw.githubusercontent.com/calebchanngaihon/Values-Crucible/main/Miller.png" 
                                      onError={(e) => { e.currentTarget.onerror = null; e.currentTarget.src = "https://static.wixstatic.com/media/2591b9_e3690d3d3a7b4f889b78c9c0b5f10257~mv2.jpg"; }}
                                      className="w-40 h-48 object-cover rounded-xl border border-zinc-700 grayscale" 
                                      alt="William Miller" 
                                  />
                                  <div className="space-y-3">
                                      <span className="font-mono text-xs text-blue-500 uppercase tracking-widest">[Primary Process Architect]</span>
                                      <h2 className="text-2xl font-bold text-white">William R. Miller</h2>
                                      <p className="text-sm text-zinc-400 italic">Emeritus Professor of Psychology and Psychiatry, University of New Mexico. Pioneer of Motivational Interviewing (MI).</p>
                                      <div className="pt-2 border-t border-zinc-800 flex gap-8 text-xs text-zinc-400">
                                          <div><strong className="text-white">Key Work:</strong> Motivational Interviewing (1983)</div>
                                          <div><strong className="text-white">Core Concept:</strong> Evocative Ambivalence Resolution</div>
                                      </div>
                                  </div>
                              </div>

                              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                  <div className="space-y-4">
                                      <h3 className="font-mono text-xs text-blue-400 uppercase tracking-wider">The Behavioral Science</h3>
                                      <p className="text-sm text-zinc-400 leading-relaxed">
                                          Miller's landmark clinical methodology, <strong>Motivational Interviewing (MI)</strong>, is built on the tenet of <em>Evocation</em>. Traditional psychology assumed behavioral change requires external diagnostic prescriptions. Miller proved that telling people who they are or how to behave triggers instant psychological reactance. 
                                      </p>
                                      <p className="text-sm text-zinc-400 leading-relaxed">
                                          True commitment only occurs when individuals experience <strong>"Change Talk"</strong>—the process of verbally generating, organizing, and declaring their own internal values. MI resolves psychological ambivalence by forcing people to resolve the natural discrepancies between current functional behavior and long-term aspirational identity.
                                      </p>
                                  </div>
                                  <div className="space-y-4">
                                      <h3 className="font-mono text-xs text-blue-400 uppercase tracking-wider">Direct Application</h3>
                                      <p className="text-sm text-zinc-400 leading-relaxed">
                                          Crucible bypasses the traditional "prescriptive diagnostic" survey model. Diagnostic surveys ask users to rate arbitrary values on Likert scales (e.g., "Rate Independence from 1-10"). This triggers severe <strong>social desirability bias</strong> and cognitive ease.
                                      </p>
                                      <p className="text-sm text-zinc-400 leading-relaxed">
                                          Instead, Crucible acts as a digital evocation chamber. The overall system provides zero external evaluations or ratings. In Stage 1 and Stage 3, the user must explicitly construct their own contextual schema representing their specific definitions back to them.
                                      </p>
                                  </div>
                              </div>
                          </motion.div>
                        )}
                        {activeScholar === 'schwartz' && (
                          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-8">
                              <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-8 flex flex-col md:flex-row gap-8">
                                  <img 
                                      src="https://raw.githubusercontent.com/calebchanngaihon/Values-Crucible/main/Schwartz.png" 
                                      onError={(e) => { e.currentTarget.onerror = null; e.currentTarget.src = "https://social-psychology.de/do/pt-schwartz.jpg"; }}
                                      className="w-40 h-48 object-cover rounded-xl border border-zinc-700 grayscale" 
                                      alt="Shalom Schwartz" 
                                  />
                                  <div className="space-y-3">
                                      <span className="font-mono text-xs text-blue-500 uppercase tracking-widest">[Structural Core Engineer]</span>
                                      <h2 className="text-2xl font-bold text-white">Shalom H. Schwartz</h2>
                                      <p className="text-sm text-zinc-400 italic">Social Psychologist and Cross-Cultural Researcher, Hebrew University of Jerusalem. Creator of the Basic Human Values Circumplex.</p>
                                      <div className="pt-2 border-t border-zinc-800 flex gap-8 text-xs text-zinc-400">
                                          <div><strong className="text-white">Key Work:</strong> Theory of Basic Human Values (1992)</div>
                                          <div><strong className="text-white">Core Concept:</strong> Motivational Conflict Circumplex</div>
                                      </div>
                                  </div>
                              </div>

                              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                  <div className="space-y-4">
                                      <h3 className="font-mono text-xs text-blue-400 uppercase tracking-wider">The Behavioral Science</h3>
                                      <p className="text-sm text-zinc-400 leading-relaxed">
                                          Schwartz proved that human values across all major cultures are governed by a <strong>universal circular continuum</strong>. Values do not exist in isolation; they are mathematically plotted as motivational clusters along two orthogonal axes:
                                      </p>
                                      <ul className="text-xs text-zinc-400 space-y-2 pl-4 list-disc">
                                          <li><strong>Openness to Change vs. Conservation:</strong> Balancing the drive for independence and stimulation against the need for structural stability and tradition.</li>
                                          <li><strong>Self-Enhancement vs. Self-Transcendence:</strong> Balancing personal ambition, status, and control against global welfare and mutual support.</li>
                                      </ul>
                                      <p className="text-sm text-zinc-400 leading-relaxed">
                                          The proximity of values on the circle determines their psychological compatibility. Values that lie directly opposite (~180° angular difference) represent structural trade-offs. To prioritize one is to systematically starve the other.
                                      </p>
                                  </div>
                                  <div className="space-y-4">
                                      <h3 className="font-mono text-xs text-blue-400 uppercase tracking-wider">Direct Application</h3>
                                      <p className="text-sm text-zinc-400 leading-relaxed">
                                          Schwartz provides the mathematical and algorithmic foundation of <strong>Stage 02: Compression</strong>. The database coordinates each of the 60 seed values to a specific point on the circumplex ($0^\circ - 360^\circ$).
                                      </p>
                                      <p className="text-sm text-zinc-400 leading-relaxed">
                                          Rather than running arbitrary random pairings, the Crucible's tournament generator calculates the <strong>angular distance</strong> between all user-selected resonant values. It purposely seeds head-to-head pairings with the greatest angular delta, triggering structural psychological tension. This reveals whether your identity's functional alignment relies on personal expansion or preservation.
                                      </p>
                                  </div>
                              </div>
                          </motion.div>
                        )}
                        {activeScholar === 'kahneman' && (
                          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-8">
                              <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-8 flex flex-col md:flex-row gap-8">
                                  <img 
                                      src="https://raw.githubusercontent.com/calebchanngaihon/Values-Crucible/main/Kahneman.png" 
                                      onError={(e) => { e.currentTarget.onerror = null; e.currentTarget.src = "https://upload.wikimedia.org/wikipedia/commons/7/79/Daniel_Kahneman_at_the_Commonwealth_Club_%282011%29.jpg"; }}
                                      className="w-40 h-48 object-cover rounded-xl border border-zinc-700 grayscale" 
                                      alt="Daniel Kahneman" 
                                  />
                                  <div className="space-y-3">
                                      <span className="font-mono text-xs text-blue-500 uppercase tracking-widest">[Cognitive Friction Strategist]</span>
                                      <h2 className="text-2xl font-bold text-white">Daniel Kahneman</h2>
                                      <p className="text-sm text-zinc-400 italic">Nobel Laureate in Behavioral Economics. Author of "Thinking, Fast and Slow".</p>
                                      <div className="pt-2 border-t border-zinc-800 flex gap-8 text-xs text-zinc-400">
                                          <div><strong className="text-white">Key Work:</strong> Heuristics and Biases / Prospect Theory</div>
                                          <div><strong className="text-white">Core Concept:</strong> Dual-Process System Dynamics</div>
                                      </div>
                                  </div>
                              </div>

                              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                  <div className="space-y-4">
                                      <h3 className="font-mono text-xs text-blue-400 uppercase tracking-wider">The Behavioral Science</h3>
                                      <p className="text-sm text-zinc-400 leading-relaxed">
                                          Kahneman defined the human cognitive architecture as an ongoing operational dance between two systems of thought:
                                      </p>
                                      <ul className="text-xs text-zinc-400 space-y-2 pl-4 list-disc">
                                          <li><strong>System 1 (Fast & Intuitive):</strong> Operates automatically, quickly, and with little to no voluntary effort. It relies heavily on associative memory and heuristics, looking for immediate coherence and comfort.</li>
                                          <li><strong>System 2 (Slow & Effortful):</strong> Allocates attention to the effortful mental operations that demand it. It is activated when the brain encounters cognitive strain, discrepancies, or physical barriers.</li>
                                      </ul>
                                      <p className="text-sm text-zinc-400 leading-relaxed">
                                          Most software interfaces are optimized for System 1. They are built for extreme ease and mindless navigation. This is catastrophically counterproductive for self-reflection, as System 1 relies on shallow social signaling and automatic, unvetted preferences.
                                      </p>
                                  </div>
                                  <div className="space-y-4">
                                      <h3 className="font-mono text-xs text-blue-400 uppercase tracking-wider">Direct Application</h3>
                                      <p className="text-sm text-zinc-400 leading-relaxed">
                                          Crucible intentionally structures its interaction design to switch between System 1 and System 2. 
                                      </p>
                                      <p className="text-sm text-zinc-400 leading-relaxed">
                                          <strong>Stage 1 (Extraction)</strong> intentionally leverages <strong>System 1</strong> to quickly bypass the intellectual internal critic. By presenting values in rapid, swipe-based sequences, we capture immediate visceral resonance before the user can over-rationalize.
                                      </p>
                                      <p className="text-sm text-zinc-400 leading-relaxed">
                                          In <strong>Stage 2 (Compression)</strong>, we systematically shut down System 1. The <strong>Speed Trap</strong> monitor and the <strong>Tactile Sacrifice</strong> (sustained hold) introduce micro-frictional boundaries. This forces physical delay and mental deceleration, triggering System 2 logic to process the structural pain of sacrifice in real-time.
                                      </p>
                                  </div>
                              </div>
                          </motion.div>
                        )}
                    </div>
                  </motion.section>
                )}

                {/* SECTION 2: THE FORGE FLOW */}
                {activeTab === 'flow' && (
                  <motion.section 
                    key="flow"
                    initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}
                    className="space-y-16"
                  >
                    <div className="space-y-12">
                      <div>
                          <span className="font-mono text-xs text-blue-500 uppercase tracking-widest block mb-2">[02 // Interaction Pipeline]</span>
                          <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight text-white mb-6">The Forge Flow</h1>
                          <p className="text-lg text-zinc-400 max-w-3xl leading-relaxed">
                              Crucible moves the user from high-volume, intuitive resonance to low-volume, high-strain commitment. Each phase is a precise algorithmic and mechanical step.
                          </p>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                          <div className="bg-zinc-900 border border-zinc-800 p-6 rounded-xl space-y-4">
                              <div className="font-mono text-xs text-blue-500 uppercase tracking-widest">[Step 01]</div>
                              <h3 className="text-xl font-bold text-white">Extraction</h3>
                              <p className="text-sm text-zinc-400">
                                  A high-speed, card-based sorting engine designed to extract raw signal from external noise.
                              </p>
                              <div className="bg-zinc-950 border border-zinc-800 p-4 rounded-lg mt-auto">
                                  <span className="font-mono text-[10px] text-zinc-500 block mb-1">State Target:</span>
                                  <p className="text-xs text-zinc-400 font-light">60 values sorted to ~15-20 resonant states via instant binary swipes.</p>
                              </div>
                          </div>

                          <div className="bg-zinc-900 border border-zinc-800 p-6 rounded-xl space-y-4">
                              <div className="font-mono text-xs text-blue-500 uppercase tracking-widest">[Step 02]</div>
                              <h3 className="text-xl font-bold text-white">Compression</h3>
                              <p className="text-sm text-zinc-400">
                                  An ELO-ranked, paired comparison tournament focused on motivational conflict axes.
                              </p>
                              <div className="bg-zinc-950 border border-zinc-800 p-4 rounded-lg mt-auto">
                                  <span className="font-mono text-[10px] text-zinc-500 block mb-1">State Target:</span>
                                  <p className="text-xs text-zinc-400 font-light">Direct trade-off processing with tactile holds (800ms) to yield 5 core survivors.</p>
                              </div>
                          </div>

                          <div className="bg-zinc-900 border border-zinc-800 p-6 rounded-xl space-y-4">
                              <div className="font-mono text-xs text-blue-500 uppercase tracking-widest">[Step 03]</div>
                              <h3 className="text-xl font-bold text-white">Casting</h3>
                              <p className="text-sm text-zinc-400">
                                  The termination of automation. Absolute user sovereignty over the final system.
                              </p>
                              <div className="bg-zinc-950 border border-zinc-800 p-4 rounded-lg mt-auto">
                                  <span className="font-mono text-[10px] text-zinc-500 block mb-1">State Target:</span>
                                  <p className="text-xs text-zinc-400 font-light">The user manually drags exactly 3 selected finalists into the core commit zone.</p>
                              </div>
                          </div>
                      </div>

                      {/* LIVE SANDBOX SIMULATOR */}
                      <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-8 space-y-6">
                          <div>
                              <span className="font-mono text-xs text-blue-500 uppercase tracking-widest block mb-1">[Interactive Mechanics Sandbox]</span>
                              <h3 className="text-2xl font-bold text-white">Tactile Sacrifice Interface</h3>
                              <p className="text-sm text-zinc-400">
                                  Experience the soft friction model. Test the difference between rapid clicking (System 1) and sustained choice commitment (System 2).
                              </p>
                          </div>

                          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 pt-4">
                              {/* Card A */}
                              <div 
                                  onPointerDown={(e) => { if(e.pointerType === 'mouse' && e.button !== 0) return; startSandboxHold('a'); }}
                                  onPointerUp={cancelSandboxHold}
                                  onPointerLeave={cancelSandboxHold}
                                  onPointerCancel={cancelSandboxHold}
                                  onContextMenu={(e) => e.preventDefault()}
                                  style={{ touchAction: 'none' }}
                                  className={`relative border rounded-xl p-8 cursor-pointer select-none overflow-hidden h-48 flex flex-col justify-between transition-all duration-300 ${
                                    sandboxStatus === 'cast_a' ? 'bg-zinc-800 border-zinc-700 blur-none opacity-100' :
                                    (sandboxStatus === 'compressing_b' || sandboxStatus === 'cast_b') ? 'bg-zinc-950 border-zinc-800 border-dashed opacity-30 blur-sm' :
                                    'bg-zinc-950 border-zinc-800 hover:bg-zinc-900'
                                  }`}
                              >
                                  {sandboxStatus === 'compressing_a' && (
                                    <div className="absolute top-0 left-0 h-1 bg-blue-500" style={{ width: `${sandboxProgress}%` }} />
                                  )}
                                  <div>
                                      <span className="font-mono text-[10px] text-zinc-500">[Motivated Choice A]</span>
                                      <h4 className="text-2xl font-bold mt-1 text-white">AUTONOMY</h4>
                                  </div>
                                  <p className={`text-xs transition-colors duration-300 ${(sandboxStatus === 'compressing_b' || sandboxStatus === 'cast_b') ? 'text-red-400 italic' : 'text-zinc-400'}`}>
                                      {(sandboxStatus === 'compressing_b' || sandboxStatus === 'cast_b') ? 'SACRIFICING your personal freedom, choice independence, and autonomy...' : 'Being in control of your own life and making your own choices.'}
                                  </p>
                              </div>

                              {/* Card B */}
                              <div 
                                  onPointerDown={(e) => { if(e.pointerType === 'mouse' && e.button !== 0) return; startSandboxHold('b'); }}
                                  onPointerUp={cancelSandboxHold}
                                  onPointerLeave={cancelSandboxHold}
                                  onPointerCancel={cancelSandboxHold}
                                  onContextMenu={(e) => e.preventDefault()}
                                  style={{ touchAction: 'none' }}
                                  className={`relative border rounded-xl p-8 cursor-pointer select-none overflow-hidden h-48 flex flex-col justify-between transition-all duration-300 ${
                                    sandboxStatus === 'cast_b' ? 'bg-zinc-800 border-zinc-700 blur-none opacity-100' :
                                    (sandboxStatus === 'compressing_a' || sandboxStatus === 'cast_a') ? 'bg-zinc-950 border-zinc-800 border-dashed opacity-30 blur-sm' :
                                    'bg-zinc-950 border-zinc-800 hover:bg-zinc-900'
                                  }`}
                              >
                                  {sandboxStatus === 'compressing_b' && (
                                    <div className="absolute top-0 left-0 h-1 bg-blue-500" style={{ width: `${sandboxProgress}%` }} />
                                  )}
                                  <div>
                                      <span className="font-mono text-[10px] text-zinc-500">[Motivated Choice B]</span>
                                      <h4 className="text-2xl font-bold mt-1 text-white">SECURITY</h4>
                                  </div>
                                  <p className={`text-xs transition-colors duration-300 ${(sandboxStatus === 'compressing_a' || sandboxStatus === 'cast_a') ? 'text-red-400 italic' : 'text-zinc-400'}`}>
                                      {(sandboxStatus === 'compressing_a' || sandboxStatus === 'cast_a') ? 'SACRIFICING stability, baseline safety, and long-term security structures...' : 'Safety, harmony, and stability of society and relationships.'}
                                  </p>
                              </div>
                          </div>

                          <div className="flex justify-between items-center text-xs text-zinc-500 pt-4 border-t border-zinc-800 font-mono flex-wrap gap-2">
                              <span>
                                STATUS:{' '}
                                {sandboxStatus === 'awaiting' && <span className="text-zinc-400">AWAITING SYSTEM SELECTION</span>}
                                {sandboxStatus === 'compressing_a' && <span className="text-blue-400">COMPRESSING VALUE [AUTONOMY]...</span>}
                                {sandboxStatus === 'compressing_b' && <span className="text-blue-400">COMPRESSING VALUE [SECURITY]...</span>}
                                {sandboxStatus === 'cast_a' && <span className="text-emerald-400">VALUE [AUTONOMY] SUCCESSFULLY CAST TO THE COMPASS.</span>}
                                {sandboxStatus === 'cast_b' && <span className="text-emerald-400">VALUE [SECURITY] SUCCESSFULLY CAST TO THE COMPASS.</span>}
                              </span>
                              <span>HOLD TRIGGER WINDOW: 800ms</span>
                          </div>
                      </div>
                    </div>
                  </motion.section>
                )}

                {/* SECTION 3: SCHWARTZ CIRCUMPLEX */}
                {activeTab === 'schwartz' && (
                  <motion.section 
                    key="schwartz"
                    initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}
                    className="space-y-12"
                  >
                    <div>
                        <span className="font-mono text-xs text-blue-500 uppercase tracking-widest block mb-2">[03 // Relational Geometry]</span>
                        <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight text-white mb-6">The Schwartz Universal Map</h1>
                        <p className="text-lg text-zinc-400 max-w-3xl leading-relaxed">
                            Every value is mapped to a specific radial position on Schwartz's Circumplex. Proximity indicates motivational alignment, while opposition creates structural conflict.
                        </p>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
                        {/* SVG Visualization */}
                        <div className="lg:col-span-7 bg-zinc-900 border border-zinc-800 rounded-2xl p-8 flex justify-center overflow-hidden">
                            <svg viewBox="0 0 400 400" className="w-full max-w-[380px] h-auto select-none">
                                {/* Outer Rim */}
                                <circle cx="200" cy="200" r="180" fill="none" stroke="#3f3f46" strokeWidth="1.5"/>
                                {/* Inner Core Circle */}
                                <circle cx="200" cy="200" r="90" fill="none" stroke="#27272a" strokeWidth="1" strokeDasharray="4"/>
                                
                                {/* Axis Crosshairs */}
                                <line x1="200" y1="20" x2="200" y2="380" stroke="#27272a" strokeWidth="1"/>
                                <line x1="20" y1="200" x2="380" y2="200" stroke="#27272a" strokeWidth="1"/>

                                {/* Interactive Segments */}
                                {[
                                  { id: 1, d: "M 200 200 L 380 200 A 180 180 0 0 1 345.6 305.8 Z" },
                                  { id: 2, d: "M 200 200 L 345.6 305.8 A 180 180 0 0 1 255.6 371.2 Z" },
                                  { id: 3, d: "M 200 200 L 255.6 371.2 A 180 180 0 0 1 144.4 371.2 Z" },
                                  { id: 4, d: "M 200 200 L 144.4 371.2 A 180 180 0 0 1 54.4 305.8 Z" },
                                  { id: 5, d: "M 200 200 L 54.4 305.8 A 180 180 0 0 1 20 200 Z" },
                                  { id: 6, d: "M 200 200 L 20 200 A 180 180 0 0 1 54.4 94.2 Z" },
                                  { id: 7, d: "M 200 200 L 54.4 94.2 A 180 180 0 0 1 144.4 28.8 Z" },
                                  { id: 8, d: "M 200 200 L 144.4 28.8 A 180 180 0 0 1 255.6 28.8 Z" },
                                  { id: 9, d: "M 200 200 L 255.6 28.8 A 180 180 0 0 1 345.6 94.2 Z" },
                                  { id: 10, d: "M 200 200 L 345.6 94.2 A 180 180 0 0 1 380 200 Z" },
                                ].map(({id, d}) => (
                                  <path 
                                    key={id}
                                    d={d}
                                    fill={selectedPole === id ? "rgba(59, 130, 246, 0.25)" : "rgba(24, 24, 27, 0.4)"}
                                    stroke={selectedPole === id ? "#3b82f6" : "#3f3f46"}
                                    strokeWidth={selectedPole === id ? 2 : 0.75}
                                    className="cursor-pointer transition-all duration-300 hover:fill-blue-500/15 hover:stroke-blue-500 hover:stroke-[1.5px]"
                                    onClick={() => setSelectedPole(id)}
                                  />
                                ))}

                                {/* Center Mask */}
                                <circle cx="200" cy="200" r="50" fill="#18181b" stroke="#3f3f46" strokeWidth="1"/>
                                <circle cx="200" cy="200" r="4" fill="#3b82f6"/>
                                
                                {/* Axis Anchors Text */}
                                <text x="200" y="35" className="font-mono text-[8px] fill-zinc-500 font-bold" textAnchor="middle">OPENNESS</text>
                                <text x="200" y="375" className="font-mono text-[8px] fill-zinc-500 font-bold" textAnchor="middle">CONSERVATION</text>
                                <text x="370" y="205" className="font-mono text-[8px] fill-zinc-500 font-bold" textAnchor="end">ENHANCEMENT</text>
                                <text x="30" y="205" className="font-mono text-[8px] fill-zinc-500 font-bold" textAnchor="start">TRANSCENDENCE</text>
                            </svg>
                        </div>

                        {/* Live Sector Info Panel */}
                        <div className="lg:col-span-5 bg-zinc-900 border border-zinc-800 rounded-2xl p-8 flex flex-col justify-between min-h-[444px]">
                            <div className="space-y-4">
                                <div className="flex items-center justify-between">
                                    <span className="font-mono text-xs text-blue-500 uppercase tracking-widest">[Sector Diagnostic]</span>
                                    <span className="font-mono text-xs text-zinc-500">ANGLE: {poleData.deg}</span>
                                </div>
                                <h3 className="text-3xl font-extrabold tracking-tight text-white">{poleData.title}</h3>
                                <p className="font-mono text-xs text-blue-400 font-bold uppercase">Axis: {poleData.axis}</p>
                                <p className="text-sm text-zinc-400 leading-relaxed">
                                    {poleData.desc}
                                </p>
                            </div>

                            <div className="pt-6 border-t border-zinc-800 space-y-2 mt-8">
                                <span className="font-mono text-[10px] text-zinc-500 uppercase block">Conflict Antagonist:</span>
                                <div className="text-xs text-red-400 font-bold uppercase font-mono">{poleData.conflict}</div>
                            </div>
                        </div>

                    </div>
                  </motion.section>
                )}

                {/* SECTION 4: THE TEMPERING PROCESS */}
                {activeTab === 'tempering' && (
                  <motion.section 
                    key="tempering"
                    initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}
                    className="space-y-12"
                  >
                      <div>
                          <span className="font-mono text-xs text-blue-500 uppercase tracking-widest block mb-2">[04 // Reintegration]</span>
                          <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight text-white mb-6">The Tempering Process</h1>
                          <p className="text-lg text-zinc-400 max-w-3xl leading-relaxed">
                              In Phase 1, we extracted and compressed raw signals into your Triad. In Phase 2, we move from <strong>identifying</strong> values to <strong>functionalizing</strong> them. The AI Scribe guides you through three stages of Tempering to forge a resilient Life Operating System.
                          </p>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                          {/* Layer 1 */}
                          <div className="bg-zinc-900 border border-zinc-800 p-8 rounded-2xl space-y-4">
                              <div className="font-mono text-xs text-blue-500 uppercase">[Stage 01]</div>
                              <h3 className="text-xl font-bold text-white">The Honing</h3>
                              <div className="text-xs text-zinc-500 font-mono font-bold uppercase mb-2">Semantic Hardening</div>
                              <p className="text-sm text-zinc-400">The <strong>AI Scribe</strong> acts as a cognitive mirror. Rather than accepting a dictionary definition, it recursively challenges your input until you articulate a precise, personal anchor. This <em>sharpens the edge</em> of the value, ensuring it means exactly what you need it to mean.</p>
                          </div>
                          {/* Layer 2 */}
                          <div className="bg-zinc-900 border border-zinc-800 p-8 rounded-2xl space-y-4">
                              <div className="font-mono text-xs text-blue-500 uppercase">[Stage 02]</div>
                              <h3 className="text-xl font-bold text-white">The Anvil</h3>
                              <div className="text-xs text-zinc-500 font-mono font-bold uppercase mb-2">Operational Mapping</div>
                              <p className="text-sm text-zinc-400">The <strong>Dilemma Engine</strong> generates a real-world stress-test based on Schwartz's Circumplex. By striking your values against simulated "wicked problems," we forge actionable "If-Then" logic, ensuring your values hold their shape under pressure.</p>
                          </div>
                          {/* Layer 3 */}
                          <div className="bg-zinc-900 border border-zinc-800 p-8 rounded-2xl space-y-4">
                              <div className="font-mono text-xs text-blue-500 uppercase">[Stage 03]</div>
                              <h3 className="text-xl font-bold text-white">The Quenching</h3>
                              <div className="text-xs text-zinc-500 font-mono font-bold uppercase mb-2">Master Directive</div>
                              <p className="text-sm text-zinc-400">The final, rapid cooling that locks the structure in place. In this singularity event, you pit your final three values against each other in an ultimate sacrifice scenario to reveal the <strong>"Prime Mover"</strong> of your system.</p>
                          </div>
                      </div>

                      <div className="bg-zinc-950 border border-zinc-800 p-8 md:p-10 rounded-2xl space-y-8">
                          <div>
                              <h3 className="text-2xl font-bold mb-2 text-white">The Decision Filter [Live Simulator]</h3>
                              <p className="text-zinc-400">How your "Tempered Core" processes a real-world dilemma following the Anvil stage.</p>
                          </div>

                          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
                              <div className="space-y-6">
                                  <div className="bg-black p-6 rounded-xl border border-zinc-800">
                                      <label className="font-mono text-[10px] text-zinc-500 block mb-2 uppercase">Input Dilemma:</label>
                                      <p className="text-sm text-zinc-300">"A high-paying promotion requires me to relocate, moving me away from my aging parents and childhood community."</p>
                                  </div>
                                  <div className="flex flex-wrap gap-4">
                                      <div className="px-4 py-2 bg-blue-500/10 border border-blue-500/20 rounded-full text-xs font-mono text-blue-400">VALUE: MASTERY</div>
                                      <div className="px-4 py-2 bg-blue-500/10 border border-blue-500/20 rounded-full text-xs font-mono text-blue-400">VALUE: LOYALTY</div>
                                      <div className="px-4 py-2 bg-blue-500/10 border border-blue-500/20 rounded-full text-xs font-mono text-blue-400">VALUE: SECURITY</div>
                                  </div>
                              </div>

                              <div className="bg-zinc-900/50 p-8 rounded-2xl border border-zinc-800 space-y-4">
                                  <h4 className="font-mono text-xs text-blue-500 uppercase">Process Result:</h4>
                                  <div className="space-y-3">
                                      <div className="flex items-center gap-3 text-sm text-zinc-300">
                                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 shrink-0"></span>
                                          <span>Loyalty Conflict Detected (Pole 9 vs Pole 4)</span>
                                      </div>
                                      <div className="flex items-center gap-3 text-sm text-zinc-300">
                                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 shrink-0"></span>
                                          <span>Mastery Threshold: MET (+15% Growth)</span>
                                      </div>
                                      <div className="p-4 bg-zinc-800 rounded-lg text-xs italic text-zinc-400 border border-zinc-700 mt-4 leading-relaxed">
                                          "Alignment Check: This choice compromises your defined 'Anchor of Proximity' forged during The Honing. Recommendation: Renegotiate for remote hybrid or decline to maintain systemic integrity."
                                      </div>
                                  </div>
                              </div>
                          </div>
                      </div>
                  </motion.section>
                )}

                {/* SECTION 5: MATHEMATICAL LEDGER */}
                {activeTab === 'ledger' && (
                  <motion.section 
                    key="ledger"
                    initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}
                    className="space-y-12"
                  >
                    <div>
                        <span className="font-mono text-xs text-blue-500 uppercase tracking-widest block mb-2">[05 // Hard Algorithms]</span>
                        <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight text-white mb-6">The Mathematical Ledger</h1>
                        <p className="text-lg text-zinc-400 max-w-3xl leading-relaxed">
                            Crucible calculates the underlying values network mathematically. The engineering agent requires precise formulas to map conflict, update rating weight, and run heuristic transitions.
                        </p>
                    </div>

                    <div className="space-y-8">
                        {/* 1. Paired Comparison Scaling (ELO Formula) */}
                        <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-8 space-y-4">
                            <h3 className="text-xl font-bold text-white">1. Paired Comparison Scaling (ELO Formula)</h3>
                            <p className="text-sm text-zinc-400 leading-relaxed">
                                Rather than using ordinal ranking, Crucible models values using Thurstone's Law of Comparative Judgment via an ELO rating engine. The expected probability E<sub>A</sub> of choosing Value A over Value B is modeled as:
                            </p>
                            <div className="py-6 text-center text-lg font-mono tracking-widest text-[#fafafa] bg-zinc-950 rounded-lg">
                                E<sub className="text-xs">A</sub> = 1 / (1 + 10<sup className="text-xs">(R<sub className="text-[10px]">B</sub> - R<sub className="text-[10px]">A</sub>) / 400</sup>)
                            </div>
                            <p className="text-sm text-zinc-400 leading-relaxed">
                                Upon selection, the rating of Value A is updated based on the actual outcome S<sub>A</sub> (1 for win, 0 for loss) using the dynamic modifier K:
                            </p>
                            <div className="py-6 text-center text-lg font-mono tracking-widest text-[#fafafa] bg-zinc-950 rounded-lg">
                                R'<sub className="text-xs">A</sub> = R<sub className="text-xs">A</sub> + K(S<sub className="text-xs">A</sub> - E<sub className="text-xs">A</sub>)
                            </div>
                            <div className="text-xs text-zinc-500 font-mono border-t border-zinc-800 pt-4">
                                * Note: K-Factor is configured to 32 for the initial tournament stages to establish rapid signal divergence.
                            </div>
                        </div>

                        {/* Angular Distance */}
                        <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-8 space-y-4">
                            <h3 className="text-xl font-bold text-white">2. Angular Polarization Metric</h3>
                            <p className="text-sm text-zinc-400 leading-relaxed">
                                To prioritize "bipolar" stress-testing in Stage 2, the algorithm calculates the radial distance Δθ between two active values to construct matchups:
                            </p>
                            <div className="py-6 text-center text-lg font-mono tracking-widest text-[#fafafa] bg-zinc-950 rounded-lg">
                                Δθ = min(|θ<sub className="text-xs">1</sub> - θ<sub className="text-xs">2</sub>|, 360° - |θ<sub className="text-xs">1</sub> - θ<sub className="text-xs">2</sub>|)
                            </div>
                            <p className="text-sm text-zinc-400 leading-relaxed">
                                Matchmaking prioritizes pairings where Δθ ≈ 180° (axial opposites) followed by Δθ ≈ 90° (orthogonal tensions).
                            </p>
                        </div>

                        {/* Dynamic Friction */}
                        <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-8 space-y-4">
                            <h3 className="text-xl font-bold text-white">3. Dynamic Adaptive Friction Coefficient</h3>
                            <p className="text-sm text-zinc-400 leading-relaxed">
                                To dynamically counter associative System 1 clicking, the physics engine governs UI transition latency using a custom kinetic damping equation. If the interaction interval Δt (time between decisions) falls below a critical threshold τ = 1.5s, the transition friction increases exponentially:
                            </p>
                            <div className="py-6 text-center text-lg font-mono tracking-widest text-[#fafafa] bg-zinc-950 rounded-lg">
                                μ<sub className="text-xs">d</sub> = μ<sub className="text-xs">0</sub> · (1 + α · e<sup className="text-xs">-Δt / τ</sup>)
                            </div>
                            <p className="text-sm text-zinc-400 leading-relaxed">
                                where μ<sub>0</sub> is baseline damping and α represents the scaling intensity of the physical Speed Trap.
                            </p>
                        </div>
                    </div>
                  </motion.section>
                )}

                {/* SECTION 6: ACADEMIC SOURCES */}
                {activeTab === 'citations' && (
                  <motion.section 
                    key="citations"
                    initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}
                    className="space-y-12"
                  >
                    <div>
                        <span className="font-mono text-xs text-blue-500 uppercase tracking-widest block mb-2">[06 // Reference Library]</span>
                        <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight text-white mb-6">Academic Ledger</h1>
                        <p className="text-lg text-zinc-400 max-w-3xl leading-relaxed">
                            Every element of this system is grounded in peer-reviewed psychology, behavioral economics, and human-computer interaction literature.
                        </p>
                    </div>

                    <ul className="space-y-6">
                        <li className="pl-4 border-l-2 border-zinc-800 hover:border-blue-500 transition-colors py-1">
                            <strong className="text-white block text-base font-bold mb-1">Miller, W. R., & Rollnick, S. (2012).</strong>
                            <span className="text-sm text-zinc-400 block mb-2">Motivational Interviewing: Helping People Change (3rd ed.). Guilford Press.</span>
                            <a href="https://www.guilford.com/books/Motivational-Interviewing/Miller-Rollnick/9781609182274" target="_blank" rel="noreferrer" className="text-xs text-blue-500 hover:underline font-mono inline-flex items-center gap-1">Guilford Publication Link <ExternalLink className="w-3 h-3" /></a>
                        </li>
                        <li className="pl-4 border-l-2 border-zinc-800 hover:border-blue-500 transition-colors py-1">
                            <strong className="text-white block text-base font-bold mb-1">Schwartz, S. H. (2012).</strong>
                            <span className="text-sm text-zinc-400 block mb-2">An Overview of the Schwartz Theory of Basic Values. Online Readings in Psychology and Culture, 2(1).</span>
                            <a href="https://scholarworks.gvsu.edu/orpc/vol2/iss1/8/" target="_blank" rel="noreferrer" className="text-xs text-blue-500 hover:underline font-mono inline-flex items-center gap-1">GVSU ScholarWorks Link <ExternalLink className="w-3 h-3" /></a>
                        </li>
                        <li className="pl-4 border-l-2 border-zinc-800 hover:border-blue-500 transition-colors py-1">
                            <strong className="text-white block text-base font-bold mb-1">Kahneman, D. (2011).</strong>
                            <span className="text-sm text-zinc-400 block mb-2">Thinking, Fast and Slow. Farrar, Straus and Giroux.</span>
                            <span className="text-xs text-zinc-500 block">Systemic formulation of dual-process cognition and decision biases.</span>
                        </li>
                        <li className="pl-4 border-l-2 border-zinc-800 hover:border-blue-500 transition-colors py-1">
                            <strong className="text-white block text-base font-bold mb-1">Thurstone, L. L. (1927).</strong>
                            <span className="text-sm text-zinc-400 block mb-2">A Law of Comparative Judgment. Psychological Review, 34(4), 273–286.</span>
                            <a href="https://psychology.okstate.edu/faculty/jgrice/psyc5123/Thurstone_1927.pdf" target="_blank" rel="noreferrer" className="text-xs text-blue-500 hover:underline font-mono inline-flex items-center gap-1">Academic PDF Link <ExternalLink className="w-3 h-3" /></a>
                        </li>
                    </ul>
                  </motion.section>
                )}

              </AnimatePresence>
            </div>
          </main>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
