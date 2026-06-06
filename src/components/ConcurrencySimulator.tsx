import React, { useState, useEffect } from "react";
import { Shield, ShieldAlert, Sparkles, ShieldCheck, Flame, Play, Terminal } from "lucide-react";

export default function ConcurrencySimulator() {
  const [isProtected, setIsProtected] = useState(false);
  const [isSimulating, setIsSimulating] = useState(false);
  const [simulationStep, setSimulationStep] = useState(0);
  const [dbState, setDbState] = useState("0x00000000 (CLEAN)");
  const [logs, setLogs] = useState<string[]>([]);
  const [collisionActive, setCollisionActive] = useState(false);

  const luaAcquire = `-- ACQUIRE.LUA (Atomic lock evaluation)
local key = KEYS[1]
local token = ARGV[1]
local ttl = tonumber(ARGV[2])
local current = redis.call('GET', key)
if not current then
  redis.call('SET', key, token, 'PX', ttl)
  return 1 -- Lock acquired successfully!
elseif current == token then
  redis.call('PEXPIRE', key, ttl)
  return 1 -- Re-entrant lock updated.
else
  return 0 -- Busy! Conflict blocked!
end`;

  const luaRelease = `-- RELEASE.LUA (Cryptographically secure eviction)
local key = KEYS[1]
local token = ARGV[1]
if redis.call('GET', key) == token then
  return redis.call('DEL', key) -- Lock freed safely.
else
  return 0 -- Prevent lock-stealing by delayed nodes.
end`;

  const runSimulation = () => {
    if (isSimulating) return;
    setIsSimulating(true);
    setSimulationStep(1);
    setLogs([]);
    setCollisionActive(false);

    if (!isProtected) {
      // Unprotected Scenario
      setTimeout(() => {
        setSimulationStep(2);
        setLogs((prev) => [...prev, "[T=0.00ms] START: Write operation initiated by Agent-082 (Payments QA)"]);
        setLogs((prev) => [...prev, "[T=0.00ms] START: Write operation initiated by Agent-091 (Browser Signup)"]);
      }, 800);

      setTimeout(() => {
        setSimulationStep(3);
        setCollisionActive(true);
        setLogs((prev) => [...prev, "[T=0.01ms] COLLISION: Simultaneous lock-less access to target: /ledger/balances"]);
        setLogs((prev) => [...prev, "[CRITICAL ERROR] DOUBLE-SPEND DRIFT DETECTION TRIGGERED!"]);
        setDbState("0xDEADBEEF (CORRUPTED WAVE)'); DROP TABLE balances; --");
      }, 1800);

      setTimeout(() => {
        setSimulationStep(4);
        setIsSimulating(false);
        setLogs((prev) => [...prev, "[T=0.05ms] HALT: CPU core terminated mid-flight. State engine entered panic. DEFCON descent triggered."]);
      }, 3500);

    } else {
      // Governed/Protected Scenario
      setTimeout(() => {
        setSimulationStep(2);
        setLogs((prev) => [...prev, "[T=0.00ms] ACQUIRE: Agent-082 issues ACQUIRE.LUA check against KEYS[1] = '/locks/payments'"]);
      }, 800);

      setTimeout(() => {
        setSimulationStep(3);
        setLogs((prev) => [...prev, "[T=0.01ms] GRANTED: Key free! Server generates lease with Token: 0xFB4A. Expiry set: 60000ms"]);
        setLogs((prev) => [...prev, "[T=0.02ms] RENEW: Heartbeat loop registered. Holding lease for Payments QA execution thread safely."]);
        setDbState("0x000F43B2 (SECURED STATE - ACTIVE LEASE: AGENT-082)");
      }, 1800);

      setTimeout(() => {
        setSimulationStep(4);
        setLogs((prev) => [...prev, "[T=0.12ms] DISCARDED: Agent-091 attempts concurrent WRITE. Re-entrant lock denied by evaluation logic."]);
        setLogs((prev) => [...prev, "[T=0.13ms] 409 CONFLICT: Agent-091 receives lease conflict answer. Suspends write and enters queue."]);
      }, 2800);

      setTimeout(() => {
        setSimulationStep(5);
        setLogs((prev) => [...prev, "[T=1.45ms] COMPLETE: Agent-082 finished task. Invoking RELEASE.LUA with token validation..."]);
        setLogs((prev) => [...prev, "[T=1.46ms] RELEASED: Token verified! Lock safely evacuated. Shared Database state intact."]);
        setDbState("0x000F52B0 (CLEAN - SYNC VERIFIED)");
        setIsSimulating(false);
      }, 4200);
    }
  };

  return (
    <div className="bg-zinc-950 border border-zinc-800 rounded-xl p-6 lg:p-8 animate-fadeIn flex flex-col gap-6">
      {/* Simulation Header */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between border-b border-zinc-900 pb-4 gap-4">
        <div>
          <span className="font-mono text-xs text-zinc-500 font-bold uppercase">STATE & CONCURRENCY SYSTEM</span>
          <h2 className="text-lg font-sans font-bold text-white mt-1 flex items-center gap-2">
            ArbiterOS Transactional Concurrency Control
          </h2>
          <p className="text-xs text-zinc-400 mt-1">
            Simulate high-frequency atomic evaluations to prevent race-condition double-spends across 120 concurrent nodes.
          </p>
        </div>

        {/* Protection Toggle */}
        <div className="flex items-center gap-2 bg-zinc-900 p-1.5 rounded-lg border border-zinc-800">
          <button
            onClick={() => {
              if (isSimulating) return;
              setIsProtected(false);
              setDbState("0x00000000 (CLEAN)");
              setLogs([]);
              setSimulationStep(0);
            }}
            className={`px-3 py-1 text-xs font-mono rounded cursor-pointer transition-all ${
              !isProtected
                ? "bg-red-950/80 text-red-500 border border-red-800 font-bold"
                : "text-zinc-500 hover:text-zinc-300"
            }`}
          >
            UNPROTECTED
          </button>
          <button
            onClick={() => {
              if (isSimulating) return;
              setIsProtected(true);
              setDbState("0x00000000 (CLEAN)");
              setLogs([]);
              setSimulationStep(0);
            }}
            className={`px-3 py-1 text-xs font-mono rounded cursor-pointer transition-all ${
              isProtected
                ? "bg-emerald-950/80 text-emerald-400 border border-emerald-800 font-bold"
                : "text-zinc-500 hover:text-zinc-300"
            }`}
          >
            ARBITEROS ACTIVE
          </button>
        </div>
      </div>

      {/* Simulator Visual Block */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
        {/* Node A (Agent 082) */}
        <div className="lg:col-span-3 flex flex-col gap-4">
          <div className="p-4 bg-zinc-900 border border-zinc-800 rounded-xl relative">
            <span className="font-mono text-[9px] text-zinc-500 font-bold">AGENT-082</span>
            <div className="text-xs text-white font-sans font-bold mt-1">Payments QA Worker</div>
            <p className="text-[10px] text-zinc-500 font-mono mt-1">Task: Finalize Balance Payouts</p>
            <div className="mt-3 flex items-center justify-between">
              <span className="font-mono text-[9px] bg-red-950/40 text-red-400 border border-red-900 px-1 py-0.2 rounded">
                CRITICAL
              </span>
              <span className="font-mono text-[10px] text-zinc-400">950 pts</span>
            </div>
            {/* Visual Line */}
            {isSimulating && simulationStep >= 2 && (
              <div className="absolute right-0 top-1/2 translate-x-full h-0.5 bg-gradient-to-r from-cyan-500 to-transparent w-full z-10 hidden lg:block" />
            )}
          </div>

          {/* Node B (Agent 091) */}
          <div className="p-4 bg-zinc-900 border border-zinc-800 rounded-xl relative">
            <span className="font-mono text-[9px] text-zinc-500 font-bold">AGENT-091</span>
            <div className="text-xs text-white font-sans font-bold mt-1">Browser Signup Worker</div>
            <p className="text-[10px] text-zinc-500 font-mono mt-1">Task: Store Registration Token</p>
            <div className="mt-3 flex items-center justify-between">
              <span className="font-mono text-[9px] bg-cyan-950/40 text-cyan-400 border border-cyan-900 px-1 py-0.2 rounded">
                HIGH
              </span>
              <span className="font-mono text-[10px] text-zinc-400">820 pts</span>
            </div>
            {/* Visual Line */}
            {isSimulating && simulationStep >= 2 && (
              <div className="absolute right-0 top-1/2 translate-x-full h-0.5 bg-gradient-to-r from-cyan-500 to-transparent w-full z-10 hidden lg:block" />
            )}
          </div>
        </div>

        {/* Visual Shared Ledger (Ledger Target Cylinder) */}
        <div className="lg:col-span-5 flex flex-col items-center justify-center p-8 bg-zinc-900/40 border border-zinc-900 rounded-xl relative relative-container min-h-[300px]">
          {/* Central Cylinder */}
          <div className="relative z-10 flex flex-col items-center">
            {/* Cyl top */}
            <div className={`h-8 w-24 rounded-t-full border-t border-x transition-colors duration-300 ${
              collisionActive ? "bg-red-910/80 border-red-500" : isProtected && simulationStep >= 3 ? "bg-emerald-950/80 border-emerald-500" : "bg-cyan-950/60 border-cyan-800"
            }`} />
            
            {/* Cyl Body */}
            <div className={`w-24 h-28 border-x flex flex-col items-center justify-center relative transition-colors duration-300 ${
              collisionActive ? "bg-red-950/40 border-red-500" : isProtected && simulationStep >= 3 ? "bg-emerald-950/40 border-emerald-500" : "bg-cyan-950/20 border-cyan-800"
            }`}>
              {/* Central Collision Splash */}
              {collisionActive && (
                <div className="absolute inset-0 flex items-center justify-center animate-scale-up">
                  <Flame className="h-16 w-16 text-red-500 drop-shadow-[0_0_12px_rgba(239,68,68,0.8)]" />
                  <div className="absolute bottom-1 bg-red-950/90 border border-red-500 text-red-500 font-mono text-[9px] px-1 py-0.5 rounded font-extrabold uppercase animate-pulse">
                    COLLISION DETECTED
                  </div>
                </div>
              )}

              {/* Protected Active Shield */}
              {isProtected && simulationStep >= 3 && (
                <div className="absolute inset-0 flex items-center justify-center animate-scale-up">
                  <ShieldCheck className="h-16 w-16 text-emerald-400 drop-shadow-[0_0_12px_rgba(52,211,153,0.6)]" />
                  <div className="absolute bottom-1 bg-emerald-950/90 border border-emerald-500 text-emerald-400 font-mono text-[9px] px-2 py-0.5 rounded font-bold uppercase">
                    ATOMIC SHIELD ACTIVE
                  </div>
                </div>
              )}

              {!collisionActive && (!isProtected || simulationStep < 3) && (
                <Terminal className="h-8 w-8 text-zinc-600" />
              )}
            </div>

            {/* Cyl bottom */}
            <div className={`h-8 w-24 rounded-b-full border-b border-x transition-colors duration-300 ${
              collisionActive ? "bg-red-910/80 border-red-500" : isProtected && simulationStep >= 3 ? "bg-emerald-950/80 border-emerald-500" : "bg-cyan-950/60 border-cyan-800"
            }`} />
          </div>

          {/* Database balance status under target */}
          <div className="mt-5 text-center font-mono w-full">
            <span className="text-[10px] text-zinc-500 font-bold block mb-1">RAW LEDGER STATE REGISTER</span>
            <div className={`text-xs px-3 py-1.5 rounded-lg border font-mono ${
              collisionActive 
                ? "bg-red-950/60 text-red-400 border-red-900" 
                : isProtected && simulationStep >= 3 
                  ? "bg-emerald-950/60 text-emerald-400 border-emerald-900" 
                  : "bg-zinc-900 text-cyan-400 border-zinc-800"
            }`}>
              {dbState}
            </div>
          </div>
        </div>

        {/* Live console logging / diagnostic steps panel */}
        <div className="lg:col-span-4 flex flex-col h-[300px] border border-zinc-800 rounded-xl bg-zinc-950 overflow-hidden">
          <div className="p-3.5 border-b border-zinc-800 bg-[#09090b] flex items-center justify-between">
            <span className="font-mono text-[10px] text-cyan-400 font-bold block">ARBITEROS STATE ENGINE CONSOLE</span>
            <span className="inline-block h-1.5 w-1.5 rounded-full bg-cyan-400 animate-ping" />
          </div>

          {/* Simulation run actions input */}
          <div className="flex-1 p-4 font-mono text-[10px] overflow-y-auto space-y-2 text-zinc-400">
            {logs.length === 0 ? (
              <div className="text-zinc-600 flex flex-col justify-center items-center h-full text-center">
                <span>Console offline. Click standard command below to trigger write test.</span>
              </div>
            ) : (
              logs.map((log, i) => {
                let logCol = "text-zinc-400";
                if (log.includes("COLLISION") || log.includes("CRITICAL") || log.includes("HALT")) logCol = "text-red-400 font-bold";
                else if (log.includes("GRANTED") || log.includes("Evicted") || log.includes("SAFE") || log.includes("RELEASED")) logCol = "text-emerald-400 font-bold";
                else if (log.includes("RENEW") || log.includes("LEASE")) logCol = "text-cyan-400";

                return (
                  <div key={i} className={`font-mono border-b border-zinc-900/60 pb-1 ${logCol}`}>
                    {log}
                  </div>
                );
              })
            )}
          </div>

          <div className="p-3 bg-zinc-900/80 border-t border-zinc-800 flex justify-center">
            <button
              onClick={runSimulation}
              disabled={isSimulating}
              className={`w-full py-2 rounded-lg font-mono text-xs font-bold uppercase transition-all cursor-pointer flex items-center justify-center gap-2 ${
                isSimulating 
                  ? "bg-zinc-800 text-zinc-500 border border-zinc-900" 
                  : isProtected
                    ? "bg-emerald-950 hover:bg-emerald-900 text-emerald-400 border border-emerald-800"
                    : "bg-red-950 hover:bg-red-900 text-red-500 border border-red-800"
              }`}
            >
              <Play className="h-3.5 w-3.5 fill-current" />
              {isSimulating ? "Executing Simulation..." : isProtected ? "Simulate Safe Transaction" : "Trigger Unprotected Collision"}
            </button>
          </div>
        </div>
      </div>

      {/* Code script inspect block collapsible */}
      <div className="mt-4 border border-zinc-800 border-dashed rounded-xl p-4 bg-zinc-900/20">
        <span className="font-mono text-[10px] text-zinc-400 font-bold block mb-2 uppercase">
          LUA CONCURRENCY SCRIPTS (INSIDE REDIS TRANSACTION GATE)
        </span>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-zinc-950/80 border border-zinc-900 rounded-lg p-3 overflow-hidden">
            <span className="font-mono text-[9px] text-zinc-500 block mb-1">ACQUIRE.LUA</span>
            <pre className="text-[9px] font-mono text-zinc-400 leading-tight whitespace-pre-wrap max-h-40 overflow-y-auto">
              {luaAcquire}
            </pre>
          </div>
          <div className="bg-zinc-950/80 border border-zinc-900 rounded-lg p-3 overflow-hidden">
            <span className="font-mono text-[9px] text-zinc-500 block mb-1">RELEASE.LUA</span>
            <pre className="text-[9px] font-mono text-zinc-400 leading-tight whitespace-pre-wrap max-h-40 overflow-y-auto">
              {luaRelease}
            </pre>
          </div>
        </div>
      </div>
    </div>
  );
}
