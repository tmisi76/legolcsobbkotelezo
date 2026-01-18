import { motion } from "framer-motion";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { useInView } from "@/hooks/useInView";

const faqs = [
  {
    question: "Mennyibe kerül a szolgáltatás?",
    answer:
      "Teljesen ingyenes! Nem kérünk bankkártya adatokat és nincsenek rejtett díjak. A szolgáltatás fenntartását a biztosítókkal való együttműködés teszi lehetővé.",
  },
  {
    question: "Hogyan spórolhatok a kötelezőn?",
    answer:
      "Minden év november 1. és december 31. között van lehetőség biztosítót váltani. Ilyenkor az új biztosítók kedvező ajánlatokkal csábítják az ügyfeleket. Mi 50 nappal a lejárat előtt emlékeztetünk, hogy legyen időd összehasonlítani az ajánlatokat és kiválasztani a legjobbat.",
  },
  {
    question: "Biztonságban vannak az adataim?",
    answer:
      "Igen, GDPR kompatibilis adatkezelést alkalmazunk. Az adataidat titkosítva tároljuk és harmadik félnek csak az Ön kifejezett beleegyezésével adjuk át. Bármikor kérheted adataid törlését.",
  },
  {
    question: "Mi történik ha megadom a telefonszámom?",
    answer:
      "Személyesen felhívunk a váltási időszak előtt a legjobb, személyre szabott biztosítási ajánlatokkal. Nem spam hívásokról van szó - csak egyszer keresünk évente, az emlékeztető időszakban. A telefonszám megadása teljesen opcionális.",
  },
  {
    question: "Hány autót adhatok hozzá a fiókomhoz?",
    answer:
      "Nincs korlátozás! Akár a család összes autóját hozzáadhatod egyetlen fiókhoz, és mindegyikről külön emlékeztetőt kapsz a megfelelő időpontban.",
  },
];

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.2,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { 
    opacity: 1, 
    y: 0,
    transition: { duration: 0.4, ease: [0.16, 1, 0.3, 1] }
  },
};

const FAQSection = () => {
  const { ref, isInView } = useInView({ threshold: 0.1 });

  return (
    <section className="py-16 md:py-24 bg-muted/30">
      <div className="container mx-auto px-4">
        {/* Section Title */}
        <motion.div 
          className="text-center mb-12"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
        >
          <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
            Gyakran Ismételt Kérdések
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Válaszok a leggyakoribb kérdésekre
          </p>
        </motion.div>

        {/* FAQ Accordion */}
        <motion.div
          ref={ref}
          className="max-w-3xl mx-auto"
          variants={containerVariants}
          initial="hidden"
          animate={isInView ? "visible" : "hidden"}
        >
          <Accordion type="single" collapsible className="space-y-4">
            {faqs.map((faq, index) => (
              <motion.div key={index} variants={itemVariants}>
                <AccordionItem
                  value={`item-${index}`}
                  className="bg-card rounded-xl border-none shadow-soft px-6 data-[state=open]:shadow-card transition-all duration-300"
                >
                  <AccordionTrigger className="text-left font-semibold text-foreground hover:text-primary hover:no-underline py-5 [&[data-state=open]>svg]:rotate-180 [&>svg]:transition-transform [&>svg]:duration-300">
                    {faq.question}
                  </AccordionTrigger>
                  <AccordionContent className="text-muted-foreground pb-5 leading-relaxed">
                    {faq.answer}
                  </AccordionContent>
                </AccordionItem>
              </motion.div>
            ))}
          </Accordion>
        </motion.div>
      </div>
    </section>
  );
};

export default FAQSection;
