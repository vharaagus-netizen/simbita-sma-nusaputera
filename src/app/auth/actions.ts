'use server'

import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { redirect } from 'next/navigation'

/**
 * Mengubah username menjadi format internal auth Supabase:
 * 'kezia_xii' -> 'kezia_xii@simbita.local'
 */
function resolveAuthEmail(usernameOrEmail: string): string {
  const clean = usernameOrEmail.trim().toLowerCase()
  if (clean.includes('@')) {
    return clean
  }
  const sanitized = clean.replace(/[^a-z0-9_.]/g, '')
  return `${sanitized}@simbita.local`
}

export async function login(formData: FormData) {
  const identifier = (formData.get('username') as string)?.trim()
  const password = formData.get('password') as string

  if (!identifier || !password) {
    return { error: 'Username dan kata sandi wajib diisi.' }
  }

  const authEmail = resolveAuthEmail(identifier)
  const supabase = await createClient()

  const { data, error } = await supabase.auth.signInWithPassword({
    email: authEmail,
    password,
  })

  if (error) {
    if (error.message.includes('Invalid login credentials')) {
      return { error: 'Username atau kata sandi salah. Silakan coba lagi.' }
    }
    return { error: 'Gagal masuk: ' + error.message }
  }

  if (data.user) {
    // Ambil peran dan status aktif pengguna dari profiles
    const { data: profile } = await supabase
      .from('profiles')
      .select('role, is_active')
      .eq('id', data.user.id)
      .single()

    if (profile && profile.is_active === false) {
      await supabase.auth.signOut()
      return {
        error:
          'Akun Anda telah dinonaktifkan / diarsipkan oleh Administrator. Silakan hubungi koordinator sekolah jika ini keliru.',
      }
    }

    const role = profile?.role || 'student'

    if (role === 'admin') {
      redirect('/dashboard/admin')
    } else if (role === 'mentor') {
      redirect('/dashboard/mentor')
    } else {
      redirect('/dashboard/student')
    }
  }

  return { error: 'Gagal melakukan login.' }
}

export async function register(formData: FormData) {
  const username = (formData.get('username') as string)?.trim().toLowerCase()
  const name = (formData.get('name') as string)?.trim()
  const password = formData.get('password') as string
  const role = (formData.get('role') as string) || 'student'
  const classOrDept = (formData.get('class_or_dept') as string)?.trim() || ''

  if (!username || !name || !password) {
    return { error: 'Username, Nama Lengkap, dan Kata Sandi wajib diisi.' }
  }

  const cleanUsername = username.replace(/[^a-z0-9_.]/g, '')
  if (cleanUsername.length < 3) {
    return { error: 'Username minimal 3 karakter (hanya huruf, angka, titik, atau _).' }
  }

  if (password.length < 6) {
    return { error: 'Kata sandi minimal 6 karakter.' }
  }

  const authEmail = `${cleanUsername}@simbita.local`

  // Gunakan Admin Client untuk membuat user:
  // - 100% BYPASS email rate limit
  // - Otomatis terkonfirmasi (email_confirm: true)
  // - Tidak mengirim email fisik apa pun
  const adminSupabase = createAdminClient()

  const { data: adminData, error: adminError } =
    await adminSupabase.auth.admin.createUser({
      email: authEmail,
      password: password,
      email_confirm: true,
      user_metadata: {
        name,
        role,
        class_or_dept: classOrDept,
        username: cleanUsername,
      },
    })

  if (adminError) {
    if (adminError.message.includes('already registered')) {
      return {
        error: `Username "${cleanUsername}" sudah digunakan. Silakan gunakan username lain.`,
      }
    }
    return { error: 'Pendaftaran gagal: ' + adminError.message }
  }

  // Setelah user berhasil dibuat oleh admin, langsung buat sesi login di browser
  const supabase = await createClient()
  const { error: loginError } = await supabase.auth.signInWithPassword({
    email: authEmail,
    password,
  })

  if (!loginError) {
    if (role === 'mentor') {
      redirect('/dashboard/mentor')
    } else {
      redirect('/dashboard/student')
    }
  }

  return {
    success: true,
    message: `Pendaftaran berhasil untuk username "${cleanUsername}"! Silakan masuk dengan kata sandi Anda.`,
  }
}

export async function logout() {
  const supabase = await createClient()
  await supabase.auth.signOut()
  redirect('/login')
}
