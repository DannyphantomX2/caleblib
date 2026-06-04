const Spinner = ({ size = 20, color = 'var(--blue-500)' }) => (
  <div style={{
    width: size, height: size, borderRadius: '50%',
    border: `2px solid ${color}30`,
    borderTop: `2px solid ${color}`,
    animation: 'spin 0.7s linear infinite',
    flexShrink: 0
  }} />
)
export default Spinner
