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
            <p className="text-sm italic">Hatályos: 2026. január 1-től</p>

            <section>
              <h2 className="text-xl font-semibold text-foreground mt-8 mb-4">1. Adatkezelő</h2>
              <div className="space-y-2">
                <p><strong>Cégnév:</strong> H-Kontakt Group Kft.</p>
                <p><strong>Székhely:</strong> 8900 Zalaegerszeg, Tompa Mihály u. 1-3. 1. emelet (a Göcsej Üzletházban)</p>
                <p><strong>Telefon:</strong> 06-20-441-5868</p>
                <p><strong>E-mail:</strong> info@h-kontakt.hu</p>
              </div>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-foreground mt-8 mb-4">2. Kezelt adatok köre</h2>
              <p>
                A szolgáltatás igénybevétele során az alábbi személyes adatokat kezeljük:
              </p>
              <ul className="list-disc pl-6 mt-2 space-y-1">
                <li>Teljes név</li>
                <li>E-mail cím</li>
                <li>Telefonszám (opcionális)</li>
                <li>Gépjármű adatok (márka, típus, évjárat, rendszám)</li>
                <li>Biztosítási évforduló dátuma</li>
                <li>Jelenlegi biztosítási díj (opcionális)</li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-foreground mt-8 mb-4">3. Adatkezelés célja</h2>
              <p>
                Az adatkezelés célja a kötelező gépjármű-felelősségbiztosítás évfordulója előtti 
                emlékeztetők küldése, valamint igény esetén személyre szabott biztosítási ajánlatok 
                készítése és közvetítése.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-foreground mt-8 mb-4">4. Adatkezelés jogalapja</h2>
              <p>
                Az adatkezelés az érintett önkéntes hozzájárulásán alapul a GDPR 6. cikk (1) bekezdés 
                a) pontja szerint. A hozzájárulás a regisztráció során történik, és bármikor 
                visszavonható.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-foreground mt-8 mb-4">5. Adatok tárolása és biztonsága</h2>
              <p>
                Az adatokat titkosított formában, az Európai Unió területén található szervereken 
                tároljuk. Megfelelő technikai és szervezési intézkedésekkel biztosítjuk az adatok 
                védelmét a jogosulatlan hozzáférés, módosítás vagy törlés ellen.
              </p>
              <p className="mt-2">
                Az adatokat harmadik félnek kizárólag a Te kifejezett beleegyezéseddel, vagy 
                jogszabályi kötelezettség esetén adjuk át.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-foreground mt-8 mb-4">6. Adatmegőrzési idő</h2>
              <p>
                A személyes adatokat a felhasználói fiók törléséig, vagy a hozzájárulás 
                visszavonásáig kezeljük. A fiók törlése esetén az adatok véglegesen törlésre 
                kerülnek 30 napon belül.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-foreground mt-8 mb-4">7. Érintetti jogok</h2>
              <p>
                A GDPR alapján az alábbi jogok illetnek meg:
              </p>
              <ul className="list-disc pl-6 mt-2 space-y-1">
                <li><strong>Hozzáférés joga:</strong> Tájékoztatást kérhetsz a kezelt adataidról</li>
                <li><strong>Helyesbítés joga:</strong> Kérheted pontatlan adataid javítását</li>
                <li><strong>Törlés joga:</strong> Kérheted adataid törlését („elfeledtetéshez való jog")</li>
                <li><strong>Korlátozás joga:</strong> Kérheted az adatkezelés korlátozását</li>
                <li><strong>Adathordozhatóság joga:</strong> Kérheted adataid géppel olvasható formátumban való kiadását</li>
                <li><strong>Tiltakozás joga:</strong> Tiltakozhatsz az adatkezelés ellen</li>
              </ul>
              <p className="mt-4">
                Jogaid gyakorlásához keresd ügyfélszolgálatunkat az info@h-kontakt.hu e-mail címen.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-foreground mt-8 mb-4">8. Cookie-k (sütik) használata</h2>
              <p>
                A weboldal működéséhez szükséges technikai cookie-kat használunk, valamint 
                analitikai célú sütiket a felhasználói élmény javítása érdekében. A cookie-k 
                használatáról a weboldal első látogatásakor tájékoztatást adunk.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-foreground mt-8 mb-4">9. Jogorvoslati lehetőségek</h2>
              <p>
                Amennyiben úgy érzed, hogy személyes adataid kezelése során jogaidat megsértettük, 
                panasszal fordulhatsz a Nemzeti Adatvédelmi és Információszabadság Hatósághoz (NAIH):
              </p>
              <div className="mt-2 space-y-1">
                <p><strong>Cím:</strong> 1055 Budapest, Falk Miksa utca 9-11.</p>
                <p><strong>Telefon:</strong> +36 1 391 1400</p>
                <p><strong>E-mail:</strong> ugyfelszolgalat@naih.hu</p>
                <p><strong>Weboldal:</strong> www.naih.hu</p>
              </div>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-foreground mt-8 mb-4">10. Kapcsolat</h2>
              <p>
                Adatvédelmi kérdésekkel kapcsolatban keresd ügyfélszolgálatunkat:
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

export default Adatvedelem;
