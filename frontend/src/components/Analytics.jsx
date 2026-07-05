import React, { useState, useEffect } from 'react'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend, Cell } from 'recharts'
import { BarChart3, Globe, Heart, Shield, RefreshCw } from 'lucide-react'

const COLORS = ['#06b6d4', '#8b5cf6', '#10b981', '#f59e0b', '#3b82f6', '#ec4899', '#f97316', '#14b8a6']

const translations = {
  en: {
    loading: 'Loading analytics charts...',
    noData: 'No analytics data available. Please click "Seed Demo Data" in the sidebar to populate records.',
    sectorsTitle: 'Reconstruction Projects by Sector',
    sdgsTitle: 'Project Alignment with UN SDGs',
    countriesTitle: 'Expert Geographic Origin',
    skillsTitle: 'Top Technical Competencies',
    noChartData: 'No data',
    collabTitle: 'Active Institution Collaborations',
    collabDesc: 'Real-time tracking of active academic pairings showing researcher organizations matched with regional project sponsors.',
    colProject: 'Project Target Challenge',
    colExpert: 'Matched Expert',
    colInstitution: 'Researcher Institution',
    colCountry: 'Origin Country',
    colStrength: 'Match Strength',
    noMatches: 'No matches computed yet. Select a project on the Matches tab to initiate matching vectors.'
  },
  ar: {
    loading: 'جاري تحميل الرسوم البيانية التحليلية...',
    noData: 'لا توجد بيانات تحليلية متاحة. يرجى الضغط على "توليد بيانات تجريبية" في الشريط الجانبي لتعبئة السجلات.',
    sectorsTitle: 'مشاريع إعادة الإعمار حسب القطاع',
    sdgsTitle: 'توافق المشاريع مع أهداف التنمية المستدامة للأمم المتحدة',
    countriesTitle: 'التوزيع الجغرافي للخبراء',
    skillsTitle: 'أبرز الكفاءات التقنية',
    noChartData: 'لا توجد بيانات',
    collabTitle: 'التعاونات المؤسسية النشطة',
    collabDesc: 'تتبع فوري للشراكات الأكاديمية النشطة التي تُظهر مؤسسات الباحثين المطابقة مع الجهات الراعية للمشاريع الإقليمية.',
    colProject: 'التحدي المستهدف للمشروع',
    colExpert: 'الخبير المطابق',
    colInstitution: 'مؤسسة الباحث',
    colCountry: 'بلد المنشأ',
    colStrength: 'قوة المطابقة',
    noMatches: 'لم يتم احتساب أي مطابقات بعد. اختر مشروعاً من تبويب المطابقات لبدء عملية المطابقة.'
  }
}

