"use client";
import { useState } from "react";
import Link from "next/link";
import {
  FaHome,
  FaCompass,
  FaMusic,
  FaUser,
  FaCog,
  FaSignOutAlt,
  FaCompactDisc,
  FaBars,
} from "react-icons/fa";
import Logo from "../Logo/Logo"; // Assuming you have a Logo component
import styles from "./sidebar.module.css";

export default function Sidebar({ isCollapsed, onToggle }) {
  const [activePath, setActivePath] = useState("/");

  const sidebarItems = [
    { name: "Home", path: "/", icon: <FaHome /> },
    { name: "Discover", path: "/discover", icon: <FaCompass /> },
    { name: "Albums", path: "/listener/albums", icon: <FaCompactDisc /> },
    { name: "Artists", path: "/artists", icon: <FaUser /> },
    { name: "Detect Song", path: "/detectsong", icon: <FaMusic /> },
    { name: "Document Listening", path: "/document-listening", icon: <FaMusic /> },
    { name: "Settings", path: "/settings", icon: <FaCog /> },
    { name: "Logout", path: "/logout", icon: <FaSignOutAlt />, className: styles.logout },
  ];

  return (
    <div
      className={`${styles.sidebar} ${
        isCollapsed ? styles.collapsed : styles.expanded
      }`}
    >
      {/* Logo and Hamburger Menu */}
      <div className={styles.header}>
        <div className={styles.logo}>
          {!isCollapsed && <Logo className={styles.logoText} />}{" "}
          {/* Show Logo only if not collapsed */}
        </div>

        <button
          className={styles["hamburger-icon"]}
          onClick={onToggle} // Use onToggle from props
        >
          <FaBars />
        </button>
      </div>

      {/* Menu Items */}
      <nav className={styles.nav}>
        {sidebarItems.map((item) => (
          <Link
            key={item.path}
            href={item.path}
            className={`${styles["nav-link"]} ${
              item.path === activePath ? styles.active : ""
            } ${item.className || ""}`}
            onClick={() => setActivePath(item.path)}
          >
            <div className={styles["nav-icon"]}>{item.icon}</div>
            {!isCollapsed && <span>{item.name}</span>}{" "}
            {/* Hide text when collapsed */}
          </Link>
        ))}
      </nav>

      <div className={styles.divider}></div>
    </div>
  );
}