import React, { useState, useEffect } from 'react'
import { 
  Coins, 
  Search, 
  Check, 
  AlertCircle, 
  MapPin, 
  Briefcase, 
  User, 
  Bell, 
  Globe, 
  Compass, 
  ArrowRight, 
  Calendar,
  Sparkles,
  CheckCircle,
  Eye
} from 'lucide-react'

const translations = {
  en: {
    portalTitle: "Funding Sources Center",
    portalSubtitle: "Connect Syrian reconstruction projects and research initiatives with active international grants, aid packages, and academic funds.",
    tabProjects: "Project Funding Matcher",
    tabResearchers: "Researcher Opportunities & Alerts",
    selectProj: "Select a Reconstruction Project:",
    selectRes: "Select a Researcher Profile:",
    searchBtn: "Launch Funding Agent Search",
    scanningText: "Funding Agent (Agent 11) is scanning active calls and online repositories...",
    opportunitiesTitle: "Matched Funding Opportunities",
    source: "Funding Body:",
    amount: "Funding Amount:",
    deadline: "Application Deadline:",
    reason: "Why this matches:",
    notifyToggle: "Enable automatic email/profile notifications for new matching resources",
    notificationsTitle: "Opportunity Notification Inbox",
    notifStatusRead: "Read",
    notifStatusNew: "New Opportunity",
    noOpportunities: "Select a target above and launch the search agent.",
    markAsRead: "Mark as read",
    noNotifications: "No historical notifications sent yet. Enable alerts and run a search to log matches!",
    successToggle: "Notification preferences updated successfully!",
    errorFetch: "Failed to load database records.",
    agentStep1: "Initializing web crawler for IEEE & United Nations databases...",
    agentStep2: "Extracting semantic project keywords...",
    agentStep3: "Mapping constraints against Horizon Europe & USAID databases...",
    agentStep4: "Compiling optimal funding programs...",
    emailLabel: "Email:",
    whatsappLabel: "WhatsApp:"
  },
  ar: {
    portalTitle: "مركز مصادر التمويل",
    portalSubtitle: "ربط مشاريع إعادة إعمار سوريا والمبادرات البحثية بالمنح الدولية الفعالة، وحزم المساعدات، والتمويل الأكاديمي.",
    tabProjects: "مطابقة تمويل المشاريع",
    tabResearchers: "فرص وتنبيهات الباحثين",
    selectProj: "اختر مشروع إعادة إعمار:",
    selectRes: "اختر ملف باحث أكاديمي:",
    searchBtn: "إطلاق وكيل البحث عن التمويل",
    scanningText: "وكيل التمويل (الوكيل ١١) يقوم بمسح طلبات التمويل وقواعد البيانات النشطة...",
    opportunitiesTitle: "فرص التمويل المطابقة المكتشفة",
    source: "الجهة المانحة:",
    amount: "ميزانية التمويل:",
    deadline: "الموعد النهائي للتقديم:",
    reason: "سبب المطابقة:",
    notifyToggle: "تفعيل التنبيهات التلقائية للملف الشخصي عند توفر مصادر تمويل جديدة",
    notificationsTitle: "صندوق تنبيهات الفرص المتاحة",
    notifStatusRead: "مقروء",
    notifStatusNew: "فرصة جديدة",
    noOpportunities: "اختر مشروعاً أو باحثاً أعلاه لإطلاق وكيل البحث.",
    markAsRead: "تعيين كمقروء",
    noNotifications: "لا توجد تنبيهات مسجلة سابقاً. قم بتفعيل التنبيهات وإجراء بحث لتسجيل الفرص المطابقة!",
    successToggle: "تم تحديث تفضيلات التنبيهات بنجاح!",
    errorFetch: "فشل تحميل سجلات قاعدة البيانات.",
    agentStep1: "جاري تهيئة زاحف الشبكة لقواعد بيانات IEEE والأمم المتحدة...",
    agentStep2: "جاري استخراج الكلمات المفتاحية للمشروع...",
    agentStep3: "مطابقة قيود التمويل مع Horizon Europe وقواعد بيانات USAID...",
    agentStep4: "جاري تجميع برامج التمويل المثلى والمطابقة دلالياً...",
    emailLabel: "البريد الإلكتروني:",
    whatsappLabel: "واتساب:"
  }
}

