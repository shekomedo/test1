import React, { useState } from "react";
import { Workspace } from "../types";
import { DataGrid } from "./DataGrid";
import { ProfileTab } from "./ProfileTab";
import { AiInsightsTab } from "./AiInsightsTab";
import { CleanBottomSheet } from "./CleanBottomSheet";
import { RecipeBottomSheet } from "./RecipeBottomSheet";
import { ArrowLeft, Database, LayoutTemplate, Sparkles, Wand2, ScrollText, Play, Download, Undo2 } from "lucide-react";
import { cn } from "../lib/utils";

import { exportCsv } from "../lib/dataUtils";

type Tab = "grid" | "profile" | "insights";

export function WorkspaceView({ workspace, onUpdateWorkspace, onClose }: { workspace: Workspace, onUpdateWorkspace: (ws: Workspace) => void, onClose: () => void }) {
  const [activeTab, setActiveTab] = useState<Tab>("profile");
  const [isCleanSheetOpen, setIsCleanSheetOpen] = useState(false);
  const [isRecipeSheetOpen, setIsRecipeSheetOpen] = useState(false);

  const handleExport = () => {
    exportCsv(workspace.data, `cleaned_${workspace.fileName}`);
  };

  const handleUndo = () => {
    const stack = workspace.undoStack || [];
    if (stack.length === 0) return;
    const prev = stack[stack.length - 1];
    onUpdateWorkspace({
      ...workspace,
      data: prev.data,
      profile: prev.profile,
      history: prev.history,
      undoStack: stack.slice(0, -1),
    });
  };

  return (
    <div className="h-full flex flex-col bg-bg overflow-hidden relative text-primary">
      {/* Top App Bar */}
      <header className="h-16 bg-surface border-b border-white/10 flex items-center justify-between px-4 flex-shrink-0 z-20 backdrop-blur-md">
        <div className="flex items-center gap-4">
          <button 
            onClick={onClose}
            className="p-2 hover:bg-white/10 rounded-full transition-colors text-gray-400 hover:text-white border border-transparent hover:border-white/20"
            title="Close Workspace"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <h1 className="font-semibold text-white tracking-wide">{workspace.fileName}</h1>
            <p className="text-xs font-mono tracking-widest text-accent mt-0.5">
              {workspace.profile?.rowCount.toLocaleString()} ROWS <span className="text-gray-600 mx-1">•</span> {workspace.profile?.colCount} COLS
            </p>
          </div>
        </div>
      </header>

      {/* Tab Bar */}
      <div className="bg-bg border-b border-white/5 px-4 flex gap-6 flex-shrink-0 z-10 overflow-x-auto hide-scrollbar">
        <TabButton 
          active={activeTab === "profile"} 
          onClick={() => setActiveTab("profile")} 
          icon={<LayoutTemplate className="w-4 h-4" />}
          label="Profile"
        />
        <TabButton 
          active={activeTab === "grid"} 
          onClick={() => setActiveTab("grid")} 
          icon={<Database className="w-4 h-4" />}
          label="Data Grid"
        />
        <TabButton 
          active={activeTab === "insights"} 
          onClick={() => setActiveTab("insights")} 
          icon={<Sparkles className="w-4 h-4" />}
          label="AI Insights"
        />
      </div>

      {/* Main Content */}
      <main className="flex-1 overflow-hidden relative pb-16 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-accent/5 via-bg to-bg">
        {activeTab === "profile" && workspace.profile && <ProfileTab profile={workspace.profile} />}
        {activeTab === "grid" && <DataGrid workspace={workspace} />}
        {activeTab === "insights" && <AiInsightsTab workspace={workspace} />}
      </main>

      {/* Bottom Action Bar */}
      <div className="absolute bottom-0 inset-x-0 h-16 glass-panel border-t border-accent/20 flex items-center px-4 z-30 rounded-none shadow-[0_-10px_30px_rgba(0,0,0,0.5)] justify-center gap-2 md:gap-4">
        <button 
          onClick={handleUndo}
          disabled={!workspace.undoStack || workspace.undoStack.length === 0}
          className="flex flex-1 md:flex-none items-center justify-center gap-2 px-5 py-2.5 text-gray-300 font-medium hover:bg-white/10 hover:text-white rounded-lg border border-transparent hover:border-white/20 transition-all duration-300 uppercase tracking-wider text-xs disabled:opacity-30 disabled:cursor-not-allowed"
          title={`Undo (${workspace.undoStack?.length || 0} steps available)`}
        >
          <Undo2 className="w-4 h-4" />
          Undo
        </button>
        <div className="w-px h-8 bg-white/10 hidden md:block" />
        <button 
          onClick={() => setIsCleanSheetOpen(true)}
          className="flex flex-1 md:flex-none items-center justify-center gap-2 px-6 py-2.5 bg-accent/10 text-accent font-medium hover:bg-accent hover:text-bg rounded-lg border border-accent/30 hover:border-accent transition-all duration-300 uppercase tracking-wider text-xs shadow-[0_0_15px_rgba(0,229,255,0.1)] hover:shadow-[0_0_20px_rgba(0,229,255,0.4)]"
        >
          <Wand2 className="w-4 h-4" />
          Clean
        </button>
        <div className="w-px h-8 bg-white/10 hidden md:block" />
        <button 
          onClick={() => setIsRecipeSheetOpen(true)}
          className="flex flex-1 md:flex-none items-center justify-center gap-2 px-6 py-2.5 text-gray-300 font-medium hover:bg-white/10 hover:text-white rounded-lg border border-transparent hover:border-white/20 transition-all duration-300 uppercase tracking-wider text-xs"
        >
          <ScrollText className="w-4 h-4" />
          Recipe
        </button>
        <div className="w-px h-8 bg-white/10 hidden md:block" />
        <button 
          onClick={handleExport}
          className="flex flex-1 md:flex-none items-center justify-center gap-2 px-6 py-2.5 text-gray-300 font-medium hover:bg-white/10 hover:text-white rounded-lg border border-transparent hover:border-white/20 transition-all duration-300 uppercase tracking-wider text-xs"
        >
          <Download className="w-4 h-4" />
          Export
        </button>
      </div>

      {/* Clean Bottom Sheet Overlay */}
      {isCleanSheetOpen && (
        <div className="absolute inset-0 z-40 bg-black/60 backdrop-blur-sm transition-all flex items-end">
          <CleanBottomSheet 
            workspace={workspace}
            onUpdateWorkspace={onUpdateWorkspace}
            onClose={() => setIsCleanSheetOpen(false)}
          />
        </div>
      )}

      {/* Recipe Bottom Sheet Overlay */}
      {isRecipeSheetOpen && (
        <div className="absolute inset-0 z-40 bg-black/60 backdrop-blur-sm transition-all flex items-end">
          <RecipeBottomSheet 
            workspace={workspace}
            onClose={() => setIsRecipeSheetOpen(false)}
          />
        </div>
      )}
    </div>
  );
}

function TabButton({ active, onClick, icon, label }: { active: boolean, onClick: () => void, icon: React.ReactNode, label: string }) {
  return (
    <button
      onClick={onClick}
      className={cn(
        "flex items-center gap-2 py-4 px-2 border-b-2 font-medium text-xs tracking-widest uppercase transition-all duration-300",
        active 
          ? "border-accent text-accent shadow-[0_2px_10px_rgba(0,229,255,0.2)]" 
          : "border-transparent text-gray-500 hover:text-gray-300 hover:border-gray-600"
      )}
    >
      {icon}
      {label}
    </button>
  );
}
