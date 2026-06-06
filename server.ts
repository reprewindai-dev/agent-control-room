import express from "express";
import path from "path";
import { fileURLToPath } from "url";
import { createServer as createViteServer } from "vite";
import dotenv from "dotenv";
import { GoogleGenAI } from "@google/genai";

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // Check for healthy API connection
  app.get("/api/health", (req, res) => {
    res.json({ status: "ok", time: new Date().toISOString() });
  });

  // Server-side Gemini API Route
  app.post("/api/gemini/generate", async (req, res) => {
    const { prompt, persona } = req.body;
    
    if (!prompt) {
       res.status(400).json({ error: "Prompt is required" });
       return;
    }

    const key = process.env.GEMINI_API_KEY;
    if (!key || key === "MY_GEMINI_API_KEY" || key.trim() === "") {
      // Return a simulated, super-smart technical response with a friendly helper notification
      // so the app remains fully functional in local preview/offline scenarios.
      let mockReply = "";
      if (persona === "security") {
        mockReply = `### **ArbiterOS Security Arbiter Diagnostics**\n\n**[SANDBOX DEVIATION MONITOR]** Replay analysis detected current security profile **ALPHA-SEC-9**. \n\n* **Injection Risk Assessment:** Your prompt is being processed under strict sandboxed validation.\n* **Least-Privilege Manifest Proposal:** \n\`\`\`yaml\nmcp_tools:\n  - name: "safe_command_execution"\n    scope: "sandbox-only"\n    allowed_directories: ["/tmp/workspace/"]\n\`\`\`\n\n* **Arbitrator Recommendation:** Enforce structural schemas on raw LLM outputs to prevent arbitrary CLI arguments. Bypass is prohibited.\n\n---\n*Note: Operating in local sandbox simulation. To retrieve real-time Google Gemini intelligence, configure your \`GEMINI_API_KEY\` in your Settings secrets.*`;
      } else if (persona === "compressor") {
        mockReply = `### **TreeFrag Alignment Advisor**\n\n**[CONTEXT DENSITY CONFLICT]** Raw codebase is exceeding optimal attention buffers. \n\n* **LOD Transition Vector:** Compressing text structures linearly into flat streams leads to the "Lost-in-the-Middle" phenomenon.\n* **Tree Structure Recovery:**\n  * TreeFrag leverages an ASCII abstraction mapping (\`src/components/ui/button.js\` and matching function signatures) at the expense of non-hierarchical raw lines.\n  * This preserves the critical attention vectors at **21:1 compression ratios**, ensuring the "probabilistic CPU" remains fully aligned with structural context.\n\n---\n*Note: Operating in local sandbox simulation. To retrieve real-time Google Gemini intelligence, configure your \`GEMINI_API_KEY\` in your Settings secrets.*`;
      } else {
        mockReply = `### **UACP Cognitive Advisor System Response**\n\n**[WOKFORCE PLANNER SELECTION SYSTEM]** Re-routing request to standard Sovereign AI Hub policy engine.\n\n* **120 Agent Orchestration Plan:** For remote team timezone-agnostic collaboration, distribute tasks across specific Phase directories: \n  1. **Phase 1 (Engineering):** Assign to Agent-001 (Stripe destination transaction lock split) and Agent-003 (UX loader skeletons).\n  2. **Phase 5 (Ops):** Monitor the pipeline triggers. Maintain **DEFCON 5** unless automated telemetry signals (e.g., wallet drift, Prometheus anomalies) demand a DEFCON descent.\n\n* **Continuous Integration Advice:** Run progressive canary releases (10% -> 25% -> 50% -> 100%) and enforce mandatory Sovereign Council quorums (6 out of 10) before production promotion.\n\n---\n*Note: Operating in local sandbox simulation. To retrieve real-time Google Gemini intelligence, configure your \`GEMINI_API_KEY\` in your Settings secrets.*`;
      }
       res.json({ text: mockReply, isSimulated: true });
       return;
    }

    try {
      // Lazy initialization with correct headers
      const ai = new GoogleGenAI({
        apiKey: key,
        httpOptions: {
          headers: {
            "User-Agent": "aistudio-build",
          },
        },
      });

      let systemInstruction = "You are a professional Sovereign Agent fleet advisor for Remote Teams.";
      if (persona === "security") {
         systemInstruction = "You are ArbiterOS Security Sentinel. Discuss secure agent rules, prompt injection resistance, and least-privilege schemas.";
      } else if (persona === "compressor") {
         systemInstruction = "You are TreeFrag Context Compressor. Analyze code, explain Level of Detail (LOD) mappings, and optimize context.";
      }

      const response = await ai.models.generateContent({
        model: "gemini-3.5-flash",
        contents: prompt,
        config: {
          systemInstruction,
          temperature: 0.7,
        }
      });

      res.json({ text: response.text || "No response received", isSimulated: false });
    } catch (error: any) {
      console.error("Gemini Generation Error:", error);
      res.status(500).json({ error: error.message || "Failed to generate content via Gemini" });
    }
  });

  // Vite development server config
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    // Serve static files dynamically in prod.
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on port ${PORT}`);
  });
}

startServer();
