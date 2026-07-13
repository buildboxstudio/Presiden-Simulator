const BAR_COLORS = {
  apbn: { bg: '#b39c00', label: 'Kuning' },
  keamanan: { bg: '#961313', label: 'Merah' },
  kesejahteraan: { bg: '#1a7a1a', label: 'Hijau' },
  infrastruktur: { bg: '#2a6a9a', label: 'Biru' },
  popularitas: { bg: '#8a4a9a', label: 'Ungu' },
}

const STAT_LABELS = {
  apbn: 'APBN',
  keamanan: 'Keamanan',
  kesejahteraan: 'Kesejahteraan',
  infrastruktur: 'Infrastruktur',
  popularitas: 'Popularitas',
}

export default function StatBar({ stat, value }) {
  const color = BAR_COLORS[stat] || { bg: '#666' }
  const label = STAT_LABELS[stat] || stat
  const danger = value <= 15
  const critical = value <= 5

  return (
    <div className="mb-2">
      <div className="flex justify-between items-center mb-1">
        <span className="text-sm uppercase tracking-wider text-retroLight">
          {label}
        </span>
        <span className={`text-sm font-bold ${critical ? 'text-red-500 blink' : danger ? 'text-red-400' : 'text-retroLight'}`}>
          {value}%
        </span>
      </div>
      <div className="stat-bar">
        <div
          className="stat-fill"
          style={{
            width: `${value}%`,
            background: color.bg,
          }}
        />
      </div>
    </div>
  )
}
