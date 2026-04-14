import { motion } from "framer-motion";
import { Target, Shield, Zap, TrendingUp, Eye, Award } from "lucide-react";

const benefits = [
  {
    icon: Target,
    title: "Foco Total",
    description: "Ambiente projetado para eliminar distrações e maximizar sua produtividade diária.",
  },
  {
    icon: Shield,
    title: "Autoridade & Credibilidade",
    description: "Endereço comercial em Moema transmite profissionalismo e confiança para seus clientes.",
  },
  {
    icon: TrendingUp,
    title: "Aumente seu Faturamento",
    description: "Profissionais em coworking relatam até 30% mais produtividade e crescimento de receita.",
  },
  {
    icon: Eye,
    title: "Imagem Profissional",
    description: "Receba clientes em um espaço compartilhado premium, com toda a infraestrutura necessária.",
  },
  {
    icon: Zap,
    title: "Networking Estratégico",
    description: "Conecte-se com outros profissionais e crie oportunidades de negócio no ambiente compartilhado.",
  },
  {
    icon: Award,
    title: "Custo-Benefício Imbatível",
    description: "Toda a infraestrutura de um escritório premium por uma fração do custo de uma sala própria.",
  },
];

const WhyChooseSection = () => {
  return (
    <section className="py-20 relative">
      <div className="container mx-auto px-4">
        <motion.h2
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="font-serif text-3xl md:text-5xl font-bold text-center mb-4"
        >
          Por que escolher o <span className="text-gradient-gold">Ellite?</span>
        </motion.h2>
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-muted-foreground text-center max-w-xl mx-auto mb-12"
        >
          Mais que um espaço de trabalho compartilhado — uma plataforma para acelerar sua carreira.
        </motion.p>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-5xl mx-auto">
          {benefits.map((benefit, i) => (
            <motion.div
              key={benefit.title}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: i * 0.1 }}
              className="glass-card rounded-2xl p-6 glass-card-hover group"
            >
              <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center mb-4 group-hover:bg-primary/20 transition">
                <benefit.icon className="w-6 h-6 text-primary" />
              </div>
              <h3 className="font-serif text-lg font-bold text-foreground mb-2">{benefit.title}</h3>
              <p className="text-muted-foreground text-sm leading-relaxed">{benefit.description}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default WhyChooseSection;
