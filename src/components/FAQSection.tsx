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

const FAQSection = () => {
  const { ref, isInView } = useInView({ threshold: 0.1 });

  return (
    <section className="py-16 md:py-24 bg-muted/30">
      <div className="container mx-auto px-4">
        {/* Section Title */}
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
            Gyakran Ismételt Kérdések
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Válaszok a leggyakoribb kérdésekre
          </p>
        </div>

        {/* FAQ Accordion */}
        <div
          ref={ref}
          className={`max-w-3xl mx-auto transition-all duration-700 ${
            isInView ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
          }`}
        >
          <Accordion type="single" collapsible className="space-y-4">
            {faqs.map((faq, index) => (
              <AccordionItem
                key={index}
                value={`item-${index}`}
                className="bg-card rounded-xl border-none shadow-soft px-6 data-[state=open]:shadow-card transition-all duration-200"
              >
                <AccordionTrigger className="text-left font-semibold text-foreground hover:text-primary hover:no-underline py-5">
                  {faq.question}
                </AccordionTrigger>
                <AccordionContent className="text-muted-foreground pb-5 leading-relaxed">
                  {faq.answer}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </div>
      </div>
    </section>
  );
};

export default FAQSection;
