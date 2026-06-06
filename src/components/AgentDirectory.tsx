import React, { useState } from "react";
import { Agent, BountyOffer } from "../types";
import { Search, SlidersHorizontal, AlertTriangle, Play, Coins, UserCheck, ShieldClose, ShieldAlert } from "lucide-react";

interface AgentDirectoryProps {
  agents: Agent[];
  onUpdateAgent: (updated: Agent) => void;
  onAddBounty: (bounty: BountyOffer) => void;
}

const INITIAL_GROUPS = [
  "All Groups",
  "Scaffolding",
  "Engineering",
  "Vendor Acquisition",
  "User Acquisition",
  "Retention/Revenue",
  "Daily Operations",
  "Security Force",
  "QA & Testing",
  "RAG Knowledge",
  "Workforce Orchestration",
];

export default function AgentDirectory({ agents, onUpdateAgent, onAddBounty }: AgentDirectoryProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedGroup, setSelectedGroup] = useState("All Groups");
  const [selectedAgent, setSelectedAgent] = useState<Agent | null>(agents[0] || null);

  const [bountyTitle, setBountyTitle] = useState("");
  const [bountyType, setBountyType] = useState<"Security" | "QA" | "Feature" | "Growth">("Feature");
  const [bountyReward, setBountyReward] = useState(10);
  const [bountyDesc, setBountyDesc] = useState("");
  const [showBountyForm, setShowBountyForm] = useState(false);

  // Filter logic
  const filteredAgents = agents.filter((agent) => {
    const matchesSearch =
      agent.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      agent.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      agent.committee.toLowerCase().includes(searchTerm.toLowerCase());

    if (selectedGroup === "All Groups") return matchesSearch;
    return agent.group.toLowerCase().includes(selectedGroup.toLowerCase()) && matchesSearch;
  });

  const handleApplyPenalty = (agent: Agent, penaltyText: string) => {
    const updated = {
      ...agent,
      activePenalty: penaltyText,
      points: Math.max(0, agent.points - 10),
      computePriority: Math.max(10, agent.computePriority - 25),
    };
    onUpdateAgent(updated);
    if (selectedAgent?.id === agent.id) {
      setSelectedAgent(updated);
    }
  };

  const handleClearPenalty = (agent: Agent) => {
    const updated = {
      ...agent,
      activePenalty: null,
      computePriority: Math.min(100, agent.computePriority + 25),
    };
    onUpdateAgent(updated);
    if (selectedAgent?.id === agent.id) {
      setSelectedAgent(updated);
    }
  };

  const handleComputeChange = (agent: Agent, change: number) => {
    const updated = {
      ...agent,
      computePriority: Math.max(0, Math.min(100, agent.computePriority + change)),
    };
    onUpdateAgent(updated);
    if (selectedAgent?.id === agent.id) {
      setSelectedAgent(updated);
    }
  };

  const handleCreateBounty = (e: React.FormEvent) => {
    e.preventDefault();
    if (!bountyTitle || !bountyDesc || !selectedAgent) return;

    const newBounty: BountyOffer = {
      id: `BOUNTY-${Math.floor(1000 + Math.random() * 9000)}`,
      title: bountyTitle,
      category: bountyType,
      pointsReward: bountyReward,
      status: "claimed",
      claimedBy: selectedAgent.name,
      description: bountyDesc,
    };

    onAddBounty(newBounty);
    
    // Reward points for taking task
    const updatedAgent = {
      ...selectedAgent,
      points: selectedAgent.points + bountyReward,
    };
    onUpdateAgent(updatedAgent);
    setSelectedAgent(updatedAgent);

    setBountyTitle("");
    setBountyDesc("");
    setShowBountyForm(false);
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 animate-fadeIn">
      {/* Directory sidebar panel */}
      <div className="lg:col-span-1 bg-zinc-950 border border-zinc-800 rounded-xl overflow-hidden flex flex-col h-[650px]">
        <div className="p-4 border-b border-zinc-800 bg-[#09090b]">
          <div className="flex items-center gap-2 mb-3">
            <SlidersHorizontal className="h-4 w-4 text-cyan-400" />
            <h2 className="text-sm font-sans font-bold tracking-tight text-white uppercase">AGENT WORKFORCE DIRECTORY</h2>
          </div>

          {/* Search bar */}
          <div className="relative mb-3">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-zinc-500" />
            <input
              type="text"
              placeholder="Search by ID, name, committee..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-4 py-2 bg-zinc-900 border border-zinc-800 rounded-lg text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-cyan-500 font-mono transition-colors"
            />
          </div>

          {/* Filter badges */}
          <div className="flex gap-1.5 overflow-x-auto pb-1 no-scrollbar">
            {INITIAL_GROUPS.map((group) => (
              <button
                key={group}
                onClick={() => setSelectedGroup(group)}
                className={`text-[10px] uppercase font-mono tracking-wider px-2 py-1 rounded-md border whitespace-nowrap cursor-pointer transition-all duration-200 ${
                  selectedGroup === group
                    ? "bg-cyan-950/80 text-cyan-400 border-cyan-800"
                    : "bg-zinc-900/40 text-zinc-500 border-zinc-900 hover:border-zinc-800 hover:text-zinc-400"
                }`}
              >
                {group}
              </button>
            ))}
          </div>
        </div>

        {/* Scrollable Agent list */}
        <div className="flex-1 overflow-y-auto divide-y divide-zinc-900">
          {filteredAgents.length === 0 ? (
            <div className="p-8 text-center text-zinc-600 font-mono text-xs">No active agent found.</div>
          ) : (
            filteredAgents.map((agent) => {
              const isSelected = selectedAgent?.id === agent.id;
              let prioColor = "text-zinc-500 bg-zinc-900 border-zinc-800";
              if (agent.priority === "CRITICAL") prioColor = "text-red-400 bg-red-950/40 border-red-900";
              else if (agent.priority === "HIGH") prioColor = "text-amber-500 bg-amber-950/40 border-amber-900";
              else if (agent.priority === "MEDIUM") prioColor = "text-cyan-400 bg-cyan-950/40 border-cyan-900";

              return (
                <div
                  key={agent.id}
                  onClick={() => setSelectedAgent(agent)}
                  className={`p-3.5 flex items-start justify-between cursor-pointer transition-all duration-200 ${
                    isSelected ? "bg-cyan-950/20 border-l-2 border-l-cyan-500" : "hover:bg-zinc-900/30"
                  }`}
                >
                  <div className="flex flex-col gap-1">
                    <span className="font-mono text-[10px] text-zinc-500 font-bold">
                      {agent.id} | {agent.group}
                    </span>
                    <span className="text-xs text-white font-medium">{agent.name}</span>
                    <div className="flex items-center gap-1.5 mt-0.5">
                      <span className="font-mono text-[9px] bg-zinc-900 text-zinc-400 border border-zinc-800 px-1 py-0.2 rounded uppercase">
                        {agent.rank}
                      </span>
                      {agent.activePenalty && (
                        <span className="font-mono text-[9px] bg-red-950/60 text-red-400 border border-red-900 px-1 py-0.2 rounded uppercase flex items-center gap-0.5">
                          <AlertTriangle className="h-2 w-2 text-red-400" />
                          PENALIZED
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="flex flex-col items-end gap-1.5">
                    <span className={`font-mono text-[9px] border px-1 py-0.5 rounded font-bold uppercase ${prioColor}`}>
                      {agent.priority}
                    </span>
                    <span className="font-mono text-[10px] text-zinc-400">{agent.points} pts</span>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* Expanded Inspector Panel */}
      <div className="lg:col-span-2 flex flex-col gap-6">
        {selectedAgent ? (
          <div className="bg-zinc-950 border border-zinc-800 rounded-xl p-6 flex flex-col gap-5 h-[650px] overflow-y-auto">
            {/* Header info */}
            <div className="flex flex-col sm:flex-row sm:items-start justify-between pb-4 border-b border-zinc-900 gap-4">
              <div>
                <span className="font-mono text-xs text-zinc-500 font-bold uppercase">
                  ACTIVE SQUAD MISSION INSPECTOR
                </span>
                <h3 className="text-lg font-sans font-bold text-white mt-1">
                  [{selectedAgent.id}] {selectedAgent.name}
                </h3>
                <p className="text-xs font-mono text-cyan-400 mt-0.5">{selectedAgent.file}</p>
              </div>

              <div className="flex items-center gap-2 bg-zinc-900 border border-zinc-800 p-2 rounded-lg font-mono text-xs">
                <div className="px-2 border-r border-zinc-800 text-center">
                  <div className="text-[10px] text-zinc-500 font-bold">TOTAL POINTS</div>
                  <div className="text-cyan-400 font-bold mt-0.5">{selectedAgent.points}</div>
                </div>
                <div className="px-2 text-center">
                  <div className="text-[10px] text-zinc-500 font-bold">COMPUTE FLOW</div>
                  <div className="text-emerald-400 font-bold mt-0.5">{selectedAgent.computePriority}%</div>
                </div>
              </div>
            </div>

            {/* Matrix Metadata grid */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              <div className="bg-zinc-900/60 p-2.5 border border-zinc-800/80 rounded-lg">
                <span className="font-mono text-[9px] text-zinc-500 font-bold block">SQUAD CATEGORY</span>
                <span className="text-xs text-white font-mono mt-0.5 uppercase tracking-wide">
                  {selectedAgent.group}
                </span>
              </div>
              <div className="bg-zinc-900/60 p-2.5 border border-zinc-800/80 rounded-lg">
                <span className="font-mono text-[9px] text-zinc-500 font-bold block">TIME ASSIGNMENT</span>
                <span className="text-xs text-teal-400 font-mono mt-0.5 uppercase tracking-wide">
                  {selectedAgent.timeline}
                </span>
              </div>
              <div className="bg-zinc-900/60 p-2.5 border border-zinc-800/80 rounded-lg">
                <span className="font-mono text-[9px] text-zinc-500 font-bold block">RANK STANDING</span>
                <span className="text-xs text-cyan-400 font-mono mt-0.5 uppercase tracking-wide">
                  {selectedAgent.rank}
                </span>
              </div>
              <div className="bg-zinc-900/60 p-2.5 border border-zinc-800/80 rounded-lg">
                <span className="font-mono text-[9px] text-zinc-500 font-bold block">GOVERNED PHASES</span>
                <span className="text-xs text-zinc-400 font-mono mt-0.5 uppercase tracking-wide">
                  {selectedAgent.phase}
                </span>
              </div>
            </div>

            {/* Mission Statement */}
            <div className="bg-zinc-900/40 p-4 border border-zinc-900 rounded-lg">
              <span className="font-mono text-[10px] text-zinc-400 font-bold uppercase tracking-wider block mb-2">
                CORE SYSTEM MISSION / CONSTITUTIONAL ASSIGNMENT
              </span>
              <p className="text-xs text-zinc-300 leading-relaxed font-sans">{selectedAgent.mission}</p>
            </div>

            {/* Active penalties list */}
            {selectedAgent.activePenalty && (
              <div className="p-4 bg-red-950/20 border border-red-900/60 rounded-lg flex items-start gap-3">
                <ShieldAlert className="h-5 w-5 text-red-500 shrink-0" />
                <div className="flex flex-col gap-0.5">
                  <span className="font-mono text-[10px] text-red-400 font-bold uppercase">
                    ACTIVE PENALTY / SYSTEM RESTRICTION ENFORCED
                  </span>
                  <p className="text-xs text-red-200 font-mono mt-1">{selectedAgent.activePenalty}</p>
                </div>
              </div>
            )}

            {/* Interactive Remote Action Panel */}
            <div className="mt-auto border-t border-zinc-900 pt-5">
              <span className="font-mono text-[10px] text-zinc-500 font-bold uppercase block mb-3">
                ORCHESTRATOR COMMANDS & ENFORCEMENT LAB
              </span>

              <div className="flex flex-wrap items-center gap-2">
                {/* Bounty trigger */}
                <button
                  onClick={() => setShowBountyForm(!showBountyForm)}
                  className="bg-cyan-950/80 hover:bg-cyan-900 text-cyan-400 border border-cyan-800 px-3.5 py-2 rounded-lg text-xs font-mono font-bold flex items-center gap-1.5 transition-colors cursor-pointer"
                >
                  <Coins className="h-3.5 w-3.5 text-cyan-400" />
                  ASSIGN MAPPED BOUNTY
                </button>

                {/* Adjust compute */}
                <button
                  onClick={() => handleComputeChange(selectedAgent, 10)}
                  disabled={selectedAgent.computePriority >= 100}
                  className="bg-zinc-900 hover:bg-zinc-800 disabled:opacity-40 disabled:hover:bg-zinc-900 text-zinc-300 border border-zinc-800 px-3 py-2 rounded-lg text-xs font-mono transition-colors cursor-pointer"
                  title="Increase execution slot priority"
                >
                  COMPUTE +10%
                </button>
                <button
                  onClick={() => handleComputeChange(selectedAgent, -10)}
                  disabled={selectedAgent.computePriority <= 10}
                  className="bg-zinc-900 hover:bg-zinc-800 disabled:opacity-40 disabled:hover:bg-zinc-900 text-zinc-300 border border-zinc-800 px-3 py-2 rounded-lg text-xs font-mono transition-colors cursor-pointer"
                  title="Decrease execution slot priority"
                >
                  COMPUTE -10%
                </button>

                {/* Clear penalty or levy fine */}
                {selectedAgent.activePenalty ? (
                  <button
                    onClick={() => handleClearPenalty(selectedAgent)}
                    className="bg-emerald-950/80 hover:bg-emerald-900 text-emerald-400 border border-emerald-800 px-3.5 py-2 rounded-lg text-xs font-mono font-bold flex items-center gap-1 transition-colors cursor-pointer ml-auto"
                  >
                    <UserCheck className="h-3.5 w-3.5 text-emerald-400" />
                    REINSTATE STATUS
                  </button>
                ) : (
                  <button
                    onClick={() =>
                      handleApplyPenalty(
                        selectedAgent,
                        "LEVEL 1: RESOURCE TAX (fined 10 raw rank points for non-compliance with telemetry standups)"
                      )
                    }
                    className="bg-red-950/80 hover:bg-red-900 text-red-400 border border-red-800 px-3.5 py-2 rounded-lg text-xs font-mono font-bold flex items-center gap-1 transition-colors cursor-pointer ml-auto"
                  >
                    <ShieldClose className="h-3.5 w-3.5 text-red-400" />
                    APPLY DISCIPLINARY FINE
                  </button>
                )}
              </div>
            </div>

            {/* Custom Bounty Form Overlay */}
            {showBountyForm && (
              <form
                onSubmit={handleCreateBounty}
                className="bg-zinc-900 border border-zinc-800 p-4 rounded-xl flex flex-col gap-3 mt-4"
              >
                <div className="flex items-center justify-between">
                  <span className="font-mono text-xs text-white font-bold uppercase">
                    PROPOSE BOUNTY FOR {selectedAgent.name}
                  </span>
                  <button
                    type="button"
                    onClick={() => setShowBountyForm(false)}
                    className="text-zinc-500 hover:text-zinc-400 font-mono text-[10px] uppercase cursor-pointer"
                  >
                    Cancel
                  </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  <div className="flex flex-col gap-1 md:col-span-2">
                    <label className="font-mono text-[9px] text-zinc-500 uppercase font-bold">Bounty Title</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Audit encryption boundaries for Stripe locks"
                      value={bountyTitle}
                      onChange={(e) => setBountyTitle(e.target.value)}
                      className="w-full bg-zinc-950 border border-zinc-800 rounded p-1.5 text-xs text-white placeholder-zinc-600 font-mono text"
                    />
                  </div>

                  <div className="flex flex-col gap-1">
                    <label className="font-mono text-[9px] text-zinc-500 uppercase font-bold">Category</label>
                    <select
                      value={bountyType}
                      onChange={(e) => setBountyType(e.target.value as any)}
                      className="w-full bg-zinc-950 border border-zinc-800 rounded p-1.5 text-xs text-white font-mono"
                    >
                      <option value="Feature">Feature</option>
                      <option value="Security">Security</option>
                      <option value="QA">QA</option>
                      <option value="Growth">Growth</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <div className="flex flex-col gap-1">
                    <label className="font-mono text-[9px] text-zinc-500 uppercase font-bold">Points Reward (Carrot)</label>
                    <input
                      type="number"
                      min={5}
                      max={100}
                      value={bountyReward}
                      onChange={(e) => setBountyReward(Number(e.target.value))}
                      className="w-full bg-zinc-950 border border-zinc-800 rounded p-1.5 text-xs text-white font-mono"
                    />
                  </div>

                  <div className="flex flex-col gap-1">
                    <span className="font-mono text-[9px] text-zinc-500 uppercase font-bold">Expected Hand-off</span>
                    <span className="text-neutral-400 font-mono text-[11px] mt-1.5 uppercase font-semibold">
                      Auto-claims under {selectedAgent.rank} priority
                    </span>
                  </div>
                </div>

                <div className="flex flex-col gap-1">
                  <label className="font-mono text-[9px] text-zinc-500 uppercase font-bold">Technical Description</label>
                  <textarea
                    required
                    placeholder="Provide technical requirement criteria for target agent verification..."
                    value={bountyDesc}
                    onChange={(e) => setBountyDesc(e.target.value)}
                    rows={2}
                    className="w-full bg-zinc-950 border border-zinc-800 rounded p-1.5 text-xs text-white placeholder-zinc-600 font-mono resize-none"
                  />
                </div>

                <button
                  type="submit"
                  className="bg-cyan-500 hover:bg-cyan-400 text-black py-2 rounded font-mono text-xs font-bold transition-all uppercase cursor-pointer"
                >
                  CONFIRM SPECIAL OPERATIONS ASSIGNMENT
                </button>
              </form>
            )}
          </div>
        ) : (
          <div className="bg-zinc-950 border border-zinc-800 rounded-xl p-8 text-center text-zinc-500 font-mono text-xs h-[650px] flex items-center justify-center">
            Select an agent from the roster to inspect squad statistics and trigger audit playbooks.
          </div>
        )}
      </div>
    </div>
  );
}
