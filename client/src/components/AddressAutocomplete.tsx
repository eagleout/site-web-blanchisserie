import { useState, useRef, useEffect, useCallback } from "react";
import { Input } from "@/components/ui/input";
import { MapPin, Loader2, Search } from "lucide-react";

const API_KEY = import.meta.env.VITE_FRONTEND_FORGE_API_KEY;
const FORGE_BASE_URL =
  import.meta.env.VITE_FRONTEND_FORGE_API_URL ||
  "https://forge.butterfly-effect.dev";
const MAPS_PROXY_URL = `${FORGE_BASE_URL}/v1/maps/proxy`;

interface AddressResult {
  street: string;
  postalCode: string;
  city: string;
  fullAddress: string;
}

interface AddressAutocompleteProps {
  value: string;
  onChange: (value: string) => void;
  onAddressSelect: (address: AddressResult) => void;
  placeholder?: string;
  className?: string;
}

let googleMapsLoaded = false;
let googleMapsLoading = false;
let loadCallbacks: (() => void)[] = [];

function loadGoogleMaps(): Promise<void> {
  return new Promise((resolve) => {
    if (googleMapsLoaded && window.google?.maps) {
      resolve();
      return;
    }
    if (googleMapsLoading) {
      loadCallbacks.push(resolve);
      return;
    }
    googleMapsLoading = true;
    const script = document.createElement("script");
    script.src = `${MAPS_PROXY_URL}/maps/api/js?key=${API_KEY}&v=weekly&libraries=places`;
    script.async = true;
    script.crossOrigin = "anonymous";
    script.onload = () => {
      googleMapsLoaded = true;
      googleMapsLoading = false;
      resolve();
      loadCallbacks.forEach((cb) => cb());
      loadCallbacks = [];
    };
    script.onerror = () => {
      googleMapsLoading = false;
      console.error("Failed to load Google Maps script");
    };
    document.head.appendChild(script);
  });
}

interface Prediction {
  description: string;
  place_id: string;
  structured_formatting?: {
    main_text: string;
    secondary_text: string;
  };
}

export default function AddressAutocomplete({
  value,
  onChange,
  onAddressSelect,
  placeholder = "Recherchez votre adresse...",
  className,
}: AddressAutocompleteProps) {
  const [predictions, setPredictions] = useState<Prediction[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isFocused, setIsFocused] = useState(false);
  const autocompleteService = useRef<google.maps.places.AutocompleteService | null>(null);
  const placesService = useRef<google.maps.places.PlacesService | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const debounceTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    loadGoogleMaps().then(() => {
      if (window.google?.maps?.places) {
        autocompleteService.current = new google.maps.places.AutocompleteService();
        // PlacesService needs a DOM element or map
        const dummyDiv = document.createElement("div");
        placesService.current = new google.maps.places.PlacesService(dummyDiv);
      }
    });
  }, []);

  // Close dropdown on outside click
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const fetchPredictions = useCallback((input: string) => {
    if (!autocompleteService.current || input.length < 3) {
      setPredictions([]);
      setIsOpen(false);
      return;
    }

    setIsLoading(true);
    autocompleteService.current.getPlacePredictions(
      {
        input,
        componentRestrictions: { country: "fr" },
        types: ["address"],
      },
      (results, status) => {
        setIsLoading(false);
        if (status === google.maps.places.PlacesServiceStatus.OK && results) {
          setPredictions(results.slice(0, 5));
          setIsOpen(true);
        } else {
          setPredictions([]);
          setIsOpen(false);
        }
      }
    );
  }, []);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    onChange(val);

    if (debounceTimer.current) clearTimeout(debounceTimer.current);
    debounceTimer.current = setTimeout(() => {
      fetchPredictions(val);
    }, 300);
  };

  const handleSelectPrediction = (prediction: Prediction) => {
    if (!placesService.current) return;

    setIsLoading(true);
    placesService.current.getDetails(
      {
        placeId: prediction.place_id,
        fields: ["address_components", "formatted_address", "geometry"],
      },
      (place, status) => {
        setIsLoading(false);
        if (status === google.maps.places.PlacesServiceStatus.OK && place) {
          let streetNumber = "";
          let route = "";
          let postalCode = "";
          let city = "";

          (place.address_components || []).forEach((component) => {
            const types = component.types;
            if (types.includes("street_number")) {
              streetNumber = component.long_name;
            }
            if (types.includes("route")) {
              route = component.long_name;
            }
            if (types.includes("postal_code")) {
              postalCode = component.long_name;
            }
            if (types.includes("locality")) {
              city = component.long_name;
            }
          });

          const street = streetNumber ? `${streetNumber} ${route}` : route;
          const fullAddress = place.formatted_address || prediction.description;

          onChange(street || fullAddress);
          onAddressSelect({
            street: street || fullAddress,
            postalCode,
            city: city || "Paris",
            fullAddress,
          });
        }
        setIsOpen(false);
        setPredictions([]);
      }
    );
  };

  return (
    <div ref={containerRef} className="relative">
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
        <Input
          ref={inputRef}
          value={value}
          onChange={handleInputChange}
          onFocus={() => {
            setIsFocused(true);
            if (predictions.length > 0) setIsOpen(true);
          }}
          onBlur={() => setIsFocused(false)}
          placeholder={placeholder}
          className={`pl-10 pr-10 ${className || ""}`}
          autoComplete="off"
        />
        {isLoading && (
          <Loader2 className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground animate-spin" />
        )}
      </div>

      {isOpen && predictions.length > 0 && (
        <div className="absolute z-50 w-full mt-1 bg-white rounded-xl border border-border/50 shadow-lg overflow-hidden">
          {predictions.map((prediction, index) => (
            <button
              key={prediction.place_id}
              type="button"
              className={`w-full text-left px-4 py-3 flex items-start gap-3 hover:bg-primary/5 transition-colors ${
                index < predictions.length - 1 ? "border-b border-border/30" : ""
              }`}
              onMouseDown={(e) => {
                e.preventDefault(); // Prevent input blur
                handleSelectPrediction(prediction);
              }}
            >
              <MapPin className="w-4 h-4 text-primary mt-0.5 shrink-0" />
              <div className="min-w-0">
                <p className="text-sm font-medium text-foreground truncate">
                  {prediction.structured_formatting?.main_text || prediction.description}
                </p>
                {prediction.structured_formatting?.secondary_text && (
                  <p className="text-xs text-muted-foreground truncate">
                    {prediction.structured_formatting.secondary_text}
                  </p>
                )}
              </div>
            </button>
          ))}
          <div className="px-4 py-2 bg-muted/30 flex items-center justify-end">
            <span className="text-[10px] text-muted-foreground">Powered by Google</span>
          </div>
        </div>
      )}
    </div>
  );
}
