'use client'

import { Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { useState } from 'react'

// Criamos um componente interno apenas para o Formulário que usa os parâmetros de busca
function LoginForm() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      })

      const data = await res.json()

      if (!res.ok) {
        throw new Error(data.error || 'Erro ao fazer login')
      }

      // Redireciona para onde tentou ir ou para o dashboard administrativo
      const callbackUrl = searchParams.get('redirect') || '/admin'
      router.push(callbackUrl)
      router.refresh()
    } catch (err: any) {
      setError(err.message || 'Credenciais inválidas')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#F9F6F0] px-4">
      <div className="max-w-md w-full space-y-8 bg-white p-8 rounded-lg shadow-sm border border-gray-100">
        <div className="text-center">
          <h2 className="text-3xl font-serif text-[#1A1A1A] tracking-wide">maison lux</h2>
          <p className="mt-2 text-sm text-gray-500 font-sans">Painel Administrativo</p>
        </div>
        
        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          {error && (
            <div className="bg-red-50 text-red-600 p-3 rounded text-sm text-center">
              {error}
            </div>
          )}
          
          <div className="rounded-md space-y-4">
            <div>
              <label className="block text-xs uppercase tracking-wider text-gray-600 mb-1 font-sans">E-mail</label>
              <input
                type="email"
                required
                className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-400 text-gray-900 focus:outline-none focus:ring-[#C5A880] focus:border-[#C5A880] sm:text-sm"
                placeholder="seu@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
            <div>
              <label className="block text-xs uppercase tracking-wider text-gray-600 mb-1 font-sans">Senha</label>
              <input
                type="password"
                required
                className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-400 text-gray-900 focus:outline-none focus:ring-[#C5A880] focus:border-[#C5A880] sm:text-sm"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
          </div>

          <div>
            <button
              type="submit"
              disabled={loading}
              className="group relative w-full flex justify-center py-3 px-4 border border-transparent text-sm font-sans uppercase tracking-widest text-white bg-[#1A1A1A] hover:bg-[#C5A880] transition-colors duration-300 focus:outline-none disabled:opacity-50"
            >
              {loading ? 'Entrando...' : 'Acessar Painel'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

// O componente principal da página exporta o formulário envolvido no Suspense requisitado pelo Next.js
export default function LoginPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-[#F9F6F0]">
        <p className="text-[#1A1A1A] font-serif tracking-widest animate-pulse">Carregando...</p>
      </div>
    }>
      <LoginForm />
    </Suspense>
  )
}