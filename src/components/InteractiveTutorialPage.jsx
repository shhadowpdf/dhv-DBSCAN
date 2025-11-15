import TutorialVisual from "./TutorialVisual.jsx";

export default function InteractiveTutorialPage({
  profession,
  tutorialStep,
  setTutorialStep,
}) {
  const steps = {
    "Real Estate": [
      {
        title: "Step 1: Your Data",
        desc: "Each dot represents a property — with its size (sqft) on the X-axis and price (₹) on the Y-axis. Together, they form your housing market landscape.",
      },
      {
        title: "Step 2: Set Walking Distance",
        desc: "Now define what counts as 'close'. Properties within a certain range of size and price (ε — epsilon) are considered neighbors or within walking distance.",
      },
      {
        title: "Step 3: Minimum Neighborhood",
        desc: "Set how many similar properties (minum points) are needed nearby to form a valid neighborhood. Fewer points = smaller clusters; more points = stronger grouping.",
      },
      {
        title: "Step 4: Find Neighborhoods",
        desc: "DBSCAN automatically discovers clusters — grouping similar properties into natural neighborhoods without any manual classification or prior labels.",
      },
      {
        title: "Step 5: Spot Outliers",
        desc: "Not every property fits in! Outliers like luxury penthouses or fixer-uppers stand apart — shown as isolated points for further review or special handling.",
      },
    ],
    Law: [
      {
        title: "Step 1: Your Cases",
        desc: "You're analyzing 50 legal cases. Each has a duration and a complexity score that reflect how detailed or lengthy it is.",
      },
      {
        title: "Step 2: Define Similarity",
        desc: "Cases that differ by less than 30 days in duration and 10 points in complexity are considered closely related.",
      },
      {
        title: "Step 3: Minimum Pattern",
        desc: "You need at least 4 related cases before the system identifies a consistent legal pattern or precedent.",
      },
      {
        title: "Step 4: Auto-Categorize",
        desc: "The algorithm automatically groups similar cases into categories like fraud, contract disputes, or property law.",
      },
      {
        title: "Step 5: Flag Unique Cases",
        desc: "Special or landmark cases that don't fit existing categories are marked as unique and need expert review.",
      },
    ],

    Journalism: [
      {
        title: "Step 1: Your Articles",
        desc: "You're managing 50 news stories. Each has a word count and engagement score that reflect audience reach and interest.",
      },
      {
        title: "Step 2: Topic Similarity",
        desc: "Articles that differ by less than 500 words and 20 engagement points are treated as covering similar topics.",
      },
      {
        title: "Step 3: Minimum Beat",
        desc: "At least 4 similar stories are needed before the system recognizes a recurring beat or news trend.",
      },
      {
        title: "Step 4: Auto-Organize",
        desc: "The system automatically clusters stories into beats — like politics, climate, or sports — without manual sorting.",
      },
      {
        title: "Step 5: Find Standouts",
        desc: "Exceptional or one-off stories, such as exclusive investigations or viral reports, are flagged as unique pieces.",
      },
    ],
  };

  const currentSteps = steps[profession];
  const current = currentSteps[tutorialStep];

  return (
    <div className="max-w-[1100px] mx-auto">
      <h2 className="text-4xl text-slate-800 mb-10 text-center font-semibold tracking-tight">Interactive Tutorial: How It Works</h2>

      <div className="mb-10">
        <div className="flex justify-between mb-3">
          {currentSteps.map((step, idx) => (
            <div
              key={idx}
              className={`flex-1 h-2 rounded ${idx <= tutorialStep ? 'bg-indigo-500' : 'bg-slate-200'} ${idx < currentSteps.length - 1 ? 'mr-2' : ''}`}
            />
          ))}
        </div>
        <div className="text-xs text-slate-500 text-center">
          Step {tutorialStep + 1} of {currentSteps.length}
        </div>
      </div>

      <div className="bg-white border-2 border-indigo-100 rounded-2xl p-10 mb-8">
        <h3 className="text-2xl font-bold text-indigo-500 mb-4">{current.title}</h3>
        <p className="text-lg text-slate-600 leading-relaxed mb-8">{current.desc}</p>
        <TutorialVisual step={tutorialStep} profession={profession} />
      </div>

      <div className="flex justify-between gap-5">
        <button
          onClick={() => setTutorialStep(Math.max(0, tutorialStep - 1))}
          disabled={tutorialStep === 0}
          className={`px-6 py-3 rounded-lg font-semibold border-2 ${tutorialStep===0?'border-slate-200 text-slate-400 cursor-not-allowed opacity-50':'cursor-pointer border-slate-300 text-slate-800 bg-white hover:border-indigo-400 transition'}`}
        >
          ← Previous Step
        </button>
        <button
          onClick={() => setTutorialStep(Math.min(currentSteps.length - 1, tutorialStep + 1))}
          disabled={tutorialStep === currentSteps.length - 1}
          className={`px-6 py-3 rounded-lg font-semibold text-white ${tutorialStep===currentSteps.length-1?'bg-slate-300 cursor-not-allowed opacity-50 ':'cursor-pointer bg-gradient-to-br from-indigo-500 to-purple-600 hover:shadow-xl hover:-translate-y-0.5 transition'}`}
        >
          Next Step →
        </button>
      </div>
    </div>
  );
}