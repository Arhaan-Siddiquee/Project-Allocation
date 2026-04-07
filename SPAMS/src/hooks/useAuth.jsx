import { createContext, useContext, useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'

const AuthContext = createContext({})

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null)
  const [profile, setProfile] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null)
      if (!session?.user) {
        setProfile(null)
        setLoading(false)
      }
    })

    return () => subscription.unsubscribe()
  }, [])

  useEffect(() => {
    if (user) {
      fetchProfile(user.id, user.user_metadata?.role)
    }
  }, [user?.id])

  const fetchProfile = async (userId, role) => {
    try {
      const table = role === 'faculty' ? 'faculty_profiles' : 'student_profiles'
      const { data } = await supabase.from(table).select('*').eq('id', userId).single()
      setProfile(data)
    } catch (e) {
      console.log('Profile not yet created')
    } finally {
      setLoading(false)
    }
  }

  const refreshProfile = async () => {
    if (user) await fetchProfile(user.id, user.user_metadata?.role)
  }

  return (
    <AuthContext.Provider value={{ user, profile, loading, refreshProfile }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => useContext(AuthContext)
