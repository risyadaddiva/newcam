import Sidebar from "@/components/pos/Sidebar";

export default function InventoryLayout({ children }) {
  return (
    <div className="flex min-h-screen bg-espresso">
      <Sidebar />
      <main className="flex-1 p-8 overflow-auto">{children}</main>
    </div>
  );
}
