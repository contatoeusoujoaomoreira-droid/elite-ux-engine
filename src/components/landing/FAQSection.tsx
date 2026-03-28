import { motion } from "framer-motion";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";

const faqs = [
  { q: "Preciso assinar contrato longo?", a: "Não! Oferecemos planos por hora, diária e mensal. Sem fidelidade, sem burocracia." },
  { q: "Posso usar o endereço comercial?", a: "Sim! Nos planos Diária e Mensal você pode utilizar o endereço da Ellite como sede da sua empresa." },
  { q: "A sala é privativa?", a: "Sim, todas as nossas salas são privativas, com porta, chave e total privacidade para suas reuniões e atendimentos." },
  { q: "Tem estacionamento?", a: "O prédio conta com estacionamento rotativo. Também estamos próximos do metrô Moema." },
  { q: "Posso levar clientes?", a: "Claro! O ambiente foi projetado para impressionar seus clientes com sofisticação e profissionalismo." },
  { q: "Como funciona o café e água?", a: "Café premium em cápsulas e água filtrada disponíveis em todas as salas, sem custo adicional." },
];

const FAQSection = () => {
  return (
    <section className="py-20">
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
