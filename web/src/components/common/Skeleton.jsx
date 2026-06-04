export const Sk = ({ w = '100%', h = 14, r = 8, style = {} }) => (
  <div className="skeleton" style={{ width: w, height: h, borderRadius: r, ...style }} />
)

export const SkCard = () => (
  <div style={{ background: 'var(--card-bg)', border: '1px solid var(--card-border)', borderRadius: 'var(--radius)', padding: 20, display: 'flex', flexDirection: 'column', gap: 12 }}>
    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
      <Sk w={40} h={40} r={10} />
      <Sk w={80} h={24} r={20} />
    </div>
    <Sk w="80%" h={16} />
    <Sk w="55%" h={13} />
    <div style={{ display: 'flex', gap: 6 }}>
      <Sk w={50} h={22} r={20} />
      <Sk w={60} h={22} r={20} />
    </div>
    <div style={{ display: 'flex', justifyContent: 'space-between', paddingTop: 12, borderTop: '1px solid var(--card-border)' }}>
      <Sk w="40%" h={12} />
      <Sk w={32} h={32} r={8} />
    </div>
  </div>
)

export const SkStat = () => (
  <div style={{ background: 'var(--card-bg)', border: '1px solid var(--card-border)', borderRadius: 'var(--radius)', padding: 24 }}>
    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 16 }}>
      <Sk w="55%" h={13} />
      <Sk w={40} h={40} r={10} />
    </div>
    <Sk w="45%" h={34} style={{ marginBottom: 8 }} />
    <Sk w="65%" h={12} />
  </div>
)

export const SkRow = () => (
  <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '12px 0', borderBottom: '1px solid var(--card-border)' }}>
    <Sk w={38} h={38} r={10} />
    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 6 }}>
      <Sk w="65%" h={14} />
      <Sk w="40%" h={11} />
    </div>
    <Sk w={70} h={24} r={20} />
  </div>
)
