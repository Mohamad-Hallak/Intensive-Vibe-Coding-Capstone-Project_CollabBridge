import React, { useState, useEffect, useRef } from 'react'
import SdgGrid from './SdgGrid'
import { 
  Send, 
  Loader2, 
  Award, 
  ClipboardCheck, 
  Sparkles, 
  Building, 
  User, 
  Briefcase, 
  PlusCircle, 
  Edit3, 
  Save, 
  AlertTriangle, 
  Globe, 
  BookOpen, 
  ClipboardList, 
  ArrowLeft, 
  CheckCircle2,
  List,
  FileText
} from 'lucide-react'

const fieldTranslations = {
  en: {
    projectName: "Project Title",
    sector: "Sector",
    location: "Location",
    budget: "Estimated Budget",
    timeline: "Timeline",
    trl: "TRL Level",
    collabStyle: "Collaboration Style",
    skillsRequired: "Skills Required",
    fullName: "Full Name",
    institution: "Institution",
    country: "Current Residing Country",
    nationality: "Nationality",
    residing_country: "Country of Residence",
    is_syrian_diaspora: "Syrian Diaspora Origin",
    position: "Position",
    expertise: "Core Expertise Summary",
    languages: "Languages (comma-separated)",
    availableTime: "Time Commitment / Availability",
    sdgsAligned: "UN Sustainable Development Goals (SDGs) Aligned",
    interviewTitleResearcher: "Researcher Intake Interview",
    interviewTitleProject: "Project Registration Interview",
    infoExtraction: "Information Extraction",
    nlpAgentMessage: "As you type, our background NLP agent automatically parses the context and extracts structured variables in real-time.",
    profileFinalized: "Profile Finalized!",
    profileFinalizedDesc: "The conversation has been compiled into a structured database entity.",
    saveLinkAccount: "Save & Link to My Account",
    signInSave: "Sign In / Register to Save Profile",
    linkedSuccess: "✓ Linked to your account successfully!",
    placeholderActive: "Type your answer here...",
    placeholderCompleted: "Registration interview completed",
    
    // New Translations
    classicForm: "Form Template",
    aiChat: "AI Conversational Chat (Beta)",
    signInTitle: "Authentication Required",
    signInDesc: "To register and manage profiles or projects, please sign in to your CollabBridge account.",
    signInBtn: "Sign In / Register",
    saveProfile: "Save Profile",
    registerProject: "Register Reconstruction Project",
    ownedProjects: "My Registered Projects",
    noProjects: "No projects registered under this account yet.",
    newProjectBtn: "+ Register New Project",
    backToProjects: "← Back to Projects List",
    editProject: "Edit Project Details",
    createProject: "Register Project",
    updating: "Updating...",
    creating: "Registering...",
    successResSaved: "Researcher profile saved successfully!",
    successProjSaved: "Project registered successfully!",
    successProjUpdated: "Project updated successfully!",
    department: "Department",
    researchInterests: "Research Interests (comma-separated)",
    technicalSkills: "Technical Skills (comma-separated)",
    preferredCollaborations: "Preferred Project Scale / Collaboration",
    smallScale: "Small Scale Projects",
    mediumScale: "Medium Scale Projects",
    largeScale: "Large Scale Projects",
    positionPlaceholder: "e.g. Professor, Hydrology Advisor",
    nationalityPlaceholder: "e.g. Syrian, Canadian",
    departmentPlaceholder: "e.g. Civil Engineering",
    availabilityPlaceholder: "e.g. 10 hours/week, remote advisory",
    skillsPlaceholder: "e.g. Water Treatment, Solar Power, GIS Mapping",
    interestsPlaceholder: "e.g. Structural Engineering, Earthquake Resilience, Sanitation",
    languagesPlaceholder: "e.g. Arabic, English, French",
    projectTitlePlaceholder: "e.g. Wastewater Treatment Plant Reconstruction",
    organizationPlaceholder: "e.g. Aleppo Reconstruction Council",
    selectSectorOption: "-- Select Sector --",
    selectGovernorateOption: "-- Select Governorate --",
    budgetPlaceholder: "e.g. $75,000",
    timelinePlaceholder: "e.g. 12 Months",
    requiredSkillsPlaceholder: "e.g. Civil Engineering, Water Quality Control, Arabic",
    priorityHigh: "High",
    priorityMedium: "Medium",
    priorityLow: "Low",
    failedLinkProfile: "Failed to link profile",
    failedConnectInterviewer: "⚠️ Failed to connect to the AI interviewer (STATUS_CODE). Please refresh the page and try again.",
    couldNotConnectServer: "⚠️ Could not connect to the server. Please make sure the backend is running on port 8001 and refresh this page.",
    failedSaveResearcher: "Failed to save researcher profile",
    failedSaveProject: "Failed to save project",
    unknownServerError: "Unknown server error",
    agentErrorText: "⚠️ The AI agent encountered an error (STATUS_CODE). Please try again or refresh the page.\n\n*Details: ERROR_DETAIL*",
    communicationError: "⚠️ I'm sorry, I encountered a communication error. Please check your internet connection and try again."
  },
  ar: {
    projectName: "عنوان المشروع",
    sector: "القطاع",
    location: "الموقع",
    budget: "الميزانية التقديرية",
    timeline: "الجدول الزمني",
    trl: "مستوى الجاهزية TRL",
    collabStyle: "أسلوب التعاون",
    skillsRequired: "المهارات المطلوبة",
    fullName: "الاسم الكامل",
    institution: "المؤسسة الأكاديمية",
    country: "بلد الإقامة الحالي",
    nationality: "الجنسية",
    residing_country: "بلد الإقامة",
    is_syrian_diaspora: "مغترب سوري (الأصل سوري)",
    position: "المنصب الأكاديمي",
    expertise: "الخبرة الأساسية",
    languages: "اللغات",
    availableTime: "الوقت المتاح للمشاركة",
    sdgsAligned: "أهداف التنمية المستدامة للأمم المتحدة (SDGs) المتوافقة",
    interviewTitleResearcher: "مقابلة تسجيل الباحث",
    interviewTitleProject: "مقابلة تسجيل وتوصيف المشروع",
    infoExtraction: "استخراج البيانات الهيكلية",
    nlpAgentMessage: "أثناء كتابتك، يقوم وكيل معالجة اللغة الطبيعية (NLP) بتحليل المحادثة واستخراج المتغيرات الهيكلية بشكل فوري وتلقائي.",
    profileFinalized: "تم اكتمال الملف التعريفي!",
    profileFinalizedDesc: "تم تجميع المحادثة بنجاح وحفظها ككيان منظم في قاعدة البيانات.",
    saveLinkAccount: "حفظ وربط الملف بحسابي",
    signInSave: "سجل الدخول أو أنشئ حساباً لحفظ ملفك",
    linkedSuccess: "✓ تم الربط بحسابك بنجاح!",
    placeholderActive: "اكتب إجابتك هنا...",
    placeholderCompleted: "تم إكمال مقابلة التسجيل بنجاح",
    
    // New Translations
    classicForm: "نموذج تعبئة كلاسيكي",
    aiChat: "محادثة ذكية (تجريبي)",
    signInTitle: "مطلوب تسجيل الدخول",
    signInDesc: "لتسجيل وإدارة الملفات الشخصية والمشاريع، يرجى تسجيل الدخول إلى حساب CollabBridge الخاص بك.",
    signInBtn: "تسجيل الدخول / إنشاء حساب",
    saveProfile: "حفظ الملف التعريفي",
    registerProject: "تسجيل مشروع إعادة إعمار",
    ownedProjects: "مشاريعي المسجلة",
    noProjects: "لم تقم بتسجيل أي مشاريع بعد تحت هذا الحساب.",
    newProjectBtn: "+ تسجيل مشروع جديد",
    backToProjects: "← العودة لقائمة المشاريع",
    editProject: "تعديل تفاصيل المشروع",
    createProject: "تسجيل المشروع",
    updating: "جاري التحديث...",
    creating: "جاري التسجيل...",
    successResSaved: "تم حفظ ملف الباحث بنجاح!",
    successProjSaved: "تم تسجيل المشروع بنجاح!",
    successProjUpdated: "تم تحديث المشروع بنجاح!",
    department: "القسم الأكاديمي",
    researchInterests: "الاهتمامات البحثية (مفصولة بفواصل)",
    technicalSkills: "المهارات التقنية (مفصولة بفواصل)",
    preferredCollaborations: "نطاق المشروع المفضل / التعاون",
    smallScale: "مشاريع صغيرة الحجم",
    mediumScale: "مشاريع متوسطة الحجم",
    largeScale: "مشاريع كبيرة الحجم",
    positionPlaceholder: "مثال: أستاذ، مستشار الموارد المائية",
    nationalityPlaceholder: "مثال: سوري، كندي",
    departmentPlaceholder: "مثال: الهندسة المدنية",
    availabilityPlaceholder: "مثال: 10 ساعات/أسبوع، استشارات عن بعد",
    skillsPlaceholder: "مثال: معالجة المياه، الطاقة الشمسية، رسم الخرائط الجغرافية",
    interestsPlaceholder: "مثال: الهندسة الإنشائية، مقاومة الزلازل، الصرف الصحي",
    languagesPlaceholder: "مثال: العربية، الإنجليزية، الفرنسية",
    projectTitlePlaceholder: "مثال: إعادة تأهيل محطة معالجة مياه الصرف الصحي",
    organizationPlaceholder: "مثال: مجلس إعادة إعمار حلب",
    selectSectorOption: "-- اختر القطاع --",
    selectGovernorateOption: "-- اختر المحافظة --",
    budgetPlaceholder: "مثال: 75,000 دولار",
    timelinePlaceholder: "مثال: 12 شهراً",
    requiredSkillsPlaceholder: "مثال: الهندسة المدنية، مراقبة جودة المياه، العربية",
    priorityHigh: "عالية",
    priorityMedium: "متوسطة",
    priorityLow: "منخفضة",
    failedLinkProfile: "فشل ربط الملف الشخصي",
    failedConnectInterviewer: "⚠️ فشل الاتصال بالمحاور الذكي (STATUS_CODE). يرجى تحديث الصفحة والمحاولة مرة أخرى.",
    couldNotConnectServer: "⚠️ تعذر الاتصال بالخادم. يرجى التأكد من تشغيل الخادم على المنفذ 8001 وتحديث هذه الصفحة.",
    failedSaveResearcher: "فشل حفظ الملف الشخصي للباحث",
    failedSaveProject: "فشل حفظ المشروع",
    unknownServerError: "خطأ غير معروف في الخادم",
    agentErrorText: "⚠️ واجه الوكيل الذكي خطأً (STATUS_CODE). يرجى المحاولة مرة أخرى أو تحديث الصفحة.\n\n*التفاصيل: ERROR_DETAIL*",
    communicationError: "⚠️ عذراً، واجهت خطأً في الاتصال. يرجى التحقق من اتصالك بالإنترنت والمحاولة مرة أخرى."
  }
}

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

