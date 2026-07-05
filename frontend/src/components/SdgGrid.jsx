import React from 'react'

export const SDG_GOALS = [
  { id: 1, title: "No Poverty", titleAr: "القضاء على الفقر", color: "#E5243B" },
  { id: 2, title: "Zero Hunger", titleAr: "القضاء على الجوع", color: "#DDA63A" },
  { id: 3, title: "Good Health and Well-being", titleAr: "الصحة الجيدة والرفاه", color: "#4C9F38" },
  { id: 4, title: "Quality Education", titleAr: "التعليم الجيد", color: "#C5192D" },
  { id: 5, title: "Gender Equality", titleAr: "المساواة بين الجنسين", color: "#FF3A21" },
  { id: 6, title: "Clean Water and Sanitation", titleAr: "المياه النظيفة والنظافة", color: "#26BDE2" },
  { id: 7, title: "Affordable and Clean Energy", titleAr: "طاقة نظيفة وبأسعار معقولة", color: "#FCC30B" },
  { id: 8, title: "Decent Work and Economic Growth", titleAr: "العمل اللائق ونمو الاقتصاد", color: "#A21942" },
  { id: 9, title: "Industry, Innovation and Infrastructure", titleAr: "الصناعة والابتكار والبنية التحتية", color: "#FD6925" },
  { id: 10, title: "Reduced Inequalities", titleAr: "الحد من أوجه عدم المساواة", color: "#DD1367" },
  { id: 11, title: "Sustainable Cities and Communities", titleAr: "مدن ومجتمعات محلية مستدامة", color: "#FD9D24" },
  { id: 12, title: "Responsible Consumption and Production", titleAr: "الاستهلاك والإنتاج المسؤولان", color: "#BF8B2E" },
  { id: 13, title: "Climate Action", titleAr: "العمل المناخي", color: "#3F7E44" },
  { id: 14, title: "Life Below Water", titleAr: "الحياة تحت الماء", color: "#0A97D9" },
  { id: 15, title: "Life on Land", titleAr: "الحياة في البر", color: "#56C02B" },
  { id: 16, title: "Peace, Justice and Strong Institutions", titleAr: "السلام والعدل والمؤسسات", color: "#00689D" },
  { id: 17, title: "Partnerships for the Goals", titleAr: "عقد الشراكات لتحقيق الأهداف", color: "#19486A" }
];

function SdgGrid({ selectedIds = [], onChange, selectable = false, lang = 'en' }) {
  const isRtl = lang === 'ar'

  const handleCardClick = (id) => {
    if (!selectable || !onChange) return
    const isSelected = selectedIds.includes(id)
    const newSelected = isSelected
      ? selectedIds.filter(x => x !== id)
      : [...selectedIds, id]
    onChange(newSelected)
  }

  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))', gap: '12px', width: '100%' }}>
      {SDG_GOALS.map((goal) => {
        const isSelected = selectedIds.includes(goal.id)

        return (
          <div
            key={goal.id}
            onClick={() => handleCardClick(goal.id)}
            style={{
              background: isSelected ? 'rgba(255, 255, 255, 0.05)' : 'rgba(255, 255, 255, 0.01)',
              backdropFilter: 'blur(8px)',
              border: '1px solid ' + (isSelected ? goal.color : 'var(--border-color)'),
              [isRtl ? 'borderRight' : 'borderLeft']: `4px solid ${goal.color}`,
              borderRadius: '8px',
              padding: '10px 12px',
              cursor: selectable ? 'pointer' : 'default',
              boxShadow: isSelected ? `0 0 10px ${goal.color}22` : 'var(--shadow-sm)',
              transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
              transform: isSelected ? 'scale(1.01)' : 'none',
              display: 'flex',
              alignItems: 'center',
              gap: '10px',
              minHeight: '44px',
              overflow: 'hidden'
            }}
            className="sdg-card"
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = 'translateY(-1px)'
              e.currentTarget.style.boxShadow = `0 4px 12px ${goal.color}1a`
              if (!isSelected) {
                e.currentTarget.style.borderColor = goal.color
              }
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = isSelected ? 'scale(1.01)' : 'none'
              e.currentTarget.style.boxShadow = isSelected ? `0 0 10px ${goal.color}22` : 'var(--shadow-sm)'
              if (!isSelected) {
                e.currentTarget.style.borderColor = 'var(--border-color)'
              }
            }}
          >
            {/* Compact ID Indicator */}
            <span style={{
              fontSize: '0.75rem',
              fontWeight: 800,
              color: 'white',
              background: goal.color,
              padding: '2px 6px',
              borderRadius: '4px',
              minWidth: '22px',
              textAlign: 'center',
              flexShrink: 0
            }}>
              {goal.id}
            </span>

            {/* Title Text */}
            <span
              style={{
                fontSize: '0.825rem',
                fontWeight: 600,
                color: 'var(--text-primary)',
                lineHeight: 1.2,
                flexGrow: 1,
                whiteSpace: 'nowrap',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                textAlign: isRtl ? 'right' : 'left'
              }}
              title={isRtl ? goal.titleAr : goal.title}
            >
              {isRtl ? goal.titleAr : goal.title}
            </span>

            {/* Checkmark indicator for selection mode */}
            {selectable && (
              <div style={{
                width: '14px',
                height: '14px',
                borderRadius: '50%',
                border: `1.5px solid ${isSelected ? goal.color : 'var(--border-color)'}`,
                background: isSelected ? goal.color : 'transparent',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0
              }}>
                {isSelected && (
                  <span style={{ color: 'white', fontSize: '8px', fontWeight: 900 }}>✓</span>
                )}
              </div>
            )}
          </div>
        )
      })}
    </div>
  )
}

export default SdgGrid
