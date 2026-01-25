import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Mail, Phone, MapPin } from "lucide-react";

const Kapcsolat = () => {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="container mx-auto px-4 py-24 md:py-32">
        <div className="max-w-3xl mx-auto">
          <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-8 text-center">
            Kapcsolat
          </h1>
          
          <p className="text-muted-foreground text-center mb-12 text-lg">
            Kérdésed van? Szívesen segítünk! Keress minket az alábbi elérhetőségeken.
          </p>

          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            <Card>
              <CardHeader className="text-center">
                <div className="mx-auto w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mb-2">
                  <Mail className="w-6 h-6 text-primary" />
                </div>
                <CardTitle className="text-lg">E-mail</CardTitle>
              </CardHeader>
              <CardContent className="text-center">
                <a 
                  href="mailto:info@legolcsobbkotelezo.hu" 
                  className="text-primary hover:underline"
                >
                  info@legolcsobbkotelezo.hu
                </a>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="text-center">
                <div className="mx-auto w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mb-2">
                  <Phone className="w-6 h-6 text-primary" />
                </div>
                <CardTitle className="text-lg">Telefon</CardTitle>
              </CardHeader>
              <CardContent className="text-center">
                <p className="text-muted-foreground">
                  Hamarosan elérhető
                </p>
              </CardContent>
            </Card>

            <Card className="md:col-span-2 lg:col-span-1">
              <CardHeader className="text-center">
                <div className="mx-auto w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mb-2">
                  <MapPin className="w-6 h-6 text-primary" />
                </div>
                <CardTitle className="text-lg">Cím</CardTitle>
              </CardHeader>
              <CardContent className="text-center">
                <p className="text-muted-foreground">
                  Hamarosan elérhető
                </p>
              </CardContent>
            </Card>
          </div>

          <div className="mt-12 p-6 bg-muted/50 rounded-lg text-center">
            <p className="text-muted-foreground">
              Munkanapokon 24 órán belül válaszolunk az e-mailekre.
            </p>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default Kapcsolat;