function Analytics({ lang = 'en' }) {
  const activeLang = lang || 'en'
  const t = translations[activeLang]
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchAnalytics = async () => {
      setLoading(true)
      try {
        const res = await fetch(`/api/analytics?lang=${activeLang}`)
        if (res.ok) {
          const json = await res.json()
          setData(json)
        }
      } catch (err) {
        console.error('Error fetching analytics:', err)
      } finally {
        setLoading(false)
      }
    }
    fetchAnalytics()
  }, [activeLang])

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '400px', flexDirection: 'column', gap: '16px' }}>
        <div style={{ width: '40px', height: '40px', border: '3px solid var(--border-color)', borderTopColor: 'var(--color-primary)', borderRadius: '50%', animation: 'spin 1s linear infinite' }} />
        <p style={{ color: 'var(--text-secondary)' }}>{t.loading}</p>
      </div>
    )
  }

  if (!data) {
    return (
      <div className="glass-panel" style={{ padding: '40px', textAlign: 'center', color: 'var(--text-secondary)' }}>
        <p>{t.noData}</p>
      </div>
    )
  }

  // Format Sectors Data
  const sectorData = Object.entries(data.sectors || {}).map(([name, count]) => ({
    name,
    projects: count
  }))

  // Format SDGs Data
  const sdgData = Object.entries(data.sdgs || {}).map(([sdg, count]) => ({
    name: `SDG ${sdg}`,
    frequency: count
  })).sort((a, b) => b.frequency - a.frequency)

  // Format Countries Data
  const countryData = Object.entries(data.countries || {}).map(([name, count]) => ({
    name,
    experts: count
  })).sort((a, b) => b.experts - a.experts)

  // Format Skills Data
  const skillsData = Object.entries(data.top_skills || {}).map(([name, count]) => ({
    name,
    experts: count
  })).sort((a, b) => b.experts - a.experts)

  return (
    <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '32px' }} dir={activeLang === 'ar' ? 'rtl' : 'ltr'}>

      {/* Overview stats */}
      <section className="grid-cols-2">
        {/* Project Sectors Distribution */}
        <div className="glass-panel" style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <h3 style={{ fontSize: '1.15rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <BarChart3 size={18} color="var(--color-primary)" />
            <span>{t.sectorsTitle}</span>
          </h3>
          <div style={{ height: '240px', width: '100%' }}>
            {sectorData.length === 0 ? (
              <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>{t.noChartData}</p>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={sectorData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--border-color)" />
                  <XAxis dataKey="name" stroke="var(--text-secondary)" fontSize={11} />
                  <YAxis stroke="var(--text-secondary)" fontSize={11} />
                  <Tooltip contentStyle={{ background: 'var(--bg-surface-solid)', borderColor: 'var(--border-color)', borderRadius: '8px' }} />
                  <Bar dataKey="projects" fill="var(--color-primary)" radius={[4, 4, 0, 0]}>
                    {sectorData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>

        {/* SDG Target Distribution */}
        <div className="glass-panel" style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <h3 style={{ fontSize: '1.15rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Heart size={18} color="var(--color-secondary)" />
            <span>{t.sdgsTitle}</span>
          </h3>
          <div style={{ height: '240px', width: '100%' }}>
            {sdgData.length === 0 ? (
              <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>{t.noChartData}</p>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={sdgData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--border-color)" />
                  <XAxis dataKey="name" stroke="var(--text-secondary)" fontSize={10} />
                  <YAxis stroke="var(--text-secondary)" fontSize={11} />
                  <Tooltip contentStyle={{ background: 'var(--bg-surface-solid)', borderColor: 'var(--border-color)', borderRadius: '8px' }} />
                  <Bar dataKey="frequency" fill="var(--color-secondary)" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>
      </section>

      <section className="grid-cols-2">
        {/* Country distribution */}
        <div className="glass-panel" style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <h3 style={{ fontSize: '1.15rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Globe size={18} color="var(--color-accent)" />
            <span>{t.countriesTitle}</span>
          </h3>
          <div style={{ height: '240px', width: '100%' }}>
            {countryData.length === 0 ? (
              <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>{t.noChartData}</p>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={countryData} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--border-color)" />
                  <XAxis type="number" stroke="var(--text-secondary)" fontSize={11} />
                  <YAxis dataKey="name" type="category" stroke="var(--text-secondary)" fontSize={11} width={80} />
                  <Tooltip contentStyle={{ background: 'var(--bg-surface-solid)', borderColor: 'var(--border-color)', borderRadius: '8px' }} />
                  <Bar dataKey="experts" fill="var(--color-accent)" radius={[0, 4, 4, 0]} />
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>

        {/* Top expertise keywords */}
        <div className="glass-panel" style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <h3 style={{ fontSize: '1.15rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Shield size={18} color="var(--color-warning)" />
            <span>{t.skillsTitle}</span>
          </h3>
          <div style={{ height: '240px', width: '100%' }}>
            {skillsData.length === 0 ? (
              <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>{t.noChartData}</p>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={skillsData} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--border-color)" />
                  <XAxis type="number" stroke="var(--text-secondary)" fontSize={11} />
                  <YAxis dataKey="name" type="category" stroke="var(--text-secondary)" fontSize={11} width={120} />
                  <Tooltip contentStyle={{ background: 'var(--bg-surface-solid)', borderColor: 'var(--border-color)', borderRadius: '8px' }} />
                  <Bar dataKey="experts" fill="var(--color-warning)" radius={[0, 4, 4, 0]} />
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>
      </section>

      {/* Network / Collaboration Links List */}
      <section className="glass-panel" style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
        <h3 style={{ fontSize: '1.15rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <RefreshCw size={18} color="var(--color-primary)" />
          <span>{t.collabTitle}</span>
        </h3>
        <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>
          {t.collabDesc}
        </p>

        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.875rem', minWidth: '600px' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid var(--border-color)', color: 'var(--text-secondary)', textAlign: activeLang === 'ar' ? 'right' : 'left' }}>
                <th style={{ padding: '12px 16px' }}>{t.colProject}</th>
                <th style={{ padding: '12px 16px' }}>{t.colExpert}</th>
                <th style={{ padding: '12px 16px' }}>{t.colInstitution}</th>
                <th style={{ padding: '12px 16px' }}>{t.colCountry}</th>
                <th style={{ padding: '12px 16px', textAlign: activeLang === 'ar' ? 'left' : 'right' }}>{t.colStrength}</th>
              </tr>
            </thead>
            <tbody>
              {data.collaborations?.length === 0 ? (
                <tr>
                  <td colSpan={5} style={{ padding: '20px', textAlign: 'center', color: 'var(--text-muted)' }}>{t.noMatches}</td>
                </tr>
              ) : (
                data.collaborations?.map((link, idx) => (
                  <tr key={idx} style={{ borderBottom: '1px solid var(--border-color)', color: 'var(--text-primary)' }}>
                    <td style={{ padding: '14px 16px', fontWeight: 600 }}>{link.project_title}</td>
                    <td style={{ padding: '14px 16px' }}>{link.researcher_name}</td>
                    <td style={{ padding: '14px 16px' }}>{link.institution}</td>
                    <td style={{ padding: '14px 16px' }}>{link.researcher_country}</td>
                    <td style={{ padding: '14px 16px', textAlign: activeLang === 'ar' ? 'left' : 'right', fontWeight: 700, color: 'var(--color-primary)' }}>{link.score}%</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </section>

    </div>
  )
}

export default Analytics
