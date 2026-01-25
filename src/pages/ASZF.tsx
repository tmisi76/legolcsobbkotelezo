import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

const ASZF = () => {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="container mx-auto px-4 py-24 md:py-32">
        <div className="max-w-3xl mx-auto">
          <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-8">
            Általános Szerződési Feltételek
          </h1>
          
          <div className="prose prose-lg max-w-none text-muted-foreground space-y-6">
            <section>
              <h2 className="text-xl font-semibold text-foreground mt-8 mb-4">1. Szolgáltató adatai</h2>
              <p>
                A szolgáltató adatai hamarosan frissülnek.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-foreground mt-8 mb-4">2. A szolgáltatás leírása</h2>
              <p>
                A LegolcsóbbKötelező.hu egy ingyenes emlékeztető szolgáltatás, amely segít 
                a felhasználóknak időben értesülni a kötelező gépjármű-felelősségbiztosítás 
                évfordulójáról és a váltási lehetőségekről.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-foreground mt-8 mb-4">3. Regisztráció</h2>
              <p>
                A szolgáltatás használatához regisztráció szükséges. A regisztráció során 
                megadott adatoknak valósnak és pontosnak kell lenniük.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-foreground mt-8 mb-4">4. A szolgáltatás díja</h2>
              <p>
                Az emlékeztető szolgáltatás alapvetően ingyenes. Amennyiben személyes 
                tanácsadást vagy biztosításkötési segítséget kérsz, erről külön 
                tájékoztatást adunk.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-foreground mt-8 mb-4">5. Felelősség</h2>
              <p>
                A szolgáltató nem biztosítótársaság, hanem független biztosítási alkusz. 
                A végső biztosítási döntés és szerződéskötés a felhasználó felelőssége.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-foreground mt-8 mb-4">6. Szerződés megszüntetése</h2>
              <p>
                A felhasználó bármikor törölheti fiókját a beállítások menüpontban, 
                ezzel minden tárolt adata véglegesen törlésre kerül.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-foreground mt-8 mb-4">7. Módosítások</h2>
              <p>
                A szolgáltató fenntartja a jogot az ÁSZF módosítására. A módosításokról 
                a felhasználókat értesítjük.
              </p>
            </section>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default ASZF;
