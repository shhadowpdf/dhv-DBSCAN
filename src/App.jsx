import { useState } from "react";
import {
  ChevronRight,
  ChevronLeft,
  Play,
  Info,
  Users,
  TrendingUp,
  FileText,
  Home,
} from "lucide-react";
import {
  InteractiveTutorialPage,
  WelcomePage,
  LearnLanguagePage,
  LiveClusteringPage,
  CompareScenarios,
  InsightsPage,
} from "./components/export.js";

/* ---------- MAIN DASHBOARD COMPONENT ---------- */
export default function DBSCANProfessionalDashboard() {
  const [currentPage, setCurrentPage] = useState(0);
  const [profession, setProfession] = useState("Real Estate");
  const [eps, setEps] = useState(6);
  const [minPts, setMinPts] = useState(4);
  const [tutorialStep, setTutorialStep] = useState(0);

  const pages = [
    { id: "welcome", title: "Welcome", icon: Home },
    { id: "learn", title: "Learn the Language", icon: Info },
    { id: "interactive", title: "Interactive Tutorial", icon: Play },
    { id: "visualize", title: "Live Clustering", icon: TrendingUp },
    { id: "compare", title: "Compare Scenarios", icon: Users },
    { id: "insights", title: "Professional Insights", icon: FileText },
  ];

  return (
    <div
      style={{
        fontFamily: "Inter, -apple-system, sans-serif",
        background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
        minHeight: "100vh",
        padding: "20px",
      }}
    >
      <div
        style={{
          maxWidth: 1400,
          margin: "0 auto",
          background: "white",
          borderRadius: 20,
          boxShadow: "0 20px 60px rgba(0,0,0,0.3)",
          overflow: "hidden",
        }}
      >
        <header
          style={{
            background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
            padding: "30px 40px",
            color: "white",
          }}
        >
          <h1
            style={{
              margin: 0,
              fontSize: 32,
              fontWeight: 900,
              letterSpacing: "-0.5px",
            }}
          >
            Pattern Discovery for Professionals
          </h1>
          <p style={{ margin: "8px 0 0 0", fontSize: 16, opacity: 0.9 }}>
            Understanding data clustering through your professional lens
          </p>
        </header>

        <nav
          style={{
            display: "flex",
            borderBottom: "2px solid #e2e8f0",
            background: "#f8fafc",
            overflowX: "auto",
          }}
        >
          {pages.map((page, idx) => {
            const Icon = page.icon;
            return (
              <button
                key={page.id}
                onClick={() => setCurrentPage(idx)}
                style={{
                  flex: "1 1 auto",
                  padding: "16px 20px",
                  border: "none",
                  background: currentPage === idx ? "white" : "transparent",
                  borderBottom:
                    currentPage === idx
                      ? "3px solid #667eea"
                      : "3px solid transparent",
                  color: currentPage === idx ? "#667eea" : "#64748b",
                  cursor: "pointer",
                  fontWeight: currentPage === idx ? 700 : 500,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: 8,
                  fontSize: 14,
                  transition: "all 0.2s",
                }}
              >
                <Icon size={18} />
                {page.title}
              </button>
            );
          })}
        </nav>

        <main style={{ padding: 40, minHeight: 500 }}>
          {currentPage === 0 && (
            <WelcomePage
              profession={profession}
              setProfession={setProfession}
              setCurrentPage={setCurrentPage}
            />
          )}
          {currentPage === 1 && <LearnLanguagePage profession={profession} />}
          {currentPage === 2 && (
            <InteractiveTutorialPage
              profession={profession}
              tutorialStep={tutorialStep}
              setTutorialStep={setTutorialStep}
            />
          )}
          {currentPage === 3 && (
            <LiveClusteringPage
              profession={profession}
              eps={eps}
              setEps={setEps}
              minPts={minPts}
              setMinPts={setMinPts}
            />
          )}
          {currentPage === 4 && <CompareScenarios profession={profession} />}
          {currentPage === 5 && <InsightsPage profession={profession} />}
        </main>

        <footer
          style={{
            padding: "20px 40px",
            background: "#f8fafc",
            borderTop: "1px solid #e2e8f0",
            display: "flex",
            justifyContent: "space-between",
          }}
        >
          <button
            onClick={() => setCurrentPage(Math.max(0, currentPage - 1))}
            disabled={currentPage === 0}
            style={{
              padding: "10px 20px",
              border: "none",
              background: currentPage === 0 ? "#e2e8f0" : "#667eea",
              color: currentPage === 0 ? "#94a3b8" : "white",
              borderRadius: 8,
              cursor: currentPage === 0 ? "not-allowed" : "pointer",
              fontWeight: 600,
              display: "flex",
              alignItems: "center",
              gap: 8,
            }}
          >
            <ChevronLeft size={18} />
            Previous
          </button>
          <button
            onClick={() =>
              setCurrentPage(Math.min(pages.length - 1, currentPage + 1))
            }
            disabled={currentPage === pages.length - 1}
            style={{
              padding: "10px 20px",
              border: "none",
              background:
                currentPage === pages.length - 1 ? "#e2e8f0" : "#667eea",
              color: currentPage === pages.length - 1 ? "#94a3b8" : "white",
              borderRadius: 8,
              cursor:
                currentPage === pages.length - 1 ? "not-allowed" : "pointer",
              fontWeight: 600,
              display: "flex",
              alignItems: "center",
              gap: 8,
            }}
          >
            Next
            <ChevronRight size={18} />
          </button>
        </footer>
      </div>
    </div>
  );
}

/* ---------- PAGE COMPONENTS ---------- */
