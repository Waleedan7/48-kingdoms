'use client'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'

export default function Navbar({ username }: { username?: string }) {
  const router = useRouter()
  const supabase = createClient()

  const handleSignOut = async () => {
    await supabase.auth.signOut()
    router.push('/')
    router.refresh()
  }

  return (
    <>
      <div className="accent-bar" />
      <nav style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '0.9rem 2rem', background: 'rgba(10,10,15,0.97)',
        borderBottom: '1px solid rgba(255,255,255,0.06)',
        position: 'sticky', top: 0, zIndex: 100,
      }}>
        <Link href="/dashboard" style={{ display: 'flex', alignItems: 'center', gap: 10, textDecoration: 'none' }}>
          <div style={{
            width: 36, height: 36, background: 'var(--red)', borderRadius: 8,
            display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18,
          }}>🏆</div>
          <span style={{ fontFamily: 'Impact, sans-serif', fontSize: 20, color: '#fff', letterSpacing: 1 }}>
            48 <span style={{ color: 'var(--gold)' }}>KINGDOMS</span>
          </span>
        </Link>

        <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
          <Link href="/dashboard" style={{ color: 'rgba(209,212,209,0.6)', textDecoration: 'none', fontSize: 13, padding: '6px 12px', fontWeight: 600 }}>Dashboard</Link>
          <Link href="/nations" style={{ color: 'rgba(209,212,209,0.6)', textDecoration: 'none', fontSize: 13, padding: '6px 12px', fontWeight: 600 }}>Nations</Link>
          <Link href="/draft" style={{ color: 'rgba(209,212,209,0.6)', textDecoration: 'none', fontSize: 13, padding: '6px 12px', fontWeight: 600 }}>Draft</Link>
          <Link href="/matches" style={{ color: 'rgba(209,212,209,0.6)', textDecoration: 'none', fontSize: 13, padding: '6px 12px', fontWeight: 600 }}>Matches</Link>
          {username && (
            <span style={{ color: 'var(--gold)', fontSize: 13, fontWeight: 700, marginLeft: 8 }}>
              👤 {username}
            </span>
          )}
          <button onClick={handleSignOut} className="btn-outline" style={{ marginLeft: 8, padding: '6px 16px', fontSize: 12 }}>
            Sign Out
          </button>
        </div>
      </nav>
    </>
  )
}
