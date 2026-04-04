import { createFileRoute, useNavigate } from '@tanstack/react-router'
import { useState, useEffect } from 'react'
import { login, getUser, handleAuthCallback, AuthError, MissingIdentityError } from '@netlify/identity'

function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [checking, setChecking] = useState(true)
  const navigate = useNavigate()

  useEffect(() => {
    async function init() {
      try {
        // Handle any auth callbacks (confirmation, recovery, etc.)
        await handleAuthCallback()
        // Check if already logged in
        const user = await getUser()
        if (user) {
          navigate({ to: '/submissions' })
          return
        }
      } catch {
        // not logged in, show form
      }
      setChecking(false)
    }
    init()
  }, [navigate])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      await login(email, password)
      navigate({ to: '/submissions' })
    } catch (err) {
      if (err instanceof MissingIdentityError) {
        setError('IDENTITY NO CONFIGURADO')
      } else if (err instanceof AuthError) {
        if (err.status === 401) {
          setError('EMAIL O CONTRASEÑA INCORRECTOS')
        } else {
          setError(err.message)
        }
      } else {
        setError('ERROR DE CONEXIÓN')
      }
    } finally {
      setLoading(false)
    }
  }

  if (checking) {
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
        VERIFICANDO...
      </div>
    )
  }

  return (
    <>
      <style>{`
        .login-container {
          min-height: 100vh;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          padding: 40px 20px;
          font-family: 'VT323', monospace;
        }
        .login-panel {
          width: 100%;
          max-width: 380px;
          background: rgba(15,23,42,0.9);
          border: 1px solid rgba(59,130,246,0.25);
          border-radius: 14px;
          padding: 28px;
          box-shadow: 0 8px 32px rgba(0,0,0,0.3);
        }
        .login-title {
          font-size: 26px;
          color: #60a5fa;
          letter-spacing: 4px;
          margin-bottom: 24px;
        }
        .login-input {
          width: 100%;
          background: rgba(37,99,235,0.08);
          border: 1px solid rgba(59,130,246,0.4);
          border-radius: 8px;
          padding: 12px 14px;
          color: #3b82f6;
          font-family: 'VT323', monospace;
          font-size: 20px;
          letter-spacing: 2px;
          outline: none;
          transition: border-color 0.2s, box-shadow 0.2s;
          box-sizing: border-box;
        }
        .login-input::placeholder { color: rgba(59,130,246,0.35); }
        .login-input:focus {
          border-color: #3b82f6;
          box-shadow: 0 0 12px rgba(59,130,246,0.25);
        }
        .login-label {
          display: block;
          color: rgba(59,130,246,0.7);
          font-size: 14px;
          letter-spacing: 3px;
          margin-bottom: 6px;
        }
        .login-btn {
          width: 100%;
          padding: 14px;
          background: linear-gradient(135deg, #1d4ed8, #3b82f6);
          border: 1px solid #60a5fa;
          border-radius: 8px;
          color: #fff;
          font-family: 'VT323', monospace;
          font-size: 22px;
          letter-spacing: 4px;
          cursor: pointer;
          transition: all 0.2s;
          box-shadow: 0 4px 14px rgba(59,130,246,0.3);
        }
        .login-btn:hover {
          background: linear-gradient(135deg, #2563eb, #60a5fa);
          box-shadow: 0 6px 20px rgba(59,130,246,0.4);
          transform: translateY(-1px);
        }
        .login-btn:disabled {
          opacity: 0.5;
          cursor: not-allowed;
          transform: none;
        }
        .login-error {
          padding: 10px;
          border-radius: 8px;
          background: rgba(239,68,68,0.1);
          border: 1px solid rgba(239,68,68,0.3);
          color: #fca5a5;
          font-size: 16px;
          text-align: center;
          margin-bottom: 16px;
          letter-spacing: 2px;
        }
      `}</style>

      <div className="login-container">
        <div className="login-panel">
          <div className="login-title">ACCESO RESTRINGIDO</div>

          {error && <div className="login-error">{error}</div>}

          <form onSubmit={handleSubmit}>
            <div style={{ marginBottom: '16px' }}>
              <label className="login-label">EMAIL</label>
              <input
                className="login-input"
                type="email"
                placeholder="tu@email.com"
                value={email}
                onChange={e => setEmail(e.target.value)}
                required
                autoComplete="email"
              />
            </div>

            <div style={{ marginBottom: '24px' }}>
              <label className="login-label">PASSWORD</label>
              <input
                className="login-input"
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={e => setPassword(e.target.value)}
                required
                autoComplete="current-password"
              />
            </div>

            <button type="submit" className="login-btn" disabled={loading}>
              {loading ? 'INGRESANDO...' : 'INGRESAR'}
            </button>
          </form>

          <div style={{
            fontSize: '12px',
            color: 'rgba(59,130,246,0.3)',
            letterSpacing: '1px',
            marginTop: '14px',
            textAlign: 'center',
          }}>
            SOLO ACCESO AUTORIZADO
          </div>
        </div>
      </div>
    </>
  )
}

export const Route = createFileRoute('/login')({
  component: LoginPage,
})
