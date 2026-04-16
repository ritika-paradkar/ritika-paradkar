import { useState } from "react";
import Sidebar from "@/components/Sidebar";
import DashboardView from "@/components/DashboardView";
import UploadView from "@/components/UploadView";
import SimilarCasesView from "@/components/SimilarCasesView";
import LawyersView from "@/components/LawyersView";
import RepositoryView from "@/components/RepositoryView";
import LegalChatView from "@/components/LegalChatView";
import ClauseComparisonView from "@/components/ClauseComparisonView";
import RiskSimulatorView from "@/components/RiskSimulatorView";
import HeatmapView from "@/components/HeatmapView";
import FraudDetectionView from "@/components/FraudDetectionView";
import PublicModeView from "@/components/PublicModeView";
import VersionHistoryView from "@/components/VersionHistoryView";
import DeadlineView from "@/components/DeadlineView";
import SmartTagsView from "@/components/SmartTagsView";
import CaseSummaryView from "@/components/CaseSummaryView";

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
        {activeView === "chat" && <LegalChatView />}
        {activeView === "compare" && <ClauseComparisonView />}
        {activeView === "simulator" && <RiskSimulatorView />}
        {activeView === "heatmap" && <HeatmapView />}
        {activeView === "fraud" && <FraudDetectionView />}
        {activeView === "public" && <PublicModeView />}
        {activeView === "versions" && <VersionHistoryView />}
        {activeView === "deadlines" && <DeadlineView />}
        {activeView === "tags" && <SmartTagsView />}
        {activeView === "summary" && <CaseSummaryView />}
      </main>
    </div>
  );
}
