import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, ChevronLeft, ChevronRight, Maximize2 } from "lucide-react";
import tour1 from "@/assets/tour-1.jpg";
import tour2 from "@/assets/tour-2.jpg";
import tour3 from "@/assets/tour-3.jpg";
import tour4 from "@/assets/tour-4.jpg";
import tour5 from "@/assets/tour-5.jpg";
import tour6 from "@/assets/tour-6.jpg";

const images = [
  { src: tour1, label: "Recepção Premium" },
  { src: tour2, label: "Sala Executiva" },
  { src: tour3, label: "Estação de Trabalho" },
  { src: tour4, label: "Sala de Reunião" },
  { src: tour5, label: "Área Comum" },
  { src: tour6, label: "Ambiente Lounge" },
];

const GallerySection = () => {
  const [selected, setSelected] = useState<number | null>(null);
  const [hovered, setHovered] = useState<number | null>(null);

  const navigate = (dir: number) => {
    if (selected === null) return;
    setSelected((selected + dir + images.length) % images.length);
  };

  return (
    <section id="galeria" className="py-20 relative overflow-hidden">
      {/* Background parallax glow */}
      <motion.div
        className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[400px] rounded-full bg-primary/5 blur-[150px] pointer-events-none"
        style={{ y: -100 }}
        whileInView={{ y: 0 }}
        transition={{ duration: 1.5 }}
        viewport={{ once: true }}
      />

      <div className="container mx-auto px-4 relative z-10">
        <motion.h2
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="font-serif text-3xl md:text-5xl font-bold text-center mb-4"
        >
          Tour <span className="text-gradient-gold">Virtual</span>
        </motion.h2>
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-muted-foreground text-center max-w-xl mx-auto mb-12"
        >
          Explore cada detalhe dos espaços que vão elevar a sua imagem profissional.
        </motion.p>

        {/* Main featured image */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7 }}
          className="relative rounded-3xl overflow-hidden mb-4 cursor-pointer group aspect-[16/9] max-h-[500px]"
          onClick={() => setSelected(hovered ?? 0)}
        >
          <AnimatePresence mode="wait">
            <motion.img
              key={hovered ?? 0}
              src={images[hovered ?? 0].src}
              alt={images[hovered ?? 0].label}
              initial={{ opacity: 0, scale: 1.05 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.5 }}
              className="w-full h-full object-cover"
            />
          </AnimatePresence>
          <div className="absolute inset-0 bg-gradient-to-t from-background/80 via-transparent to-transparent" />
          <div className="absolute bottom-6 left-6 right-6 flex items-end justify-between">
            <motion.span
              key={hovered ?? 0}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="font-serif text-xl md:text-2xl font-bold text-foreground"
            >
              {images[hovered ?? 0].label}
            </motion.span>
            <div className="flex items-center gap-2 text-muted-foreground text-sm opacity-0 group-hover:opacity-100 transition-opacity">
              <Maximize2 className="w-4 h-4" /> Expandir
            </div>
          </div>
        </motion.div>

        {/* Thumbnail strip */}
        <div className="grid grid-cols-6 gap-2 md:gap-3">
          {images.map((img, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: i * 0.08 }}
              onMouseEnter={() => setHovered(i)}
              onClick={() => setSelected(i)}
              className={`relative overflow-hidden rounded-xl aspect-[4/3] cursor-pointer group/thumb transition-all duration-300 ${
                hovered === i ? "ring-2 ring-primary scale-105" : "ring-1 ring-border/30 hover:ring-primary/50"
              }`}
            >
              <img
                src={img.src}
                alt={img.label}
                className="w-full h-full object-cover transition-transform duration-700 group-hover/thumb:scale-110"
                loading="lazy"
              />
              <div className="absolute inset-0 bg-background/40 group-hover/thumb:bg-background/10 transition-colors duration-300" />
            </motion.div>
          ))}
        </div>
      </div>

      {/* Lightbox */}
      <AnimatePresence>
        {selected !== null && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-background/95 backdrop-blur-xl flex items-center justify-center p-4"
            onClick={() => setSelected(null)}
          >
            <button
              className="absolute top-6 right-6 text-muted-foreground hover:text-foreground transition z-10"
              onClick={() => setSelected(null)}
            >
              <X className="w-8 h-8" />
            </button>

            <button
              className="absolute left-4 md:left-8 top-1/2 -translate-y-1/2 w-12 h-12 rounded-full glass-card flex items-center justify-center text-foreground hover:text-primary transition z-10"
              onClick={(e) => { e.stopPropagation(); navigate(-1); }}
            >
              <ChevronLeft className="w-6 h-6" />
            </button>

            <button
              className="absolute right-4 md:right-8 top-1/2 -translate-y-1/2 w-12 h-12 rounded-full glass-card flex items-center justify-center text-foreground hover:text-primary transition z-10"
              onClick={(e) => { e.stopPropagation(); navigate(1); }}
            >
              <ChevronRight className="w-6 h-6" />
            </button>

            <motion.div
              key={selected}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              transition={{ type: "spring", damping: 25, stiffness: 300 }}
              className="max-w-5xl w-full max-h-[85vh] relative"
              onClick={(e) => e.stopPropagation()}
            >
              <img
                src={images[selected].src}
                alt={images[selected].label}
                className="w-full h-full object-contain rounded-2xl"
              />
              <div className="absolute bottom-0 left-0 right-0 p-6 bg-gradient-to-t from-background/80 to-transparent rounded-b-2xl">
                <p className="font-serif text-xl font-bold text-foreground">{images[selected].label}</p>
                <p className="text-muted-foreground text-sm">{selected + 1} / {images.length}</p>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
};

export default GallerySection;
