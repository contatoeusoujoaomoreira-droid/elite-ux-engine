import { useState } from "react";
import { Lock } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

interface AdminLoginProps {
  onAuthenticated: () => void;
}

const AdminLogin = ({ onAuthenticated }: AdminLoginProps) => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loginError, setLoginError] = useState("");

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError("");
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) setLoginError("Credenciais inválidas");
    else onAuthenticated();
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-4">
      <form onSubmit={handleLogin} className="glass-card rounded-2xl p-8 w-full max-w-sm">
        <div className="flex items-center justify-center mb-6">
          <Lock className="w-8 h-8 text-primary" />
        </div>
        <h1 className="font-serif text-2xl font-bold text-center mb-6 text-foreground">
          Painel <span className="text-gradient-gold">Admin</span>
        </h1>
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="E-mail"
          className="w-full bg-secondary border border-border rounded-lg px-4 py-3 text-foreground text-sm mb-3 focus:outline-none focus:border-primary"
        />
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="Senha"
          className="w-full bg-secondary border border-border rounded-lg px-4 py-3 text-foreground text-sm mb-4 focus:outline-none focus:border-primary"
        />
        {loginError && <p className="text-destructive text-xs mb-3">{loginError}</p>}
        <button
          type="submit"
          className="w-full bg-primary text-primary-foreground py-3 rounded-lg font-semibold text-sm hover:opacity-90 transition"
        >
          Entrar
        </button>
      </form>
    </div>
  );
};

export default AdminLogin;
