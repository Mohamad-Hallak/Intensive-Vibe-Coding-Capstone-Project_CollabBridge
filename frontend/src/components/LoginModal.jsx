import React, { useState, useEffect } from 'react'
import { X, Mail, Lock, Loader2, Sparkles, Eye, EyeOff } from 'lucide-react'

const translations = {
  en: {
    welcomeBack: "Welcome Back",
    createAccount: "Create Account",
    loginSub: "Sign in to access reconstruction collaborations",
    registerSub: "Join our network of experts and rebuild Syria",
    signIn: "Sign In",
    register: "Register",
    emailAddress: "Email Address",
    password: "Password",
    processing: "Processing...",
    successLogin: "Signed in successfully!",
    successRegister: "Account registered successfully!",
    googleSignInFailed: "Google sign-in failed",
    successGoogleLogin: "Signed in with Google successfully!",
    googleScriptNotLoaded: "Google API script not loaded yet.",
    simulatedGoogleFailed: "Simulated Google sign-in failed",
    successGoogleDemoLogin: "Signed in with Google Account (Demo) successfully!",
    emailPlaceholder: "your.email@example.com",
  },
  ar: {
    welcomeBack: "مرحباً بعودتك",
    createAccount: "إنشاء حساب جديد",
    loginSub: "سجل الدخول للمشاركة في مشاريع إعادة الإعمار",
    registerSub: "انضم إلى شبكة الخبراء وساهم في إعادة بناء سوريا",
    signIn: "تسجيل الدخول",
    register: "تسجيل حساب",
    emailAddress: "البريد الإلكتروني",
    password: "كلمة المرور",
    processing: "جاري المعالجة...",
    successLogin: "تم تسجيل الدخول بنجاح!",
    successRegister: "تم إنشاء الحساب بنجاح!",
    googleSignInFailed: "فشل تسجيل الدخول عبر جوجل",
    successGoogleLogin: "تم تسجيل الدخول عبر جوجل بنجاح!",
    googleScriptNotLoaded: "لم يتم تحميل واجهة جوجل البرمجية بعد.",
    simulatedGoogleFailed: "فشل تسجيل الدخول التجريبي عبر جوجل",
    successGoogleDemoLogin: "تم تسجيل الدخول بحساب جوجل (تجريبي) بنجاح!",
    emailPlaceholder: "بريدك.الإلكتروني@example.com",
  }
}

const SIMULATED_GOOGLE_ACCOUNTS = [
  {
    name: "Dr. Maya Khoury",
    email: "maya.khoury@gmail.com",
    picture_url: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&h=150&fit=crop"
  },
  {
    name: "Dr. Samer Haddad",
    email: "samer.haddad@gmail.com",
    picture_url: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop"
  },
  {
    name: "Dr. Sarah Dupont",
    email: "sarah.dupont@gmail.com",
    picture_url: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150&h=150&fit=crop"
  }
]

