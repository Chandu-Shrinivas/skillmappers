import { useState, useCallback, useMemo } from "react";
import Editor from "@monaco-editor/react";
import { Play, Loader2, Sparkles, ChevronDown, Terminal, RotateCcw, Search, Menu, X, Code2, Gamepad2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { ScrollArea } from "@/components/ui/scroll-area";
import { dsaTopics, languages, defaultCode } from "@/data/aptitudeData";
import axios from "axios";
import { toast } from "sonner";

const API = `${process.env.REACT_APP_BACKEND_URL}/api`;

export default function CodingPage() {
  const [selectedLang, setSelectedLang] = useState(languages[0]);
  const [code, setCode] = useState(defaultCode[languages[0].id]);
  const [stdin, setStdin] = useState("");
  const [output, setOutput] = useState("");
  const [evaluation, setEvaluation] = useState(null);
  const [running, setRunning] = useState(false);
  const [evaluating, setEvaluating] = useState(false);
  const [showLangMenu, setShowLangMenu] = useState(false);

  // DSA Topics
  const [selectedTopicId, setSelectedTopicId] = useState(dsaTopics[0].id);
  const [selectedQuestionId, setSelectedQuestionId] = useState(dsaTopics[0].questions[0].id);
  const [showSidebar, setShowSidebar] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");

  // Playground Mode
  const [playgroundMode, setPlaygroundMode] = useState(false);

  const selectedQuestion = useMemo(() => {
    for (const t of dsaTopics) {
      const q = t.questions.find(q => q.id === selectedQuestionId);
      if (q) return q;
    }
    return dsaTopics[0].questions[0];
  }, [selectedQuestionId]);

  const filteredTopics = useMemo(() => {
    if (!searchTerm) return dsaTopics;
    const lower = searchTerm.toLowerCase();
    return dsaTopics.filter(t =>
      t.title.toLowerCase().includes(lower) ||
      t.questions.some(q => q.title.toLowerCase().includes(lower))
    );
  }, [searchTerm]);

  const handleLangChange = useCallback((lang) => {
    setSelectedLang(lang);
    setCode(defaultCode[lang.id] || "");
    setShowLangMenu(false);
  }, []);

  const selectQuestion = (topicId, questionId) => {
    setSelectedTopicId(topicId);
    setSelectedQuestionId(questionId);
    setOutput("");
    setEvaluation(null);
    setPlaygroundMode(false);
  };

  const difficultyColor = (d) => {
    if (d === "Easy") return "text-[#00FF94]";
    if (d === "Medium") return "text-[#FFD600]";
    return "text-[#FF003C]";
  };

  const runCode = async () => {
    setRunning(true);
    setOutput("");
    try {
      const res = await axios.post(`${API}/code/execute`, {
        source_code: code,
        language_id: selectedLang.id,
        stdin,
      });
      const result = res.data.result;
      let parsed = null;
      if (typeof result === "string") {
        try {
          let cleaned = result;
          const jsonBlockMatch = cleaned.match(/```(?:json)?\s*\n?([\s\S]*?)\n?```/);
          if (jsonBlockMatch) cleaned = jsonBlockMatch[1];
          const jsonMatch = cleaned.match(/\{[\s\S]*\}/);
          if (jsonMatch) cleaned = jsonMatch[0];
          parsed = JSON.parse(cleaned.trim());
        } catch { parsed = null; }
      } else {
        parsed = result;
      }

      if (parsed && typeof parsed === "object") {
        const lines = [];
        lines.push("Running Code...");
        if (stdin.trim()) lines.push(`Input:\n${stdin.trim()}`);
        if (parsed.stdout) lines.push(`Output:\n${parsed.stdout.trim()}`);
        if (parsed.stderr && parsed.stderr.trim()) lines.push(`Error: ${parsed.stderr.trim()}`);
        if (parsed.time) lines.push(`Execution Time: ${parsed.time}s`);
        const status = parsed.status?.description || "Accepted";
        lines.push(`Status: ${status === "Accepted" ? "Success" : status}`);
        setOutput(lines.join("\n"));
      } else if (typeof result === "string") {
        // Fallback if parsing completely fails
        let cleanedStr = result.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
        const lines = ["Running Code..."];
        if (stdin.trim()) lines.push(`Input:\n${stdin.trim()}`);
        lines.push(`Output:\n${cleanedStr}`);
        lines.push("Status: Success");
        setOutput(lines.join("\n"));
      } else {
        setOutput("Running Code...\nOutput: No output\nStatus: Success");
      }
      if (res.data.simulated) {
        toast.info("Code simulated by AI (no Judge0 key)");
      }
    } catch (e) {
      setOutput(`Running Code...\nError: ${e.response?.data?.detail || e.message}\nStatus: Error`);
    }
    setRunning(false);
  };

  const evaluateCode = async () => {
    setEvaluating(true);
    setEvaluation(null);
    try {
      const res = await axios.post(`${API}/code/evaluate`, {
        code,
        language: selectedLang.name,
        problem_statement: playgroundMode ? "General code evaluation - Playground mode" : selectedQuestion.statement,
        expected_behavior: playgroundMode ? "Evaluate code quality" : `Expected output: ${selectedQuestion.sampleOutput}`,
      });
      const evalText = res.data.evaluation;
      if (typeof evalText === "string") {
        try {
          let cleaned = evalText;
          const jsonBlockMatch = cleaned.match(/```(?:json)?\s*\n?([\s\S]*?)\n?```/);
          if (jsonBlockMatch) cleaned = jsonBlockMatch[1];
          const jsonMatch = cleaned.match(/\{[\s\S]*\}/);
          if (jsonMatch) cleaned = jsonMatch[0];
          setEvaluation(JSON.parse(cleaned.trim()));
        } catch {
          setEvaluation({ raw: evalText.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim() });
        }
      } else {
        setEvaluation(evalText);
      }
      await axios.post(`${API}/progress/update`, { action: "code_submit", xp_earned: 25 });
      toast.success("+25 XP earned!");
    } catch (e) {
      setEvaluation({ raw: "Error: " + (e.response?.data?.detail || e.message) });
    }
    setEvaluating(false);
  };

  return (
    <div data-testid="coding-page" className="h-[calc(100vh-80px)] flex overflow-hidden">
      {/* DSA Topics Sidebar */}
      {showSidebar && !playgroundMode && (
        <div className="w-64 flex-shrink-0 border-r border-white/5 bg-[#080808] flex flex-col">
          <div className="p-3 border-b border-white/5">
            <div className="flex items-center gap-2 mb-2">
              <h3 className="text-xs font-bold uppercase tracking-wider text-zinc-400" style={{ fontFamily: 'Outfit' }}>DSA Topics</h3>
              <button onClick={() => setShowSidebar(false)} className="ml-auto p-1 text-zinc-600 hover:text-white" data-testid="close-sidebar">
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
            <div className="relative">
              <Search className="w-3 h-3 absolute left-2.5 top-1/2 -translate-y-1/2 text-zinc-600" />
              <input
                data-testid="dsa-search"
                type="text"
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
                placeholder="Search..."
                className="w-full bg-black/50 border border-white/10 rounded-lg pl-8 pr-3 py-1.5 text-[11px] text-zinc-300 placeholder:text-zinc-600 outline-none focus:border-[#00F0FF]/50"
              />
            </div>
          </div>
          <ScrollArea className="flex-1">
            <div className="p-1.5">
              {filteredTopics.map(topic => (
                <div key={topic.id} className="mb-0.5">
                  <button
                    data-testid={`dsa-topic-${topic.id}`}
                    onClick={() => setSelectedTopicId(topic.id)}
                    className={`w-full text-left px-2.5 py-1.5 rounded-lg text-[10px] font-semibold uppercase tracking-wider transition-colors ${selectedTopicId === topic.id ? "text-[#00F0FF] bg-[#00F0FF]/8" : "text-zinc-500 hover:text-zinc-300 hover:bg-white/3"
                      }`}
                  >
                    {topic.title} ({topic.questions.length})
                  </button>
                  {selectedTopicId === topic.id && (
                    <div className="ml-1.5 mt-0.5 space-y-0.5">
                      {topic.questions.map(q => (
                        <button
                          key={q.id}
                          data-testid={`dsa-q-${q.id}`}
                          onClick={() => selectQuestion(topic.id, q.id)}
                          className={`dsa-topic-item w-full text-left px-2.5 py-1 rounded text-[11px] flex items-center gap-1.5 ${selectedQuestionId === q.id ? "active text-white bg-[#00F0FF]/10" : "text-zinc-400 hover:text-zinc-200"
                            }`}
                        >
                          <span className={`text-[9px] font-accent font-bold ${difficultyColor(q.difficulty)}`}>{q.difficulty[0]}</span>
                          <span className="truncate">{q.title}</span>
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </ScrollArea>
          {/* Playground toggle at bottom */}
          <div className="p-2 border-t border-white/5">
            <button
              data-testid="playground-mode-btn"
              onClick={() => { setPlaygroundMode(true); setOutput(""); setEvaluation(null); }}
              className="w-full flex items-center justify-center gap-2 px-3 py-2 rounded-lg bg-[#7000FF]/10 border border-[#7000FF]/30 text-[#7000FF] text-xs font-semibold hover:bg-[#7000FF]/20 transition-colors"
            >
              <Gamepad2 className="w-3.5 h-3.5" />
              Playground Mode
            </button>
          </div>
        </div>
      )}

      {/* Main Area: Split LEFT (question) | RIGHT (compiler + terminal) */}
      <div className="flex-1 flex overflow-hidden">
        {/* LEFT: Question Panel (hidden in playground mode) */}
        {!playgroundMode && (
          <div className="w-[380px] flex-shrink-0 border-r border-white/5 bg-[#080808] flex flex-col">
            <div className="px-4 py-3 border-b border-white/5 flex items-center gap-2">
              {!showSidebar && (
                <button onClick={() => setShowSidebar(true)} className="p-1 text-zinc-500 hover:text-white rounded" data-testid="toggle-sidebar">
                  <Menu className="w-4 h-4" />
                </button>
              )}
              <Code2 className="w-4 h-4 text-[#00F0FF]" />
              <h3 className="text-xs font-bold uppercase tracking-wider text-zinc-400">Problem</h3>
            </div>
            <ScrollArea className="flex-1">
              <div className="p-4">
                <div className="flex items-center gap-2 mb-3">
                  <h3 className="text-base font-bold" style={{ fontFamily: 'Outfit' }}>{selectedQuestion.title}</h3>
                  <span className={`text-[10px] font-accent font-bold px-2 py-0.5 rounded-full border ${selectedQuestion.difficulty === "Easy" ? "border-[#00FF94]/30 text-[#00FF94]" :
                      selectedQuestion.difficulty === "Medium" ? "border-[#FFD600]/30 text-[#FFD600]" :
                        "border-[#FF003C]/30 text-[#FF003C]"
                    }`}>{selectedQuestion.difficulty}</span>
                </div>
                <p className="text-xs text-zinc-300 mb-4 leading-relaxed">{selectedQuestion.statement}</p>

                <div className="space-y-3 text-xs">
                  <div>
                    <p className="text-zinc-500 font-semibold mb-1 uppercase tracking-wider text-[10px]">Input Format</p>
                    <pre className="text-zinc-400 whitespace-pre-wrap font-mono text-[11px] bg-black/30 p-2 rounded-lg">{selectedQuestion.inputFormat}</pre>
                  </div>
                  <div>
                    <p className="text-zinc-500 font-semibold mb-1 uppercase tracking-wider text-[10px]">Output Format</p>
                    <pre className="text-zinc-400 whitespace-pre-wrap font-mono text-[11px] bg-black/30 p-2 rounded-lg">{selectedQuestion.outputFormat}</pre>
                  </div>
                  {selectedQuestion.constraints && (
                    <div>
                      <p className="text-zinc-500 font-semibold mb-1 uppercase tracking-wider text-[10px]">Constraints</p>
                      <pre className="text-zinc-400 whitespace-pre-wrap font-mono text-[11px] bg-black/30 p-2 rounded-lg">{selectedQuestion.constraints}</pre>
                    </div>
                  )}
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <p className="text-zinc-500 font-semibold mb-1 uppercase tracking-wider text-[10px]">Sample Input</p>
                      <pre className="text-[#00F0FF] font-mono text-[11px] bg-[#00F0FF]/5 p-2 rounded-lg border border-[#00F0FF]/10">{selectedQuestion.sampleInput}</pre>
                    </div>
                    <div>
                      <p className="text-zinc-500 font-semibold mb-1 uppercase tracking-wider text-[10px]">Sample Output</p>
                      <pre className="text-[#00FF94] font-mono text-[11px] bg-[#00FF94]/5 p-2 rounded-lg border border-[#00FF94]/10">{selectedQuestion.sampleOutput}</pre>
                    </div>
                  </div>
                  {selectedQuestion.explanation && (
                    <div className="p-3 rounded-lg bg-[#FFD600]/5 border border-[#FFD600]/10">
                      <p className="text-[10px] text-[#FFD600] font-semibold uppercase tracking-wider mb-1">Explanation</p>
                      <p className="text-[11px] text-zinc-400 leading-relaxed">{selectedQuestion.explanation}</p>
                    </div>
                  )}
                </div>
              </div>
            </ScrollArea>
          </div>
        )}

        {/* RIGHT: Compiler + Terminal below */}
        <div className="flex-1 flex flex-col">
          {/* Toolbar */}
          <div className="flex items-center justify-between px-3 py-2 border-b border-white/5 bg-[#0A0A0A]">
            <div className="flex items-center gap-2">
              {playgroundMode && (
                <button
                  data-testid="exit-playground-btn"
                  onClick={() => setPlaygroundMode(false)}
                  className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-[#7000FF]/10 border border-[#7000FF]/30 text-[#7000FF] text-[10px] font-semibold hover:bg-[#7000FF]/20 transition-colors"
                >
                  <X className="w-3 h-3" /> Exit Playground
                </button>
              )}
              {playgroundMode && !showSidebar && (
                <button onClick={() => { setShowSidebar(true); setPlaygroundMode(false); }} className="p-1.5 text-zinc-500 hover:text-white rounded">
                  <Menu className="w-4 h-4" />
                </button>
              )}
              <div className="relative">
                <button
                  data-testid="language-selector"
                  onClick={() => setShowLangMenu(!showLangMenu)}
                  className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-zinc-800/60 border border-white/10 text-xs font-medium hover:border-white/20 transition-colors"
                >
                  {selectedLang.label}
                  <ChevronDown className="w-3 h-3 text-zinc-400" />
                </button>
                {showLangMenu && (
                  <div className="absolute top-full left-0 mt-1 w-40 bg-[#0A0A0A] border border-white/10 rounded-lg overflow-hidden z-20 shadow-xl">
                    {languages.map(lang => (
                      <button
                        key={lang.id}
                        data-testid={`lang-${lang.name.toLowerCase()}`}
                        onClick={() => handleLangChange(lang)}
                        className={`w-full text-left px-4 py-2 text-xs hover:bg-white/5 transition-colors ${selectedLang.id === lang.id ? "text-[#00F0FF]" : "text-zinc-300"
                          }`}
                      >
                        {lang.label}
                      </button>
                    ))}
                  </div>
                )}
              </div>
              <button
                data-testid="reset-code-btn"
                onClick={() => setCode(defaultCode[selectedLang.id] || "")}
                className="p-1.5 rounded-lg text-zinc-500 hover:text-white hover:bg-white/5 transition-colors"
              >
                <RotateCcw className="w-3.5 h-3.5" />
              </button>
              {playgroundMode && (
                <span className="text-[10px] text-[#7000FF] font-accent font-semibold flex items-center gap-1">
                  <Gamepad2 className="w-3 h-3" /> PLAYGROUND
                </span>
              )}
            </div>
            <div className="flex items-center gap-2">
              <Button data-testid="run-code-btn" onClick={runCode} disabled={running} size="sm"
                className="bg-[#00FF94] text-black font-bold text-[10px] uppercase tracking-wider hover:bg-[#00FF94]/90 hover:shadow-[0_0_15px_rgba(0,255,148,0.3)] disabled:opacity-50 h-7 px-3">
                {running ? <Loader2 className="w-3.5 h-3.5 animate-spin mr-1" /> : <Play className="w-3.5 h-3.5 mr-1" />} Run
              </Button>
              <Button data-testid="ai-evaluate-btn" onClick={evaluateCode} disabled={evaluating} size="sm"
                className="bg-[#00F0FF] text-black font-bold text-[10px] uppercase tracking-wider hover:bg-[#00F0FF]/90 hover:shadow-[0_0_15px_rgba(0,240,255,0.3)] disabled:opacity-50 h-7 px-3">
                {evaluating ? <Loader2 className="w-3.5 h-3.5 animate-spin mr-1" /> : <Sparkles className="w-3.5 h-3.5 mr-1" />} Evaluate
              </Button>
            </div>
          </div>

          {/* Editor */}
          <div className="flex-1 min-h-0">
            <Editor
              height="100%"
              language={selectedLang.monacoId}
              value={code}
              onChange={v => setCode(v || "")}
              theme="vs-dark"
              options={{
                fontSize: 13,
                fontFamily: "'JetBrains Mono', monospace",
                minimap: { enabled: false },
                scrollBeyondLastLine: false,
                padding: { top: 12 },
                lineNumbers: "on",
                renderLineHighlight: "all",
                bracketPairColorization: { enabled: true },
              }}
            />
          </div>

          {/* Input (stdin) */}
          <div className="border-t border-white/5 bg-[#0A0A0A] px-3 py-2">
            <p className="text-[10px] text-zinc-600 mb-1 uppercase tracking-wider font-semibold">Input (stdin)</p>
            <Textarea
              data-testid="stdin-input"
              value={stdin}
              onChange={e => setStdin(e.target.value)}
              placeholder="Enter input..."
              className="h-12 bg-black/50 border-white/10 text-xs font-mono resize-none"
            />
          </div>

          {/* BELOW COMPILER: Terminal Output + AI Evaluation */}
          <div className="border-t border-white/5 bg-[#080808] max-h-[280px] flex flex-col">
            {/* Tabs */}
            <div className="flex border-b border-white/5 flex-shrink-0">
              <button data-testid="tab-output" onClick={() => { }}
                className="px-4 py-2 text-xs font-medium text-[#00FF94] border-b-2 border-[#00FF94] flex items-center gap-1.5">
                <Terminal className="w-3.5 h-3.5" /> Terminal
              </button>
              {evaluation && (
                <button data-testid="tab-evaluation" className="px-4 py-2 text-xs font-medium text-[#00F0FF] flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5" /> AI Evaluation
                </button>
              )}
            </div>
            <ScrollArea className="flex-1">
              <div className="p-3">
                {/* Terminal Output */}
                <div data-testid="code-output">
                  {running ? (
                    <div className="flex items-center gap-2 text-zinc-400">
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span className="text-xs font-mono">Compiling & Executing...</span>
                    </div>
                  ) : output ? (
                    <div className="terminal-output">
                      <div className="terminal-header">
                        <span className="terminal-dot bg-[#FF003C]" />
                        <span className="terminal-dot bg-[#FFD600]" />
                        <span className="terminal-dot bg-[#00FF94]" />
                        <span className="text-[10px] text-zinc-600 ml-2 font-mono">elevate-terminal</span>
                      </div>
                      {output.split("\n").map((line, i) => (
                        <div key={i} className="terminal-line">
                          <span className={
                            line.startsWith("Error:") || line.startsWith("STDERR:") ? "error-text" :
                              line.startsWith("Status: Success") ? "success-text" :
                                line.startsWith("Status:") ? "error-text" :
                                  line.startsWith("Output:") ? "info-text" :
                                    line.startsWith("Running") ? "success-text" :
                                      "output-text"
                          }>
                            {line}
                          </span>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-xs text-zinc-500 font-mono">Run your code to see terminal output</p>
                  )}
                </div>

                {/* AI Evaluation (shown below terminal when available) */}
                {evaluation && (
                  <div className="mt-4 pt-4 border-t border-white/5" data-testid="code-evaluation">
                    {evaluating ? (
                      <div className="flex items-center gap-2 text-zinc-400">
                        <Loader2 className="w-4 h-4 animate-spin" />
                        <span className="text-xs">Analyzing...</span>
                      </div>
                    ) : evaluation.raw ? (
                      <pre className="text-xs text-zinc-300 whitespace-pre-wrap">{evaluation.raw}</pre>
                    ) : (
                      <EvalDisplay data={evaluation} />
                    )}
                  </div>
                )}
                {evaluating && !evaluation && (
                  <div className="mt-4 pt-4 border-t border-white/5 flex items-center gap-2 text-zinc-400">
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span className="text-xs">Analyzing your code...</span>
                  </div>
                )}
              </div>
            </ScrollArea>
          </div>
        </div>
      </div>
    </div>
  );
}

function EvalDisplay({ data }) {
  const scores = data.scores || {};
  return (
    <div className="space-y-3">
      {scores && Object.keys(scores).length > 0 && (
        <div>
          <h4 className="text-[10px] uppercase tracking-wider text-zinc-600 mb-2 font-semibold">Scores</h4>
          <div className="flex gap-3">
            <ScoreBox label="Logic" score={scores.logic} color="#00F0FF" />
            <ScoreBox label="Optimize" score={scores.optimization} color="#7000FF" />
            <ScoreBox label="Quality" score={scores.code_quality} color="#00FF94" />
          </div>
        </div>
      )}
      {data.correctness && <Section title="Correctness" content={data.correctness} />}
      {data.time_complexity && <Section title="Time Complexity" content={data.time_complexity} />}
      {data.space_complexity && <Section title="Space Complexity" content={data.space_complexity} />}
      {data.edge_cases?.length > 0 && (
        <div>
          <h4 className="text-[10px] uppercase tracking-wider text-zinc-600 mb-1 font-semibold">Edge Cases</h4>
          <ul className="space-y-0.5">
            {data.edge_cases.map((e, i) => <li key={i} className="text-xs text-zinc-300">! {e}</li>)}
          </ul>
        </div>
      )}
      {data.improvements?.length > 0 && (
        <div>
          <h4 className="text-[10px] uppercase tracking-wider text-zinc-600 mb-1 font-semibold">Optimization Suggestions</h4>
          <ul className="space-y-0.5">
            {data.improvements.map((imp, i) => <li key={i} className="text-xs text-zinc-300">+ {imp}</li>)}
          </ul>
        </div>
      )}
      {data.roadmap && <Section title="Improvement Roadmap" content={data.roadmap} />}
    </div>
  );
}

function ScoreBox({ label, score, color }) {
  return (
    <div className="text-center px-4 py-2 rounded-xl bg-black/40 border border-white/5">
      <p className="font-accent text-lg font-bold" style={{ color }}>{score ?? "-"}</p>
      <p className="text-[9px] text-zinc-600">/10</p>
      <p className="text-[10px] text-zinc-500">{label}</p>
    </div>
  );
}

function Section({ title, content }) {
  return (
    <div>
      <h4 className="text-[10px] uppercase tracking-wider text-zinc-600 mb-0.5 font-semibold">{title}</h4>
      <p className="text-xs text-zinc-300 leading-relaxed">{content}</p>
    </div>
  );
}
