import React from "react";
import { Profile } from "../types";
import { AlertCircle, CheckCircle2, AlertTriangle, Hash, Rows, SplitSquareHorizontal, Layers } from "lucide-react";

export function ProfileTab({ profile }: { profile: Profile }) {
  if (!profile) return null;

  return (
    <div className="p-6 space-y-6 h-full overflow-y-auto bg-transparent">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatCard title="Rows" value={profile.rowCount.toLocaleString()} icon={<Rows className="w-5 h-5 text-accent opacity-70" />} />
        <StatCard title="Columns" value={profile.colCount.toLocaleString()} icon={<SplitSquareHorizontal className="w-5 h-5 text-accent opacity-70" />} />
        <StatCard title="Missing Cells" value={`${(profile.missingPercent * 100).toFixed(1)}%`} icon={<Layers className="w-5 h-5 text-accent opacity-70" />} />
        <StatCard title="Duplicate Rows" value={`${(profile.duplicateRowsPercent * 100).toFixed(1)}%`} icon={<Hash className="w-5 h-5 text-accent opacity-70" />} />
      </div>

      <div>
        <h3 className="text-lg font-bold text-primary mb-4 tracking-widest uppercase flex items-center gap-2">
          <span className="w-2 h-6 bg-accent rounded-sm inline-block"></span>
          Column Profiles
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {profile.columns.map(col => (
            <div key={col.id} className="glass-panel rounded-xl p-5 flex flex-col space-y-3 relative overflow-hidden group hover:border-accent/40 transition-colors">
              <div className="absolute top-0 inset-x-0 h-1" style={{ backgroundColor: col.qualityFlag === 'good' ? 'var(--color-success)' : col.qualityFlag === 'warning' ? 'var(--color-warning)' : 'var(--color-error)'}}></div>
              
              <div className="flex justify-between items-start">
                <h4 className="font-bold text-lg text-primary truncate tracking-wide" title={col.name}>{col.name}</h4>
                <div className="bg-bg/50 p-1.5 rounded-lg">
                  {col.qualityFlag === "good" && <CheckCircle2 className="text-success w-5 h-5 drop-shadow-[0_0_5px_rgba(50,205,50,0.5)]" />}
                  {col.qualityFlag === "warning" && <AlertTriangle className="text-warning w-5 h-5 drop-shadow-[0_0_5px_rgba(255,215,0,0.5)]" />}
                  {col.qualityFlag === "critical" && <AlertCircle className="text-error w-5 h-5 drop-shadow-[0_0_5px_rgba(201,83,30,0.5)]" />}
                </div>
              </div>
              
              <div className="text-sm text-gray-400 flex justify-between items-center bg-black/20 p-2 rounded-lg border border-white/5">
                <span className="flex items-center gap-2">
                  <span className="text-xs text-gray-500 uppercase">Type</span>
                  <span className="font-mono text-xs text-accent">{col.type}</span>
                </span>
                <span className="flex items-center gap-2">
                  <span className="text-xs text-gray-500 uppercase">Unique</span>
                  <span className="font-mono text-white">{col.uniqueCount}</span>
                </span>
              </div>
              
              <div className="text-sm text-gray-400">
                <span className="text-gray-500 uppercase text-xs mr-2">Missing</span>
                <span className="text-white font-mono">{col.missingCount}</span>
                {col.missingCount > 0 && <span className="ml-2 text-warning font-mono text-xs">({(col.missingCount / profile.rowCount * 100).toFixed(1)}%)</span>}
              </div>

              {col.type === "numeric" && col.min !== undefined && col.max !== undefined && (
                <div className="text-xs text-gray-400 bg-black/20 p-2 rounded-lg border border-white/5 flex justify-between font-mono">
                  <span><span className="text-gray-500 uppercase mr-1 text-[10px]">Min</span>{col.min}</span>
                  <span><span className="text-gray-500 uppercase mr-1 text-[10px]">Max</span>{col.max}</span>
                </div>
              )}

              {col.topValues && col.topValues.length > 0 && (
                <div className="mt-4 pt-3 border-t border-white/10">
                  <div className="text-[10px] font-semibold text-accent uppercase tracking-widest mb-2">Top Values</div>
                  <ul className="text-xs space-y-1.5 font-mono">
                    {col.topValues.slice(0,3).map((tv, i) => (
                      <li key={i} className="flex justify-between items-center group/item">
                        <span className="truncate max-w-[150px] text-gray-300 group-hover/item:text-white transition-colors" title={tv.value}>{tv.value || <span className="italic text-gray-600">(empty)</span>}</span>
                        <span className="text-gray-500 bg-black/30 px-1.5 py-0.5 rounded">{tv.count}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function StatCard({ title, value, icon }: { title: string, value: string, icon: React.ReactNode }) {
  return (
    <div className="glass-panel p-5 rounded-xl flex items-start justify-between group hover:border-accent/40 transition-colors">
      <div>
        <div className="text-[10px] text-accent tracking-[0.2em] uppercase font-semibold mb-1">{title}</div>
        <div className="text-3xl font-bold text-primary tracking-tight">{value}</div>
      </div>
      <div className="p-2 bg-white/5 rounded-lg border border-white/5 group-hover:bg-accent/10 transition-colors">
        {icon}
      </div>
    </div>
  );
}
