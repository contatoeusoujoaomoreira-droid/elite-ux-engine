import { motion } from "framer-motion";
import { Check, Crown, MessageCircle } from "lucide-react";

const plans = [
  {
    name: "Estação por Hora",
    price: "R$ 40",
    period: "/hora",
    subtitle: "por pessoa",
    features: [
      "1 estação de trabalho compartilhada",
      "Wi-Fi de alta velocidade",
      "Café e água free",
      "Sem fidelidade — pague só pelo que usar",
    ],
    popular: false,
    href: "https://wa.me/5511976790653?text=Ol%C3%A1!%20Gostaria%20de%20garantir%20minha%20esta%C3%A7%C3%A3o%20por%20Hora%20(R$%2040)%20no%20Ellite%20Coworking.",
  },
  {
    name: "Sala de Reunião",
    price: "R$ 70",
    period: "/hora",
    subtitle: "por pessoa · o mais escolhido",
    features: [
      "Sala de reunião para atendimentos",
      "Ambiente privativo para o grupo",
      "Wi-Fi de alta velocidade",
      "Café e água free",
      "Ideal para reuniões com clientes",
    ],
    popular: true,
    href: "https://wa.me/5511976790653?text=Ol%C3%A1!%20Gostaria%20de%20reservar%20a%20Sala%20de%20Reuni%C3%A3o%20(R$%2070/hora%20por%20pessoa)%20no%20Ellite%20Coworking.",
  },
];

const consultHref =
  "https://wa.me/5511976790653?text=Ol%C3%A1!%20Gostaria%20de%20consultar%20planos%20di%C3%A1rios%20e%20mensais%20no%20Ellite%20Coworking.";

interface PlansSectionProps {
  onPlanClick?: (planName: string) => void;
}

const PlansSection = ({ onPlanClick }: PlansSectionProps) => {
  const handleClick = (plan: typeof plans[0]) => {
    onPlanClick?.(plan.name);
    window.open(plan.href, "_blank", "noopener,noreferrer");
  };

  const handleConsult = () => {
    onPlanClick?.("Consulta Diária/Mensal");
    window.open(consultHref, "_blank", "noopener,noreferrer");
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
          Pague por hora, sem burocracia. Perfeito para quem está de passagem ou precisa de um lugar de qualidade para algumas horas de trabalho.
        </motion.p>

        <div className="grid md:grid-cols-2 gap-6 max-w-3xl mx-auto items-stretch">
          {plans.map((plan, i) => (
            <motion.div
              key={plan.name}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: i * 0.15 }}
              className={`glass-card rounded-2xl p-8 flex flex-col relative transition-all duration-500 ${
                plan.popular ? "md:scale-105 border-primary/30 glow-gold" : "glass-card-hover"
              }`}
            >
              {plan.popular && (
                <div className="absolute -top-4 left-1/2 -translate-x-1/2 flex items-center gap-1.5 bg-primary text-primary-foreground text-xs font-bold px-4 py-1.5 rounded-full uppercase tracking-wider whitespace-nowrap">
                  <Crown className="w-3.5 h-3.5" /> Mais Escolhido
                </div>
              )}

              <h3 className="font-serif text-2xl font-bold text-foreground mb-2">{plan.name}</h3>
              <div className="mb-6">
                <span className="text-gradient-gold font-serif text-4xl font-bold">{plan.price}</span>
                <span className="text-muted-foreground text-sm">{plan.period}</span>
                {plan.subtitle && (
                  <p className="text-muted-foreground text-xs mt-1 opacity-70">{plan.subtitle}</p>
                )}
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

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="max-w-3xl mx-auto mt-8"
        >
          <div className="glass-card rounded-2xl p-6 md:p-8 flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="text-center md:text-left">
              <p className="font-serif text-lg font-bold text-foreground">
                Precisa de plano <span className="text-gradient-gold">Diário</span> ou <span className="text-gradient-gold">Mensal</span>?
              </p>
              <p className="text-muted-foreground text-sm mt-1">
                Consulte condições personalizadas para uso recorrente.
              </p>
            </div>
            <button
              onClick={handleConsult}
              className="inline-flex items-center gap-2 border border-primary/40 text-foreground hover:bg-primary hover:text-primary-foreground transition px-6 py-3 rounded-full font-semibold text-sm whitespace-nowrap"
            >
              <MessageCircle className="w-4 h-4" /> Consultar valores
            </button>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default PlansSection;
