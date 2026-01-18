import { useState, useEffect } from "react";
import { Lightbulb } from "lucide-react";

const tips = [
  "A kötelező biztosítást minden év november 1. és december 31. között lehet váltani a következő évre.",
  "A biztosítók díjai akár 30-40%-kal is eltérhetnek ugyanarra az autóra!",
  "A bonus-malus besorolásod követi a téged, nem az autódat - vigyázz rá!",
  "Ha 50 nappal a lejárat előtt mondod fel, az új biztosítás csak január 1-től érvényes.",
  "Az online kötés általában olcsóbb, mint az ügynökön keresztül.",
  "Fiatal vezetőként érdemes tapasztalt sofőrt is beírni üzembentartónak.",
];

export function QuickTips() {
  const [currentTip, setCurrentTip] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTip((prev) => (prev + 1) % tips.length);
    }, 8000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="bg-card rounded-xl p-5 border border-border">
      <div className="flex items-start gap-3">
        <div className="w-10 h-10 rounded-lg bg-warning/10 flex items-center justify-center flex-shrink-0">
          <Lightbulb className="w-5 h-5 text-warning" />
        </div>
        <div>
          <h4 className="font-semibold text-foreground mb-1">💡 Tudtad?</h4>
          <p className="text-sm text-muted-foreground leading-relaxed">
            {tips[currentTip]}
          </p>
        </div>
      </div>
      <div className="flex gap-1 mt-4 justify-center">
        {tips.map((_, index) => (
          <button
            key={index}
            onClick={() => setCurrentTip(index)}
            className={`w-2 h-2 rounded-full transition-colors ${
              index === currentTip ? "bg-primary" : "bg-muted"
            }`}
          />
        ))}
      </div>
    </div>
  );
}
