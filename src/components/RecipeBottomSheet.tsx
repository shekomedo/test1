import React from "react";
import { Workspace } from "../types";
import { X, History, CheckCircle2 } from "lucide-react";

export function RecipeBottomSheet({ workspace, onClose }: { workspace: Workspace, onClose: () => void }) {
  return (
    <div className="w-full bg-surface border-t border-accent/30 shadow-[0_-20px_50px_rgba(0,0,0,0.5)] rounded-t-3xl z-50 transform transition-transform duration-300 flex flex-col max-h-[70vh] backdrop-blur-xl">
      <div className="w-12 h-1 bg-white/20 rounded-full mx-auto mt-3 mb-1"></div>
      
      <div className="p-5 border-b border-white/5 flex justify-between items-center">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-accent/10 text-accent rounded-lg border border-accent/20">
            <History className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-bold text-lg text-white tracking-wide uppercase">Transformation Recipe</h3>
            <p className="text-xs text-accent font-mono tracking-widest">History of operations</p>
          </div>
        </div>
        <button onClick={onClose} className="p-2 hover:bg-white/10 rounded-full text-gray-400 hover:text-white transition-colors">
          <X className="w-5 h-5" />
        </button>
      </div>

      <div className="p-6 overflow-y-auto custom-scrollbar">
        {(!workspace.history || workspace.history.length === 0) ? (
          <div className="text-center py-10 text-gray-500 font-mono tracking-widest uppercase text-sm">
            No operations recorded yet.
          </div>
        ) : (
          <div className="space-y-4">
            {workspace.history.map((step, i) => (
              <div key={i} className="flex items-start gap-4 p-4 rounded-xl border border-white/5 bg-white/5">
                <div className="mt-0.5">
                  <CheckCircle2 className="w-5 h-5 text-success drop-shadow-[0_0_5px_rgba(50,205,50,0.5)]" />
                </div>
                <div>
                  <div className="text-[10px] text-gray-500 font-mono uppercase tracking-widest mb-1">Step {i + 1}</div>
                  <p className="text-gray-200 text-sm">{step}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
