import React, { useState, useEffect } from 'react'
import { 
  Building2, 
  GitCompare, 
  Users, 
  Award, 
  Lightbulb, 
  FileText, 
  ArrowRight,
  ClipboardList,
  ChevronDown,
  Sparkles,
  AlertTriangle,
  FileCheck
} from 'lucide-react'
import { 
  Radar, 
  RadarChart, 
  PolarGrid, 
  PolarAngleAxis, 
  PolarRadiusAxis, 
  ResponsiveContainer 
} from 'recharts'

const renderMarkdown = (text) => {
  if (!text) return null
  
  const lines = text.split('\n')
  return lines.map((line, idx) => {
    const trimmed = line.trim()
    
    // Parse inline bolding: replace **text** with <strong>text</strong>
    const parseInline = (str) => {
      const parts = str.split('**')
      return parts.map((part, i) => {
        if (i % 2 === 1) {
          return <strong key={i} style={{ color: 'var(--color-primary)', fontWeight: 700 }}>{part}</strong>
        }
        return part
      })
    }

    // Header 1
    if (trimmed.startsWith('# ')) {
      return (
        <h1 key={idx} style={{ fontSize: '1.6rem', color: 'var(--text-primary)', marginTop: '24px', marginBottom: '12px', borderBottom: '1px solid var(--border-color)', paddingBottom: '8px' }}>
          {parseInline(trimmed.substring(2))}
        </h1>
      )
    }
    
    // Header 2
    if (trimmed.startsWith('## ')) {
      return (
        <h2 key={idx} style={{ fontSize: '1.3rem', color: 'var(--color-primary)', marginTop: '20px', marginBottom: '10px' }}>
          {parseInline(trimmed.substring(3))}
        </h2>
      )
    }
    
    // Header 3
    if (trimmed.startsWith('### ')) {
      return (
        <h3 key={idx} style={{ fontSize: '1.1rem', color: 'var(--text-primary)', marginTop: '16px', marginBottom: '8px' }}>
          {parseInline(trimmed.substring(4))}
        </h3>
      )
    }
    
    // Blockquote
    if (trimmed.startsWith('> ')) {
      return (
        <blockquote key={idx} style={{ 
          borderLeft: '4px solid var(--color-primary)', 
          background: 'rgba(6,182,212,0.05)', 
          padding: '12px 18px', 
          borderRadius: '6px',
          margin: '12px 0', 
          color: 'var(--text-secondary)',
          fontStyle: 'italic',
          fontSize: '0.95rem'
        }}>
          {parseInline(trimmed.substring(2))}
        </blockquote>
      )
    }
    
    // Bullet Points
    if (trimmed.startsWith('- ') || trimmed.startsWith('* ')) {
      return (
        <li key={idx} style={{ marginLeft: '20px', marginBottom: '6px', color: 'var(--text-secondary)', fontSize: '0.9rem', listStyleType: 'disc' }}>
          {parseInline(trimmed.substring(2))}
        </li>
      )
    }

    // Numbered Lists
    const numMatch = trimmed.match(/^(\d+)\.\s(.*)/)
    if (numMatch) {
      return (
        <div key={idx} style={{ marginLeft: '16px', marginBottom: '6px', color: 'var(--text-secondary)', fontSize: '0.9rem', display: 'flex', gap: '8px' }}>
          <span style={{ color: 'var(--color-primary)', fontWeight: 600 }}>{numMatch[1]}.</span>
          <span>{parseInline(numMatch[2])}</span>
        </div>
      )
    }
    
    // Empty line
    if (trimmed === '') {
      return <div key={idx} style={{ height: '10px' }} />
    }
    
    // Standard paragraph
    return (
      <p key={idx} style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', lineHeight: 1.6, marginBottom: '10px' }}>
        {parseInline(line)}
      </p>
    )
  })
}

