import React from 'react'
import { Info, Globe, Cpu, Target, Heart } from 'lucide-react'
import SdgGrid from './SdgGrid'

const translations = {
  en: {
    title: "About CollabBridge AI",
    subtitle: "Syrian Post-War Reconstruction Synergy Platform",
    missionTitle: "Our Mission",
    missionDesc: "CollabBridge AI was created to bridge the critical gap between local Syrian reconstruction projects and the massive wealth of international and diaspora research expertise. By deploying specialized multi-agent AI systems, we translate complex community challenges into structured collaboration proposals and optimize matching based on technical skills, SDG alignment, and resource compatibility.",
    howItWorksTitle: "How the Multi-Agent Framework Works",
    howItWorksDesc: "The platform orchestrates nine specialized AI agents to automate the matching, team building, and proposal drafting workflow.",
    agentTitle1: "1. Structured Intake (Agents 1-4)",
    agentDesc1: "Our conversational agents run dynamic interviews to register projects and researchers, extracting structured profile parameters in real-time.",
    agentTitle2: "2. Vector Matchmaking (Agent 5)",
    agentDesc2: "We run multi-dimensional semantic vector queries to map project requirements against researchers' expertise, location preferences, and availability.",
    agentTitle3: "3. Team Synthesis (Agent 6)",
    agentDesc3: "Instead of single matching, the team builder constructs multidisciplinary groups to address complex, multi-sector challenges.",
    agentTitle4: "4. Impact & Proposals (Agents 7-9)",
    agentDesc4: "Automatically generates detailed collaboration agreements and maps projects to the United Nations Sustainable Development Goals.",
    sdgTitle: "Aligned UN Sustainable Development Goals (SDGs)",
    sdgIntro: "Our platform is built to accelerate research and innovation that directly contributes to the United Nations Sustainable Development Goals (SDGs). Every project can be associated with one or more SDGs, enabling researchers, organizations, investors, and policymakers to discover initiatives that address the world's most pressing challenges. By integrating SDG classifications into the matching algorithm, we help connect the right expertise with the right projects, maximizing societal impact and fostering interdisciplinary collaboration.",
    footerText: "Empowering Syrian communities through local ownership and global academic synergy."
  },
  ar: {
    title: "حول منصة كولاب بريدج",
    subtitle: "منصة التآزر لإعادة إعمار سوريا بعد الحرب",
    missionTitle: "رسالتنا ورؤيتنا",
    missionDesc: "تأسست منصة CollabBridge AI لردم الفجوة الحرجة بين مشاريع إعادة الإعمار المحلية في سوريا والخبرات الأكاديمية والعلمية الهائلة للباحثين السوريين في المغتربين والخبراء الدوليين. من خلال توظيف أنظمة الذكاء الاصطناعي متعددة الوكلاء، نقوم بتحويل التحديات المحلية المعقدة إلى مقترحات تعاونية مهيكلة ونعمل على تحسين المطابقة بناءً على المهارات التقنية، والمواءمة مع أهداف التنمية المستدامة، وجاهزية الموارد.",
    howItWorksTitle: "آلية عمل إطار الوكلاء المتعددين",
    howItWorksDesc: "تنسق المنصة عمل تسعة وكلاء ذكاء اصطناعي متخصصين لأتمتة عمليات المطابقة وبناء فرق العمل المشتركة وصياغة مقترحات المشاريع.",
    agentTitle1: "١. التسجيل المهيكل (الوكلاء ١-٤)",
    agentDesc1: "تدير وكلاء المقابلة محادثات تفاعلية ذكية لتسجيل المشاريع والخبراء، واستخراج المتغيرات الهيكلية بشكل فوري أثناء الكتابة.",
    agentTitle2: "٢. مطابقة المتجهات الدلالية (الوكيل ٥)",
    agentDesc2: "نقوم بإجراء استعلامات دلالية متعددة الأبعاد لمطابقة متطلبات المشروع مع خبرة الباحثين، وتفضيلات الإقامة، وتوفر الوقت.",
    agentTitle3: "٣. تجميع فرق العمل المتكاملة (الوكيل ٦)",
    agentDesc3: "بدلاً من التطابق الفردي البسيط، يقوم صانع الفريق ببناء مجموعات متكاملة تغطي كافة التخصصات المطلوبة للتحديات المعقدة.",
    agentTitle4: "٤. تقييم الأثر والمقترحات (الوكلاء ٧-٩)",
    agentDesc4: "يقوم وكلاء الأثر والتصميم بإنشاء مسودات اتفاقيات التعاون المشترك ومواءمتها مع أهداف التنمية المستدامة للأمم المتحدة.",
    sdgTitle: "أهداف التنمية المستدامة للأمم المتحدة (SDGs)",
    sdgIntro: "تم بناء منصتنا لتسريع الأبحاث والابتكارات التي تساهم مباشرة في أهداف التنمية المستدامة للأمم المتحدة (SDGs). يمكن ربط كل مشروع بهدف واحد أو أكثر من أهداف التنمية المستدامة، مما يمكن الباحثين والمؤسسات والممولين وصناع القرار من اكتشاف المبادرات التي تعالج التحديات الأكثر إلحاحاً في العالم. من خلال دمج تصنيفات أهداف التنمية المستدامة في خوارزمية المطابقة، نساعد في ربط الخبرة المناسبة بالمشاريع المناسبة، وتعظيم الأثر الاجتماعي وتعزيز التعاون متعدد التخصصات.",
    footerText: "تمكين المجتمعات المحلية في سوريا من خلال الجمع بين الملكية المحلية والتآزر الأكاديمي العالمي."
  }
}

