import { GENRES, LANGUAGES } from '../constants/genres'

const CURRENT_YEAR = new Date().getFullYear()
const YEARS = Array.from({ length: 60 }, (_, i) => CURRENT_YEAR - i)

const COUNTRIES = [
  { code: 'US', name: 'United States' },
  { code: 'IN', name: 'India' },
  { code: 'GB', name: 'United Kingdom' },
  { code: 'KR', name: 'South Korea' },
  { code: 'JP', name: 'Japan' },
  { code: 'FR', name: 'France' },
]

export default function FilterPanel({ filters, onChange }) {
  const update = (key, value) => onChange({ ...filters, [key]: value })

  const selectStyle = {
    background: 'var(--bg)', border: '1px solid var(--border)', borderRadius: 6,
    padding: '8px 10px', color: 'var(--text)', fontSize: 13, width: '100%',
  }

  return (
    <div className="card" style={{ padding: 20, display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: 14 }}>
      <div className="field" style={{ marginBottom: 0 }}>
        <label>Genre</label>
        <select style={selectStyle} value={filters.genreId || ''} onChange={(e) => update('genreId', e.target.value || undefined)}>
          <option value="">Any</option>
          {GENRES.map((g) => <option key={g.id} value={g.id}>{g.name}</option>)}
        </select>
      </div>

      <div className="field" style={{ marginBottom: 0 }}>
        <label>Release Year</label>
        <select style={selectStyle} value={filters.year || ''} onChange={(e) => update('year', e.target.value || undefined)}>
          <option value="">Any</option>
          {YEARS.map((y) => <option key={y} value={y}>{y}</option>)}
        </select>
      </div>

      <div className="field" style={{ marginBottom: 0 }}>
        <label>Language</label>
        <select style={selectStyle} value={filters.language || ''} onChange={(e) => update('language', e.target.value || undefined)}>
          <option value="">Any</option>
          {LANGUAGES.map((l) => <option key={l.code} value={l.code}>{l.name}</option>)}
        </select>
      </div>

      <div className="field" style={{ marginBottom: 0 }}>
        <label>Country</label>
        <select style={selectStyle} value={filters.country || ''} onChange={(e) => update('country', e.target.value || undefined)}>
          <option value="">Any</option>
          {COUNTRIES.map((c) => <option key={c.code} value={c.code}>{c.name}</option>)}
        </select>
      </div>

      <div className="field" style={{ marginBottom: 0 }}>
        <label>Min Rating: {filters.minRating || 0}</label>
        <input
          type="range" min="0" max="9" step="0.5"
          value={filters.minRating || 0}
          onChange={(e) => update('minRating', Number(e.target.value) || undefined)}
        />
      </div>

      <div className="field" style={{ marginBottom: 0 }}>
        <label>Runtime (min)</label>
        <div style={{ display: 'flex', gap: 6 }}>
          <input
            type="number" placeholder="Min" style={{ ...selectStyle, width: '50%' }}
            value={filters.minRuntime || ''} onChange={(e) => update('minRuntime', e.target.value || undefined)}
          />
          <input
            type="number" placeholder="Max" style={{ ...selectStyle, width: '50%' }}
            value={filters.maxRuntime || ''} onChange={(e) => update('maxRuntime', e.target.value || undefined)}
          />
        </div>
      </div>

      <div className="field" style={{ marginBottom: 0 }}>
        <label>Sort By</label>
        <select style={selectStyle} value={filters.sortBy || 'popularity.desc'} onChange={(e) => update('sortBy', e.target.value)}>
          <option value="popularity.desc">Most Popular</option>
          <option value="vote_average.desc">Highest Rated</option>
          <option value="primary_release_date.desc">Newest</option>
          <option value="revenue.desc">Highest Grossing</option>
        </select>
      </div>
    </div>
  )
}
