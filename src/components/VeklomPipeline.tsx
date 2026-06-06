import React, { useState, useEffect, useRef } from "react";
import { GitPullRequest, Settings, Terminal, CheckCircle2, XCircle, Play, Vote, BadgeCheck, ShieldAlert, Award } from "lucide-react";
import { PipelineStage } from "../types";

export default function VeklomPipeline() {
  const [pipelineState, setPipelineState] = useState<"idle" | "running" | "voting" | "approved" | "rejected">("idle");
  const [activeStageIndex, setActiveStageIndex] = useState(-1);
  const [logLines, setLogs] = useState<string[]>([]);
  const consoleEndRef = useRef<HTMLDivElement>(null);

  // Council Gate State
  const [votes, setVotes] = useState({
    engineering: "aye",
    growth: "aye",
    operations: "abstain",
    research: "aye",
    revenue: "aye",
    compliance: "aye",
    security: "aye",
    electedA: "aye",
    electedB: "aye",
    electedC: "aye",
  });
  const [humanVote, setHumanVote] = useState<"aye" | "nay" | "abstain">("aye");

  const INITIAL_STAGES: PipelineStage[] = [
    { id: "source", label: "SOURCE", status: "pending", checkList: ["git webhook parsed", "verify origin signature", "extract context"] },
    { id: "build", label: "BUILD", status: "pending", checkList: ["esbuild compiler startup", "bundle server assets", "npm prune dev"] },
    { id: "validate", label: "VALIDATE", status: "pending", checkList: ["ruff check audit", "type alignment validation", "secret leak check"] },
    { id: "test", label: "TEST", status: "pending", checkList: ["unit test suite", "contract validations", "latency stress test"] },
    { id: "stage", label: "STAGE", status: "pending", checkList: ["register canary 10%", "policy telemetry monitor", "heartbeat validation"] },
    { id: "gate", label: "COUNCIL GATE", status: "pending", checkList: ["Supermajority ledger", "Sovereign veto verify", "evidence compile"] },
    { id: "deploy", label: "DEPLOY", status: "pending", checkList: ["blue-green swap", "verify Stripe Connect webhooks", "platform pulse OK"] },
  ];

  const [stages, setStages] = useState<PipelineStage[]>(INITIAL_STAGES);

  const appendLog = (line: string) => {
    const timestamp = new Date().toLocaleTimeString();
    setLogs((prev) => [...prev, `[${timestamp}] ${line}`]);
  };

  useEffect(() => {
    if (consoleEndRef.current) {
      consoleEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [logLines]);

  const triggerPipeline = () => {
    if (pipelineState === "running" || pipelineState === "voting") return;

    setPipelineState("running");
    setStages(INITIAL_STAGES.map(s => ({ ...s, status: "pending" })));
    setLogs([]);
    setActiveStageIndex(0);
    appendLog("🚂 VEKLOM REVOLVING RAIL INTEGRATOR STARTED");
    appendLog("Checking workspace origin configuration...");
  };

  useEffect(() => {
    if (pipelineState !== "running") return;
    if (activeStageIndex < 0 || activeStageIndex >= stages.length) return;

    const currentStage = stages[activeStageIndex];
    
    // Set status of current stage to running
    setStages(prev => prev.map((s, idx) => idx === activeStageIndex ? { ...s, status: "running" } : s));
    appendLog(`Entering Pipeline Stage: ${currentStage.label}`);

    let itemIdx = 0;
    const interval = setInterval(() => {
      if (itemIdx < currentStage.checkList.length) {
        appendLog(`   - CHECK COMPLETED: ${currentStage.checkList[itemIdx]} [100% OK]`);
        itemIdx++;
      } else {
        clearInterval(interval);
        
        // Mark stage as success
        setStages(prev => prev.map((s, idx) => idx === activeStageIndex ? { ...s, status: "success" } : s));
        appendLog(`Stage [${currentStage.label}] finished. Transitioning...`);

        // If we just finished 'stage' (index 4) - pause for 'gate' vote (index 5)
        if (currentStage.id === "stage") {
          setPipelineState("voting");
          setActiveStageIndex(5);
          appendLog("⚠️ [GATE TRANSITION BLOCK] Council promotion ticket evaluated. Waiting for Supermajority approval vote.");
        } else if (currentStage.id === "gate") {
          // If we are at the gate stage, we should proceed based on vote outcomes, but here the loop handles deploy directly if called:
          setActiveStageIndex(activeStageIndex + 1);
        } else if (currentStage.id === "deploy") {
          setPipelineState("approved");
          appendLog("🎉 PIPELINE PROMOTION COMPLETE: Production branch deployed cleanly. Stripe Connect webhooks verified. DEFCON 5 maintained.");
        } else {
          setActiveStageIndex(activeStageIndex + 1);
        }
      }
    }, 900);

    return () => clearInterval(interval);
  }, [activeStageIndex, pipelineState]);

  // Vote calculation
  const totalVotes = Object.values(votes).length + 1; // Delegates + Human
  const ayeCount = Object.values(votes).filter(v => v === "aye").length + (humanVote === "aye" ? 1 : 0);
  const nayCount = Object.values(votes).filter(v => v === "nay").length + (humanVote === "nay" ? 1 : 0);
  const abstainCount = Object.values(votes).filter(v => v === "abstain").length + (humanVote === "abstain" ? 1 : 0);

  const approvalRate = (ayeCount / (totalVotes - abstainCount)) * 100;
  const isQuorumMet = totalVotes - abstainCount >= 6; // Quorum out of 10 is 6
  const isSupermajorityMet = approvalRate >= 67; // 67% or more approval required

  const handleCouncilDecision = (approve: boolean) => {
    if (pipelineState !== "voting") return;

    if (approve && isQuorumMet && isSupermajorityMet) {
      setPipelineState("running");
      setStages(prev => prev.map(s => s.id === "gate" ? { ...s, status: "success" } : s));
      setActiveStageIndex(6); // Transition to deploy
      appendLog("✓ Sovereign Council supermajority quorum met. Veto tests evaluated. Overriding block.");
    } else {
      setPipelineState("rejected");
      setStages(prev => prev.map(s => s.id === "gate" ? { ...s, status: "failed" } : s));
      appendLog("🛑 PIPELINE TERMINATED: Sovereign Council veto check failed. Triggering immediate rollback state.");
      appendLog("Rollback pipeline initiated: Returning servers to stable backup revision.");
    }
  };

  return (
    <div className="bg-zinc-950 border border-zinc-800 rounded-xl p-6 lg:p-8 animate-fadeIn flex flex-col gap-6">
      {/* Header block */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between border-b border-zinc-900 pb-4 gap-4">
        <div>
          <span className="font-mono text-xs text-zinc-500 font-bold uppercase">BUILD & RELEASE MANAGEMENT</span>
          <h2 className="text-lg font-sans font-bold text-white mt-1 flex items-center gap-2">
            Railway-Style Governed Integration Pipeline
          </h2>
          <p className="text-xs text-zinc-400 mt-1">
            Standardizing delivery pipelines with live check logs and automated council gates to protect production channels.
          </p>
        </div>

        <button
          onClick={triggerPipeline}
          disabled={pipelineState === "running" || pipelineState === "voting"}
          className="bg-cyan-500 hover:bg-cyan-400 disabled:opacity-40 disabled:hover:bg-cyan-500 text-black px-4 py-2 font-mono text-xs font-extrabold uppercase rounded-lg shadow-md transition-all flex items-center gap-2 cursor-pointer"
        >
          <GitPullRequest className="h-4 w-4" />
          Trigger Integration Pull Request
        </button>
      </div>

      {/* Pipeline Stage Train line visualization */}
      <div className="relative flex flex-col md:flex-row justify-between items-center gap-4 py-4 overflow-x-auto min-h-[140px] px-2 bg-zinc-900/20 border border-zinc-900 rounded-xl">
        {/* Track Line underneath */}
        <div className="absolute top-[52px] left-6 right-6 h-0.5 bg-zinc-800 hidden md:block z-0" />

        {stages.map((stage, idx) => {
          let stageClass = "bg-zinc-900 border-zinc-800 text-zinc-500";
          if (stage.status === "running") stageClass = "bg-cyan-950 border-cyan-500 text-cyan-400 animate-pulse ring-2 ring-cyan-500/20";
          else if (stage.status === "success") stageClass = "bg-emerald-950/40 border-emerald-500 text-emerald-400";
          else if (stage.status === "failed") stageClass = "bg-red-950/40 border-red-500 text-red-500";

          return (
            <div key={stage.id} className="relative z-10 flex flex-col items-center select-none w-full md:w-auto">
              {/* Outer circle */}
              <div className={`h-10 w-10 rounded-full border-2 flex items-center justify-center font-mono text-xs font-bold transition-all duration-300 ${stageClass}`}>
                {stage.status === "success" ? (
                  <CheckCircle2 className="h-5 w-5 text-emerald-400" />
                ) : stage.status === "failed" ? (
                  <XCircle className="h-5 w-5 text-red-400" />
                ) : (
                  idx + 1
                )}
              </div>

              {/* Title & Badge */}
              <div className="text-center font-mono text-[10px] mt-2 font-bold text-white uppercase tracking-wide">
                {stage.label}
              </div>

              {/* Check list summaries shortened */}
              <div className="text-center font-mono text-[8.5px] text-zinc-500 mt-1 max-w-[120px] hidden md:block leading-tight">
                {stage.status === "running" ? "ACTIVE PROBE" : stage.status === "success" ? "VERIFIED" : "IDLE"}
              </div>
            </div>
          );
        })}
      </div>

      {/* Main split dashboard (Logs Terminal + Council vote ballot panel) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 h-[400px]">
        {/* Railway Log Console */}
        <div className="lg:col-span-7 flex flex-col border border-zinc-800 rounded-xl overflow-hidden bg-zinc-950">
          <div className="p-3 bg-[#09090b] border-b border-zinc-800 flex items-center justify-between">
            <span className="font-mono text-[10px] text-zinc-400 font-bold flex items-center gap-1">
              <Terminal className="h-3.5 w-3.5 text-zinc-500" />
              INTEGRATION LOGGER OUTPUT
            </span>
            <span className="text-[9px] font-mono text-zinc-500 uppercase">Streaming Console</span>
          </div>

          <div className="flex-1 p-4 bg-zinc-950 font-mono text-[11px] text-cyan-400/90 overflow-y-auto space-y-1.5 leading-relaxed">
            {logLines.length === 0 ? (
              <div className="text-zinc-700 flex flex-col justify-center items-center h-full text-center">
                <span>Veklom railway terminal ready. Commit code code limits to initiate.</span>
              </div>
            ) : (
              logLines.map((line, i) => (
                <div key={i} className="font-mono">
                  {line}
                </div>
              ))
            )}
            <div ref={consoleEndRef} />
          </div>
        </div>

        {/* Council Valve Ballot Panel (Stage 6 Gate UI) */}
        <div className="lg:col-span-5 flex flex-col border border-zinc-800 rounded-xl overflow-hidden bg-zinc-950 p-4">
          <div className="border-b border-zinc-900 pb-3 flex items-center justify-between">
            <div className="flex items-center gap-1.5">
              <Vote className="h-4 w-4 text-cyan-400" />
              <h3 className="font-mono text-xs text-white font-bold uppercase">Sovereign Council Gate</h3>
            </div>
            
            {/* Supermajority Check State */}
            <span className={`text-[10px] font-mono border px-2 py-0.5 rounded font-bold uppercase transition-all duration-300 ${
              pipelineState === "voting" 
                ? "bg-amber-950/40 text-amber-500 border-amber-800 animate-pulse" 
                : pipelineState === "approved"
                  ? "bg-emerald-950/40 text-emerald-400 border-emerald-800"
                  : "bg-zinc-900 text-zinc-500 border-zinc-800"
            }`}>
              {pipelineState === "voting" ? "BALLOT CHANNELS OPEN" : pipelineState === "approved" ? "PASSED" : "VOTE IDLE"}
            </span>
          </div>

          {/* If the pipeline is voting, unlock this gorgeous deck */}
          {pipelineState === "voting" ? (
            <div className="flex-1 flex flex-col gap-4 mt-4">
              <div className="p-3 bg-zinc-900/40 border border-zinc-900 rounded-lg text-xs leading-relaxed text-zinc-400">
                A minimum <span className="text-white font-mono font-bold">67% Supermajority (6 out of 10)</span> is required to proceed past the integration gating gate. Fails trigger immediate container rollback.
              </div>

              {/* Delegate grid overview */}
              <div className="grid grid-cols-2 md:grid-cols-3 gap-2 text-[10px] font-mono">
                <div className="bg-zinc-900/80 p-1.5 border border-zinc-800 rounded flex justify-between items-center text-zinc-300">
                  <span>Engineering</span>
                  <span className="text-emerald-400 font-bold uppercase">AYE</span>
                </div>
                <div className="bg-zinc-900/80 p-1.5 border border-zinc-800 rounded flex justify-between items-center text-zinc-300">
                  <span>Growth</span>
                  <span className="text-emerald-400 font-bold uppercase">AYE</span>
                </div>
                <div className="bg-zinc-900/80 p-1.5 border border-zinc-800 rounded flex justify-between items-center text-zinc-400">
                  <span>Operations</span>
                  <span className="text-zinc-500 font-bold uppercase">ABSTAIN</span>
                </div>
                <div className="bg-zinc-900/80 p-1.5 border border-zinc-800 rounded flex justify-between items-center text-zinc-300">
                  <span>Research</span>
                  <span className="text-emerald-400 font-bold uppercase">AYE</span>
                </div>
                <div className="bg-zinc-900/80 p-1.5 border border-zinc-800 rounded flex justify-between items-center text-zinc-300">
                  <span>Revenue</span>
                  <span className="text-emerald-400 font-bold uppercase">AYE</span>
                </div>
                <div className="bg-zinc-900/80 p-1.5 border border-zinc-800 rounded flex justify-between items-center text-zinc-300">
                  <span>Compliance</span>
                  <span className="text-emerald-400 font-bold uppercase">AYE</span>
                </div>
              </div>

              {/* User / Human Vote Block inside Remote Hub */}
              <div className="p-3 bg-zinc-900 border border-zinc-800/80 rounded-xl flex flex-col gap-2">
                <span className="font-mono text-[10px] text-zinc-400 font-bold block uppercase tracking-wider">
                  CAST YOUR BALLOT (HUMAN WORKSPACE DELEGATE)
                </span>
                <div className="flex gap-2 font-mono text-xs">
                  <button
                    type="button"
                    onClick={() => setHumanVote("aye")}
                    className={`flex-1 py-1.5 rounded-lg border font-bold uppercase transition-all cursor-pointer ${
                      humanVote === "aye" 
                        ? "bg-emerald-950/60 text-emerald-400 border-emerald-700" 
                        : "bg-zinc-950 text-zinc-500 border-zinc-900 hover:text-zinc-400"
                    }`}
                  >
                    AYE
                  </button>
                  <button
                    type="button"
                    onClick={() => setHumanVote("nay")}
                    className={`flex-1 py-1.5 rounded-lg border font-bold uppercase transition-all cursor-pointer ${
                      humanVote === "nay" 
                        ? "bg-red-950/60 text-red-500 border-red-700 font-bold" 
                        : "bg-zinc-950 text-zinc-500 border-zinc-900 hover:text-zinc-400"
                    }`}
                  >
                    NAY
                  </button>
                  <button
                    type="button"
                    onClick={() => setHumanVote("abstain")}
                    className={`flex-1 py-1.5 rounded-lg border font-bold uppercase transition-all cursor-pointer ${
                      humanVote === "abstain" 
                        ? "bg-zinc-900 text-zinc-400 border-zinc-800" 
                        : "bg-zinc-950 text-zinc-500 border-zinc-900 hover:text-zinc-400"
                    }`}
                  >
                    ABSTAIN
                  </button>
                </div>
              </div>

              {/* Decision summaries */}
              <div className="grid grid-cols-2 gap-4 pb-2 text-[11px] font-mono border-b border-zinc-900">
                <div className="text-zinc-500">
                  <div>QUORUM ACTIVE:</div>
                  <div className={`font-bold mt-0.5 uppercase ${isQuorumMet ? "text-emerald-400" : "text-red-400"}`}>
                    {totalVotes - abstainCount} / 6 DETECTATE
                  </div>
                </div>
                <div className="text-right text-zinc-500">
                  <div>APPROVAL RATE:</div>
                  <div className={`font-bold mt-0.5 uppercase ${isSupermajorityMet ? "text-emerald-400" : "text-amber-500"}`}>
                    {approvalRate.toFixed(0)}% (67% REQ)
                  </div>
                </div>
              </div>

              {/* Trigger decisions */}
              <div className="flex gap-3 mt-auto">
                <button
                  type="button"
                  onClick={() => handleCouncilDecision(true)}
                  disabled={!isQuorumMet || !isSupermajorityMet}
                  className="flex-1 py-2.5 bg-emerald-500 hover:bg-emerald-400 disabled:opacity-40 text-black rounded-lg font-mono text-xs font-bold uppercase transition-all cursor-pointer"
                >
                  PROMOTE TO PRODUCTION
                </button>
                <button
                  type="button"
                  onClick={() => handleCouncilDecision(false)}
                  className="px-4 py-2.5 bg-zinc-900 hover:bg-red-950 text-zinc-400 hover:text-red-500 border border-zinc-800 hover:border-red-900 rounded-lg font-mono text-xs font-bold uppercase transition-all cursor-pointer"
                >
                  REJECT / ROLLBACK
                </button>
              </div>
            </div>
          ) : (
            <div className="flex-1 flex flex-col justify-center items-center text-center text-zinc-600 font-mono text-xs gap-3">
              <BadgeCheck className="h-10 w-10 text-zinc-800 animate-pulse" />
              <span>Sovereign Council Gate is currently inactive. Run the pipeline simulation to open the ballot channel.</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