function About({ lang }) {
  const activeLang = lang || 'en'
  const t = translations[activeLang]

  return (
    <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
      {/* Hero Section */}
      <section className="glass-panel" style={{ padding: '40px', background: 'linear-gradient(135deg, rgba(6,182,212,0.15) 0%, rgba(139,92,246,0.1) 100%)', textAlign: 'center' }}>
        <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '16px' }}>
          <div style={{ padding: '16px', background: 'var(--grad-primary)', borderRadius: '50%', display: 'inline-flex', boxShadow: 'var(--shadow-glow)' }}>
            <Info size={40} color="white" />
          </div>
        </div>
        <h2 style={{ fontSize: '2rem', marginBottom: '8px' }}>{t.title}</h2>
        <p style={{ color: 'var(--color-primary)', fontWeight: 600, letterSpacing: '0.05em', textTransform: 'uppercase', fontSize: '0.85rem' }}>{t.subtitle}</p>
      </section>

      {/* Mission Section */}
      <section className="glass-panel" style={{ padding: '32px', display: 'flex', gap: '24px', alignItems: 'flex-start' }}>
        <div style={{ padding: '12px', background: 'rgba(16,185,129,0.1)', border: '1px solid rgba(16,185,129,0.2)', borderRadius: '12px', color: 'var(--color-accent)' }}>
          <Heart size={24} />
        </div>
        <div style={{ flexGrow: 1 }}>
          <h3 style={{ fontSize: '1.4rem', marginBottom: '12px', color: 'var(--text-primary)' }}>{t.missionTitle}</h3>
          <p style={{ color: 'var(--text-secondary)', lineHeight: 1.7, fontSize: '0.975rem' }}>
            {t.missionDesc}
          </p>
        </div>
      </section>

      {/* Agent Workflow Grid */}
      <section style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
        <div>
          <h3 style={{ fontSize: '1.4rem', marginBottom: '4px' }}>{t.howItWorksTitle}</h3>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>{t.howItWorksDesc}</p>
        </div>

        <div className="grid-cols-2">
          <div className="glass-panel" style={{ padding: '24px', display: 'flex', gap: '16px' }}>
            <div style={{ padding: '10px', background: 'rgba(6,182,212,0.1)', border: '1px solid rgba(6,182,212,0.2)', borderRadius: '10px', color: 'var(--color-primary)', height: 'fit-content' }}>
              <Cpu size={20} />
            </div>
            <div>
              <h4 style={{ fontSize: '1.1rem', marginBottom: '8px', color: 'var(--text-primary)' }}>{t.agentTitle1}</h4>
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem', lineHeight: 1.5 }}>{t.agentDesc1}</p>
            </div>
          </div>

          <div className="glass-panel" style={{ padding: '24px', display: 'flex', gap: '16px' }}>
            <div style={{ padding: '10px', background: 'rgba(139,92,246,0.1)', border: '1px solid rgba(139,92,246,0.2)', borderRadius: '10px', color: 'var(--color-secondary)', height: 'fit-content' }}>
              <Globe size={20} />
            </div>
            <div>
              <h4 style={{ fontSize: '1.1rem', marginBottom: '8px', color: 'var(--text-primary)' }}>{t.agentTitle2}</h4>
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem', lineHeight: 1.5 }}>{t.agentDesc2}</p>
            </div>
          </div>

          <div className="glass-panel" style={{ padding: '24px', display: 'flex', gap: '16px' }}>
            <div style={{ padding: '10px', background: 'rgba(245,158,11,0.1)', border: '1px solid rgba(245,158,11,0.2)', borderRadius: '10px', color: 'var(--color-warning)', height: 'fit-content' }}>
              <Cpu size={20} />
            </div>
            <div>
              <h4 style={{ fontSize: '1.1rem', marginBottom: '8px', color: 'var(--text-primary)' }}>{t.agentTitle3}</h4>
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem', lineHeight: 1.5 }}>{t.agentDesc3}</p>
            </div>
          </div>

          <div className="glass-panel" style={{ padding: '24px', display: 'flex', gap: '16px' }}>
            <div style={{ padding: '10px', background: 'rgba(16,185,129,0.1)', border: '1px solid rgba(16,185,129,0.2)', borderRadius: '10px', color: 'var(--color-accent)', height: 'fit-content' }}>
              <Target size={20} />
            </div>
            <div>
              <h4 style={{ fontSize: '1.1rem', marginBottom: '8px', color: 'var(--text-primary)' }}>{t.agentTitle4}</h4>
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem', lineHeight: 1.5 }}>{t.agentDesc4}</p>
            </div>
          </div>
        </div>
      </section>

      {/* Aligned SDGs Grid */}
      <section className="glass-panel" style={{ padding: '32px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
        <h3 style={{ fontSize: '1.4rem' }}>{t.sdgTitle}</h3>
        <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem', lineHeight: 1.6 }}>
          {t.sdgIntro}
        </p>
        <div style={{ marginTop: '16px' }}>
          <SdgGrid lang={activeLang} selectable={false} />
        </div>
      </section>

      <footer style={{ textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.85rem', padding: '10px' }}>
        {t.footerText}
      </footer>
    </div>
  )
}

export default About
