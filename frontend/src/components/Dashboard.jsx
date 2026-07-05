import React, { useState, useEffect } from 'react'
import { 
  Building2, 
  Users, 
  Cpu, 
  ChevronRight, 
  MapPin, 
  Calendar,
  AlertCircle,
  X,
  ClipboardList
} from 'lucide-react'

const translations = {
  en: {
    welcomeTitle: "Empowering Post-War Syria's Reconstruction Through AI 🤝",
    welcomeDesc: "CollabBridge AI matches local and international researchers with urgent developmental challenges. Begin by launching an intake interview, or explore active pairings.",
    registerProjBtn: "Register Reconstruction Project",
    registerResBtn: "Register as Researcher",
    statsActiveProjects: "Active Projects",
    statsRegisteredExperts: "Registered Experts",
    statsMatchesAnalyzed: "Active Matches Analyzed",
    searchProjPlaceholder: "Search projects by title, sector, keyword...",
    searchExpPlaceholder: "Search experts by name, institution, expertise, skills...",
    allSectors: "All Sectors",
    allPriorities: "All Priorities",
    allLocations: "All Locations",
    allCountries: "All Countries",
    allAvailabilities: "All Availabilities",
    allInstitutions: "All Institutions",
    allPositions: "All Positions",
    allOrigins: "All Origins",
    diasporaOnly: "Diaspora Only",
    localOnly: "Local Syrian Only",
    resetFilters: "Reset Filters",
    urgentProjectsHeader: "Urgent Reconstruction Projects",
    registeredExpertsHeader: "Registered Academic & Technical Experts",
    exploreAllPairings: "Explore All Pairings",
    evaluateMatches: "Evaluate Matches",
    viewProfileDetails: "View Profile Details",
    loadingText: "Loading Dashboard Analytics...",
    prefers: "Prefers:",
    projects: "Projects",
    timeline: "Timeline:",
    priorityLabel: "Priority",
    noProjectsText: "No reconstruction projects match your filter settings. Try adjusting search queries or resetting filters!",
    noExpertsText: "No registered experts match your search query. Try adjusting your keyword or seeding the database!",
    expertFallback: "Expert",
    availableFallback: "Available",
    atConnector: "at"
  },
  ar: {
    welcomeTitle: "تمكين إعادة إعمار سوريا بعد الحرب من خلال الذكاء الاصطناعي 🤝",
    welcomeDesc: "منصة CollabBridge AI تطابق الباحثين المحليين والدوليين مع التحديات التنموية الملحة في سوريا. ابدأ بإجراء مقابلة تسجيل، أو استكشف المطابقات الحالية.",
    registerProjBtn: "تسجيل مشروع إعادة إعمار",
    registerResBtn: "سجل كباحث أكاديمي",
    statsActiveProjects: "المشاريع النشطة",
    statsRegisteredExperts: "الخبراء المسجلون",
    statsMatchesAnalyzed: "المطابقات النشطة التي تم تحليلها",
    searchProjPlaceholder: "ابحث عن مشاريع بالعنوان، القطاع، أو الموقع...",
    searchExpPlaceholder: "ابحث عن خبراء بالاسم، المؤسسة، الخبرة، المهارات...",
    allSectors: "جميع القطاعات",
    allPriorities: "جميع الأولويات",
    allLocations: "جميع المواقع",
    allCountries: "جميع البلدان",
    allAvailabilities: "جميع مستويات التوفر",
    allInstitutions: "جميع المؤسسات الأكاديمية",
    allPositions: "جميع المناصب الأكاديمية",
    allOrigins: "مكان الإقامة / الأصل",
    diasporaOnly: "الخبراء المغتربون فقط",
    localOnly: "الخبراء المحليون فقط",
    resetFilters: "إعادة ضبط الفلاتر",
    urgentProjectsHeader: "مشاريع إعادة الإعمار الملحة",
    registeredExpertsHeader: "الخبراء الأكاديميون والتقنيون المسجلون",
    exploreAllPairings: "استكشاف جميع المطابقات",
    evaluateMatches: "تقييم المطابقات",
    viewProfileDetails: "عرض تفاصيل الملف الشخصي",
    loadingText: "جاري تحميل تحليلات لوحة التحكم...",
    prefers: "يفضل:",
    projects: "مشاريع",
    timeline: "الجدول الزمني:",
    priorityLabel: "أولوية",
    noProjectsText: "لا توجد مشاريع إعادة إعمار تطابق إعدادات الفلتر الخاصة بك. حاول تعديل البحث أو إعادة ضبط الفلاتر!",
    noExpertsText: "لا يوجد خبراء مسجلون يطابقون استعلام البحث الخاص بك. حاول تعديل الكلمات المفتاحية!",
    expertFallback: "خبير",
    availableFallback: "متاح",
    atConnector: "في"
  }
}

