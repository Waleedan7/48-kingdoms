'use client'
import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'

export default function HomePage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [isSignUp, setIsSignUp] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const router = useRouter()
  const supabase = createClient()

  const handleEmailAuth = async () => {
    setLoading(true)
    setError('')
    const { error } = isSignUp
      ? await supabase.auth.signUp({ email, password })
      : await supabase.auth.signInWithPassword({ email, password })
    if (error) setError(error.message)
    else router.push('/dashboard')
    setLoading(false)
  }

  const handleGoogle = async () => {
    await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: { redirectTo: `${location.origin}/auth/callback` },
    })
  }

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg)' }}>
      <div className="accent-bar" />

      <div style={{ maxWidth: 1100, margin: '0 auto', padding: '3rem 2rem', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '4rem', alignItems: 'center' }}>

        <div>
          <div style={{
            display: 'inline-flex', alignItems: 'center', gap: 6,
            background: 'rgba(230,29,37,0.15)', border: '1px solid rgba(230,29,37,0.3)',
            color: 'var(--red)', padding: '4px 14px', borderRadius: 20,
            fontSize: 11, fontWeight: 700, letterSpacing: 1.5, textTransform: 'uppercase', marginBottom: '1.2rem',
          }}>⚽ FIFA World Cup 2026</div>

          <h1 style={{ fontFamily: 'Impact, sans-serif', fontSize: 56, lineHeight: 1.05, color: '#fff', marginBottom: '0.8rem' }}>
            DRAFT YOUR<br />
            <span style={{ color: 'var(--gold)' }}>KINGDOMS.</span><br />
            <span style={{ color: 'var(--red)' }}>RULE THE</span> WORLD.
          </h1>

          <p style={{ fontSize: 15, color: 'rgba(209,212,209,0.65)', lineHeight: 1.75, marginBottom: '2rem', maxWidth: 440 }}>
            Pick nations before the tournament begins. Earn points as they win, score, and advance through each stage. The player with the most points when the final whistle blows wins it all.
          </p>

          <div style={{ display: 'flex', gap: '2.5rem', paddingTop: '2rem', borderTop: '1px solid rgba(255,255,255,0.06)' }}>
            {[['48', 'Nations'], ['12', 'Groups'], ['104', 'Matches']].map(([n, l]) => (
              <div key={l}>
                <div style={{ fontFamily: 'Impact, sans-serif', fontSize: 30, color: 'var(--gold)' }}>{n}</div>
                <div style={{ fontSize: 11, color: 'rgba(209,212,209,0.4)', textTransform: 'uppercase', letterSpacing: 1 }}>{l}</div>
              </div>
            ))}
          </div>
        </div>

        <div className="card" style={{ padding: '2rem' }}>
          <h2 style={{ fontFamily: 'Impact, sans-serif', fontSize: 26, color: '#fff', marginBottom: 4 }}>
            {isSignUp ? 'CREATE ACCOUNT' : 'JOIN THE BATTLE'}
          </h2>
          <p style={{ fontSize: 13, color: 'rgba(209,212,209,0.45)', marginBottom: '1.5rem' }}>
            {isSignUp ? 'Sign up to enter the draft' : 'Sign in to your account'}
          </p>

          <button onClick={handleGoogle} style={{
            width: '100%', background: '#fff', color: '#333', border: 'none',
            padding: '10px 20px', borderRadius: 8, fontFamily: 'Montserrat, sans-serif',
            fontWeight: 600, fontSize: 14, cursor: 'pointer', display: 'flex',
            alignItems: 'center', justifyContent: 'center', gap: 8, marginBottom: '1rem',
          }}>
            <svg width="18" height="18" viewBox="0 0 24 24">
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z"/>
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
            </svg>
            Continue with Google
          </button>

          <div style={{ display: 'flex', alignItems: 'center', gap: 10, margin: '1rem 0', fontSize: 12, color: 'rgba(255,255,255,0.2)' }}>
            <div style={{ flex: 1, height: 1, background: 'rgba(255,255,255,0.07)' }} />
            or
            <div style={{ flex: 1, height: 1, background: 'rgba(255,255,255,0.07)' }} />
          </div>

          {[
            { placeholder: 'Email address', value: email, setValue: setEmail, type: 'email' },
            { placeholder: 'Password', value: password, setValue: setPassword, type: 'password' },
          ].map(({ placeholder, value, setValue, type }) => (
            <input key={placeholder} type={type} placeholder={placeholder} value={value}
              onChange={e => setValue(e.target.value)}
              style={{
                width: '100%', background: 'var(--surface2)', border: '1px solid rgba(255,255,255,0.1)',
                borderRadius: 8, padding: '10px 14px', color: '#fff', fontFamily: 'Montserrat, sans-serif',
                fontSize: 13, outline: 'none', marginBottom: 10, display: 'block',
              }}
            />
          ))}

          {error && <p style={{ color: 'var(--red)', fontSize: 12, marginBottom: 10 }}>{error}</p>}

          <button onClick={handleEmailAuth} disabled={loading} style={{
            width: '100%', background: 'var(--blue)', color: '#fff', border: 'none',
            padding: '10px 20px', borderRadius: 8, fontFamily: 'Montserrat, sans-serif',
            fontWeight: 700, fontSize: 14, cursor: 'pointer', marginBottom: '1rem',
          }}>
            {loading ? 'Loading...' : isSignUp ? 'Create Account' : 'Sign In'}
          </button>

          <p style={{ textAlign: 'center', fontSize: 12, color: 'rgba(209,212,209,0.4)' }}>
            {isSignUp ? 'Already have an account? ' : "Don't have an account? "}
            <span onClick={() => setIsSignUp(!isSignUp)}
              style={{ color: 'var(--gold)', cursor: 'pointer', fontWeight: 600 }}>
              {isSignUp ? 'Sign In' : 'Sign Up'}
            </span>
          </p>
        </div>
      </div>
    </div>
  )
}
