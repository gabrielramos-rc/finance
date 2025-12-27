import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  TrendingUp, 
  Wallet, 
  PieChart, 
  CreditCard,
  ArrowRight
} from 'lucide-react';

export default function Home() {
  return (
    <main className="min-h-screen">
      {/* Hero Section */}
      <section className="relative overflow-hidden">
        {/* Background gradient */}
        <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-background to-background" />
        
        {/* Grid pattern overlay */}
        <div 
          className="absolute inset-0 opacity-[0.02]"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
          }}
        />
        
        <div className="relative mx-auto max-w-7xl px-4 py-24 sm:px-6 lg:px-8">
          <div className="animate-fade-in text-center">
            <Badge variant="secondary" className="mb-4">
              Em desenvolvimento
            </Badge>
            <h1 className="text-4xl font-bold tracking-tight sm:text-6xl">
              <span className="text-primary">Finance</span>
              <br />
              <span className="text-muted-foreground">Gestão Financeira Pessoal</span>
            </h1>
            <p className="mx-auto mt-6 max-w-2xl text-lg text-muted-foreground">
              Controle seus gastos, orçamentos e investimentos em um só lugar.
              Importe dados do Banco do Brasil e tenha visibilidade completa das suas finanças.
            </p>
            <div className="mt-10 flex items-center justify-center gap-4">
              <Button size="lg" disabled>
                Acessar Dashboard
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
              <Button variant="outline" size="lg" disabled>
                Fazer Login
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="mx-auto max-w-7xl px-4 py-24 sm:px-6 lg:px-8">
        <div className="animate-slide-up grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          <Card className="border-primary/20 bg-gradient-to-br from-primary/5 to-transparent">
            <CardHeader>
              <div className="mb-2 flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">
                <Wallet className="h-6 w-6 text-primary" />
              </div>
              <CardTitle className="text-lg">Controle de Gastos</CardTitle>
              <CardDescription>
                Importe extratos e faturas automaticamente
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                Suporte para CSV do Banco do Brasil e PDFs de faturas VISA e ELO.
              </p>
            </CardContent>
          </Card>

          <Card className="border-chart-2/20 bg-gradient-to-br from-chart-2/5 to-transparent">
            <CardHeader>
              <div className="mb-2 flex h-12 w-12 items-center justify-center rounded-lg bg-chart-2/10">
                <PieChart className="h-6 w-6 text-chart-2" />
              </div>
              <CardTitle className="text-lg">Orçamentos</CardTitle>
              <CardDescription>
                Defina limites por categoria
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                Receba alertas quando estiver próximo do limite definido.
              </p>
            </CardContent>
          </Card>

          <Card className="border-chart-4/20 bg-gradient-to-br from-chart-4/5 to-transparent">
            <CardHeader>
              <div className="mb-2 flex h-12 w-12 items-center justify-center rounded-lg bg-chart-4/10">
                <CreditCard className="h-6 w-6 text-chart-4" />
              </div>
              <CardTitle className="text-lg">Parcelas</CardTitle>
              <CardDescription>
                Acompanhe suas compras parceladas
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                Veja quando cada parcela termina e quanto você vai economizar.
              </p>
            </CardContent>
          </Card>

          <Card className="border-chart-5/20 bg-gradient-to-br from-chart-5/5 to-transparent">
            <CardHeader>
              <div className="mb-2 flex h-12 w-12 items-center justify-center rounded-lg bg-chart-5/10">
                <TrendingUp className="h-6 w-6 text-chart-5" />
              </div>
              <CardTitle className="text-lg">Investimentos</CardTitle>
              <CardDescription>
                Sugestões inteligentes
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                Saiba quanto você pode investir de forma segura todo mês.
              </p>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border/50">
        <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
          <p className="text-center text-sm text-muted-foreground">
            Finance &copy; {new Date().getFullYear()} — Sistema pessoal de gestão financeira
          </p>
        </div>
      </footer>
    </main>
  );
}
