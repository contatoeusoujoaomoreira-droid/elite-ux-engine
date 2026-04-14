import { motion } from "framer-motion";
import { X, Check, Wifi, Coffee, Users, MapPin, Briefcase, TrendingUp } from "lucide-react";

const comparisons = [
  { label: "Endereço comercial premium", without: false, with: true, icon: MapPin },
  { label: "Internet de alta velocidade", without: false, with: true, icon: Wifi },
  { label: "Ambiente profissional", without: false, with: true, icon: Briefcase },
  { label: "Networking estratégico", without: false, with: true, icon: Users },
  { label: "Café e água à vontade", without: false, with: true, icon: Coffee },
  { label: "Aumento de produtividade", without: false, with: true, icon: TrendingUp },
];

const GamifiedSection = () => {
  return (
    <section className="py-20 relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-b from-background via-primary/5 to-background" />
      <div className="container mx-auto px-4 relative z-10">
        <motion.h2
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="font-serif text-3xl md:text-5xl font-bold text-center mb-4"
        >
          Com vs. Sem <span className="text-gradient-gold">Ellite Coworking</span>
        </motion.h2>
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-muted-foreground text-center max-w-xl mx-auto mb-12"
        >
          Veja a diferença que um espaço profissional faz na sua carreira.
        </motion.p>

        <div className="max-w-3xl mx-auto">
          {/* Header */}
          <div className="grid grid-cols-[1fr_auto_auto] gap-4 mb-4 px-4">
            <div />
            <div className="w-28 text-center text-sm font-semibold text-red-400">Sem Ellite</div>
            <div className="w-28 text-center text-sm font-semibold text-primary">Com Ellite</div>
          </div>

          {comparisons.map((item, i) => (
            <motion.div
              key={item.label}
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: i * 0.1 }}
              className="grid grid-cols-[1fr_auto_auto] gap-4 items-center px-4 py-3 rounded-xl mb-2 glass-card"
            >
              <div className="flex items-center gap-3">
                <item.icon className="w-5 h-5 text-primary flex-shrink-0" />
                <span className="text-foreground text-sm md:text-base">{item.label}</span>
              </div>
              <div className="w-28 flex justify-center">
                <motion.div
                  initial={{ scale: 0 }}
                  whileInView={{ scale: 1 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.1 + 0.3, type: "spring" }}
                  className="w-8 h-8 rounded-full bg-red-500/20 flex items-center justify-center"
                >
                  <X className="w-4 h-4 text-red-400" />
                </motion.div>
              </div>
              <div className="w-28 flex justify-center">
                <motion.div
                  initial={{ scale: 0 }}
                  whileInView={{ scale: 1 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.1 + 0.5, type: "spring" }}
                  className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center"
                >
                  <Check className="w-4 h-4 text-primary" />
                </motion.div>
              </div>
            </motion.div>
          ))}

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.8 }}
            className="mt-8 text-center"
          >
            <a
              href="#planos"
              className="inline-flex items-center gap-2 bg-primary text-primary-foreground px-8 py-3 rounded-full font-semibold hover:opacity-90 transition"
            >
              Quero fazer parte do Ellite
            </a>
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default GamifiedSection;
