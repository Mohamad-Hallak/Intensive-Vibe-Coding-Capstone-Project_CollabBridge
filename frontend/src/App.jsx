import React, { useState, useEffect } from 'react'
import {
  LayoutDashboard,
  MessageSquareHeart,
  Building2,
  GitCompare,
  BarChart3,
  Sun,
  Moon,
  Database,
  Loader2,
  CheckCircle2,
  LogIn,
  LogOut,
  User as UserIcon,
  Briefcase,
  X,
  ClipboardList,
  ChevronDown,
  Info,
  Trash2,
  Languages,
  ShieldAlert,
  Coins
} from 'lucide-react'
import Dashboard from './components/Dashboard'
import ChatInterface from './components/ChatInterface'
import Matches from './components/Matches'
import Analytics from './components/Analytics'
import LoginModal from './components/LoginModal'
import ProfileManager from './components/ProfileManager'
import About from './components/About'
import TranslationAgent from './components/TranslationAgent'
import ProposalModal from './components/ProposalModal'
import FundingSources from './components/FundingSources'

const translations = {
  en: {
    dashboard: "Dashboard",
    registerResearcher: "Register Researcher",
    registerProject: "Register Project",
    matchFinder: "Match Finder",
    impactAnalytics: "Impact Analytics",
    translationAgent: "Translation Agent",
    about: "About",
    generateDemoData: "Generate Demo Data",
    seeding: "Generating...",
    removeDemoData: "Remove Demo Data",
    removing: "Removing...",
    platformSubtitle: "Syrian Post-War Reconstruction Synergy Platform",
    pageDashboard: "Dashboard Overview",
    pageChatResearcher: "Researcher Registration Chat",
    pageChatProject: "Project Registration Chat",
    pageMatches: "Semantic Match Finder",
    pageAnalytics: "Impact & Alignment Analytics",
    pageTranslation: "AI Translation Agent (Eng ➔ Ar)",
    pageProfile: "My Profile Details",
    signIn: "Sign In",
    signOut: "Sign Out",
    welcome: "Welcome",
    languageLabel: "Language:",
    activeSession: "Active Session",
    myResearcherProfile: "My Researcher Profile",
    myProjects: "My Projects",
    fundingPortal: "Funding Sources",
    pageFunding: "Funding & Grants Matching Agent",
    myProfile: "My Profile",
    lightTheme: "Light Theme",
    darkTheme: "Dark Theme",
    demoRemovedSuccess: "Demo Data Removed Successfully!",
    dbSeededSuccess: "Database Seeded Successfully!",
    removingFailed: "Removing Failed: ",
    seedingFailed: "Seeding Failed: ",
    genericError: "Error",
    errorPrefix: "Error: ",
    expertFallback: "Expert",
    locationLabel: "Location: ",
    availabilityLabel: "Availability: ",
    availableFallback: "Available",
    languagesLabel: "Languages: ",
    languagesFallback: "Arabic, English",
    prefersLabel: "Prefers: ",
    projectsSuffix: " Projects",
    mediumFallback: "Medium",
    focusCountriesLabel: "Focus Countries: ",
    expertiseSummaryTitle: "Expertise Summary",
    preferencesTitle: "Preferences",
    projectScaleLabel: "Project Scale: ",
    remoteCollabLabel: "Remote Collaboration: ",
    intlPartnershipsLabel: "International Partnerships: ",
    yesLabel: "Yes",
    noLabel: "No",
    skillsInterestsTitle: "Skills & Interests",
    publicationsTitle: "Selected Publications",
    previousProjectsTitle: "Previous Projects",
    closeBtn: "Close",
    evaluatePairingsBtn: "Evaluate Pairings"
  },
  ar: {
    dashboard: "لوحة التحكم",
    registerResearcher: "تسجيل باحث",
    registerProject: "تسجيل مشروع",
    matchFinder: "مكتشف المطابقات",
    impactAnalytics: "تحليلات الأثر",
    translationAgent: "وكيل الترجمة الذكي",
    about: "حول المنصة",
    generateDemoData: "توليد بيانات تجريبية",
    seeding: "جاري التوليد...",
    removeDemoData: "حذف البيانات التجريبية",
    removing: "جاري الحذف...",
    platformSubtitle: "منصة التآزر الأكاديمي لإعادة إعمار سوريا",
    pageDashboard: "نظرة عامة على لوحة التحكم",
    pageChatResearcher: "محادثة تسجيل الباحثين",
    pageChatProject: "محادثة تسجيل المشاريع",
    pageMatches: "مكتشف المطابقات الدلالية",
    pageAnalytics: "تحليلات الأثر والمواءمة",
    pageTranslation: "وكيل الترجمة الذكي (إنجليزي ➔ عربي)",
    pageProfile: "تفاصيل ملفي الشخصي",
    signIn: "تسجيل الدخول",
    signOut: "تسجيل الخروج",
    welcome: "مرحباً",
    languageLabel: "اللغة:",
    activeSession: "الجلسة النشطة",
    myResearcherProfile: "ملفي الشخصي كباحث",
    myProjects: "مشاريعي كرائد أعمال",
    fundingPortal: "مصادر التمويل",
    pageFunding: "وكيل مطابقة التمويل والمنح الدولية",
    myProfile: "ملفي الشخصي",
    lightTheme: "الوضع الفاتح",
    darkTheme: "الوضع الداكن",
    demoRemovedSuccess: "تم حذف البيانات التجريبية بنجاح!",
    dbSeededSuccess: "تم توليد قاعدة البيانات بنجاح!",
    removingFailed: "فشل الحذف: ",
    seedingFailed: "فشل التوليد: ",
    genericError: "خطأ",
    errorPrefix: "خطأ: ",
    expertFallback: "خبير",
    locationLabel: "الموقع: ",
    availabilityLabel: "التوفر: ",
    availableFallback: "متاح",
    languagesLabel: "اللغات: ",
    languagesFallback: "العربية، الإنجليزية",
    prefersLabel: "يفضل: ",
    projectsSuffix: " مشاريع",
    mediumFallback: "متوسط",
    focusCountriesLabel: "بلدان التركيز: ",
    expertiseSummaryTitle: "ملخص الخبرة",
    preferencesTitle: "التفضيلات",
    projectScaleLabel: "حجم المشروع: ",
    remoteCollabLabel: "التعاون عن بعد: ",
    intlPartnershipsLabel: "الشراكات الدولية: ",
    yesLabel: "نعم",
    noLabel: "لا",
    skillsInterestsTitle: "المهارات والاهتمامات",
    publicationsTitle: "منشورات مختارة",
    previousProjectsTitle: "المشاريع السابقة",
    closeBtn: "إغلاق",
    evaluatePairingsBtn: "تقييم المطابقات"
  }
}

