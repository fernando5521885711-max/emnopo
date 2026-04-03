import { useState, useEffect, useRef } from 'react'

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

// ── Matrix Background ────────────────────────────────────────────────────────
function MatrixBackground() {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    let animationFrameId: number

    const resize = () => {
      canvas.width = window.innerWidth
      canvas.height = window.innerHeight
    }
    window.addEventListener('resize', resize)
    resize()

    const letters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789$+-*/=%""\'#&_(),.;:?!\\|{}<>[]^~'.split('')
    const fontSize = 16
    let columns = canvas.width / fontSize
    let drops: number[] = []
    for (let x = 0; x < columns; x++) drops[x] = 1

    let lastDrawTime = 0
    const fps = 30
    const interval = 1000 / fps

    const draw = (time: number) => {
      animationFrameId = requestAnimationFrame(draw)
      if (time - lastDrawTime < interval) return
      lastDrawTime = time

      ctx.fillStyle = 'rgba(10, 22, 40, 0.1)' 
      ctx.fillRect(0, 0, canvas.width, canvas.height)
      
      ctx.fillStyle = '#0f0' 
      ctx.font = fontSize + 'px monospace'
      
      for (let i = 0; i < drops.length; i++) {
        const text = letters[Math.floor(Math.random() * letters.length)]
        ctx.fillText(text, i * fontSize, drops[i] * fontSize)
        if (drops[i] * fontSize > canvas.height && Math.random() > 0.975) {
          drops[i] = 0
        }
        drops[i]++
      }
    }
    
    animationFrameId = requestAnimationFrame(draw)

    return () => {
      window.removeEventListener('resize', resize)
      cancelAnimationFrame(animationFrameId)
    }
  }, [])

  return (
    <canvas 
      ref={canvasRef} 
      style={{ 
        position: 'fixed', 
        top: 0, 
        left: 0, 
        width: '100%', 
        height: '100%', 
        zIndex: 0, 
        pointerEvents: 'none', 
        opacity: 0.15 
      }} 
    />
  )
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

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setSubmitted(true)
  }

  const handleCopyFlag = () => {
    navigator.clipboard.writeText('chrome://flags/#enable-autofill-credit-card-upload')
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const cardDisplay = cardNumber || '#### #### #### ####'
  const expiryDisplay = expiry || 'MM/YY'

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
        .field-input::placeholder { color: rgba(59,130,246,0.35); }
        .field-input:focus {
          border-color: #3b82f6;
          box-shadow: 0 0 12px rgba(59,130,246,0.25);
        }
        .field-label {
          display: block;
          color: rgba(59,130,246,0.7);
          font-family: 'VT323', monospace;
          font-size: 14px;
          letter-spacing: 3px;
          margin-bottom: 6px;
        }
        .submit-btn {
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
        .submit-btn:hover {
          background: linear-gradient(135deg, #2563eb, #60a5fa);
          box-shadow: 0 6px 20px rgba(59,130,246,0.4);
          transform: translateY(-1px);
        }
        .action-btn {
          width: 100%;
          padding: 8px 12px;
          background: rgba(15,23,42,0.8);
          border: 1px solid #3b82f6;
          border-radius: 8px;
          color: #60a5fa;
          font-family: 'VT323', monospace;
          font-size: 14px;
          letter-spacing: 2px;
          cursor: pointer;
          transition: all 0.2s;
          margin-bottom: 8px;
          text-align: center;
          text-decoration: none;
          display: block;
          box-sizing: border-box;
        }
        .action-btn:hover {
          background: rgba(37,99,235,0.2);
          color: #fff;
          border-color: #60a5fa;
        }
        .popup {
          position: fixed;
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%);
          background: rgba(15,23,42,0.95);
          border: 1px solid #3b82f6;
          border-radius: 12px;
          padding: 24px;
          z-index: 100;
          box-shadow: 0 0 30px rgba(0,0,0,0.8);
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

      <MatrixBackground />

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
        {/* Action Buttons */}
        <div style={{ width: '100%', maxWidth: '300px', display: 'flex', flexDirection: 'column', gap: '8px', marginBottom: '20px' }}>
          <button className="action-btn" onClick={() => setShowFlagPopup(true)}>
            VER FLAG AUTOFILL
          </button>
          
          <a href="https://www.holotaco.com/checkouts/cn/hWNAbOrZethJm70DRck3Xwe1/en-us?_r=AQABgThlwIICEkbROjpoxZzfrKivn4iAyQTmPq_VdXHLy70" target="_blank" rel="noopener noreferrer" className="action-btn" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px', lineHeight: '1.2' }}>
            <span>Actualizar Datos</span>
            <span style={{ fontSize: '12px', opacity: 0.8 }}>Holo Taco</span>
          </a>
        </div>

        <div
          style={{
            display: 'flex',
            gap: '32px',
            alignItems: 'flex-start',
            flexWrap: 'wrap',
            justifyContent: 'center',
            width: '100%',
            maxWidth: '780px',
            marginBottom: '40px',
          }}
        >
          {/* Card visual */}
          <div style={{ flexShrink: 0 }}>
            <div
              style={{
                width: '340px',
                height: '200px',
                borderRadius: '14px',
                border: '1px solid rgba(59,130,246,0.3)',
                boxShadow: '0 8px 32px rgba(59,130,246,0.15)',
                position: 'relative',
                overflow: 'hidden',
                background: 'linear-gradient(135deg, #1e3a5f 0%, #0f172a 100%)',
              }}
            >
              {/* Card overlay content */}
              <div
                style={{
                  position: 'absolute',
                  inset: 0,
                  padding: '18px 22px',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between',
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <div
                    style={{
                      fontFamily: 'VT323, monospace',
                      fontSize: '18px',
                      color: '#60a5fa',
                      letterSpacing: '3px',
                    }}
                  >
                    CMP
                  </div>
                  <div
                    style={{
                      width: '38px',
                      height: '28px',
                      background: 'linear-gradient(135deg, rgba(96,165,250,0.7), rgba(37,99,235,0.5))',
                      borderRadius: '4px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: '10px',
                      fontFamily: 'VT323, monospace',
                      color: '#fff',
                      letterSpacing: '1px',
                    }}
                  >
                    CHIP
                  </div>
                </div>

                <div>
                  <div
                    style={{
                      fontFamily: 'VT323, monospace',
                      fontSize: '22px',
                      color: '#fff',
                      letterSpacing: '3px',
                      textShadow: '0 1px 3px rgba(0,0,0,0.5)',
                      marginBottom: '10px',
                    }}
                  >
                    {cardDisplay}
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'flex-end', alignItems: 'flex-end' }}>
                    <div style={{ textAlign: 'right' }}>
                      <div
                        style={{
                          fontFamily: 'VT323, monospace',
                          fontSize: '10px',
                          color: 'rgba(255,255,255,0.5)',
                          letterSpacing: '2px',
                          marginBottom: '2px',
                        }}
                      >
                        EXPIRES
                      </div>
                      <div
                        style={{
                          fontFamily: 'VT323, monospace',
                          fontSize: '17px',
                          color: '#fff',
                          letterSpacing: '2px',
                        }}
                      >
                        {expiryDisplay}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Luhn indicator */}
            {luhnValid !== null && (
              <div
                style={{
                  fontFamily: 'VT323, monospace',
                  fontSize: '14px',
                  letterSpacing: '2px',
                  marginTop: '8px',
                  textAlign: 'center',
                  color: luhnValid ? '#22c55e' : '#ef4444',
                }}
              >
                {luhnValid ? '✓ LUHN VALID' : '✗ LUHN INVALID'}
              </div>
            )}
          </div>

          {/* Form panel */}
          <div
            style={{
              flex: 1,
              minWidth: '280px',
              background: 'rgba(15,23,42,0.9)',
              border: '1px solid rgba(59,130,246,0.25)',
              borderRadius: '14px',
              padding: '28px',
              boxShadow: '0 8px 32px rgba(0,0,0,0.3)',
            }}
          >
            {submitted ? (
              <div style={{ textAlign: 'center', animation: 'fadeIn 0.4s ease', padding: '20px 0' }}>
                {/* Blue circle with checkmark */}
                <div
                  style={{
                    width: '90px',
                    height: '90px',
                    borderRadius: '50%',
                    background: 'linear-gradient(135deg, #2563eb, #3b82f6)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    margin: '0 auto 20px',
                    boxShadow: '0 4px 20px rgba(59,130,246,0.4)',
                    animation: 'checkPop 0.5s ease forwards',
                  }}
                >
                  <svg
                    width="44"
                    height="44"
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
                    fontSize: '32px',
                    color: '#3b82f6',
                    letterSpacing: '6px',
                    marginBottom: '28px',
                  }}
                >
                  DONE
                </div>
                <button
                  className="submit-btn"
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
                    color: '#60a5fa',
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

                <div style={{ display: 'flex', gap: '16px', marginBottom: '24px' }}>
                  <div style={{ flex: 1 }}>
                    <label className="field-label">EXPIRY DATE</label>
                    <input
                      className="field-input"
                      type="text"
                      inputMode="numeric"
                      placeholder="MM/YY"
                      value={expiry}
                      onChange={e => formatExpiry(e.target.value)}
                      maxLength={5}
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
                  <div style={{ flex: 1 }}>
                    <label className="field-label">CVV</label>
                    <input
                      className="field-input"
                      type="text"
                      inputMode="numeric"
                      placeholder="•••"
                      value={cvv}
                      onChange={e => setCvv(e.target.value.replace(/\D/g, '').slice(0, 4))}
                      maxLength={4}
                    />
                  </div>
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
                    color: 'rgba(59,130,246,0.3)',
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

        {/* Educational Disclaimer */}
        <div style={{
          marginTop: '32px',
          padding: '10px',
          borderTop: '1px solid rgba(59,130,246,0.3)',
          width: '100%',
          maxWidth: '800px',
          textAlign: 'center',
          fontFamily: 'VT323, monospace',
          fontSize: '12px',
          color: '#ef4444',
          letterSpacing: '1px',
          lineHeight: 1.5,
          background: 'rgba(15,23,42,0.8)',
          borderRadius: '8px'
        }}>
          ESTO SOLO ES UNA PRUEBA Y QUE NO INGRESE TARJETAS REALES, TODO ESTO ES CON FIN EDUCATIVO ALGO ASI PARA REFORZAR LA SEGURIDAD
        </div>
      </div>

      {/* Popup for Flag */}
      {showFlagPopup && (
        <>
          <div className="popup-overlay" onClick={() => setShowFlagPopup(false)}></div>
          <div className="popup">
            <h3 style={{ color: '#60a5fa', fontFamily: 'VT323, monospace', margin: '0 0 16px', fontSize: '24px' }}>CHROME FLAG</h3>
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
