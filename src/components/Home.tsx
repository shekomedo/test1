import React, { useRef, useState } from "react";
import { UploadCloud, FileSpreadsheet, Loader2, Sparkles, Shield, Activity, RefreshCw } from "lucide-react";
import { parseCsv, profileData } from "../lib/dataUtils";
import { Workspace } from "../types";

export function Home({ onWorkspaceCreated }: { onWorkspaceCreated: (ws: Workspace) => void }) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file size (max 50 MB)
    const MAX_FILE_SIZE = 50 * 1024 * 1024;
    if (file.size > MAX_FILE_SIZE) {
      setError(`File too large (${(file.size / 1024 / 1024).toFixed(1)} MB). Maximum allowed size is 50 MB.`);
      if (fileInputRef.current) fileInputRef.current.value = "";
      return;
    }

    // Validate file extension
    const validExtensions = [".csv", ".txt", ".tsv"];
    const ext = file.name.substring(file.name.lastIndexOf(".")).toLowerCase();
    if (!validExtensions.includes(ext)) {
      setError("Invalid file type. Please upload a CSV, TSV, or TXT file.");
      if (fileInputRef.current) fileInputRef.current.value = "";
      return;
    }

    setLoading(true);
    setError(null);
    try {
      const data = await parseCsv(file);

      // Validate row count (max 500,000 rows)
      const MAX_ROWS = 500_000;
      if (data.length > MAX_ROWS) {
        setError(`Dataset too large (${data.length.toLocaleString()} rows). Maximum allowed is ${MAX_ROWS.toLocaleString()} rows.`);
        setLoading(false);
        if (fileInputRef.current) fileInputRef.current.value = "";
        return;
      }

      if (data.length === 0) {
        setError("The file appears to be empty or has no valid rows.");
        setLoading(false);
        if (fileInputRef.current) fileInputRef.current.value = "";
        return;
      }

      const profile = profileData(data);
      
      const ws: Workspace = {
        id: crypto.randomUUID(),
        fileName: file.name,
        data,
        profile,
        history: ["Imported file " + file.name],
        undoStack: [],
      };
      
      onWorkspaceCreated(ws);
    } catch (err: any) {
      setError("Failed to parse file. Make sure it's a valid CSV.");
    } finally {
      setLoading(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  return (
    <div className="h-full flex flex-col items-center justify-center p-6 bg-bg relative overflow-hidden text-primary">
      {/* Decorative background elements */}
      <div className="absolute top-[0%] left-[-10%] w-[50%] h-[50%] bg-accent opacity-10 blur-[150px] rounded-full pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-accent2 opacity-15 blur-[150px] rounded-full pointer-events-none" />

      <div className="max-w-5xl w-full z-10 grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
        <div className="text-left space-y-6">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-accent/10 border border-accent/20 text-accent text-xs font-medium tracking-wider uppercase mb-2">
            <Sparkles className="w-3 h-3" />
            The Future of Data
          </div>
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight leading-tight uppercase">
            Data <span className="text-accent">Forge</span> <br/>
            <span className="text-success text-5xl lg:text-7xl drop-shadow-[0_0_10px_rgba(50,205,50,0.5)]">AI</span>
          </h1>
          <p className="text-base md:text-lg text-gray-400 mb-8 font-light max-w-lg">
            Cleaner Data <span className="text-accent px-2">•</span> Smarter Decisions <span className="text-accent px-2">•</span> Greater Impact
            <br/><br/>
            Upload your messy datasets and let our AI engine repair, optimize, and analyze in seconds.
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <FeatureItem icon={<Sparkles />} title="AI Data Cleaning" desc="Remove errors & noise automatically" color="text-accent" />
            <FeatureItem icon={<Activity />} title="Smart Analysis" desc="Deep insights generated in seconds" color="text-success" />
            <FeatureItem icon={<RefreshCw />} title="Data Optimization" desc="Higher quality, better results" color="text-accent" />
            <FeatureItem icon={<Shield />} title="Secure & Private" desc="Your data is 100% safe locally" color="text-success" />
          </div>
        </div>

        <div className="glass-panel p-8 md:p-12 rounded-3xl transition-transform hover:scale-[1.01] duration-300 flex flex-col items-center text-center relative overflow-hidden">
          <div className="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-transparent via-accent to-transparent"></div>
          
          {error && (
            <div className="mb-6 p-4 bg-error/20 text-red-200 rounded-xl border border-error/50 text-sm w-full backdrop-blur-md">
              {error}
            </div>
          )}

          {loading ? (
            <div className="flex flex-col items-center justify-center py-12">
              <Loader2 className="w-12 h-12 text-accent animate-spin mb-4" />
              <p className="text-primary font-medium text-lg tracking-wider uppercase">Initializing AI Engine...</p>
              <div className="w-full max-w-xs h-2 bg-gray-900 rounded-full mt-6 border border-accent/20 overflow-hidden p-[1px]">
                <div className="h-full bg-gradient-to-r from-accent to-success animate-pulse w-full rounded-full"></div>
              </div>
            </div>
          ) : (
            <div 
              className="flex flex-col items-center justify-center border-2 border-dashed border-accent/40 bg-accent/5 rounded-2xl p-10 cursor-pointer hover:bg-accent/10 hover:border-accent transition-all duration-300 group w-full"
              onClick={() => fileInputRef.current?.click()}
            >
              <div className="w-20 h-20 bg-accent/10 rounded-full flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300 shadow-[0_0_20px_rgba(0,229,255,0.2)]">
                <UploadCloud className="w-10 h-10 text-accent" />
              </div>
              <h3 className="text-xl font-semibold text-primary mb-2 uppercase tracking-wide">Import Dataset</h3>
              <p className="text-gray-400 mb-8 text-sm">
                Drop CSV, TSV, or TXT here
              </p>
              <button className="bg-gradient-to-r from-accent to-accent2 text-white px-8 py-3 rounded-xl font-medium shadow-[0_0_15px_rgba(0,229,255,0.3)] hover:shadow-[0_0_25px_rgba(0,229,255,0.5)] hover:scale-105 transition-all duration-300 flex items-center gap-2 uppercase tracking-wider text-sm">
                <FileSpreadsheet className="w-4 h-4" />
                Browse Files
              </button>
            </div>
          )}
          <input
            type="file"
            accept=".csv,.txt,.tsv"
            className="hidden"
            ref={fileInputRef}
            onChange={handleFileChange}
          />
        </div>
      </div>

      {/* Footer Credits */}
      <div className="absolute bottom-6 flex flex-col items-center space-y-2 z-10 text-center px-4 w-full">
        <p className="text-[9px] md:text-[10px] text-gray-500 uppercase tracking-[0.2em] font-medium">
          © Design, Development & Publish Rights
        </p>
        <div className="flex items-center gap-2 text-xs md:text-sm text-accent font-semibold tracking-wide">
          <span>Eng. Mohammed Tarek</span>
          <span className="text-gray-600">&</span>
          <span>Eng. Ahmed Nasser</span>
        </div>
      </div>
    </div>
  );
}

function FeatureItem({ icon, title, desc, color }: { icon: React.ReactNode, title: string, desc: string, color: string }) {
  return (
    <div className="flex items-start gap-4 p-4 rounded-xl hover:bg-white/5 transition-all duration-300 border border-transparent hover:border-white/10 group">
      <div className={`p-3 bg-white/5 rounded-xl ${color} shadow-[0_0_10px_rgba(255,255,255,0.05)] group-hover:shadow-[0_0_15px_rgba(0,229,255,0.2)] transition-shadow`}>
        {React.cloneElement(icon as React.ReactElement<any>, { className: "w-6 h-6" })}
      </div>
      <div>
        <h4 className="text-sm font-semibold text-gray-100 uppercase tracking-wide mb-1">{title}</h4>
        <p className="text-xs text-gray-400 leading-relaxed">{desc}</p>
      </div>
    </div>
  );
}
