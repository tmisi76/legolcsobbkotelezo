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
            <p className="text-sm italic">Hatályos: 2026. január 1-től</p>

            <section>
              <h2 className="text-xl font-semibold text-foreground mt-8 mb-4">1. Szolgáltató adatai</h2>
              <div className="space-y-2">
                <p><strong>Cégnév:</strong> H-Kontakt Group Kft.</p>
                <p><strong>Székhely:</strong> 8900 Zalaegerszeg, Tompa Mihály u. 1-3. 1. emelet (a Göcsej Üzletházban)</p>
                <p><strong>Telefon:</strong> 06-20-441-5868</p>
                <p><strong>E-mail:</strong> info@h-kontakt.hu</p>
                <p><strong>Tevékenység:</strong> Független biztosítási alkusz</p>
              </div>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-foreground mt-8 mb-4">2. A szolgáltatás leírása</h2>
              <p>
                A LegolcsóbbKötelező.hu egy ingyenes emlékeztető szolgáltatás, amely segít 
                a felhasználóknak időben értesülni a kötelező gépjármű-felelősségbiztosítás 
                évfordulójáról és a biztosításváltási lehetőségekről.
              </p>
              <p className="mt-2">
                A szolgáltatás keretében:
              </p>
              <ul className="list-disc pl-6 mt-2 space-y-1">
                <li>E-mail emlékeztetőket küldünk a biztosítás évfordulója előtt 30 és 60 nappal</li>
                <li>Igény esetén segítünk a biztosításváltásban és új ajánlatok összehasonlításában</li>
                <li>Személyes tanácsadást biztosítunk telefonon vagy e-mailben</li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-foreground mt-8 mb-4">3. Regisztráció</h2>
              <p>
                A szolgáltatás használatához regisztráció szükséges. A regisztráció során 
                megadott adatoknak valósnak és pontosnak kell lenniük. A felhasználó felelős 
                a regisztrációs adatok naprakészen tartásáért.
              </p>
              <p className="mt-2">
                A regisztrációval a felhasználó elfogadja a jelen ÁSZF-et és az Adatvédelmi 
                Tájékoztatót.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-foreground mt-8 mb-4">4. A szolgáltatás díja</h2>
              <p>
                Az emlékeztető szolgáltatás <strong>teljes mértékben ingyenes</strong>. 
                A regisztrációért, az emlékeztetők fogadásáért és a gépjárművek nyilvántartásáért 
                nem számítunk fel díjat.
              </p>
              <p className="mt-2">
                Amennyiben a felhasználó biztosítási szerződést köt az általunk közvetített 
                ajánlat alapján, a jutalékot a biztosítótársaság fizeti – ez nem terheli a 
                felhasználót többletköltséggel.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-foreground mt-8 mb-4">5. Felelősség</h2>
              <p>
                A szolgáltató <strong>nem biztosítótársaság</strong>, hanem független biztosítási 
                alkuszként működik. A végső biztosítási döntés és szerződéskötés a felhasználó 
                felelőssége.
              </p>
              <p className="mt-2">
                A szolgáltató nem vállal felelősséget:
              </p>
              <ul className="list-disc pl-6 mt-2 space-y-1">
                <li>A biztosítók díjainak és feltételeinek változásáért</li>
                <li>A felhasználó által megadott pontatlan adatokból eredő következményekért</li>
                <li>Az emlékeztetők kézbesítésének technikai akadályaiért (pl. spam szűrők)</li>
                <li>A biztosítótársaságok döntéseiért és szolgáltatásaiért</li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-foreground mt-8 mb-4">6. Szellemi tulajdon</h2>
              <p>
                A weboldal teljes tartalma, beleértve a szövegeket, grafikákat, logókat és 
                egyéb anyagokat, szerzői jogi védelem alatt áll. Ezek másolása, terjesztése 
                vagy felhasználása csak a szolgáltató előzetes írásbeli engedélyével lehetséges.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-foreground mt-8 mb-4">7. Szerződés megszüntetése</h2>
              <p>
                A felhasználó bármikor törölheti fiókját a beállítások menüpontban. A törlés 
                esetén minden tárolt személyes adat véglegesen törlésre kerül 30 napon belül.
              </p>
              <p className="mt-2">
                A szolgáltató fenntartja a jogot a felhasználói fiók felfüggesztésére vagy 
                törlésére, amennyiben a felhasználó megsérti a jelen ÁSZF rendelkezéseit.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-foreground mt-8 mb-4">8. Alkalmazandó jog</h2>
              <p>
                A jelen ÁSZF-re és a szolgáltatás használatára a magyar jog az irányadó. 
                Esetleges jogviták esetén a szolgáltató székhelye szerinti bíróság kizárólagos 
                illetékességét kötjük ki.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-foreground mt-8 mb-4">9. Módosítások</h2>
              <p>
                A szolgáltató fenntartja a jogot a jelen ÁSZF egyoldalú módosítására. A 
                módosításokról a felhasználókat e-mailben és a weboldalon értesítjük. A 
                módosítások a közzétételtől számított 15 nap elteltével lépnek hatályba.
              </p>
              <p className="mt-2">
                Amennyiben a felhasználó a módosítás hatálybalépése után folytatja a szolgáltatás 
                használatát, azzal elfogadja a módosított feltételeket.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-foreground mt-8 mb-4">10. Kapcsolat</h2>
              <p>
                Az ÁSZF-fel kapcsolatos kérdésekkel keresd ügyfélszolgálatunkat:
              </p>
              <div className="mt-2 space-y-1">
                <p><strong>E-mail:</strong> info@h-kontakt.hu</p>
                <p><strong>Telefon:</strong> 06-20-441-5868</p>
              </div>
            </section>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default ASZF;
