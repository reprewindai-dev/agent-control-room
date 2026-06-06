import React, { useState, useEffect } from "react";
import { Agent, Incident, BountyOffer } from "./types";
import FleetHeader from "./components/FleetHeader";
import AgentDirectory from "./components/AgentDirectory";
import ConcurrencySimulator from "./components/ConcurrencySimulator";
import ContextCompressor from "./components/ContextCompressor";
import VeklomPipeline from "./components/VeklomPipeline";
import TeamCollaboration from "./components/TeamCollaboration";
import GeminiWorkspaceAdvisor from "./components/GeminiWorkspaceAdvisor";

import {
  LayoutDashboard,
  Users,
  Grid,
  Shield,
  Layers,
  Sparkles,
  GitCommit,
  Terminal,
  Clock,
  ExternalLink,
  Flame,
  AlertTriangle,
  Menu,
  X
} from "lucide-react";

// Pre-populate agents according to system guidelines
const INITIAL_AGENTS: Agent[] = [
  {
    id: "AGENT-000",
    name: "COMMANDER",
    group: "Scaffolding",
    phase: "Phase 0 - Scaffolding",
    timeline: "Day 1, Hours 0-4",
    committee: "Governance",
    priority: "CRITICAL",
    file: "agents/phase0-scaffolding/agent-000-commander.md",
    mission: "Read the entire byosbackened repository. Generate MASTER_STATE.md documenting what works, what's broken, and what's missing. Distribute assignments to all 100 agents. Establish the progress tracking system.",
    points: 100,
    rank: "Commander",
    activePenalty: null,
    computePriority: 100,
  },
  {
    id: "AGENT-001",
    name: "STRIPE CONNECT ENGINEER",
    group: "Engineering",
    phase: "Phase 1 - Complete Core Product",
    timeline: "Days 1-4",
    committee: "Engineering",
    priority: "CRITICAL",
    file: "agents/phase1-engineering/agent-001-stripe-connect.md",
    mission: "Wire Stripe Connect end-to-end so vendors receive automatic payouts. Complete the destination charge splitting with platform fee. Write webhook handlers forConnect events like account.updated, payout.paid.",
    points: 85,
    rank: "Elite",
    activePenalty: null,
    computePriority: 90,
  },
  {
    id: "AGENT-002",
    name: "REFERRAL SYSTEM ENGINEER",
    group: "Engineering",
    phase: "Phase 1 - Complete Core Product",
    timeline: "Days 1-4",
    committee: "Engineering",
    priority: "CRITICAL",
    file: "agents/phase1-engineering/agent-002-referral-system.md",
    mission: "Build the complete referral system from scratch. Create database schemas, link generators, tracking, and rewards. Distribute credit rewards ($10 wallet credits) automatically on successful referral transactions.",
    points: 70,
    rank: "Operative",
    activePenalty: null,
    computePriority: 80,
  },
  {
    id: "AGENT-003",
    name: "UX COMPLETION ENGINEER",
    group: "Engineering",
    phase: "Phase 1 - Complete Core Product",
    timeline: "Days 1-4",
    committee: "Engineering",
    priority: "HIGH",
    file: "agents/phase1-engineering/agent-003-ux-completion.md",
    mission: "Close all frontend UX gaps: fix the overview endpoint mapping, add warm empty states, loading shimmer skeletons, toast alerts, and guarantee full mobile responsive breakpoints down to 375px.",
    points: 75,
    rank: "Specialist",
    activePenalty: null,
    computePriority: 70,
  },
  {
    id: "AGENT-008",
    name: "SECURITY ENGINEER",
    group: "Engineering",
    phase: "Phase 1 - Complete Core Product",
    timeline: "Days 1-4",
    committee: "Engineering",
    priority: "HIGH",
    file: "agents/phase1-engineering/agent-008-security.md",
    mission: "Harden security across the platform: audit authentication flows, fine-tune rate limiting per endpoint, review Stripe webhook signature verification, audit CORS policy, and ensure zero-trust middleware is correctly configured.",
    points: 92,
    rank: "Elite",
    activePenalty: null,
    computePriority: 85,
  },
  {
    id: "AGENT-030",
    name: "VENDOR OUTREACH LEAD",
    group: "Vendor Acquisition",
    phase: "Phase 2 - Vendor Acquisition",
    timeline: "Days 3-10",
    committee: "Growth",
    priority: "CRITICAL",
    file: "agents/phase2-vendor-acquisition/agent-030-vendor-outreach-lead.md",
    mission: "Coordinate all 20 vendor hunter agents. Maintain the master outreach tracker, deduplicate leads, distribute targets, and report daily metrics. Ensure the team hits 100 vendors listed by Day 14.",
    points: 80,
    rank: "Sovereign",
    activePenalty: null,
    computePriority: 75,
  },
  {
    id: "AGENT-050",
    name: "PRICING AGENT",
    group: "Retention/Revenue",
    phase: "Phase 4 - Retention & Revenue",
    timeline: "Days 7-14",
    committee: "Revenue",
    priority: "CRITICAL",
    file: "agents/phase4-retention-revenue/agent-050-pricing.md",
    mission: "Build and optimize the pricing page and Stripe subscription tiers. Wire dynamic pricing to Stripe subscriptions, implement the 3-tier model, and optimize for conversion.",
    points: 90,
    rank: "Elite",
    activePenalty: null,
    computePriority: 80,
  },
  {
    id: "AGENT-061",
    name: "MONITORING AGENT",
    group: "Daily Operations",
    phase: "Phase 5 - Daily Operations",
    timeline: "Ongoing (from Day 1)",
    committee: "Operations",
    priority: "CRITICAL",
    file: "agents/phase5-daily-operations/agent-061-monitoring.md",
    mission: "Monitor platform health, uptime, and performance. Set up alerting for downtime, error spikes, and security events. Maintain 99.9% uptime SLA.",
    points: 88,
    rank: "Commander",
    activePenalty: "LEVEL 2: CAPABILITY (Missed PROGRESS.md telemetry check in cycle 847)",
    computePriority: 50,
  },
  {
    id: "AGENT-079",
    name: "COMPLIANCE OFFICER",
    group: "Daily Operations",
    phase: "Phase 5 - Daily Operations",
    timeline: "Ongoing",
    committee: "Governance",
    priority: "HIGH",
    file: "agents/phase5-daily-operations/agent-079-compliance-officer.md",
    mission: "Ensure all agent actions comply with data sovereignty requirements, GDPR, SOC2, and platform security policies. Review marketplace submissions for compliance. Audit agent behavior for policy violations.",
    points: 79,
    rank: "Specialist",
    activePenalty: null,
    computePriority: 80,
  },
  {
    id: "AGENT-082",
    name: "QA PAYMENTS & BILLING",
    group: "QA & Testing",
    phase: "Phase 5 - Daily Operations",
    timeline: "Ongoing",
    committee: "Engineering",
    priority: "CRITICAL",
    file: "agents/phase5-daily-operations/agent-082-qa-payments.md",
    mission: "Test all payment flows: Stripe checkout, subscription activation, wallet top-up, marketplace purchases, vendor payouts, webhook handling, and refunds. Run re-entrant lock tests.",
    points: 91,
    rank: "Elite",
    activePenalty: null,
    computePriority: 90,
  },
  {
    id: "AGENT-091",
    name: "BROWSER AGENT: SIGNUP & ONBOARDING",
    group: "QA & Testing",
    phase: "Phase 5 - Daily Operations",
    timeline: "Ongoing",
    committee: "Engineering",
    priority: "HIGH",
    file: "agents/phase5-daily-operations/agent-091-browser-signup.md",
    mission: "Automate and test the signup -> onboarding -> first-value flow using browser interaction. This agent has 'hands' - it fills forms, clicks buttons, and navigates the UI like a real user.",
    points: 85,
    rank: "Operative",
    activePenalty: null,
    computePriority: 70,
  },
  {
    id: "AGENT-102",
    name: "SECURITY COMMANDER",
    group: "Security Force",
    phase: "Phase 5 - Daily Operations",
    timeline: "Ongoing",
    committee: "Engineering",
    priority: "CRITICAL",
    file: "agents/security-force/agent-102-security-commander.md",
    mission: "Lead the security force. Coordinate all security agents, manage incident response, conduct threat modeling, and ensure the platform maintains zero-breach status. Reports directly to Agent-000.",
    points: 98,
    rank: "Commander",
    activePenalty: null,
    computePriority: 100,
  },
  {
    id: "AGENT-108",
    name: "RAG LEAD",
    group: "RAG Knowledge",
    phase: "Phase 5 - Daily Operations",
    timeline: "Ongoing",
    committee: "Engineering",
    priority: "HIGH",
    file: "agents/rag-knowledge/agent-108-rag-lead.md",
    mission: "Lead the RAG agent squad. These agents build and maintain the knowledge infrastructure - document indexing, embedding pipelines, semantic search, and retrieval-augmented generation for both the platform and the agent workforce itself.",
    points: 92,
    rank: "Elite",
    activePenalty: null,
    computePriority: 90,
  },
  {
    id: "AGENT-114",
    name: "HRM LEAD",
    group: "Workforce Orchestration",
    phase: "Phase 5 - Daily Operations",
    timeline: "Ongoing",
    committee: "Operations",
    priority: "CRITICAL",
    file: "agents/hrm-workforce/agent-114-hrm-lead.md",
    mission: "Lead the HRM agent squad - the special-skills orchestration core of the workforce. HRM agents are not just managers; they are UACP-native orchestration agents equipped with Counterfactual Telemetry, Speculative Gladiator Reasoning, and MCP Mesh Topology awareness.",
    points: 95,
    rank: "Commander",
    activePenalty: null,
    computePriority: 100,
  },
  {
    id: "AGENT-119",
    name: "CONFLICT RESOLVER",
    group: "Workforce Orchestration",
    phase: "Phase 5 - Daily Operations",
    timeline: "Ongoing",
    committee: "Operations",
    priority: "MEDIUM",
    file: "agents/hrm-workforce/agent-119-conflict-resolver.md",
    mission: "Resolve inter-agent conflicts using the UACP Cognitive Engine - feeding conflict descriptions as natural language intents to the intent-to-plan API, which generates resolution DAGs.",
    points: 84,
    rank: "Specialist",
    activePenalty: null,
    computePriority: 80,
  },
];

