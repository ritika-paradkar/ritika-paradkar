import { useState } from "react";
import Sidebar from "@/components/Sidebar";
import DashboardView from "@/components/DashboardView";
import UploadView from "@/components/UploadView";
import SimilarCasesView from "@/components/SimilarCasesView";
import LawyersView from "@/components/LawyersView";
import RepositoryView from "@/components/RepositoryView";

export default function Index() {
  const [activeView, setActiveView] = useState("dashboard");

  return (
    <div className="min-h-screen flex">
      <Sidebar activeView={activeView} onViewChange={setActiveView} />
      <main className="flex-1 ml-64 p-8">
        {activeView === "dashboard" && <DashboardView />}
        {activeView === "upload" && <UploadView />}
        {activeView === "repository" && <RepositoryView />}
        {activeView === "similar" && <SimilarCasesView />}
        {activeView === "lawyers" && <LawyersView />}
      </main>
    </div>
  );
}
