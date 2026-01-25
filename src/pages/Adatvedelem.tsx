import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

const Adatvedelem = () => {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="container mx-auto px-4 py-24 md:py-32">
        <div className="max-w-3xl mx-auto">
          <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-8">
            Adatvédelmi Tájékoztató
          </h1>
          
          <div className="prose prose-lg max-w-none text-muted-foreground space-y-6">
            <section>
              <h2 className="text-xl font-semibold text-foreground mt-8 mb-4">1. Adatkezelő</h2>
              <p>
                Az adatkezelő neve és elérhetőségei hamarosan frissülnek.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-foreground mt-8 mb-4">2. Kezelt adatok köre</h2>
              <p>
                A szolgáltatás igénybevétele során az alábbi személyes adatokat kezeljük:
              </p>
              <ul className="list-disc pl-6 mt-2 space-y-1">
                <li>Név</li>
                <li>E-mail cím</li>
                <li>Telefonszám (opcionális)</li>
                <li>Gépjármű adatok (márka, típus, évjárat, rendszám)</li>
                <li>Biztosítási évforduló dátuma</li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-foreground mt-8 mb-4">3. Adatkezelés célja</h2>
              <p>
                Az adatkezelés célja a biztosítási évforduló előtti emlékeztetők küldése, 
                valamint igény esetén személyre szabott biztosítási ajánlatok készítése.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-foreground mt-8 mb-4">4. Adatkezelés jogalapja</h2>
              <p>
                Az adatkezelés az érintett hozzájárulásán alapul (GDPR 6. cikk (1) bekezdés a) pont).
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-foreground mt-8 mb-4">5. Adatok tárolása és biztonsága</h2>
              <p>
                Az adatokat titkosítva tároljuk, és harmadik félnek csak a Te kifejezett 
                beleegyezéseddel adjuk át. Bármikor kérheted adataid törlését.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-foreground mt-8 mb-4">6. Érintetti jogok</h2>
              <p>
                Jogod van a kezelt adataidhoz hozzáférni, azok helyesbítését vagy törlését kérni, 
                valamint az adatkezelés korlátozását vagy az adathordozhatóságot igényelni.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-foreground mt-8 mb-4">7. Kapcsolat</h2>
              <p>
                Adatvédelmi kérdésekkel kapcsolatban keresd ügyfélszolgálatunkat.
              </p>
            </section>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default Adatvedelem;
