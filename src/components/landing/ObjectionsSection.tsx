import { motion } from "framer-motion";
import { Clock4, Sparkles, Wallet, Coffee } from "lucide-react";

const objections = [
  {
    icon: Clock4,
    q: "Só preciso de algumas horas, posso vir?",
    a: "Pode sim. A maioria de quem nos procura está de passagem por Moema e precisa de um lugar bom pra trabalhar por algumas horas. Pague só pelo que usar.",
  },
  {
    icon: Wallet,
    q: "E se eu não gostar? Tem fidelidade?",
    a: "Zero fidelidade. Você usa por hora e pronto. Sem contrato, sem multa, sem surpresa na fatura.",
  },
  {
    icon: Sparkles,
    q: "Vocês são um coworking grande?",
    a: "Somos um espaço enxuto e estamos crescendo — com estações compartilhadas e uma sala de reunião. Sem rodeios: é um ambiente prático, limpo e bem montado para quem precisa produzir.",
  },
  {
    icon: Coffee,
    q: "Tem café, água e Wi-Fi de verdade?",
    a: "Tem sim. Café, água filtrada e internet rápida o suficiente pra videocalls — tudo incluso, sem cobrança extra.",
  },
];

const ObjectionsSection = () => {
  return (
    <section className="py-20 relative">
      <div className="container mx-auto px-4 max-w-5xl">
        <motion.h2
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="font-serif text-3xl md:text-5xl font-bold text-center mb-4"
        >
          O que você precisa saber antes de entrar em <span className="text-gradient-gold">contato</span>
        </motion.h2>
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-muted-foreground text-center max-w-2xl mx-auto mb-12"
        >
          As dúvidas mais comuns de quem chega aqui pela primeira vez — respondidas com transparência.
        </motion.p>

        <div className="grid md:grid-cols-2 gap-4 md:gap-6">
          {objections.map((o, i) => (
            <motion.div
              key={o.q}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: i * 0.08 }}
              className="glass-card glass-card-hover rounded-2xl p-6"
            >
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center flex-shrink-0">
                  <o.icon className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <h3 className="font-semibold text-foreground text-sm md:text-base mb-1">{o.q}</h3>
                  <p className="text-muted-foreground text-sm leading-relaxed">{o.a}</p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default ObjectionsSection;