function ChatInterface({ type, currentUser, openLogin, lang, setActivePage, onGenerateProposal }) {
  const activeLang = lang || 'en'
  const t = fieldTranslations[activeLang]

  const [mode, setMode] = useState('template') // 'template' or 'chat'
  
  // Chat state
  const [sessionId, setSessionId] = useState('')
  const [messages, setMessages] = useState([])
  const [inputText, setInputText] = useState('')
  const [loading, setLoading] = useState(false)
  const [completed, setCompleted] = useState(false)
  const [profile, setProfile] = useState({})
  const [options, setOptions] = useState([])
  const chatEndRef = useRef(null)

  // Linking states
  const [linking, setLinking] = useState(false)
  const [linked, setLinked] = useState(false)
  const [linkError, setLinkError] = useState('')

  // Template Form states
  const [formLoading, setFormLoading] = useState(false)
  const [formSuccess, setFormSuccess] = useState('')
  const [formError, setFormError] = useState('')
  const [savedProjectId, setSavedProjectId] = useState(null)
  
  // Researcher Form State
  const [resForm, setResForm] = useState({
    name: '',
    institution: '',
    country: '',
    nationality: '',
    residing_country: '',
    is_syrian_diaspora: false,
    department: '',
    position: '',
    expertise: '',
    skills: '',
    interests: '',
    languages: '',
    availability: '',
    preferred_collaborations: 'Medium'
  })

  // Project Owner Form & Projects list state
  const [ownedProjects, setOwnedProjects] = useState([])
  const [editingProject, setEditingProject] = useState(null) // null = list, 'new' = new form, object = edit form
  const [projForm, setProjForm] = useState({
    title: '',
    organization: '',
    description: '',
    sector: '',
    location: '',
    budget: '',
    timeline: '',
    priority: 'Medium',
    required_skills: '',
    sdgs: []
  })

  const linkProfileToAccount = async () => {
    setLinking(true)
    setLinkError('')
    try {
      const token = localStorage.getItem('auth_token')
      const res = await fetch('/api/chat/link', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ session_id: sessionId })
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.detail || t.failedLinkProfile)
      setLinked(true)
      if (data.project_id) {
        setSavedProjectId(data.project_id)
      }
    } catch (err) {
      setLinkError(err.message)
    } finally {
      setLinking(false)
    }
  }

  // Start chat session
  useEffect(() => {
    const startSession = async () => {
      try {
        const res = await fetch(`/api/chat/start?user_type=${type}&lang=${activeLang}`, { method: 'POST' })
        if (res.ok) {
          const data = await res.json()
          setSessionId(data.session_id)
          setMessages([{ role: 'assistant', content: data.response }])
          setProfile(data.profile || {})
          if (data.options) {
            setOptions(data.options)
          } else {
            setOptions([])
          }
        } else {
          let errDetail = 'Could not start session'
          try { const e = await res.json(); errDetail = e.detail || errDetail } catch (_) {}
          console.error('Error starting chat session:', res.status, errDetail)
          setMessages([{ role: 'assistant', content: t.failedConnectInterviewer.replace('STATUS_CODE', res.status) }])
        }
      } catch (err) {
        console.error('Error starting chat session:', err)
        setMessages([{ role: 'assistant', content: t.couldNotConnectServer }])
      }
    }
    startSession()
  }, [type, activeLang])

  // Scroll to bottom on new messages
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, options])

  // Fetch profiles/projects on mount or login
  useEffect(() => {
    if (currentUser && mode === 'template') {
      if (type === 'researcher') {
        fetchResProfile()
      } else if (type === 'project_owner') {
        fetchOwnedProjects()
      }
    }
  }, [currentUser, type, mode])

  // Sync project form when editingProject changes
  useEffect(() => {
    if (editingProject && editingProject !== 'new') {
      setProjForm({
        title: editingProject.title || '',
        organization: editingProject.organization || '',
        description: editingProject.description || '',
        sector: editingProject.sector || '',
        location: editingProject.location || '',
        budget: editingProject.budget || '',
        timeline: editingProject.timeline || '',
        priority: editingProject.priority || 'Medium',
        required_skills: Array.isArray(editingProject.required_skills) 
          ? editingProject.required_skills.join(', ') 
          : (typeof editingProject.required_skills === 'string' 
             ? JSON.parse(editingProject.required_skills).join(', ') 
             : ''),
        sdgs: Array.isArray(editingProject.sdgs) 
          ? editingProject.sdgs 
          : (typeof editingProject.sdgs === 'string' 
             ? JSON.parse(editingProject.sdgs) 
             : [])
      })
    } else {
      setProjForm({
        title: '',
        organization: '',
        description: '',
        sector: '',
        location: '',
        budget: '',
        timeline: '',
        priority: 'Medium',
        required_skills: '',
        sdgs: []
      })
    }
  }, [editingProject])

  const fetchResProfile = async () => {
    try {
      const token = localStorage.getItem('auth_token')
      const res = await fetch(`/api/profile/researcher?lang=${activeLang}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      })
      if (res.ok) {
        const data = await res.json()
        setResForm({
          name: data.name || '',
          institution: data.institution || '',
          country: data.country || '',
          nationality: data.nationality || '',
          residing_country: data.residing_country || '',
          is_syrian_diaspora: data.is_syrian_diaspora || false,
          department: data.department || '',
          position: data.position || '',
          expertise: data.expertise || '',
          skills: Array.isArray(data.skills) ? data.skills.join(', ') : '',
          interests: Array.isArray(data.interests) ? data.interests.join(', ') : '',
          languages: Array.isArray(data.languages) ? data.languages.join(', ') : '',
          availability: data.availability || '',
          preferred_collaborations: Array.isArray(data.preferred_collaborations) 
            ? (data.preferred_collaborations[0] || 'Medium') 
            : (data.preferred_collaborations || 'Medium')
        })
      }
    } catch (err) {
      console.error('Error fetching researcher profile:', err)
    }
  }

  const fetchOwnedProjects = async () => {
    try {
      const token = localStorage.getItem('auth_token')
      const res = await fetch(`/api/profile/projects?lang=${activeLang}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      })
      if (res.ok) {
        const data = await res.json()
        setOwnedProjects(data)
      }
    } catch (err) {
      console.error('Error fetching owned projects:', err)
    }
  }

  const handleResSubmit = async (e) => {
    e.preventDefault()
    setFormLoading(true)
    setFormSuccess('')
    setFormError('')
    try {
      const token = localStorage.getItem('auth_token')
      const res = await fetch(`/api/profile/researcher?lang=${activeLang}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          name: resForm.name,
          institution: resForm.institution,
          country: resForm.residing_country || resForm.country,
          nationality: resForm.nationality,
          residing_country: resForm.residing_country,
          is_syrian_diaspora: resForm.is_syrian_diaspora,
          department: resForm.department,
          position: resForm.position,
          expertise: resForm.expertise,
          skills: resForm.skills.split(',').map(s => s.trim()).filter(Boolean),
          interests: resForm.interests.split(',').map(i => i.trim()).filter(Boolean),
          languages: resForm.languages.split(',').map(l => l.trim()).filter(Boolean),
          availability: resForm.availability,
          preferred_collaborations: resForm.preferred_collaborations
        })
      })
      if (res.ok) {
        setFormSuccess(t.successResSaved)
        fetchResProfile()
        setTimeout(() => setFormSuccess(''), 3000)
      } else {
        const data = await res.json()
        throw new Error(data.detail || t.failedSaveResearcher)
      }
    } catch (err) {
      setFormError(err.message)
    } finally {
      setFormLoading(false)
    }
  }

  const handleProjSubmit = async (e) => {
    e.preventDefault()
    setFormLoading(true)
    setFormSuccess('')
    setFormError('')

    const isNew = editingProject === 'new'
    const url = isNew ? `/api/profile/projects?lang=${activeLang}` : `/api/profile/projects/${editingProject.id}?lang=${activeLang}`
    const method = isNew ? 'POST' : 'PUT'

    try {
      const token = localStorage.getItem('auth_token')
      const res = await fetch(url, {
        method: method,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          title: projForm.title,
          organization: projForm.organization,
          description: projForm.description,
          sector: projForm.sector,
          location: projForm.location,
          budget: projForm.budget,
          timeline: projForm.timeline,
          priority: projForm.priority,
          required_skills: projForm.required_skills.split(',').map(s => s.trim()).filter(Boolean),
          sdgs: projForm.sdgs
        })
      })
      if (res.ok) {
        const data = await res.json()
        setFormSuccess(isNew ? t.successProjSaved : t.successProjUpdated)
        if (data.project && data.project.id) {
          setSavedProjectId(data.project.id)
        }
        setTimeout(() => setFormSuccess(''), 5000)
        setEditingProject(null)
        fetchOwnedProjects()
      } else {
        const data = await res.json()
        throw new Error(data.detail || t.failedSaveProject)
      }
    } catch (err) {
      setFormError(err.message)
    } finally {
      setFormLoading(false)
    }
  }

  const sendMessage = async (msgText) => {
    if (!msgText.trim() || loading || completed) return

    setMessages(prev => [...prev, { role: 'user', content: msgText }])
    setLoading(true)
    setOptions([])

    try {
      const res = await fetch('/api/chat/message', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ session_id: sessionId, message: msgText })
      })

      if (res.ok) {
        const data = await res.json()
        setMessages(prev => [...prev, { role: 'assistant', content: data.response }])
        setCompleted(data.completed)
        if (data.profile) {
          setProfile(data.profile)
        }
        if (data.options) {
          setOptions(data.options)
        } else {
          setOptions([])
        }
      } else {
        // Handle server-side errors (e.g., 500) gracefully
        let errDetail = t.unknownServerError
        try {
          const errData = await res.json()
          errDetail = errData.detail || errDetail
        } catch (_) {}
        console.error('Server error in chat:', res.status, errDetail)
        const errText = t.agentErrorText.replace('STATUS_CODE', res.status).replace('ERROR_DETAIL', errDetail)
        setMessages(prev => [...prev, { role: 'assistant', content: errText }])
      }
    } catch (err) {
      console.error('Error posting chat message:', err)
      setMessages(prev => [...prev, { role: 'assistant', content: t.communicationError }])
    } finally {
      setLoading(false)
    }
  }

  const handleSend = (e) => {
    e.preventDefault()
    if (!inputText.trim()) return
    const text = inputText
    setInputText('')
    sendMessage(text)
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', height: 'calc(100vh - 180px)' }}>
      
      {/* Mode Switcher Segmented Control */}
      <div className="glass-panel" style={{ 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'space-between', 
        padding: '12px 20px', 
        borderRadius: '14px',
        flexShrink: 0
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          {type === 'researcher' ? <User size={18} color="var(--color-primary)" /> : <Building size={18} color="var(--color-primary)" />}
          <span style={{ fontSize: '0.95rem', fontWeight: 600, color: 'var(--text-primary)' }}>
            {type === 'researcher' ? (activeLang === 'ar' ? 'تسجيل الباحث الخبير' : 'Register Researcher Profile') : (activeLang === 'ar' ? 'تسجيل وإدارة مشاريع الإعمار' : 'Register & Manage Projects')}
          </span>
        </div>
        <div style={{
          display: 'flex',
          backgroundColor: 'rgba(0, 0, 0, 0.25)',
          borderRadius: '10px',
          padding: '3px',
          border: '1px solid var(--border-color)'
        }}>
          <button
            onClick={() => setMode('template')}
            style={{
              padding: '8px 16px',
              borderRadius: '8px',
              border: 0,
              fontSize: '0.8rem',
              fontWeight: 600,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              transition: 'all 0.2s ease',
              backgroundColor: mode === 'template' ? 'var(--color-primary)' : 'transparent',
              color: mode === 'template' ? '#000000' : 'var(--text-secondary)'
            }}
          >
            <ClipboardList size={14} />
            <span>{t.classicForm}</span>
          </button>
          <button
            onClick={() => setMode('chat')}
            style={{
              padding: '8px 16px',
              borderRadius: '8px',
              border: 0,
              fontSize: '0.8rem',
              fontWeight: 600,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              transition: 'all 0.2s ease',
              backgroundColor: mode === 'chat' ? 'var(--color-primary)' : 'transparent',
              color: mode === 'chat' ? '#000000' : 'var(--text-secondary)'
            }}
          >
            <Sparkles size={14} />
            <span>{t.aiChat}</span>
          </button>
        </div>
      </div>

      {/* Main Content Area based on Mode */}
      {mode === 'chat' ? (
        <div className="animate-fade-in grid-cols-2" style={{ display: 'grid', gridTemplateColumns: '1.2fr 0.8fr', gap: '20px', flexGrow: 1, minHeight: 0 }}>
          {/* Left Pane: Chat Interface */}
          <div className="glass-panel chat-container" style={{ display: 'flex', flexDirection: 'column', height: '100%', minHeight: 0 }}>
            <div style={{ padding: '14px 20px', borderBottom: '1px solid var(--border-color)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <div style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: 'var(--color-primary)' }} />
                <span style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-secondary)' }}>
                  {type === 'researcher' ? t.interviewTitleResearcher : t.interviewTitleProject}
                </span>
              </div>
            </div>

            <div className="chat-history" style={{ flexGrow: 1, overflowY: 'auto' }}>
              {messages.map((msg, idx) => (
                <div key={idx} className={`chat-bubble ${msg.role}`}>
                  {msg.content.split('\n').map((line, lidx) => (
                    <p key={lidx} style={{ marginBottom: line ? '8px' : '0px' }}>
                      {/* Process basic bold markdown */}
                      {line.split('**').map((part, pidx) => pidx % 2 === 1 ? <strong key={pidx}>{part}</strong> : part)}
                    </p>
                  ))}
                </div>
              ))}
              {loading && (
                <div className="chat-bubble assistant" style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '10px 16px' }}>
                  <div style={{ display: 'flex', gap: '4px' }}>
                    <span className="dot" style={{ width: '8px', height: '8px', backgroundColor: 'var(--text-secondary)', borderRadius: '50%', animation: 'bounce 1.4s infinite ease-in-out' }} />
                    <span className="dot" style={{ width: '8px', height: '8px', backgroundColor: 'var(--text-secondary)', borderRadius: '50%', animation: 'bounce 1.4s infinite ease-in-out 0.2s' }} />
                    <span className="dot" style={{ width: '8px', height: '8px', backgroundColor: 'var(--text-secondary)', borderRadius: '50%', animation: 'bounce 1.4s infinite ease-in-out 0.4s' }} />
                  </div>
                  <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                    {activeLang === 'ar' ? 'جاري التحليل...' : 'AI is thinking...'}
                  </span>
                </div>
              )}
              <div ref={chatEndRef} />
            </div>

            {/* Quick reply options */}
            {options && options.length > 0 && !loading && !completed && (
              <div style={{
                padding: '10px 20px',
                display: 'flex',
                flexWrap: 'wrap',
                gap: '8px',
                borderTop: '1px solid var(--border-color)',
                background: 'rgba(255,255,255,0.01)'
              }}>
                {options.map((opt, oIdx) => (
                  <button
                    key={oIdx}
                    type="button"
                    onClick={() => sendMessage(opt)}
                    className="btn btn-secondary"
                    style={{
                      padding: '8px 14px',
                      borderRadius: '18px',
                      fontSize: '0.8rem',
                      cursor: 'pointer',
                      border: '1px solid rgba(6, 182, 212, 0.3)',
                      background: 'rgba(6, 182, 212, 0.05)',
                      color: 'var(--text-primary)',
                      transition: 'all 0.2s ease',
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.background = 'rgba(6, 182, 212, 0.15)';
                      e.currentTarget.style.borderColor = 'var(--color-primary)';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.background = 'rgba(6, 182, 212, 0.05)';
                      e.currentTarget.style.borderColor = 'rgba(6, 182, 212, 0.3)';
                    }}
                  >
                    {opt}
                  </button>
                ))}
              </div>
            )}

            <form onSubmit={handleSend} className="chat-input-area" style={{ position: 'relative', display: 'flex', gap: '8px', alignItems: 'center' }}>
              <input
                type="text"
                className="chat-input"
                placeholder={completed ? t.placeholderCompleted : t.placeholderActive}
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                disabled={loading || completed}
                style={{ paddingRight: '12px', flexGrow: 1 }}
              />
              <button
                type="submit"
                className="btn btn-primary"
                disabled={loading || completed || !inputText.trim()}
                style={{ borderRadius: '12px', padding: '12px', flexShrink: 0 }}
              >
                {loading ? <Loader2 size={18} className="animate-spin" /> : <Send size={18} style={{ transform: activeLang === 'ar' ? 'scaleX(-1)' : 'none' }} />}
              </button>
            </form>
          </div>

          {/* Right Pane: Live Profile Extraction Status */}
          <div className="glass-panel" style={{ padding: '24px', display: 'flex', flexDirection: 'column', height: '100%', overflowY: 'auto' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '20px', borderBottom: '1px solid var(--border-color)', paddingBottom: '12px' }}>
              <Sparkles size={18} color="var(--color-primary)" />
              <h3 style={{ fontSize: '1.2rem' }}>{t.infoExtraction}</h3>
            </div>

            {completed ? (
              <div style={{ textAlign: 'center', margin: '20px 0', padding: '20px', background: 'rgba(16, 185, 129, 0.1)', border: '1px dashed var(--color-accent)', borderRadius: '12px', display: 'flex', flexDirection: 'column', gap: '12px', alignItems: 'center' }}>
                <ClipboardCheck size={36} color="var(--color-accent)" style={{ margin: '0 auto 4px' }} />
                <div>
                  <h4 style={{ color: '#a7f3d0', marginBottom: '4px' }}>{t.profileFinalized}</h4>
                  <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>{t.profileFinalizedDesc}</p>
                </div>

                {linked ? (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', alignItems: 'center', width: '100%' }}>
                    <span style={{ fontSize: '0.85rem', color: '#a7f3d0', fontWeight: 600 }}>{t.linkedSuccess}</span>
                    <div style={{ display: 'flex', gap: '8px', width: '100%' }}>
                      <button
                        type="button"
                        onClick={() => setActivePage('dashboard')}
                        className="btn btn-secondary"
                        style={{ flexGrow: 1, padding: '8px', fontSize: '0.8rem' }}
                      >
                        {activeLang === 'ar' ? 'الذهاب إلى لوحة التحكم' : 'Go to Dashboard'}
                      </button>
                      {savedProjectId && (
                        <button
                          type="button"
                          onClick={() => onGenerateProposal(savedProjectId)}
                          className="btn btn-primary"
                          style={{ flexGrow: 1, padding: '8px', fontSize: '0.8rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '4px' }}
                        >
                          <Sparkles size={12} />
                          <span>{activeLang === 'ar' ? 'إنشاء مقترح' : 'Generate Proposal'}</span>
                        </button>
                      )}
                    </div>
                  </div>
                ) : currentUser ? (
                  <button 
                    type="button"
                    onClick={linkProfileToAccount}
                    disabled={linking}
                    className="btn btn-primary"
                    style={{ width: '100%', padding: '8px', fontSize: '0.8rem', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '6px' }}
                  >
                    {linking ? <Loader2 size={12} className="animate-spin" /> : null}
                    <span>{linking ? (activeLang === 'ar' ? 'جاري الربط...' : 'Linking...') : t.saveLinkAccount}</span>
                  </button>
                ) : (
                  <button 
                    type="button"
                    onClick={openLogin}
                    className="btn btn-secondary"
                    style={{ width: '100%', padding: '8px', fontSize: '0.8rem' }}
                  >
                    {t.signInSave}
                  </button>
                )}

                {linkError && (
                  <span style={{ fontSize: '0.75rem', color: 'var(--color-error)' }}>{linkError}</span>
                )}
              </div>
            ) : (
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem', marginBottom: '20px' }}>
                {t.nlpAgentMessage}
              </p>
            )}

            <div style={{ display: 'flex', flexDirection: 'column', gap: '14px', flexGrow: 1 }}>
              {type === 'project_owner' ? (
                <>
                  <ProfileField label={t.projectName} value={profile.project_title} lang={activeLang} />
                  <ProfileField label={t.sector} value={profile.sector} lang={activeLang} />
                  <ProfileField label={t.location} value={profile.preferred_location} lang={activeLang} />
                  <ProfileField label={t.budget} value={profile.budget} lang={activeLang} />
                  <ProfileField label={t.timeline} value={profile.timeline} lang={activeLang} />
                  <ProfileField label={t.trl} value={profile.technology_readiness_level} lang={activeLang} />
                  <ProfileField label={t.collabStyle} value={profile.collaboration_type} lang={activeLang} />
                  <ProfileField label={t.skillsRequired} value={profile.required_skills?.join(', ')} lang={activeLang} />
                  <ProfileField label={t.sdgsAligned} value={profile.sdgs?.map(s => `SDG ${s}`).join(', ')} lang={activeLang} />
                  <ProfileField label={activeLang === 'ar' ? "الأولوية" : "Priority"} value={profile.priority} lang={activeLang} />
                  
                  {/* High-fidelity additional fields */}
                  {profile.motivation && <ProfileField label={activeLang === 'ar' ? "الدافع للمشروع" : "Project Motivation"} value={profile.motivation} lang={activeLang} />}
                  {profile.novelty_innovation && <ProfileField label={activeLang === 'ar' ? "الابتكار والتطوير" : "Novelty & Innovation"} value={profile.novelty_innovation} lang={activeLang} />}
                  {profile.current_stage && <ProfileField label={activeLang === 'ar' ? "مرحلة التطوير الحالية" : "Current Development Stage"} value={profile.current_stage} lang={activeLang} />}
                  {profile.technical_approach && <ProfileField label={activeLang === 'ar' ? "النهج التقني" : "Technical Approach"} value={profile.technical_approach} lang={activeLang} />}
                  {profile.required_equipment && profile.required_equipment.length > 0 && <ProfileField label={activeLang === 'ar' ? "المعدات المطلوبة" : "Required Equipment"} value={profile.required_equipment?.join(', ')} lang={activeLang} />}
                  {profile.funding_status && <ProfileField label={activeLang === 'ar' ? "حالة التمويل" : "Funding Status"} value={profile.funding_status} lang={activeLang} />}
                  {profile.milestones && profile.milestones.length > 0 && <ProfileField label={activeLang === 'ar' ? "المحطات الرئيسية" : "Key Milestones"} value={profile.milestones?.join(', ')} lang={activeLang} />}
                  {profile.risks_mitigation && <ProfileField label={activeLang === 'ar' ? "المخاطر والتخفيف منها" : "Risks & Mitigation"} value={profile.risks_mitigation} lang={activeLang} />}
                  {profile.existing_collaborators && profile.existing_collaborators.length > 0 && <ProfileField label={activeLang === 'ar' ? "الشركاء الحاليين" : "Existing Collaborators"} value={profile.existing_collaborators?.join(', ')} lang={activeLang} />}
                  {profile.ip_status && <ProfileField label={activeLang === 'ar' ? "الملكية الفكرية" : "Intellectual Property"} value={profile.ip_status} lang={activeLang} />}
                  {profile.datasets_involved && profile.datasets_involved.length > 0 && <ProfileField label={activeLang === 'ar' ? "البيانات المعنية" : "Datasets Involved"} value={profile.datasets_involved?.join(', ')} lang={activeLang} />}
                  {profile.software_hardware && profile.software_hardware.length > 0 && <ProfileField label={activeLang === 'ar' ? "الأجهزة والبرمجيات" : "Software & Hardware"} value={profile.software_hardware?.join(', ')} lang={activeLang} />}
                  {profile.target_beneficiaries && <ProfileField label={activeLang === 'ar' ? "الفئة المستهدفة" : "Target Beneficiaries"} value={profile.target_beneficiaries} lang={activeLang} />}
                  {profile.scalability_potential && <ProfileField label={activeLang === 'ar' ? "قابلية التوسع" : "Scalability Potential"} value={profile.scalability_potential} lang={activeLang} />}
                  {profile.commercialization_plan && <ProfileField label={activeLang === 'ar' ? "خطة الترويج التجاري" : "Commercialization Plan"} value={profile.commercialization_plan} lang={activeLang} />}
                  {profile.future_vision && <ProfileField label={activeLang === 'ar' ? "الرؤية المستقبلية" : "Future Vision"} value={profile.future_vision} lang={activeLang} />}
                </>
              ) : (
                <>
                  <ProfileField label={t.fullName} value={profile.name} lang={activeLang} />
                  <ProfileField label={t.institution} value={profile.institution} lang={activeLang} />
                  <ProfileField label={t.residing_country} value={profile.residing_country || profile.country} lang={activeLang} />
                  <ProfileField label={t.nationality} value={profile.nationality} lang={activeLang} />
                  <ProfileField label={t.is_syrian_diaspora} value={profile.is_syrian_diaspora === true || profile.is_syrian_diaspora === 'true' ? (activeLang === 'ar' ? 'نعم (مغترب)' : 'Yes (Diaspora)') : (activeLang === 'ar' ? 'لا' : 'No')} lang={activeLang} />
                  <ProfileField label={activeLang === 'ar' ? "القسم" : "Department"} value={profile.department} lang={activeLang} />
                  <ProfileField label={t.position} value={profile.position} lang={activeLang} />
                  <ProfileField label={t.expertise} value={profile.expertise} lang={activeLang} />
                  <ProfileField label={t.languages} value={profile.languages?.join(', ')} lang={activeLang} />
                  <ProfileField label={t.availableTime} value={profile.available_time} lang={activeLang} />
                  <ProfileField label={activeLang === 'ar' ? "توقعات التمويل" : "Funding Expectations"} value={profile.funding_expectations} lang={activeLang} />
                  <ProfileField label={activeLang === 'ar' ? "حجم المشروع المفضل" : "Preferred Project Scale"} value={profile.preferred_project_size} lang={activeLang} />
                  <ProfileField label={t.sdgsAligned} value={profile.sdgs?.map(s => `SDG ${s}`).join(', ')} lang={activeLang} />
                  
                  {/* High-fidelity additional fields */}
                  {profile.motivation && <ProfileField label={activeLang === 'ar' ? "الدافع والاهتمام" : "Motivation & Interest"} value={profile.motivation} lang={activeLang} />}
                  {profile.novelty_innovation && <ProfileField label={activeLang === 'ar' ? "الابتكار العلمي" : "Research Novelty"} value={profile.novelty_innovation} lang={activeLang} />}
                  {profile.technical_approach && <ProfileField label={activeLang === 'ar' ? "النهج البحثي" : "Technical Approach"} value={profile.technical_approach} lang={activeLang} />}
                  {profile.datasets_created && profile.datasets_created.length > 0 && <ProfileField label={activeLang === 'ar' ? "مجموعات البيانات" : "Datasets Created"} value={profile.datasets_created?.join(', ')} lang={activeLang} />}
                  {profile.target_beneficiaries && <ProfileField label={activeLang === 'ar' ? "المستفيدون المستهدفون" : "Target Beneficiaries"} value={profile.target_beneficiaries} lang={activeLang} />}
                  {profile.scalability_potential && <ProfileField label={activeLang === 'ar' ? "تطبيقات البحث الواقعية" : "Real-world Adaptability"} value={profile.scalability_potential} lang={activeLang} />}
                  {profile.future_vision && <ProfileField label={activeLang === 'ar' ? "الرؤية المستقبلية" : "Future Vision"} value={profile.future_vision} lang={activeLang} />}
                  {profile.collaboration_opportunities && <ProfileField label={activeLang === 'ar' ? "فرص التعاون المطلوبة" : "Collaboration Opportunities"} value={profile.collaboration_opportunities} lang={activeLang} />}
                </>
              )}
            </div>
          </div>
        </div>
      ) : (
        /* Classic Template Form Mode */
        <div className="animate-fade-in" style={{ flexGrow: 1, overflowY: 'auto', minHeight: 0, paddingRight: '4px' }}>
          {!currentUser ? (
            /* Auth Required screen */
            <div className="glass-panel" style={{ 
              padding: '40px', 
              textAlign: 'center', 
              display: 'flex', 
              flexDirection: 'column', 
              alignItems: 'center', 
              gap: '20px', 
              margin: '40px auto', 
              maxWidth: '500px'
            }}>
              <div style={{
                width: '64px',
                height: '64px',
                borderRadius: '50%',
                backgroundColor: 'rgba(6, 182, 212, 0.1)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                border: '1px solid rgba(6, 182, 212, 0.25)'
              }}>
                <AlertTriangle size={32} color="var(--color-primary)" />
              </div>
              <div>
                <h3 style={{ fontSize: '1.3rem', color: 'var(--text-primary)', marginBottom: '8px' }}>
                  {t.signInTitle}
                </h3>
                <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', lineHeight: '1.5' }}>
                  {t.signInDesc}
                </p>
              </div>
              <button 
                onClick={openLogin} 
                className="btn btn-primary" 
                style={{ padding: '12px 24px', fontSize: '0.9rem', width: '100%' }}
              >
                {t.signInBtn}
              </button>
            </div>
          ) : type === 'researcher' ? (
            /* Researcher Core Form */
            <div className="glass-panel" style={{ padding: '30px', maxWidth: '800px', margin: '0 auto 20px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px', borderBottom: '1px solid var(--border-color)', paddingBottom: '16px' }}>
                <h3 style={{ fontSize: '1.25rem', color: 'var(--text-primary)' }}>
                  {activeLang === 'ar' ? 'نموذج معلومات الباحث الأكاديمي' : 'Researcher Professional Details'}
                </h3>
                <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                  {activeLang === 'ar' ? 'يتم الفهرسة تلقائياً للبحث الدلالي' : 'Automatically indexed in semantic search'}
                </span>
              </div>

              <form onSubmit={handleResSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    <label style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase' }}>{t.fullName}</label>
                    <input
                      type="text"
                      required
                      value={resForm.name}
                      onChange={(e) => setResForm({ ...resForm, name: e.target.value })}
                      style={{ padding: '10px', backgroundColor: 'rgba(255,255,255,0.02)', border: '1px solid var(--border-color)', borderRadius: '8px', color: 'var(--text-primary)' }}
                    />
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    <label style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase' }}>{t.position}</label>
                    <input
                      type="text"
                      required
                      value={resForm.position}
                      onChange={(e) => setResForm({ ...resForm, position: e.target.value })}
                      placeholder={t.positionPlaceholder}
                      style={{ padding: '10px', backgroundColor: 'rgba(255,255,255,0.02)', border: '1px solid var(--border-color)', borderRadius: '8px', color: 'var(--text-primary)' }}
                    />
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    <label style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase' }}>{t.institution}</label>
                    <input
                      type="text"
                      required
                      value={resForm.institution}
                      onChange={(e) => setResForm({ ...resForm, institution: e.target.value })}
                      style={{ padding: '10px', backgroundColor: 'rgba(255,255,255,0.02)', border: '1px solid var(--border-color)', borderRadius: '8px', color: 'var(--text-primary)' }}
                    />
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    <label style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase' }}>{t.residing_country}</label>
                    <input
                      type="text"
                      required
                      value={resForm.residing_country || resForm.country}
                      onChange={(e) => setResForm({ ...resForm, residing_country: e.target.value, country: e.target.value })}
                      style={{ padding: '10px', backgroundColor: 'rgba(255,255,255,0.02)', border: '1px solid var(--border-color)', borderRadius: '8px', color: 'var(--text-primary)' }}
                    />
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    <label style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase' }}>{t.nationality}</label>
                    <input
                      type="text"
                      required
                      value={resForm.nationality}
                      onChange={(e) => setResForm({ ...resForm, nationality: e.target.value })}
                      placeholder={t.nationalityPlaceholder}
                      style={{ padding: '10px', backgroundColor: 'rgba(255,255,255,0.02)', border: '1px solid var(--border-color)', borderRadius: '8px', color: 'var(--text-primary)' }}
                    />
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    <label style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase' }}>{t.is_syrian_diaspora}</label>
                    <select
                      value={resForm.is_syrian_diaspora ? 'true' : 'false'}
                      onChange={(e) => setResForm({ ...resForm, is_syrian_diaspora: e.target.value === 'true' })}
                      style={{ padding: '10px', backgroundColor: 'rgba(255,255,255,0.02)', border: '1px solid var(--border-color)', borderRadius: '8px', color: 'var(--text-primary)', outline: 'none', cursor: 'pointer' }}
                    >
                      <option value="false" style={{ background: 'var(--bg-surface-solid)' }}>{activeLang === 'ar' ? 'لا / مقيم في سوريا' : 'No / Resides in Syria'}</option>
                      <option value="true" style={{ background: 'var(--bg-surface-solid)' }}>{activeLang === 'ar' ? 'نعم، مغترب سوري' : 'Yes, Syrian living abroad (Diaspora)'}</option>
                    </select>
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    <label style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase' }}>{t.department}</label>
                    <input
                      type="text"
                      value={resForm.department}
                      onChange={(e) => setResForm({ ...resForm, department: e.target.value })}
                      placeholder={t.departmentPlaceholder}
                      style={{ padding: '10px', backgroundColor: 'rgba(255,255,255,0.02)', border: '1px solid var(--border-color)', borderRadius: '8px', color: 'var(--text-primary)' }}
                    />
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    <label style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase' }}>{t.availableTime}</label>
                    <input
                      type="text"
                      value={resForm.availability}
                      onChange={(e) => setResForm({ ...resForm, availability: e.target.value })}
                      placeholder={t.availabilityPlaceholder}
                      style={{ padding: '10px', backgroundColor: 'rgba(255,255,255,0.02)', border: '1px solid var(--border-color)', borderRadius: '8px', color: 'var(--text-primary)' }}
                    />
                  </div>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  <label style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase' }}>{t.expertise}</label>
                  <textarea
                    rows={4}
                    required
                    value={resForm.expertise}
                    onChange={(e) => setResForm({ ...resForm, expertise: e.target.value })}
                    placeholder="Provide a comprehensive summary of your academic expertise, technical skills, and how you can support post-war reconstruction projects..."
                    style={{ padding: '10px', backgroundColor: 'rgba(255,255,255,0.02)', border: '1px solid var(--border-color)', borderRadius: '8px', color: 'var(--text-primary)', resize: 'vertical' }}
                  />
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  <label style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase' }}>{t.technicalSkills}</label>
                  <input
                    type="text"
                    value={resForm.skills}
                    onChange={(e) => setResForm({ ...resForm, skills: e.target.value })}
                    placeholder={t.skillsPlaceholder}
                    style={{ padding: '10px', backgroundColor: 'rgba(255,255,255,0.02)', border: '1px solid var(--border-color)', borderRadius: '8px', color: 'var(--text-primary)' }}
                  />
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  <label style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase' }}>{t.researchInterests}</label>
                  <input
                    type="text"
                    value={resForm.interests}
                    onChange={(e) => setResForm({ ...resForm, interests: e.target.value })}
                    placeholder={t.interestsPlaceholder}
                    style={{ padding: '10px', backgroundColor: 'rgba(255,255,255,0.02)', border: '1px solid var(--border-color)', borderRadius: '8px', color: 'var(--text-primary)' }}
                  />
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  <label style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase' }}>{t.languages}</label>
                  <input
                    type="text"
                    value={resForm.languages}
                    onChange={(e) => setResForm({ ...resForm, languages: e.target.value })}
                    placeholder={t.languagesPlaceholder}
                    style={{ padding: '10px', backgroundColor: 'rgba(255,255,255,0.02)', border: '1px solid var(--border-color)', borderRadius: '8px', color: 'var(--text-primary)' }}
                  />
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  <label style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase' }}>{t.preferredCollaborations}</label>
                  <select
                    value={resForm.preferred_collaborations || 'Medium'}
                    onChange={(e) => setResForm({ ...resForm, preferred_collaborations: e.target.value })}
                    style={{ padding: '10px', backgroundColor: 'rgba(255,255,255,0.02)', border: '1px solid var(--border-color)', borderRadius: '8px', color: 'var(--text-primary)', outline: 'none', cursor: 'pointer' }}
                  >
                    <option value="Small" style={{ background: 'var(--bg-surface-solid)' }}>{t.smallScale}</option>
                    <option value="Medium" style={{ background: 'var(--bg-surface-solid)' }}>{t.mediumScale}</option>
                    <option value="Large" style={{ background: 'var(--bg-surface-solid)' }}>{t.largeScale}</option>
                  </select>
                </div>

                {formError && <div style={{ color: 'var(--color-error)', fontSize: '0.85rem' }}>{formError}</div>}
                {formSuccess && (
                  <div style={{ 
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '10px',
                    padding: '10px 14px',
                    backgroundColor: 'rgba(16, 185, 129, 0.1)',
                    border: '1px solid var(--color-accent)',
                    borderRadius: '8px',
                    width: '100%'
                  }}>
                    <div style={{ color: '#a7f3d0', fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <CheckCircle2 size={16} />
                      <span>{formSuccess}</span>
                    </div>
                    <button
                      type="button"
                      onClick={() => setActivePage('dashboard')}
                      className="btn btn-secondary"
                      style={{ padding: '6px 12px', fontSize: '0.8rem', alignSelf: 'flex-start' }}
                    >
                      {activeLang === 'ar' ? 'الذهاب إلى لوحة التحكم' : 'Go to Dashboard'}
                    </button>
                  </div>
                )}

                <button
                  type="submit"
                  disabled={formLoading}
                  className="btn btn-primary"
                  style={{
                    padding: '12px 24px',
                    alignSelf: 'flex-end',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    minWidth: '160px',
                    justifyContent: 'center'
                  }}
                >
                  {formLoading ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
                  <span>{formLoading ? (activeLang === 'ar' ? 'جاري الحفظ...' : 'Saving...') : t.saveProfile}</span>
                </button>
              </form>
            </div>
          ) : (
            /* Project Owner View (List & Forms) */
            <div style={{ maxWidth: '800px', margin: '0 auto 20px' }}>
              {editingProject === null ? (
                /* Projects List */
                <div className="glass-panel" style={{ padding: '30px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px', borderBottom: '1px solid var(--border-color)', paddingBottom: '16px' }}>
                    <h3 style={{ fontSize: '1.25rem', color: 'var(--text-primary)' }}>{t.ownedProjects}</h3>
                    <button
                      onClick={() => {
                        setEditingProject('new');
                        setFormSuccess('');
                        setSavedProjectId(null);
                      }}
                      className="btn btn-primary"
                      style={{ padding: '8px 14px', fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: '6px' }}
                    >
                      <PlusCircle size={16} />
                      <span>{t.newProjectBtn}</span>
                    </button>
                  </div>

                  {formSuccess && (
                    <div style={{ 
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '10px',
                      padding: '10px 14px',
                      backgroundColor: 'rgba(16, 185, 129, 0.1)',
                      border: '1px solid var(--color-accent)',
                      borderRadius: '8px',
                      width: '100%',
                      marginBottom: '20px'
                    }}>
                      <div style={{ color: '#a7f3d0', fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <CheckCircle2 size={16} />
                        <span>{formSuccess}</span>
                      </div>
                      <div style={{ display: 'flex', gap: '8px' }}>
                        <button
                          type="button"
                          onClick={() => setActivePage('dashboard')}
                          className="btn btn-secondary"
                          style={{ padding: '6px 12px', fontSize: '0.8rem' }}
                        >
                          {activeLang === 'ar' ? 'الذهاب إلى لوحة التحكم' : 'Go to Dashboard'}
                        </button>
                        {type === 'project_owner' && savedProjectId && (
                          <button
                            type="button"
                            onClick={() => onGenerateProposal(savedProjectId)}
                            className="btn btn-primary"
                            style={{ padding: '6px 12px', fontSize: '0.8rem', display: 'flex', alignItems: 'center', gap: '4px' }}
                          >
                            <Sparkles size={12} />
                            <span>{activeLang === 'ar' ? 'إنشاء مقترح التعاون' : 'Generate Proposal'}</span>
                          </button>
                        )}
                      </div>
                    </div>
                  )}

                  {ownedProjects.length === 0 ? (
                    <div style={{ textAlign: 'center', padding: '40px 20px', color: 'var(--text-muted)', border: '1px dashed var(--border-color)', borderRadius: '12px' }}>
                      <Briefcase size={40} style={{ margin: '0 auto 12px', color: 'rgba(255,255,255,0.1)' }} />
                      <p style={{ fontSize: '0.9rem' }}>{t.noProjects}</p>
                    </div>
                  ) : (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                      {ownedProjects.map(p => (
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
                            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '6px' }}>
                              <span style={{ fontSize: '0.75rem', padding: '2px 8px', borderRadius: '12px', backgroundColor: 'rgba(6, 182, 212, 0.1)', border: '1px solid rgba(6, 182, 212, 0.2)', color: 'var(--color-primary)', fontWeight: 600 }}>{p.sector}</span>
                              <span style={{ fontSize: '0.75rem', padding: '2px 8px', borderRadius: '12px', backgroundColor: 'rgba(255,255,255,0.05)', color: 'var(--text-secondary)' }}>{p.location}</span>
                            </div>
                            <h4 style={{ color: 'var(--text-primary)', fontSize: '1.1rem', marginBottom: '4px' }}>{p.title}</h4>
                            <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>{activeLang === 'ar' ? 'المنظمة: ' : 'Org: '} {p.organization || (activeLang === 'ar' ? 'مجهول' : 'Anonymous')}</p>
                          </div>
                          <div style={{ display: 'flex', gap: '8px' }}>
                            <button
                              type="button"
                              onClick={() => onGenerateProposal(p.id)}
                              className="btn btn-secondary"
                              style={{ padding: '8px 12px', fontSize: '0.8rem', display: 'flex', alignItems: 'center', gap: '6px', borderColor: 'rgba(6, 182, 212, 0.3)', backgroundColor: 'rgba(6, 182, 212, 0.05)' }}
                            >
                              <FileText size={14} style={{ color: 'var(--color-primary)' }} />
                              <span>{activeLang === 'ar' ? 'إنشاء مقترح' : 'Generate Proposal'}</span>
                            </button>
                            <button
                              type="button"
                              onClick={() => setEditingProject(p)}
                              className="btn btn-secondary"
                              style={{ padding: '8px 12px', fontSize: '0.8rem', display: 'flex', alignItems: 'center', gap: '6px' }}
                            >
                              <Edit3 size={14} />
                              <span>{activeLang === 'ar' ? 'تعديل' : 'Edit'}</span>
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              ) : (
                /* Project Creation / Editing Form */
                <div className="glass-panel" style={{ padding: '30px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px', borderBottom: '1px solid var(--border-color)', paddingBottom: '16px' }}>
                    <h3 style={{ fontSize: '1.25rem', color: 'var(--text-primary)' }}>
                      {editingProject === 'new' ? t.registerProject : t.editProject}
                    </h3>
                    <button
                      onClick={() => setEditingProject(null)}
                      className="btn btn-secondary"
                      style={{ padding: '6px 12px', fontSize: '0.8rem', display: 'flex', alignItems: 'center', gap: '4px' }}
                    >
                      <ArrowLeft size={14} />
                      <span>{activeLang === 'ar' ? 'إلغاء' : 'Cancel'}</span>
                    </button>
                  </div>

                  <form onSubmit={handleProjSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                        <label style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase' }}>{t.projectName}</label>
                        <input
                          type="text"
                          required
                          value={projForm.title}
                          onChange={(e) => setProjForm({ ...projForm, title: e.target.value })}
                          placeholder={t.projectTitlePlaceholder}
                          style={{ padding: '10px', backgroundColor: 'rgba(255,255,255,0.02)', border: '1px solid var(--border-color)', borderRadius: '8px', color: 'var(--text-primary)' }}
                        />
                      </div>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                        <label style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase' }}>{activeLang === 'ar' ? 'الجهة المالكة / المنظمة' : 'Organization / Owner'}</label>
                        <input
                          type="text"
                          required
                          value={projForm.organization}
                          onChange={(e) => setProjForm({ ...projForm, organization: e.target.value })}
                          placeholder={t.organizationPlaceholder}
                          style={{ padding: '10px', backgroundColor: 'rgba(255,255,255,0.02)', border: '1px solid var(--border-color)', borderRadius: '8px', color: 'var(--text-primary)' }}
                        />
                      </div>
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                        <label style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase' }}>{t.sector}</label>
                        <select
                          required
                          value={projForm.sector}
                          onChange={(e) => setProjForm({ ...projForm, sector: e.target.value })}
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
                        <label style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase' }}>{t.location}</label>
                        <select
                          required
                          value={projForm.location}
                          onChange={(e) => setProjForm({ ...projForm, location: e.target.value })}
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
                      <label style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase' }}>{activeLang === 'ar' ? 'توصيف المشكلة والتفاصيل' : 'Problem Statement & Description'}</label>
                      <textarea
                        rows={4}
                        required
                        value={projForm.description}
                        onChange={(e) => setProjForm({ ...projForm, description: e.target.value })}
                        placeholder="Detail the challenges, technical requirements, objectives, and expected impact on local communities..."
                        style={{ padding: '10px', backgroundColor: 'rgba(255,255,255,0.02)', border: '1px solid var(--border-color)', borderRadius: '8px', color: 'var(--text-primary)', resize: 'vertical' }}
                      />
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '20px' }}>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                        <label style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase' }}>{t.budget}</label>
                        <input
                          type="text"
                          value={projForm.budget}
                          onChange={(e) => setProjForm({ ...projForm, budget: e.target.value })}
                          placeholder={t.budgetPlaceholder}
                          style={{ padding: '10px', backgroundColor: 'rgba(255,255,255,0.02)', border: '1px solid var(--border-color)', borderRadius: '8px', color: 'var(--text-primary)' }}
                        />
                      </div>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                        <label style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase' }}>{t.timeline}</label>
                        <input
                          type="text"
                          value={projForm.timeline}
                          onChange={(e) => setProjForm({ ...projForm, timeline: e.target.value })}
                          placeholder={t.timelinePlaceholder}
                          style={{ padding: '10px', backgroundColor: 'rgba(255,255,255,0.02)', border: '1px solid var(--border-color)', borderRadius: '8px', color: 'var(--text-primary)' }}
                        />
                      </div>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                        <label style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase' }}>{activeLang === 'ar' ? 'مستوى الأولوية' : 'Priority Level'}</label>
                        <select
                          value={projForm.priority}
                          onChange={(e) => setProjForm({ ...projForm, priority: e.target.value })}
                          style={{ padding: '10px', backgroundColor: 'rgba(0,0,0,0.5)', border: '1px solid var(--border-color)', borderRadius: '8px', color: 'var(--text-primary)' }}
                        >
                          <option value="High">{t.priorityHigh}</option>
                          <option value="Medium">{t.priorityMedium}</option>
                          <option value="Low">{t.priorityLow}</option>
                        </select>
                      </div>
                    </div>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                      <label style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase' }}>{t.skillsRequired}</label>
                      <input
                        type="text"
                        value={projForm.required_skills}
                        onChange={(e) => setProjForm({ ...projForm, required_skills: e.target.value })}
                        placeholder={t.requiredSkillsPlaceholder}
                        style={{ padding: '10px', backgroundColor: 'rgba(255,255,255,0.02)', border: '1px solid var(--border-color)', borderRadius: '8px', color: 'var(--text-primary)' }}
                      />
                    </div>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                      <label style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase' }}>{t.sdgsAligned}</label>
                      <SdgGrid
                        selectedIds={projForm.sdgs}
                        onChange={(newSdgs) => setProjForm({ ...projForm, sdgs: newSdgs })}
                        selectable={true}
                        lang={activeLang}
                      />
                    </div>

                    {formError && <div style={{ color: 'var(--color-error)', fontSize: '0.85rem' }}>{formError}</div>}

                    <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
                      <button
                        type="button"
                        onClick={() => setEditingProject(null)}
                        className="btn btn-secondary"
                        style={{ padding: '12px 20px' }}
                      >
                        {activeLang === 'ar' ? 'إلغاء' : 'Cancel'}
                      </button>
                      <button
                        type="submit"
                        disabled={formLoading}
                        className="btn btn-primary"
                        style={{
                          padding: '12px 24px',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '8px',
                          justifyContent: 'center'
                        }}
                      >
                        {formLoading ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
                        <span>{formLoading ? (editingProject === 'new' ? t.creating : t.updating) : (editingProject === 'new' ? t.createProject : t.editProject)}</span>
                      </button>
                    </div>
                  </form>
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  )
}

function ProfileField({ label, value, lang }) {
  const isFilled = value && value.length > 0;
  return (
    <div style={{ 
      display: 'flex', 
      flexDirection: 'column', 
      gap: '4px', 
      padding: '10px 14px', 
      backgroundColor: isFilled ? 'rgba(255, 255, 255, 0.03)' : 'rgba(255, 255, 255, 0.01)',
      border: '1px solid ' + (isFilled ? 'rgba(6, 182, 212, 0.15)' : 'var(--border-color)'),
      borderRadius: '8px',
      fontSize: '0.85rem'
    }}>
      <span style={{ color: 'var(--text-muted)', fontSize: '0.75rem', fontWeight: 600, textTransform: 'uppercase' }}>{label}</span>
      <span style={{ color: isFilled ? 'var(--text-primary)' : 'var(--text-muted)', fontStyle: isFilled ? 'normal' : 'italic' }}>
        {isFilled ? value : (lang === 'ar' ? 'في انتظار الاستخراج...' : 'Awaiting extraction...')}
      </span>
    </div>
  )
}

export default ChatInterface
