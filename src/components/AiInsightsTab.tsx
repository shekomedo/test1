import React, { useState } from "react";
import { Profile, Workspace } from "../types";
import { Sparkles, Loader2, Copy, Check, AlertCircle } from "lucide-react";
import Markdown from "react-markdown";

export function AiInsightsTab({ workspace }: { workspace: Workspace }) {
  const [insight, setInsight] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  const generateInsights = async () => {
    if (!workspace.profile) return;
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/smart-insights", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          profile: workspace.profile,
          sampleData: workspace.data.slice(0, 50)
        })
      });
      const data = await res.json();
      if (data.error) throw new Error(data.error);
      setInsight(data.summary);
    } catch (err: any) {
      setError(err.message || "Failed to generate insights.");
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = () => {
    if (insight) {
      navigator.clipboard.writeText(insight);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div className="p-6 h-full overflow-y-auto bg-transparent flex flex-col items-center">
      <div className="max-w-3xl w-full mt-4">
        <div className="text-center mb-10">
          <div className="inline-flex items-center justify-center p-4 rounded-full bg-accent/10 border border-accent/20 mb-6 shadow-[0_0_20px_rgba(0,229,255,0.15)]">
            <Sparkles className="w-10 h-10 text-accent" />
          </div>
          <h2 className="text-3xl font-bold text-primary mb-3 tracking-wider uppercase drop-shadow-sm">Smart Insights</h2>
          <p className="text-gray-400 font-light tracking-wide">
            Holographic analysis powered by advanced AI models. Generate executive summaries instantly.
          </p>
        </div>

        {!insight && !loading && (
          <div className="flex justify-center">
            <button 
              onClick={generateInsights}
              className="bg-gradient-to-r from-accent to-accent2 hover:shadow-[0_0_25px_rgba(0,229,255,0.4)] text-white font-medium py-3 px-8 rounded-xl transition-all shadow-lg flex items-center gap-3 uppercase tracking-wider text-sm hover:scale-105"
            >
              <Sparkles className="w-5 h-5" />
              Initialize Analysis
            </button>
          </div>
        )}

        {loading && (
          <div className="flex flex-col items-center justify-center py-16 glass-panel rounded-2xl">
            <div className="relative w-16 h-16 flex items-center justify-center mb-6">
              <div className="absolute inset-0 rounded-full border-2 border-accent/20 border-t-accent animate-spin" style={{ animationDuration: '1.5s'}}></div>
              <div className="absolute inset-2 rounded-full border-2 border-success/20 border-b-success animate-spin" style={{ animationDuration: '2s', animationDirection: 'reverse'}}></div>
              <Loader2 className="w-6 h-6 text-accent animate-spin" />
            </div>
            <p className="text-accent font-mono text-sm uppercase tracking-widest animate-pulse">Processing Dataset Patterns...</p>
          </div>
        )}

        {error && (
          <div className="bg-red-950/40 border border-error/50 text-red-200 p-5 rounded-xl mb-6 flex items-start gap-3 backdrop-blur-md shadow-lg">
             <div className="mt-0.5"><AlertCircle className="w-5 h-5 text-error"/></div>
             <div>
                <h4 className="font-semibold text-error mb-1 uppercase tracking-wide text-sm">Analysis Failed</h4>
                <p className="text-sm opacity-90">{error}</p>
             </div>
          </div>
        )}

        {insight && !loading && (
          <div className="glass-panel p-8 rounded-2xl relative shadow-[0_0_40px_rgba(0,0,0,0.5)] border border-accent/20">
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-success to-transparent rounded-t-2xl"></div>
            
            <button 
              onClick={copyToClipboard}
              className="absolute top-6 right-6 p-2.5 text-gray-400 hover:text-accent hover:bg-accent/10 transition-all rounded-lg border border-transparent hover:border-accent/20"
              title="Copy to clipboard"
            >
              {copied ? <Check className="w-5 h-5 text-success" /> : <Copy className="w-5 h-5" />}
            </button>
            
            <div className="prose prose-invert prose-blue max-w-none text-gray-200 font-light leading-relaxed prose-headings:text-white prose-headings:font-semibold prose-headings:tracking-wide prose-a:text-accent prose-strong:text-white prose-strong:font-medium">
              <Markdown>{insight}</Markdown>
            </div>
            
            <div className="mt-10 flex justify-center border-t border-white/10 pt-6">
              <button 
                onClick={generateInsights}
                className="text-gray-400 hover:text-accent font-mono transition-colors flex items-center gap-2 text-xs uppercase tracking-widest border border-white/5 bg-white/5 hover:bg-accent/10 px-4 py-2 rounded-lg"
              >
                <Sparkles className="w-3 h-3" />
                Recalculate Insight
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
