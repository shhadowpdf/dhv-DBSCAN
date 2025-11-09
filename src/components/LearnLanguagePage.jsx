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
        your: "Neighborhood",
        tech: "Cluster",
        explanation:
          "A natural group of properties that share similar price ranges and features — forming a clear community in the housing market.",
      },
      {
        your: "Walking Distance",
        tech: "Epsilon (ε)",
        explanation:
          "The limit for how far apart two properties can be in price or size to still be considered 'close neighbors'.",
      },
      {
        your: "Minimum Community Size",
        tech: "MinPts",
        explanation:
          "The smallest number of nearby properties required to recognize an area as a valid neighborhood.",
      },
      {
        your: "Unique Listing",
        tech: "Outlier",
        explanation:
          "A one-of-a-kind property — like a luxury penthouse or distressed home — that doesn’t belong to any neighborhood.",
      },
      {
        your: "Market Segment",
        tech: "Dense Region",
        explanation:
          "A concentrated zone where many similar properties exist — showing strong demand or common pricing trends.",
      },
    ],

    Law: [
      {
        your: "Case Category",
        tech: "Cluster",
        explanation:
          "A group of legal cases that share similar facts, charges, or outcomes — like fraud, theft, or contract disputes.",
      },
      {
        your: "Similar Circumstances",
        tech: "Epsilon (ε)",
        explanation:
          "How closely two cases must match in details or context to be treated as part of the same legal pattern.",
      },
      {
        your: "Minimum Precedent Count",
        tech: "MinPts",
        explanation:
          "The minimum number of similar cases required before a legal pattern or precedent can be established.",
      },
      {
        your: "Landmark Case",
        tech: "Outlier",
        explanation:
          "A rare or exceptional case that stands apart — often setting new legal standards or challenging existing ones.",
      },
      {
        your: "Case Characteristics",
        tech: "Data Points",
        explanation:
          "The measurable aspects of each case — like duration, severity, evidence type, or judgment complexity.",
      },
      {
        your: "Common Case Type",
        tech: "Dense Region",
        explanation:
          "An area in the legal landscape where many similar cases gather — showing recurring legal trends or issues.",
      },
    ],

    Journalism: [
      {
        your: "Story Beat",
        tech: "Cluster",
        explanation:
          "A collection of related news stories that revolve around the same theme, issue, or ongoing event — like climate change or election coverage.",
      },
      {
        your: "Topic Similarity",
        tech: "Epsilon (ε)",
        explanation:
          "The degree of similarity in subject, tone, or keywords that determines whether two stories belong to the same beat.",
      },
      {
        your: "Minimum Coverage",
        tech: "MinPts",
        explanation:
          "The smallest number of related articles required before a topic is recognized as a consistent news beat.",
      },
      {
        your: "Breaking Investigation",
        tech: "Outlier",
        explanation:
          "A standout, one-of-a-kind story — an exclusive scoop or groundbreaking report that doesn’t align with regular coverage.",
      },
      {
        your: "Article Metrics",
        tech: "Data Points",
        explanation:
          "Quantifiable aspects of each story — such as length, audience reach, tone, and topic — used to measure similarity and impact.",
      },
      {
        your: "Trending Topic",
        tech: "Dense Region",
        explanation:
          "A hotspot of media activity where many stories focus on the same subject — signaling a rising trend or public interest.",
      },
    ],
  };

  const current = translations[profession];

  return (
    <div style={{ maxWidth: 1000, margin: "0 auto" }}>
      <h2
        style={{
          fontSize: 32,
          color: "#1e293b",
          marginBottom: 16,
          textAlign: "center",
        }}
      >
        Your Language ↔ Tech Language
      </h2>
      <p
        style={{
          fontSize: 16,
          color: "#475569",
          marginBottom: 40,
          textAlign: "center",
          lineHeight: 1.6,
        }}
      >
        Here's how the words you use every day connect to data clustering
        concepts.
        <strong> No formulas, just plain translations</strong>.
      </p>

      <div style={{ display: "grid", gap: 20 }}>
        {current.map((item, idx) => (
          <div
            key={idx}
            style={{
              background: "linear-gradient(135deg, #f8faff 0%, #ffffff 100%)",
              border: "2px solid #e0e7ff",
              borderRadius: 16,
              padding: 24,
              display: "grid",
              gridTemplateColumns: "1fr auto 1fr",
              gap: 20,
              alignItems: "center",
              boxShadow: "0 4px 12px rgba(102,126,234,0.08)",
              transition: "all 0.3s",
            }}
          >
            <div>
              <div
                style={{
                  fontSize: 20,
                  fontWeight: 700,
                  color: "#667eea",
                  marginBottom: 4,
                }}
              >
                {item.your}
              </div>
              <div style={{ fontSize: 13, color: "#64748b" }}>What you say</div>
            </div>
            <div style={{ fontSize: 24, color: "#94a3b8" }}>⟷</div>
            <div>
              <div
                style={{
                  fontSize: 20,
                  fontWeight: 700,
                  color: "#764ba2",
                  marginBottom: 4,
                }}
              >
                {item.tech}
              </div>
              <div style={{ fontSize: 13, color: "#64748b" }}>Tech term</div>
            </div>
            <div
              style={{
                gridColumn: "1 / -1",
                marginTop: 8,
                padding: 16,
                background: "white",
                borderRadius: 8,
                fontSize: 14,
                color: "#475569",
                lineHeight: 1.5,
              }}
            >
              💡 {item.explanation}
            </div>
          </div>
        ))}
      </div>

      <div
        style={{
          marginTop: 40,
          padding: 24,
          background: "#fef3c7",
          borderRadius: 16,
          border: "2px solid #fbbf24",
        }}
      >
        <h3 style={{ margin: "0 0 12px 0", color: "#92400e", fontSize: 18 }}>
          ✨ The Big Picture
        </h3>
        <p style={{ margin: 0, color: "#78350f", lineHeight: 1.6 }}>
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