import { useEffect, useState } from "react";

interface Flag {
  id: number;
  x: number;
  color: string;
  delay: number;
}

const PrayerFlags = () => {
  const [flags, setFlags] = useState<Flag[]>([]);

  useEffect(() => {
    // Traditional Nepali prayer flag colors in order
    const flagColors = [
      "#3B82F6", // Blue - sky/space
      "#FFFFFF", // White - air/wind
      "#EF4444", // Red - fire
      "#10B981", // Green - water
      "#FDE047", // Yellow - earth
    ];

    // Generate flags across the top of the screen
    const generatedFlags: Flag[] = Array.from({ length: 25 }, (_, i) => ({
      id: i,
      x: (i * 100) / 24, // Evenly distributed
      color: flagColors[i % flagColors.length],
      delay: i * 0.1,
    }));

    setFlags(generatedFlags);
  }, []);

  return (
    <div className="fixed top-0 left-0 right-0 h-32 pointer-events-none overflow-hidden z-0">
      {/* String line */}
      <div className="absolute top-8 left-0 right-0 h-[2px] bg-primary/20" />
      
      {/* Flags */}
      {flags.map((flag) => (
        <div
          key={flag.id}
          className="absolute top-8 w-6 h-10 animate-sway"
          style={{
            left: `${flag.x}%`,
            animationDelay: `${flag.delay}s`,
          }}
        >
          {/* Flag triangle */}
          <div
            className="w-0 h-0 border-l-[12px] border-l-transparent border-r-[12px] border-r-transparent border-t-[40px] opacity-30"
            style={{
              borderTopColor: flag.color,
              filter: "blur(0.5px)",
            }}
          />
        </div>
      ))}
    </div>
  );
};

export default PrayerFlags;
