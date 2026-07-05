import React, { useState, useEffect } from 'react'
import SdgGrid from './SdgGrid'
import {
  User,
  Briefcase,
  Trash2,
  PlusCircle,
  Edit3,
  Save,
  AlertTriangle,
  Loader2,
  Globe,
  BookOpen,
  Award,
  Sparkles,
  FileText,
  Bell
} from 'lucide-react'

const SECTOR_OPTIONS = [
  { en: 'Solar Energy', ar: 'الطاقة الشمسية' },
  { en: 'Smart Agriculture', ar: 'الزراعة الذكية' },
  { en: 'Telemedicine', ar: 'الطب عن بعد' },
  { en: 'Infrastructure', ar: 'البنية التحتية' },
  { en: 'Education', ar: 'التعليم' },
  { en: 'Water & Sanitation', ar: 'المياه والصرف الصحي' }
]

const GOVERNORATE_OPTIONS = [
  { en: 'Damascus', ar: 'دمشق' },
  { en: 'Aleppo', ar: 'حلب' },
  { en: 'Homs', ar: 'حمص' },
  { en: 'Hama', ar: 'حماة' },
  { en: 'Lattakia', ar: 'اللاذقية' },
  { en: 'Tartous', ar: 'طرطوس' },
  { en: 'Deir ez-Zor', ar: 'دير الزور' },
  { en: 'Raqqa', ar: 'الرقة' },
  { en: 'Hasakah', ar: 'الحسكة' },
  { en: 'Daraa', ar: 'درعا' },
  { en: 'As-Suwayda', ar: 'السويداء' },
  { en: 'Quneitra', ar: 'القنيطرة' },
  { en: 'Idlib', ar: 'إدلب' },
  { en: 'Rif Dimashq', ar: 'ريف دمشق' }
]

const PRIORITY_OPTIONS = [
  { value: 'High', en: 'High Priority', ar: 'أولوية عالية' },
  { value: 'Medium', en: 'Medium Priority', ar: 'أولوية متوسطة' },
  { value: 'Low', en: 'Low Priority', ar: 'أولوية منخفضة' }
]

