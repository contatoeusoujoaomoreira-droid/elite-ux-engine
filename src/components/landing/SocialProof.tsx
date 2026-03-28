import { motion } from "framer-motion";
import { Star } from "lucide-react";
import { useCountUp } from "@/hooks/useCountUp";
import React from "react";

const testimonials = [
  { name: "Dr. Marcos Oliveira", role: "Advogado Tributarista", text: "Desde que migrei para o Ellite, meus clientes passaram a me ver com outros olhos. A estrutura transmite credibilidade instantânea." },
  { name: "Ana Beatriz Costa", role: "Consultora Financeira", text: "A localização em Moema é imbatível. Meus clientes adoram o ambiente e eu economizo mais de R$3.000/mês." },
  { name: "Ricardo Mendes", role: "Corretor de Imóveis", text: "Produtividade disparou. O ambiente profissional me mantém focado e os fechamentos aumentaram 40%." },
  { name: "Dra. Camila Santos", role: "Psicóloga", text: "Privacidade, conforto e elegância. Meus pacientes se sentem acolhidos desde a recepção." },
  { name: "Fernando Lima", role: "Arquiteto", text: "Infraestrutura impecável. Recebo clientes aqui com orgulho. O café é um bônus incrível!" },
];

const kpis = [
  { value: 200, suffix: "+", label: "Profissionais Atendidos" },
  { value: 3, suffix: "", label: "Salas Premium" },
  { value: 98, suffix: "%", label: "Taxa de Satisfação" },
  { value: 150, suffix: "%", label: "Ganho em Produtividade" },
];

const fadeUp = {
  initial: { opacity: 0, y: 30 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true },
  transition: { duration: 0.6 },
};

const KpiCard = ({ kpi, delay }: { kpi: typeof kpis[0]; delay: number }) => {
  const { count, ref } = useCountUp(kpi.value, 2000);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5, delay }}
      className="text-center glass-card rounded-2xl p-6"
    >
      <p className="text-gradient-gold font-serif text-4xl md:text-5xl font-bold" ref={ref as React.Ref<HTMLParagraphElement>}>
        {count}{kpi.suffix}
      </p>
      <p className="text-muted-foreground text-sm mt-2">{kpi.label}</p>
    </motion.div>
  );
};

const SocialProof = () => {
  return (
    <section id="depoimentos" className="py-20 overflow-hidden">
      <div className="container mx-auto px-4 mb-16">
        <motion.h2 {...fadeUp} className="font-serif text-3xl md:text-5xl font-bold text-center mb-4">
          Quem <span className="text-gradient-gold">Confia</span> em Nós
        </motion.h2>
        <motion.p {...fadeUp} className="text-muted-foreground text-center max-w-xl mx-auto">
          Profissionais que transformaram sua carreira com o ambiente certo.
        </motion.p>
      </div>

      {/* Marquee */}
      <div className="relative">
        <div className="absolute left-0 top-0 bottom-0 w-20 bg-gradient-to-r from-background to-transparent z-10" />
        <div className="absolute right-0 top-0 bottom-0 w-20 bg-gradient-to-l from-background to-transparent z-10" />
        <div className="flex marquee w-max">
          {[...testimonials, ...testimonials].map((t, i) => (
            <div key={i} className="glass-card rounded-2xl p-6 mx-3 w-[340px] flex-shrink-0">
              <div className="flex gap-1 mb-3">
                {[...Array(5)].map((_, j) => (
                  <Star key={j} className="w-4 h-4 fill-primary text-primary" />
                ))}
              </div>
              <p className="text-foreground/80 text-sm mb-4 leading-relaxed">"{t.text}"</p>
              <div>
                <p className="font-semibold text-foreground text-sm">{t.name}</p>
                <p className="text-muted-foreground text-xs">{t.role}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* KPIs */}
      <div className="container mx-auto px-4 mt-16">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          {kpis.map((kpi, i) => (
            <KpiCard key={kpi.label} kpi={kpi} delay={i * 0.1} />
          ))}
        </div>
      </div>
    </section>
  );
};

export default SocialProof;
