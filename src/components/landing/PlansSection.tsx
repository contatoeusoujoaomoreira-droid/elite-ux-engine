import { motion } from "framer-motion";
import { Check, Crown } from "lucide-react";

const plans = [
  {
    name: "Hora",
    price: "R$ 25",
    period: "/hora",
    features: ["Sala privativa", "Wi-Fi ultra rápido", "Ar condicionado", "Café incluso"],
    popular: false,
    whatsapp: "Olá! Tenho interesse no plano POR HORA do Ellite Coworking. Gostaria de mais informações.",
  },
  {
    name: "Diária",
    price: "R$ 89",
    period: "/dia",
    features: ["Sala privativa o dia todo", "Wi-Fi ultra rápido", "Ar condicionado", "Café e água", "Endereço comercial"],
    popular: true,
    whatsapp: "Olá! Tenho interesse no plano DIÁRIA do Ellite Coworking. Gostaria de mais informações.",
  },
  {
    name: "Mensal",
    price: "R$ 1.200",
    period: "/mês",
    features: ["Sala privativa exclusiva", "Wi-Fi ultra rápido", "Ar condicionado", "Café e água", "Endereço comercial", "Chave própria 24h"],
    popular: false,
    whatsapp: "Olá! Tenho interesse no plano MENSAL do Ellite Coworking. Gostaria de mais informações.",
  },
];

interface PlansSectionProps {
  onPlanClick?: (planName: string) => void;
}

const PlansSection = ({ onPlanClick }: PlansSectionProps) => {
  const handleClick = (plan: typeof plans[0]) => {
    onPlanClick?.(plan.name);
    const msg = encodeURIComponent(plan.whatsapp);
    window.open(`https://wa.me/5511976790653?text=${msg}`, "_blank");
  };

  return (
    <section id="planos" className="py-20">
      <div className="container mx-auto px-4">
        <motion.h2
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="font-serif text-3xl md:text-5xl font-bold text-center mb-4"
        >
          Planos & <span className="text-gradient-gold">Investimento</span>
        </motion.h2>
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-muted-foreground text-center max-w-xl mx-auto mb-12"
        >
          Escolha o plano ideal para o seu momento profissional.
        </motion.p>

        <div className="grid md:grid-cols-3 gap-6 max-w-4xl mx-auto items-stretch">
          {plans.map((plan, i) => (
            <motion.div
              key={plan.name}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: i * 0.15 }}
              className={`glass-card rounded-2xl p-8 flex flex-col relative transition-all duration-500 ${
                plan.popular ? "scale-105 border-primary/30 glow-gold" : "glass-card-hover"
              }`}
            >
              {plan.popular && (
                <div className="absolute -top-4 left-1/2 -translate-x-1/2 flex items-center gap-1.5 bg-primary text-primary-foreground text-xs font-bold px-4 py-1.5 rounded-full">
                  <Crown className="w-3.5 h-3.5" /> Mais Popular
                </div>
              )}

              <h3 className="font-serif text-2xl font-bold text-foreground mb-2">{plan.name}</h3>
              <div className="mb-6">
                <span className="text-gradient-gold font-serif text-4xl font-bold">{plan.price}</span>
                <span className="text-muted-foreground text-sm">{plan.period}</span>
              </div>

              <ul className="space-y-3 mb-8 flex-1">
                {plan.features.map((f) => (
                  <li key={f} className="flex items-center gap-2 text-sm text-foreground/80">
                    <Check className="w-4 h-4 text-primary flex-shrink-0" />
                    {f}
                  </li>
                ))}
              </ul>

              <button
                onClick={() => handleClick(plan)}
                className={`w-full py-3 rounded-full font-semibold text-sm transition-all duration-300 ${
                  plan.popular
                    ? "bg-primary text-primary-foreground hover:opacity-90"
                    : "border border-border text-foreground hover:border-primary/50 hover:text-primary"
                }`}
              >
                Quero este plano
              </button>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default PlansSection;
