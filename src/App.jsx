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
import { InteractiveTutorialPage, WelcomePage, LearnLanguagePage, LiveClusteringPage, CompareScenarios, InsightsPage} from "./components/export.js";

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
    <div className="min-h-screen p-5 bg-gradient-to-br from-indigo-500 to-purple-700">
      <div className="max-w-[1400px] mx-auto bg-white rounded-2xl shadow-2xl overflow-hidden">
        <header className="bg-gradient-to-br from-indigo-500 to-purple-700 px-10 py-8 text-white">
          <h1 className="text-4xl font-black tracking-tight">
            Pattern Discovery for Professionals
          </h1>
          <p className="mt-2 text-base opacity-90">Understanding data clustering through your professional lens</p>
        </header>

        <nav className="flex border-b-2 border-slate-200 bg-slate-50 overflow-x-auto">
          {pages.map((page, idx) => {
            const Icon = page.icon;
            return (
              <button
                key={page.id}
                onClick={() => setCurrentPage(idx)}
                className={` cursor-pointer flex-1 py-4 px-5 flex items-center justify-center gap-2 text-sm transition-all ${currentPage===idx?"bg-white text-indigo-500 font-bold border-b-[3px] border-indigo-500":"bg-transparent text-slate-500 font-medium border-b-[3px] border-transparent"}` }
              >
                <Icon size={18} />
                {page.title}
              </button>
            );
          })}
        </nav>

        <main className="p-10 min-h-[500px]">
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

        <footer className="px-10 py-5 bg-slate-50 border-t border-slate-200 flex justify-between">
          <button
            onClick={() => setCurrentPage(Math.max(0, currentPage - 1))}
            disabled={currentPage === 0}
            className={`px-5 py-2 rounded-lg font-semibold flex items-center gap-2 ${currentPage===0?"bg-slate-200 text-slate-400 cursor-not-allowed":"bg-indigo-500 text-white cursor-pointer"}`}
          >
            <ChevronLeft size={18} />
            Previous
          </button>
          <button
            onClick={() =>
              setCurrentPage(Math.min(pages.length - 1, currentPage + 1))
            }
            disabled={currentPage === pages.length - 1}
            className={`px-5 py-2 rounded-lg font-semibold flex items-center gap-2 ${currentPage===pages.length-1?"bg-slate-200 text-slate-400 cursor-not-allowed":"bg-indigo-500 text-white cursor-pointer"}` }
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
