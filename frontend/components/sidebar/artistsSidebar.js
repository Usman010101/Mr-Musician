"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  FaHome,
  FaUser,
  FaChartLine,
  FaUpload,
  FaCog,
  FaSignOutAlt,
  FaBars,
} from "react-icons/fa";
import Logo from "../Logo/Logo";
import styles from "./sidebar.module.css";

export default function ArtistSidebar({ isCollapsed, onToggle }) {
  const [activePath, setActivePath] = useState("/artist-dashboard");
  const router = useRouter();

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

  // Rest of the component remains the same...

  const sidebarItems = [
    { name: "Dashboard", path: "/artist-dashboard", icon: <FaHome /> },
    { name: "Upload", path: "/uploadSongs", icon: <FaUpload /> },
    { name: "Profile", path: "/profile", icon: <FaUser /> },
    { name: "Settings", path: "/artistSettings", icon: <FaCog /> },
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