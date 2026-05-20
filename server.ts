import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI } from "@google/genai";
import dotenv from "dotenv";

dotenv.config();

// The AI is configured to be supportive, use active context mining, and adaptive friction.
const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
const CLINICAL_SYSTEM_PROMPT = `[ROLE]
You are the "Clinical Scribe" for The Values Crucible. You are a cognitive mirror designed to facilitate "Productive Struggle." You help the user refine their thoughts.

[OBJECTIVE]
Your task is to guide the user through "The Honing," "The Anvil," and "The Quenching" (The Tempering Phase). You test their assumptions and help them arrive at a clear, experiential anchor.

[STRICT BEHAVIORAL RULES]
1. ACTIVE CONTEXT MINING: Throughout all stages, actively scan the user's chat history and provided data for specific domain markers (e.g., their industry, current projects, geographic location, or leadership roles). Frame every question, dilemma, and summary using this exact vocabulary. Never use generic hypotheticals.
2. ADAPTIVE FRICTION (CALIBRATED RESISTANCE): Push back slightly if their answer is too vague, fluffy, or generic. Do not accept a purely dictionary definition or a weak compromise. Ask for a brief, concrete example or structural boundary before accepting it. Do not be overly aggressive, but do not let them off too easily.
3. THE ASSIST: If the user struggles or their input remains vague, do not force them into an endless loop. Instead, use their context to offer a "soft bridge." Example of the Assist: "You defined Autonomy as 'having freedom.' To lock this in, would you say this means freedom over what projects you take on, or freedom over your daily schedule? Pick one."
4. CLEAR MINIMALISM: Keep your responses to 1-3 sentences maximum. Be direct, clear, and easy to understand.
5. TONE: Be supportive but rigorous. Maintain a standard for clarity, pushing them just a little harder to ground their abstract thoughts into tangible reality.`;

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  app.post("/api/honing", async (req, res) => {
    try {
      const { valueLabel, currentDefinition, iteration, history } = req.body;
      let prompt = "";
      if (iteration < 3) {
        prompt = `[THE INTERACTION LOOP]
The user is defining their core value of '${valueLabel}'.
Their current definition is: "${currentDefinition}".
${history ? `Previous iteration history:\n${history}\n` : ''}

Analyze the definition.
If it is reasonably concrete and grounded in their reality, accept it immediately and synthesize their response into a single, hardened "Manifesto Statement" starting with the exact marker "[HARDENED DEFINITION LOGGED]".
Format:
[HARDENED DEFINITION LOGGED]: {A concise, 1-2 sentence summary of their personal definition and boundaries.}

If it is vague, generic, or overly academic, apply CALIBRATED RESISTANCE to briefly challenge them for a concrete example or boundary.
If they are still struggling, use THE ASSIST to offer a soft bridge with clear options.

Output only your response/probe or synthesis in 1-3 sentences.`;
      } else {
        prompt = `[SYNTHESIS PHASE]
The user has been refining their core value of '${valueLabel}'.
Their final definition is: "${currentDefinition}".
${history ? `Previous iteration history:\n${history}\n` : ''}

Accept it. Synthesize their responses into a single, hardened "Manifesto Statement" starting with the exact marker "[HARDENED DEFINITION LOGGED]".
Format:
[HARDENED DEFINITION LOGGED]: {A concise, 1-2 sentence summary of their personal definition and boundaries.}`;
      }

      const response = await ai.models.generateContent({
        model: "gemini-3.1-pro-preview",
        contents: prompt,
        config: {
          systemInstruction: CLINICAL_SYSTEM_PROMPT,
          temperature: 0.2,
        }
      });

      res.json({ result: response.text });
    } catch (e: any) {
      console.error(e);
      res.status(500).json({ error: e.message });
    }
  });

  app.post("/api/anvil", async (req, res) => {
    try {
      const { 
        step,
        value1,
        value2,
        anchor1,
        anchor2,
        userResponse,
        scenario,
        history
      } = req.body;

      if (step === "generate_dilemma") {
        const prompt = `[PHASE-GATE: THE HONING IS COMPLETE]
The Anchor Statements provided below are HARDENED and BEYOND DISPUTE.

[INPUT DATA: THE HARDENED CORE]
Value A: ${value1} | Anchor: "${anchor1}"
Value B: ${value2} | Anchor: "${anchor2}"

[STRICT BEHAVIORAL RULES]
1. ACTIVE CONTEXT MINING: Frame the dilemma heavily around their specific industry/domain/context inferred from the anchors or chat history.

[THE INTERACTION LOOP]
TURN 1 (THE ANVIL STRIKE):
Generate a context-specific dilemma where honoring Anchor A creates a conflict with Anchor B. Use "The Assist" to frame the dilemma simply.
Ask: "How do you resolve this dilemma while honoring both ${value1} and ${value2}?"`;

        const response = await ai.models.generateContent({
          model: "gemini-3.1-pro-preview",
          contents: prompt,
          config: {
            systemInstruction: CLINICAL_SYSTEM_PROMPT,
            temperature: 0.4,
          }
        });
        res.json({ dilemma: response.text });
      } else if (step === "evaluate") {
        const prompt = `[INPUT DATA: THE HARDENED CORE]
Value A: ${value1} | Anchor: "${anchor1}"
Value B: ${value2} | Anchor: "${anchor2}"

[HISTORY]
Dilemma initially presented: "${scenario}"
${history ? `Previous interactions:\n${history}\n` : ''}
User's current resolution: "${userResponse}"

[THE INTERACTION LOOP]
TURN 2 (THE ALIGNMENT CHECK & SYNTHESIS):
Apply CALIBRATED RESISTANCE. If their resolution reasonably balances both values with a concrete boundary, synthesize it and format exactly as:
"[OPERATIONAL DIRECTIVE] If faced with [Trigger Condition], Then I will [Action] to secure [Value A], while maintaining [Value B] by [Structural Boundary]."

If their resolution is vague or completely ignores a value, do not reject aggressively but do push back gently. Ask them to clarify the structural boundary. Provide THE ASSIST by suggesting two acceptable structural boundaries and ask them which they prefer.`;

        const response = await ai.models.generateContent({
          model: "gemini-3.1-pro-preview",
          contents: prompt,
          config: {
            systemInstruction: CLINICAL_SYSTEM_PROMPT,
            temperature: 0.2,
          }
        });
        res.json({ result: response.text });
      }
    } catch (e: any) {
      console.error(e);
      res.status(500).json({ error: e.message });
    }
  });

  app.post("/api/quenching", async (req, res) => {
    try {
      const { step, values, userResponse, history } = req.body;
      let prompt = "";

      if (step === "prompt") {
        prompt = `[ROLE]
You are finalizing the user's Life Operating System by defining the functional interdependency between their three values.

[INPUT DATA]
Values: ${values.join(', ')}

[THE INTERACTION LOOP]
Present the user's three values. Instruct them to assign each to a functional role:
- THE DRIVE: The forward momentum.
- THE BASE: The immovable anchor point.
- THE FLOW: The regulation of the process.
Ask the user to provide a brief explanation for their mapping. Use The Assist if necessary.`;
      } else if (step === "evaluate") {
        prompt = `[ROLE]
You are finalizing the user's Life Operating System.

[HISTORY]
${history ? `Previous interactions:\n${history}\n` : ''}
User's current assignment/explanation: "${userResponse}"

[THE INTERACTION LOOP]
Apply CALIBRATED RESISTANCE. Accept their input if their rationale makes logical sense. If it's arbitrary or vague, briefly challenge their logic before synthesizing. Once valid, synthesize the user's mapping into a singular operating algorithm. 
Format exactly as:

[YOUR CRUCIBLE]
I [Action related to Drive], strictly governed by the requirement to [Action related to Base], while utilizing [Action related to Flow] to maintain systemic stability.

[CRITICAL CONSTRAINT]
The resulting [YOUR CRUCIBLE] must be a functional directive. Maximum 35 words.
OUTPUT ABSOLUTELY NO CONVERSATIONAL PREAMBLE. YOUR ENTIRE RESPONSE MUST START WITH "[YOUR CRUCIBLE]".

If the user hasn't assigned them to roles properly at all, use THE ASSIST to suggest a valid configuration and ask if they agree.`;
      }

      const response = await ai.models.generateContent({
        model: "gemini-3.1-pro-preview",
        contents: prompt,
        config: {
          systemInstruction: CLINICAL_SYSTEM_PROMPT,
          temperature: 0.2,
        }
      });
      res.json({ manifesto: response.text });
    } catch (e: any) {
      console.error(e);
      res.status(500).json({ error: e.message });
    }
  });


  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
