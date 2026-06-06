import React, { useState, useRef, useEffect } from "react";
import { Send, Terminal, HelpCircle, User, Loader2, Sparkles, Shield, Cpu, RefreshCcw } from "lucide-react";

interface Message {
  role: "user" | "model";
  text: string;
}

export default function GeminiWorkspaceAdvisor() {
  const [messages, setMessages] = useState<Message[]>([
    {
      role: "model",
      text: "Hello! I am the UACP Cognitive Engine. How can I help your remote team align this agentic blueprint today?",
    },
  ]);
  const [inputValue, setInputValue] = useState("");
  const [selectedPersona, setSelectedPersona] = useState<"architect" | "security" | "compressor">("architect");
  const [loading, setLoading] = useState(false);
  const chatBottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (chatBottomRef.current) {
      chatBottomRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages, loading]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputValue.trim() || loading) return;

    const userText = inputValue;
    setInputValue("");
    setMessages((prev) => [...prev, { role: "user", text: userText }]);
    setLoading(true);

    try {
      const response = await fetch("/api/gemini/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt: userText, persona: selectedPersona }),
      });

      const data = await response.json();
      if (response.ok) {
        setMessages((prev) => [...prev, { role: "model", text: data.text }]);
      } else {
        setMessages((prev) => [
          ...prev,
          { role: "model", text: `⚠️ Error from server-side route: ${data.error || "Failed to contact Gemini."}` },
        ]);
      }
    } catch (err: any) {
      console.error(err);
      setMessages((prev) => [
        ...prev,
        { role: "model", text: `⚠️ Offline/Network Error: ${err.message || "Failed to make call."}` },
      ]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-zinc-950 border border-zinc-800 rounded-xl p-6 lg:p-8 animate-fadeIn flex flex-col gap-5 h-[650px]">
      {/* Header section with persona select */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between border-b border-zinc-900 pb-4 gap-4">
        <div>
          <span className="font-mono text-xs text-zinc-500 font-bold uppercase">UACP COGNITIVE ENGINE</span>
          <h2 className="text-lg font-sans font-bold text-white mt-1 flex items-center gap-1.5">
            Gemini AI Cognitive Workspace Advisor
          </h2>
        </div>

        {/* Persona toggles */}
        <div className="flex gap-1.5 font-mono text-[10px] bg-zinc-900 border border-zinc-800 p-1 rounded-lg">
          <button
            onClick={() => setSelectedPersona("architect")}
            className={`px-2.5 py-1.5 rounded uppercase font-bold flex items-center gap-1 cursor-pointer transition-all ${
              selectedPersona === "architect"
                ? "bg-cyan-950 text-cyan-400 border border-cyan-800"
                : "text-zinc-500 hover:text-zinc-300"
            }`}
          >
            <Cpu className="h-3 w-3" />
            AI Architect
          </button>
          <button
            onClick={() => setSelectedPersona("security")}
            className={`px-2.5 py-1.5 rounded uppercase font-bold flex items-center gap-1 cursor-pointer transition-all ${
              selectedPersona === "security"
                ? "bg-cyan-950 text-cyan-400 border border-cyan-800"
                : "text-zinc-500 hover:text-zinc-300"
            }`}
          >
            <Shield className="h-3 w-3" />
            ArbiterOS Secure
          </button>
          <button
            onClick={() => setSelectedPersona("compressor")}
            className={`px-2.5 py-1.5 rounded uppercase font-bold flex items-center gap-1 cursor-pointer transition-all ${
              selectedPersona === "compressor"
                ? "bg-cyan-950 text-cyan-400 border border-cyan-800"
                : "text-zinc-500 hover:text-zinc-300"
            }`}
          >
            <RefreshCcw className="h-3 w-3" />
            TreeFrag Pro
          </button>
        </div>
      </div>

      {/* Active Persona descriptor card */}
      <div className="p-3 bg-zinc-900/40 border border-zinc-900 rounded-lg text-[11px] font-mono text-zinc-400">
        {selectedPersona === "architect" && (
          <span>
            💡 **SYSTEM ARCHITECT:** Consult about 120-Agent Task force graph, Phase 1 to Phase 5 orchestration pathways, and UACP v5 guidelines.
          </span>
        )}
        {selectedPersona === "security" && (
          <span>
            🛡️ **SECURTY ARBITER:** Query about RS256 token verification, prompt injection mitigations, and least-privilege workspace manifests.
          </span>
        )}
        {selectedPersona === "compressor" && (
          <span>
            🪵 **CONTEXT COMPRESSOR:** Learn how TreeFrag compresses text by 21:1 utilizing ASCII multidial hierarchies to retain LLM attention.
          </span>
        )}
      </div>

      {/* Message scroll container */}
      <div className="flex-1 overflow-y-auto pr-2 space-y-4 font-sans text-xs">
        {messages.map((msg, i) => {
          const isUser = msg.role === "user";

          return (
            <div key={i} className={`flex gap-3 max-w-[85%] ${isUser ? "ml-auto flex-row-reverse" : "mr-auto"}`}>
              {/* Avatar circle */}
              <div className={`h-8 w-8 rounded-lg flex items-center justify-center border shrink-0 ${
                isUser 
                  ? "bg-zinc-800 border-zinc-700 text-zinc-300" 
                  : "bg-cyan-950 border-cyan-800 text-cyan-400"
              }`}>
                {isUser ? <User className="h-4 w-4" /> : <Sparkles className="h-4 w-4" />}
              </div>

              {/* Text box bubble */}
              <div className={`p-4 rounded-xl border leading-relaxed break-words font-mono ${
                isUser 
                  ? "bg-zinc-900 border-zinc-800 text-white rounded-tr-none" 
                  : "bg-zinc-950 border-zinc-900 text-cyan-400/90 rounded-tl-none whitespace-pre-wrap"
              }`}>
                {msg.text}
              </div>
            </div>
          );
        })}

        {/* Loading spinner */}
        {loading && (
          <div className="flex gap-3 max-w-[80%] mr-auto items-center text-zinc-500 font-mono text-[10px]">
            <Loader2 className="h-4 w-4 text-cyan-400 animate-spin" />
            <span>Consulting Server-side Gemini model...</span>
          </div>
        )}
        <div ref={chatBottomRef} />
      </div>

      {/* Input Submit box */}
      <form onSubmit={handleSendMessage} className="flex gap-2 border-t border-zinc-900 pt-4 mt-auto">
        <input
          type="text"
          value={inputValue}
          disabled={loading}
          onChange={(e) => setInputValue(e.target.value)}
          placeholder="Ask a technical advisor question to align your remote team..."
          className="flex-1 bg-zinc-900/60 border border-zinc-800 hover:border-zinc-700 focus:border-cyan-500 font-mono text-xs text-white placeholder-zinc-600 px-4 py-3 rounded-xl focus:outline-none transition-colors"
        />
        <button
          type="submit"
          disabled={loading || !inputValue.trim()}
          className="px-4 py-3 bg-cyan-500 hover:bg-cyan-400 disabled:opacity-40 text-black font-mono text-xs font-bold uppercase rounded-xl transition-all cursor-pointer flex items-center justify-center shrink-0"
        >
          <Send className="h-4 w-4" />
        </button>
      </form>
    </div>
  );
}
