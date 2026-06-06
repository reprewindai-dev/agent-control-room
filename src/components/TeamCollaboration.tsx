import React, { useState, useEffect } from "react";
import { Clock, Users, Play, CheckCircle2, ShieldAlert, Coins, HelpCircle, User, AlertTriangle } from "lucide-react";
import { Incident, BountyOffer, Agent } from "../types";

interface PartnershipProps {
  bounties: BountyOffer[];
  onCompleteBounty: (id: string) => void;
  incidents: Incident[];
  onResolveIncident: (id: string) => void;
  agents: Agent[];
}

export default function TeamCollaboration({
  bounties,
  onCompleteBounty,
  incidents,
  onResolveIncident,
  agents,
}: PartnershipProps) {
  const [clocks, setClocks] = useState({
    utc: "",
    pdt: "",
    bst: "",
    jst: "",
  });

  const [activeTab, setActiveStageTab] = useState<"incidents" | "clocks" | "bounties">("incidents");

  useEffect(() => {
    const updateTimes = () => {
      const now = new Date();
      const formatTime = (tz: string) =>
        now.toLocaleTimeString("en-US", {
          timeZone: tz,
          hour: "2-digit",
          minute: "2-digit",
          second: "2-digit",
          hour12: false,
        });

      try {
        setClocks({
          utc: formatTime("UTC"),
          pdt: formatTime("America/Los_Angeles"),
          bst: formatTime("Europe/London"),
          jst: formatTime("Asia/Tokyo"),
        });
      } catch (e) {
        console.error(e);
      }
    };

    updateTimes();
    const interval = setInterval(updateTimes, 1000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="bg-zinc-950 border border-zinc-800 rounded-xl p-6 lg:p-8 animate-fadeIn flex flex-col gap-6">
      {/* Header section */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between border-b border-zinc-900 pb-4 gap-4">
        <div>
          <span className="font-mono text-xs text-zinc-500 font-bold uppercase">TEAM OPERATIONS DECK</span>
          <h2 className="text-lg font-sans font-bold text-white mt-1 flex items-center gap-2">
            Remote Team Standup & Standby Sync Board
          </h2>
          <p className="text-xs text-zinc-400 mt-1">
            Coordinate timezone sync clocks, execute incident runbook checklists, and claim posted task bounties collaboratively.
          </p>
        </div>

        {/* Local Tab selectors */}
        <div className="flex bg-zinc-900 border border-zinc-800 p-1 rounded-lg">
          <button
            onClick={() => setActiveStageTab("incidents")}
            className={`px-3 py-1.5 font-mono text-xs rounded transition-all cursor-pointer ${
              activeTab === "incidents"
                ? "bg-cyan-950 border border-cyan-800 text-cyan-400 font-bold"
                : "text-zinc-500 hover:text-zinc-300"
            }`}
          >
            ACTIVE INCIDENTS ({incidents.filter(i => i.status !== "resolved").length})
          </button>
          <button
            onClick={() => setActiveStageTab("clocks")}
            className={`px-3 py-1.5 font-mono text-xs rounded transition-all cursor-pointer ${
              activeTab === "clocks"
                ? "bg-cyan-950 border border-cyan-800 text-cyan-400 font-bold"
                : "text-zinc-500 hover:text-zinc-300"
            }`}
          >
            TEAM STANDUP TIMEZONES
          </button>
          <button
            onClick={() => setActiveStageTab("bounties")}
            className={`px-3 py-1.5 font-mono text-xs rounded transition-all cursor-pointer ${
              activeTab === "bounties"
                ? "bg-cyan-950 border border-cyan-800 text-cyan-400 font-bold"
                : "text-zinc-500 hover:text-zinc-300"
            }`}
          >
            BOUNTY POSTS ({bounties.filter(b => b.status === "claimed").length})
          </button>
        </div>
      </div>

      {/* Incremental Content Panels */}

      {/* 1. INCIDENTS FEED */}
      {activeTab === "incidents" && (
        <div className="flex-1 flex flex-col gap-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {incidents.map((incident) => {
              let sevColor = "text-zinc-400 border-zinc-800 bg-zinc-900";
              if (incident.severity === "critical") sevColor = "text-red-400 border-red-900 bg-red-950/20";
              else if (incident.severity === "high") sevColor = "text-amber-500 border-amber-900 bg-amber-950/25";

              return (
                <div key={incident.id} className="p-4 bg-zinc-900/40 border border-zinc-900 rounded-xl flex flex-col justify-between gap-4">
                  <div>
                    <div className="flex items-center justify-between gap-2">
                      <span className={`font-mono text-[9px] border px-2 py-0.5 rounded font-extrabold uppercase ${sevColor}`}>
                        {incident.severity} INDEX
                      </span>
                      <span className="font-mono text-[10px] text-zinc-500">{incident.timestamp}</span>
                    </div>

                    <h4 className="text-xs text-white font-bold font-sans mt-3">
                      [{incident.id}] {incident.title}
                    </h4>
                    <p className="text-[11px] text-zinc-400 font-mono mt-1.5 leading-relaxed">
                      {incident.description}
                    </p>
                    <div className="mt-2 text-[10px] font-mono text-zinc-500">
                      Primary Responder Assigned: <span className="text-zinc-300">{incident.assignedAgent}</span>
                    </div>
                  </div>

                  <div className="border-t border-zinc-900 pt-3.5 flex items-center justify-between">
                    <span className={`text-[10px] font-mono uppercase font-bold flex items-center gap-1 ${
                      incident.status === "unresolved" ? "text-red-400" : "text-emerald-400"
                    }`}>
                      <AlertTriangle className="h-3 w-3" />
                      STATUS: {incident.status}
                    </span>

                    {incident.status !== "resolved" && (
                      <button
                        onClick={() => onResolveIncident(incident.id)}
                        className="px-3 py-1 bg-cyan-950 hover:bg-cyan-900 text-cyan-400 border border-cyan-800 rounded font-mono text-[10px] font-bold uppercase transition-all cursor-pointer flex items-center gap-1"
                      >
                        <Play className="h-3 w-3 fill-current" />
                        Run Diagnostic Runbook
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* 2. TIMEZONES SYNC PANELS */}
      {activeTab === "clocks" && (
        <div className="flex-1 flex flex-col justify-center gap-4">
          <div className="p-3 bg-zinc-900/40 border border-zinc-900 rounded-lg text-xs text-zinc-400 leading-relaxed font-sans mb-2">
            Remote and distributed engineering squads synchronize on standard clocks to ensure alignment of Zeno Interrogation waves and prevent concurrent write locks due to timezone drift.
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-zinc-900 p-4 border border-zinc-800 rounded-xl text-center flex flex-col items-center justify-center font-mono">
              <Clock className="h-5 w-5 text-zinc-500 mb-2" />
              <span className="text-[10px] text-zinc-500 font-bold uppercase block mb-1">UTC STANDARD</span>
              <span className="text-xl font-bold tracking-widest text-cyan-400">{clocks.utc || "00:00:00"}</span>
            </div>

            <div className="bg-zinc-900 p-4 border border-zinc-800 rounded-xl text-center flex flex-col items-center justify-center font-mono">
              <Clock className="h-5 w-5 text-zinc-500 mb-2" />
              <span className="text-[10px] text-zinc-500 font-bold uppercase block mb-1">PDT TIME (WEST)</span>
              <span className="text-xl font-bold tracking-widest text-white">{clocks.pdt || "00:00:00"}</span>
            </div>

            <div className="bg-zinc-900 p-4 border border-zinc-800 rounded-xl text-center flex flex-col items-center justify-center font-mono">
              <Clock className="h-5 w-5 text-zinc-500 mb-2" />
              <span className="text-[10px] text-zinc-500 font-bold uppercase block mb-1">BST TIME (LONDON)</span>
              <span className="text-xl font-bold tracking-widest text-white">{clocks.bst || "00:00:00"}</span>
            </div>

            <div className="bg-zinc-900 p-4 border border-zinc-800 rounded-xl text-center flex flex-col items-center justify-center font-mono">
              <Clock className="h-5 w-5 text-zinc-500 mb-2" />
              <span className="text-[10px] text-zinc-500 font-bold uppercase block mb-1">JST TIME (TOKYO)</span>
              <span className="text-xl font-bold tracking-widest text-white">{clocks.jst || "00:00:00"}</span>
            </div>
          </div>
        </div>
      )}

      {/* 3. BOUNTIES LIST */}
      {activeTab === "bounties" && (
        <div className="flex-1 flex flex-col gap-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {bounties.length === 0 ? (
              <div className="text-center font-mono text-zinc-600 text-xs py-8 md:col-span-2">
                No custom bounties currently active. Go to the Agent Directory, select an agent, and click "Assign Bounty" to post tasks here.
              </div>
            ) : (
              bounties.map((bounty) => (
                <div key={bounty.id} className="p-4 bg-zinc-900/40 border border-zinc-900 rounded-xl flex flex-col justify-between gap-4">
                  <div>
                    <div className="flex items-center justify-between">
                      <span className="font-mono text-[9px] bg-cyan-950 text-cyan-400 border border-cyan-800 px-2 py-0.5 rounded font-extrabold uppercase">
                        {bounty.category} POST
                      </span>
                      <span className="font-mono text-[10px] text-zinc-500">{bounty.id}</span>
                    </div>

                    <h4 className="text-xs text-white font-bold font-sans mt-3">
                      {bounty.title}
                    </h4>
                    <p className="text-[11px] text-zinc-400 mt-1 leading-relaxed">
                      {bounty.description}
                    </p>
                    <div className="mt-2 text-[10px] font-mono text-zinc-500 flex items-center gap-1">
                      <User className="h-3 w-3" />
                      Assigned Agent: <span className="text-zinc-300 font-bold">{bounty.claimedBy}</span>
                    </div>
                  </div>

                  <div className="border-t border-zinc-900/80 pt-3.5 flex items-center justify-between">
                    <span className="font-mono text-[11px] text-amber-500 font-medium flex items-center gap-1">
                      <Coins className="h-3.5 w-3.5 text-amber-500" />
                      REWARD: +{bounty.pointsReward} Rank Points
                    </span>

                    {bounty.status === "claimed" ? (
                      <button
                        onClick={() => onCompleteBounty(bounty.id)}
                        className="px-3.5 py-1 bg-zinc-900 hover:bg-emerald-950 text-zinc-400 hover:text-emerald-400 border border-zinc-800 hover:border-emerald-800 rounded font-mono text-[10px] font-bold uppercase transition-all cursor-pointer flex items-center gap-1"
                      >
                        <CheckCircle2 className="h-3.5 w-3.5" />
                        Complete and verification
                      </button>
                    ) : (
                      <span className="font-mono text-[10px] text-emerald-400/90 font-bold uppercase flex items-center gap-1">
                        <CheckCircle2 className="h-3.5 w-3.5" />
                        Task completed
                      </span>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}
