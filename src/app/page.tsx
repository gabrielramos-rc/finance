export default function Home() {
  return (
    <main className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 relative overflow-hidden">
      {/* Background pattern */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-emerald-900/20 via-transparent to-transparent" />
      <div 
        className="absolute inset-0 opacity-30"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%2310b981' fill-opacity='0.08'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
        }}
      />
      
      <div className="relative z-10 flex flex-col items-center justify-center min-h-screen px-6">
        {/* Logo and title */}
        <div className="text-center mb-12 animate-fade-in">
          <div className="inline-flex items-center justify-center w-20 h-20 mb-6 rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-600 shadow-lg shadow-emerald-500/25">
            <svg
              className="w-10 h-10 text-white"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
          </div>
          <h1 className="text-5xl font-bold text-white mb-3 tracking-tight">
            Finance
          </h1>
          <p className="text-slate-400 text-lg max-w-md mx-auto">
            Sistema pessoal de gestão financeira para controle de gastos, orçamentos e investimentos
          </p>
        </div>

        {/* Status card */}
        <div className="w-full max-w-md animate-slide-up">
          <div className="bg-slate-800/50 backdrop-blur-sm border border-slate-700/50 rounded-2xl p-8 shadow-xl">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-3 h-3 rounded-full bg-emerald-500 animate-pulse" />
              <span className="text-emerald-400 font-medium">Deploy ativo</span>
            </div>
            
            <div className="space-y-4">
              <StatusItem 
                label="Vercel" 
                value="Configurado" 
                status="success" 
              />
              <StatusItem 
                label="Next.js" 
                value="v15.1" 
                status="success" 
              />
              <StatusItem 
                label="React" 
                value="v19.0" 
                status="success" 
              />
              <StatusItem 
                label="Supabase" 
                value="Pendente" 
                status="pending" 
              />
              <StatusItem 
                label="Autenticação" 
                value="Pendente" 
                status="pending" 
              />
            </div>
          </div>
        </div>

        {/* Footer */}
        <footer className="absolute bottom-8 text-center">
          <p className="text-slate-500 text-sm">
            RCConsultech © {new Date().getFullYear()}
          </p>
        </footer>
      </div>
    </main>
  );
}

function StatusItem({ 
  label, 
  value, 
  status 
}: { 
  label: string; 
  value: string; 
  status: 'success' | 'pending' | 'error';
}) {
  const statusColors = {
    success: 'text-emerald-400',
    pending: 'text-amber-400',
    error: 'text-red-400',
  };

  const dotColors = {
    success: 'bg-emerald-400',
    pending: 'bg-amber-400',
    error: 'bg-red-400',
  };

  return (
    <div className="flex items-center justify-between py-2 border-b border-slate-700/50 last:border-0">
      <span className="text-slate-300">{label}</span>
      <div className="flex items-center gap-2">
        <span className={statusColors[status]}>{value}</span>
        <div className={`w-2 h-2 rounded-full ${dotColors[status]}`} />
      </div>
    </div>
  );
}

