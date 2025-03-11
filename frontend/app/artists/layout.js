// app/(listener)/layout.js
import Sidebar from "@/components/sidebar/sidebar";

export default function ListenerLayout({ children }) {
  return (
    <div className="d-flex">
      {/* Sidebar */}
      <div  >
        <Sidebar />
      </div>

      {/* Main content */}
      <main className="flex-grow-1 ms-md-3">
        {children}
      </main>
    </div>
  );
}