const translations = {
  en: {
    profileManagerTitle: 'Profile Manager',
    accountLabel: 'Account:',
    researcherProfileTab: 'Researcher Profile',
    ownedProjectsTab: 'Owned Projects',
    fundingAlertsActive: 'Funding Alerts Active',
    researcherCoreProfile: 'Researcher Core Profile',
    autoIndexed: 'Auto-indexed in search embeddings',
    fullNameLabel: 'Full Name',
    currentPositionLabel: 'Current Position',
    positionPlaceholder: 'e.g. Associate Professor, Consultant',
    institutionLabel: 'Institution / Affiliation',
    residingCountryLabel: 'Current Residing Country',
    nationalityLabel: 'Nationality / Nationalities',
    nationalityPlaceholder: 'e.g. Syrian, French',
    diasporaLabel: 'Original Nationality Syrian (Diaspora)?',
    diasporaNo: 'No / Resides in Syria',
    diasporaYes: 'Yes, Syrian living abroad (Diaspora)',
    expertiseLabel: 'Core Expertise Summary',
    expertisePlaceholder: 'Detail your scientific focus, technical capabilities, and how your skills can help in Syrian reconstruction...',
    skillsLabel: 'Technical Skills (comma-separated)',
    skillsPlaceholder: 'e.g. Solar Energy, GIS Mapping, Hydrology',
    interestsLabel: 'Research Interests (comma-separated)',
    interestsPlaceholder: 'e.g. Sustainable Development, Earthquake Resilient Structures',
    languagesLabel: 'Languages (comma-separated)',
    availabilityLabel: 'Time Commitment / Availability',
    availabilityPlaceholder: 'e.g. 5-10 hours/week, remote advisory only',
    preferredScaleLabel: 'Preferred Project Scale / Collaboration',
    smallScale: 'Small Scale Projects',
    mediumScale: 'Medium Scale Projects',
    largeScale: 'Large Scale Projects',
    fundingToggleLabel: 'Enable automatic funding alert notifications',
    channelLabel: 'Preferred Alert Channel:',
    emailOnly: 'Email Only',
    whatsappOnly: 'WhatsApp Only',
    bothChannels: 'Both (Email & WhatsApp)',
    notificationEmailLabel: 'Notification Email Address:',
    emailPlaceholder: 'e.g. academic-alerts@reconstruction.sy',
    notificationPhoneLabel: 'Active WhatsApp Phone Number (with country code):',
    phonePlaceholder: 'e.g. +963 933 123 456',
    goToDashboard: 'Go to Dashboard',
    savingBtn: 'Saving...',
    saveProfileBtn: 'Save Profile',
    resSavedSuccess: 'Researcher profile updated successfully!',
    resFailedLoad: 'Failed to load researcher profile',
    resFailedUpdate: 'Failed to update profile',
    myReconstructionProjects: 'My Reconstruction Projects',
    registerProjectBtn: 'Register Project',
    generateProposal: 'Generate Proposal',
    noProjectsYet: 'No projects registered under this account yet.',
    orgLabel: 'Org:',
    anonymousFallback: 'Anonymous',
    editBtn: 'Edit',
    editProjectDetails: 'Edit Project Details',
    registerNewProject: 'Register New Project',
    cancelBtn: 'Cancel',
    projectTitleLabel: 'Project Title',
    projectTitlePlaceholder: 'e.g. Smart Solar Mini-Grid for Damascus Clinic',
    organizationLabel: 'Organization',
    organizationPlaceholder: 'e.g. Reconstruction Development Agency',
    sectorLabel: 'Sector',
    selectSectorOption: '-- Select Sector --',
    locationLabel: 'City / Location (Syria)',
    selectGovernorateOption: '-- Select Governorate --',
    descriptionLabel: 'Problem Statement & Description',
    descriptionPlaceholder: 'Describe the reconstruction challenge, structural needs, and the local societal impact...',
    budgetLabel: 'Estimated Budget',
    budgetPlaceholder: 'e.g. $45,000',
    timelineLabel: 'Timeline',
    timelinePlaceholder: 'e.g. 6 Months',
    priorityLabel: 'Priority Level',
    requiredSkillsLabel: 'Required Expert Skills (comma-separated)',
    requiredSkillsPlaceholder: 'e.g. Electrical Engineering, Battery Management Systems, Arabic',
    sdgsAligned: 'UN Sustainable Development Goals (SDGs) Aligned',
    updateProjectBtn: 'Update Project',
    projSavedSuccess: 'Project registered successfully!',
    projUpdatedSuccess: 'Project details updated successfully!',
    projFailedLoad: 'Failed to load projects',
    projFailedSave: 'Failed to save project',
    dangerZoneTitle: 'Danger Zone',
    deleteWarning: 'Deleting your account will irreversibly remove your credentials, your linked Researcher Profile, and all reconstruction projects owned by you.',
    areYouSure: 'Are you absolutely sure? This action cannot be undone.',
    keepAccountBtn: 'No, Keep Account',
    deletingBtn: 'Deleting...',
    deleteEverythingBtn: 'Yes, Delete Everything',
    deleteAccountBtn: 'Delete Account & Profiles',
    deleteFailedMsg: 'Failed to delete account'
  },
  ar: {
    profileManagerTitle: 'إدارة الملف الشخصي',
    accountLabel: 'الحساب:',
    researcherProfileTab: 'الملف الشخصي كباحث',
    ownedProjectsTab: 'المشاريع المملوكة',
    fundingAlertsActive: 'تنبيهات التمويل نشطة',
    researcherCoreProfile: 'الملف الأساسي للباحث',
    autoIndexed: 'مفهرس تلقائياً في نظام البحث الدلالي',
    fullNameLabel: 'الاسم الكامل',
    currentPositionLabel: 'المنصب الحالي',
    positionPlaceholder: 'مثال: أستاذ مشارك، استشاري',
    institutionLabel: 'المؤسسة / الانتساب',
    residingCountryLabel: 'بلد الإقامة الحالي',
    nationalityLabel: 'الجنسية / الجنسيات',
    nationalityPlaceholder: 'مثال: سوري، فرنسي',
    diasporaLabel: 'هل الأصل سوري (مغترب)؟',
    diasporaNo: 'لا / مقيم في سوريا',
    diasporaYes: 'نعم، سوري مقيم في الخارج (مغترب)',
    expertiseLabel: 'ملخص الخبرة الأساسية',
    expertisePlaceholder: 'صف تركيزك العلمي وقدراتك التقنية وكيف يمكن لمهاراتك أن تساهم في إعادة إعمار سوريا...',
    skillsLabel: 'المهارات التقنية (مفصولة بفواصل)',
    skillsPlaceholder: 'مثال: الطاقة الشمسية، رسم الخرائط الجغرافية، الهيدرولوجيا',
    interestsLabel: 'الاهتمامات البحثية (مفصولة بفواصل)',
    interestsPlaceholder: 'مثال: التنمية المستدامة، الهياكل المقاومة للزلازل',
    languagesLabel: 'اللغات (مفصولة بفواصل)',
    availabilityLabel: 'الالتزام الزمني / التوفر',
    availabilityPlaceholder: 'مثال: 5-10 ساعات/أسبوع، استشارات عن بعد فقط',
    preferredScaleLabel: 'حجم المشروع المفضل / التعاون',
    smallScale: 'مشاريع صغيرة الحجم',
    mediumScale: 'مشاريع متوسطة الحجم',
    largeScale: 'مشاريع كبيرة الحجم',
    fundingToggleLabel: 'تفعيل تنبيهات التمويل التلقائية للملف الشخصي',
    channelLabel: 'قناة استلام التنبيهات المفضلة:',
    emailOnly: 'البريد الإلكتروني فقط',
    whatsappOnly: 'واتساب فقط',
    bothChannels: 'كلاهما (البريد وواتساب)',
    notificationEmailLabel: 'البريد الإلكتروني للتنبيهات:',
    emailPlaceholder: 'مثال: academic-alerts@reconstruction.sy',
    notificationPhoneLabel: 'رقم واتساب النشط (مع رمز البلد):',
    phonePlaceholder: 'مثال: 456 123 933 963+',
    goToDashboard: 'الذهاب إلى لوحة التحكم',
    savingBtn: 'جاري الحفظ...',
    saveProfileBtn: 'حفظ الملف الشخصي',
    resSavedSuccess: 'تم تحديث الملف الشخصي للباحث بنجاح!',
    resFailedLoad: 'فشل تحميل الملف الشخصي للباحث',
    resFailedUpdate: 'فشل تحديث الملف الشخصي',
    myReconstructionProjects: 'مشاريعي لإعادة الإعمار',
    registerProjectBtn: 'تسجيل مشروع',
    generateProposal: 'إنشاء مقترح',
    noProjectsYet: 'لم يتم تسجيل أي مشاريع تحت هذا الحساب بعد.',
    orgLabel: 'الجهة:',
    anonymousFallback: 'مجهول',
    editBtn: 'تعديل',
    editProjectDetails: 'تعديل تفاصيل المشروع',
    registerNewProject: 'تسجيل مشروع جديد',
    cancelBtn: 'إلغاء',
    projectTitleLabel: 'عنوان المشروع',
    projectTitlePlaceholder: 'مثال: شبكة طاقة شمسية ذكية لعيادة دمشق',
    organizationLabel: 'الجهة / المنظمة',
    organizationPlaceholder: 'مثال: وكالة تطوير إعادة الإعمار',
    sectorLabel: 'القطاع',
    selectSectorOption: '-- اختر القطاع --',
    locationLabel: 'المدينة / الموقع (سوريا)',
    selectGovernorateOption: '-- اختر المحافظة --',
    descriptionLabel: 'وصف المشكلة والتفاصيل',
    descriptionPlaceholder: 'صف تحدي إعادة الإعمار، الاحتياجات الإنشائية، والأثر المجتمعي المحلي...',
    budgetLabel: 'الميزانية التقديرية',
    budgetPlaceholder: 'مثال: 45,000 دولار',
    timelineLabel: 'الجدول الزمني',
    timelinePlaceholder: 'مثال: 6 أشهر',
    priorityLabel: 'مستوى الأولوية',
    requiredSkillsLabel: 'المهارات المطلوبة من الخبراء (مفصولة بفواصل)',
    requiredSkillsPlaceholder: 'مثال: الهندسة الكهربائية، أنظمة إدارة البطاريات، العربية',
    sdgsAligned: 'أهداف التنمية المستدامة للأمم المتحدة (SDGs) المتوافقة',
    updateProjectBtn: 'تحديث المشروع',
    projSavedSuccess: 'تم تسجيل المشروع بنجاح!',
    projUpdatedSuccess: 'تم تحديث تفاصيل المشروع بنجاح!',
    projFailedLoad: 'فشل تحميل المشاريع',
    projFailedSave: 'فشل حفظ المشروع',
    dangerZoneTitle: 'منطقة الخطر',
    deleteWarning: 'سيؤدي حذف حسابك إلى إزالة بيانات اعتمادك، وملفك الشخصي كباحث، وجميع مشاريع إعادة الإعمار المملوكة لك بشكل نهائي لا رجعة فيه.',
    areYouSure: 'هل أنت متأكد تماماً؟ لا يمكن التراجع عن هذا الإجراء.',
    keepAccountBtn: 'لا، احتفظ بالحساب',
    deletingBtn: 'جاري الحذف...',
    deleteEverythingBtn: 'نعم، احذف كل شيء',
    deleteAccountBtn: 'حذف الحساب والملفات الشخصية',
    deleteFailedMsg: 'فشل حذف الحساب'
  }
}

