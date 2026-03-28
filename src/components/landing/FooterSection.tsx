import { motion } from "framer-motion";
import { MapPin, Phone, Mail, Instagram } from "lucide-react";

const FooterSection = () => {
  return (
    <footer className="py-20 border-t border-border">
      <div className="container mx-auto px-4">
        <div className="grid md:grid-cols-2 gap-12">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <h3 className="font-serif text-2xl font-bold mb-6">
              <span className="text-gradient-gold">Ellite</span> Coworking
            </h3>
            <div className="space-y-4 text-sm text-muted-foreground">
              <a href="https://maps.google.com" target="_blank" rel="noopener noreferrer" className="flex items-center gap-3 hover:text-primary transition-colors">
                <MapPin className="w-4 h-4 text-primary flex-shrink-0" />
                Moema, São Paulo - SP
              </a>
              <a href="tel:+5511976790653" className="flex items-center gap-3 hover:text-primary transition-colors">
                <Phone className="w-4 h-4 text-primary flex-shrink-0" />
                (11) 97679-0653
              </a>
              <a href="mailto:contato@ellitecoworking.com.br" className="flex items-center gap-3 hover:text-primary transition-colors">
                <Mail className="w-4 h-4 text-primary flex-shrink-0" />
                contato@ellitecoworking.com.br
              </a>
              <a href="https://instagram.com/ellitecoworking" target="_blank" rel="noopener noreferrer" className="flex items-center gap-3 hover:text-primary transition-colors">
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
            className="rounded-2xl overflow-hidden h-64"
          >
            <iframe
              src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3654.8!2d-46.66!3d-23.6!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x0%3A0x0!2zMjPCsDM2JzAwLjAiUyA0NsKwMzknMzYuMCJX!5e0!3m2!1spt-BR!2sbr!4v1"
              width="100%"
              height="100%"
              style={{ border: 0, filter: "invert(90%) hue-rotate(180deg)" }}
              allowFullScreen
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
              title="Localização Ellite Coworking"
            />
          </motion.div>
        </div>

        <div className="mt-12 pt-8 border-t border-border text-center text-muted-foreground text-xs">
          © {new Date().getFullYear()} Ellite Coworking. Todos os direitos reservados.
        </div>
      </div>
    </footer>
  );
};

export default FooterSection;
