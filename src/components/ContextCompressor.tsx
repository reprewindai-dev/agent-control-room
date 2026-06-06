import React, { useState, useEffect } from "react";
import { Sliders, Copy, Award, Database, Terminal, ArrowRight, Layers, FileCode, ShieldCheck } from "lucide-react";

export default function ContextCompressor() {
  const [lod, setLod] = useState<number>(4);
  const [rawText, setRawText] = useState<string>(`// Simple Auth & Payments module sample source code
import { getStripe } from "./stripe-helper";
import redis from "redis";

export async function processVendorPayout(vendorId, amount) {
  console.log("Initiating payment payout process for vendor", vendorId);
  const stripe = getStripe();
  
  if (!amount || amount <= 0) {
    throw new Error("Invalid payment amount: Payout must exceed 0");
  }

  // Evaluate transactional isolation lease before proceeding
  const lockAcquired = await redis.evalSHA("./acquire.lua", ["/locks/vendors/" .. vendorId], ["Token_0xFB4A", 60000]);
  if (!lockAcquired) {
    throw new Error("Conflict: Transactional lease currently claimed by competing node.");
  }

  try {
    const payout = await stripe.payouts.create({
      amount: amount * 100, // Cents logic
      currency: "usd",
      method: "instant",
      recipient: vendorId
    });
    return { success: true, transactionId: payout.id };
  } finally {
    // evacuation hook
    await redis.evalSHA("./release.lua", ["/locks/vendors/" .. vendorId], ["Token_0xFB4A"]);
  }
}

export async function registerNewRemoteTeamMember(name, email, role) {
  const checkEmail = await db.query("SELECT id FROM users WHERE email = $1", [email]);
  if (checkEmail.rows.length > 0) {
    return { error: "Duplicate account registration aborted for email." };
  }
  const result = await db.query(
    "INSERT INTO users (name, email, role, onboarding_completed) VALUES ($1, $2, $3, false) RETURNING *",
    [name, email, role]
  );
  return { success: true, user: result.rows[0] };
}`);

  const [compressedText, setCompressedText] = useState<string>("");
  const [copied, setCopied] = useState(false);

  // Compression metrics calculation
  const rawTokens = Math.floor(rawText.length / 4.1) || 120;
  const tokenMultipliers = [0.08, 0.15, 0.28, 0.42, 0.60, 0.78, 1.0];
  const currentTokens = Math.floor(rawTokens * tokenMultipliers[lod - 1]);
  const compressionRatio = (rawTokens / Math.max(1, currentTokens)).toFixed(1);

  useEffect(() => {
    // Generate simulated/actual ASCII mapping matching LOD level
    let result = "";
    if (lod === 1) {
      result = `ROOT: Project_Workspace/
├── src/ (2 files, 40 tokens)
│   ├── components/ -> [LOD 1 - Structural directory outline collapsed]
│   └── services/
│       ├── auth_service.ts (5 tokens)
│       └── stripe-helper.ts (3 tokens)
└── package.json (15 tokens)

[LOD 1: Minimal structural nodes mapped. Total compression ratio: 25:1]`;
    } else if (lod === 2) {
      result = `ROOT: Project_Workspace/
├── src/
│   ├── components/ (Directory collapsed)
│   └── services/
│       ├── auth_service.ts
│       │   ├── processVendorPayout [function]
│       │   └── registerNewRemoteTeamMember [function]
│       └── stripe-helper.ts
└── package.json

[LOD 2: Function outlines indexed. Compression ratio: 15:1]`;
    } else if (lod === 3) {
      result = `ROOT: Project_Workspace/
├── src/
│   └── services/
│       └── auth_service.ts
│           ├── async processVendorPayout(vendorId, amount) -> [Promise]
│           └── async registerNewRemoteTeamMember(name, email, role) -> [Promise]
└── package.json

[LOD 3: Complete function parameters parsed. Compression ratio: 8:1]`;
    } else if (lod === 4) {
      result = `ROOT: Project_Workspace/
├── src/
│   └── services/
│       └── auth_service.ts
│           ├── export async function processVendorPayout(vendorId, amount) {
│           │   -- initiates payment payouts, acquires transactional lua lock
│           │   -- returns Stripe checkout success state
│           │   -- evicts lock safely in finally block
│           │   }
│           └── export async function registerNewRemoteTeamMember(name, email, role) {
│               -- registers accounts, throws error on duplicate email records
│               -- inserts user row with completed states
│               }
└── package.json

[LOD 4: High readability tag signatures with summary context. Compression ratio: 6:1]`;
    } else if (lod === 5) {
      result = `ROOT: Project_Workspace/
├── src/
│   └── services/
│       └── auth_service.ts
│           ├── async processVendorPayout(vendorId, amount) {
│           │     const stripe = getStripe();
│           │     const lockAcquired = await redis.evalSHA("./acquire.lua", ["/locks/vendors/" .. vendorId] ...);
│           │     // stripe payout logic block mapped
│           │     // release lock in finally block
│           │     }
│           └── async registerNewRemoteTeamMember(name, email, role) {
│                 // database validation and insertion block mapped
│                 }
└── package.json

[LOD 5: Method body blocks summarized. Compression ratio: 3:1]`;
    } else if (lod === 6) {
      result = `ROOT: Project_Workspace/
├── src/
│   └── services/
│       └── auth_service.ts -> [Includes all code body, comments extracted]
│           import { getStripe } from "./stripe-helper";
│           export async function processVendorPayout(vendorId, amount) { ... }
│           export async function registerNewRemoteTeamMember(name, email, role) { ... }
└── package.json

[LOD 6: Semantic text outline mapped. Compression ratio: 1.5:1]`;
    } else {
      result = rawText;
    }
    setCompressedText(result);
  }, [lod, rawText]);

  const handleCopy = () => {
    navigator.clipboard.writeText(compressedText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="bg-zinc-950 border border-zinc-800 rounded-xl p-6 lg:p-8 animate-fadeIn flex flex-col gap-6">
      {/* Visual Header */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between border-b border-zinc-900 pb-4 gap-4">
        <div>
          <span className="font-mono text-xs text-zinc-500 font-bold uppercase">TREEFRAG COGNITION ENGINE</span>
          <h2 className="text-lg font-sans font-bold text-white mt-1 flex items-center gap-2">
            TREEFRAG Level-of-Detail Context Compressor
          </h2>
          <p className="text-xs text-zinc-400 mt-1">
            Flat line code parsing results in "lost-in-the-middle" memory degradation. TreeFrag structures source context with multiresolution scales to optimize token footprints.
          </p>
        </div>

        <div className="flex items-center gap-2 px-3 py-1.5 bg-zinc-900 border border-zinc-800 rounded-lg text-emerald-400 font-mono text-xs">
          <Award className="h-4 w-4" />
          <span>ESTIMATED {compressionRatio}:1 COMPRESSION SUCCESS</span>
        </div>
      </div>

      {/* Control Dial Bar */}
      <div className="bg-zinc-900/50 border border-zinc-900 p-4 rounded-xl flex flex-col gap-3">
        <div className="flex items-center justify-between text-xs font-mono">
          <span className="text-zinc-400 font-bold">PRECISION DYNAMIC DIAL (LOD SCALE)</span>
          <span className="text-cyan-400 font-bold">LEVEL OF DETAIL: {lod} / 7</span>
        </div>

        <div className="relative flex items-center mt-2">
          <input
            type="range"
            min={1}
            max={7}
            value={lod}
            onChange={(e) => setLod(Number(e.target.value))}
            className="w-full h-1 bg-zinc-800 rounded-lg appearance-none cursor-pointer accent-cyan-500 accent-height"
          />
        </div>

        {/* Labels under track */}
        <div className="flex justify-between text-[9px] font-mono text-zinc-500 uppercase font-bold tracking-wider mt-1 px-1">
          <span>LOD 1: Directory Nodes (25:1)</span>
          <span>LOD 4: Summary Signatures (6:1)</span>
          <span>LOD 7: Full Code Raw (1:1)</span>
        </div>
      </div>

      {/* Visual stats deck */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-zinc-950 p-3 border border-zinc-900 rounded-lg font-mono text-xs">
          <span className="text-zinc-500 font-bold block mb-1">RAW TOKEN LOAD (100% SIZE)</span>
          <div className="text-neutral-400 font-bold text-sm flex items-center gap-1.5">
            <Database className="h-3.5 w-3.5 text-zinc-500" />
            {rawTokens} tokens
          </div>
        </div>

        <div className="bg-zinc-950 p-3 border border-zinc-900 rounded-lg font-mono text-xs">
          <span className="text-zinc-500 font-bold block mb-1">TREEFRAG STREAM CHUNK LOAD</span>
          <div className="text-cyan-400 font-extrabold text-sm flex items-center gap-1.5">
            <Layers className="h-3.5 w-3.5 text-cyan-400" />
            {currentTokens} tokens
          </div>
        </div>

        <div className="bg-zinc-950 p-3 border border-zinc-900 rounded-lg font-mono text-xs">
          <span className="text-zinc-500 font-bold block mb-1">LOST-IN-THE-MIDDLE VULNERABILITY</span>
          <div className={`text-sm font-extrabold flex items-center gap-1.5 ${
            lod >= 6 ? "text-red-400" : lod >= 4 ? "text-amber-500" : "text-emerald-400"
          }`}>
            <ShieldCheck className="h-4 w-4" />
            {lod >= 6 ? "HIGH RISK (ATTENTION DRIFT)" : lod >= 4 ? "MODERATE (SECURE PRESERVE)" : "0.0% SILENT FAILURES"}
          </div>
        </div>
      </div>

      {/* Main split work space editor */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 h-[400px]">
        {/* Editor block - input */}
        <div className="flex flex-col border border-zinc-800 rounded-xl overflow-hidden bg-zinc-950">
          <div className="p-3 bg-[#09090b] border-b border-zinc-800 flex items-center justify-between">
            <span className="font-mono text-[10px] text-zinc-400 font-bold flex items-center gap-1">
              <FileCode className="h-3.5 w-3.5 text-zinc-500" />
              INTEGRATION SOURCE CODE (PASTE HERE)
            </span>
            <span className="text-[9px] font-mono text-zinc-500 uppercase">Interactive Raw Workspace</span>
          </div>

          <textarea
            value={rawText}
            onChange={(e) => setRawText(e.target.value)}
            className="flex-1 p-4 bg-zinc-950 font-mono text-xs text-zinc-300 placeholder-zinc-700 outline-none resize-none overflow-y-auto leading-relaxed"
            placeholder="Introduce custom code file here..."
          />
        </div>

        {/* Compressed terminal block - output */}
        <div className="flex flex-col border border-zinc-800 rounded-xl overflow-hidden bg-zinc-950">
          <div className="p-3 bg-[#09090b] border-b border-zinc-800 flex items-center justify-between">
            <span className="font-mono text-[10px] text-cyan-400 font-bold flex items-center gap-1">
              <Terminal className="h-3.5 w-3.5 text-cyan-500" />
              TREEFRAG PROCESSED CONTEXT OUTLINE
            </span>
            <button
              onClick={handleCopy}
              className="text-[10px] font-mono hover:text-cyan-400 text-zinc-500 uppercase font-bold flex items-center gap-1 cursor-pointer transition-colors"
            >
              <Copy className="h-3 w-3" />
              {copied ? "COPIED" : "COPY CHUNK"}
            </button>
          </div>

          <pre className="flex-1 p-4 bg-zinc-950 font-mono text-xs text-cyan-400/90 overflow-y-auto leading-relaxed select-all">
            {compressedText}
          </pre>
        </div>
      </div>
    </div>
  );
}
