"use client";
import { useState } from "react";



import ArtistSidebar from "@/components/sidebar/artistsSidebar";

export default function RootLayout({ children }) {
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(true);


  return (
    <html lang="en">
      <body>
        <div style={{ position: "relative" }}>
          {/* Sidebar remains unchanged */}
          <ArtistSidebar
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

          </main>

        </div>
      </body>
    </html>
  );
}