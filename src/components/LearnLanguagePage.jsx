export default function LearnLanguagePage({ profession }) {
  const translations = {
    "Real Estate": [
      {
        your: "Property Features",
        tech: "Data Points",
        explanation:
          "Each property's characteristics — such as size, price, and location — used to determine similarities and differences.",
      },
      {
        your: "Walking Distance",
        tech: "Epsilon (ε)",
        explanation:
        "The limit for how far apart two properties can be in price or size to still be considered 'close neighbors'.",
      },
      {
        your: "Minimum Community Size",
        tech: "Minimum Points",
        explanation:
        "The smallest number of nearby properties required to recognize an area as a valid neighborhood.",
      },
      {
        your: "Market Segment",
        tech: "Dense Region",
        explanation:
        "A concentrated zone where many similar properties exist — showing strong demand or common pricing trends.",
      },
      {
        your: "Neighborhood",
        tech: "Cluster",
        explanation:
          "A natural group of properties that share similar price ranges and features — forming a clear community in the housing market.",
      },
      {
        your: "Unique Listing",
        tech: "Outlier",
        explanation:
          "A one-of-a-kind property — like a luxury penthouse or distressed home — that doesn’t belong to any neighborhood.",
      },
    ],

    Law: [
      {
        your: "Case Characteristics",
        tech: "Data Points",
        explanation:
          "The measurable aspects of each case — like duration, severity, evidence type, or judgment complexity.",
      },
      {
        your: "Similar Circumstances",
        tech: "Epsilon (ε)",
        explanation:
          "How closely two cases must match in details or context to be treated as part of the same legal pattern.",
      },
      {
        your: "Minimum Precedent Count",
        tech: "Minimum Points",
        explanation:
          "The minimum number of similar cases required before a legal pattern or precedent can be established.",
      },
      {
        your: "Common Case Type",
        tech: "Dense Region",
        explanation:
          "An area in the legal landscape where many similar cases gather — showing recurring legal trends or issues.",
      },
      {
        your: "Case Category",
        tech: "Cluster",
        explanation:
          "A group of legal cases that share similar facts, charges, or outcomes — like fraud, theft, or contract disputes.",
      },
      {
        your: "Landmark Case",
        tech: "Outlier",
        explanation:
          "A rare or exceptional case that stands apart — often setting new legal standards or challenging existing ones.",
      },
    ],

    Journalism: [
      {
        your: "Article Metrics",
        tech: "Data Points",
        explanation:
          "Quantifiable aspects of each story — such as length, audience reach, tone, and topic — used to measure similarity and impact.",
      },
      {
        your: "Topic Similarity",
        tech: "Epsilon (ε)",
        explanation:
          "The degree of similarity in subject, tone, or keywords that determines whether two stories belong to the same beat.",
      },
      {
        your: "Minimum Coverage",
        tech: "Minimum Points",
        explanation:
          "The smallest number of related articles required before a topic is recognized as a consistent news beat.",
      },
      {
        your: "Trending Topic",
        tech: "Dense Region",
        explanation:
          "A hotspot of media activity where many stories focus on the same subject — signaling a rising trend or public interest.",
      },
      {
        your: "Story Beat",
        tech: "Cluster",
        explanation:
          "A collection of related news stories that revolve around the same theme, issue, or ongoing event — like climate change or election coverage.",
      },
      {
        your: "Breaking Investigation",
        tech: "Outlier",
        explanation:
          "A standout, one-of-a-kind story — an exclusive scoop or groundbreaking report that doesn’t align with regular coverage.",
      },
    ],
  };

  const current = translations[profession];

  return (
    <div className="max-w-[1000px] mx-auto">
      <h2 className="text-4xl text-slate-800 mb-4 text-center font-semibold tracking-tight">Your Language ↔ Tech Language</h2>
      <p className="text-base text-slate-600 mb-10 text-center leading-relaxed">
        Here's how the words you use every day connect to data clustering concepts.
        <strong> No formulas, just plain translations</strong>.
      </p>

      <div className="grid gap-5">
        {current.map((item, idx) => (
          <div
            key={idx}
            className="bg-gradient-to-br from-slate-50 to-white border-2 border-indigo-100 rounded-2xl p-6 grid grid-cols-[1fr_auto_1fr] gap-5 items-center shadow-md hover:shadow-xl transition"
          >
            <div>
              <div className="text-[20px] font-bold text-indigo-500 mb-1">{item.your}</div>
              <div className="text-[13px] text-slate-500">What you say</div>
            </div>
            <div className="text-2xl text-slate-400">⟷</div>
            <div>
              <div className="text-[20px] font-bold text-purple-600 mb-1">{item.tech}</div>
              <div className="text-[13px] text-slate-500">Tech term</div>
            </div>
            <div className="col-span-full mt-2 p-4 bg-white rounded-lg text-sm text-slate-600 leading-relaxed">
              💡 {item.explanation}
            </div>
          </div>
        ))}
      </div>

      <div className="mt-10 p-6 bg-amber-100 border-2 border-amber-400 rounded-2xl">
        <h3 className="m-0 mb-3 text-amber-800 text-lg font-bold">✨ The Big Picture</h3>
        <p className="m-0 text-amber-900 leading-relaxed text-sm">
          {profession === "Real Estate" &&
            "Clustering helps you automatically group properties into market segments, find comparable sales, and identify unique investment opportunities—all based on the features you already track."}
          {profession === "Law" &&
            "Clustering helps you automatically categorize cases, find relevant precedents, and identify unusual cases that need special attention—based on the characteristics you already record."}
          {profession === "Journalism" &&
            "Clustering helps you automatically organize your coverage into beats, spot trending topics, and identify unique stories worth deeper investigation—based on the metrics you already measure."}
        </p>
      </div>
    </div>
  );
}