function ProfileManager({ currentUser, onProfileUpdate, onLogout, initialTab = 'researcher', lang = 'en', setActivePage, onGenerateProposal }) {
  const activeLang = lang || 'en'
  const t = translations[activeLang]
  const [activeTab, setActiveTab] = useState(initialTab) // 'researcher' or 'projects'

  // Researcher States
  const [resProfile, setResProfile] = useState(null)
  const [resLoading, setResLoading] = useState(false)
  const [resSaving, setResSaving] = useState(false)
  const [resMessage, setResMessage] = useState('')
  const [resError, setResError] = useState('')

  // Projects States
  const [projects, setProjects] = useState([])
  const [projLoading, setProjLoading] = useState(false)
  const [editingProject, setEditingProject] = useState(null) // project object or 'new'
  const [projSaving, setProjSaving] = useState(false)
  const [projMessage, setProjMessage] = useState('')
  const [projError, setProjError] = useState('')
  const [savedProjectId, setSavedProjectId] = useState(null)

  // Temporary string input states for comma-separated fields
  const [skillsInput, setSkillsInput] = useState('')
  const [interestsInput, setInterestsInput] = useState('')
  const [languagesInput, setLanguagesInput] = useState('')
  const [reqSkillsInput, setReqSkillsInput] = useState('')



  // Account Deletion States
  const [deleting, setDeleting] = useState(false)
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)

  // Fetch data based on active tab (and refetch if the active language changes)
  useEffect(() => {
    if (activeTab === 'researcher') {
      fetchResearcherProfile()
    } else {
      fetchProjects()
    }
  }, [activeTab, currentUser, lang])

  const fetchResearcherProfile = async () => {
    setResLoading(true)
    setResError('')
    try {
      const token = localStorage.getItem('auth_token')
      const res = await fetch(`/api/profile/researcher?lang=${lang}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      })
      if (res.status === 404) {
        // No profile exists yet
        setResProfile({
          name: '',
          institution: '',
          country: '',
          nationality: '',
          residing_country: '',
          is_syrian_diaspora: false,
          department: '',
          position: '',
          expertise: '',
          interests: [],
          skills: [],
          languages: [],
          availability: '',
          publications: [],
          previous_projects: [],
          preferred_collaborations: ['Medium']
        })
        setSkillsInput('')
        setInterestsInput('')
        setLanguagesInput('')
      } else if (res.ok) {
        const data = await res.json()
        setResProfile(data)
        setSkillsInput(Array.isArray(data.skills) ? data.skills.join(', ') : '')
        setInterestsInput(Array.isArray(data.interests) ? data.interests.join(', ') : '')
        setLanguagesInput(Array.isArray(data.languages) ? data.languages.join(', ') : '')
      } else {
        throw new Error(t.resFailedLoad)
      }
    } catch (err) {
      setResError(err.message)
    } finally {
      setResLoading(false)
    }
  }

  const fetchProjects = async () => {
    setProjLoading(true)
    setProjError('')
    try {
      const token = localStorage.getItem('auth_token')
      const res = await fetch(`/api/profile/projects?lang=${lang}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      })
      if (res.ok) {
        const data = await res.json()
        setProjects(data)
      } else {
        throw new Error(t.projFailedLoad)
      }
    } catch (err) {
      setProjError(err.message)
    } finally {
      setProjLoading(false)
    }
  }

  const handleResearcherSave = async (e) => {
    e.preventDefault()
    setResSaving(true)
    setResMessage('')
    setResError('')
    try {
      const token = localStorage.getItem('auth_token')

      const updatedProfile = {
        ...resProfile,
        skills: skillsInput.split(',').map(s => s.trim()).filter(Boolean),
        interests: interestsInput.split(',').map(i => i.trim()).filter(Boolean),
        languages: languagesInput.split(',').map(l => l.trim()).filter(Boolean),
        preferred_collaborations: Array.isArray(resProfile.preferred_collaborations)
          ? (resProfile.preferred_collaborations[0] || 'Medium')
          : (resProfile.preferred_collaborations || 'Medium')
      }

      const res = await fetch(`/api/profile/researcher?lang=${lang}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(updatedProfile)
      })
      const data = await res.json()
      if (res.ok) {
        setResMessage(t.resSavedSuccess)
        setResProfile(data.profile)
        setSkillsInput(Array.isArray(data.profile.skills) ? data.profile.skills.join(', ') : '')
        setInterestsInput(Array.isArray(data.profile.interests) ? data.profile.interests.join(', ') : '')
        setLanguagesInput(Array.isArray(data.profile.languages) ? data.profile.languages.join(', ') : '')
        if (onProfileUpdate) onProfileUpdate(data.profile)
        setTimeout(() => setResMessage(''), 3000)
      } else {
        throw new Error(data.detail || t.resFailedUpdate)
      }
    } catch (err) {
      setResError(err.message)
    } finally {
      setResSaving(false)
    }
  }

  const handleProjectSave = async (e) => {
    e.preventDefault()
    setProjSaving(true)
    setProjMessage('')
    setProjError('')

    const isNew = editingProject.id === undefined
    const url = isNew ? `/api/profile/projects?lang=${lang}` : `/api/profile/projects/${editingProject.id}?lang=${lang}`
    const method = isNew ? 'POST' : 'PUT'

    const updatedProject = {
      ...editingProject,
      required_skills: reqSkillsInput.split(',').map(s => s.trim()).filter(Boolean)
    }

    try {
      const token = localStorage.getItem('auth_token')
      const res = await fetch(url, {
        method: method,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(updatedProject)
      })
      const data = await res.json()
      if (res.ok) {
        setProjMessage(isNew ? t.projSavedSuccess : t.projUpdatedSuccess)
        if (data.project && data.project.id) {
          setSavedProjectId(data.project.id)
        }
        setEditingProject(null)
        setReqSkillsInput('')
        fetchProjects()
        setTimeout(() => setProjMessage(''), 5000)
      } else {
        throw new Error(data.detail || t.projFailedSave)
      }
    } catch (err) {
      setProjError(err.message)
    } finally {
      setProjSaving(false)
    }
  }

  const handleDeleteAccount = async () => {
    setDeleting(true)
    try {
      const token = localStorage.getItem('auth_token')
      const res = await fetch('/api/profile', {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      })
      if (res.ok) {
        onLogout()
      } else {
        alert(t.deleteFailedMsg)
      }
    } catch (err) {
      console.error('Delete account error:', err)
    } finally {
      setDeleting(false)
    }
  }

  return (
    <div style={{ maxWidth: '800px', margin: '0 auto', padding: '10px 20px 40px', display: 'flex', flexDirection: 'column', gap: '30px' }} dir={activeLang === 'ar' ? 'rtl' : 'ltr'}>

      {/* Top Header Card */}
      <div className="glass-panel" style={{ padding: '30px', position: 'relative', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h2 style={{ fontSize: '1.8rem', marginBottom: '8px', color: 'var(--text-primary)' }}>{t.profileManagerTitle}</h2>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
            {t.accountLabel} <span style={{ color: 'var(--color-primary)', fontWeight: 600 }}>{currentUser?.email}</span>
          </p>
        </div>
        <div style={{
          display: 'flex',
          backgroundColor: 'rgba(255, 255, 255, 0.02)',
          border: '1px solid var(--border-color)',
          borderRadius: '12px',
          padding: '4px'
        }}>
          <button
            onClick={() => { setActiveTab('researcher'); setEditingProject(null); }}
            style={{
              padding: '10px 18px',
              borderRadius: '8px',
              border: 0,
              fontSize: '0.85rem',
              fontWeight: 500,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              backgroundColor: activeTab === 'researcher' ? 'var(--color-primary)' : 'transparent',
              color: activeTab === 'researcher' ? '#000000' : 'var(--text-secondary)'
            }}
          >
            <User size={16} />
            <span>{t.researcherProfileTab}</span>
          </button>
          <button
            onClick={() => { setActiveTab('projects'); setEditingProject(null); }}
            style={{
              padding: '10px 18px',
              borderRadius: '8px',
              border: 0,
              fontSize: '0.85rem',
              fontWeight: 500,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              backgroundColor: activeTab === 'projects' ? 'var(--color-primary)' : 'transparent',
              color: activeTab === 'projects' ? '#000000' : 'var(--text-secondary)'
            }}
          >
            <Briefcase size={16} />
            <span>{t.ownedProjectsTab}</span>
          </button>
        </div>
      </div>

      {/* Main Tab Views */}
      {activeTab === 'researcher' ? (
        <div className="glass-panel" style={{ padding: '30px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px', borderBottom: '1px solid var(--border-color)', paddingBottom: '16px', flexWrap: 'wrap', gap: '10px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap' }}>
              <h3 style={{ fontSize: '1.25rem', color: 'var(--text-primary)' }}>{t.researcherCoreProfile}</h3>
              {resProfile && resProfile.id && resProfile.receive_funding_notifications && (
                <span style={{
                  fontSize: '0.75rem',
                  padding: '4px 10px',
                  borderRadius: '12px',
                  backgroundColor: 'rgba(6, 182, 212, 0.1)',
                  border: '1px solid rgba(6, 182, 212, 0.2)',
                  color: 'var(--color-primary)',
                  fontWeight: 600,
                  display: 'flex',
                  alignItems: 'center',
                  gap: '4px'
                }}>
                  <Bell size={12} />
                  <span>{t.fundingAlertsActive}</span>
                </span>
              )}
            </div>
            <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>{t.autoIndexed}</span>
          </div>

          {resLoading ? (
            <div style={{ display: 'flex', justifyContent: 'center', padding: '40px' }}><Loader2 className="animate-spin" size={32} /></div>
          ) : resProfile ? (
            <form onSubmit={handleResearcherSave} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  <label style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase' }}>{t.fullNameLabel}</label>
                  <input
                    type="text"
                    required
                    value={resProfile.name || ''}
                    onChange={(e) => setResProfile({ ...resProfile, name: e.target.value })}
                    style={{ padding: '10px', backgroundColor: 'rgba(255,255,255,0.02)', border: '1px solid var(--border-color)', borderRadius: '8px', color: 'var(--text-primary)' }}
                  />
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  <label style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase' }}>{t.currentPositionLabel}</label>
                  <input
                    type="text"
                    value={resProfile.position || ''}
                    onChange={(e) => setResProfile({ ...resProfile, position: e.target.value })}
                    placeholder={t.positionPlaceholder}
                    style={{ padding: '10px', backgroundColor: 'rgba(255,255,255,0.02)', border: '1px solid var(--border-color)', borderRadius: '8px', color: 'var(--text-primary)' }}
                  />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  <label style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase' }}>{t.institutionLabel}</label>
                  <input
                    type="text"
                    value={resProfile.institution || ''}
                    onChange={(e) => setResProfile({ ...resProfile, institution: e.target.value })}
                    style={{ padding: '10px', backgroundColor: 'rgba(255,255,255,0.02)', border: '1px solid var(--border-color)', borderRadius: '8px', color: 'var(--text-primary)' }}
                  />
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  <label style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase' }}>{t.residingCountryLabel}</label>
                  <input
                    type="text"
                    value={resProfile.residing_country || resProfile.country || ''}
                    onChange={(e) => setResProfile({ ...resProfile, residing_country: e.target.value, country: e.target.value })}
                    style={{ padding: '10px', backgroundColor: 'rgba(255,255,255,0.02)', border: '1px solid var(--border-color)', borderRadius: '8px', color: 'var(--text-primary)' }}
                  />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  <label style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase' }}>{t.nationalityLabel}</label>
                  <input
                    type="text"
                    value={resProfile.nationality || ''}
                    onChange={(e) => setResProfile({ ...resProfile, nationality: e.target.value })}
                    placeholder={t.nationalityPlaceholder}
                    style={{ padding: '10px', backgroundColor: 'rgba(255,255,255,0.02)', border: '1px solid var(--border-color)', borderRadius: '8px', color: 'var(--text-primary)' }}
                  />
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  <label style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase' }}>{t.diasporaLabel}</label>
                  <select
                    value={resProfile.is_syrian_diaspora ? 'true' : 'false'}
                    onChange={(e) => setResProfile({ ...resProfile, is_syrian_diaspora: e.target.value === 'true' })}
                    style={{ padding: '10px', backgroundColor: 'rgba(255,255,255,0.02)', border: '1px solid var(--border-color)', borderRadius: '8px', color: 'var(--text-primary)', outline: 'none', cursor: 'pointer' }}
                  >
                    <option value="false" style={{ background: 'var(--bg-surface-solid)' }}>{t.diasporaNo}</option>
                    <option value="true" style={{ background: 'var(--bg-surface-solid)' }}>{t.diasporaYes}</option>
                  </select>
                </div>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <label style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase' }}>{t.expertiseLabel}</label>
                <textarea
                  rows={3}
                  required
                  value={resProfile.expertise || ''}
                  onChange={(e) => setResProfile({ ...resProfile, expertise: e.target.value })}
                  placeholder={t.expertisePlaceholder}
                  style={{ padding: '10px', backgroundColor: 'rgba(255,255,255,0.02)', border: '1px solid var(--border-color)', borderRadius: '8px', color: 'var(--text-primary)', resize: 'vertical' }}
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  <label style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase' }}>{t.skillsLabel}</label>
                  <input
                    type="text"
                    value={skillsInput}
                    onChange={(e) => setSkillsInput(e.target.value)}
                    placeholder={t.skillsPlaceholder}
                    style={{ padding: '10px', backgroundColor: 'rgba(255,255,255,0.02)', border: '1px solid var(--border-color)', borderRadius: '8px', color: 'var(--text-primary)' }}
                  />
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  <label style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase' }}>{t.interestsLabel}</label>
                  <input
                    type="text"
                    value={interestsInput}
                    onChange={(e) => setInterestsInput(e.target.value)}
                    placeholder={t.interestsPlaceholder}
                    style={{ padding: '10px', backgroundColor: 'rgba(255,255,255,0.02)', border: '1px solid var(--border-color)', borderRadius: '8px', color: 'var(--text-primary)' }}
                  />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  <label style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase' }}>{t.languagesLabel}</label>
                  <input
                    type="text"
                    value={languagesInput}
                    onChange={(e) => setLanguagesInput(e.target.value)}
                    style={{ padding: '10px', backgroundColor: 'rgba(255,255,255,0.02)', border: '1px solid var(--border-color)', borderRadius: '8px', color: 'var(--text-primary)' }}
                  />
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  <label style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase' }}>{t.availabilityLabel}</label>
                  <input
                    type="text"
                    value={resProfile.availability || ''}
                    onChange={(e) => setResProfile({ ...resProfile, availability: e.target.value })}
                    placeholder={t.availabilityPlaceholder}
                    style={{ padding: '10px', backgroundColor: 'rgba(255,255,255,0.02)', border: '1px solid var(--border-color)', borderRadius: '8px', color: 'var(--text-primary)' }}
                  />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  <label style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase' }}>{t.preferredScaleLabel}</label>
                  <select
                    value={Array.isArray(resProfile.preferred_collaborations) ? (resProfile.preferred_collaborations[0] || 'Medium') : (resProfile.preferred_collaborations || 'Medium')}
                    onChange={(e) => setResProfile({ ...resProfile, preferred_collaborations: [e.target.value] })}
                    style={{ padding: '10px', backgroundColor: 'rgba(255,255,255,0.02)', border: '1px solid var(--border-color)', borderRadius: '8px', color: 'var(--text-primary)', outline: 'none', cursor: 'pointer' }}
                  >
                    <option value="Small" style={{ background: 'var(--bg-surface-solid)' }}>{t.smallScale}</option>
                    <option value="Medium" style={{ background: 'var(--bg-surface-solid)' }}>{t.mediumScale}</option>
                    <option value="Large" style={{ background: 'var(--bg-surface-solid)' }}>{t.largeScale}</option>
                  </select>
                </div>
                     <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginTop: '16px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <input
                      type="checkbox"
                      id="res-funding-notify-toggle"
                      checked={resProfile.receive_funding_notifications || false}
                      onChange={(e) => setResProfile({ ...resProfile, receive_funding_notifications: e.target.checked })}
                      style={{ width: '18px', height: '18px', cursor: 'pointer', accentColor: 'var(--color-primary)' }}
                    />
                    <label htmlFor="res-funding-notify-toggle" style={{ fontSize: '0.9rem', color: 'var(--text-primary)', cursor: 'pointer', fontWeight: 500 }}>
                      {t.fundingToggleLabel}
                    </label>
                  </div>

                  {resProfile.receive_funding_notifications && (
                    <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '16px', marginTop: '12px', padding: '16px', border: '1px solid var(--border-color)', borderRadius: '8px', backgroundColor: 'rgba(255, 255, 255, 0.01)', width: '100%' }}>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                        <label style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase' }}>
                          {t.channelLabel}
                        </label>
                        <select
                          value={resProfile.notification_channel || 'email'}
                          onChange={(e) => setResProfile({ ...resProfile, notification_channel: e.target.value })}
                          style={{ padding: '10px', backgroundColor: 'rgba(0,0,0,0.5)', border: '1px solid var(--border-color)', borderRadius: '8px', color: 'var(--text-primary)', width: '220px', outline: 'none' }}
                        >
                          <option value="email">{t.emailOnly}</option>
                          <option value="whatsapp">{t.whatsappOnly}</option>
                          <option value="both">{t.bothChannels}</option>
                        </select>
                      </div>

                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
                        {(resProfile.notification_channel === 'email' || resProfile.notification_channel === 'both' || !resProfile.notification_channel) && (
                          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                            <label style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase' }}>
                              {t.notificationEmailLabel}
                            </label>
                            <input
                              type="email"
                              required
                              value={resProfile.notification_email !== undefined ? (resProfile.notification_email || '') : (currentUser?.email || '')}
                              onChange={(e) => setResProfile({ ...resProfile, notification_email: e.target.value })}
                              placeholder={t.emailPlaceholder}
                              style={{ padding: '10px', backgroundColor: 'rgba(255,255,255,0.02)', border: '1px solid var(--border-color)', borderRadius: '8px', color: 'var(--text-primary)' }}
                            />
                          </div>
                        )}

                        {(resProfile.notification_channel === 'whatsapp' || resProfile.notification_channel === 'both') && (
                          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                            <label style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase' }}>
                              {t.notificationPhoneLabel}
                            </label>
                            <input
                              type="tel"
                              required
                              value={resProfile.notification_phone || ''}
                              onChange={(e) => setResProfile({ ...resProfile, notification_phone: e.target.value })}
                              placeholder={t.phonePlaceholder}
                              style={{ padding: '10px', backgroundColor: 'rgba(255,255,255,0.02)', border: '1px solid var(--border-color)', borderRadius: '8px', color: 'var(--text-primary)' }}
                            />
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {resError && <div style={{ color: 'var(--color-error)', fontSize: '0.85rem' }}>{resError}</div>}
              {resMessage && (
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '10px 14px',
                  backgroundColor: 'rgba(16, 185, 129, 0.1)',
                  border: '1px solid var(--color-accent)',
                  borderRadius: '8px',
                  width: '100%',
                  color: '#a7f3d0',
                  fontSize: '0.85rem'
                }}>
                  <span>{resMessage}</span>
                  <button
                    type="button"
                    onClick={() => setActivePage('dashboard')}
                    className="btn btn-secondary"
                    style={{ padding: '6px 12px', fontSize: '0.8rem' }}
                  >
                    {t.goToDashboard}
                  </button>
                </div>
              )}

              <button
                type="submit"
                disabled={resSaving}
                className="btn btn-primary"
                style={{
                  padding: '12px',
                  alignSelf: 'flex-end',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  minWidth: '160px',
                  justifyContent: 'center'
                }}
              >
                {resSaving ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
                <span>{resSaving ? t.savingBtn : t.saveProfileBtn}</span>
              </button>
            </form>
          ) : null}
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>

          {editingProject === null ? (
            <div className="glass-panel" style={{ padding: '30px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px', borderBottom: '1px solid var(--border-color)', paddingBottom: '16px' }}>
                <h3 style={{ fontSize: '1.25rem', color: 'var(--text-primary)' }}>{t.myReconstructionProjects}</h3>
                <button
                  onClick={() => {
                  setEditingProject({
                    title: '',
                    organization: '',
                    description: '',
                    sector: '',
                    location: '',
                    budget: '',
                    timeline: '',
                    priority: 'Medium',
                    required_skills: [],
                    sdgs: [],
                    impact: {}
                  });
                  setReqSkillsInput('');
                  setProjMessage('');
                  setSavedProjectId(null);
                }}
                  className="btn btn-primary"
                  style={{ padding: '8px 14px', fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: '6px' }}
                >
                  <PlusCircle size={16} />
                  <span>{t.registerProjectBtn}</span>
                </button>
              </div>

              {projMessage && (
                 <div style={{
                   display: 'flex',
                   flexDirection: 'column',
                   gap: '10px',
                   padding: '10px 14px',
                   backgroundColor: 'rgba(16, 185, 129, 0.1)',
                   border: '1px solid var(--color-accent)',
                   borderRadius: '8px',
                   width: '100%',
                   color: '#a7f3d0',
                   fontSize: '0.85rem',
                   marginBottom: '20px'
                 }}>
                   <span>{projMessage}</span>
                   <div style={{ display: 'flex', gap: '8px' }}>
                     <button
                       type="button"
                       onClick={() => setActivePage('dashboard')}
                       className="btn btn-secondary"
                       style={{ padding: '6px 12px', fontSize: '0.8rem' }}
                     >
                       {t.goToDashboard}
                     </button>
                     {savedProjectId && (
                       <button
                         type="button"
                         onClick={() => onGenerateProposal(savedProjectId)}
                         className="btn btn-primary"
                         style={{ padding: '6px 12px', fontSize: '0.8rem', display: 'flex', alignItems: 'center', gap: '4px' }}
                       >
                         <Sparkles size={12} />
                         <span>{t.generateProposal}</span>
                       </button>
                     )}
                   </div>
                 </div>
               )}

              {projLoading ? (
                <div style={{ display: 'flex', justifyContent: 'center', padding: '40px' }}><Loader2 className="animate-spin" size={32} /></div>
              ) : projects.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '40px 20px', color: 'var(--text-muted)', border: '1px dashed var(--border-color)', borderRadius: '12px' }}>
                  <Briefcase size={40} style={{ margin: '0 auto 12px', color: 'rgba(255,255,255,0.1)' }} />
                  <p style={{ fontSize: '0.9rem' }}>{t.noProjectsYet}</p>
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                  {projects.map(p => (
                    <div
                      key={p.id}
                      style={{
                        padding: '20px',
                        backgroundColor: 'rgba(255,255,255,0.01)',
                        border: '1px solid var(--border-color)',
                        borderRadius: '12px',
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center'
                      }}
                    >
                      <div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '6px', flexWrap: 'wrap' }}>
                          <span style={{ fontSize: '0.75rem', padding: '2px 8px', borderRadius: '12px', backgroundColor: 'rgba(6, 182, 212, 0.1)', border: '1px solid rgba(6, 182, 212, 0.2)', color: 'var(--color-primary)', fontWeight: 600 }}>{p.sector}</span>
                          <span style={{ fontSize: '0.75rem', padding: '2px 8px', borderRadius: '12px', backgroundColor: 'rgba(255,255,255,0.05)', color: 'var(--text-secondary)' }}>{p.location}</span>
                        </div>
                        <h4 style={{ color: 'var(--text-primary)', fontSize: '1.1rem', marginBottom: '4px' }}>{p.title}</h4>
                        <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>{t.orgLabel} {p.organization || t.anonymousFallback}</p>
                      </div>
                      <div style={{ display: 'flex', gap: '8px' }}>
                        <button
                          type="button"
                          onClick={() => onGenerateProposal(p.id)}
                          className="btn btn-secondary"
                          style={{ padding: '8px 12px', fontSize: '0.8rem', display: 'flex', alignItems: 'center', gap: '6px', borderColor: 'rgba(6, 182, 212, 0.3)', backgroundColor: 'rgba(6, 182, 212, 0.05)' }}
                        >
                          <FileText size={14} style={{ color: 'var(--color-primary)' }} />
                          <span>{t.generateProposal}</span>
                        </button>
                        <button
                          onClick={() => {
                            setEditingProject(p);
                            setReqSkillsInput(Array.isArray(p.required_skills) ? p.required_skills.join(', ') : '');
                          }}
                          className="btn btn-secondary"
                          style={{ padding: '8px 12px', fontSize: '0.8rem', display: 'flex', alignItems: 'center', gap: '6px' }}
                        >
                          <Edit3 size={14} />
                          <span>{t.editBtn}</span>
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ) : (
            /* Project Edit Form */
            <div className="glass-panel" style={{ padding: '30px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px', borderBottom: '1px solid var(--border-color)', paddingBottom: '16px' }}>
                <h3 style={{ fontSize: '1.25rem', color: 'var(--text-primary)' }}>
                  {editingProject.id ? t.editProjectDetails : t.registerNewProject}
                </h3>
                <button
                  onClick={() => {
                    setEditingProject(null);
                    setReqSkillsInput('');
                  }}
                  className="btn btn-secondary"
                  style={{ padding: '6px 12px', fontSize: '0.8rem' }}
                >
                  {t.cancelBtn}
                </button>
              </div>

              <form onSubmit={handleProjectSave} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    <label style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase' }}>{t.projectTitleLabel}</label>
                    <input
                      type="text"
                      required
                      value={editingProject.title || ''}
                      onChange={(e) => setEditingProject({ ...editingProject, title: e.target.value })}
                      placeholder={t.projectTitlePlaceholder}
                      style={{ padding: '10px', backgroundColor: 'rgba(255,255,255,0.02)', border: '1px solid var(--border-color)', borderRadius: '8px', color: 'var(--text-primary)' }}
                    />
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    <label style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase' }}>{t.organizationLabel}</label>
                    <input
                      type="text"
                      required
                      value={editingProject.organization || ''}
                      onChange={(e) => setEditingProject({ ...editingProject, organization: e.target.value })}
                      placeholder={t.organizationPlaceholder}
                      style={{ padding: '10px', backgroundColor: 'rgba(255,255,255,0.02)', border: '1px solid var(--border-color)', borderRadius: '8px', color: 'var(--text-primary)' }}
                    />
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    <label style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase' }}>{t.sectorLabel}</label>
                    <select
                      required
                      value={editingProject.sector || ''}
                      onChange={(e) => setEditingProject({ ...editingProject, sector: e.target.value })}
                      style={{ padding: '10px', backgroundColor: 'rgba(0,0,0,0.5)', border: '1px solid var(--border-color)', borderRadius: '8px', color: 'var(--text-primary)' }}
                    >
                      <option value="">{t.selectSectorOption}</option>
                      {SECTOR_OPTIONS.map(opt => (
                        <option key={opt.en} value={activeLang === 'ar' ? opt.ar : opt.en}>
                          {activeLang === 'ar' ? opt.ar : opt.en}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    <label style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase' }}>{t.locationLabel}</label>
                    <select
                      required
                      value={editingProject.location || ''}
                      onChange={(e) => setEditingProject({ ...editingProject, location: e.target.value })}
                      style={{ padding: '10px', backgroundColor: 'rgba(0,0,0,0.5)', border: '1px solid var(--border-color)', borderRadius: '8px', color: 'var(--text-primary)' }}
                    >
                      <option value="">{t.selectGovernorateOption}</option>
                      {GOVERNORATE_OPTIONS.map(opt => (
                        <option key={opt.en} value={activeLang === 'ar' ? opt.ar : opt.en}>
                          {activeLang === 'ar' ? opt.ar : opt.en}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  <label style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase' }}>{t.descriptionLabel}</label>
                  <textarea
                    rows={4}
                    required
                    value={editingProject.description || ''}
                    onChange={(e) => setEditingProject({ ...editingProject, description: e.target.value })}
                    placeholder={t.descriptionPlaceholder}
                    style={{ padding: '10px', backgroundColor: 'rgba(255,255,255,0.02)', border: '1px solid var(--border-color)', borderRadius: '8px', color: 'var(--text-primary)', resize: 'vertical' }}
                  />
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '20px' }}>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    <label style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase' }}>{t.budgetLabel}</label>
                    <input
                      type="text"
                      value={editingProject.budget || ''}
                      onChange={(e) => setEditingProject({ ...editingProject, budget: e.target.value })}
                      placeholder={t.budgetPlaceholder}
                      style={{ padding: '10px', backgroundColor: 'rgba(255,255,255,0.02)', border: '1px solid var(--border-color)', borderRadius: '8px', color: 'var(--text-primary)' }}
                    />
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    <label style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase' }}>{t.timelineLabel}</label>
                    <input
                      type="text"
                      value={editingProject.timeline || ''}
                      onChange={(e) => setEditingProject({ ...editingProject, timeline: e.target.value })}
                      placeholder={t.timelinePlaceholder}
                      style={{ padding: '10px', backgroundColor: 'rgba(255,255,255,0.02)', border: '1px solid var(--border-color)', borderRadius: '8px', color: 'var(--text-primary)' }}
                    />
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    <label style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase' }}>{t.priorityLabel}</label>
                    <select
                      value={editingProject.priority || 'Medium'}
                      onChange={(e) => setEditingProject({ ...editingProject, priority: e.target.value })}
                      style={{ padding: '10px', backgroundColor: 'rgba(0,0,0,0.5)', border: '1px solid var(--border-color)', borderRadius: '8px', color: 'var(--text-primary)' }}
                    >
                      {PRIORITY_OPTIONS.map(opt => (
                        <option key={opt.value} value={opt.value}>{activeLang === 'ar' ? opt.ar : opt.en}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  <label style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase' }}>{t.requiredSkillsLabel}</label>
                  <input
                    type="text"
                    value={reqSkillsInput}
                    onChange={(e) => setReqSkillsInput(e.target.value)}
                    placeholder={t.requiredSkillsPlaceholder}
                    style={{ padding: '10px', backgroundColor: 'rgba(255,255,255,0.02)', border: '1px solid var(--border-color)', borderRadius: '8px', color: 'var(--text-primary)' }}
                  />
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                  <label style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase' }}>
                    {t.sdgsAligned}
                  </label>
                  <SdgGrid
                    selectedIds={Array.isArray(editingProject.sdgs) ? editingProject.sdgs : []}
                    onChange={(newList) => setEditingProject({ ...editingProject, sdgs: newList })}
                    selectable={true}
                    lang={lang}
                  />
                </div>

                {projError && <div style={{ color: 'var(--color-error)', fontSize: '0.85rem' }}>{projError}</div>}


                <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
                  <button
                    type="button"
                    onClick={() => setEditingProject(null)}
                    className="btn btn-secondary"
                    style={{ padding: '12px 20px' }}
                  >
                    {t.cancelBtn}
                  </button>
                  <button
                    type="submit"
                    disabled={projSaving}
                    className="btn btn-primary"
                    style={{
                      padding: '12px 24px',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px',
                      justifyContent: 'center'
                    }}
                  >
                    {projSaving ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
                    <span>{projSaving ? t.savingBtn : editingProject.id ? t.updateProjectBtn : t.registerProjectBtn}</span>
                  </button>
                </div>
              </form>
            </div>
          )}
        </div>
      )}

      {/* Danger Zone: Account Deletion */}
      <div className="glass-panel" style={{ padding: '30px', border: '1px solid rgba(239, 68, 68, 0.2)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '16px' }}>
          <AlertTriangle color="var(--color-error)" size={20} />
          <h3 style={{ fontSize: '1.25rem', color: 'var(--color-error)', margin: 0 }}>{t.dangerZoneTitle}</h3>
        </div>
        <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem', marginBottom: '20px' }}>
          {t.deleteWarning}
        </p>

        {showDeleteConfirm ? (
          <div style={{
            padding: '16px',
            backgroundColor: 'rgba(239, 68, 68, 0.05)',
            border: '1px solid rgba(239, 68, 68, 0.2)',
            borderRadius: '10px',
            display: 'flex',
            flexDirection: 'column',
            gap: '14px'
          }}>
            <p style={{ color: 'var(--text-primary)', fontSize: '0.85rem', fontWeight: 600, margin: 0 }}>{t.areYouSure}</p>
            <div style={{ display: 'flex', gap: '10px' }}>
              <button
                onClick={() => setShowDeleteConfirm(false)}
                className="btn btn-secondary"
                style={{ padding: '8px 14px', fontSize: '0.8rem' }}
              >
                {t.keepAccountBtn}
              </button>
              <button
                onClick={handleDeleteAccount}
                disabled={deleting}
                className="btn btn-primary"
                style={{
                  padding: '8px 14px',
                  fontSize: '0.8rem',
                  backgroundColor: 'var(--color-error)',
                  borderColor: 'var(--color-error)',
                  color: '#ffffff',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px'
                }}
              >
                {deleting ? <Loader2 size={12} className="animate-spin" /> : <Trash2 size={12} />}
                <span>{deleting ? t.deletingBtn : t.deleteEverythingBtn}</span>
              </button>
            </div>
          </div>
        ) : (
          <button
            onClick={() => setShowDeleteConfirm(true)}
            className="btn btn-secondary"
            style={{
              color: 'var(--color-error)',
              borderColor: 'rgba(239, 68, 68, 0.3)',
              padding: '10px 16px',
              fontSize: '0.85rem',
              display: 'flex',
              alignItems: 'center',
              gap: '8px'
            }}
          >
            <Trash2 size={16} />
            <span>{t.deleteAccountBtn}</span>
          </button>
        )}
      </div>
    </div>
  )
}

export default ProfileManager
