import { Card, CardContent } from "@/components/ui/card";
import { Quote } from "lucide-react";
import { useEffect, useState } from "react";

const QUOTES = [
  {
    text: "Hard work beats talent when talent doesn't work hard.",
    author: "Tim Notke"
  },
  {
    text: "It's not the will to win that matters—everyone has that. It's the will to prepare to win that matters.",
    author: "Paul 'Bear' Bryant"
  },
  {
    text: "Success isn't owned. It's leased, and rent is due every day.",
    author: "J.J. Watt"
  },
  {
    text: "The difference between the impossible and the possible lies in a person's determination.",
    author: "Tommy Lasorda"
  },
  {
    text: "The only place success comes before work is in the dictionary.",
    author: "Vince Lombardi"
  },
  {
    text: "Today I will do what others won't, so tomorrow I can accomplish what others can't.",
    author: "Jerry Rice"
  },
  {
    text: "If you're not making mistakes, then you're not doing anything.",
    author: "John Wooden"
  },
  {
    text: "Talent is God-given. Be humble. Fame is man-given. Be grateful. Conceit is self-given. Be careful.",
    author: "John Wooden"
  },
  {
    text: "Champions keep playing until they get it right.",
    author: "Billie Jean King"
  },
  {
    text: "Victory is in having done your best. If you've done your best, you've won.",
    author: "Billy Bowerman"
  }
];

type DailyQuoteProps = {
  customClasses?: string;
};

export function DailyQuote({ customClasses }: DailyQuoteProps = {}) {
  const [quote, setQuote] = useState<{text: string, author: string}>();
  
  useEffect(() => {
    // Get today's date as a string
    const today = new Date().toLocaleDateString();
    
    // Use today's date string to seed random number for consistent daily quote
    const seed = Array.from(today).reduce((acc, char) => acc + char.charCodeAt(0), 0);
    const randomIndex = seed % QUOTES.length;
    
    setQuote(QUOTES[randomIndex]);
  }, []);
  
  if (!quote) return null;
  
  // If customClasses contains "bg-" we assume it's controlling the background
  // and we'll apply it to the content directly without the Card wrapper
  const hasCustomBg = customClasses?.includes("bg-");
  
  if (hasCustomBg) {
    return (
      <div className={customClasses}>
        <div className="flex items-start gap-2">
          <Quote className="h-4 w-4 flex-shrink-0 mt-0.5" />
          <div>
            <p className="text-xs italic leading-relaxed">{quote.text}</p>
            <p className="text-xs opacity-75 mt-1">— {quote.author}</p>
          </div>
        </div>
      </div>
    );
  }
  
  // Otherwise use the default Card styling
  const cardClasses = customClasses ? "" : "bg-blue-50 border-blue-100";
  const quoteClasses = customClasses ? "" : "text-blue-500";
  const textClasses = customClasses || "";
  
  return (
    <Card className={cardClasses}>
      <CardContent className="pt-6 pb-5">
        <div className="flex items-start gap-3">
          <Quote className={`h-5 w-5 ${quoteClasses} flex-shrink-0 mt-0.5`} />
          <div className={textClasses}>
            <p className="text-sm italic leading-relaxed">{quote.text}</p>
            <p className="text-xs text-muted-foreground mt-1.5">— {quote.author}</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}