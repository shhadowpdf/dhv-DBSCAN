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
    <div style={{ maxWidth: 1100, margin: "0 auto" }}>
      <h2
        style={{
          fontSize: 32,
          color: "#1e293b",
          marginBottom: 40,
          textAlign: "center",
        }}
      >
        Interactive Tutorial: How It Works
      </h2>

      <div style={{ marginBottom: 40 }}>
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            marginBottom: 12,
          }}
        >
          {currentSteps.map((step, idx) => (
            <div
              key={idx}
              style={{
                flex: 1,
                height: 8,
                background: idx <= tutorialStep ? "#667eea" : "#e2e8f0",
                marginRight: idx < currentSteps.length - 1 ? 8 : 0,
                borderRadius: 4,
                transition: "all 0.3s",
              }}
            />
          ))}
        </div>
        <div style={{ fontSize: 14, color: "#64748b", textAlign: "center" }}>
          Step {tutorialStep + 1} of {currentSteps.length}
        </div>
      </div>

      <div
        style={{
          background: "white",
          border: "2px solid #e0e7ff",
          borderRadius: 16,
          padding: 40,
          marginBottom: 30,
        }}
      >
        <h3 style={{ fontSize: 28, color: "#667eea", marginBottom: 16 }}>
          {current.title}
        </h3>
        <p
          style={{
            fontSize: 18,
            color: "#475569",
            lineHeight: 1.6,
            marginBottom: 30,
          }}
        >
          {current.desc}
        </p>

        <TutorialVisual step={tutorialStep} profession={profession} />
      </div>

      <div
        style={{ display: "flex", justifyContent: "space-between", gap: 20 }}
      >
        <button
          onClick={() => setTutorialStep(Math.max(0, tutorialStep - 1))}
          disabled={tutorialStep === 0}
          style={{
            padding: "12px 24px",
            border: "2px solid #e2e8f0",
            background: "white",
            borderRadius: 8,
            cursor: tutorialStep === 0 ? "not-allowed" : "pointer",
            fontWeight: 600,
            color: tutorialStep === 0 ? "#94a3b8" : "#1e293b",
            opacity: tutorialStep === 0 ? 0.5 : 1,
          }}
        >
          ← Previous Step
        </button>
        <button
          onClick={() =>
            setTutorialStep(Math.min(currentSteps.length - 1, tutorialStep + 1))
          }
          disabled={tutorialStep === currentSteps.length - 1}
          style={{
            padding: "12px 24px",
            border: "none",
            background:
              tutorialStep === currentSteps.length - 1
                ? "#e2e8f0"
                : "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
            borderRadius: 8,
            cursor:
              tutorialStep === currentSteps.length - 1
                ? "not-allowed"
                : "pointer",
            fontWeight: 600,
            color: "white",
            opacity: tutorialStep === currentSteps.length - 1 ? 0.5 : 1,
          }}
        >
          Next Step →
        </button>
      </div>
    </div>
  );
}