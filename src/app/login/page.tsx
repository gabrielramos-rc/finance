import { LoginForm } from '@/components/auth/login-form'
import { Wallet } from 'lucide-react'

export default function LoginPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-zinc-950 relative overflow-hidden">
      {/* Background pattern */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#18181b_1px,transparent_1px),linear-gradient(to_bottom,#18181b_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_110%)]" />
      
      {/* Gradient orbs */}
      <div className="absolute top-0 -left-4 w-72 h-72 bg-emerald-500 rounded-full mix-blend-multiply filter blur-xl opacity-10 animate-blob" />
      <div className="absolute top-0 -right-4 w-72 h-72 bg-teal-500 rounded-full mix-blend-multiply filter blur-xl opacity-10 animate-blob animation-delay-2000" />
      <div className="absolute -bottom-8 left-20 w-72 h-72 bg-cyan-500 rounded-full mix-blend-multiply filter blur-xl opacity-10 animate-blob animation-delay-4000" />

      <div className="relative z-10 w-full max-w-md px-4">
        {/* Logo and title */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-600 mb-4 shadow-lg shadow-emerald-500/20">
            <Wallet className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-zinc-100 tracking-tight">
            Finance
          </h1>
          <p className="mt-2 text-zinc-500">
            Controle suas finanças de forma inteligente
          </p>
        </div>

        {/* Login card */}
        <div className="bg-zinc-950/80 backdrop-blur-xl border border-zinc-800 rounded-2xl p-8 shadow-2xl shadow-black/20">
          <h2 className="text-xl font-semibold text-zinc-100 mb-6 text-center">
            Entrar na sua conta
          </h2>
          <LoginForm />
        </div>

        {/* Footer */}
        <p className="mt-6 text-center text-sm text-zinc-600">
          Sistema pessoal de gestão financeira
        </p>
      </div>
    </div>
  )
}

