import { usePageBySlug } from "@/hooks/usePages";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

const Adatvedelem = () => {
  const { data: page, isLoading } = usePageBySlug("adatvedelem");

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="container mx-auto px-4 py-24 md:py-32">
        <div className="max-w-3xl mx-auto">
          <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-8">
            {isLoading ? "Betöltés..." : page?.title || "Adatvédelmi Tájékoztató"}
          </h1>
          {isLoading ? (
            <div className="animate-pulse space-y-4">
              <div className="h-4 bg-muted rounded w-full" />
              <div className="h-4 bg-muted rounded w-3/4" />
            </div>
          ) : page ? (
            <div
              className="prose prose-lg max-w-none text-muted-foreground space-y-6 [&_h2]:text-xl [&_h2]:font-semibold [&_h2]:text-foreground [&_h2]:mt-8 [&_h2]:mb-4 [&_strong]:text-foreground [&_ul]:list-disc [&_ul]:pl-6 [&_ul]:mt-2 [&_ul]:space-y-1 [&_section]:space-y-2"
              dangerouslySetInnerHTML={{ __html: page.content }}
            />
          ) : (
            <p className="text-muted-foreground">Az oldal nem található.</p>
          )}
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default Adatvedelem;
