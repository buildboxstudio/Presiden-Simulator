const LABELS = {
  apbn: 'APBN',
  keamanan: 'Keamanan',
  kesejahteraan: 'Kesejahteraan',
  infrastruktur: 'Infrastruktur',
  popularitas: 'Popularitas',
}

export function effectsText(effects) {
  return Object.entries(effects || {})
    .filter(([, value]) => value !== 0)
    .map(([stat, value]) => `${LABELS[stat] || stat} ${value > 0 ? '+' : ''}${value}`)
    .join(', ')
}

export function wouldBankrupt(indicators, effects) {
  const cost = effects?.apbn || 0
  return cost < 0 && (indicators?.apbn || 0) + cost <= 0
}

export function oppositionCut(popularitas, oposisi) {
  const cut = Math.round(((popularitas || 0) * (oposisi || 0)) / 100)
  return Math.min(cut, Math.max(0, (popularitas || 0) - 20))
}
