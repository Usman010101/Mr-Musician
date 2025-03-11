"use client";
import { useState } from "react";
import { PlayerProvider } from "./context/PlayerContext";
import PlayerBar from "@/components/Player/Player";
import "./globals.css";
import "bootstrap/dist/css/bootstrap.min.css";
import Sidebar from "@/components/sidebar/sidebar";

export default function RootLayout({ children }) {
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(true);

  return (
    <html lang="en">
      <body>
        <PlayerProvider>
          <div style={{ position: "relative" }}>
            {/* Sidebar (always visible in collapsed state) */}
            <Sidebar
              isCollapsed={isSidebarCollapsed}
              onToggle={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
            />

            {/* Overlay starts at 80px when sidebar is expanded */}
            {!isSidebarCollapsed && (
              <div
                onClick={() => setIsSidebarCollapsed(true)}
                style={{
                  position: "fixed",
                  top: 0,
                  left: "80px", 
                  right: 0,
                  bottom: 0,
                  backgroundColor: "rgba(0, 0, 0, 0.5)",
                  backdropFilter: "blur(5px)",
                  zIndex: 999,
                }}
              />
            )}

            {/* Main content (always starts at 80px) */}
            <main style={{ marginLeft: "80px", paddingBottom: "100px" }}>
              {children}
              <PlayerBar />
            </main>

            
          </div>
        </PlayerProvider>
      </body>
    </html>
  );
}