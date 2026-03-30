import { motion, useScroll, useTransform } from "framer-motion";
import { Wifi, Wind, Coffee, Shield, MapPin, Clock } from "lucide-react";
import { useRef } from "react";

const items = [
  { icon: Wifi, title: "Wi-Fi Ultra Rápido", desc: "Conexão fibra dedicada para videocalls sem travamento" },
  { icon: Wind, title: "Ar Condicionado", desc: "Climatização individual em todas as salas" },
  { icon: Coffee, title: "Café & Água", desc: "Café premium e água filtrada à vontade" },
  { icon: Shield, title: "Segurança 24h", desc: "Portaria, câmeras e acesso controlado" },
  { icon: MapPin, title: "Localização Prime", desc: "Moema, uma das regiões mais valorizadas de SP" },
  { icon: Clock, title: "Flexibilidade Total", desc: "Use por hora, dia ou mês. Sem burocracia" },
];

const DifferentialsSection = () => {
  const ref = useRef(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start end", "end start"] });
  const bgY = useTransform(scrollYProgress, [0, 1], [60, -60]);

  return (
    <section ref={ref} id="diferenciais" className="py-20 relative overflow-hidden">
      <motion.div
        style={{ y: bgY }}
        className="absolute top-0 right-0 w-[600px] h-[400px] rounded-full bg-primary/3 blur-[180px] pointer-events-none"
      />

      <div className="container mx-auto px-4 relative z-10">
        <motion.h2
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="font-serif text-3xl md:text-5xl font-bold text-center mb-12"
        >
          Tudo o que Você <span className="text-gradient-gold">Precisa</span>
        </motion.h2>

        <div className="grid grid-cols-2 md:grid-cols-3 gap-4 md:gap-6" style={{ perspective: "1000px" }}>
          {items.map((item, i) => (
            <motion.div
              key={item.title}
              initial={{ opacity: 0, y: 30, rotateX: 10 }}
              whileInView={{ opacity: 1, y: 0, rotateX: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: i * 0.08, type: "spring", damping: 20 }}
              whileHover={{ y: -6, scale: 1.03, rotateY: 2 }}
              className="glass-card glass-card-hover rounded-2xl p-6 text-center transition-all duration-500"
              style={{ transformStyle: "preserve-3d" }}
            >
              <motion.div
                whileHover={{ rotate: 10, scale: 1.15 }}
                transition={{ type: "spring", stiffness: 300 }}
              >
                <item.icon className="w-8 h-8 text-primary mx-auto mb-3" />
              </motion.div>
              <h3 className="font-semibold text-foreground text-sm mb-1">{item.title}</h3>
              <p className="text-muted-foreground text-xs leading-relaxed">{item.desc}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default DifferentialsSection;
