import { LoginForm } from "@/components/login-form"

export default function LoginPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background via-muted/20 to-background p-4">
      <div className="w-full max-w-md space-y-6">
        <div className="text-center space-y-2">
          <h1 className="text-4xl font-bold text-foreground tracking-tight">Leads Dashboard</h1>
          <p className="text-muted-foreground">Faça login para acessar o painel de leads</p>
        </div>
        <LoginForm />
      </div>
    </div>
  )
}
