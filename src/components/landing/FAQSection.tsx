import { motion } from "framer-motion";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";

const faqs = [
  { q: "Preciso assinar contrato longo?", a: "Não! Você pode usar por hora, diária ou mensal — sem fidelidade, sem burocracia. Ideal para quem está de passagem ou começando agora." },
  { q: "A sala é privativa?", a: "Por enquanto só temos as estações de trabalho compartilhadas e a sala de reunião. É um ambiente onde profissionais dividem o espaço com tranquilidade e respeito." },
  { q: "Tem estacionamento?", a: "O prédio conta com estacionamento rotativo. Também estamos próximos do metrô Moema." },
  { q: "Posso levar clientes?", a: "Sim! Você pode reservar a sala de reunião por hora (R$ 70/pessoa) para atender clientes com privacidade." },
  { q: "Como funciona o café e água?", a: "Café e água filtrada disponíveis sem custo adicional, durante todo o seu tempo de uso." },
  { q: "Vocês são um coworking tradicional?", a: "Estamos começando! Hoje operamos um espaço enxuto, com estações compartilhadas e sala de reunião — perfeito pra quem precisa de algumas horas de produtividade em um lugar bem localizado em Moema." },
];

const FAQSection = () => {
  return (
    <section id="faq" className="py-20">
      <div className="container mx-auto px-4 max-w-2xl">
        <motion.h2
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="font-serif text-3xl md:text-5xl font-bold text-center mb-12"
        >
          Perguntas <span className="text-gradient-gold">Frequentes</span>
        </motion.h2>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
        >
          <Accordion type="single" collapsible className="space-y-3">
            {faqs.map((faq, i) => (
              <AccordionItem key={i} value={`faq-${i}`} className="glass-card rounded-xl px-6 border-none">
                <AccordionTrigger className="text-foreground text-sm font-medium hover:no-underline hover:text-primary py-4">
                  {faq.q}
                </AccordionTrigger>
                <AccordionContent className="text-muted-foreground text-sm pb-4">
                  {faq.a}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </motion.div>
      </div>
    </section>
  );
};

export default FAQSection;
