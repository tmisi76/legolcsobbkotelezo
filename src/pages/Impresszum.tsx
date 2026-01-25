import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

const Impresszum = () => {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="container mx-auto px-4 py-24 md:py-32">
        <div className="max-w-3xl mx-auto">
          <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-8">
            Impresszum
          </h1>
          
          <div className="prose prose-lg max-w-none text-muted-foreground space-y-6">
            <section>
              <h2 className="text-xl font-semibold text-foreground mt-8 mb-4">Szolgáltató adatai</h2>
              <div className="space-y-2">
                <p><strong>Cégnév:</strong> [Cégnév hamarosan]</p>
                <p><strong>Székhely:</strong> [Cím hamarosan]</p>
                <p><strong>Cégjegyzékszám:</strong> [Hamarosan]</p>
                <p><strong>Adószám:</strong> [Hamarosan]</p>
              </div>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-foreground mt-8 mb-4">Kapcsolattartó</h2>
              <div className="space-y-2">
                <p><strong>Név:</strong> [Hamarosan]</p>
                <p><strong>E-mail:</strong> info@legolcsobbkotelezo.hu</p>
                <p><strong>Telefon:</strong> [Hamarosan]</p>
              </div>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-foreground mt-8 mb-4">Tevékenység</h2>
              <p>
                Független biztosítási alkusz. A szolgáltató nem biztosítótársaság, 
                hanem biztosítási közvetítői tevékenységet végez.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-foreground mt-8 mb-4">Felügyeleti szerv</h2>
              <p>
                Magyar Nemzeti Bank (MNB)<br />
                1013 Budapest, Krisztina krt. 55.<br />
                Telefon: +36 80 203 776<br />
                E-mail: ugyfelszolgalat@mnb.hu
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-foreground mt-8 mb-4">Tárhelyszolgáltató</h2>
              <p>
                [Tárhelyszolgáltató adatai hamarosan]
              </p>
            </section>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default Impresszum;