function FundingSources({ lang }) {
  const activeLang = lang || 'en'
  const t = translations[activeLang]

  const [activeTab, setActiveTab] = useState('projects') // 'projects' or 'researchers'
  
  // Data lists
  const [projects, setProjects] = useState([])
  const [researchers, setResearchers] = useState([])
  
  // Selections
  const [selectedProjectId, setSelectedProjectId] = useState('')
  const [selectedResearcherId, setSelectedResearcherId] = useState('')
  
  // Results
  const [opportunities, setOpportunities] = useState([])
  const [notifications, setNotifications] = useState([])
  
  // UI states
  const [loadingLists, setLoadingLists] = useState(true)
  const [searching, setSearching] = useState(false)
  const [agentStep, setAgentStep] = useState(0)
  const [prefSaving, setPrefSaving] = useState(false)
  const [prefMessage, setPrefMessage] = useState('')

  // Selected object helpers
  const currentResearcher = researchers.find(r => r.id === parseInt(selectedResearcherId))

  useEffect(() => {
    const fetchData = async () => {
      setLoadingLists(true)
      try {
        const [projRes, resRes] = await Promise.all([
          fetch(`/api/projects?lang=${activeLang}`),
          fetch(`/api/researchers?lang=${activeLang}`)
        ])
        
        if (projRes.ok) {
          const projData = await projRes.json()
          setProjects(projData)
          if (projData.length > 0) setSelectedProjectId(projData[0].id.toString())
        }
        if (resRes.ok) {
          const resData = await resRes.json()
          setResearchers(resData)
          if (resData.length > 0) setSelectedResearcherId(resData[0].id.toString())
        }
      } catch (err) {
        console.error("Error loading data sources:", err)
      } finally {
        setLoadingLists(false)
      }
    }
    fetchData()
  }, [activeLang])

  // Fetch notifications for selected researcher
  const fetchNotifications = async (resId) => {
    if (!resId) return
    try {
      const res = await fetch(`/api/funding/notifications/${resId}`)
      if (res.ok) {
        const data = await res.json()
        setNotifications(data)
      }
    } catch (err) {
      console.error("Error fetching notifications:", err)
    }
  }

  useEffect(() => {
    if (activeTab === 'researchers' && selectedResearcherId) {
      fetchNotifications(selectedResearcherId)
      setOpportunities([])
    }
  }, [activeTab, selectedResearcherId])

  const handleSearch = async () => {
    setSearching(true)
    setOpportunities([])
    setAgentStep(0)
    
    // Simulate steps for agent crawler visually
    const stepIntervals = [
      setTimeout(() => setAgentStep(1), 1000),
      setTimeout(() => setAgentStep(2), 2200),
      setTimeout(() => setAgentStep(3), 3500),
      setTimeout(() => setAgentStep(4), 4800)
    ]

    try {
      const param = activeTab === 'projects' 
        ? `project_id=${selectedProjectId}` 
        : `researcher_id=${selectedResearcherId}`
        
      const res = await fetch(`/api/funding/search?${param}`)
      
      // Force loading animation to last at least 5.5 seconds for proper multi-agent search visualization
      await new Promise(resolve => setTimeout(resolve, 5500))
      
      if (res.ok) {
        const data = await res.json()
        setOpportunities(data.opportunities)
        
        // Refresh notifications list if researcher tab
        if (activeTab === 'researchers') {
          fetchNotifications(selectedResearcherId)
        }
      }
    } catch (err) {
      console.error("Funding search failed:", err)
    } finally {
      stepIntervals.forEach(clearTimeout)
      setSearching(false)
    }
  }

  const handleToggleNotifications = async (checked) => {
    if (!currentResearcher) return
    setPrefSaving(true)
    setPrefMessage('')
    try {
      const token = localStorage.getItem('auth_token')
      
      // Update local copy
      const updatedResearcher = {
        ...currentResearcher,
        receive_funding_notifications: checked
      }
      
      const res = await fetch(`/api/profile/researcher?lang=${currentResearcher.lang || lang}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(updatedResearcher)
      })
      
      if (res.ok) {
        setResearchers(prev => prev.map(r => r.id === currentResearcher.id ? { ...r, receive_funding_notifications: checked } : r))
        setPrefMessage(t.successToggle)
        setTimeout(() => setPrefMessage(''), 3000)
      }
    } catch (err) {
      console.error("Error toggling notifications:", err)
    } finally {
      setPrefSaving(false)
    }
  }

  const markNotificationRead = async (notifId) => {
    try {
      const res = await fetch(`/api/funding/notifications/${notifId}/read`, { method: 'POST' })
      if (res.ok) {
        setNotifications(prev => prev.map(n => n.id === notifId ? { ...n, is_read: true } : n))
      }
    } catch (err) {
      console.error("Error marking notification read:", err)
    }
  }

  return (
    <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      
      {/* Header Banner */}
      <section className="glass-panel" style={{ padding: '32px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '20px' }}>
        <div>
          <h2 style={{ fontSize: '2rem', display: 'flex', alignItems: 'center', gap: '12px' }}>
            <Coins size={36} color="var(--color-primary)" />
            <span>{t.portalTitle}</span>
          </h2>
          <p style={{ color: 'var(--text-secondary)', marginTop: '8px', maxWidth: '750px', lineHeight: '1.6' }}>
            {t.portalSubtitle}
          </p>
        </div>
      </section>

      {/* Tabs */}
      <section style={{ display: 'flex', gap: '12px', borderBottom: '1px solid var(--border-color)', paddingBottom: '2px' }}>
        <button 
          onClick={() => { setActiveTab('projects'); setOpportunities([]); }} 
          className={`btn border-0 ${activeTab === 'projects' ? 'btn-primary' : 'btn-secondary'}`}
          style={{ padding: '8px 16px', borderRadius: '8px' }}
        >
          <Briefcase size={16} />
          <span>{t.tabProjects}</span>
        </button>
        <button 
          onClick={() => { setActiveTab('researchers'); setOpportunities([]); }} 
          className={`btn border-0 ${activeTab === 'researchers' ? 'btn-primary' : 'btn-secondary'}`}
          style={{ padding: '8px 16px', borderRadius: '8px' }}
        >
          <User size={16} />
          <span>{t.tabResearchers}</span>
        </button>
      </section>

      {loadingLists ? (
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '200px' }}>
          <div style={{ width: '40px', height: '40px', border: '3px solid var(--border-color)', borderTopColor: 'var(--color-primary)', borderRadius: '50%', animation: 'spin 1s linear infinite' }} />
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '30px' }}>
          
          {/* Controls Selector */}
          <section className="glass-panel" style={{ padding: '24px' }}>
            {activeTab === 'projects' ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  <label style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', fontWeight: 600 }}>{t.selectProj}</label>
                  <select 
                    value={selectedProjectId} 
                    onChange={(e) => { setSelectedProjectId(e.target.value); setOpportunities([]); }}
                    style={{ padding: '12px', backgroundColor: 'rgba(0,0,0,0.5)', border: '1px solid var(--border-color)', borderRadius: '8px', color: 'var(--text-primary)', width: '100%', fontSize: '0.95rem' }}
                  >
                    {projects.map(p => (
                      <option key={p.id} value={p.id}>{p.title} ({p.location})</option>
                    ))}
                  </select>
                </div>
                
                <button 
                  onClick={handleSearch} 
                  disabled={searching || projects.length === 0} 
                  className="btn btn-primary animate-pulse" 
                  style={{ alignSelf: 'flex-start', padding: '12px 24px', borderRadius: '8px', display: 'flex', alignItems: 'center', gap: '8px' }}
                >
                  <Search size={18} />
                  <span>{t.searchBtn}</span>
                </button>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  <label style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', fontWeight: 600 }}>{t.selectRes}</label>
                  <select 
                    value={selectedResearcherId} 
                    onChange={(e) => setSelectedResearcherId(e.target.value)}
                    style={{ padding: '12px', backgroundColor: 'rgba(0,0,0,0.5)', border: '1px solid var(--border-color)', borderRadius: '8px', color: 'var(--text-primary)', width: '100%', fontSize: '0.95rem' }}
                  >
                    {researchers.map(r => (
                      <option key={r.id} value={r.id}>{r.name} - {r.institution} ({r.country})</option>
                    ))}
                  </select>
                </div>

                {/* Notifications toggle for selected researcher */}
                {currentResearcher && (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', padding: '16px', background: 'rgba(255,255,255,0.01)', border: '1px solid var(--border-color)', borderRadius: '12px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                      <input 
                        type="checkbox" 
                        id="funding-notify-toggle"
                        checked={currentResearcher.receive_funding_notifications || false}
                        onChange={(e) => handleToggleNotifications(e.target.checked)}
                        disabled={prefSaving}
                        style={{ width: '18px', height: '18px', cursor: 'pointer', accentColor: 'var(--color-primary)' }}
                      />
                      <label htmlFor="funding-notify-toggle" style={{ fontSize: '0.9rem', color: 'var(--text-primary)', cursor: 'pointer', fontWeight: 500 }}>
                        {t.notifyToggle}
                      </label>
                    </div>
                    {currentResearcher.receive_funding_notifications && (
                      <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', borderTop: '1px dashed var(--border-color)', paddingTop: '10px', marginTop: '4px', display: 'flex', flexDirection: 'column', gap: '4px' }}>
                        <div>
                          <span>{lang === 'ar' ? 'القناة النشطة: ' : 'Active Channel: '}</span>
                          <strong style={{ color: 'var(--color-accent)' }}>
                            {currentResearcher.notification_channel === 'both' ? (lang === 'ar' ? 'البريد وواتساب' : 'Email & WhatsApp') :
                             currentResearcher.notification_channel === 'whatsapp' ? (lang === 'ar' ? 'واتساب' : 'WhatsApp') :
                             (lang === 'ar' ? 'البريد الإلكتروني' : 'Email')}
                          </strong>
                        </div>
                        {currentResearcher.notification_email && (currentResearcher.notification_channel === 'email' || currentResearcher.notification_channel === 'both' || !currentResearcher.notification_channel) && (
                          <div>
                            <span>{t.emailLabel} </span><span style={{ color: 'var(--text-primary)' }}>{currentResearcher.notification_email}</span>
                          </div>
                        )}
                        {currentResearcher.notification_phone && (currentResearcher.notification_channel === 'whatsapp' || currentResearcher.notification_channel === 'both') && (
                          <div>
                            <span>{t.whatsappLabel} </span><span style={{ color: 'var(--text-primary)' }}>{currentResearcher.notification_phone}</span>
                          </div>
                        )}
                      </div>
                    )}
                    {prefMessage && (
                      <span style={{ fontSize: '0.8rem', color: 'var(--color-accent)', display: 'flex', alignItems: 'center', gap: '4px', marginTop: '6px' }}>
                        <CheckCircle size={12} />
                        <span>{prefMessage}</span>
                      </span>
                    )}
                  </div>
                )}
                
                <button 
                  onClick={handleSearch} 
                  disabled={searching || researchers.length === 0} 
                  className="btn btn-primary animate-pulse" 
                  style={{ alignSelf: 'flex-start', padding: '12px 24px', borderRadius: '8px', display: 'flex', alignItems: 'center', gap: '8px' }}
                >
                  <Search size={18} />
                  <span>{t.searchBtn}</span>
                </button>
              </div>
            )}
          </section>

          {/* Search Loader Animation */}
          {searching && (
            <section className="glass-panel" style={{ padding: '40px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '24px', minHeight: '260px', justifyContent: 'center' }}>
              <div style={{ position: 'relative', width: '90px', height: '90px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                {/* Spinning Radar Compass */}
                <div className="agent-node-cyan" style={{
                  width: '64px',
                  height: '64px',
                  borderRadius: '50%',
                  border: '2px dashed var(--color-primary)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  animation: 'spin 4s linear infinite'
                }}>
                  <Compass size={28} style={{ color: 'var(--color-primary)' }} />
                </div>
                {/* Floating data bits */}
                <div className="floating-particle" style={{ left: '10px', top: '15px', width: '5px', height: '5px', animationDelay: '0.3s', '--float-x': '20px' }} />
                <div className="floating-particle" style={{ right: '15px', bottom: '15px', width: '7px', height: '7px', animationDelay: '0.9s', '--float-x': '-15px' }} />
              </div>

              <div style={{ textAlign: 'center' }}>
                <h4 style={{ color: 'var(--text-primary)', fontWeight: 600, fontSize: '1.1rem' }}>{t.scanningText}</h4>
                
                {/* Loading Fill Bar */}
                <div style={{ width: '320px', height: '4px', background: 'rgba(255,255,255,0.05)', borderRadius: '2px', overflow: 'hidden', margin: '14px auto', position: 'relative', border: '1px solid var(--border-color)' }}>
                  <div className="loading-bar-fill" style={{
                    width: '100%',
                    height: '100%',
                    background: 'var(--grad-primary)',
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    borderRadius: '2px'
                  }} />
                </div>
                
                {/* Agent Steps log list */}
                <div style={{ height: '24px', overflow: 'hidden', color: 'var(--text-muted)', fontSize: '0.85rem' }}>
                  <span className="animate-fade-in" key={agentStep}>
                    {agentStep === 0 && t.agentStep1}
                    {agentStep === 1 && t.agentStep2}
                    {agentStep === 2 && t.agentStep3}
                    {agentStep >= 3 && t.agentStep4}
                  </span>
                </div>
              </div>
            </section>
          )}

          {/* Opportunity Display Cards */}
          {!searching && opportunities.length > 0 && (
            <section className="glass-panel" style={{ padding: '30px' }}>
              <h3 style={{ fontSize: '1.35rem', marginBottom: '24px', color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Sparkles size={20} color="var(--color-primary)" />
                <span>{t.opportunitiesTitle}</span>
              </h3>
              
              <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                {opportunities.map((opp, idx) => (
                  <a 
                    key={idx} 
                    href={opp.url || 'https://google.com'} 
                    target="_blank" 
                    rel="noopener noreferrer" 
                    className="glass-panel animate-fade-in" 
                    style={{ 
                      display: 'block',
                      textDecoration: 'none',
                      padding: '24px', 
                      borderLeft: '4px solid var(--color-primary)', 
                      background: 'rgba(255,255,255,0.01)',
                      cursor: 'pointer',
                      transition: 'all 0.2s ease-in-out',
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.transform = 'translateY(-2px)';
                      e.currentTarget.style.boxShadow = '0 8px 30px rgba(6, 182, 212, 0.12)';
                      e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.02)';
                      e.currentTarget.style.borderColor = 'rgba(6, 182, 212, 0.4)';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.transform = 'none';
                      e.currentTarget.style.boxShadow = 'none';
                      e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.01)';
                      e.currentTarget.style.borderColor = 'var(--border-color)';
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '10px', marginBottom: '12px' }}>
                      <h4 style={{ fontSize: '1.2rem', color: 'var(--text-primary)', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <span>{opp.title}</span>
                        <span style={{ fontSize: '0.9rem', color: 'var(--text-muted)' }}>↗</span>
                      </h4>
                      <span style={{ background: 'rgba(6, 182, 212, 0.1)', color: 'var(--color-primary)', padding: '4px 10px', borderRadius: '12px', fontSize: '0.75rem', fontWeight: 600 }}>
                        {opp.source}
                      </span>
                    </div>
                    
                    <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', lineHeight: '1.6', marginBottom: '16px' }}>{opp.description}</p>
                    
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '20px', borderTop: '1px solid var(--border-color)', paddingTop: '14px', fontSize: '0.85rem' }}>
                      <div>
                        <strong style={{ color: 'var(--text-muted)' }}>{t.amount} </strong>
                        <span style={{ color: 'var(--color-accent)', fontWeight: 600 }}>{opp.amount}</span>
                      </div>
                      <div>
                        <strong style={{ color: 'var(--text-muted)' }}>{t.deadline} </strong>
                        <span style={{ color: 'var(--text-primary)' }}>
                          <Calendar size={12} style={{ display: 'inline', margin: '0 4px', verticalAlign: 'middle' }} />
                          {opp.deadline}
                        </span>
                      </div>
                    </div>
                    
                    <div style={{ background: 'rgba(255, 255, 255, 0.02)', padding: '12px 16px', borderRadius: '8px', border: '1px solid var(--border-color)', marginTop: '14px', fontSize: '0.85rem' }}>
                      <strong style={{ color: 'var(--text-secondary)' }}>{t.reason} </strong>
                      <span style={{ color: 'var(--text-primary)' }}>{opp.match_reason}</span>
                    </div>
                  </a>
                ))}
              </div>
            </section>
          )}

          {/* Notifications Inbox (Researcher Tab only) */}
          {!searching && activeTab === 'researchers' && (
            <section className="glass-panel" style={{ padding: '30px' }}>
              <h3 style={{ fontSize: '1.35rem', marginBottom: '20px', color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Bell size={20} color="var(--color-secondary)" />
                <span>{t.notificationsTitle}</span>
              </h3>

              {notifications.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '30px', color: 'var(--text-muted)' }}>
                  <Bell size={32} style={{ margin: '0 auto 12px', opacity: 0.15 }} />
                  <p style={{ fontSize: '0.9rem' }}>{t.noNotifications}</p>
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  {notifications.map((notif) => (
                    <div 
                      key={notif.id} 
                      className="glass-panel" 
                      style={{ 
                        padding: '16px 20px', 
                        display: 'flex', 
                        justifyContent: 'space-between', 
                        alignItems: 'center', 
                        background: notif.is_read ? 'rgba(255,255,255,0.01)' : 'rgba(139, 92, 246, 0.03)', 
                        borderLeft: `4px solid ${notif.is_read ? 'rgba(255,255,255,0.1)' : 'var(--color-secondary)'}`
                      }}
                    >
                      <div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                          <span style={{ 
                            fontSize: '0.7rem', 
                            padding: '2px 6px', 
                            borderRadius: '4px', 
                            backgroundColor: notif.is_read ? 'rgba(255,255,255,0.05)' : 'rgba(139, 92, 246, 0.15)',
                            color: notif.is_read ? 'var(--text-secondary)' : '#c084fc',
                            fontWeight: 600
                          }}>
                            {notif.is_read ? t.notifStatusRead : t.notifStatusNew}
                          </span>
                          <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                            {new Date(notif.sent_at).toLocaleDateString()}
                          </span>
                        </div>
                        <h4 style={{ color: 'var(--text-primary)', fontSize: '0.95rem', fontWeight: 600 }}>{notif.opportunity_title}</h4>
                        <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{t.source} {notif.opportunity_source}</span>
                      </div>
                      
                      {!notif.is_read && (
                        <button 
                          onClick={() => markNotificationRead(notif.id)} 
                          className="btn btn-secondary" 
                          style={{ padding: '6px 12px', fontSize: '0.75rem', display: 'flex', alignItems: 'center', gap: '4px' }}
                        >
                          <Eye size={12} />
                          <span>{t.markAsRead}</span>
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </section>
          )}

          {/* Initial State Placeholder */}
          {!searching && opportunities.length === 0 && (activeTab === 'projects' || notifications.length === 0) && (
            <div className="glass-panel" style={{ padding: '40px', textAlign: 'center', color: 'var(--text-muted)' }}>
              <Globe size={40} style={{ margin: '0 auto 12px', color: 'rgba(255,255,255,0.1)' }} />
              <p style={{ fontSize: '0.9rem' }}>{t.noOpportunities}</p>
            </div>
          )}

        </div>
      )}
    </div>
  )
}

export default FundingSources
