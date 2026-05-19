import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ValueNode } from '../types';

interface ClinicalScribeProps {
  apiEndpoint: string;
  payload: any;
  onResponse?: (responseObj: any) => void;
  onTypingComplete?: (text: string) => void;
  trigger: boolean;
  thinkingText?: string;
  label?: string;
}

export const ClinicalScribe: React.FC<ClinicalScribeProps> = ({ apiEndpoint, payload, onResponse, onTypingComplete, trigger, thinkingText = "SYSTEM PROCESSING...", label = "COGNITIVE MIRROR" }) => {
  const [status, setStatus] = useState<'idle' | 'processing' | 'done'>('idle');
  const [displayedText, setDisplayedText] = useState('');
  const [fullText, setFullText] = useState('');
  const typingCompleteRef = useRef(false);

  useEffect(() => {
    let active = true;

    if (trigger && status === 'idle') {
      setStatus('processing');
      setDisplayedText('');
      setFullText('');
      typingCompleteRef.current = false;

      fetch(apiEndpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })
        .then((res) => res.json())
        .then((data) => {
          if (!active) return;
          const text = data.result || data.dilemma || data.manifesto || (data.error ? "ERROR: " + data.error : "ERROR: NO RESPONSE");
          setFullText(text);
          setStatus('done');
          if (onResponse) onResponse(data);
        })
        .catch((err) => {
          if (!active) return;
          console.error(err);
          const errorMsg = "ERROR: " + err.message;
          setFullText(errorMsg);
          setStatus('done');
          if (onResponse) onResponse({ error: errorMsg });
        });
    }

    return () => { active = false; };
  }, [trigger, apiEndpoint, payload]); // status and onResponse deliberately omitted to prevent re-fetching/cancelling

  useEffect(() => {
    if (status === 'done') {
       if (fullText.length > displayedText.length) {
         const timeout = setTimeout(() => {
           setDisplayedText(fullText.slice(0, displayedText.length + 1));
         }, 10); // typing speed
         return () => clearTimeout(timeout);
       } else if (!typingCompleteRef.current) {
         typingCompleteRef.current = true;
         if (onTypingComplete) {
           onTypingComplete(fullText);
         }
       }
    }
  }, [status, fullText, displayedText, onTypingComplete]);

  if (status === 'idle') return null;

  return (
    <div className="font-mono text-sm leading-relaxed text-zinc-300 bg-black p-6 rounded-lg border border-zinc-800 my-4 shadow-inner">
      <div className="text-[10px] text-blue-500 mb-4 uppercase tracking-widest bg-blue-500/10 inline-block px-2 py-1 rounded">
        {label}
      </div>
      {status === 'processing' && (
        <motion.div
           animate={{ opacity: [0.4, 0.8, 0.4] }}
           transition={{ duration: 1.5, repeat: Infinity }}
           className="text-zinc-500 tracking-widest mt-2 uppercase"
        >
          [{thinkingText}]
        </motion.div>
      )}
      {status === 'done' && (
        <div className="whitespace-pre-wrap">{displayedText}
          {displayedText.length < fullText.length && <span className="inline-block w-2 h-4 bg-zinc-500 ml-1 animate-pulse" />}
        </div>
      )}
    </div>
  );
};
