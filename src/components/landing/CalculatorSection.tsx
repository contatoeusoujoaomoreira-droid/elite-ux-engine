import { motion } from "framer-motion";
import { useState } from "react";
import { AlertTriangle, TrendingDown } from "lucide-react";

const CalculatorSection = () => {
  const [days, setDays] = useState(10);

  const traditionalOfficeCost = 4500; // custo mensal escritório tradicional
  const dailyTraditional = traditionalOfficeCost / 22;
  const dailyEllite = 89; // diária Ellite
  const savings = Math.round(days * dailyTraditional - days * dailyEllite);
  const lostMoney = Math.round(days * dailyTraditional);

  return (
    <section className="py-20">
      <div className="container mx-auto px-4 max-w-3xl">
        <motion.h2
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="font-serif text-3xl md:text-5xl font-bold text-center mb-4"
        >
          Calculadora de <span className="text-gradient-gold">Impacto</span>
        </motion.h2>
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-muted-foreground text-center mb-12"
        >
          Descubra quanto você economiza trocando um escritório tradicional pelo Ellite.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="glass-card rounded-2xl p-8"
        >
          <div className="text-center mb-8">
            <p className="text-muted-foreground text-sm mb-2">Quantos dias por mês você usa o escritório?</p>
            <p className="text-gradient-gold font-serif text-5xl font-bold">{days} dias</p>
          </div>

          <input
            type="range"
            min={1}
            max={22}
            value={days}
            onChange={(e) => setDays(Number(e.target.value))}
            className="w-full h-2 rounded-full appearance-none cursor-pointer mb-8"
            style={{
              background: `linear-gradient(to right, #FBBF24 0%, #FBBF24 ${((days - 1) / 21) * 100}%, hsl(0,0%,14%) ${((days - 1) / 21) * 100}%, hsl(0,0%,14%) 100%)`,
            }}
          />

          <div className="grid md:grid-cols-2 gap-4">
            <div className="glass-card rounded-xl p-6 text-center">
              <TrendingDown className="w-8 h-8 text-primary mx-auto mb-2" />
              <p className="text-muted-foreground text-sm mb-1">Sua Economia Mensal</p>
              <p className="text-gradient-gold font-serif text-3xl font-bold">
                R$ {savings > 0 ? savings.toLocaleString("pt-BR") : 0}
              </p>
            </div>

            <div className="rounded-xl p-6 text-center border border-destructive/30 bg-destructive/5">
              <AlertTriangle className="w-8 h-8 text-destructive mx-auto mb-2" />
              <p className="text-muted-foreground text-sm mb-1">Dinheiro Deixado na Mesa</p>
              <p className="text-destructive font-serif text-3xl font-bold">
                R$ {lostMoney.toLocaleString("pt-BR")}
              </p>
              <p className="text-destructive/60 text-xs mt-1">
                Custo de um escritório tradicional para {days} dias
              </p>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default CalculatorSection;