const translations = {
  en: {
    selectProject: "Select Project to Evaluate",
    location: "Location:",
    budget: "Budget:",
    sector: "Sector:",
    tabMatches: "Top Matches",
    tabTeam: "Team Builder",
    tabImpact: "Impact & Recommendations",
    tabProposal: "Proposal Generator",
    loadingText: "Analyzing matching vectors...",
    copyMarkdown: "Copy Markdown",
    optimizationChecklist: "Actionable Optimization Checklist",
    generatedProposal: "Generated Collaboration Proposal",
    proposalDesc: "Proposal details compiled automatically based on matching researcher credentials.",
    semanticMatchesHeader: "Semantic & Weighted Matches",
    semanticMatchesDesc: "Top 5 matched researchers sorted by expertise vectors, SDG alignments, and availability.",
    noMatchesText: "No researchers available to match. Seed database to populate experts.",
    teamBuilderHeader: "Interdisciplinary Synergy Team",
    teamBuilderDesc: "AI-curated team designed to cover all technical dimensions of the reconstruction project.",
    impactAnalysisHeader: "Societal Impact Assessment",
    impactAnalysisDesc: "Multi-dimensional impact matrix aligned with United Nations Sustainable Development Goals."
  },
  ar: {
    selectProject: "اختر المشروع للتقييم",
    location: "الموقع:",
    budget: "الميزانية:",
    sector: "القطاع:",
    tabMatches: "المطابقات المقترحة",
    tabTeam: "فريق العمل المتكامل",
    tabImpact: "تحليل الأثر الاجتماعي",
    tabProposal: "مقترح التعاون المشترك",
    loadingText: "جاري تشغيل تحليل متجهات المطابقة وكلاء الذكاء الاصطناعي...",
    copyMarkdown: "نسخ بصيغة ماركداون",
    optimizationChecklist: "قائمة التحسين الإجرائية للأثر",
    generatedProposal: "مقترح التعاون المشترك الذي تم إنشاؤه",
    proposalDesc: "تم تجميع تفاصيل مقترح التعاون تلقائياً بناءً على مؤهلات الخبير المطابق.",
    semanticMatchesHeader: "المطابقات الدلالية والموزونة",
    semanticMatchesDesc: "أعلى 5 باحثين تم مطابقتهم مصنفين حسب متجهات الخبرة، المواءمة مع أهداف التنمية، والتوفر.",
    noMatchesText: "لا يوجد باحثون متاحون للمطابقة. قم بتوليد بيانات تجريبية لتعبئة الخبراء.",
    teamBuilderHeader: "فريق التآزر المتكامل ومتعدد التخصصات",
    teamBuilderDesc: "فريق عمل منظم بواسطة الذكاء الاصطناعي لتغطية كافة الأبعاد التقنية لمشروع إعادة الإعمار.",
    impactAnalysisHeader: "تقييم الأثر الاجتماعي للمشروع",
    impactAnalysisDesc: "مصفوفة أثر متعددة الأبعاد متوافقة مع أهداف التنمية المستدامة للأمم المتحدة."
  }
}

