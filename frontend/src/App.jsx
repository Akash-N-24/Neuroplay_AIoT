import { useEffect, useMemo, useRef, useState } from 'react'
import { updateMonitoringNotification, showAlertNotification } from './utils/notifications'
import { CartesianGrid, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://127.0.0.1:8000'
const HISTORY_LIMIT = 500
const POLL_INTERVAL_MS = 3500
const THIRTY_MINUTES_MS = 30 * 60 * 1000

const stressTheme = {
  Normal: { label: 'Normal', accent: '#22c55e', glow: 'rgba(34, 197, 94, 0.24)', chip: 'rgba(34, 197, 94, 0.14)' },
  Moderate: { label: 'Moderate', accent: '#f59e0b', glow: 'rgba(245, 158, 11, 0.24)', chip: 'rgba(245, 158, 11, 0.14)' },
  High: { label: 'High', accent: '#ef4444', glow: 'rgba(239, 68, 68, 0.24)', chip: 'rgba(239, 68, 68, 0.14)' },
  Unknown: { label: 'Unknown', accent: '#94a3b8', glow: 'rgba(148, 163, 184, 0.20)', chip: 'rgba(148, 163, 184, 0.14)' },
}

function formatTime(timestamp) {
  if (!timestamp) return 'Waiting for data'
  return new Intl.DateTimeFormat('en-US', { hour: '2-digit', minute: '2-digit', second: '2-digit', month: 'short', day: 'numeric' }).format(new Date(timestamp))
}

async function fetchLatestReading() {
  const controller = new AbortController()
  const timeoutId = window.setTimeout(() => controller.abort(), 8000)
  try {
    const response = await fetch(`${API_BASE_URL}/api/history/?limit=${HISTORY_LIMIT}`, { signal: controller.signal })
    if (!response.ok) throw new Error(`Request failed with status ${response.status}`)
    return response.json()
  } finally { clearTimeout(timeoutId) }
}

function getStressScore(level) { return level === 'Moderate' ? 1 : level === 'High' ? 2 : 0 }
function getStressLabel(score) { return score >= 1.5 ? 'High' : score >= 0.5 ? 'Moderate' : 'Normal' }
function formatChartTime(timestamp) { return new Intl.DateTimeFormat('en-US', { hour: '2-digit', minute: '2-digit' }).format(new Date(timestamp)) }

function StatCard({ title, value, subtitle, accent }) {
  return <section className="stat-card" style={{ '--accent': accent }}><div className="stat-card__label">{title}</div><div className="stat-card__value">{value}</div><div className="stat-card__subtitle">{subtitle}</div></section>
}

function ProjectCard({ title, copy, meta }) {
  return <article className="project-card"><div className="project-card__meta">{meta}</div><h3>{title}</h3><p>{copy}</p></article>
}

export default function App() {
  const [reading, setReading] = useState(null)
  const [history, setHistory] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [lastSync, setLastSync] = useState(null)
  const [toast, setToast] = useState(null)
  const [highAlert, setHighAlert] = useState(null)
  const previousStressLevelRef = useRef(null)
  const previousReadingRef = useRef(null)
  const notificationInFlightRef = useRef(false)

  useEffect(() => {
    let mounted = true
    let refreshing = false

    const notify = async (nextReading) => {
      if (!nextReading || notificationInFlightRef.current) return
      notificationInFlightRef.current = true
      try {
        await updateMonitoringNotification(nextReading)
        await showAlertNotification(`🔔 ${nextReading.stress_level ?? 'Unknown'} Stress`, `HR: ${Math.round(nextReading.hr)} BPM\nHRV: ${Math.round(nextReading.hrv)} ms\nStress: ${nextReading.stress_level}`)
      } catch (e) { console.error('Notification update failed:', e) }
      finally { notificationInFlightRef.current = false }
    }

    const loadReading = async () => {
      if (refreshing) return
      refreshing = true
      try {
        setError('')
        const latestHistory = await fetchLatestReading()
        if (!mounted) return
        const nextHistory = Array.isArray(latestHistory) ? latestHistory : []
        const nextReading = nextHistory[0] ?? null
        setHistory(nextHistory)
        setReading(nextReading)

        const previous = previousReadingRef.current
        const changed = Boolean(nextReading && (!previous || previous.hr !== nextReading.hr || previous.hrv !== nextReading.hrv || previous.stress_level !== nextReading.stress_level))
        if (changed) void notify(nextReading)
        previousReadingRef.current = nextReading

        const previousStress = previousStressLevelRef.current
        const currentStress = nextReading?.stress_level ?? null
        if (currentStress && previousStress !== currentStress) {
          if (currentStress === 'Moderate') setToast({ title: 'Moderate stress detected', message: 'Take a short pause, breathe slowly, and reduce stimulation for a few minutes.' })
          if (currentStress === 'High') setHighAlert({ title: 'High stress detected', message: 'Recommend a 5-minute break, water, and a few slow breaths before resuming activity.' })
        }
        previousStressLevelRef.current = currentStress
        setLastSync(new Date())
      } catch (e) {
        if (mounted) setError(e instanceof Error ? e.message : 'Unable to load dashboard data')
      } finally {
        if (mounted) setLoading(false)
        refreshing = false
      }
    }

    void loadReading()
    const timer = window.setInterval(loadReading, POLL_INTERVAL_MS)
    const focus = () => { if (document.visibilityState === 'visible') void loadReading() }
    document.addEventListener('visibilitychange', focus)
    window.addEventListener('focus', focus)
    return () => { mounted = false; clearInterval(timer); document.removeEventListener('visibilitychange', focus); window.removeEventListener('focus', focus) }
  }, [])

  useEffect(() => {
    if (!toast) return
    const timer = window.setTimeout(() => setToast(null), 4200)
    return () => clearTimeout(timer)
  }, [toast])

  const theme = useMemo(() => stressTheme[reading?.stress_level] ?? stressTheme.Unknown, [reading])
  const chartData = useMemo(() => {
    const threshold = Date.now() - THIRTY_MINUTES_MS
    return [...history].sort((a,b) => new Date(a.timestamp)-new Date(b.timestamp)).filter(x => new Date(x.timestamp).getTime() >= threshold).map(x => ({ ...x, timeLabel: formatChartTime(x.timestamp), score: getStressScore(x.stress_level), stressLabel: x.stress_level }))
  }, [history])
  const hasReading = Boolean(reading)

  return <main className="dashboard-shell">
    <div className="ambient ambient--one" /><div className="ambient ambient--two" />
    <header className="topbar">
      <a className="topbar__brand" href="#overview"><span className="topbar__brand-mark">NP</span><span className="topbar__brand-copy"><strong>NeuroPlay</strong><span>AIoT stress monitoring for competitive gaming</span></span></a>
      <nav className="topbar__nav"><a href="#overview">Overview</a><a href="#live">Live Metrics</a><a href="#history">History</a><a href="#alerts">Alerts</a><a href="#pipeline">Pipeline</a></nav>
      <div className="topbar__status"><span className="topbar__status-dot" style={{background:theme.accent,boxShadow:`0 0 18px ${theme.glow}`}} />{loading ? 'Loading' : error ? 'Connection issue' : 'Live'}</div>
    </header>

    <section className="hero" id="overview">
      <div className="hero__copy"><span className="eyebrow">AIoT • Competitive Gaming • Stress Intelligence</span><h1>NeuroPlay: An AIoT based stress monitoring system for competitive gaming</h1><p>NeuroPlay turns live physiological readings into a stress signal for gamers. The platform ingests sensor data, predicts stress, and surfaces actionable alerts.</p><div className="hero__actions"><a className="hero__primary" href="#live">View live metrics</a><a className="hero__secondary" href="#pipeline">See the pipeline</a></div></div>
      <div className="hero__panel"><div className="status-rail"><div className="status-rail__pulse" style={{background:theme.accent,boxShadow:`0 0 28px ${theme.glow}`}}/><div><div className="status-rail__label">Status</div><div className="status-rail__value">{loading?'Loading latest reading':error?'Connection issue':'Live'}</div></div></div><div className="hero__panel-grid"><ProjectCard meta="Wearable + AI" title="Real-time stress awareness" copy="HR, HRV and RMSSD are translated into a stress label for the dashboard and alerts."/><ProjectCard meta="Dashboard UX" title="Built for live match monitoring" copy="Large status tiles, a trend graph and high-visibility alerts keep the operator focused." /></div></div>
    </section>

    <section className="section-block" id="live"><div className="section-block__header"><div><span className="eyebrow">Live metrics</span><h2>Current sensor state</h2></div><p>Updates from Django every 3.5 seconds and reflects the latest stored reading.</p></div>
      <div className="grid">
        <StatCard title="Heart Rate" value={loading?'...':hasReading?`${reading.hr} bpm`:'No data'} subtitle="Latest reading from history API" accent={theme.accent}/>
        <StatCard title="HRV" value={loading?'...':hasReading?`${reading.hrv} ms`:'No data'} subtitle="Heart rate variability" accent={theme.accent}/>
        <article className="status-card" style={{'--accent':theme.accent,'--glow':theme.glow}}><div className="status-card__topline"><span className="status-card__title">Stress Status</span><span className="status-badge" style={{background:theme.chip,color:theme.accent}}>{hasReading?reading.stress_level:'No data'}</span></div><div className="status-card__body"><div className="status-card__ring"/><div><div className="status-card__metric">{hasReading?reading.stress_level:'Waiting'}</div><div className="status-card__submetric">{hasReading?'Predicted by the backend model':'Send a reading or import a CSV to populate the dashboard'}</div></div></div></article>
      </div>
    </section>

    <section className="chart-card" id="history"><div className="chart-card__header"><div><div className="stat-card__label">History</div><h2>Stress level over the last 30 minutes</h2></div><div className="chart-card__legend"><span><i className="legend-dot legend-dot--normal"/>Normal</span><span><i className="legend-dot legend-dot--moderate"/>Moderate</span><span><i className="legend-dot legend-dot--high"/>High</span></div></div><div className="chart-card__body">{chartData.length ? <ResponsiveContainer width="100%" height="100%"><LineChart data={chartData}><CartesianGrid stroke="rgba(148,163,184,.14)" strokeDasharray="4 4"/><XAxis dataKey="timeLabel" tick={{fill:'#8ea3c0',fontSize:12}}/><YAxis domain={[0,2]} ticks={[0,1,2]} tickFormatter={getStressLabel} tick={{fill:'#8ea3c0',fontSize:12}}/><Tooltip contentStyle={{background:'rgba(7,13,25,.96)',border:'1px solid rgba(148,163,184,.22)',borderRadius:16,color:'#e5eefc'}} formatter={(value,name,item)=>[item.payload.stressLabel,'Stress']}/><Line type="monotone" dataKey="score" stroke={theme.accent} strokeWidth={3} dot={{r:4,strokeWidth:2,fill:'#07111f'}} activeDot={{r:7}}/></LineChart></ResponsiveContainer>:<div className="chart-empty">No readings in the last 30 minutes yet.</div>}</div></section>

    <section className="pipeline-section" id="pipeline"><div className="section-block__header"><div><span className="eyebrow">System pipeline</span><h2>From wearable to alert</h2></div><p>Capture, predict, visualize and respond through the integrated AIoT stack.</p></div><div className="pipeline-grid"><article className="pipeline-step"><span>01</span><h3>Capture</h3><p>MAX30102/PPG and ESP32 provide physiological measurements to the data pipeline.</p></article><article className="pipeline-step"><span>02</span><h3>Predict</h3><p>Django runs the trained model and hybrid decision layer for Normal, Moderate or High.</p></article><article className="pipeline-step"><span>03</span><h3>Respond</h3><p>The UI highlights the result with cards, a graph, warnings and a High-stress break recommendation.</p></article></div></section>

    <section className="section-block" id="alerts"><div className="section-block__header"><div><span className="eyebrow">Alerting</span><h2>What the system does at each level</h2></div><p>Visual and notification feedback is designed for fast interpretation during competitive play.</p></div><div className="alerts-grid"><article className="alert-tile alert-tile--normal"><h3>Normal</h3><p>Stable signal, no interruption.</p></article><article className="alert-tile alert-tile--moderate"><h3>Moderate</h3><p>Toast reminder to slow down and reset.</p></article><article className="alert-tile alert-tile--high"><h3>High</h3><p>Break recommendation with an explicit pause.</p></article></div></section>

    <footer className="footer"><span>Last sync: {lastSync ? formatTime(lastSync) : 'Not synced yet'}</span><span>Reading timestamp: {formatTime(reading?.timestamp)}</span></footer>
    {!loading&&!error&&!hasReading?<div className="empty-state">No sensor readings are stored yet. Post an ESP32 reading or import a CSV.</div>:null}
    {error?<div className="error-banner">{error}</div>:null}
    {toast?<div className="toast-banner" role="status"><div><div className="toast-banner__title">{toast.title}</div><div className="toast-banner__message">{toast.message}</div></div><button className="toast-banner__close" onClick={()=>setToast(null)}>×</button></div>:null}
    {highAlert?<div className="modal-backdrop" onClick={()=>setHighAlert(null)}><section className="alert-modal" onClick={e=>e.stopPropagation()}><div className="alert-modal__badge">High stress</div><h3>{highAlert.title}</h3><p>{highAlert.message}</p><ul className="alert-modal__list"><li>Step away from the screen for a few minutes.</li><li>Drink water and breathe slowly.</li><li>Resume only after your stress level drops.</li></ul><div className="alert-modal__actions"><button className="alert-modal__primary" onClick={()=>setHighAlert(null)}>I will take a break</button></div></section></div>:null}
  </main>
}
