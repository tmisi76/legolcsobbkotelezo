import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

const JogiNyilatkozat = () => {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="container mx-auto px-4 py-24 md:py-32">
        <div className="max-w-3xl mx-auto">
          <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-8">
            Jogi Nyilatkozat
          </h1>
          
          <div className="prose prose-lg max-w-none text-muted-foreground space-y-6">
            <section>
              <h2 className="text-xl font-semibold text-foreground mt-8 mb-4">1. Általános tudnivalók</h2>
              <p>
                A LegolcsóbbKötelező.hu weboldal üzemeltetője független biztosítási alkusz, 
                nem biztosítótársaság. A weboldalon található információk tájékoztató 
                jellegűek, nem minősülnek biztosítási ajánlattételnek.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-foreground mt-8 mb-4">2. Szolgáltatás jellege</h2>
              <p>
                Szolgáltatásunk célja, hogy emlékeztetőket küldjünk a kötelező gépjármű-felelősségbiztosítás 
                évfordulója előtt, segítve ezzel ügyfeleinket a tudatos biztosításváltásban. 
                Az emlékeztető szolgáltatás ingyenes.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-foreground mt-8 mb-4">3. Felelősség korlátozása</h2>
              <p>
                A weboldalon megjelenő információk pontosságáért mindent megteszünk, 
                azonban a biztosítási díjak és feltételek a biztosítók ajánlataitól függnek, 
                amelyek folyamatosan változhatnak. A végső biztosítási döntés és szerződéskötés 
                a felhasználó felelőssége.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-foreground mt-8 mb-4">4. Szellemi tulajdon</h2>
              <p>
                A weboldal tartalma, beleértve a szövegeket, grafikákat, logókat és egyéb 
                anyagokat, szerzői jogi védelem alatt áll. Ezek másolása, terjesztése vagy 
                felhasználása csak előzetes írásbeli engedéllyel lehetséges.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-foreground mt-8 mb-4">5. Külső hivatkozások</h2>
              <p>
                A weboldalon található külső hivatkozásokért nem vállalunk felelősséget. 
                Ezek tartalmát nem ellenőrizzük, és azok az adott oldal üzemeltetőjének 
                felelősségi körébe tartoznak.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-foreground mt-8 mb-4">6. Alkalmazandó jog</h2>
              <p>
                A weboldal használatára és a jelen nyilatkozatra a magyar jog az irányadó. 
                Esetleges jogviták esetén a magyar bíróságok illetékesek.
              </p>
            </section>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default JogiNyilatkozat;
