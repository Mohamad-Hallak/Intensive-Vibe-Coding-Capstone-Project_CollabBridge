import React, { useState, useEffect } from 'react'
import { 
  ShieldAlert, 
  Check, 
  Trash2, 
  AlertTriangle, 
  FileText, 
  Users, 
  Coins, 
  MapPin, 
  BookOpen, 
  Activity, 
  Sparkles,
  Search,
  Briefcase
} from 'lucide-react'

const translations = {
  en: {
    portalTitle: "Admin Moderation Center",
    portalSubtitle: "Review and approve academic research profiles and reconstruction projects before they go public.",
    pendingResearchers: "Pending Researchers ({count})",
    pendingProjects: "Pending Projects ({count})",
    noPending: "No pending moderation requests. All clean!",
    approve: "Approve",
    reject: "Reject & Delete",
    warningsFound: "Moderation Alerts detected:",
    institution: "Institution:",
    country: "Country of Residence:",
    expertise: "Technical Expertise:",
    skills: "Reported Skills:",
    budget: "Funding Budget:",
    location: "Project Location:",
    timeline: "Estimated Timeline:",
    sector: "Category/Sector:",
    approveSuccess: "Item approved and publicized successfully!",
    rejectSuccess: "Item rejected and deleted from database.",
    errorAction: "Failed to update item status. Please try again.",
    safetyBadge: "Security Check",
    tabModeration: "Queue",
    tabAudit: "Safety Policy Log",
    policyGuidelines: "Moderation & Safety Guidelines",
    rule1: "1. No financial details: Delete any profile with explicit IBAN, bank account numbers, or money transfers.",
    rule2: "2. Anti-smuggling & Disarmament: Reject any project containing terms related to illegal trade, smuggling, or weapons.",
    rule3: "3. Authorized Affiliations: Researchers must belong to verified educational or humanitarian organizations."
  },
  ar: {
    portalTitle: "مركز إدارة والموافقة المشرفة",
    portalSubtitle: "مراجعة واعتماد الملفات البحثية ومشاريع إعادة الإعمار قبل نشرها للعامة.",
    pendingResearchers: "الباحثون قيد الانتظار ({count})",
    pendingProjects: "المشاريع قيد الانتظار ({count})",
    noPending: "لا توجد طلبات معلقة حالياً. كل شيء نظيف!",
    approve: "موافقة",
    reject: "رفض وحذف",
    warningsFound: "تنبيهات التدقيق المكتشفة:",
    institution: "الجهة الأكاديمية:",
    country: "بلد الإقامة:",
    expertise: "الخبرة الفنية:",
    skills: "المهارات:",
    budget: "الميزانية المقدرة:",
    location: "موقع المشروع:",
    timeline: "الجدول الزمني:",
    sector: "القطاع:",
    approveSuccess: "تم اعتماد العنصر ونشره للعامة بنجاح!",
    rejectSuccess: "تم رفض العنصر وحذفه نهائياً من قاعدة البيانات.",
    errorAction: "فشلت العملية. يرجى المحاولة مرة أخرى.",
    safetyBadge: "الفحص الأمني",
    tabModeration: "قائمة الانتظار",
    tabAudit: "سجل سياسات الأمان",
    policyGuidelines: "إرشادات الأمان والمراجعة",
    rule1: "١. منع البيانات المالية: حذف أي ملف يحتوي على أرقام حسابات بنكية (IBAN) أو تحويلات مالية صريحة.",
    rule2: "٢. مكافحة التهريب والتسليح: رفض أي مشروع يتضمن مصطلحات متعلقة بالتهريب، الأسلحة أو الصراعات العسكرية.",
    rule3: "٣. الهيئات المصرحة: يجب أن يتبع الباحثون لمؤسسات أكاديمية أو إنسانية معترف بها."
  }
}