function Matches({ selectedProjectId, setSelectedProjectId, lang }) {
  const activeLang = lang || 'en'
  const t = translations[activeLang]

  const [projects, setProjects] = useState([])
  const [activeTab, setActiveTab] = useState('matches')
  const [loading, setLoading] = useState(false)
  const [loadingStep, setLoadingStep] = useState(0)

  useEffect(() => {
    if (!loading) return
    const interval = setInterval(() => {
      setLoadingStep((prev) => (prev + 1) % 4)
    }, 1500)
    return () => clearInterval(interval)
  }, [loading])
  
  // Data from agents
  const [matches, setMatches] = useState([])
  const [team, setTeam] = useState(null)
  const [impact, setImpact] = useState(null)
  const [recs, setRecs] = useState([])
  const [proposal, setProposal] = useState('')

  // Load projects
  useEffect(() => {
    const loadProjects = async () => {
      try {
        const res = await fetch(`/api/projects?lang=${activeLang}`)
        if (res.ok) {
          const data = await res.json()
          setProjects(data)
          
          // If no project is pre-selected, default to the first one in the list
          if (!selectedProjectId && data.length > 0) {
            setSelectedProjectId(String(data[0].id))
          } else if (data.length > 0 && !data.find(p => String(p.id) === String(selectedProjectId))) {
            // If selected project does not exist in current language list, select the first one
            setSelectedProjectId(String(data[0].id))
          }
        }
      } catch (err) {
        console.error('Error listing projects:', err)
      }
    }
    loadProjects()
  }, [selectedProjectId, setSelectedProjectId, activeLang])

  // Load match analysis when project changes
  useEffect(() => {
    if (!selectedProjectId) return
    
    const fetchAnalysisData = async () => {
      setLoading(true)
      try {
        // Parallel requests to load all agent analysis data
        const [matchRes, teamRes, impactRes, recRes, propRes] = await Promise.all([
          fetch(`/api/projects/${selectedProjectId}/matches`),
          fetch(`/api/projects/${selectedProjectId}/team`),
          fetch(`/api/projects/${selectedProjectId}/impact`),
          fetch(`/api/projects/${selectedProjectId}/recommendations`),
          fetch(`/api/projects/${selectedProjectId}/proposal`)
        ])

        if (matchRes.ok) setMatches(await matchRes.json())
        if (teamRes.ok) setTeam(await teamRes.json())
        if (impactRes.ok) setImpact(await impactRes.json())
        if (recRes.ok) {
          const data = await recRes.json()
          setRecs(data.recommendations)
        }
        if (propRes.ok) {
          const data = await propRes.json()
          setProposal(data.proposal)
        }
      } catch (err) {
        console.error('Error fetching agent analysis details:', err)
      } finally {
        setLoading(false)
      }
    }
    
    fetchAnalysisData()
  }, [selectedProjectId])

  const copyProposalToClipboard = () => {
    navigator.clipboard.writeText(proposal)
    alert(activeLang === 'ar' ? 'تم نسخ مقترح التعاون إلى الحافظة!' : 'Collaboration Proposal copied to clipboard!')
  }

  // Format Recharts radar data
  const getRadarData = () => {
    if (!impact || !impact.scores) return []
    return Object.entries(impact.scores).map(([subject, score]) => ({
      subject,
      score,
      fullMark: 10
    }))
  }

  return (
    <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      
      {/* Project Selector Panel */}
      <section className="glass-panel" style={{ padding: '20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '20px', flexWrap: 'wrap' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <Building2 size={24} color="var(--color-primary)" />
          <div>
            <label style={{ fontSize: '0.75rem', textTransform: 'uppercase', color: 'var(--text-muted)', fontWeight: 600 }}>{t.selectProject}</label>
            <div style={{ position: 'relative', marginTop: '4px' }}>
              <select 
                value={String(selectedProjectId)}
                onChange={(e) => setSelectedProjectId(e.target.value)}
                style={{
                  background: 'rgba(255,255,255,0.05)',
                  border: '1px solid var(--border-color)',
                  color: 'var(--text-primary)',
                  padding: activeLang === 'ar' ? '10px 16px 10px 40px' : '10px 40px 10px 16px',
                  borderRadius: '10px',
                  fontSize: '0.95rem',
                  fontFamily: 'var(--font-sans)',
                  outline: 'none',
                  cursor: 'pointer',
                  appearance: 'none',
                  minWidth: '320px'
                }}
              >
                {projects.map(p => (
                  <option key={p.id} value={String(p.id)} style={{ background: 'var(--bg-surface-solid)' }}>
                    {p.title}
                  </option>
                ))}
              </select>
              <ChevronDown size={16} style={{ position: 'absolute', [activeLang === 'ar' ? 'left' : 'right']: '16px', top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none', color: 'var(--text-secondary)' }} />
            </div>
          </div>
        </div>

        {selectedProjectId && (
          <div style={{ display: 'flex', gap: '16px', fontSize: '0.85rem' }}>
            <div>
              <span style={{ color: 'var(--text-muted)' }}>{t.location} </span>
              <strong style={{ color: 'var(--text-primary)' }}>{projects.find(p => String(p.id) === String(selectedProjectId))?.location}</strong>
            </div>
            <div>
              <span style={{ color: 'var(--text-muted)' }}>{t.budget} </span>
              <strong style={{ color: 'var(--text-primary)' }}>{projects.find(p => String(p.id) === String(selectedProjectId))?.budget}</strong>
            </div>
            <div>
              <span style={{ color: 'var(--text-muted)' }}>{t.sector} </span>
              <strong style={{ color: 'var(--text-primary)' }}>{projects.find(p => String(p.id) === String(selectedProjectId))?.sector}</strong>
            </div>
          </div>
        )}
      </section>

      {/* Tabs */}
      <section style={{ display: 'flex', gap: '12px', borderBottom: '1px solid var(--border-color)', paddingBottom: '2px', flexWrap: 'wrap' }}>
        <button 
          onClick={() => setActiveTab('matches')} 
          className={`btn border-0 ${activeTab === 'matches' ? 'btn-primary' : 'btn-secondary'}`}
          style={{ padding: '8px 16px', borderRadius: '8px' }}
        >
          <Users size={16} />
          <span>{t.tabMatches}</span>
        </button>

        <button 
          onClick={() => setActiveTab('team')} 
          className={`btn border-0 ${activeTab === 'team' ? 'btn-primary' : 'btn-secondary'}`}
          style={{ padding: '8px 16px', borderRadius: '8px' }}
        >
          <GitCompare size={16} />
          <span>{t.tabTeam}</span>
        </button>

        <button 
          onClick={() => setActiveTab('impact')} 
          className={`btn border-0 ${activeTab === 'impact' ? 'btn-primary' : 'btn-secondary'}`}
          style={{ padding: '8px 16px', borderRadius: '8px' }}
        >
          <Lightbulb size={16} />
          <span>{t.tabImpact}</span>
        </button>

        <button 
          onClick={() => setActiveTab('proposal')} 
          className={`btn border-0 ${activeTab === 'proposal' ? 'btn-primary' : 'btn-secondary'}`}
          style={{ padding: '8px 16px', borderRadius: '8px' }}
        >
          <FileText size={16} />
          <span>{t.tabProposal}</span>
        </button>
      </section>

      {loading ? (
        <div className="glass-panel" style={{ padding: '40px', position: 'relative', overflow: 'hidden', display: 'flex', flexDirection: 'column', alignItems: 'center', minHeight: '380px', justifyContent: 'center', gap: '24px' }}>
          {/* Scanner Line */}
          <div className="scanner-overlay" />
          
          <h4 style={{ fontSize: '1.25rem', fontFamily: 'var(--font-display)', background: 'var(--grad-primary)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', fontWeight: 700 }}>
            {activeLang === 'ar' ? 'نظام تشغيل وكلاء الذكاء الاصطناعي...' : 'Cooperating Multi-Agent Engine Active'}
          </h4>

          {/* SVG Animated Network Grid */}
          <div style={{ position: 'relative', width: '280px', height: '180px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            {/* SVG Connecting Paths */}
            <svg style={{ position: 'absolute', width: '100%', height: '100%', top: 0, left: 0, zIndex: 1 }}>
              {/* Central Node to Agent 1 (Top Left) */}
              <line x1="140" y1="90" x2="40" y2="30" stroke="var(--border-color)" strokeWidth="2" className={loadingStep === 0 ? "connecting-path" : ""} />
              {/* Central Node to Agent 2 (Top Right) */}
              <line x1="140" y1="90" x2="240" y2="30" stroke="var(--border-color)" strokeWidth="2" className={loadingStep === 1 ? "connecting-path" : ""} />
              {/* Central Node to Agent 3 (Bottom Left) */}
              <line x1="140" y1="90" x2="40" y2="150" stroke="var(--border-color)" strokeWidth="2" className={loadingStep === 2 ? "connecting-path" : ""} />
              {/* Central Node to Agent 4 (Bottom Right) */}
              <line x1="140" y1="90" x2="240" y2="150" stroke="var(--border-color)" strokeWidth="2" className={loadingStep === 3 ? "connecting-path" : ""} />
            </svg>

            {/* Central Node */}
            <div style={{
              position: 'absolute',
              zIndex: 2,
              width: '60px',
              height: '60px',
              borderRadius: '50%',
              background: 'var(--grad-primary)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: 'var(--shadow-glow)'
            }}>
              <Building2 size={24} color="white" />
            </div>

            {/* Top Left: Semantic Matcher Agent */}
            <div className={loadingStep === 0 ? "agent-node-cyan" : ""} style={{
              position: 'absolute',
              left: '10px',
              top: '5px',
              zIndex: 2,
              width: '50px',
              height: '50px',
              borderRadius: '50%',
              background: loadingStep === 0 ? 'var(--bg-surface-solid)' : 'rgba(255,255,255,0.02)',
              border: '2px solid var(--border-color)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              transition: 'all 0.3s ease'
            }}>
              <Sparkles size={20} color={loadingStep === 0 ? 'var(--color-primary)' : 'var(--text-muted)'} />
            </div>

            {/* Top Right: Team Builder Agent */}
            <div className={loadingStep === 1 ? "agent-node-purple" : ""} style={{
              position: 'absolute',
              right: '10px',
              top: '5px',
              zIndex: 2,
              width: '50px',
              height: '50px',
              borderRadius: '50%',
              background: loadingStep === 1 ? 'var(--bg-surface-solid)' : 'rgba(255,255,255,0.02)',
              border: '2px solid var(--border-color)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              transition: 'all 0.3s ease'
            }}>
              <GitCompare size={20} color={loadingStep === 1 ? 'var(--color-secondary)' : 'var(--text-muted)'} />
            </div>

            {/* Bottom Left: Impact Assessor Agent */}
            <div className={loadingStep === 2 ? "agent-node-cyan" : ""} style={{
              position: 'absolute',
              left: '10px',
              bottom: '5px',
              zIndex: 2,
              width: '50px',
              height: '50px',
              borderRadius: '50%',
              background: loadingStep === 2 ? 'var(--bg-surface-solid)' : 'rgba(255,255,255,0.02)',
              border: '2px solid var(--border-color)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              transition: 'all 0.3s ease'
            }}>
              <Lightbulb size={20} color={loadingStep === 2 ? 'var(--color-accent)' : 'var(--text-muted)'} />
            </div>

            {/* Bottom Right: Proposal Generator Agent */}
            <div className={loadingStep === 3 ? "agent-node-purple" : ""} style={{
              position: 'absolute',
              right: '10px',
              bottom: '5px',
              zIndex: 2,
              width: '50px',
              height: '50px',
              borderRadius: '50%',
              background: loadingStep === 3 ? 'var(--bg-surface-solid)' : 'rgba(255,255,255,0.02)',
              border: '2px solid var(--border-color)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              transition: 'all 0.3s ease'
            }}>
              <FileText size={20} color={loadingStep === 3 ? 'var(--color-warning)' : 'var(--text-muted)'} />
            </div>
          </div>

          {/* Dynamic Progress Logs */}
          <div style={{ width: '100%', maxWidth: '480px', textAlign: 'center', display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <div style={{ display: 'flex', justifyContent: 'center', gap: '6px' }}>
              <span className="dot" style={{ width: '6px', height: '6px', backgroundColor: 'var(--color-primary)', borderRadius: '50%', animation: 'bounce-ball 1.2s infinite ease-in-out' }} />
              <span className="dot" style={{ width: '6px', height: '6px', backgroundColor: 'var(--color-primary)', borderRadius: '50%', animation: 'bounce-ball 1.2s infinite ease-in-out 0.2s' }} />
              <span className="dot" style={{ width: '6px', height: '6px', backgroundColor: 'var(--color-primary)', borderRadius: '50%', animation: 'bounce-ball 1.2s infinite ease-in-out 0.4s' }} />
            </div>
            
            <p style={{ color: 'var(--text-primary)', fontSize: '0.95rem', fontWeight: 500, minHeight: '48px' }}>
              {loadingStep === 0 && (activeLang === 'ar' ? 'الوكيل ٥ (المطابقة): جاري سحب الخبراء وتحليل التوافق الدلالي...' : 'Agent 5 (Matcher): Fetching experts & analyzing semantic vector similarity...')}
              {loadingStep === 1 && (activeLang === 'ar' ? 'الوكيل ٦ (بناء الفرق): جاري تشكيل التآزر متعدد التخصصات وتكامل الأدوار...' : 'Agent 6 (Team Builder): Modeling interdisciplinary synergy & role allocation...')}
              {loadingStep === 2 && (activeLang === 'ar' ? 'الوكيل ٨ (الأثر): جاري تقييم الاستدامة والمواءمة مع أهداف التنمية للأمم المتحدة...' : 'Agent 8 (Impact Assessor): Evaluating sustainability & UN SDG indicators alignment...')}
              {loadingStep === 3 && (activeLang === 'ar' ? 'الوكيل ٧ (المقترح): جاري صياغة مقترح التعاون التفصيلي والربط الأكاديمي...' : 'Agent 7 (Proposal Writer): Composing structured academic-project collaboration contract...')}
            </p>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.8rem' }}>
              {activeLang === 'ar' ? 'قد تستغرق هذه العملية عدة ثوانٍ لإجراء التحليلات المتكاملة.' : 'Please wait, executing deep learning similarity metrics.'}
            </p>
          </div>
        </div>
      ) : (
        <div className="glass-panel" style={{ padding: '32px' }}>
          
          {/* Tab 1: Matching Results */}
          {activeTab === 'matches' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
              <div style={{ borderBottom: '1px solid var(--border-color)', paddingBottom: '12px', marginBottom: '8px' }}>
                <h3 style={{ fontSize: '1.25rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <Sparkles size={18} color="var(--color-primary)" />
                  <span>{t.semanticMatchesHeader}</span>
                </h3>
                <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>{t.semanticMatchesDesc}</p>
              </div>

              {matches.length === 0 ? (
                <p style={{ color: 'var(--text-secondary)' }}>{t.noMatchesText}</p>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                  {matches.map((match, idx) => (
                    <div key={match.researcher_id} className="glass-panel" style={{ padding: '24px', borderLeft: activeLang === 'ar' ? 'none' : `4px solid ${idx === 0 ? 'var(--color-primary)' : 'var(--border-color)'}`, borderRight: activeLang === 'ar' ? `4px solid ${idx === 0 ? 'var(--color-primary)' : 'var(--border-color)'}` : 'none' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '20px', marginBottom: '16px' }}>
                        <div>
                          <h4 style={{ fontSize: '1.2rem', color: 'var(--text-primary)' }}>{match.researcher_name}</h4>
                          <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                            {match.institution} ● {match.country}
                          </span>
                        </div>
                        <div style={{ textAlign: activeLang === 'ar' ? 'left' : 'right' }}>
                          <span style={{ fontSize: '1.75rem', fontWeight: 800, background: 'var(--grad-primary)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
                            {match.score}%
                          </span>
                          <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{activeLang === 'ar' ? 'درجة المطابقة' : 'Match Score'}</p>
                        </div>
                      </div>

                      <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 0.8fr', gap: '24px' }}>
                        <div>
                          <h5 style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', marginBottom: '8px', textTransform: 'uppercase' }}>{activeLang === 'ar' ? 'خلاصة الخبرة' : 'Expertise Summary'}</h5>
                          <p style={{ fontSize: '0.9rem', color: 'var(--text-primary)', marginBottom: '16px' }}>{match.expertise}</p>
                          
                          <h5 style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', marginBottom: '8px', textTransform: 'uppercase' }}>{activeLang === 'ar' ? 'مقياس الثقة' : 'Confidence Metric'}</h5>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.85rem', color: match.explanation.confidence === 'High' ? 'var(--color-accent)' : 'var(--color-warning)' }}>
                            <FileCheck size={16} />
                            <span>
                              <strong>
                                {match.explanation.confidence === 'High' ? (activeLang === 'ar' ? 'عالية' : 'High') : (activeLang === 'ar' ? 'متوسطة' : 'Medium')}
                              </strong> {activeLang === 'ar' ? 'مستوى الثقة في المطابقة' : 'Confidence match assessment'}
                            </span>
                          </div>
                        </div>

                        <div style={{ [activeLang === 'ar' ? 'borderRight' : 'borderLeft']: '1px solid var(--border-color)', [activeLang === 'ar' ? 'paddingRight' : 'paddingLeft']: '24px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
                          <div>
                            <h5 style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '6px', textTransform: 'uppercase' }}>{activeLang === 'ar' ? 'نقاط القوة للتعاون' : 'Key Strengths'}</h5>
                            <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '4px', fontSize: '0.85rem' }}>
                              {match.explanation.reasons.map((r, rIdx) => (
                                <li key={rIdx} style={{ color: '#a7f3d0', display: 'flex', gap: '4px' }}>
                                  <span>✓</span>
                                  <span>{r}</span>
                                </li>
                              ))}
                            </ul>
                          </div>

                          <div>
                            <h5 style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '6px', textTransform: 'uppercase' }}>{activeLang === 'ar' ? 'الفجوات المحتملة' : 'Potential Weaknesses'}</h5>
                            <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '4px', fontSize: '0.85rem' }}>
                              {match.explanation.weaknesses.map((w, wIdx) => (
                                <li key={wIdx} style={{ color: '#fca5a5', display: 'flex', gap: '4px' }}>
                                  <span style={{ fontSize: '1.25rem', lineHeight: '10px' }}>•</span>
                                  <span>{w}</span>
                                </li>
                              ))}
                            </ul>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Tab 2: Multidisciplinary Team Builder */}
          {activeTab === 'team' && team && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
              <div style={{ borderBottom: '1px solid var(--border-color)', paddingBottom: '12px', marginBottom: '8px' }}>
                <h3 style={{ fontSize: '1.25rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <GitCompare size={18} color="var(--color-primary)" />
                  <span>{t.teamBuilderHeader}</span>
                </h3>
                <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>{t.teamBuilderDesc}</p>
              </div>

              <div className="grid-cols-2">
                {team.team.map((member, idx) => (
                  <div key={idx} className="glass-panel" style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span style={{ fontSize: '0.75rem', background: 'rgba(139,92,246,0.15)', color: 'var(--color-secondary)', padding: '3px 8px', borderRadius: '4px', fontWeight: 600 }}>
                        {activeLang === 'ar' ? `دور ${idx + 1}` : `Role ${idx + 1}`}
                      </span>
                      <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>{activeLang === 'ar' ? 'المهارات المثالية:' : 'Ideal skills:'} {member.ideal_skills.slice(0, 2).join(', ')}</span>
                    </div>

                    <div>
                      <h4 style={{ fontSize: '1.15rem', color: 'var(--color-primary)', marginBottom: '4px' }}>{member.role}</h4>
                      <p style={{ fontWeight: 600, fontSize: '0.95rem' }}>
                        {member.researcher_name}
                      </p>
                      {member.institution && (
                        <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                          {member.institution} ({member.country})
                        </p>
                      )}
                    </div>

                    <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', borderTop: '1px dashed var(--border-color)', paddingTop: '10px' }}>
                      {member.match_reason}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Tab 3: Impact Analysis & Recommendations */}
          {activeTab === 'impact' && impact && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
              
              {/* Top part: Radar Chart and Summary */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '40px', alignItems: 'center' }}>
                <div>
                  <h3 style={{ fontSize: '1.25rem', marginBottom: '8px' }}>{t.impactAnalysisHeader}</h3>
                  <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginBottom: '16px' }}>{t.impactAnalysisDesc}</p>
                  <div className="glass-panel" style={{ padding: '20px', background: 'rgba(255,255,255,0.02)', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    {renderMarkdown(impact.summary)}
                  </div>
                </div>

                {/* Radar Chart Container */}
                <div style={{ height: '280px', width: '100%', display: 'flex', justifyContent: 'center' }}>
                  <ResponsiveContainer width="100%" height="100%">
                    <RadarChart cx="50%" cy="50%" radius="80%" data={getRadarData()}>
                      <PolarGrid stroke="var(--border-color)" />
                      <PolarAngleAxis dataKey="subject" stroke="var(--text-secondary)" fontSize={11} />
                      <PolarRadiusAxis angle={30} domain={[0, 10]} stroke="var(--text-muted)" fontSize={10} />
                      <Radar 
                        name={activeLang === 'ar' ? 'درجة الأثر' : 'Impact Score'} 
                        dataKey="score" 
                        stroke="var(--color-primary)" 
                        fill="var(--color-primary)" 
                        fillOpacity={0.25} 
                      />
                    </RadarChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* Bottom part: Recommendation checklist */}
              <div style={{ borderTop: '1px solid var(--border-color)', paddingTop: '24px' }}>
                <h4 style={{ fontSize: '1.15rem', display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px' }}>
                  <Lightbulb size={18} color="var(--color-warning)" />
                  <span>{t.optimizationChecklist}</span>
                </h4>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  {recs.map((rec, rIdx) => (
                    <div key={rIdx} style={{ display: 'flex', gap: '12px', background: 'rgba(245,158,11,0.03)', border: '1px solid rgba(245,158,11,0.1)', padding: '14px 18px', borderRadius: '8px', fontSize: '0.9rem' }}>
                      <AlertTriangle size={16} color="var(--color-warning)" style={{ flexShrink: 0, marginTop: '2px' }} />
                      <p style={{ color: 'var(--text-primary)' }}>{rec}</p>
                    </div>
                  ))}
                </div>
              </div>

            </div>
          )}

          {/* Tab 4: Collaboration Proposal */}
          {activeTab === 'proposal' && proposal && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--border-color)', paddingBottom: '12px', flexWrap: 'wrap', gap: '16px' }}>
                <div>
                  <h3 style={{ fontSize: '1.25rem' }}>{t.generatedProposal}</h3>
                  <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>{t.proposalDesc}</p>
                </div>
                <button onClick={copyProposalToClipboard} className="btn btn-secondary" style={{ padding: '6px 14px', fontSize: '0.85rem' }}>
                  {t.copyMarkdown}
                </button>
              </div>

              <div className="glass-panel" style={{ 
                padding: '30px', 
                backgroundColor: 'rgba(0, 0, 0, 0.1)', 
                fontFamily: 'var(--font-sans)', 
                maxHeight: '500px', 
                overflowY: 'auto',
                borderRadius: '12px',
                border: '1px solid var(--border-color)',
                lineHeight: 1.6
              }}>
                {renderMarkdown(proposal)}
              </div>
            </div>
          )}

        </div>
      )}
    </div>
  )
}

export default Matches
