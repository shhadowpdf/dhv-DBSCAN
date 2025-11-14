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
            roi: "₹1.5L profit on 1 deal"
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

  return (
    <div className="max-w-[1200px] mx-auto px-5 py-10">
      <div className="bg-gradient-to-br from-indigo-500 to-purple-700 rounded-3xl p-12 mb-12 text-white shadow-2xl relative overflow-hidden font-normal">
        <div className="relative z-10">
          <div className="text-6xl mb-4 inline-block animate-bounce">{current.icon}</div>
          <h1 className="text-5xl font-black mb-3 tracking-tight">{profession}</h1>
          <div className="text-xl font-semibold mb-6 opacity-95">{current.tagline}</div>
          <p className="max-w-3xl leading-relaxed opacity-90 text-base">{current.context}</p>
        </div>
      </div>

      <div className="grid gap-8 mb-12">
        {current.cases.map((caseStudy, idx) => (
          <div key={idx} className="bg-white rounded-2xl p-9 shadow-lg border-2 border-transparent hover:border-indigo-500 transition-all hover:-translate-y-2 hover:shadow-2xl">
            <div className="flex items-center gap-4 mb-6">
              <div className="w-16 h-16 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-700 flex items-center justify-center text-3xl">
                {caseStudy.emoji}
              </div>
              <h2 className="text-2xl font-black text-slate-800 leading-tight">{caseStudy.title}</h2>
            </div>

            <div className="mb-5 p-5 rounded-xl bg-gradient-to-br from-slate-50 to-slate-100 border-l-4 border-indigo-500">
              <div className="text-[11px] font-extrabold uppercase tracking-wider text-indigo-500 mb-2">❌ The Problem</div>
              <div className="text-sm leading-relaxed text-slate-600">{caseStudy.problem}</div>
            </div>

            <div className="mb-5 p-5 rounded-xl bg-gradient-to-br from-slate-50 to-slate-100 border-l-4 border-indigo-500">
              <div className="text-[11px] font-extrabold uppercase tracking-wider text-indigo-500 mb-2">💡 The Solution</div>
              <div className="text-sm leading-relaxed text-slate-600">{caseStudy.solution}</div>
            </div>

            <div className="mb-5 p-5 rounded-xl bg-gradient-to-br from-green-50 to-green-100 border-l-4 border-emerald-500">
              <div className="text-[11px] font-extrabold uppercase tracking-wider text-emerald-600 mb-2">✅ The Result</div>
              <div className="text-sm leading-relaxed text-slate-600">{caseStudy.result}</div>
            </div>

            <div className="grid gap-4 mt-6 sm:grid-cols-2 md:grid-cols-3">
              {Object.entries(caseStudy.metrics).map(([key, value], i) => (
                <div key={i} className="bg-white p-4 rounded-xl text-center shadow-sm border-2 border-indigo-100">
                  <div className="text-[11px] font-bold uppercase tracking-wide text-slate-500 mb-2">{key.replace(/([A-Z])/g, ' $1').trim()}</div>
                  <div className="text-lg font-bold text-indigo-500 font-[Roboto]">{value}</div>
                </div>
              ))}
            </div>

            <div className="mt-6 p-5 rounded-xl bg-gradient-to-br from-amber-100 to-amber-200 border-l-4 border-amber-500 italic text-amber-800 text-sm leading-relaxed">
              “{caseStudy.testimonial}”
            </div>
          </div>
        ))}
      </div>

      <div className="bg-white rounded-2xl p-9 shadow-lg">
        <div className="text-3xl font-black text-slate-800 mb-6 flex items-center gap-3">
          <span>💡</span>
          <span>Pro Tips from Experts</span>
        </div>
        {current.tips.map((tip, idx) => (
          <div key={idx} className="flex gap-5 mb-6 p-5 rounded-xl bg-gradient-to-br from-slate-50 to-slate-100 hover:from-indigo-50 hover:to-indigo-100 transition-all">
            <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-indigo-500 to-purple-700 flex items-center justify-center text-2xl">
              {tip.icon}
            </div>
            <div className="flex-1">
              <div className="text-base font-extrabold text-slate-800 mb-1">{tip.title}</div>
              <div className="text-sm leading-relaxed text-slate-600">{tip.text}</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