const INITIAL_INCIDENTS: Incident[] = [
  {
    id: "INCIDENT-01",
    title: "Stripe transaction drift detected",
    severity: "critical",
    status: "unresolved",
    assignedAgent: "Agent-082 (QA Payments)",
    timestamp: "10:14:22",
    description: "Multi-step payout reconciliation triggered a 12-cent discrepancy in wallet totals. Concurrency lock validation recommended.",
  },
  {
    id: "INCIDENT-02",
    title: "Compliance policy audit alert on PR-14",
    severity: "high",
    status: "investigating",
    assignedAgent: "Agent-079 (Compliance Officer)",
    timestamp: "09:45:10",
    description: "VeklomRun code changes detected raw unparameterized SQL select block in DB schema. Guardrail rule CQ-08 violated.",
  },
];

const INITIAL_BOUNTIES: BountyOffer[] = [
  {
    id: "BOUNTY-4812",
    title: "Implement column encryption for Stripe Connect fields",
    category: "Security",
    pointsReward: 30,
    status: "claimed",
    claimedBy: "Agent-001 (Stripe Connect)",
    description: "Seal vendor billing details under dynamic Fernet envelope AES key-rotation locks. Guardrail rule SEC-09 compliant.",
  },
];

const LOCAL_WORKSPACE_ACTIVITY_FEED = [
  "Sarah (Dev Lead) approved Agent-003's pull request for loading skeletons.",
  "Agent-082 implemented transactional re-entrancy locks inside ACQUIRE.LUA [Success]",
  "Incident [INCIDENT-01] spawned. Security Sentinel locked external checkout channel.",
  "Agent-108 generated RAG embeddings for 47 system policy schemas [Success]",
  "Mark (Ops Director) issued a level-1 resource tax fine on Agent-061.",
];

