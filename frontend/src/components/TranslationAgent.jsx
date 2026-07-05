import React, { useState, useEffect } from 'react'
import { 
  Languages, 
  Sparkles, 
  Globe, 
  Copy, 
  Check, 
  BookOpen, 
  ArrowRightLeft, 
  MessageSquare, 
  Loader2, 
  ChevronDown, 
  ChevronUp,
  AlertCircle
} from 'lucide-react'

const PRESETS = [
  {
    title: "Solar Power Project",
    titleAr: "مشروع الطاقة الشمسية",
    text: "We are seeking a renewable energy specialist to install off-grid solar panels in community clinics."
  },
  {
    title: "Wastewater Filter",
    titleAr: "مرشح مياه الصرف الصحي",
    text: "Developing a wastewater filtration system for regional farms."
  },
  {
    title: "Modular Housing",
    titleAr: "المساكن الجاهزة",
    text: "We need researchers with expertise in seismic-resistant structural engineering to design modular houses."
  }
]

const UI_TEXT = {
  en: {
    title: "Linguistic Translation Agent",
    subtitle: "Highly accurate English-to-Arabic translation utilizing an agentic critique-and-refine workflow.",
    inputPlaceholder: "Enter English text to translate...",
    translateBtn: "Translate Text",
    translatingBtn: "Agent Processing...",
    presetTitle: "Try a sample reconstruction prompt:",
    finalTranslation: "Final Polished Translation",
    initialTranslation: "Draft Translation",
    critiqueTitle: "Linguistic Critique & Self-Correction Notes",
    confidence: "Confidence Score:",
    copy: "Copy Arabic",
    copied: "Copied!",
    emptyOutput: "Translation results will appear here after the agent completes its workflow.",
    charCount: "characters",
    errorTitle: "Translation Failed",
    agentWorkflow: "Agent Workflow Progression",
    step1: "Initial Draft Translation",
    step2: "Critical Linguistic Reflection",
    step3: "Final Polished Synthesis",
    stepPending: "Waiting...",
    stepActive: "In Progress...",
    stepDone: "Completed",
    isFallbackMsg: "Demo Fallback: Showing cached high-quality translation.",
    sourceTextLabel: "Source Text (English)",
    translationApiError: "Translation API returned an error",
    translationGenericError: "An error occurred during translation.",
    draftLabel: "Draft Translation:",
    critiqueNotesLabel: "Critique Notes:"
  },
  ar: {
    title: "وكيل الترجمة اللغوي الذكي",
    subtitle: "ترجمة دقيقة للغاية من الإنجليزية إلى العربية باستخدام تدفق عمل نقدي وتصحيحي متكرر.",
    inputPlaceholder: "أدخل النص الإنجليزي لترجمته...",
    translateBtn: "ترجمة النص",
    translatingBtn: "جاري المعالجة...",
    presetTitle: "جرّب أحد النصوص النموذجية التالية:",
    finalTranslation: "الترجمة النهائية المصقولة",
    initialTranslation: "المسودة المبدئية",
    critiqueTitle: "ملاحظات النقد اللغوي والتصحيح الذاتي للوكيل",
    confidence: "مؤشر الثقة:",
    copy: "نسخ النص العربي",
    copied: "تم النسخ!",
    emptyOutput: "ستظهر نتائج الترجمة هنا بمجرد اكتمال سير عمل الوكيل الذكي.",
    charCount: "حرفًا",
    errorTitle: "فشلت الترجمة",
    agentWorkflow: "مراحل سير عمل الوكيل اللغوي",
    step1: "صياغة المسودة المبدئية",
    step2: "التحليل والنقد اللغوي الذاتي",
    step3: "الصقل وإخراج النسخة النهائية",
    stepPending: "في الانتظار...",
    stepActive: "جاري العمل...",
    stepDone: "اكتمل",
    isFallbackMsg: "بيانات تجريبية: عرض ترجمة مخزنة عالية الجودة.",
    sourceTextLabel: "النص المصدر (الإنجليزية)",
    translationApiError: "أعادت واجهة برمجة الترجمة خطأً",
    translationGenericError: "حدث خطأ أثناء الترجمة.",
    draftLabel: "المسودة المبدئية:",
    critiqueNotesLabel: "ملاحظات النقد اللغوي:"
  }
}

