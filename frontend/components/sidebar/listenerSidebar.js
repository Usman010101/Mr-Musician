"use client";
import { useState,useEffect } from "react";
import { usePathname} from "next/navigation"; 
import Link from "next/link";
import {
  FaHome,
  FaCompass,
  FaMusic,
  FaUser,
  FaCompactDisc,
  FaBars,
  FaSignOutAlt,
  FaMicrophoneAlt
} from "react-icons/fa";
import Logo from "../Logo/Logo";
import styles from "./sidebar.module.css";

export default function ListenerSidebar({ isCollapsed, onToggle }) {
  const pathname=usePathname()
  const [activePath, setActivePath] = useState(pathname);
  useEffect(()=>{
    setActivePath(pathname)
  },[pathname])

   const handleLogout = async () => {
  try {
    // http
    const response = await fetch('http://localhost:5000/api/logout/all', {
      method: 'POST',
      credentials: 'include' // Crucial for cookies
    });

    if (!response.ok) throw new Error('Logout failed');
    
    // Clear client-side storage
    localStorage.clear();
    sessionStorage.clear();
    
    // Force full reload
    window.location.href = '/login';
  } catch (error) {
    console.error('Logout error:', error);
    window.location.href = '/login';
  }
};
  
  const sidebarItems = [
    { name: "Home", path: "/home", icon: <FaHome /> },

    { name: "Albums", path: "/albums", icon: <FaCompactDisc /> },
    { name: "Artists", path: "/artists", icon: <FaUser /> },
    { name: "Detect Song", path: "/detectsong", icon: <FaMusic /> },
    { name: "Text to Speech", path: "/texttospeech", icon: <FaMicrophoneAlt /> },
     {
          name: "Logout",
          path: "#", // Unique hash for identification
          icon: <FaSignOutAlt />,
          className: styles.logout,
          onClick: handleLogout
        },

  ];

  return (
    <div className={`${styles.sidebar} ${isCollapsed ? styles.collapsed : styles.expanded}`}>
      <div className={styles.header}>
        <div className={styles.logo}>
          {!isCollapsed && <Logo className={styles.logoText} />}
        </div>
        <button className={styles["hamburger-icon"]} onClick={onToggle}>
          <FaBars />
        </button>
      </div>

      <nav className={styles.nav}>
        {sidebarItems.map((item) => (
          item.name === "Logout" ? (
            // Use div instead of Link for logout
            <div
              key={item.path}
              className={`${styles["nav-link"]} ${item.className || ""}`}
              onClick={handleLogout}
              role="button"
              tabIndex={0}
            >
              <div className={styles["nav-icon"]}>{item.icon}</div>
              {!isCollapsed && <span>{item.name}</span>}
            </div>
          ) : (
            <Link
              key={item.path}
              href={item.path}
              className={`${styles["nav-link"]} ${item.path === activePath ? styles.active : ""
                }`}
              onClick={() => setActivePath(item.path)}
            >
              <div className={styles["nav-icon"]}>{item.icon}</div>
              {!isCollapsed && <span>{item.name}</span>}
            </Link>
          )
        ))}
      </nav>
    </div>
  );
}