import React, { useState } from "react";
import { Home } from "./components/Home";
import { WorkspaceView } from "./components/WorkspaceView";
import { Workspace } from "./types";
import { SplashScreen } from "./components/SplashScreen";

export default function App() {
  const [workspace, setWorkspace] = useState<Workspace | null>(null);
  const [showSplash, setShowSplash] = useState(true);

  if (showSplash) {
    return <SplashScreen onComplete={() => setShowSplash(false)} />;
  }

  return (
    <div className="h-screen w-screen overflow-hidden antialiased bg-bg text-primary">
      {workspace ? (
        <WorkspaceView 
          workspace={workspace} 
          onUpdateWorkspace={setWorkspace}
          onClose={() => setWorkspace(null)} 
        />
      ) : (
        <Home onWorkspaceCreated={setWorkspace} />
      )}
    </div>
  );
}
