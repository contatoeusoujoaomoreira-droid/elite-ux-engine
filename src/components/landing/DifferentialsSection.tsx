import { motion } from "framer-motion";
import { Wifi, Wind, Coffee, Shield, MapPin, Clock } from "lucide-react";

const items = [
  { icon: Wifi, title: "Wi-Fi Ultra Rápido", desc: "Conexão fibra dedicada para videocalls sem travamento" },
  { icon: Wind, title: "Ar Condicionado", desc: "Climatização individual em todas as salas" },
  { icon: Coffee, title: "Café & Água", desc: "Café premium e água filtrada à vontade" },
  { icon: Shield, title: "Segurança 24h", desc: "Portaria, câmeras e acesso controlado" },
  { icon: MapPin, title: "Localização Prime", desc: "Moema, uma das regiões mais valorizadas de SP" },
  { icon: Clock, title: "Flexibilidade Total", desc: "Use por hora, dia ou mês. Sem burocracia" },
];

const DifferentialsSection = () => {
  return (
    <section id="diferenciais" className="py-20">
      <div className="container mx-auto px-4">
        <motion.h2
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="font-serif text-3xl md:text-5xl font-bold text-center mb-12"
        >
          Tudo o que Você <span className="text-gradient-gold">Precisa</span>
        </motion.h2>

        <div className="grid grid-cols-2 md:grid-cols-3 gap-4 md:gap-6">
          {items.map((item, i) => (
            <motion.div
              key={item.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: i * 0.08 }}
              className="glass-card glass-card-hover rounded-2xl p-6 text-center transition-all duration-500"
            >
              <item.icon className="w-8 h-8 text-primary mx-auto mb-3" />
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