function Dashboard({ setActivePage, setSelectedProjectId, setSelectedExpertForModal, lang }) {
  const activeLang = lang || 'en'
  const t = translations[activeLang]

  const [stats, setStats] = useState({
    total_researchers: 0,
    total_projects: 0,
    total_matches_computed: 0
  })
  const [projects, setProjects] = useState([])
  const [experts, setExperts] = useState([])
  const [loading, setLoading] = useState(true)

  // View state: 'projects' or 'experts'
  const [currentView, setCurrentView] = useState('projects')

  // Filter States
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedSector, setSelectedSector] = useState('All')
  const [selectedPriority, setSelectedPriority] = useState('All')
  const [selectedLocation, setSelectedLocation] = useState('All')
  const [selectedExpertCountry, setSelectedExpertCountry] = useState('All')
  const [selectedExpertAvailability, setSelectedExpertAvailability] = useState('All')
  const [selectedExpertInstitution, setSelectedExpertInstitution] = useState('All')
  const [selectedExpertPosition, setSelectedExpertPosition] = useState('All')
  const [selectedExpertOrigin, setSelectedExpertOrigin] = useState('All')

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true)
      try {
        // Fetch stats
        const statsRes = await fetch(`/api/analytics?lang=${activeLang}`)
        if (statsRes.ok) {
          const data = await statsRes.json()
          setStats(data.summary)
        }
        
        // Fetch projects
        const projRes = await fetch(`/api/projects?lang=${activeLang}`)
        if (projRes.ok) {
          const data = await projRes.json()
          setProjects(data)
        }

        // Fetch experts
        const expRes = await fetch(`/api/researchers?lang=${activeLang}`)
        if (expRes.ok) {
          const data = await expRes.json()
          setExperts(data)
        }
      } catch (err) {
        console.error('Error fetching dashboard data:', err)
      } finally {
        setLoading(false)
      }
    }
    fetchData()
  }, [activeLang])

  // Derived filter options
  const uniqueSectors = ['All', ...new Set(projects.map(p => p.sector))]
  const uniqueLocations = ['All', ...new Set(projects.map(p => p.location))]
  const uniqueCountries = ['All', ...new Set(experts.map(e => e.country))]
  const uniqueInstitutions = ['All', ...new Set(experts.map(e => e.institution))]
  const uniquePositions = ['All', ...new Set(experts.map(e => e.position || t.expertFallback))]

  // Filter Projects logic
  const filteredProjects = projects.filter(proj => {
    const matchesSearch = searchQuery.trim() === '' || 
      proj.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      proj.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      proj.sector.toLowerCase().includes(searchQuery.toLowerCase()) ||
      proj.location.toLowerCase().includes(searchQuery.toLowerCase())

    const matchesSector = selectedSector === 'All' || proj.sector === selectedSector
    const matchesPriority = selectedPriority === 'All' || proj.priority === selectedPriority
    const matchesLocation = selectedLocation === 'All' || proj.location === selectedLocation

    return matchesSearch && matchesSector && matchesPriority && matchesLocation
  })

  // Filter Experts logic
  const filteredExperts = experts.filter(expert => {
    const matchesSearch = searchQuery.trim() === '' || 
      expert.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      expert.expertise.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (expert.skills && expert.skills.some(s => s.toLowerCase().includes(searchQuery.toLowerCase()))) ||
      (expert.interests && expert.interests.some(i => i.toLowerCase().includes(searchQuery.toLowerCase())))

    const matchesCountry = selectedExpertCountry === 'All' || expert.country === selectedExpertCountry
    const matchesAvailability = selectedExpertAvailability === 'All' || expert.availability === selectedExpertAvailability
    const matchesInstitution = selectedExpertInstitution === 'All' || expert.institution === selectedExpertInstitution
    const matchesPosition = selectedExpertPosition === 'All' || (expert.position || t.expertFallback) === selectedExpertPosition

    // Diaspora origin filtering logic
    let matchesOrigin = true
    if (selectedExpertOrigin === 'Diaspora') {
      matchesOrigin = expert.is_syrian_diaspora === true || expert.is_syrian_diaspora === 'true' || (expert.is_syrian_diaspora === undefined && expert.country.toLowerCase() !== 'syria')
    } else if (selectedExpertOrigin === 'Local') {
      matchesOrigin = !(expert.is_syrian_diaspora === true || expert.is_syrian_diaspora === 'true') && (expert.is_syrian_diaspora !== undefined || expert.country.toLowerCase() === 'syria')
    }

    return matchesSearch && matchesCountry && matchesAvailability && matchesInstitution && matchesPosition && matchesOrigin
  })

  // Reset all filters
  const resetFilters = () => {
    setSearchQuery('')
    setSelectedSector('All')
    setSelectedPriority('All')
    setSelectedLocation('All')
    setSelectedExpertCountry('All')
    setSelectedExpertAvailability('All')
    setSelectedExpertInstitution('All')
    setSelectedExpertPosition('All')
    setSelectedExpertOrigin('All')
  }

  // Toggle current View (Active Projects or Registered Experts)
  const handleViewChange = (view) => {
    setCurrentView(view)
    resetFilters()
    setTimeout(() => {
      document.getElementById('explore-section')?.scrollIntoView({ behavior: 'smooth' })
    }, 100)
  }

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '400px', flexDirection: 'column', gap: '16px' }}>
        <div style={{ width: '40px', height: '40px', border: '3px solid var(--border-color)', borderTopColor: 'var(--color-primary)', borderRadius: '50%', animation: 'spin 1s linear infinite' }} />
        <p style={{ color: 'var(--text-secondary)' }}>{t.loadingText}</p>
      </div>
    )
  }

  return (
    <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
      
      {/* Welcome Banner */}
      <section className="glass-panel" style={{ padding: '32px', background: 'linear-gradient(135deg, rgba(6,182,212,0.15) 0%, rgba(139,92,246,0.1) 100%)', position: 'relative', overflow: 'hidden' }}>
        <div style={{ position: 'relative', zIndex: 2 }}>
          <h2 style={{ fontSize: '1.75rem', marginBottom: '8px' }}>{t.welcomeTitle}</h2>
          <p style={{ color: 'var(--text-secondary)', maxWidth: '800px', marginBottom: '20px' }}>
            {t.welcomeDesc}
          </p>
          <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
            <button onClick={() => setActivePage('chat_project')} className="btn btn-primary">
              <Building2 size={16} />
              <span>{t.registerProjBtn}</span>
            </button>
            <button onClick={() => setActivePage('chat_researcher')} className="btn btn-secondary">
              <Users size={16} />
              <span>{t.registerResBtn}</span>
            </button>
          </div>
        </div>
      </section>

      {/* Stats Grid */}
      <section className="grid-cols-3">
        {/* Active Projects Stat Card */}
        <div 
          onClick={() => handleViewChange('projects')}
          className="stat-card glass-panel"
          style={{ 
            cursor: 'pointer',
            border: currentView === 'projects' ? '1px solid var(--color-primary)' : '1px solid var(--border-color)',
            boxShadow: currentView === 'projects' ? '0 0 15px rgba(6, 182, 212, 0.2)' : 'var(--shadow-lg)',
            transition: 'all 0.2s ease',
            transform: currentView === 'projects' ? 'scale(1.02)' : 'none'
          }}
        >
          <div>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>{t.statsActiveProjects}</p>
            <span className="stat-val">{stats.total_projects}</span>
          </div>
          <Building2 size={36} color="var(--color-primary)" style={{ opacity: 0.8 }} />
        </div>

        {/* Registered Experts Stat Card */}
        <div 
          onClick={() => handleViewChange('experts')}
          className="stat-card glass-panel"
          style={{ 
            cursor: 'pointer',
            border: currentView === 'experts' ? '1px solid var(--color-secondary)' : '1px solid var(--border-color)',
            boxShadow: currentView === 'experts' ? '0 0 15px rgba(139, 92, 246, 0.2)' : 'var(--shadow-lg)',
            transition: 'all 0.2s ease',
            transform: currentView === 'experts' ? 'scale(1.02)' : 'none'
          }}
        >
          <div>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>{t.statsRegisteredExperts}</p>
            <span className="stat-val">{stats.total_researchers}</span>
          </div>
          <Users size={36} color="var(--color-secondary)" style={{ opacity: 0.8 }} />
        </div>

        {/* Active Matches Stat Card */}
        <div className="stat-card glass-panel">
          <div>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>{t.statsMatchesAnalyzed}</p>
            <span className="stat-val">{stats.total_matches_computed}</span>
          </div>
          <Cpu size={36} color="var(--color-accent)" style={{ opacity: 0.8 }} />
        </div>
      </section>

      {/* Filter and Search Bar */}
      <section id="explore-section" className="glass-panel" style={{ padding: '20px 24px', display: 'flex', gap: '16px', flexWrap: 'wrap', alignItems: 'center' }}>
        {/* Search */}
        <div style={{ flexGrow: 1, minWidth: '240px' }}>
          <input 
            type="text" 
            placeholder={
              currentView === 'projects' 
                ? t.searchProjPlaceholder 
                : t.searchExpPlaceholder
            }
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            style={{
              width: '100%',
              padding: '10px 16px',
              background: 'rgba(255,255,255,0.05)',
              border: '1px solid var(--border-color)',
              borderRadius: '8px',
              color: 'var(--text-primary)',
              outline: 'none',
              fontSize: '0.9rem',
              transition: 'border-color 0.2s ease'
            }}
          />
        </div>

        {currentView === 'projects' && (
          <>
            {/* Sector */}
            <div style={{ minWidth: '160px' }}>
              <select 
                value={selectedSector}
                onChange={(e) => setSelectedSector(e.target.value)}
                style={{
                  width: '100%',
                  padding: '10px 14px',
                  background: 'rgba(255,255,255,0.05)',
                  border: '1px solid var(--border-color)',
                  borderRadius: '8px',
                  color: 'var(--text-primary)',
                  outline: 'none',
                  cursor: 'pointer',
                  fontSize: '0.9rem'
                }}
              >
                <option value="All" style={{ background: 'var(--bg-surface-solid)' }}>{t.allSectors}</option>
                {uniqueSectors.filter(s => s !== 'All').map(s => (
                  <option key={s} value={s} style={{ background: 'var(--bg-surface-solid)' }}>{s}</option>
                ))}
              </select>
            </div>

            {/* Priority */}
            <div style={{ minWidth: '150px' }}>
              <select 
                value={selectedPriority}
                onChange={(e) => setSelectedPriority(e.target.value)}
                style={{
                  width: '100%',
                  padding: '10px 14px',
                  background: 'rgba(255,255,255,0.05)',
                  border: '1px solid var(--border-color)',
                  borderRadius: '8px',
                  color: 'var(--text-primary)',
                  outline: 'none',
                  cursor: 'pointer',
                  fontSize: '0.9rem'
                }}
              >
                <option value="All" style={{ background: 'var(--bg-surface-solid)' }}>{t.allPriorities}</option>
                <option value="High" style={{ background: 'var(--bg-surface-solid)' }}>{activeLang === 'ar' ? 'أولوية عالية' : 'High Priority'}</option>
                <option value="Medium" style={{ background: 'var(--bg-surface-solid)' }}>{activeLang === 'ar' ? 'أولوية متوسطة' : 'Medium Priority'}</option>
                <option value="Low" style={{ background: 'var(--bg-surface-solid)' }}>{activeLang === 'ar' ? 'أولوية منخفضة' : 'Low Priority'}</option>
              </select>
            </div>

            {/* Location */}
            <div style={{ minWidth: '160px' }}>
              <select 
                value={selectedLocation}
                onChange={(e) => setSelectedLocation(e.target.value)}
                style={{
                  width: '100%',
                  padding: '10px 14px',
                  background: 'rgba(255,255,255,0.05)',
                  border: '1px solid var(--border-color)',
                  borderRadius: '8px',
                  color: 'var(--text-primary)',
                  outline: 'none',
                  cursor: 'pointer',
                  fontSize: '0.9rem'
                }}
              >
                <option value="All" style={{ background: 'var(--bg-surface-solid)' }}>{t.allLocations}</option>
                {uniqueLocations.filter(l => l !== 'All').map(l => (
                  <option key={l} value={l} style={{ background: 'var(--bg-surface-solid)' }}>{l}</option>
                ))}
              </select>
            </div>
          </>
        )}

        {currentView === 'experts' && (
          <>
            {/* Country */}
            <div style={{ minWidth: '140px' }}>
              <select 
                value={selectedExpertCountry}
                onChange={(e) => setSelectedExpertCountry(e.target.value)}
                style={{
                  width: '100%',
                  padding: '10px 14px',
                  background: 'rgba(255,255,255,0.05)',
                  border: '1px solid var(--border-color)',
                  borderRadius: '8px',
                  color: 'var(--text-primary)',
                  outline: 'none',
                  cursor: 'pointer',
                  fontSize: '0.9rem'
                }}
              >
                <option value="All" style={{ background: 'var(--bg-surface-solid)' }}>{t.allCountries}</option>
                {uniqueCountries.filter(c => c !== 'All').map(c => (
                  <option key={c} value={c} style={{ background: 'var(--bg-surface-solid)' }}>{c}</option>
                ))}
              </select>
            </div>

            {/* Availability */}
            <div style={{ minWidth: '140px' }}>
              <select 
                value={selectedExpertAvailability}
                onChange={(e) => setSelectedExpertAvailability(e.target.value)}
                style={{
                  width: '100%',
                  padding: '10px 14px',
                  background: 'rgba(255,255,255,0.05)',
                  border: '1px solid var(--border-color)',
                  borderRadius: '8px',
                  color: 'var(--text-primary)',
                  outline: 'none',
                  cursor: 'pointer',
                  fontSize: '0.9rem'
                }}
              >
                <option value="All" style={{ background: 'var(--bg-surface-solid)' }}>{t.allAvailabilities}</option>
                <option value="Available" style={{ background: 'var(--bg-surface-solid)' }}>{activeLang === 'ar' ? 'متاح' : 'Available'}</option>
                <option value="Busy" style={{ background: 'var(--bg-surface-solid)' }}>{activeLang === 'ar' ? 'مشغول' : 'Busy'}</option>
                <option value="Unavailable" style={{ background: 'var(--bg-surface-solid)' }}>{activeLang === 'ar' ? 'غير متاح' : 'Unavailable'}</option>
              </select>
            </div>

            {/* Institution */}
            <div style={{ minWidth: '140px' }}>
              <select 
                value={selectedExpertInstitution}
                onChange={(e) => setSelectedExpertInstitution(e.target.value)}
                style={{
                  width: '100%',
                  padding: '10px 14px',
                  background: 'rgba(255,255,255,0.05)',
                  border: '1px solid var(--border-color)',
                  borderRadius: '8px',
                  color: 'var(--text-primary)',
                  outline: 'none',
                  cursor: 'pointer',
                  fontSize: '0.9rem'
                }}
              >
                <option value="All" style={{ background: 'var(--bg-surface-solid)' }}>{t.allInstitutions}</option>
                {uniqueInstitutions.filter(inst => inst !== 'All').map(inst => (
                  <option key={inst} value={inst} style={{ background: 'var(--bg-surface-solid)' }}>{inst}</option>
                ))}
              </select>
            </div>

            {/* Position */}
            <div style={{ minWidth: '140px' }}>
              <select 
                value={selectedExpertPosition}
                onChange={(e) => setSelectedExpertPosition(e.target.value)}
                style={{
                  width: '100%',
                  padding: '10px 14px',
                  background: 'rgba(255,255,255,0.05)',
                  border: '1px solid var(--border-color)',
                  borderRadius: '8px',
                  color: 'var(--text-primary)',
                  outline: 'none',
                  cursor: 'pointer',
                  fontSize: '0.9rem'
                }}
              >
                <option value="All" style={{ background: 'var(--bg-surface-solid)' }}>{t.allPositions}</option>
                {uniquePositions.filter(p => p !== 'All').map(p => (
                  <option key={p} value={p} style={{ background: 'var(--bg-surface-solid)' }}>{p}</option>
                ))}
              </select>
            </div>

            {/* Diaspora */}
            <div style={{ minWidth: '150px' }}>
              <select 
                value={selectedExpertOrigin}
                onChange={(e) => setSelectedExpertOrigin(e.target.value)}
                style={{
                  width: '100%',
                  padding: '10px 14px',
                  background: 'rgba(255,255,255,0.05)',
                  border: '1px solid var(--border-color)',
                  borderRadius: '8px',
                  color: 'var(--text-primary)',
                  outline: 'none',
                  cursor: 'pointer',
                  fontSize: '0.9rem'
                }}
              >
                <option value="All" style={{ background: 'var(--bg-surface-solid)' }}>{t.allOrigins}</option>
                <option value="Diaspora" style={{ background: 'var(--bg-surface-solid)' }}>{t.diasporaOnly}</option>
                <option value="Local" style={{ background: 'var(--bg-surface-solid)' }}>{t.localOnly}</option>
              </select>
            </div>
          </>
        )}

        {/* Reset Button */}
        <button 
          onClick={resetFilters} 
          className="btn btn-secondary animate-fade-in"
          style={{ padding: '10px 16px', fontSize: '0.9rem', borderRadius: '8px' }}
        >
          {t.resetFilters}
        </button>
      </section>

      {/* Main Grid: Projects Preview or Experts Preview */}
      {currentView === 'projects' ? (
        <section style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <h3 style={{ fontSize: '1.25rem' }}>
              {t.urgentProjectsHeader} ({filteredProjects.length})
            </h3>
            <button 
              onClick={() => setActivePage('matches')}
              className="btn btn-secondary" 
              style={{ padding: '6px 12px', fontSize: '0.85rem' }}
            >
              <span>{t.exploreAllPairings}</span>
              <ChevronRight size={14} style={{ transform: activeLang === 'ar' ? 'scaleX(-1)' : 'none' }} />
            </button>
          </div>

          {filteredProjects.length === 0 ? (
            <div className="glass-panel" style={{ padding: '40px', textAlign: 'center', color: 'var(--text-secondary)' }}>
              <AlertCircle size={24} style={{ marginBottom: '8px' }} />
              <p>{t.noProjectsText}</p>
            </div>
          ) : (
            <div className="grid-cols-2">
              {filteredProjects.map(proj => (
                <div key={proj.id} className="glass-panel" style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '12px' }}>
                    <span style={{ 
                      fontSize: '0.75rem', 
                      padding: '4px 8px', 
                      borderRadius: '20px', 
                      background: 'rgba(6,182,212,0.1)', 
                      color: 'var(--color-primary)', 
                      border: '1px solid rgba(6,182,212,0.2)',
                      fontWeight: 600
                    }}>
                      {proj.sector}
                    </span>
                    <span style={{
                      fontSize: '0.75rem',
                      color: proj.priority === 'High' ? 'var(--color-error)' : 'var(--text-secondary)',
                      fontWeight: 600
                    }}>
                      ● {proj.priority === 'High' ? (activeLang === 'ar' ? 'أولوية عالية' : 'High Priority') : 
                          proj.priority === 'Medium' ? (activeLang === 'ar' ? 'أولوية متوسطة' : 'Medium Priority') : 
                          (activeLang === 'ar' ? 'أولوية منخفضة' : 'Low Priority')}
                    </span>
                  </div>

                  <div style={{ flexGrow: 1 }}>
                    <h4 style={{ fontSize: '1.1rem', marginBottom: '8px', lineHeight: 1.3 }}>{proj.title}</h4>
                    <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem', display: '-webkit-box', WebkitLineClamp: 3, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                      {proj.description}
                    </p>
                  </div>

                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.8rem', color: 'var(--text-muted)', borderTop: '1px solid var(--border-color)', paddingTop: '12px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                      <MapPin size={12} />
                      <span>{proj.location}</span>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                      <Calendar size={12} />
                      <span>{t.timeline} {proj.timeline}</span>
                    </div>
                  </div>

                  <button 
                    onClick={() => {
                      setSelectedProjectId(String(proj.id))
                      setActivePage('matches')
                    }} 
                    className="btn btn-primary"
                    style={{ width: '100%', padding: '8px 16px', fontSize: '0.85rem', borderRadius: '8px' }}
                  >
                    <span>{t.evaluateMatches}</span>
                    <ChevronRight size={14} style={{ transform: activeLang === 'ar' ? 'scaleX(-1)' : 'none' }} />
                  </button>
                </div>
              ))}
            </div>
          )}
        </section>
      ) : (
        <section style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <h3 style={{ fontSize: '1.25rem' }}>
              {t.registeredExpertsHeader} ({filteredExperts.length})
            </h3>
            <button 
              onClick={() => setActivePage('matches')}
              className="btn btn-secondary" 
              style={{ padding: '6px 12px', fontSize: '0.85rem' }}
            >
              <span>{t.exploreAllPairings}</span>
              <ChevronRight size={14} style={{ transform: activeLang === 'ar' ? 'scaleX(-1)' : 'none' }} />
            </button>
          </div>

          {filteredExperts.length === 0 ? (
            <div className="glass-panel" style={{ padding: '40px', textAlign: 'center', color: 'var(--text-secondary)' }}>
              <AlertCircle size={24} style={{ marginBottom: '8px' }} />
              <p>{t.noExpertsText}</p>
            </div>
          ) : (
            <div className="grid-cols-2">
              {filteredExperts.map(expert => (
                <div key={expert.id} className="glass-panel animate-fade-in" style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '12px' }}>
                    <span style={{ 
                      fontSize: '0.75rem', 
                      padding: '4px 8px', 
                      borderRadius: '20px', 
                      background: 'rgba(139,92,246,0.1)', 
                      color: 'var(--color-secondary)', 
                      border: '1px solid rgba(139,92,246,0.2)',
                      fontWeight: 600
                    }}>
                      {expert.position || t.expertFallback}
                    </span>
                    <span style={{
                      fontSize: '0.75rem',
                      color: 'var(--color-accent)',
                      fontWeight: 600
                    }}>
                      ● {expert.availability || t.availableFallback}
                    </span>
                  </div>

                  <div style={{ flexGrow: 1 }}>
                    <h4 style={{ fontSize: '1.1rem', marginBottom: '4px', lineHeight: 1.3 }}>{expert.name}</h4>
                    <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', marginBottom: '8px' }}>
                      {expert.department} {t.atConnector} {expert.institution}
                    </p>
                    <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem', display: '-webkit-box', WebkitLineClamp: 3, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                      {expert.expertise}
                    </p>
                  </div>

                  {expert.skills && expert.skills.length > 0 && (
                    <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', marginTop: '4px' }}>
                      {expert.skills.slice(0, 4).map((skill, sIdx) => (
                        <span key={sIdx} style={{
                          fontSize: '0.7rem',
                          background: 'rgba(255,255,255,0.05)',
                          border: '1px solid var(--border-color)',
                          padding: '2px 8px',
                          borderRadius: '4px',
                          color: 'var(--text-secondary)'
                        }}>
                          {skill}
                        </span>
                      ))}
                    </div>
                  )}

                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.8rem', color: 'var(--text-muted)', borderTop: '1px solid var(--border-color)', paddingTop: '12px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                      <MapPin size={12} />
                      <span>{expert.country}</span>
                    </div>
                    {expert.preferred_collaborations && expert.preferred_collaborations.length > 0 && (
                      <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                        <span>{t.prefers} {expert.preferred_collaborations[0]} {t.projects}</span>
                      </div>
                    )}
                  </div>

                  <button 
                    onClick={() => {
                      setSelectedExpertForModal(expert)
                    }} 
                    className="btn btn-secondary"
                    style={{ width: '100%', padding: '8px 16px', fontSize: '0.85rem', borderRadius: '8px' }}
                  >
                    <span>{t.viewProfileDetails}</span>
                    <ClipboardList size={14} />
                  </button>
                </div>
              ))}
            </div>
          )}
        </section>
      )}
    </div>
  )
}

export default Dashboard