function App() {
  const [activePage, setActivePage] = useState('dashboard')
  const [selectedProjectId, setSelectedProjectId] = useState(null)
  const [selectedExpertForModal, setSelectedExpertForModal] = useState(null)
  const [proposalModalProjectId, setProposalModalProjectId] = useState(null)
  const [lang, setLang] = useState(localStorage.getItem('collabbridge_lang') || 'en')
  const [isLangOpen, setIsLangOpen] = useState(false)
  const [theme, setTheme] = useState(localStorage.getItem('collabbridge_theme') || 'dark')

  useEffect(() => {
    document.documentElement.dir = lang === 'ar' ? 'rtl' : 'ltr'
  }, [lang])
  const [dbSeeded, setDbSeeded] = useState(false)
  const [dbLoading, setDbLoading] = useState(false)
  const [dbMessage, setDbMessage] = useState('')
  const [dbMessageIsError, setDbMessageIsError] = useState(false)

  // Authentication & Profile tab states
  const [currentUser, setCurrentUser] = useState(null)
  const [profileTab, setProfileTab] = useState('researcher')
  const [isLoginOpen, setIsLoginOpen] = useState(false)
  const [isProfileOpen, setIsProfileOpen] = useState(false)
  const [authChecking, setAuthChecking] = useState(true)

  // Verify auth session on mount
  useEffect(() => {
    const checkAuth = async () => {
      const token = localStorage.getItem('auth_token')
      if (token) {
        try {
          const res = await fetch('/api/auth/me', {
            headers: { 'Authorization': `Bearer ${token}` }
          })
          if (res.ok) {
            const data = await res.json()
            setCurrentUser(data.user)
          } else {
            localStorage.removeItem('auth_token')
          }
        } catch (err) {
          console.error('Session verification error:', err)
        }
      }
      setAuthChecking(false)
    }
    checkAuth()
  }, [])

  // Check DB status on mount
  useEffect(() => {
    const checkDbStatus = async () => {
      try {
        const res = await fetch('/api/db/status')
        if (res.ok) {
          const data = await res.json()
          setDbSeeded(data.has_demo)
        }
      } catch (err) {
        console.error('Error checking DB status:', err)
      }
    }
    checkDbStatus()
  }, [])

  // Apply theme class to document
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme)
  }, [theme])

  const toggleTheme = () => {
    const nextTheme = theme === 'dark' ? 'light' : 'dark'
    setTheme(nextTheme)
    localStorage.setItem('collabbridge_theme', nextTheme)
  }

  const handleLoginSuccess = (data) => {
    localStorage.setItem('auth_token', data.token)
    setCurrentUser(data.user)
  }

  const handleLogout = () => {
    localStorage.removeItem('auth_token')
    setCurrentUser(null)
    setIsProfileOpen(false)
    setActivePage('dashboard')
  }

  const handleDbAction = async () => {
    setDbLoading(true)
    setDbMessage('')
    setDbMessageIsError(false)
    const endpoint = dbSeeded ? '/api/db/clear-demo' : '/api/db/seed'
    const successMsg = dbSeeded
      ? translations[lang].demoRemovedSuccess
      : translations[lang].dbSeededSuccess
    try {
      const res = await fetch(endpoint, { method: 'POST' })
      const data = await res.json()
      if (res.ok) {
        setDbMessage(successMsg)
        setDbSeeded(!dbSeeded)
        setTimeout(() => {
          setDbMessage('')
          window.location.reload()
        }, 1500)
      } else {
        setDbMessageIsError(true)
        setDbMessage(`${dbSeeded ? translations[lang].removingFailed : translations[lang].seedingFailed}${data.detail || translations[lang].genericError}`)
      }
    } catch (err) {
      setDbMessageIsError(true)
      setDbMessage(`${translations[lang].errorPrefix}${err.message}`)
    } finally {
      setDbLoading(false)
    }
  }

  const renderContent = () => {
    switch (activePage) {
      case 'dashboard':
        return (
          <Dashboard
            setActivePage={setActivePage}
            setSelectedProjectId={setSelectedProjectId}
            setSelectedExpertForModal={setSelectedExpertForModal}
            lang={lang}
          />
        )
      case 'chat_researcher':
        return (
          <ChatInterface
            type="researcher"
            key={`researcher-${lang}`}
            currentUser={currentUser}
            openLogin={() => setIsLoginOpen(true)}
            lang={lang}
            setActivePage={setActivePage}
            onGenerateProposal={(id) => setProposalModalProjectId(id)}
          />
        )
      case 'chat_project':
        return (
          <ChatInterface
            type="project_owner"
            key={`project_owner-${lang}`}
            currentUser={currentUser}
            openLogin={() => setIsLoginOpen(true)}
            lang={lang}
            setActivePage={setActivePage}
            onGenerateProposal={(id) => setProposalModalProjectId(id)}
          />
        )
      case 'matches':
        return <Matches selectedProjectId={selectedProjectId} setSelectedProjectId={setSelectedProjectId} lang={lang} />
      case 'analytics':
        return <Analytics lang={lang} />
      case 'translation_agent':
        return <TranslationAgent lang={lang} />
      case 'about':
        return <About lang={lang} />
      case 'funding':
        return <FundingSources lang={lang} />
      case 'my_profile':
        return (
          <ProfileManager
            currentUser={currentUser}
            initialTab={profileTab}
            onLogout={handleLogout}
            lang={lang}
            setActivePage={setActivePage}
            onGenerateProposal={(id) => setProposalModalProjectId(id)}
            onProfileUpdate={async () => {
              const token = localStorage.getItem('auth_token')
              if (token) {
                try {
                  const res = await fetch('/api/auth/me', {
                    headers: { 'Authorization': `Bearer ${token}` }
                  })
                  if (res.ok) {
                    const data = await res.json()
                    setCurrentUser(data.user)
                  }
                } catch (err) {
                  console.error('Error refreshing session after profile update:', err)
                }
              }
            }}
          />
        )
      default:
        return <Dashboard setActivePage={setActivePage} />
    }
  }

  return (
    <div className="app-container">
      {/* Sidebar navigation */}
      <aside className="sidebar">
        <div className="brand">
          <div style={{
            background: 'var(--grad-primary)',
            width: '40px',
            height: '40px',
            borderRadius: '10px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '1.25rem'
          }}>
            🤝
          </div>
          <span className="brand-title">CollabBridge AI</span>
        </div>

        <nav>
          <ul className="nav-links">
            <li>
              <button
                onClick={() => setActivePage('dashboard')}
                className={`nav-link w-full border-0 text-left bg-transparent ${activePage === 'dashboard' ? 'active' : ''}`}
                style={{ width: '100%', border: 0 }}
              >
                <LayoutDashboard size={18} />
                <span>{translations[lang].dashboard}</span>
              </button>
            </li>
            <li>
              <button
                onClick={() => setActivePage('chat_researcher')}
                className={`nav-link w-full border-0 text-left bg-transparent ${activePage === 'chat_researcher' ? 'active' : ''}`}
                style={{ width: '100%', border: 0 }}
              >
                <MessageSquareHeart size={18} />
                <span>{translations[lang].registerResearcher}</span>
              </button>
            </li>
            <li>
              <button
                onClick={() => setActivePage('chat_project')}
                className={`nav-link w-full border-0 text-left bg-transparent ${activePage === 'chat_project' ? 'active' : ''}`}
                style={{ width: '100%', border: 0 }}
              >
                <Building2 size={18} />
                <span>{translations[lang].registerProject}</span>
              </button>
            </li>
            <li>
              <button
                onClick={() => setActivePage('matches')}
                className={`nav-link w-full border-0 text-left bg-transparent ${activePage === 'matches' ? 'active' : ''}`}
                style={{ width: '100%', border: 0 }}
              >
                <GitCompare size={18} />
                <span>{translations[lang].matchFinder}</span>
              </button>
            </li>
            <li>
              <button
                onClick={() => setActivePage('analytics')}
                className={`nav-link w-full border-0 text-left bg-transparent ${activePage === 'analytics' ? 'active' : ''}`}
                style={{ width: '100%', border: 0 }}
              >
                <BarChart3 size={18} />
                <span>{translations[lang].impactAnalytics}</span>
              </button>
            </li>
            <li>
              <button
                onClick={() => setActivePage('translation_agent')}
                className={`nav-link w-full border-0 text-left bg-transparent ${activePage === 'translation_agent' ? 'active' : ''}`}
                style={{ width: '100%', border: 0 }}
              >
                <Languages size={18} />
                <span>{translations[lang].translationAgent}</span>
              </button>
            </li>
            <li>
              <button
                onClick={() => setActivePage('funding')}
                className={`nav-link w-full border-0 text-left bg-transparent ${activePage === 'funding' ? 'active' : ''}`}
                style={{ width: '100%', border: 0 }}
              >
                <Coins size={18} />
                <span>{translations[lang].fundingPortal}</span>
              </button>
            </li>
            <li>
              <button
                onClick={() => setActivePage('about')}
                className={`nav-link w-full border-0 text-left bg-transparent ${activePage === 'about' ? 'active' : ''}`}
                style={{ width: '100%', border: 0 }}
              >
                <Info size={18} />
                <span>{translations[lang].about}</span>
              </button>
            </li>
          </ul>
        </nav>

        <div style={{ marginTop: 'auto', display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {/* DB status message */}
          {dbMessage && (
            <div style={{
              padding: '10px',
              borderRadius: '8px',
              backgroundColor: dbMessageIsError ? 'rgba(239, 68, 68, 0.15)' : 'rgba(16, 185, 129, 0.15)',
              border: '1px solid ' + (dbMessageIsError ? 'var(--color-error)' : 'var(--color-accent)'),
              color: dbMessageIsError ? '#fca5a5' : '#a7f3d0',
              fontSize: '0.8rem',
              display: 'flex',
              alignItems: 'center',
              gap: '6px'
            }}>
              <CheckCircle2 size={14} />
              <span>{dbMessage}</span>
            </div>
          )}

          {/* Quick DB Action Button */}
          <button
            onClick={handleDbAction}
            disabled={dbLoading}
            className="btn btn-secondary"
            style={{ width: '100%', padding: '10px' }}
          >
            {dbLoading ? (
              <Loader2 size={16} className="animate-spin" />
            ) : dbSeeded ? (
              <Trash2 size={16} />
            ) : (
              <Database size={16} />
            )}
            <span>
              {dbLoading 
                ? (dbSeeded ? translations[lang].removing : translations[lang].seeding) 
                : (dbSeeded ? translations[lang].removeDemoData : translations[lang].generateDemoData)
              }
            </span>
          </button>
        </div>
      </aside>

      {/* Main Area */}
      <main style={{ flexGrow: 1, display: 'flex', flexDirection: 'column', minWidth: 0 }}>
        <header className="header" style={{ padding: '24px 40px', borderBottom: '1px solid var(--border-color)', margin: 0, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <h1 className="header-title" style={{ textTransform: 'capitalize' }}>
              {activePage === 'dashboard' ? translations[lang].dashboard :
                activePage === 'chat_researcher' ? translations[lang].registerResearcher :
                  activePage === 'chat_project' ? translations[lang].registerProject :
                    activePage === 'matches' ? translations[lang].matchFinder :
                      activePage === 'analytics' ? translations[lang].impactAnalytics :
                        activePage === 'translation_agent' ? translations[lang].pageTranslation :
                          activePage === 'about' ? translations[lang].about :
                            activePage === 'funding' ? translations[lang].fundingPortal :
                              translations[lang].myProfile}
            </h1>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem' }}>
              {translations[lang].platformSubtitle}
            </p>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
            {/* Language Switcher */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', position: 'relative' }}>
              <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{translations[lang].languageLabel}</span>

              <button
                onClick={() => setIsLangOpen(!isLangOpen)}
                style={{
                  background: 'rgba(255, 255, 255, 0.05)',
                  border: '1px solid var(--border-color)',
                  color: 'var(--text-primary)',
                  padding: '6px 12px',
                  borderRadius: '8px',
                  fontSize: '0.8rem',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  outline: 'none',
                  minWidth: '100px',
                  justifyContent: 'space-between'
                }}
              >
                {lang === 'en' ? (
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <svg width="16" height="11" viewBox="0 0 60 30" style={{ borderRadius: '1px', display: 'inline-block', verticalAlign: 'middle' }}>
                      <clipPath id="union-jack-header">
                        <path d="M0,0 v30 h60 v-30 z" />
                      </clipPath>
                      <rect width="60" height="30" fill="#012169" />
                      <path d="M0,0 L60,30 M60,0 L0,30" stroke="#fff" stroke-width="6" />
                      <path d="M0,0 L60,30 M60,0 L0,30" stroke="#c8102e" stroke-width="4" clipPath="url(#union-jack-header)" />
                      <path d="M30,0 v30 M0,15 h60" stroke="#fff" stroke-width="10" />
                      <path d="M30,0 v30 M0,15 h60" stroke="#c8102e" stroke-width="6" />
                    </svg>
                    <span>English</span>
                  </div>
                ) : (
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <svg width="16" height="11" viewBox="0 0 3 2" style={{ borderRadius: '1px', display: 'inline-block', verticalAlign: 'middle' }}>
                      <rect width="3" height="2" fill="#fff" />
                      <rect width="3" height="0.667" fill="#3D9B35" />
                      <rect y="1.333" width="3" height="0.667" fill="#000" />
                      <polygon points="0.75,1 0.79,0.85 0.93,0.85 0.82,0.76 0.86,0.6 0.75,0.7 0.64,0.6 0.68,0.76 0.57,0.85 0.71,0.85" fill="#E31B23" />
                      <polygon points="1.5,1 1.54,0.85 1.68,0.85 1.57,0.76 1.61,0.6 1.5,0.7 1.39,0.6 1.43,0.76 1.32,0.85 1.46,0.85" fill="#E31B23" />
                      <polygon points="2.25,1 2.29,0.85 2.43,0.85 2.32,0.76 2.36,0.6 2.25,0.7 2.14,0.6 2.18,0.76 2.07,0.85 2.21,0.85" fill="#E31B23" />
                    </svg>
                    <span>العربية</span>
                  </div>
                )}
                <ChevronDown size={12} style={{ opacity: 0.7 }} />
              </button>

              {isLangOpen && (
                <div style={{
                  position: 'absolute',
                  top: '100%',
                  right: lang === 'ar' ? 'auto' : 0,
                  left: lang === 'ar' ? 0 : 'auto',
                  marginTop: '6px',
                  background: 'var(--bg-surface-solid)',
                  border: '1px solid var(--border-color)',
                  borderRadius: '8px',
                  boxShadow: 'var(--shadow-lg)',
                  zIndex: 100,
                  overflow: 'hidden',
                  display: 'flex',
                  flexDirection: 'column',
                  minWidth: '120px'
                }}>
                  <button
                    onClick={() => {
                      setLang('en')
                      localStorage.setItem('collabbridge_lang', 'en')
                      setIsLangOpen(false)
                    }}
                    style={{
                      background: 'transparent',
                      border: 'none',
                      color: 'var(--text-primary)',
                      padding: '10px 14px',
                      fontSize: '0.8rem',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px',
                      width: '100%',
                      textAlign: 'left'
                    }}
                    onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.05)'}
                    onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                  >
                    <svg width="16" height="11" viewBox="0 0 60 30" style={{ borderRadius: '1px', display: 'inline-block', verticalAlign: 'middle', marginRight: lang === 'ar' ? '0' : '8px', marginLeft: lang === 'ar' ? '8px' : '0' }}>
                      <clipPath id="union-jack-dropdown">
                        <path d="M0,0 v30 h60 v-30 z" />
                      </clipPath>
                      <rect width="60" height="30" fill="#012169" />
                      <path d="M0,0 L60,30 M60,0 L0,30" stroke="#fff" stroke-width="6" />
                      <path d="M0,0 L60,30 M60,0 L0,30" stroke="#c8102e" stroke-width="4" clipPath="url(#union-jack-dropdown)" />
                      <path d="M30,0 v30 M0,15 h60" stroke="#fff" stroke-width="10" />
                      <path d="M30,0 v30 M0,15 h60" stroke="#c8102e" stroke-width="6" />
                    </svg>
                    <span>English</span>
                  </button>
                  <button
                    onClick={() => {
                      setLang('ar')
                      localStorage.setItem('collabbridge_lang', 'ar')
                      setIsLangOpen(false)
                    }}
                    style={{
                      background: 'transparent',
                      border: 'none',
                      color: 'var(--text-primary)',
                      padding: '10px 14px',
                      fontSize: '0.8rem',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px',
                      width: '100%',
                      textAlign: 'left'
                    }}
                    onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.05)'}
                    onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                  >
                    <svg width="16" height="11" viewBox="0 0 3 2" style={{ borderRadius: '1px' }}>
                      <rect width="3" height="2" fill="#fff" />
                      <rect width="3" height="0.667" fill="#3D9B35" />
                      <rect y="1.333" width="3" height="0.667" fill="#000" />
                      <polygon points="0.75,1 0.79,0.85 0.93,0.85 0.82,0.76 0.86,0.6 0.75,0.7 0.64,0.6 0.68,0.76 0.57,0.85 0.71,0.85" fill="#E31B23" />
                      <polygon points="1.5,1 1.54,0.85 1.68,0.85 1.57,0.76 1.61,0.6 1.5,0.7 1.39,0.6 1.43,0.76 1.32,0.85 1.46,0.85" fill="#E31B23" />
                      <polygon points="2.25,1 2.29,0.85 2.43,0.85 2.32,0.76 2.36,0.6 2.25,0.7 2.14,0.6 2.18,0.76 2.07,0.85 2.21,0.85" fill="#E31B23" />
                    </svg>
                    <span>العربية</span>
                  </button>
                </div>
              )}
            </div>

            <button onClick={toggleTheme} className="theme-btn">
              {theme === 'dark' ? <Sun size={16} /> : <Moon size={16} />}
              <span>{theme === 'dark' ? translations[lang].lightTheme : translations[lang].darkTheme}</span>
            </button>

            {/* Google-like Account Component */}
            {!authChecking && (
              currentUser ? (
                <div style={{ position: 'relative' }}>
                  <button
                    onClick={() => setIsProfileOpen(prev => !prev)}
                    style={{
                      width: '40px',
                      height: '40px',
                      borderRadius: '50%',
                      background: 'var(--grad-primary)',
                      color: '#000000',
                      border: '1px solid rgba(6, 182, 212, 0.4)',
                      fontSize: '1.1rem',
                      fontWeight: 700,
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      boxShadow: '0 0 10px rgba(6, 182, 212, 0.2)',
                      textTransform: 'uppercase',
                      padding: 0,
                      overflow: 'hidden'
                    }}
                  >
                    {currentUser.picture_url ? (
                      <img 
                        src={currentUser.picture_url} 
                        alt={currentUser.name || currentUser.email} 
                        style={{ width: '100%', height: '100%', objectFit: 'cover' }} 
                      />
                    ) : (
                      currentUser.email.charAt(0)
                    )}
                  </button>

                  {/* Dropdown Menu Popover */}
                  {isProfileOpen && (
                    <div className="glass-panel" style={{
                      position: 'absolute',
                      top: '52px',
                      right: lang === 'ar' ? 'auto' : 0,
                      left: lang === 'ar' ? 0 : 'auto',
                      width: '260px',
                      padding: '16px',
                      zIndex: 999,
                      border: '1px solid rgba(6, 182, 212, 0.25)',
                      boxShadow: '0 10px 25px rgba(0,0,0,0.5)',
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '12px'
                    }}>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '2px', borderBottom: '1px solid var(--border-color)', paddingBottom: '10px', textAlign: lang === 'ar' ? 'right' : 'left' }}>
                        <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 600 }}>{translations[lang].activeSession}</span>
                        <span style={{ fontSize: '0.85rem', color: 'var(--text-primary)', fontWeight: 600, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{currentUser.email}</span>
                      </div>

                      <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                        <button
                          onClick={() => {
                            setActivePage('my_profile');
                            setProfileTab('researcher');
                            setIsProfileOpen(false);
                          }}
                          className="btn btn-secondary"
                          style={{
                            width: '100%',
                            padding: '8px 10px',
                            fontSize: '0.8rem',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '6px',
                            justifyContent: 'flex-start',
                            flexDirection: lang === 'ar' ? 'row-reverse' : 'row'
                          }}
                        >
                          <UserIcon size={14} />
                          <span>{translations[lang].myResearcherProfile}</span>
                        </button>

                        <button
                          onClick={() => {
                            setActivePage('my_profile');
                            setProfileTab('projects');
                            setIsProfileOpen(false);
                          }}
                          className="btn btn-secondary"
                          style={{
                            width: '100%',
                            padding: '8px 10px',
                            fontSize: '0.8rem',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '6px',
                            justifyContent: 'flex-start',
                            flexDirection: lang === 'ar' ? 'row-reverse' : 'row'
                          }}
                        >
                          <Briefcase size={14} />
                          <span>{translations[lang].myProjects}</span>
                        </button>
                      </div>

                      <button
                        onClick={handleLogout}
                        className="btn btn-primary"
                        style={{
                          width: '100%',
                          padding: '8px',
                          fontSize: '0.8rem',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '6px',
                          justifyContent: 'center',
                          flexDirection: lang === 'ar' ? 'row-reverse' : 'row'
                        }}
                      >
                        <LogOut size={14} />
                        <span>{translations[lang].signOut}</span>
                      </button>
                    </div>
                  )}
                </div>
              ) : (
                <button
                  onClick={() => setIsLoginOpen(true)}
                  className="btn btn-primary"
                  style={{ padding: '8px 16px', fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: '8px' }}
                >
                  <LogIn size={14} />
                  <span>{translations[lang].signIn}</span>
                </button>
              )
            )}
          </div>
        </header>

        <div className="main-content" style={{ overflowY: 'auto' }}>
          {renderContent()}
        </div>
      </main>

      {/* Login Modal */}
      <LoginModal
        isOpen={isLoginOpen}
        onClose={() => setIsLoginOpen(false)}
        onLoginSuccess={handleLoginSuccess}
        lang={lang}
      />

      {/* Database Operation Loader Overlay */}
      {/* Database Operation Loader Overlay */}
      {dbLoading && (
        <div className="animate-fade-in" style={{
          position: 'fixed',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          backgroundColor: 'rgba(3, 7, 18, 0.95)',
          backdropFilter: 'blur(12px)',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 9999,
          gap: '24px'
        }}>
          {/* Animated Database Node and Floating Particles */}
          <div style={{ position: 'relative', width: '100px', height: '100px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <div className="agent-node-cyan" style={{
              width: '70px',
              height: '70px',
              borderRadius: '50%',
              background: 'rgba(6, 182, 212, 0.05)',
              border: '2px solid var(--color-primary)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              <Database size={32} style={{ color: 'var(--color-primary)' }} />
            </div>
            {/* Particles */}
            <div className="floating-particle" style={{ left: '15px', bottom: '15px', width: '6px', height: '6px', animationDelay: '0.2s', '--float-x': '15px' }} />
            <div className="floating-particle" style={{ right: '20px', bottom: '20px', width: '8px', height: '8px', animationDelay: '0.8s', '--float-x': '-25px' }} />
            <div className="floating-particle" style={{ left: '45px', bottom: '5px', width: '5px', height: '5px', animationDelay: '1.4s', '--float-x': '5px' }} />
            <div className="floating-particle" style={{ right: '40px', bottom: '15px', width: '7px', height: '7px', animationDelay: '2.0s', '--float-x': '-10px' }} />
          </div>

          <h3 style={{ color: 'var(--text-primary)', fontSize: '1.35rem', fontWeight: 700, fontFamily: 'var(--font-display)' }}>
            {dbSeeded ? translations[lang].removing : translations[lang].seeding}
          </h3>

          {/* Flowing Progress Bar */}
          <div style={{ width: '280px', height: '6px', background: 'rgba(255,255,255,0.05)', borderRadius: '3px', overflow: 'hidden', border: '1px solid var(--border-color)', position: 'relative' }}>
            <div className="loading-bar-fill" style={{
              width: '100%',
              height: '100%',
              background: 'var(--grad-primary)',
              position: 'absolute',
              top: 0,
              left: 0,
              borderRadius: '3px'
            }} />
          </div>

          <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', maxWidth: '420px', textAlign: 'center', lineHeight: '1.6', padding: '0 20px' }}>
            {dbSeeded 
              ? (lang === 'ar' ? 'نظام إدارة البيانات: جاري إزالة السجلات التجريبية والحفاظ على البيانات الحقيقية المضافة...' : 'Data Engine: Safely removing demo data templates and preserving all newly added custom records...') 
              : (lang === 'ar' ? 'نظام إدارة البيانات: جاري ربط البنية الدلالية وتضمين ٥٠ خبيراً و٣٠ مشروعاً...' : 'Data Engine: Seeding repository with 50 academic experts and 30 active reconstruction challenges...')}
          </p>
        </div>
      )}


      {/* Expert Details Modal */}
      {selectedExpertForModal && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          backgroundColor: 'rgba(0,0,0,0.75)',
          backdropFilter: 'blur(8px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000,
        }} onClick={() => setSelectedExpertForModal(null)}>
          <div className="glass-panel animate-fade-in" style={{
            width: '90%',
            maxWidth: '650px',
            maxHeight: '90vh',
            overflowY: 'auto',
            padding: '32px',
            position: 'relative',
            display: 'flex',
            flexDirection: 'column',
            gap: '20px',
            border: '1px solid rgba(139, 92, 246, 0.3)',
            boxShadow: '0 20px 40px rgba(0,0,0,0.5)',
          }} onClick={(e) => e.stopPropagation()} dir={lang === 'ar' ? 'rtl' : 'ltr'}>

            {/* Close button */}
            <button
              onClick={() => setSelectedExpertForModal(null)}
              style={{
                position: 'absolute',
                top: '20px',
                [lang === 'ar' ? 'left' : 'right']: '20px',
                background: 'transparent',
                border: 0,
                color: 'var(--text-secondary)',
                cursor: 'pointer',
                padding: '4px'
              }}
            >
              <X size={20} />
            </button>

            {/* Header info */}
            <div>
              <span style={{
                fontSize: '0.75rem',
                padding: '4px 8px',
                borderRadius: '20px',
                background: 'rgba(139,92,246,0.1)',
                color: 'var(--color-secondary)',
                border: '1px solid rgba(139,92,246,0.2)',
                fontWeight: 600,
                display: 'inline-block',
                marginBottom: '12px'
              }}>
                {selectedExpertForModal.position || translations[lang].expertFallback}
              </span>
              <h2 style={{ fontSize: '1.6rem', color: 'var(--text-primary)', marginBottom: '4px' }}>{selectedExpertForModal.name}</h2>
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
                {selectedExpertForModal.department} ● {selectedExpertForModal.institution}
              </p>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', marginTop: '2px' }}>
                {translations[lang].locationLabel}{selectedExpertForModal.country}
              </p>
            </div>

            {/* Availability & Preferred Collab */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', background: 'rgba(255,255,255,0.02)', padding: '16px', borderRadius: '10px', border: '1px solid var(--border-color)', fontSize: '0.9rem' }}>
              <div>
                <span style={{ color: 'var(--text-muted)' }}>{translations[lang].availabilityLabel}</span>
                <strong style={{ color: 'var(--color-accent)' }}>{selectedExpertForModal.availability || translations[lang].availableFallback}</strong>
              </div>
              <div>
                <span style={{ color: 'var(--text-muted)' }}>{translations[lang].languagesLabel}</span>
                <strong style={{ color: 'var(--text-primary)' }}>{selectedExpertForModal.languages?.join(', ') || translations[lang].languagesFallback}</strong>
              </div>
              <div>
                <span style={{ color: 'var(--text-muted)' }}>{translations[lang].prefersLabel}</span>
                <strong style={{ color: 'var(--text-primary)' }}>{selectedExpertForModal.preferred_collaborations?.join(', ') || translations[lang].mediumFallback}{translations[lang].projectsSuffix}</strong>
              </div>
              <div>
                <span style={{ color: 'var(--text-muted)' }}>{translations[lang].focusCountriesLabel}</span>
                <strong style={{ color: 'var(--text-primary)' }}>{selectedExpertForModal.focus_countries?.join(', ') || selectedExpertForModal.country}</strong>
              </div>
            </div>

            {/* Expertise */}
            <div>
              <h4 style={{ fontSize: '1.05rem', color: 'var(--text-primary)', marginBottom: '8px', borderBottom: '1px solid var(--border-color)', paddingBottom: '6px' }}>{translations[lang].expertiseSummaryTitle}</h4>
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', lineHeight: '1.6' }}>{selectedExpertForModal.expertise}</p>
            </div>

            {/* Preferences */}
            <div>
              <h4 style={{ fontSize: '1.05rem', color: 'var(--text-primary)', marginBottom: '8px', borderBottom: '1px solid var(--border-color)', paddingBottom: '6px' }}>{translations[lang].preferencesTitle}</h4>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px 24px', fontSize: '0.9rem', color: 'var(--text-secondary)' }}>
                <div>
                  <span style={{ color: 'var(--text-muted)' }}>{translations[lang].projectScaleLabel}</span>
                  <strong style={{ color: 'var(--text-primary)' }}>{selectedExpertForModal.preferred_collaborations?.join(', ') || translations[lang].mediumFallback}{translations[lang].projectsSuffix}</strong>
                </div>
                <div>
                  <span style={{ color: 'var(--text-muted)' }}>{translations[lang].focusCountriesLabel}</span>
                  <strong style={{ color: 'var(--text-primary)' }}>{selectedExpertForModal.focus_countries?.join(', ') || selectedExpertForModal.country}</strong>
                </div>
                <div>
                  <span style={{ color: 'var(--text-muted)' }}>{translations[lang].remoteCollabLabel}</span>
                  <strong style={{ color: 'var(--text-primary)' }}>
                    {selectedExpertForModal.raw_json?.remote_collaboration === false ? translations[lang].noLabel : translations[lang].yesLabel}
                  </strong>
                </div>
                <div>
                  <span style={{ color: 'var(--text-muted)' }}>{translations[lang].intlPartnershipsLabel}</span>
                  <strong style={{ color: 'var(--text-primary)' }}>
                    {selectedExpertForModal.raw_json?.international_collaboration === false ? translations[lang].noLabel : translations[lang].yesLabel}
                  </strong>
                </div>
              </div>
            </div>

            {/* Skills & Keywords */}
            <div>
              <h4 style={{ fontSize: '1.05rem', color: 'var(--text-primary)', marginBottom: '8px', borderBottom: '1px solid var(--border-color)', paddingBottom: '6px' }}>{translations[lang].skillsInterestsTitle}</h4>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', marginTop: '8px' }}>
                {selectedExpertForModal.skills?.map((skill, sIdx) => (
                  <span key={sIdx} style={{
                    fontSize: '0.75rem',
                    background: 'rgba(6,182,212,0.1)',
                    border: '1px solid rgba(6,182,212,0.2)',
                    padding: '4px 10px',
                    borderRadius: '6px',
                    color: 'var(--color-primary)'
                  }}>
                    {skill}
                  </span>
                ))}
                {selectedExpertForModal.interests?.map((interest, iIdx) => (
                  <span key={iIdx} style={{
                    fontSize: '0.75rem',
                    background: 'rgba(139,92,246,0.1)',
                    border: '1px solid rgba(139,92,246,0.2)',
                    padding: '4px 10px',
                    borderRadius: '6px',
                    color: 'var(--color-secondary)'
                  }}>
                    {interest}
                  </span>
                ))}
              </div>
            </div>

            {/* Publications */}
            {selectedExpertForModal.publications && selectedExpertForModal.publications.length > 0 && (
              <div>
                <h4 style={{ fontSize: '1.05rem', color: 'var(--text-primary)', marginBottom: '8px', borderBottom: '1px solid var(--border-color)', paddingBottom: '6px' }}>{translations[lang].publicationsTitle}</h4>
                <ul style={{ paddingLeft: lang === 'ar' ? 0 : '20px', paddingRight: lang === 'ar' ? '20px' : 0, display: 'flex', flexDirection: 'column', gap: '6px', fontSize: '0.875rem', color: 'var(--text-secondary)' }}>
                  {selectedExpertForModal.publications.map((pub, pIdx) => (
                    <li key={pIdx}>{pub}</li>
                  ))}
                </ul>
              </div>
            )}

            {/* Previous Projects */}
            {selectedExpertForModal.previous_projects && selectedExpertForModal.previous_projects.length > 0 && (
              <div>
                <h4 style={{ fontSize: '1.05rem', color: 'var(--text-primary)', marginBottom: '8px', borderBottom: '1px solid var(--border-color)', paddingBottom: '6px' }}>{translations[lang].previousProjectsTitle}</h4>
                <ul style={{ paddingLeft: lang === 'ar' ? 0 : '20px', paddingRight: lang === 'ar' ? '20px' : 0, display: 'flex', flexDirection: 'column', gap: '6px', fontSize: '0.875rem', color: 'var(--text-secondary)' }}>
                  {selectedExpertForModal.previous_projects.map((prevProj, pIdx) => (
                    <li key={pIdx}>{prevProj}</li>
                  ))}
                </ul>
              </div>
            )}

            {/* Footer buttons */}
            <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end', marginTop: '8px', borderTop: '1px solid var(--border-color)', paddingTop: '20px' }}>
              <button onClick={() => setSelectedExpertForModal(null)} className="btn btn-secondary" style={{ padding: '8px 16px', fontSize: '0.9rem' }}>
                {translations[lang].closeBtn}
              </button>
              <button
                onClick={() => {
                  setSelectedExpertForModal(null)
                  setActivePage('matches')
                }}
                className="btn btn-primary"
                style={{ padding: '8px 16px', fontSize: '0.9rem' }}
              >
                {translations[lang].evaluatePairingsBtn}
              </button>
            </div>

          </div>
        </div>
      )}
      {proposalModalProjectId && (
        <ProposalModal 
          projectId={proposalModalProjectId} 
          onClose={() => setProposalModalProjectId(null)} 
          lang={lang} 
        />
      )}
    </div>
  )
}

export default App
