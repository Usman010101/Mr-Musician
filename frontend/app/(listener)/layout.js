"use client";
import { useState } from "react";
import PlayerBar from "@/components/Player/Player";

import "bootstrap/dist/css/bootstrap.min.css";
import ListenerSidebar from "@/components/sidebar/listenerSidebar";
import { usePlayer } from "./context/PlayerContext";

export default function RootLayout({ children }) {
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(true);
  const {state}=usePlayer()
  const {currentTrack}=state

  return (
    <html lang="en">
      <body>
        <div style={{ position: "relative" }}>
          {/* Sidebar remains unchanged */}
          <ListenerSidebar
            isCollapsed={isSidebarCollapsed}
            onToggle={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
          />

          {/* Overlay for background content only */}
          {!isSidebarCollapsed && (
            <div
              onClick={() => setIsSidebarCollapsed(true)}
              style={{
                position: "fixed",
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                backgroundColor: "rgba(0, 0, 0, 0.5)",
                backdropFilter: "blur(5px)",
                zIndex: 999, // Below sidebar
                transition: "opacity 0.3s ease",
              }}
            />
          )}

          <main style={{ marginLeft: "80px", paddingBottom: "100px" }}>
            {children}

           
            {currentTrack &&  <PlayerBar />}
          </main>

        </div>
      </body>
    </html>
  );
}