'use client'
import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import Navbar from '@/components/Navbar'
import { useRouter } from 'next/navigation'

export default function LeaguePage({ params }: { params: { id: string } }) {
  const [profile, setProfile] = useState<any>(null)
  const [league, setLeague] = useState<any>(null)
  const [members, setMembers] = useState<any[]>([])
  const [nations, setNations] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [copied, setCopied] = useState(false)
  const router = useRouter()
  const supabase = createClient()

  useEffect(() => {
    const load = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { router.push('/'); return }

      const [{ data: prof }, { data: lg }, { data: mem }, { data: nat }] = await Promise.all([
        supabase.from('profiles').select('*').eq('id', user.id).single(),
        supabase.from('tournaments').select('*').eq('id', params.id).single(),
        supabase.from('league_members')
          .select('*, player:profiles(username, avatar_url)')
          .eq('tournament_id', params.id),
        supabase.from('nations')
          .select('*, owner:profiles(username)')
          .eq('tournament_id', params.id)
          .order('total_points', { ascending: false }),
      ])

      setProfile(prof)
      setLeague(lg)
      setMembers(mem || [])
      setNations(nat || [])
      setLoading(false)
    }
    load()
  }, [params.id])

  const copyCode = () => {
    navigator.clipboard.writeText(league?.invite_code || '')
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const startDraft = async () => {
    await supabase.from('tournaments')
      .update({ draft_status: 'in_progress', status: 'draft' })
      .eq('id', params.id)
    router.push(`/draft/${params.id}`)
  }

  if (loading) return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div style={{ fontFamily: 'Impact, sans-serif', fontSize: 28, color: 'var(--gold)' }}>LOADING LEAGUE...</div>
    </div>
  )

  if (!league) return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div style={{ color: 'var(--red)', fontSize: 18 }}>League not found</div>
    </div>
  )

  const isAdmin = profile?.role === 'admin' || league.created_by === profile?.id
  const myNations = nations.filter(n => n.owner_id === profile?.id)

  return (
    <div style={{ minHeight: '100vh' }}>
      <Navbar username={profile?.username} />
      <div style={{ maxWidth: 1100, margin: '0 auto', padding: '2rem' }}>

        {/* League Header */}
        <div className="card" style={{ padding: '1.5rem', marginBottom: '1.5rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
              <div style={{
                width: 56, height: 56, background: 'var(--red)', borderRadius: 12,
                display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 26,
              }}>🏆</div>
              <div>
                <h1 style={{ fontSize: 28, color: '#fff', marginBottom: 2 }}>{league.name}</h1>
                <div style={{ fontSize: 12, color: 'rgba(209,212,209,0.4)' }}>
                  {members.length} players · FIFA World Cup 2026 ·
                  <span style={{ color: 'var(--gold)', marginLeft: 4, fontWeight: 700 }}>
                    {league.status?.replace('_', ' ').toUpperCase()}
                  </span>
                </div>
              </div>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              {/* Invite Code */}
              <div style={{ textAlign: 'center' }}>
                <div style={{
                  fontFamily: 'Impact, sans-serif', fontSize: 28, color: 'var(--gold)',
                  letterSpacing: 4, background: 'var(--surface2)', padding: '8px 16px',
                  borderRadius: 8, cursor: 'pointer', border: '1px solid rgba(255,215,0,0.2)',
                }} onClick={copyCode}>
                  {league.invite_code}
                </div>
                <div style={{ fontSize: 10, color: 'rgba(209,212,209,0.3)', marginTop: 4 }}>
                  {copied ? '✅ Copied!' : 'Click to copy invite code'}
                </div>
              </div>

              {isAdmin && league.draft_status === 'not_started' && (
                <button onClick={startDraft} className="btn-primary"
                  style={{ padding: '12px 24px', fontSize: 15 }}>
                  🎯 Start Draft
                </button>
              )}
              {league.draft_status === 'in_progress' && (
                <button onClick={() => router.push(`/draft/${params.id}`)}
                  className="btn-primary" style={{ background: 'var(--green)', padding: '12px 24px' }}>
                  ⚡ Join Draft
                </button>
              )}
            </div>
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>

          {/* Members */}
          <div>
            <h2 style={{ fontSize: 22, color: '#fff', marginBottom: '1rem' }}>👥 PLAYERS</h2>
            <div className="card" style={{ overflow: 'hidden' }}>
              {members.map((m, i) => (
                <div key={m.id} style={{
                  display: 'flex', alignItems: 'center', gap: 12,
                  padding: '12px 1rem', borderBottom: '1px solid rgba(255,255,255,0.04)',
                }}>
                  <div style={{
                    width: 32, height: 32, borderRadius: '50%', background: 'var(--blue)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: 13, fontWeight: 700, color: '#fff', flexShrink: 0,
                  }}>{m.player?.username?.[0]?.toUpperCase()}</div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: 14, fontWeight: 600, color: '#fff' }}>
                      {m.player?.username}
                      {league.created_by === m.player_id && (
                        <span style={{ marginLeft: 6, fontSize: 10, color: 'var(--gold)', fontWeight: 700 }}>ADMIN</span>
                      )}
                    </div>
                    <div style={{ fontSize: 11, color: 'rgba(209,212,209,0.35)' }}>
                      {nations.filter(n => n.owner_id === m.player_id).length} nations drafted
                    </div>
                  </div>
                  <div style={{ fontFamily: 'Impact, sans-serif', fontSize: 18, color: 'var(--gold)' }}>
                    {nations.filter(n => n.owner_id === m.player_id).reduce((sum, n) => sum + (n.total_points || 0), 0)}
                    <span style={{ fontSize: 10, color: 'rgba(209,212,209,0.3)', marginLeft: 4 }}>pts</span>
                  </div>
                </div>
              ))}
              {members.length === 0 && (
                <div style={{ padding: '2rem', textAlign: 'center', color: 'rgba(209,212,209,0.3)', fontSize: 13 }}>
                  No players yet — share the invite code!
                </div>
              )}
            </div>
          </div>

          {/* My Nations in this league */}
          <div>
            <h2 style={{ fontSize: 22, color: '#fff', marginBottom: '1rem' }}>🌍 MY NATIONS</h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {myNations.length === 0 && (
                <div className="card" style={{ padding: '2rem', textAlign: 'center', color: 'rgba(209,212,209,0.3)', fontSize: 13 }}>
                  {league.draft_status === 'not_started'
                    ? 'Draft hasn\'t started yet'
                    : 'You haven\'t drafted any nations'}
                </div>
              )}
              {myNations.map(n => (
                <div key={n.id} className="card" style={{ padding: '1rem', display: 'flex', alignItems: 'center', gap: 12 }}>
                  <img src={n.flag_url} alt={n.name} style={{ width: 44, height: 30, objectFit: 'cover', borderRadius: 4 }} />
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: 14, fontWeight: 700, color: '#fff' }}>{n.name}</div>
                    <div style={{ fontSize: 11, color: 'rgba(209,212,209,0.4)' }}>Group {n.group_label}</div>
                  </div>
                  <span className={`badge status-${n.status}`}>{n.status}</span>
                  <div style={{ fontFamily: 'Impact, sans-serif', fontSize: 20, color: 'var(--gold)' }}>
                    {n.total_points}
                  </div>
                </div>
              ))}
            </div>

            {/* Draft status banner */}
            {league.draft_status === 'not_started' && isAdmin && (
              <div className="card" style={{
                padding: '1.2rem', marginTop: '1rem',
                background: 'rgba(230,29,37,0.1)', borderColor: 'rgba(230,29,37,0.2)',
                textAlign: 'center',
              }}>
                <div style={{ fontSize: 13, color: 'rgba(209,212,209,0.7)', marginBottom: 8 }}>
                  Share the invite code with your friends, then start the draft when everyone's ready.
                </div>
                <button onClick={startDraft} className="btn-primary" style={{ width: '100%' }}>
                  🎯 Start Draft Now
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
