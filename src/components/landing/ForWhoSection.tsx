import { motion, useScroll, useTransform } from "framer-motion";
import { Briefcase, TrendingUp, Home } from "lucide-react";
import { useRef } from "react";

const cards = [
  {
    icon: Briefcase,
    title: "Profissionais Liberais",
    desc: "Advogados, contadores, consultores e psicólogos que precisam de um endereço e ambiente profissional para atender clientes com excelência.",
  },
  {
    icon: TrendingUp,
    title: "Consultores & Coaches",
    desc: "Profissionais que conduzem reuniões, mentorias e sessões presenciais e precisam de um espaço que transmita autoridade.",
  },
  {
    icon: Home,
    title: "Corretores & Empreendedores",
    desc: "Quem precisa de um escritório de impacto sem o peso de contratos longos, condomínios e manutenção.",
  },
];

const ForWhoSection = () => {
  const ref = useRef(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start end", "end start"] });
  const bgY = useTransform(scrollYProgress, [0, 1], [80, -80]);

  return (
    <section ref={ref} className="py-20 relative overflow-hidden">
      <motion.div
        style={{ y: bgY }}
        className="absolute -top-20 left-1/4 w-[500px] h-[500px] rounded-full bg-primary/3 blur-[150px] pointer-events-none"
      />

      <div className="container mx-auto px-4 relative z-10">
        <motion.h2
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="font-serif text-3xl md:text-5xl font-bold text-center mb-4"
        >
          Para Quem é o <span className="text-gradient-gold">Ellite</span>?
        </motion.h2>
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-muted-foreground text-center max-w-xl mx-auto mb-12"
        >
          Se você se identifica com algum desses perfis, este é o seu lugar.
        </motion.p>

        <div className="grid md:grid-cols-3 gap-6" style={{ perspective: "1200px" }}>
          {cards.map((card, i) => (
            <motion.div
              key={card.title}
              initial={{ opacity: 0, y: 50, rotateX: 15 }}
              whileInView={{ opacity: 1, y: 0, rotateX: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: i * 0.15, type: "spring", damping: 20 }}
              whileHover={{
                y: -8,
                rotateY: 3,
                transition: { duration: 0.3 },
              }}
              className="glass-card glass-card-hover rounded-2xl p-8 transition-all duration-500 group"
              style={{ transformStyle: "preserve-3d" }}
            >
              <motion.div
                className="w-14 h-14 rounded-xl bg-primary/10 flex items-center justify-center mb-6 group-hover:bg-primary/20 transition-colors"
                whileHover={{ rotate: 5, scale: 1.1 }}
              >
                <card.icon className="w-7 h-7 text-primary" />
              </motion.div>
              <h3 className="font-serif text-xl font-bold mb-3 text-foreground">{card.title}</h3>
              <p className="text-muted-foreground text-sm leading-relaxed">{card.desc}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default ForWhoSection;
