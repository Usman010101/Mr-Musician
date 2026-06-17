
"use client";
import { PlayerProvider } from "./(listener)/context/PlayerContext";
import "./globals.css";
import "bootstrap/dist/css/bootstrap.min.css";

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        {/* PlayerProvider wraps ALL routes */}
        <PlayerProvider>
          {children}
        </PlayerProvider>
      </body>
    </html>
  );
}
