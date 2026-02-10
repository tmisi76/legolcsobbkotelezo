import { useParams, useLocation } from "react-router-dom";
import { usePageBySlug } from "@/hooks/usePages";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import NotFound from "./NotFound";

const DynamicPage = () => {
  const { slug: paramSlug } = useParams<{ slug: string }>();
  const location = useLocation();
  // For fixed routes like /kapcsolat, extract slug from pathname
  const slug = paramSlug || location.pathname.replace("/", "");
  const { data: page, isLoading } = usePageBySlug(slug);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <main className="container mx-auto px-4 py-24 md:py-32">
          <div className="max-w-3xl mx-auto animate-pulse space-y-4">
            <div className="h-10 bg-muted rounded w-1/2" />
            <div className="h-4 bg-muted rounded w-full" />
            <div className="h-4 bg-muted rounded w-3/4" />
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  if (!page || !page.is_published) {
    return <NotFound />;
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="container mx-auto px-4 py-24 md:py-32">
        <div className="max-w-3xl mx-auto">
          <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-8">
            {page.title}
          </h1>
          <div
            className="prose prose-lg max-w-none text-muted-foreground space-y-6 [&_h2]:text-xl [&_h2]:font-semibold [&_h2]:text-foreground [&_h2]:mt-8 [&_h2]:mb-4 [&_strong]:text-foreground [&_ul]:list-disc [&_ul]:pl-6 [&_ul]:mt-2 [&_ul]:space-y-1 [&_section]:space-y-2"
            dangerouslySetInnerHTML={{ __html: page.content }}
          />
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default DynamicPage;
