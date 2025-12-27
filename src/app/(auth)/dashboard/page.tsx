import { createClient } from '@/lib/supabase/server'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { 
  TrendingUp, 
  TrendingDown, 
  Wallet, 
  PiggyBank,
  ArrowUpRight,
  ArrowDownRight,
} from 'lucide-react'

export default async function DashboardPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  const userName = user?.user_metadata?.full_name || 
                   user?.user_metadata?.name || 
                   user?.email?.split('@')[0] || 
                   'Usuário'

  // Placeholder data - will be replaced with real data from the database
  const summaryData = {
    income: 20000,
    expenses: 18500,
    balance: 1500,
    budgetUsed: 75,
  }

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(value)
  }

  return (
    <div className="space-y-8">
      {/* Page header */}
      <div>
        <h1 className="text-2xl font-bold text-zinc-100">
          Olá, {userName.split(' ')[0]}! 👋
        </h1>
        <p className="mt-1 text-sm text-zinc-500">
          Aqui está o resumo das suas finanças este mês.
        </p>
      </div>

      {/* Summary cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card className="bg-zinc-900/50 border-zinc-800">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-zinc-400">
              Renda
            </CardTitle>
            <div className="p-2 bg-emerald-500/10 rounded-lg">
              <TrendingUp className="h-4 w-4 text-emerald-500" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-zinc-100">
              {formatCurrency(summaryData.income)}
            </div>
            <p className="text-xs text-emerald-500 flex items-center mt-1">
              <ArrowUpRight className="h-3 w-3 mr-1" />
              100% recebido
            </p>
          </CardContent>
        </Card>

        <Card className="bg-zinc-900/50 border-zinc-800">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-zinc-400">
              Gastos
            </CardTitle>
            <div className="p-2 bg-red-500/10 rounded-lg">
              <TrendingDown className="h-4 w-4 text-red-500" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-zinc-100">
              {formatCurrency(summaryData.expenses)}
            </div>
            <p className="text-xs text-red-400 flex items-center mt-1">
              <ArrowDownRight className="h-3 w-3 mr-1" />
              Fixos + Variáveis
            </p>
          </CardContent>
        </Card>

        <Card className="bg-zinc-900/50 border-zinc-800">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-zinc-400">
              Saldo
            </CardTitle>
            <div className="p-2 bg-blue-500/10 rounded-lg">
              <Wallet className="h-4 w-4 text-blue-500" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-zinc-100">
              {formatCurrency(summaryData.balance)}
            </div>
            <p className="text-xs text-zinc-500 mt-1">
              Projetado para o mês
            </p>
          </CardContent>
        </Card>

        <Card className="bg-zinc-900/50 border-zinc-800">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-zinc-400">
              Orçamento
            </CardTitle>
            <div className="p-2 bg-amber-500/10 rounded-lg">
              <PiggyBank className="h-4 w-4 text-amber-500" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-zinc-100">
              {summaryData.budgetUsed}%
            </div>
            <div className="mt-2 h-2 w-full bg-zinc-800 rounded-full overflow-hidden">
              <div 
                className="h-full bg-gradient-to-r from-emerald-500 to-amber-500 rounded-full transition-all duration-500"
                style={{ width: `${summaryData.budgetUsed}%` }}
              />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Placeholder content */}
      <div className="grid gap-6 lg:grid-cols-2">
        <Card className="bg-zinc-900/50 border-zinc-800">
          <CardHeader>
            <CardTitle className="text-zinc-100">Gastos por Categoria</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-center h-64 text-zinc-500">
              <p>Gráfico será exibido após importar dados</p>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-zinc-900/50 border-zinc-800">
          <CardHeader>
            <CardTitle className="text-zinc-100">Alertas</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col items-center justify-center h-64 text-zinc-500">
              <p>🔔 Nenhum alerta no momento</p>
              <p className="text-sm mt-2">Você está em dia!</p>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card className="bg-zinc-900/50 border-zinc-800">
        <CardHeader>
          <CardTitle className="text-zinc-100">Últimas Transações</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col items-center justify-center h-32 text-zinc-500">
            <p>Nenhuma transação importada</p>
            <a 
              href="/import" 
              className="mt-2 text-sm text-emerald-500 hover:text-emerald-400 transition-colors"
            >
              Importar dados →
            </a>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