function LoginModal({ isOpen, onClose, onLoginSuccess, lang = 'en' }) {
  if (!isOpen) return null

  const activeLang = lang || 'en'
  const t = translations[activeLang]
  const isRtl = activeLang === 'ar'

  const [activeTab, setActiveTab] = useState('login') // 'login' or 'register'
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  // Google Authentication States
  const [googleClientId, setGoogleClientId] = useState('')
  const [showSimulator, setShowSimulator] = useState(false)
  const [customEmail, setCustomEmail] = useState('')
  const [customName, setCustomName] = useState('')
  const [customPicture, setCustomPicture] = useState('')

  // Fetch client ID configuration on mount
  useEffect(() => {
    const fetchConfig = async () => {
      try {
        const res = await fetch('/api/db/status')
        if (res.ok) {
          const data = await res.json()
          if (data.google_client_id) {
            setGoogleClientId(data.google_client_id)
          }
        }
      } catch (err) {
        console.error("Error fetching config:", err)
      }
    }
    fetchConfig()
  }, [])

  // Load Google Identity Services SDK if Client ID is configured
  useEffect(() => {
    if (googleClientId) {
      const script = document.createElement('script')
      script.src = 'https://accounts.google.com/gsi/client'
      script.async = true
      script.defer = true
      script.onload = () => {
        if (window.google) {
          window.google.accounts.id.initialize({
            client_id: googleClientId,
            callback: handleGoogleCredentialResponse
          })
        }
      }
      document.body.appendChild(script)
      return () => {
        document.body.removeChild(script)
      }
    }
  }, [googleClientId])

  const handleGoogleCredentialResponse = async (response) => {
    setLoading(true)
    setError('')
    setSuccess('')
    try {
      const res = await fetch('/api/auth/google', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          credential: response.credential,
          is_demo: false
        })
      })
      const data = await res.json()
      if (!res.ok) {
        throw new Error(data.detail || t.googleSignInFailed)
      }
      setSuccess(t.successGoogleLogin)
      setTimeout(() => {
        onLoginSuccess(data)
        onClose()
        setSuccess('')
      }, 1000)
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const handleGoogleClick = () => {
    setError('')
    setSuccess('')
    if (googleClientId) {
      if (window.google) {
        window.google.accounts.id.prompt()
      } else {
        setError(t.googleScriptNotLoaded)
      }
    } else {
      setShowSimulator(true)
    }
  }

  const handleSimulatedLogin = async (account) => {
    setLoading(true)
    setError('')
    setSuccess('')
    setShowSimulator(false)
    try {
      const res = await fetch('/api/auth/google', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: account.email,
          name: account.name,
          picture_url: account.picture_url,
          is_demo: true
        })
      })
      const data = await res.json()
      if (!res.ok) {
        throw new Error(data.detail || t.simulatedGoogleFailed)
      }
      setSuccess(t.successGoogleDemoLogin)
      setTimeout(() => {
        onLoginSuccess(data)
        onClose()
        setSuccess('')
      }, 1000)
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    setSuccess('')

    const url = activeTab === 'login' ? '/api/auth/login' : '/api/auth/register'

    try {
      const res = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      })
      const data = await res.json()
      if (!res.ok) {
        throw new Error(data.detail || (activeLang === 'ar' ? 'فشل التحقق من الهوية' : 'Authentication failed'))
      }
      
      setSuccess(activeTab === 'login' ? t.successLogin : t.successRegister)
      setTimeout(() => {
        onLoginSuccess(data)
        onClose()
        // Reset fields
        setEmail('')
        setPassword('')
        setSuccess('')
      }, 1000)
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      width: '100%',
      height: '100%',
      backgroundColor: 'rgba(0,0,0,0.7)',
      backdropFilter: 'blur(8px)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 2000,
    }}>
      <div className="glass-panel animate-fade-in" style={{
        width: '90%',
        maxWidth: '440px',
        padding: '32px',
        position: 'relative',
        display: 'flex',
        flexDirection: 'column',
        gap: '24px',
        border: '1px solid rgba(6, 182, 212, 0.2)',
        boxShadow: '0 20px 40px rgba(0,0,0,0.5)',
      }}>
        {/* Close Button */}
        <button 
          onClick={onClose}
          style={{
            position: 'absolute',
            top: '20px',
            [isRtl ? 'left' : 'right']: '20px',
            [isRtl ? 'right' : 'left']: 'auto',
            background: 'transparent',
            border: 0,
            color: 'var(--text-secondary)',
            cursor: 'pointer',
            padding: '4px'
          }}
        >
          <X size={20} />
        </button>

        {/* Header */}
        <div style={{ textAlign: 'center' }}>
          <div style={{
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '8px',
            padding: '6px 12px',
            borderRadius: '20px',
            background: 'rgba(6, 182, 212, 0.08)',
            border: '1px solid rgba(6, 182, 212, 0.15)',
            marginBottom: '16px'
          }}>
            <Sparkles size={14} color="var(--color-primary)" />
            <span style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--color-primary)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              {isRtl ? 'هوية كولاب بريدج' : 'CollabBridge Identity'}
            </span>
          </div>
          <h2 style={{ fontSize: '1.6rem', color: 'var(--text-primary)', marginBottom: '8px' }}>
            {activeTab === 'login' ? t.welcomeBack : t.createAccount}
          </h2>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem' }}>
            {activeTab === 'login' ? t.loginSub : t.registerSub}
          </p>
        </div>

        {/* Tabs */}
        <div style={{
          display: 'flex',
          backgroundColor: 'rgba(255,255,255,0.02)',
          border: '1px solid var(--border-color)',
          borderRadius: '10px',
          padding: '4px',
          flexDirection: isRtl ? 'row-reverse' : 'row'
        }}>
          <button
            onClick={() => { setActiveTab('login'); setError(''); }}
            style={{
              flex: 1,
              padding: '10px',
              borderRadius: '8px',
              border: 0,
              fontSize: '0.875rem',
              fontWeight: 500,
              cursor: 'pointer',
              transition: 'all 0.2s',
              backgroundColor: activeTab === 'login' ? 'var(--color-primary)' : 'transparent',
              color: activeTab === 'login' ? '#000000' : 'var(--text-secondary)'
            }}
          >
            {t.signIn}
          </button>
          <button
            onClick={() => { setActiveTab('register'); setError(''); }}
            style={{
              flex: 1,
              padding: '10px',
              borderRadius: '8px',
              border: 0,
              fontSize: '0.875rem',
              fontWeight: 500,
              cursor: 'pointer',
              transition: 'all 0.2s',
              backgroundColor: activeTab === 'register' ? 'var(--color-primary)' : 'transparent',
              color: activeTab === 'register' ? '#000000' : 'var(--text-secondary)'
            }}
          >
            {t.register}
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <label style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', textAlign: isRtl ? 'right' : 'left' }}>
              {t.emailAddress}
            </label>
            <div style={{ position: 'relative' }}>
              <Mail size={16} color="var(--text-muted)" style={{ position: 'absolute', [isRtl ? 'right' : 'left']: '14px', top: '14px' }} />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder={t.emailPlaceholder}
                style={{
                  width: '100%',
                  paddingTop: '12px',
                  paddingBottom: '12px',
                  paddingLeft: isRtl ? '14px' : '42px',
                  paddingRight: isRtl ? '42px' : '14px',
                  backgroundColor: 'rgba(255,255,255,0.02)',
                  border: '1px solid var(--border-color)',
                  borderRadius: '10px',
                  color: 'var(--text-primary)',
                  fontSize: '0.875rem',
                  textAlign: isRtl ? 'right' : 'left',
                  direction: 'ltr'
                }}
              />
            </div>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <label style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', textAlign: isRtl ? 'right' : 'left' }}>
              {t.password}
            </label>
            <div style={{ position: 'relative' }}>
              <Lock size={16} color="var(--text-muted)" style={{ position: 'absolute', [isRtl ? 'right' : 'left']: '14px', top: '14px' }} />
              <input
                type={showPassword ? "text" : "password"}
                required
                minLength={6}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                style={{
                  width: '100%',
                  paddingTop: '12px',
                  paddingBottom: '12px',
                  paddingLeft: isRtl ? '42px' : '42px',
                  paddingRight: isRtl ? '42px' : '42px',
                  backgroundColor: 'rgba(255,255,255,0.02)',
                  border: '1px solid var(--border-color)',
                  borderRadius: '10px',
                  color: 'var(--text-primary)',
                  fontSize: '0.875rem',
                  textAlign: isRtl ? 'right' : 'left',
                  direction: 'ltr'
                }}
              />
              <button
                type="button"
                onClick={() => setShowPassword(prev => !prev)}
                style={{
                  position: 'absolute',
                  [isRtl ? 'left' : 'right']: '14px',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  background: 'none',
                  border: 0,
                  color: 'var(--text-muted)',
                  cursor: 'pointer',
                  padding: 0,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}
              >
                {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </div>

          {error && (
            <div style={{
              fontSize: '0.8rem',
              color: 'var(--color-error)',
              backgroundColor: 'rgba(239, 68, 68, 0.1)',
              padding: '10px',
              borderRadius: '8px',
              border: '1px solid rgba(239, 68, 68, 0.2)',
              textAlign: isRtl ? 'right' : 'left'
            }}>
              {error}
            </div>
          )}

          {success && (
            <div style={{
              fontSize: '0.8rem',
              color: '#a7f3d0',
              backgroundColor: 'rgba(16, 185, 129, 0.1)',
              padding: '10px',
              borderRadius: '8px',
              border: '1px solid rgba(16, 185, 129, 0.2)',
              textAlign: isRtl ? 'right' : 'left'
            }}>
              {success}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="btn btn-primary"
            style={{
              width: '100%',
              padding: '12px',
              fontSize: '0.9rem',
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
              gap: '8px',
              marginTop: '8px'
            }}
          >
            {loading ? <Loader2 size={18} className="animate-spin" /> : null}
            <span>{loading ? t.processing : (activeTab === 'login' ? t.signIn : t.register)}</span>
          </button>

          {/* Google Sign In Divider */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', margin: '8px 0' }}>
            <div style={{ flex: 1, height: '1px', backgroundColor: 'var(--border-color)' }}></div>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>{isRtl ? 'أو' : 'Or'}</span>
            <div style={{ flex: 1, height: '1px', backgroundColor: 'var(--border-color)' }}></div>
          </div>

          {/* Google Sign In Button */}
          <button
            type="button"
            disabled={loading}
            onClick={handleGoogleClick}
            className="btn btn-secondary"
            style={{
              width: '100%',
              padding: '12px',
              fontSize: '0.9rem',
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
              gap: '10px',
              backgroundColor: 'rgba(255, 255, 255, 0.03)',
              border: '1px solid var(--border-color)'
            }}
          >
            <svg width="18" height="18" viewBox="0 0 24 24">
              <path fill="#4285F4" d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v3.92h6.69a5.74 5.74 0 0 1-2.5 3.77v3.13h4.03c2.37-2.18 3.52-5.4 3.52-8.75z"/>
              <path fill="#34A853" d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-4.03-3.13c-1.12.75-2.56 1.2-3.9 1.2-3.03 0-5.6-2.05-6.51-4.82H1.31v3.23A12 12 0 0 0 12 24z"/>
              <path fill="#FBBC05" d="M5.49 14.34A7.17 7.17 0 0 1 5.09 12c0-.82.14-1.61.39-2.34V6.43H1.31A11.96 11.96 0 0 0 0 12c0 2.05.52 4 1.31 5.57l4.18-3.23z"/>
              <path fill="#EA4335" d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0A12 12 0 0 0 1.31 6.43l4.18 3.23c.91-2.77 3.48-4.82 6.51-4.82z"/>
            </svg>
            <span>{isRtl ? 'تسجيل الدخول بواسطة Google' : 'Sign In with Google'}</span>
          </button>
        </form>

        {/* Google Simulator Overlay */}
        {showSimulator && (
          <div className="glass-panel" style={{
            position: 'absolute',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            background: 'var(--bg-surface-solid)',
            border: 'none',
            borderRadius: '12px',
            padding: '28px',
            display: 'flex',
            flexDirection: 'column',
            gap: '16px',
            zIndex: 10,
            overflowY: 'auto'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--border-color)', paddingBottom: '12px' }}>
              <h3 style={{ fontSize: '1.1rem', color: 'var(--text-primary)', margin: 0 }}>
                {isRtl ? 'حسابات Google (تجريبي)' : 'Google Account Chooser (Demo)'}
              </h3>
              <button 
                onClick={() => setShowSimulator(false)}
                style={{ background: 'transparent', border: 0, color: 'var(--text-secondary)', cursor: 'pointer', fontSize: '0.8rem' }}
              >
                {isRtl ? 'إلغاء' : 'Cancel'}
              </button>
            </div>
            
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.8rem', margin: 0, lineHeight: 1.4 }}>
              {isRtl ? 'اختر حساباً تجريبياً لتسجيل الدخول فورياً بواسطة Google.' : 'Select a mock Google account to log in instantly.'}
            </p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {SIMULATED_GOOGLE_ACCOUNTS.map((acc, index) => (
                <button
                  key={index}
                  onClick={() => handleSimulatedLogin(acc)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '12px',
                    padding: '10px 14px',
                    border: '1px solid var(--border-color)',
                    borderRadius: '8px',
                    background: 'rgba(255, 255, 255, 0.02)',
                    cursor: 'pointer',
                    textAlign: isRtl ? 'right' : 'left',
                    width: '100%',
                    color: 'var(--text-primary)',
                    flexDirection: isRtl ? 'row-reverse' : 'row'
                  }}
                  onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.06)'}
                  onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.02)'}
                >
                  <img 
                    src={acc.picture_url} 
                    alt={acc.name} 
                    style={{ width: '36px', height: '36px', borderRadius: '50%', border: '1px solid rgba(6, 182, 212, 0.3)', objectFit: 'cover' }} 
                  />
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '2px', textAlign: isRtl ? 'right' : 'left', flexGrow: 1 }}>
                    <span style={{ fontSize: '0.85rem', fontWeight: 600 }}>{acc.name}</span>
                    <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', fontFamily: 'monospace' }}>{acc.email}</span>
                  </div>
                </button>
              ))}
            </div>

            <div style={{ borderTop: '1px solid var(--border-color)', paddingTop: '12px', marginTop: '4px' }}>
              <span style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-secondary)', display: 'block', marginBottom: '8px', textAlign: isRtl ? 'right' : 'left' }}>
                {isRtl ? 'استخدام حساب مخصص' : 'Use Custom Google Account'}
              </span>
              <form 
                onSubmit={(e) => {
                  e.preventDefault();
                  if (!customEmail) return;
                  handleSimulatedLogin({
                    name: customName || customEmail.split('@')[0],
                    email: customEmail,
                    picture_url: customPicture || `https://api.dicebear.com/7.x/bottts/svg?seed=${customEmail}`
                  });
                }}
                style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}
              >
                <input 
                  type="email" 
                  placeholder={isRtl ? 'البريد الإلكتروني لـ Google' : 'Google Email Address'}
                  required
                  value={customEmail}
                  onChange={(e) => setCustomEmail(e.target.value)}
                  style={{ width: '100%', padding: '8px 12px', border: '1px solid var(--border-color)', borderRadius: '6px', backgroundColor: 'rgba(255,255,255,0.02)', color: 'var(--text-primary)', fontSize: '0.8rem', direction: 'ltr' }}
                />
                <input 
                  type="text" 
                  placeholder={isRtl ? 'الاسم الكامل' : 'Full Name'}
                  value={customName}
                  onChange={(e) => setCustomName(e.target.value)}
                  style={{ width: '100%', padding: '8px 12px', border: '1px solid var(--border-color)', borderRadius: '6px', backgroundColor: 'rgba(255,255,255,0.02)', color: 'var(--text-primary)', fontSize: '0.8rem' }}
                />
                <input 
                  type="text" 
                  placeholder={isRtl ? 'رابط الصورة الرمزية (اختياري)' : 'Avatar Image URL (Optional)'}
                  value={customPicture}
                  onChange={(e) => setCustomPicture(e.target.value)}
                  style={{ width: '100%', padding: '8px 12px', border: '1px solid var(--border-color)', borderRadius: '6px', backgroundColor: 'rgba(255,255,255,0.02)', color: 'var(--text-primary)', fontSize: '0.8rem', direction: 'ltr' }}
                />
                <button 
                  type="submit" 
                  className="btn btn-primary"
                  style={{ width: '100%', padding: '8px', fontSize: '0.8rem', fontWeight: 600 }}
                >
                  {isRtl ? 'تسجيل الدخول بالحساب المخصص' : 'Log In with Custom Demo Account'}
                </button>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default LoginModal
