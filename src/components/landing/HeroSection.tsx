import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";

const HeroSection = () => {
  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
      {/* Radial glow */}
      <div className="absolute inset-0 radial-glow pointer-events-none" />
      <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full bg-primary/5 blur-[120px] pointer-events-none" />

      <div className="container mx-auto px-4 text-center relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
        >
          <p className="text-primary font-sans text-sm uppercase tracking-[0.3em] mb-6 font-medium">
            Coworking Premium em Moema — São Paulo
          </p>

          <h1 className="font-serif text-4xl md:text-6xl lg:text-7xl font-bold leading-tight mb-6">
            Seu Próximo Nível{" "}
            <span className="text-gradient-gold">Profissional</span>
            <br />
            Começa Aqui.
          </h1>

          <p className="text-muted-foreground text-lg md:text-xl max-w-2xl mx-auto mb-10 font-light leading-relaxed">
            Um escritório que transmite autoridade, gera confiança e impressiona seus clientes.
            Infraestrutura completa sem os custos de um escritório tradicional.
          </p>

          <a href="#planos" className="inline-block magic-button">
            <span className="magic-button-inner text-base">
              Conheça os Planos <ArrowRight className="w-5 h-5" />
            </span>
          </a>
        </motion.div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1, duration: 1 }}
          className="mt-16 flex justify-center gap-8 md:gap-16 text-muted-foreground text-sm"
        >
          {["Wi-Fi Ultra Rápido", "Ar Condicionado", "Recepção Profissional"].map((item) => (
            <span key={item} className="flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-primary" />
              {item}
            </span>
          ))}
        </motion.div>
      </div>
    </section>
  );
};

export default HeroSection;