function TranslationAgent({ lang }) {
  const activeLang = lang || 'en'
  const t = UI_TEXT[activeLang]

  const [inputText, setInputText] = useState('')
  const [loading, setLoading] = useState(false)
  const [activeStep, setActiveStep] = useState(0) // 0=idle, 1=initial, 2=critique, 3=final
  const [result, setResult] = useState(null)
  const [error, setError] = useState('')
  const [copied, setCopied] = useState(false)
  const [critiqueOpen, setCritiqueOpen] = useState(false)

  // Clear states when user edits input
  const handleInputChange = (e) => {
    setInputText(e.target.value)
    if (error) setError('')
  }

  const selectPreset = (text) => {
    setInputText(text)
    if (error) setError('')
  }

  const handleTranslate = async () => {
    if (!inputText.trim()) return

    setLoading(true)
    setError('')
    setResult(null)
    setCritiqueOpen(false)

    // Simulate step progression for better UX visualization
    // Step 1: Initial Translation starts immediately
    setActiveStep(1)

    // Helper promise to create delays in UI
    const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms))

    try {
      // Initiate backend call concurrently
      const apiPromise = fetch('/api/translate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ text: inputText })
      }).then(async (res) => {
        const data = await res.json()
        if (!res.ok) {
          throw new Error(data.detail || t.translationApiError)
        }
        return data
      })

      // Wait a minimum time for Step 1 animation
      await delay(1200)
      setActiveStep(2) // Move to Critique phase in UI

      // Wait a minimum time for Step 2 animation
      await delay(1200)
      setActiveStep(3) // Move to Polishing phase in UI

      // Wait a bit more, and make sure we have the API response
      const [apiResult] = await Promise.all([apiPromise, delay(800)])

      setResult(apiResult)
      setActiveStep(4) // Completed all steps
    } catch (err) {
      console.error(err)
      setError(err.message || t.translationGenericError)
      setActiveStep(0)
    } finally {
      setLoading(false)
    }
  }

  const handleCopy = () => {
    if (!result?.final_translation) return
    navigator.clipboard.writeText(result.final_translation)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div className="main-content" style={{ direction: activeLang === 'ar' ? 'rtl' : 'ltr' }}>
      {/* Title Header */}
      <div style={{ marginBottom: '32px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '8px' }}>
          <div style={{
            background: 'var(--grad-primary)',
            width: '45px',
            height: '45px',
            borderRadius: '12px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: 'var(--shadow-md)'
          }}>
            <Languages size={24} style={{ color: '#fff' }} />
          </div>
          <h1 style={{ fontSize: '2.25rem', fontWeight: 800, margin: 0 }}>
            {t.title}
          </h1>
        </div>
        <p style={{ color: 'var(--text-secondary)', fontSize: '1.05rem', maxWidth: '800px', lineHeight: 1.6 }}>
          {t.subtitle}
        </p>
      </div>

      {/* Main Container Grid */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(450px, 1fr))',
        gap: '24px',
        alignItems: 'start'
      }}>
        {/* Left Column: English Input */}
        <div className="glass-panel" style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <div>
            <h2 style={{ fontSize: '1.25rem', fontWeight: 700, marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <ArrowRightLeft size={18} style={{ color: 'var(--color-primary)' }} />
              <span>{t.sourceTextLabel}</span>
            </h2>
            <textarea
              value={inputText}
              onChange={handleInputChange}
              placeholder={t.inputPlaceholder}
              disabled={loading}
              style={{
                width: '100%',
                height: '220px',
                padding: '16px',
                borderRadius: '12px',
                backgroundColor: 'rgba(0, 0, 0, 0.2)',
                border: '1px solid var(--border-color)',
                color: 'var(--text-primary)',
                fontSize: '1.05rem',
                lineHeight: 1.6,
                resize: 'none',
                outline: 'none',
                transition: 'border-color 0.2s'
              }}
              onFocus={(e) => e.target.style.borderColor = 'var(--color-primary)'}
              onBlur={(e) => e.target.style.borderColor = 'var(--border-color)'}
            />
            <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '6px', fontSize: '0.85rem', color: 'var(--text-muted)' }}>
              <span>{inputText.split(/\s+/).filter(Boolean).length} words</span>
              <span>{inputText.length} {t.charCount}</span>
            </div>
          </div>

          {/* Preset Buttons */}
          <div>
            <span style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', display: 'block', marginBottom: '8px' }}>
              {t.presetTitle}
            </span>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
              {PRESETS.map((preset, index) => (
                <button
                  key={index}
                  type="button"
                  onClick={() => selectPreset(preset.text)}
                  disabled={loading}
                  className="btn btn-secondary"
                  style={{
                    padding: '6px 12px',
                    fontSize: '0.8rem',
                    borderRadius: '8px',
                    backgroundColor: 'rgba(255, 255, 255, 0.03)',
                    border: '1px solid var(--border-color)'
                  }}
                >
                  <Sparkles size={12} style={{ color: 'var(--color-warning)' }} />
                  <span>{activeLang === 'ar' ? preset.titleAr : preset.title}</span>
                </button>
              ))}
            </div>
          </div>

          <button
            type="button"
            onClick={handleTranslate}
            disabled={loading || !inputText.trim()}
            className="btn btn-primary"
            style={{
              padding: '14px 20px',
              fontSize: '1rem',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              width: '100%',
              gap: '10px'
            }}
          >
            {loading ? (
              <>
                <Loader2 size={18} className="animate-spin" />
                <span>{t.translatingBtn}</span>
              </>
            ) : (
              <>
                <Languages size={18} />
                <span>{t.translateBtn}</span>
              </>
            )}
          </button>
        </div>

        {/* Right Column: Agent Workflow & Translation Output */}
        <div className="glass-panel" style={{ padding: '24px', minHeight: '445px', display: 'flex', flexDirection: 'column' }}>
          {/* Active Step / Translation Progress Panel */}
          {loading && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', flexGrow: 1, justifyContent: 'center' }}>
              <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--text-secondary)', textAlign: 'center', marginBottom: '8px' }}>
                {t.agentWorkflow}
              </h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', maxWidth: '350px', margin: '0 auto', width: '100%' }}>
                {/* Step 1 */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <div style={{
                    width: '24px',
                    height: '24px',
                    borderRadius: '50%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    backgroundColor: activeStep > 1 ? 'var(--color-accent)' : activeStep === 1 ? 'rgba(6, 182, 212, 0.2)' : 'rgba(255, 255, 255, 0.05)',
                    border: '1px solid ' + (activeStep > 1 ? 'var(--color-accent)' : activeStep === 1 ? 'var(--color-primary)' : 'var(--border-color)'),
                    color: activeStep > 1 ? '#fff' : 'var(--text-primary)',
                    fontSize: '0.8rem',
                    fontWeight: 'bold'
                  }}>
                    {activeStep > 1 ? <Check size={12} /> : "1"}
                  </div>
                  <span style={{ fontSize: '0.95rem', fontWeight: activeStep === 1 ? '600' : 'normal', color: activeStep === 1 ? 'var(--text-primary)' : 'var(--text-secondary)' }}>
                    {t.step1}
                  </span>
                  {activeStep === 1 && <Loader2 size={14} className="animate-spin" style={{ color: 'var(--color-primary)', marginLeft: 'auto' }} />}
                </div>

                {/* Step 2 */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <div style={{
                    width: '24px',
                    height: '24px',
                    borderRadius: '50%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    backgroundColor: activeStep > 2 ? 'var(--color-accent)' : activeStep === 2 ? 'rgba(139, 92, 246, 0.2)' : 'rgba(255, 255, 255, 0.05)',
                    border: '1px solid ' + (activeStep > 2 ? 'var(--color-accent)' : activeStep === 2 ? 'var(--color-secondary)' : 'var(--border-color)'),
                    color: activeStep > 2 ? '#fff' : 'var(--text-primary)',
                    fontSize: '0.8rem',
                    fontWeight: 'bold'
                  }}>
                    {activeStep > 2 ? <Check size={12} /> : "2"}
                  </div>
                  <span style={{ fontSize: '0.95rem', fontWeight: activeStep === 2 ? '600' : 'normal', color: activeStep === 2 ? 'var(--text-primary)' : 'var(--text-secondary)' }}>
                    {t.step2}
                  </span>
                  {activeStep === 2 && <Loader2 size={14} className="animate-spin" style={{ color: 'var(--color-secondary)', marginLeft: 'auto' }} />}
                </div>

                {/* Step 3 */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <div style={{
                    width: '24px',
                    height: '24px',
                    borderRadius: '50%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    backgroundColor: activeStep > 3 ? 'var(--color-accent)' : activeStep === 3 ? 'rgba(16, 185, 129, 0.2)' : 'rgba(255, 255, 255, 0.05)',
                    border: '1px solid ' + (activeStep > 3 ? 'var(--color-accent)' : activeStep === 3 ? 'var(--color-accent)' : 'var(--border-color)'),
                    color: activeStep > 3 ? '#fff' : 'var(--text-primary)',
                    fontSize: '0.8rem',
                    fontWeight: 'bold'
                  }}>
                    {activeStep > 3 ? <Check size={12} /> : "3"}
                  </div>
                  <span style={{ fontSize: '0.95rem', fontWeight: activeStep === 3 ? '600' : 'normal', color: activeStep === 3 ? 'var(--text-primary)' : 'var(--text-secondary)' }}>
                    {t.step3}
                  </span>
                  {activeStep === 3 && <Loader2 size={14} className="animate-spin" style={{ color: 'var(--color-accent)', marginLeft: 'auto' }} />}
                </div>
              </div>
            </div>
          )}

          {/* Error Message */}
          {error && (
            <div style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              flexGrow: 1,
              gap: '12px',
              padding: '24px',
              color: 'var(--color-error)'
            }}>
              <AlertCircle size={40} />
              <h3 style={{ fontSize: '1.2rem', fontWeight: 700 }}>{t.errorTitle}</h3>
              <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', textAlign: 'center', maxWidth: '350px' }}>
                {error}
              </p>
            </div>
          )}

          {/* Empty State */}
          {!loading && !result && !error && (
            <div style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              flexGrow: 1,
              gap: '16px',
              padding: '40px',
              color: 'var(--text-muted)'
            }}>
              <Globe size={48} style={{ color: 'var(--border-color)', strokeWidth: 1.5 }} />
              <p style={{ fontSize: '0.95rem', textAlign: 'center', maxWidth: '320px', lineHeight: 1.6 }}>
                {t.emptyOutput}
              </p>
            </div>
          )}

          {/* Results Output Screen */}
          {!loading && result && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', flexGrow: 1 }}>
              {/* Fallback Badge */}
              {result.is_fallback && (
                <div style={{
                  padding: '8px 12px',
                  borderRadius: '6px',
                  backgroundColor: 'rgba(245, 158, 11, 0.1)',
                  border: '1px solid rgba(245, 158, 11, 0.2)',
                  color: 'var(--color-warning)',
                  fontSize: '0.8rem',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px'
                }}>
                  <AlertCircle size={14} />
                  <span>{t.isFallbackMsg}</span>
                </div>
              )}

              {/* Polished translation output */}
              <div style={{ display: 'flex', flexDirection: 'column', flexGrow: 1 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                  <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--text-secondary)' }}>
                    {t.finalTranslation}
                  </h3>
                  {result.confidence_score > 0 && (
                    <span style={{
                      fontSize: '0.8rem',
                      fontWeight: 600,
                      padding: '4px 8px',
                      borderRadius: '6px',
                      backgroundColor: 'rgba(16, 185, 129, 0.1)',
                      border: '1px solid rgba(16, 185, 129, 0.2)',
                      color: 'var(--color-accent)'
                    }}>
                      {t.confidence} {result.confidence_score}/10
                    </span>
                  )}
                </div>

                <div 
                  style={{
                    backgroundColor: 'rgba(255, 255, 255, 0.02)',
                    border: '1px solid var(--border-color)',
                    borderRadius: '12px',
                    padding: '20px',
                    fontSize: '1.25rem',
                    lineHeight: 1.8,
                    fontWeight: 500,
                    color: 'var(--text-primary)',
                    direction: 'rtl',
                    textAlign: 'right',
                    fontFamily: 'Tajawal, sans-serif',
                    minHeight: '140px',
                    whiteSpace: 'pre-wrap'
                  }}
                >
                  {result.final_translation}
                </div>
              </div>

              {/* Action Buttons */}
              <div style={{ display: 'flex', gap: '12px' }}>
                <button
                  type="button"
                  onClick={handleCopy}
                  className="btn btn-secondary"
                  style={{
                    flexGrow: 1,
                    padding: '10px 16px',
                    fontSize: '0.9rem',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '8px'
                  }}
                >
                  {copied ? (
                    <>
                      <Check size={16} style={{ color: 'var(--color-accent)' }} />
                      <span style={{ color: 'var(--color-accent)' }}>{t.copied}</span>
                    </>
                  ) : (
                    <>
                      <Copy size={16} />
                      <span>{t.copy}</span>
                    </>
                  )}
                </button>
              </div>

              {/* Interactive Critique Panel */}
              {result.critique && (
                <div style={{ borderTop: '1px solid var(--border-color)', paddingTop: '16px' }}>
                  <button
                    type="button"
                    onClick={() => setCritiqueOpen(!critiqueOpen)}
                    style={{
                      width: '100%',
                      background: 'none',
                      border: 'none',
                      color: 'var(--text-secondary)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      cursor: 'pointer',
                      padding: '8px 0',
                      fontSize: '0.9rem',
                      fontWeight: 600,
                      outline: 'none'
                    }}
                  >
                    <span style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <BookOpen size={16} style={{ color: 'var(--color-secondary)' }} />
                      <span>{t.critiqueTitle}</span>
                    </span>
                    {critiqueOpen ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                  </button>

                  {critiqueOpen && (
                    <div style={{
                      marginTop: '8px',
                      backgroundColor: 'rgba(139, 92, 246, 0.03)',
                      border: '1px solid rgba(139, 92, 246, 0.1)',
                      borderRadius: '8px',
                      padding: '12px 16px',
                      fontSize: '0.85rem',
                      lineHeight: 1.6,
                      color: 'var(--text-secondary)',
                      whiteSpace: 'pre-wrap'
                    }}>
                      {/* Initial draft before refinement */}
                      <div style={{ marginBottom: '10px' }}>
                        <span style={{ fontWeight: 600, display: 'block', color: 'var(--text-muted)', fontSize: '0.8rem', textTransform: 'uppercase', marginBottom: '2px' }}>
                          {t.draftLabel}
                        </span>
                        <div style={{ direction: 'rtl', textAlign: 'right', fontFamily: 'Tajawal, sans-serif', fontSize: '0.95rem', color: 'var(--text-muted)' }}>
                          {result.initial_translation}
                        </div>
                      </div>
                      
                      {/* Detailed Critique Notes */}
                      <div>
                        <span style={{ fontWeight: 600, display: 'block', color: 'var(--text-muted)', fontSize: '0.8rem', textTransform: 'uppercase', marginBottom: '2px' }}>
                          {t.critiqueNotesLabel}
                        </span>
                        <div style={{ color: 'var(--text-secondary)' }}>
                          {result.critique}
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default TranslationAgent