function AdminPortal({ lang }) {
  const activeLang = lang || 'en'
  const t = translations[activeLang]

  const [pendingData, setPendingData] = useState({ researchers: [], projects: [] })
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState('moderation')
  const [successMsg, setSuccessMsg] = useState('')
  const [errorMsg, setErrorMsg] = useState('')

  const fetchPending = async () => {
    setLoading(true)
    try {
      const res = await fetch('/api/admin/pending')
      if (res.ok) {
        const data = await res.json()
        setPendingData(data)
      }
    } catch (err) {
      console.error('Error fetching pending items:', err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchPending()
  }, [])

  const handleApprove = async (type, id) => {
    try {
      const endpoint = type === 'researcher' 
        ? `/api/admin/researchers/${id}/approve` 
        : `/api/admin/projects/${id}/approve`
      
      const res = await fetch(endpoint, { method: 'POST' })
      if (res.ok) {
        setSuccessMsg(t.approveSuccess)
        setTimeout(() => setSuccessMsg(''), 3000)
        fetchPending()
      } else {
        setErrorMsg(t.errorAction)
        setTimeout(() => setErrorMsg(''), 3000)
      }
    } catch (err) {
      setErrorMsg(t.errorAction)
      setTimeout(() => setErrorMsg(''), 3000)
    }
  }

  const handleReject = async (type, id) => {
    if (!window.confirm(activeLang === 'ar' ? 'هل أنت متأكد من رفض وحذف هذا العنصر؟' : 'Are you sure you want to reject and delete this item?')) {
      return
    }
    try {
      const endpoint = type === 'researcher' 
        ? `/api/admin/researchers/${id}/reject` 
        : `/api/admin/projects/${id}/reject`
      
      const res = await fetch(endpoint, { method: 'POST' })
      if (res.ok) {
        setSuccessMsg(t.rejectSuccess)
        setTimeout(() => setSuccessMsg(''), 3000)
        fetchPending()
      } else {
        setErrorMsg(t.errorAction)
        setTimeout(() => setErrorMsg(''), 3000)
      }
    } catch (err) {
      setErrorMsg(t.errorAction)
      setTimeout(() => setErrorMsg(''), 3000)
    }
  }

  const totalPending = pendingData.researchers.length + pendingData.projects.length

  return (
    <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      
      {/* Header Banner */}
      <section className="glass-panel" style={{ padding: '32px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '20px' }}>
        <div>
          <h2 style={{ fontSize: '2rem', display: 'flex', alignItems: 'center', gap: '12px' }}>
            <ShieldAlert size={36} color="var(--color-primary)" />
            <span>{t.portalTitle}</span>
          </h2>
          <p style={{ color: 'var(--text-secondary)', marginTop: '8px', maxWidth: '700px' }}>
            {t.portalSubtitle}
          </p>
        </div>
        <div style={{ background: 'var(--grad-primary)', padding: '12px 24px', borderRadius: '12px', textAlign: 'center', boxShadow: 'var(--shadow-glow)' }}>
          <span style={{ fontSize: '1.75rem', fontWeight: 800, color: 'white' }}>{totalPending}</span>
          <p style={{ fontSize: '0.75rem', color: 'rgba(255,255,255,0.8)', textTransform: 'uppercase', fontWeight: 600 }}>
            {activeLang === 'ar' ? 'معلق للمراجعة' : 'Pending Review'}
          </p>
        </div>
      </section>

      {/* Tabs */}
      <section style={{ display: 'flex', gap: '12px', borderBottom: '1px solid var(--border-color)', paddingBottom: '2px' }}>
        <button 
          onClick={() => setActiveTab('moderation')} 
          className={`btn border-0 ${activeTab === 'moderation' ? 'btn-primary' : 'btn-secondary'}`}
          style={{ padding: '8px 16px', borderRadius: '8px' }}
        >
          <Search size={16} />
          <span>{t.tabModeration}</span>
        </button>
        <button 
          onClick={() => setActiveTab('audit')} 
          className={`btn border-0 ${activeTab === 'audit' ? 'btn-primary' : 'btn-secondary'}`}
          style={{ padding: '8px 16px', borderRadius: '8px' }}
        >
          <Activity size={16} />
          <span>{t.tabAudit}</span>
        </button>
      </section>

      {/* Status Notifications */}
      {successMsg && (
        <div className="glass-panel" style={{ padding: '12px 20px', borderLeft: '4px solid var(--color-accent)', color: 'var(--color-accent)', display: 'flex', gap: '8px', alignItems: 'center' }}>
          <Check size={18} />
          <span>{successMsg}</span>
        </div>
      )}
      {errorMsg && (
        <div className="glass-panel" style={{ padding: '12px 20px', borderLeft: '4px solid var(--color-error)', color: 'var(--color-error)', display: 'flex', gap: '8px', alignItems: 'center' }}>
          <AlertTriangle size={18} />
          <span>{errorMsg}</span>
        </div>
      )}

      {loading ? (
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '200px' }}>
          <div style={{ width: '40px', height: '40px', border: '3px solid var(--border-color)', borderTopColor: 'var(--color-primary)', borderRadius: '50%', animation: 'spin 1s linear infinite' }} />
        </div>
      ) : activeTab === 'moderation' ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '40px' }}>
          {totalPending === 0 && (
            <div className="glass-panel" style={{ padding: '48px', textAlign: 'center', color: 'var(--text-secondary)' }}>
              <Check size={48} style={{ color: 'var(--color-accent)', marginBottom: '16px' }} />
              <p style={{ fontSize: '1.1rem' }}>{t.noPending}</p>
            </div>
          )}

          {/* Pending Researchers Section */}
          {pendingData.researchers.length > 0 && (
            <div>
              <h3 style={{ fontSize: '1.25rem', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--text-primary)' }}>
                <Users size={20} color="var(--color-primary)" />
                <span>{t.pendingResearchers.replace('{count}', pendingData.researchers.length)}</span>
              </h3>
              
              <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                {pendingData.researchers.map((res) => (
                  <div key={res.id} className="glass-panel" style={{ padding: '24px', borderLeft: '4px solid var(--color-secondary)' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '16px', marginBottom: '16px' }}>
                      <div>
                        <span style={{ background: 'rgba(139, 92, 246, 0.1)', color: 'var(--color-secondary)', padding: '4px 10px', borderRadius: '20px', fontSize: '0.75rem', fontWeight: 600 }}>
                          {activeLang === 'ar' ? 'ملف باحث' : 'Researcher Profile'}
                        </span>
                        <h4 style={{ fontSize: '1.25rem', color: 'var(--text-primary)', marginTop: '8px' }}>{res.name}</h4>
                        <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>{res.position}</p>
                      </div>
                      
                      <div style={{ display: 'flex', gap: '10px' }}>
                        <button onClick={() => handleApprove('researcher', res.id)} className="btn btn-primary" style={{ padding: '8px 16px', borderRadius: '8px', fontSize: '0.85rem' }}>
                          <Check size={16} />
                          <span>{t.approve}</span>
                        </button>
                        <button onClick={() => handleReject('researcher', res.id)} className="btn btn-secondary" style={{ padding: '8px 16px', borderRadius: '8px', fontSize: '0.85rem', color: 'var(--color-error)', borderColor: 'rgba(239, 68, 68, 0.2)' }}>
                          <Trash2 size={16} />
                          <span>{t.reject}</span>
                        </button>
                      </div>
                    </div>

                    {/* Warning Alerts */}
                    {res.warnings && res.warnings.length > 0 && (
                      <div className="glass-panel animate-pulse" style={{ padding: '16px', marginBottom: '20px', background: 'rgba(245, 158, 11, 0.05)', border: '1px solid rgba(245, 158, 11, 0.3)', borderRadius: '12px' }}>
                        <h5 style={{ color: 'var(--color-warning)', fontSize: '0.875rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '8px' }}>
                          <AlertTriangle size={16} />
                          <span>{t.warningsFound}</span>
                        </h5>
                        <ul style={{ listStyleType: 'none', paddingLeft: activeLang === 'ar' ? 0 : '16px', paddingRight: activeLang === 'ar' ? '16px' : 0, fontSize: '0.85rem', color: 'var(--text-primary)', display: 'flex', flexDirection: 'column', gap: '4px' }}>
                          {res.warnings.map((warn, wIdx) => (
                            <li key={wIdx} style={{ display: 'flex', gap: '6px', color: '#fcd34d' }}>
                              <span>•</span>
                              <span>{warn}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', fontSize: '0.9rem' }}>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                        <div>
                          <strong style={{ color: 'var(--text-secondary)' }}>{t.institution} </strong>
                          <span style={{ color: 'var(--text-primary)' }}>{res.institution}</span>
                        </div>
                        <div>
                          <strong style={{ color: 'var(--text-secondary)' }}>{t.country} </strong>
                          <span style={{ color: 'var(--text-primary)' }}>{res.country}</span>
                        </div>
                        <div>
                          <strong style={{ color: 'var(--text-secondary)' }}>{t.skills} </strong>
                          <span style={{ color: 'var(--text-primary)' }}>{res.skills.join(', ')}</span>
                        </div>
                      </div>
                      <div>
                        <strong style={{ color: 'var(--text-secondary)' }}>{t.expertise} </strong>
                        <p style={{ color: 'var(--text-primary)', marginTop: '4px', lineHeight: '1.5' }}>{res.expertise}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Pending Projects Section */}
          {pendingData.projects.length > 0 && (
            <div>
              <h3 style={{ fontSize: '1.25rem', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--text-primary)' }}>
                <Briefcase size={20} color="var(--color-primary)" />
                <span>{t.pendingProjects.replace('{count}', pendingData.projects.length)}</span>
              </h3>
              
              <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                {pendingData.projects.map((proj) => (
                  <div key={proj.id} className="glass-panel" style={{ padding: '24px', borderLeft: '4px solid var(--color-primary)' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '16px', marginBottom: '16px' }}>
                      <div>
                        <span style={{ background: 'rgba(6, 182, 212, 0.1)', color: 'var(--color-primary)', padding: '4px 10px', borderRadius: '20px', fontSize: '0.75rem', fontWeight: 600 }}>
                          {activeLang === 'ar' ? 'طلب مشروع' : 'Project Registration'}
                        </span>
                        <h4 style={{ fontSize: '1.25rem', color: 'var(--text-primary)', marginTop: '8px' }}>{proj.title}</h4>
                        <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>{proj.organization}</p>
                      </div>
                      
                      <div style={{ display: 'flex', gap: '10px' }}>
                        <button onClick={() => handleApprove('project', proj.id)} className="btn btn-primary" style={{ padding: '8px 16px', borderRadius: '8px', fontSize: '0.85rem' }}>
                          <Check size={16} />
                          <span>{t.approve}</span>
                        </button>
                        <button onClick={() => handleReject('project', proj.id)} className="btn btn-secondary" style={{ padding: '8px 16px', borderRadius: '8px', fontSize: '0.85rem', color: 'var(--color-error)', borderColor: 'rgba(239, 68, 68, 0.2)' }}>
                          <Trash2 size={16} />
                          <span>{t.reject}</span>
                        </button>
                      </div>
                    </div>

                    {/* Warning Alerts */}
                    {proj.warnings && proj.warnings.length > 0 && (
                      <div className="glass-panel animate-pulse" style={{ padding: '16px', marginBottom: '20px', background: 'rgba(245, 158, 11, 0.05)', border: '1px solid rgba(245, 158, 11, 0.3)', borderRadius: '12px' }}>
                        <h5 style={{ color: 'var(--color-warning)', fontSize: '0.875rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '8px' }}>
                          <AlertTriangle size={16} />
                          <span>{t.warningsFound}</span>
                        </h5>
                        <ul style={{ listStyleType: 'none', paddingLeft: activeLang === 'ar' ? 0 : '16px', paddingRight: activeLang === 'ar' ? '16px' : 0, fontSize: '0.85rem', color: 'var(--text-primary)', display: 'flex', flexDirection: 'column', gap: '4px' }}>
                          {proj.warnings.map((warn, wIdx) => (
                            <li key={wIdx} style={{ display: 'flex', gap: '6px', color: '#fcd34d' }}>
                              <span>•</span>
                              <span>{warn}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}

                    <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 0.8fr', gap: '24px', fontSize: '0.9rem' }}>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                        <div>
                          <strong style={{ color: 'var(--text-secondary)' }}>{t.sector} </strong>
                          <span style={{ color: 'var(--text-primary)' }}>{proj.sector}</span>
                        </div>
                        <div>
                          <strong style={{ color: 'var(--text-secondary)' }}>{t.location} </strong>
                          <span style={{ color: 'var(--text-primary)' }}>{proj.location}</span>
                        </div>
                        <div>
                          <strong style={{ color: 'var(--text-secondary)' }}>{t.budget} </strong>
                          <span style={{ color: 'var(--text-primary)' }}>{proj.budget || (activeLang === 'ar' ? 'غير محدد' : 'N/A')}</span>
                        </div>
                        <div>
                          <strong style={{ color: 'var(--text-secondary)' }}>{t.timeline} </strong>
                          <span style={{ color: 'var(--text-primary)' }}>{proj.timeline || (activeLang === 'ar' ? 'غير محدد' : 'N/A')}</span>
                        </div>
                      </div>
                      <div>
                        <strong style={{ color: 'var(--text-secondary)' }}>{activeLang === 'ar' ? 'شرح التحدي:' : 'Problem Description:'} </strong>
                        <p style={{ color: 'var(--text-primary)', marginTop: '4px', lineHeight: '1.5' }}>{proj.description}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      ) : (
        /* Audit Tab */
        <div className="glass-panel" style={{ padding: '32px' }}>
          <h3 style={{ fontSize: '1.5rem', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <ShieldAlert size={24} color="var(--color-primary)" />
            <span>{t.policyGuidelines}</span>
          </h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', color: 'var(--text-secondary)', lineHeight: '1.7', fontSize: '0.95rem' }}>
            <p>{t.rule1}</p>
            <p>{t.rule2}</p>
            <p>{t.rule3}</p>
            
            <div style={{ marginTop: '24px', padding: '20px', border: '1px dashed var(--border-color)', borderRadius: '12px', background: 'rgba(255,255,255,0.01)' }}>
              <h4 style={{ color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '10px' }}>
                <Sparkles size={16} color="var(--color-accent)" />
                <span>{activeLang === 'ar' ? 'كيف يعمل التحقق التلقائي؟' : 'How does Auto-Inspection work?'}</span>
              </h4>
              <p style={{ fontSize: '0.9rem' }}>
                {activeLang === 'ar'
                  ? 'يقوم الخادم بمسح محتوى الطلب تلقائياً وتدقيق الكلمات والأنماط مثل IBAN، والأسلحة، والمنظمات المحظورة. يتم فحص أي سجل جديد معلق بواسطة هذه السياسة قبل أن يقرر المشرفون اعتماده أو حذفه.'
                  : 'The backend automatically parses incoming requests and flags regular expressions matching credit cards, IBAN bank credentials, weapons keywords, or sanctioned affiliations. Items display high-visibility alerts on this moderation dashboard to secure platform integrity.'}
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default AdminPortal
