import React, { useEffect } from "react";
import * as d3 from "d3";
import { ChevronRight, ChevronLeft, Play, Info, Users, TrendingUp, FileText, Home,Pause, RotateCcw, Plus, Minus, Zap } from "lucide-react";

export default function InsightsPage({ profession }) {
  const insights = {
    "Real Estate": {
      icon: "🏠",
      tagline: "Turn property data into profit opportunities",
      context: "Every day, real estate professionals waste hours manually comparing properties. Clustering automates this—revealing market patterns, finding undervalued gems, and helping you price properties with confidence. Here's how it works in the real world:",
      cases: [
        {
          title: "Finding Hidden Investment Gems",
          emoji: "💎",
          problem: "You're scrolling through 500 property listings trying to spot undervalued opportunities. Each property needs manual comparison against dozens of others. It's exhausting and you're bound to miss something.",
          solution: "Clustering automatically groups properties by size, price, and location. Properties that don't fit any cluster? Those are your outliers—potentially undervalued gems or overpriced listings that need investigation.",
          result: "Found 12 outlier properties in 15 minutes. After investigation: 3 were undervalued due to poor listing photos (bought below market), 2 had unique heritage features worth premium pricing, and 7 were data errors we could ignore.",
          metrics: { 
            timeSaved: "2 hours → 15 minutes", 
            accuracy: "70% → 95%",
            roi: "₹8.5L profit on 1 deal"
          },
          testimonial: "This changed how I hunt for deals. I used to rely on gut feeling—now I have data backing every decision."
        },
        {
          title: "Understanding New Markets Fast",
          emoji: "🗺️",
          problem: "A new agent joins your team. They need to understand the local market—what sells where, typical price ranges, buyer demographics. Traditional training takes weeks of shadowing and guesswork.",
          solution: "Run clustering on recent sales. It instantly reveals natural market segments: luxury condos in downtown, family homes in suburbs, starter apartments near colleges, investment fixer-uppers in emerging areas.",
          result: "New agent understood the entire market structure in one day instead of two weeks. They could confidently advise clients on realistic expectations and identify opportunities within their first week.",
          metrics: { 
            trainingTime: "2 weeks → 1 day", 
            segments: "7 distinct markets",
            confidence: "New agents pitch-ready Day 3"
          },
          testimonial: "I wish I had this when I started. It would've saved me months of confusion and embarrassing client calls."
        },
        {
          title: "Pricing Unique Properties Accurately",
          emoji: "🎯",
          problem: "A client's property has mixed features: large plot, but old construction; great location, but needs renovation. Traditional 'comparable sales' methods fail because no two properties are truly identical.",
          solution: "Clustering considers multiple features simultaneously—not just square footage. It finds the cluster of similar properties (accounting for age, location, condition) and suggests a price range based on recent sales in that cluster.",
          result: "Priced property at ₹48.5 Lakh (cluster average was ₹47-50L). Property sold in 11 days versus market average of 45 days. Client was thrilled, buyer felt they got fair value.",
          metrics: { 
            accuracy: "±₹1.5L vs ±₹5L manual", 
            speed: "Sold in 11 days vs 45",
            satisfaction: "5-star reviews from both parties"
          },
          testimonial: "I used to agonize over pricing unique properties. Now I have confidence and data to back my recommendations."
        }
      ],
      tips: [
        { icon: "🎯", title: "Start Loose, Then Tighten", text: "Begin with broad clustering to see overall market segments. Then tighten settings for precise comparable properties." },
        { icon: "🔍", title: "Outliers = Opportunity or Error", text: "Every outlier is either a hidden gem, a pricing mistake, or bad data. Always investigate—that's where the money is." },
        { icon: "📊", title: "Combine Clusters + Local Knowledge", text: "Clustering gives you data patterns. Add your knowledge of neighborhoods, schools, upcoming development for best results." },
        { icon: "🔄", title: "Re-cluster Monthly", text: "Market conditions change. Run clustering monthly to catch emerging trends and shifting price dynamics." }
      ]
    },
    "Law": {
      icon: "⚖️",
      tagline: "Transform case chaos into organized precedent",
      context: "Legal research is time-consuming. Junior associates spend hours searching for relevant cases while senior partners rely on memory and experience. Clustering organizes your entire case database automatically, surfaces relevant precedents instantly, and flags unusual cases needing expert attention. Here's the impact:",
      cases: [
        {
          title: "Lightning-Fast Precedent Research",
          emoji: "⚡",
          problem: "An associate needs relevant precedents for a contract dispute case. Manual search through case database: read summaries, check jurisdictions, evaluate similarity. It takes 6-8 hours and you're never sure you found everything.",
          solution: "Clustering organizes all past cases by type, duration, and complexity. The system instantly shows the cluster of similar contract disputes with settlement outcomes, timelines, and key arguments.",
          result: "Found 23 highly relevant precedents in 30 minutes instead of 8 hours. Associate prepared a comprehensive brief same day, impressing the partner and client. Similar cases showed 85% settled within 90 days.",
          metrics: { 
            time: "8 hours → 30 minutes", 
            relevance: "85% match rate",
            productivity: "16x faster research"
          },
          testimonial: "I no longer dread research assignments. I can actually focus on strategy instead of endless searching."
        },
        {
          title: "Smart Case Load Management",
          emoji: "📋",
          problem: "Your firm manages 150 active cases across 3 attorneys. Some cases are routine, others need senior review. Manually tracking complexity and priority is overwhelming—things slip through cracks.",
          solution: "Clustering automatically categorizes cases by complexity and type. Routine cases (contracts, simple disputes) cluster together. Complex cases (multi-party, unusual circumstances) appear as outliers needing senior attorney review.",
          result: "Balanced workload across attorneys based on expertise. Flagged 8 unusually complex cases early—assigned to senior partners. Reduced case management errors by 65%, increased team efficiency by 40%.",
          metrics: { 
            efficiency: "+40% productivity", 
            errors: "-65% case management mistakes",
            satisfaction: "Attorneys report less stress"
          },
          testimonial: "Finally, I can see our entire case load at a glance. No more surprises or last-minute fire drills."
        },
        {
          title: "Data-Driven Settlement Strategy",
          emoji: "🤝",
          problem: "Client wants to know: should we settle or go to trial? Traditional approach relies on lawyer's intuition and scattered precedents. Client wants data-backed confidence.",
          solution: "Clustering finds similar cases with known outcomes. Shows typical settlement ranges, trial success rates, and average durations. Provides data-backed negotiation position.",
          result: "Negotiated ₹2.3 Crore settlement (cluster median was ₹2.1-2.5 Cr). Client satisfied—avoided 18-month trial. Lawyer could confidently say 'Similar cases settle in this range' backed by real data.",
          metrics: { 
            confidence: "Data-backed decisions", 
            time: "3 months vs 18 months trial",
            satisfaction: "Client relieved to avoid trial"
          },
          testimonial: "Clients trust me more when I show them data, not just experience. This tool makes that conversation easy."
        }
      ],
      tips: [
        { icon: "📚", title: "Re-cluster Quarterly", text: "Your case database grows. Re-run clustering every quarter to catch new patterns and precedents." },
        { icon: "🎓", title: "Perfect for Training Juniors", text: "Show new associates the visual clusters. They instantly understand case types, typical timelines, and complexity—knowledge that usually takes years." },
        { icon: "⚠️", title: "Outliers Need Senior Review", text: "Unusual cases (outliers) often involve novel legal questions or high stakes. Always flag them for experienced attorneys." },
        { icon: "🔐", title: "Privacy First", text: "Ensure client confidentiality. Clustering uses case metadata (duration, type, outcome)—not sensitive details." }
      ]
    },
    "Journalism": {
      icon: "✍️",
      tagline: "Uncover story patterns and coverage gaps instantly",
      context: "Newsrooms are chaotic. Reporters file dozens of stories daily, editors struggle to see patterns, and important angles get missed. Clustering organizes your coverage automatically—revealing story patterns, identifying gaps, and spotting potential investigative series. Here's what's possible:",
      cases: [
        {
          title: "Discovering an Investigative Series",
          emoji: "🔍",
          problem: "Your newsroom has covered 40+ food safety violations over 6 months. They seem random—different restaurants, locations, violations. But you suspect there's a pattern no one has connected.",
          solution: "Clustering analyzes all food safety stories by location, violation type, and severity. Suddenly, distinct patterns emerge: one cluster shows violations all trace back to a single supplier. That's your lead.",
          result: "Launched 6-part investigative series exposing systemic supplier issues. Won regional journalism award. Led to policy changes and health department reforms. Story referenced in legislative hearings.",
          metrics: { 
            impact: "Policy change + award", 
            time: "2 days to spot pattern vs months",
            reach: "250K readers, 15K social shares"
          },
          testimonial: "We had the data all along but couldn't see the pattern. Clustering connected the dots in minutes."
        },
        {
          title: "Balancing Breaking News Coverage",
          emoji: "📰",
          problem: "Election week: reporters file 50+ articles in 5 days covering rallies, polls, candidates. Editor worries: 'Are we missing any angles? Too much focus on one candidate?' Manual tracking is impossible at this pace.",
          solution: "Daily clustering shows coverage distribution by topic (economy, healthcare, education) and candidate. Visual gaps immediately reveal undercovered topics—like economic policy getting only 8% of coverage despite being top voter concern.",
          result: "Shifted two reporters to economics coverage mid-week. Final coverage balanced across 8 major topics. Readers praised comprehensive coverage. Competitor missed economic angle entirely.",
          metrics: { 
            balance: "8 topics covered evenly", 
            gaps: "3 identified & filled",
            satisfaction: "Reader feedback +40%"
          },
          testimonial: "During breaking news, clustering is my dashboard. I can instantly see what we're covering and what we're missing."
        },
        {
          title: "Organizing Historical Archives",
          emoji: "📚",
          problem: "Your publication has 10,000 articles from the past decade sitting in an unorganized archive. Readers can't discover related stories. Editors can't repurpose evergreen content. It's a goldmine nobody can access.",
          solution: "Clustering automatically organizes the entire archive into beat-based clusters (politics, sports, culture, crime). Outlier articles—those that don't fit clusters—often reveal timeless evergreen pieces worth featuring.",
          result: "Archive searchable by topic in 1 week (previously estimated 3 months manual tagging). Discovered 67 evergreen pieces worth republishing. Increased archive page views by 120%.",
          metrics: { 
            time: "1 week vs 3 months", 
            discovery: "67 evergreen articles found",
            traffic: "+120% archive page views"
          },
          testimonial: "We're now monetizing our archive with 'best of' collections. Readers love it and we love the traffic."
        }
      ],
      tips: [
        { icon: "🔄", title: "Run Clustering Weekly During Big Events", text: "Elections, disasters, major trials—cluster daily to catch coverage gaps and story angles in real-time." },
        { icon: "💎", title: "Outliers = Original Reporting", text: "Articles that don't cluster with others are often your most original work. Feature them, pitch for awards, repurpose for special sections." },
        { icon: "👥", title: "Share Visuals with Editors", text: "Clustering visualizations make editorial meetings faster. Everyone sees coverage patterns instantly—no need for lengthy reports." },
        { icon: "🎯", title: "Use for Story Planning", text: "Before covering a developing story, cluster past coverage to see what angles you've already done—then find fresh perspectives." }
      ]
    }
  };

  const current = insights[profession];

  useEffect(() => {
    const cards = document.querySelectorAll(".insight-card");
    cards.forEach((c, i) => {
      c.style.transition = "all 600ms cubic-bezier(0.16, 1, 0.3, 1)";
      c.style.transitionDelay = `${i * 100}ms`;
      setTimeout(() => c.classList.add("visible"), 50);
    });
  }, [profession]);

  return (
    <div style={{ maxWidth: 1200, margin: "0 auto", padding: "40px 20px" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;600;700;800;900&display=swap');
        
        * { font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif; }
        
        .insights-hero {
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          border-radius: 24px;
          padding: 48px;
          margin-bottom: 48px;
          color: white;
          box-shadow: 0 20px 60px rgba(102, 126, 234, 0.3);
          position: relative;
          overflow: hidden;
        }
        
        .insights-hero::before {
          content: '';
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: url('data:image/svg+xml,<svg width="100" height="100" xmlns="http://www.w3.org/2000/svg"><defs><pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse"><path d="M 40 0 L 0 0 0 40" fill="none" stroke="rgba(255,255,255,0.05)" stroke-width="1"/></pattern></defs><rect width="100" height="100" fill="url(%23grid)"/></svg>');
          opacity: 0.3;
        }
        
        .hero-content { position: relative; z-index: 1; }
        
        .hero-icon {
          font-size: 72px;
          margin-bottom: 16px;
          display: inline-block;
          animation: float 3s ease-in-out infinite;
        }
        
        @keyframes float {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-10px); }
        }
        
        .hero-title {
          font-size: 42px;
          font-weight: 900;
          margin: 0 0 12px 0;
          letter-spacing: -0.5px;
        }
        
        .hero-tagline {
          font-size: 20px;
          font-weight: 600;
          margin-bottom: 24px;
          opacity: 0.95;
        }
        
        .hero-context {
          font-size: 16px;
          line-height: 1.7;
          opacity: 0.9;
          max-width: 900px;
        }
        
        .stats-row {
          display: flex;
          gap: 32px;
          margin-top: 32px;
          padding-top: 32px;
          border-top: 1px solid rgba(255,255,255,0.2);
        }
        
        .stat-item {
          text-align: center;
        }
        
        .stat-value {
          font-size: 36px;
          font-weight: 900;
          display: block;
          margin-bottom: 4px;
        }
        
        .stat-label {
          font-size: 13px;
          opacity: 0.85;
          text-transform: uppercase;
          letter-spacing: 0.5px;
        }
        
        .case-list {
          display: grid;
          gap: 32px;
          margin-bottom: 48px;
        }
        
        .insight-card {
          background: white;
          border-radius: 20px;
          padding: 36px;
          box-shadow: 0 8px 30px rgba(0, 0, 0, 0.08);
          transform: translateY(20px) scale(0.98);
          opacity: 0;
          transition: all 0.3s ease;
          border: 2px solid transparent;
        }
        
        .insight-card.visible {
          transform: translateY(0) scale(1);
          opacity: 1;
        }
        
        .insight-card:hover {
          transform: translateY(-8px) scale(1.01);
          box-shadow: 0 20px 50px rgba(102, 126, 234, 0.15);
          border-color: #667eea;
        }
        
        .case-header {
          display: flex;
          align-items: center;
          gap: 16px;
          margin-bottom: 24px;
        }
        
        .case-emoji {
          width: 64px;
          height: 64px;
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          border-radius: 16px;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 32px;
          flex-shrink: 0;
        }
        
        .case-title {
          font-size: 26px;
          font-weight: 900;
          color: #1e293b;
          line-height: 1.2;
        }
        
        .case-section {
          margin-bottom: 20px;
          padding: 20px;
          background: linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%);
          border-radius: 12px;
          border-left: 4px solid #667eea;
        }
        
        .section-label {
          font-size: 12px;
          font-weight: 800;
          text-transform: uppercase;
          color: #667eea;
          letter-spacing: 1px;
          margin-bottom: 8px;
        }
        
        .section-text {
          font-size: 15px;
          line-height: 1.7;
          color: #475569;
        }
        
        .result-section {
          background: linear-gradient(135deg, #f0fdf4 0%, #dcfce7 100%);
          border-left-color: #10b981;
        }
        
        .metrics-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
          gap: 16px;
          margin-top: 24px;
        }
        
        .metric-card {
          background: white;
          padding: 20px;
          border-radius: 12px;
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.06);
          text-align: center;
          border: 2px solid #e0e7ff;
        }
        
        .metric-label {
          font-size: 12px;
          font-weight: 700;
          color: #64748b;
          text-transform: uppercase;
          letter-spacing: 0.5px;
          margin-bottom: 8px;
        }
        
        .metric-value {
          font-size: 20px;
          font-weight: 900;
          color: #667eea;
        }
        
        .testimonial {
          margin-top: 24px;
          padding: 20px;
          background: linear-gradient(135deg, #fef3c7 0%, #fde68a 100%);
          border-radius: 12px;
          border-left: 4px solid #f59e0b;
          font-style: italic;
          color: #92400e;
          font-size: 15px;
          line-height: 1.6;
        }
        
        .testimonial::before {
          content: '"';
          font-size: 48px;
          color: #f59e0b;
          opacity: 0.3;
          line-height: 0;
          margin-right: 8px;
        }
        
        .tips-section {
          background: white;
          border-radius: 20px;
          padding: 36px;
          box-shadow: 0 8px 30px rgba(0, 0, 0, 0.08);
        }
        
        .tips-header {
          font-size: 28px;
          font-weight: 900;
          color: #1e293b;
          margin-bottom: 24px;
          display: flex;
          align-items: center;
          gap: 12px;
        }
        
        .tip-item {
          display: flex;
          gap: 20px;
          margin-bottom: 24px;
          padding: 20px;
          background: linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%);
          border-radius: 12px;
          transition: all 0.3s ease;
        }
        
        .tip-item:hover {
          transform: translateX(8px);
          background: linear-gradient(135deg, #eef2ff 0%, #e0e7ff 100%);
        }
        
        .tip-icon {
          width: 48px;
          height: 48px;
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          border-radius: 12px;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 24px;
          flex-shrink: 0;
        }
        
        .tip-content {
          flex: 1;
        }
        
        .tip-title {
          font-size: 16px;
          font-weight: 800;
          color: #1e293b;
          margin-bottom: 6px;
        }
        
        .tip-text {
          font-size: 14px;
          color: #475569;
          line-height: 1.6;
        }
        
        .cta-section {
          margin-top: 48px;
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          border-radius: 20px;
          padding: 48px;
          text-align: center;
          color: white;
        }
        
        .cta-title {
          font-size: 32px;
          font-weight: 900;
          margin-bottom: 16px;
        }
        
        .cta-text {
          font-size: 18px;
          margin-bottom: 32px;
          opacity: 0.95;
        }
        
        .cta-buttons {
          display: flex;
          gap: 16px;
          justify-content: center;
          flex-wrap: wrap;
        }
        
        .btn {
          padding: 16px 32px;
          border-radius: 12px;
          font-weight: 800;
          font-size: 16px;
          cursor: pointer;
          border: none;
          transition: all 0.3s ease;
        }
        
        .btn-primary {
          background: white;
          color: #667eea;
        }
        
        .btn-primary:hover {
          transform: translateY(-4px);
          box-shadow: 0 12px 24px rgba(255, 255, 255, 0.3);
        }
        
        .btn-secondary {
          background: rgba(255, 255, 255, 0.15);
          color: white;
          border: 2px solid white;
        }
        
        .btn-secondary:hover {
          background: rgba(255, 255, 255, 0.25);
          transform: translateY(-4px);
        }
      `}</style>

      <div className="insights-hero">
        <div className="hero-content">
          <div className="hero-icon">{current.icon}</div>
          <h1 className="hero-title">{profession}</h1>
          <div className="hero-tagline">{current.tagline}</div>
          <p className="hero-context">{current.context}</p>
          
          <div className="stats-row">
            <div className="stat-item">
              <span className="stat-value">~75%</span>
              <span className="stat-label">Time Saved</span>
            </div>
            <div className="stat-item">
              <span className="stat-value">3x</span>
              <span className="stat-label">Faster Decisions</span>
            </div>
            <div className="stat-item">
              <span className="stat-value">95%</span>
              <span className="stat-label">Accuracy</span>
            </div>
          </div>
        </div>
      </div>

      <div className="case-list">
        {current.cases.map((caseStudy, idx) => (
          <div key={idx} className="insight-card">
            <div className="case-header">
              <div className="case-emoji">{caseStudy.emoji}</div>
              <h2 className="case-title">{caseStudy.title}</h2>
            </div>

            <div className="case-section">
              <div className="section-label">❌ The Problem</div>
              <div className="section-text">{caseStudy.problem}</div>
            </div>

            <div className="case-section">
              <div className="section-label">💡 The Solution</div>
              <div className="section-text">{caseStudy.solution}</div>
            </div>

            <div className="case-section result-section">
              <div className="section-label">✅ The Result</div>
              <div className="section-text">{caseStudy.result}</div>
            </div>

            <div className="metrics-grid">
              {Object.entries(caseStudy.metrics).map(([key, value], i) => (
                <div key={i} className="metric-card">
                  <div className="metric-label">{key.replace(/([A-Z])/g, ' $1').trim()}</div>
                  <div className="metric-value">{value}</div>
                </div>
              ))}
            </div>

            <div className="testimonial">
              {caseStudy.testimonial}
            </div>
          </div>
        ))}
      </div>

      <div className="tips-section">
        <div className="tips-header">
          <span>💡</span>
          <span>Pro Tips from Experts</span>
        </div>
        
        {current.tips.map((tip, idx) => (
          <div key={idx} className="tip-item">
            <div className="tip-icon">{tip.icon}</div>
            <div className="tip-content">
              <div className="tip-title">{tip.title}</div>
              <div className="tip-text">{tip.text}</div>
            </div>
          </div>
        ))}
      </div>

      <div className="cta-section">
        <h2 className="cta-title">Ready to Try It Yourself?</h2>
        <p className="cta-text">
          See how clustering can transform your {profession.toLowerCase()} workflow in minutes, not months.
        </p>
        <div className="cta-buttons">
          <button className="btn btn-primary" onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}>
            Start Live Demo
          </button>
          <button className="btn btn-secondary" onClick={() => alert('Export feature coming soon!')}>
            Download Sample Data
          </button>
        </div>
      </div>
    </div>
  );
}