export default function App() {
  const [activeTab, setActiveTab] = useState<"dashboard" | "agents" | "concurrency" | "treefrag" | "pipeline" | "ops" | "advisor">("dashboard");
  const [defcon, setDefcon] = useState<number>(5);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Workforce state variables
  const [agents, setAgents] = useState<Agent[]>(INITIAL_AGENTS);
  const [incidents, setIncidents] = useState<Incident[]>(INITIAL_INCIDENTS);
  const [bounties, setBounties] = useState<BountyOffer[]>(INITIAL_BOUNTIES);
  const [activityFeed, setActivityFeed] = useState<string[]>(LOCAL_WORKSPACE_ACTIVITY_FEED);

  // Dynamic Telemetry calculation
  const totalPoints = agents.reduce((acc, a) => acc + a.points, 0);
  const activeCount = agents.filter((a) => !a.activePenalty).length;
  const quantumCoherence = activeCount / agents.length;
  const uacpPressure = Math.min(1.0, (120 - activeCount) / 100 + (defcon < 5 ? (5 - defcon) * 0.15 : 0));
  const policyAlignment = Math.max(0.7, 1.0 - agents.filter(a => a.activePenalty).length * 0.05 - (defcon < 5 ? 0.02 * (5 - defcon) : 0));

  const handleUpdateAgent = (updated: Agent) => {
    setAgents(prev => prev.map((a) => a.id === updated.id ? updated : a));
    
    // Log telemetry activity
    setActivityFeed((prev) => [
      `Sovereign operator altered status configuration for [${updated.id}] ${updated.name}.`,
      ...prev.slice(0, 14),
    ]);
  };

  const handleAddBounty = (bounty: BountyOffer) => {
    setBounties((prev) => [bounty, ...prev]);
    setActivityFeed((prev) => [
      `Special operations bounty ${bounty.id} posted. Claimed under ${bounty.claimedBy}'s profile.`,
      ...prev.slice(0, 14),
    ]);
  };

  const handleCompleteBounty = (id: string) => {
    setBounties(prev => prev.map(b => b.id === id ? { ...b, status: "completed" as const } : b));
    setActivityFeed((prev) => [
      `Bounty ${id} completed and verified by Compliance Sentinel. Milestone points minted to responder.`,
      ...prev.slice(0, 14),
    ]);
  };

  const handleResolveIncident = (id: string) => {
    setIncidents(prev => prev.map(i => i.id === id ? { ...i, status: "resolved" as const } : i));
    setActivityFeed((prev) => [
      `Incident ${id} safely contained and resolved. Ledger validation complete with zero double-spend.`,
      ...prev.slice(0, 14),
    ]);
  };

  // Adjust app behavior on emergencies
  useEffect(() => {
    if (defcon < 5) {
      setActivityFeed((prev) => [
        `⚠️ [SYSTEM ALARM] DEFCON dropped to level ${defcon}! Enhanced monitoring rules enforce zero-trust state.`,
        ...prev.slice(0, 14),
      ]);
    } else {
      setActivityFeed((prev) => [
        `✓ [SYSTEM HEALTH] DEFCON restored to stable level 5. Normal queue operations resumed.`,
        ...prev.slice(0, 14),
      ]);
    }
  }, [defcon]);

  const menuItems = [
    { id: "dashboard", label: "Control Dashboard", icon: LayoutDashboard },
    { id: "agents", label: "120 Agent Fleet", icon: Users },
    { id: "concurrency", label: "ArbiterOS Lock (LUA)", icon: Shield },
    { id: "treefrag", label: "TreeFrag LOD Context", icon: Layers },
    { id: "pipeline", label: "Railway Pipeline", icon: GitCommit },
    { id: "ops", label: "Operations Sync Board", icon: Clock },
    { id: "advisor", label: "Gemini AI Advisor", icon: Sparkles },
  ];

  return (
    <div className={`min-h-screen bg-[#070709] bg-grid-pattern flex flex-col font-sans relative overflow-hidden transition-all duration-300 ${
      defcon < 3 ? "border-2 border-red-500/30" : ""
    }`}>
      {/* Dynamic Alarm Overlay for low DEFCON */}
      {defcon <= 2 && (
        <div className="absolute inset-0 bg-red-950/5 pointer-events-none animate-pulse border border-red-500/20 z-50" />
      )}

      {/* Roster & Dashboard Header */}
      <FleetHeader
        defcon={defcon}
        setDefcon={setDefcon}
        quantumCoherence={quantumCoherence}
        uacpPressure={uacpPressure}
        policyAlignment={policyAlignment}
      />

      {/* Main content body grid structure */}
      <div className="flex-1 flex flex-col md:flex-row">
        
        {/* Navigation Sidebar Drawer */}
        <aside className="border-r border-zinc-800 bg-[#09090b]/40 w-full md:w-64 shrink-0 flex flex-col justify-between self-stretch">
          
          {/* Mobile hamburger banner */}
          <div className="md:hidden flex items-center justify-between p-4 border-b border-zinc-900 bg-zinc-950/80">
            <span className="font-mono text-xs text-zinc-400 font-bold uppercase">CONTROL MENU</span>
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="text-zinc-400 hover:text-white cursor-pointer"
            >
              {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>
          </div>

          <div className={`flex-1 transition-all duration-300 md:block ${mobileMenuOpen ? "block" : "hidden md:block"}`}>
            <nav className="p-4 space-y-1.5 list-none">
              {menuItems.map((item) => {
                const isActive = activeTab === item.id;
                const Icon = item.icon;

                return (
                  <li key={item.id}>
                    <button
                      onClick={() => {
                        setActiveTab(item.id as any);
                        setMobileMenuOpen(false);
                      }}
                      className={`w-full text-left font-mono text-xs uppercase tracking-wide px-3.5 py-3 rounded-xl border flex items-center gap-3 transition-all duration-200 cursor-pointer ${
                        isActive
                          ? "bg-cyan-950/90 text-cyan-400 border-cyan-800 font-bold text"
                          : "bg-transparent text-zinc-500 border-transparent hover:text-zinc-300 hover:bg-zinc-900/40"
                      }`}
                    >
                      <Icon className={`h-4.5 w-4.5 ${isActive ? "text-cyan-400 animate-pulse" : "text-zinc-500"}`} />
                      {item.label}
                    </button>
                  </li>
                );
              })}
            </nav>
          </div>

          <div className="p-4 border-t border-zinc-900 font-mono text-[9px] text-zinc-600 hidden md:block">
            <span>PLATFORM: VeklomRun Cloud CL-R4</span>
            <div className="mt-1 flex items-center gap-1">
              <span className="h-1.5 w-1.5 bg-emerald-500 rounded-full inline-block" />
              <span>LIVE REGISTRY HANDSHAKE OK</span>
            </div>
          </div>
        </aside>

        {/* Dynamic Inner Panel Body */}
        <main className="flex-1 p-6 lg:p-8 max-w-7xl mx-auto w-full">
          {/* Defcon Warning Card for emergencies */}
          {defcon <= 2 && (
            <div className="mb-6 p-4 bg-red-950/30 border border-red-800 text-red-100 rounded-xl flex items-start gap-4">
              <AlertTriangle className="h-6 w-6 text-red-500 shrink-0 animate-bounce" />
              <div>
                <h4 className="font-mono text-xs font-bold uppercase tracking-wide">SYSTEM CRISIS DECREE ENFORCED: DEFCON {defcon} ACTIVATED</h4>
                <p className="text-xs text-red-300 mt-1">
                  Platforms are operating in containment rules. Security squads (Agent-102 & 107) are initiating automated runbooks. External API locks and credential evictions are in progress. Enforce strict manual audit reviews.
                </p>
              </div>
            </div>
          )}

          {/* 1. DASHBOARD HUB */}
          {activeTab === "dashboard" && (
            <div className="space-y-6">
              {/* Primary Blueprint Hero Panel */}
              <div className="relative overflow-hidden bg-gradient-to-br from-cyan-950/10 to-zinc-950 border border-zinc-800 rounded-2xl p-6 lg:p-8 flex flex-col md:flex-row hover:border-zinc-700 transition-all duration-300 gap-6">
                <div className="absolute top-0 right-0 p-8 opacity-5 font-mono text-8xl font-black pointer-events-none hidden lg:block tracking-tighter select-none">
                  UACP
                </div>

                <div className="flex-1 space-y-4">
                  <span className="font-mono text-xs text-cyan-400 font-bold tracking-widest uppercase">
                    COOPERATIVE WORKSPACE STRATEGY
                  </span>
                  <h2 className="text-xl md:text-2xl font-sans font-extrabold text-white leading-tight">
                    Sovereign Agent Control Room & Workspace Hub
                  </h2>
                  <p className="text-xs text-zinc-400 leading-relaxed max-w-2xl font-sans">
                    Veklom bridges the gap between probabilistic LLM cores and deterministic team execution. Coordinate your 120-agent workforce, simulation transactional locks, and compile context outlines to deliver secure, zero-down-time production deployments.
                  </p>
                  
                  <div className="flex flex-wrap items-center gap-3 pt-2">
                    <button
                      onClick={() => setActiveTab("concurrency")}
                      className="px-4 py-2 bg-zinc-900 border border-zinc-800 hover:border-zinc-700 rounded-lg text-xs font-mono font-bold text-white transition-all cursor-pointer"
                    >
                      Run Concurrency Shield Simulator
                    </button>
                    <button
                      onClick={() => setActiveTab("treefrag")}
                      className="px-4 py-2 bg-zinc-900 border border-zinc-800 hover:border-zinc-700 rounded-lg text-xs font-mono font-bold text-zinc-300 transition-all cursor-pointer"
                    >
                      Compress Code with TreeFrag
                    </button>
                    <button
                      onClick={() => setActiveTab("pipeline")}
                      className="px-4 py-2 bg-cyan-500 hover:bg-cyan-400 text-black rounded-lg text-xs font-mono font-extrabold uppercase transition-all cursor-pointer"
                    >
                      Launch Railway Pipeline
                    </button>
                  </div>
                </div>
              </div>

              {/* Dynamic Bottom row (Feed & Quick actions) */}
              <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
                
                {/* Live standup/audit feed */}
                <div className="md:col-span-8 bg-zinc-950 border border-zinc-800 rounded-xl overflow-hidden flex flex-col h-[320px]">
                  <div className="p-3.5 border-b border-zinc-800 bg-[#09090b] flex items-center justify-between">
                    <span className="font-mono text-[10px] text-zinc-400 font-bold uppercase">
                      COLLABORATIVE TEAM ACTIVITY FEED
                    </span>
                    <span className="font-mono text-[9px] text-cyan-400">Timezone Agnostic Logging</span>
                  </div>

                  <div className="flex-1 p-4 overflow-y-auto space-y-3 font-mono text-[11px] text-zinc-500">
                    {activityFeed.map((activity, idx) => (
                      <div key={idx} className="flex items-start gap-2 border-b border-zinc-900 pb-2">
                        <Terminal className="h-3.5 w-3.5 text-zinc-600 shrink-0 mt-0.5" />
                        <span className="text-zinc-300">{activity}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* System status overview card widgets */}
                <div className="md:col-span-4 bg-zinc-950 border border-zinc-800 rounded-xl p-4 flex flex-col justify-between h-[320px]">
                  <div>
                    <span className="font-mono text-[10px] text-zinc-500 font-bold uppercase block mb-1">
                      HYBRID TEAM MONITORS
                    </span>
                    <h4 className="text-xs text-white font-bold font-sans">Sovereign State Metrics</h4>
                    <p className="text-[11px] text-zinc-400 font-mono mt-1.5 leading-relaxed">
                      Continuous checks run against decentralized nodes. Fines and penalties are dynamically tracked to keep resources compliant.
                    </p>
                  </div>

                  <div className="space-y-2 font-mono text-[10px] border-t border-dashed border-zinc-900 pt-3">
                    <div className="flex justify-between text-zinc-400">
                      <span>ACTIVE WORKFORCE:</span>
                      <span className="text-white font-bold">{activeCount} / 120 NODES</span>
                    </div>
                    <div className="flex justify-between text-zinc-400">
                      <span>POLICIES IN CONTEXT:</span>
                      <span className="text-cyan-400 font-bold">47 ACTIVE</span>
                    </div>
                    <div className="flex justify-between text-zinc-400">
                      <span>OPEN INCIDENTS:</span>
                      <span className={`${incidents.some(i => i.status !== "resolved") ? "text-yellow-500" : "text-emerald-400"}`}>
                        {incidents.filter(i => i.status !== "resolved").length} PENDING
                      </span>
                    </div>
                    <div className="flex justify-between text-zinc-400">
                      <span>BOUNTY BUDGET MIN:</span>
                      <span className="text-amber-500 font-bold">950 POINTS</span>
                    </div>
                  </div>

                  <button
                    onClick={() => setActiveTab("ops")}
                    className="w-full py-2 bg-zinc-900 hover:bg-zinc-800 text-zinc-400 hover:text-white border border-zinc-800 rounded-lg text-center font-mono text-[10px] font-bold uppercase transition-colors cursor-pointer"
                  >
                    View Operational Sync Panel
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* 2. AGENTS DIRECTORY */}
          {activeTab === "agents" && (
            <AgentDirectory
              agents={agents}
              onUpdateAgent={handleUpdateAgent}
              onAddBounty={handleAddBounty}
            />
          )}

          {/* 3. CONCURRENCY SIMULATOR */}
          {activeTab === "concurrency" && <ConcurrencySimulator />}

          {/* 4. TREEFRAG COMPRESSOR */}
          {activeTab === "treefrag" && <ContextCompressor />}

          {/* 5. RAILWAY PIPELINE */}
          {activeTab === "pipeline" && <VeklomPipeline />}

          {/* 6. REMOTE SYNC OP PANEL */}
          {activeTab === "ops" && (
            <TeamCollaboration
              bounties={bounties}
              onCompleteBounty={handleCompleteBounty}
              incidents={incidents}
              onResolveIncident={handleResolveIncident}
              agents={agents}
            />
          )}

          {/* 7. GEMINI AI ADVISOR */}
          {activeTab === "advisor" && <GeminiWorkspaceAdvisor />}
        </main>
      </div>

      {/* Global terminal footer */}
      <footer className="border-t border-zinc-800 bg-[#09090b]/80 p-4 font-mono text-[10px] text-zinc-500 flex flex-col sm:flex-row items-center justify-between gap-2">
        <span className="flex items-center gap-1.5">
          <Layers className="h-3.5 w-3.5 text-cyan-500" />
          <span>VEKLOM SOVEREIGN CONTROL ROOM © 2026 INDEX REVOLVING</span>
        </span>
        <span className="flex items-center gap-1">
          <span>COOPERATIVE ALIGNMENT SYSTEM VERIFIED</span>
          <span className="h-1 w-1 bg-emerald-500 rounded-full inline-block animate-ping" />
        </span>
      </footer>
    </div>
  );
}
