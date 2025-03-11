import Image from "next/image";
import styles from "./page.module.css";
import Sidebar from "@/components/sidebar/sidebar";

export default function Home() {
  return (
    <div className="container">
    <Sidebar />
    </div>
  );
}
