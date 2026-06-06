import React from "react";
import { ShieldAlert, Activity, RefreshCw, Layers, Compass, Wifi } from "lucide-react";

interface FleetHeaderProps {
  defcon: number;
  setDefcon: (level: number) => void;
  quantumCoherence: number;
  uacpPressure: number;
  policyAlignment: number;
}

export default function FleetHeader({
  defcon,
  setDefcon,
  quantumCoherence,
  uacpPressure,
  policyAlignment,
}: FleetHeaderProps) {
  return (
    <header className="border-b border-zinc-800 bg-[#09090b]/80 backdrop-blur-md sticky top-0 z-30 px-6 py-4 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
      {/* Visual Identity Title */}
      <div>
        <div className="flex items-center gap-2">
          <Layers className="h-5 w-5 text-cyan-400 animate-pulse" />
          <h1 className="font-sans font-bold tracking-tight text-white text-lg">
            VEKLOM SOVEREIGN AI HUB <span className="text-xs bg-cyan-950/60 border border-cyan-800 text-cyan-400 font-mono px-2 py-0.5 rounded-full ml-2">UACP v5 Control Plane</span>
          </h1>
        </div>
        <p className="text-xs font-mono text-zinc-400 mt-1 flex items-center gap-1.5">
          <Activity className="h-3 w-3 text-cyan-400" />
          SYSTEM: <span className="text-cyan-400 font-bold">OPTIMAL</span> | SECURITY: <span className="text-emerald-400 font-bold">ALPHA (RS256)</span> | NODE_CAPACITY: <span className="text-cyan-400 font-bold">128 ACTIVE</span>
        </p>
      </div>

      {/* Supernova Metrics */}
      <div className="flex flex-wrap items-center gap-4 bg-zinc-900/60 border border-zinc-800 rounded-lg p-2.5 font-mono text-xs text-zinc-400">
        <div className="px-3 border-r border-zinc-800">
          <div className="text-zinc-500 font-semibold mb-0.5">QUANTUM COHERENCE</div>
          <div className="text-emerald-400 font-extrabold flex items-center gap-1.5">
            <RefreshCw className="h-3 w-3 text-emerald-400 animate-spin-slow" />
            {(quantumCoherence * 100).toFixed(1)}%
          </div>
        </div>

        <div className="px-3 border-r border-zinc-800">
          <div className="text-zinc-500 font-semibold mb-0.5">UACP PRESSURE</div>
          <div className="text-cyan-400 font-extrabold flex items-center gap-1.5">
            <Compass className="h-3 w-3 text-cyan-400" />
            {uacpPressure.toFixed(2)} uacp
          </div>
        </div>

        <div className="px-3 border-r border-zinc-800">
          <div className="text-zinc-500 font-semibold mb-0.5">POLICY ALIGNMENT</div>
          <div className="text-cyan-400 font-extrabold flex items-center gap-1.5">
            <ShieldAlert className="h-3 w-3 text-cyan-400" />
            {policyAlignment.toFixed(3)}
          </div>
        </div>

        <div className="px-3">
          <div className="text-zinc-500 font-semibold mb-0.5">SIGNAL STATE</div>
          <div className="text-emerald-400 font-bold flex items-center gap-1">
            <span className="inline-block h-2 w-2 rounded-full bg-emerald-500 animate-ping" />
            STABLE
          </div>
        </div>
      </div>

      {/* DEFCON Emergency level selector */}
      <div className="flex flex-col items-end gap-1">
        <span className="text-[10px] font-mono text-zinc-500 font-bold tracking-wider">DEFCON LEVEL</span>
        <div className="flex items-center gap-1.5 bg-zinc-950 border border-zinc-800 p-1.5 rounded-lg">
          {[5, 4, 3, 2, 1].map((level) => {
            const isSelected = defcon === level;
            let btnClass = "text-zinc-500 hover:text-zinc-300 hover:bg-zinc-900";
            if (isSelected) {
              if (level === 5) btnClass = "bg-emerald-950/80 text-emerald-400 border border-emerald-500 font-bold";
              else if (level === 4) btnClass = "bg-teal-950/80 text-teal-400 border border-teal-500 font-bold";
              else if (level === 3) btnClass = "bg-amber-950/80 text-amber-500 border border-amber-500 font-bold";
              else if (level === 2) btnClass = "bg-orange-950/80 text-orange-400 border border-orange-500 font-bold";
              else btnClass = "bg-red-950/80 text-red-500 border border-red-500 font-bold animate-pulse";
            }

            return (
              <button
                key={level}
                onClick={() => setDefcon(level)}
                className={`px-3 py-1 font-mono text-xs rounded transition-all duration-200 cursor-pointer ${btnClass}`}
                title={`Trigger DEFCON ${level} status`}
              >
                {level}
              </button>
            );
          })}
        </div>
      </div>
    </header>
  );
}
