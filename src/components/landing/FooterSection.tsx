import { motion } from "framer-motion";
import { MapPin, Phone, Mail, Instagram } from "lucide-react";

const ADDRESS = "Av. Moema, 265 - Indianópolis, São Paulo - SP, 04077-020";
const MAPS_URL = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(ADDRESS)}`;
const MAPS_EMBED = `https://www.google.com/maps?q=${encodeURIComponent(ADDRESS)}&output=embed`;

const FooterSection = () => {
  return (
    <footer className="py-16 sm:py-20 border-t border-border">
      <div className="container mx-auto px-4">
        <div className="grid md:grid-cols-2 gap-10 md:gap-12">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <h3 className="font-serif text-2xl font-bold mb-6">
              <span className="text-gradient-gold">Ellite</span> Coworking
            </h3>
            <div className="space-y-4 text-sm text-muted-foreground">
              <a
                href={MAPS_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-start gap-3 hover:text-primary transition-colors"
              >
                <MapPin className="w-4 h-4 text-primary flex-shrink-0 mt-0.5" />
                <span className="break-words">{ADDRESS}</span>
              </a>
              <a
                href="https://wa.me/5511942031169?text=Ol%C3%A1!%20Vim%20pelo%20site%20do%20Ellite%20Coworking."
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-3 hover:text-primary transition-colors"
              >
                <Phone className="w-4 h-4 text-primary flex-shrink-0" />
                (11) 94203-1169 — WhatsApp
              </a>
              <a
                href="mailto:ellitecoworking@gmail.com"
                className="flex items-center gap-3 hover:text-primary transition-colors break-all"
              >
                <Mail className="w-4 h-4 text-primary flex-shrink-0" />
                ellitecoworking@gmail.com
              </a>
              <a
                href="https://instagram.com/ellitecoworking"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-3 hover:text-primary transition-colors"
              >
                <Instagram className="w-4 h-4 text-primary flex-shrink-0" />
                @ellitecoworking
              </a>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="rounded-2xl overflow-hidden h-56 sm:h-64"
          >
            <iframe
              src={MAPS_EMBED}
              width="100%"
              height="100%"
              style={{ border: 0, filter: "invert(90%) hue-rotate(180deg)" }}
              allowFullScreen
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
              title="Localização Ellite Coworking — Av. Moema, 265"
            />
          </motion.div>
        </div>

        <div className="mt-10 pt-6 border-t border-border text-center text-muted-foreground text-xs space-y-1">
          <p>{ADDRESS}</p>
          <p>© {new Date().getFullYear()} Ellite Coworking. Todos os direitos reservados.</p>
        </div>
      </div>
    </footer>
  );
};

export default FooterSection;
