import LocationDetector from "./LocationDetector";

const LocationBanner = () => {
  return (
    <div className="fixed top-0 left-0 right-0 z-50 bg-background/95 backdrop-blur-md border-b border-border/50 shadow-sm">
      <div className="container mx-auto px-4 py-2">
        <div className="flex items-center justify-between">
          <div className="text-xs text-muted-foreground hidden sm:block">
            📍 Your location helps us find nearby offices and services
          </div>
          <LocationDetector />
        </div>
      </div>
    </div>
  );
};

export default LocationBanner;
