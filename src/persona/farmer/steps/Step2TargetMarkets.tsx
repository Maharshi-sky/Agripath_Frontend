import { useEffect, useRef } from 'react';
import { ArrowLeft, ArrowUpRight, Check, Search, X, MapPin, Crosshair } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { cn } from '../../../lib/cn';
import { FieldInput } from '../../../UI/FormControls';
import { STEPS } from '../../../state/steps';
import { useCountryFilter, REGIONS } from '../../../state/useCountryFilter';
import { useWizard } from '../../../state/wizardStore';

// Fix Leaflet marker icon asset paths
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
});

const COUNTRY_COORDS: Record<string, { lat: number; lon: number; zoom: number }> = {
  India: { lat: 20.5937, lon: 78.9629, zoom: 5 },
  Kenya: { lat: -0.0236, lon: 37.9062, zoom: 6 },
  Nigeria: { lat: 9.082, lon: 8.6753, zoom: 6 },
  Brazil: { lat: -14.235, lon: -51.9253, zoom: 4 },
  USA: { lat: 37.0902, lon: -95.7129, zoom: 4 },
  'United States': { lat: 37.0902, lon: -95.7129, zoom: 4 },
  Ethiopia: { lat: 9.145, lon: 40.4897, zoom: 6 },
  Ghana: { lat: 7.9465, lon: -1.0232, zoom: 6 },
  Tanzania: { lat: -6.369, lon: 34.8888, zoom: 6 },
  Vietnam: { lat: 14.0583, lon: 108.2772, zoom: 6 },
  Indonesia: { lat: -0.7893, lon: 113.9213, zoom: 5 },
  Bangladesh: { lat: 23.685, lon: 90.3563, zoom: 7 },
  Pakistan: { lat: 30.3753, lon: 69.3451, zoom: 5 },
  Uganda: { lat: 1.3733, lon: 32.2903, zoom: 7 },
};

export default function Step2TargetMarkets({ onToast }: { onToast: (message: string) => void }) {
  const navigate = useNavigate();
  const { state, toggleCountry, setFarmerCoords, nextFromStep2 } = useWizard();
  const { query, setQuery, region, setRegion, filtered } = useCountryFilter();

  const mapContainerRef = useRef<HTMLDivElement | null>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const markerRef = useRef<L.Marker | null>(null);

  const selectedCountry = state.countries?.[0] || '';
  const farmerCoords = state.farmerCoords || null;

  // Ref ensure karta hai ki click event listener hamesha latest action trigger kare
  const setFarmerCoordsRef = useRef(setFarmerCoords);
  useEffect(() => {
    setFarmerCoordsRef.current = setFarmerCoords;
  }, [setFarmerCoords]);

  // 1. Initialize Leaflet Map with Click Event
  useEffect(() => {
    if (!mapContainerRef.current || mapInstanceRef.current) return;

    const map = L.map(mapContainerRef.current, {
      center: [20.5937, 78.9629],
      zoom: 4,
      zoomControl: true,
    });

    L.tileLayer('https://mt1.google.com/vt/lyrs=y&x={x}&y={y}&z={z}', {
      maxZoom: 19,
      attribution: 'Google Satellite',
    }).addTo(map);

    // 🎯 CLICK LISTENER: Coordinates capture aur live Pin drop karega
    map.on('click', (e: L.LeafletMouseEvent) => {
      const lat = parseFloat(e.latlng.lat.toFixed(4));
      const lon = parseFloat(e.latlng.lng.toFixed(4));

      if (setFarmerCoordsRef.current) {
        setFarmerCoordsRef.current({ lat, lon });
      }

      if (markerRef.current) {
        markerRef.current.setLatLng([lat, lon]);
      } else {
        markerRef.current = L.marker([lat, lon]).addTo(map);
      }

      markerRef.current
        .bindPopup(`📍 <strong>Target Farm Field</strong><br/>Lat: ${lat}°, Lon: ${lon}°`)
        .openPopup();
    });

    mapInstanceRef.current = map;

    setTimeout(() => {
      map.invalidateSize();
    }, 250);

    return () => {
      map.remove();
      mapInstanceRef.current = null;
    };
  }, []);

  // 2. FlyTo on Country Selection
  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map || !selectedCountry) return;

    const focusCountry = async () => {
      const preset = COUNTRY_COORDS[selectedCountry];
      if (preset) {
        map.flyTo([preset.lat, preset.lon], preset.zoom, {
          duration: 1.5,
        });

        // Agar user ne specific point click nahi kiya to center default coordinates set honge
        if (setFarmerCoordsRef.current && !farmerCoords) {
          setFarmerCoordsRef.current({ lat: preset.lat, lon: preset.lon });
        }

        if (markerRef.current) {
          markerRef.current.setLatLng([preset.lat, preset.lon]);
        } else {
          markerRef.current = L.marker([preset.lat, preset.lon]).addTo(map);
        }

        markerRef.current
          .bindPopup(`📍 <strong>${selectedCountry}</strong><br/><small>Click on the map to pin farm location</small>`)
          .openPopup();
        return;
      }

      try {
        const res = await fetch(
          `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(selectedCountry)}`
        );
        const data = await res.json();
        if (data && data.length > 0) {
          const lat = parseFloat(parseFloat(data[0].lat).toFixed(4));
          const lon = parseFloat(parseFloat(data[0].lon).toFixed(4));

          map.flyTo([lat, lon], 5, { duration: 1.5 });

          if (setFarmerCoordsRef.current && !farmerCoords) {
            setFarmerCoordsRef.current({ lat, lon });
          }

          if (markerRef.current) {
            markerRef.current.setLatLng([lat, lon]);
          } else {
            markerRef.current = L.marker([lat, lon]).addTo(map);
          }

          markerRef.current
                .bindPopup(`📍 <strong>${selectedCountry}</strong><br/><small>Click on the map to pin farm location</small>`)
            .openPopup();
        }
      } catch (err) {
        console.warn('Geocoding error:', err);
      }
    };

    focusCountry();
  }, [selectedCountry]);

  // Single Country Selection via toggleCountry
  const handleSelect = (country: string) => {
    if (selectedCountry === country) {
      toggleCountry(country);
      if (setFarmerCoordsRef.current) setFarmerCoordsRef.current(null);
      if (markerRef.current) {
        markerRef.current.remove();
        markerRef.current = null;
      }
    } else {
      if (selectedCountry) {
        toggleCountry(selectedCountry);
      }
      toggleCountry(country);
    }
  };

  const handleBack = () => navigate(`/${STEPS[0].path}`);

  const handleContinue = () => {
    const result = nextFromStep2();
    if (!result.ok && result.error) {
      onToast(result.error);
      return;
    }
    navigate(`/${STEPS[2].path}`);
  };

  return (
    <div className="mx-auto max-w-350 px-14 py-10">
      <h1 className="mb-3 text-[2.25rem] font-semibold leading-tight tracking-tight text-ink">
        Where are you planning to deploy?
      </h1>
      <p className="mb-9 text-[15px] leading-relaxed text-muted"></p>

      {/* Filter and selection bar */}
      <div className="mb-6 flex flex-wrap items-center gap-4">
        <div className="relative min-w-70 flex-1">
          <Search size={16} className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-label" />
          <FieldInput
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Filter countries"
            className="pl-11"
          />
        </div>

        <div className="flex flex-wrap items-center gap-2 rounded-lg border border-line bg-[#EDF0EB] px-4 py-2.5">
          <span className="text-[11px] font-semibold uppercase tracking-widest text-label">
            {selectedCountry ? '1 Market Selected' : '0 Markets Selected'}
          </span>
          {selectedCountry && (
            <span
              className="flex items-center gap-1.5 rounded-sm bg-white px-3 py-1 text-xs font-medium text-ink"
            >
              {selectedCountry}
              <button
                type="button"
                onClick={() => {
                  toggleCountry(selectedCountry);
                  if (setFarmerCoordsRef.current) setFarmerCoordsRef.current(null);
                  if (markerRef.current) {
                    markerRef.current.remove();
                    markerRef.current = null;
                  }
                }}
                className="text-label hover:text-ink cursor-pointer"
                aria-label={`Remove ${selectedCountry}`}
              >
                <X size={12} />
              </button>
            </span>
          )}
        </div>
      </div>

      {/* Region Selector */}
      <div className="mb-6 flex flex-wrap gap-2">
        <button
          type="button"
          onClick={() => setRegion('all')}
          className={cn(
            'rounded-lg border px-4 py-1.5 text-[13px] font-medium transition cursor-pointer',
            region === 'all'
              ? 'border-ink bg-[#196239] text-white'
              : 'border-line bg-paper text-ink hover:border-brand hover:text-brand',
          )}
        >
          All Regions
        </button>
        {REGIONS.map((r) => (
          <button
            key={r}
            type="button"
            onClick={() => setRegion(r)}
            className={cn(
              'rounded-lg border px-4 py-1.5 text-[13px] font-medium transition cursor-pointer',
              region === r
                ? 'border-ink bg-ink text-white'
                : 'border-line bg-paper text-ink hover:border-brand hover:text-brand',
            )}
          >
            {r}
          </button>
        ))}
      </div>

      {/* Original Countries Card Grid */}
      <div className="mb-8 max-h-70 overflow-y-auto pr-1">
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6">
          {filtered.map((c) => {
            const active = selectedCountry === c.n;
            return (
              <button
                key={c.n}
                type="button"
                onClick={() => handleSelect(c.n)}
                className={cn(
                  'relative rounded-xl border px-4 py-3.5 text-left transition cursor-pointer',
                  active ? 'border-brand bg-brand-light' : 'border-line bg-paper hover:border-brand/60',
                )}
              >
                {active && (
                  <span className="absolute right-2.5 top-2.5 flex h-4 w-4 items-center justify-center rounded-full bg-brand text-white">
                    <Check size={11} strokeWidth={3} />
                  </span>
                )}
                <div className="mb-1 text-lg leading-none">{c.f}</div>
                <div className="text-sm font-semibold text-ink">{c.n}</div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Interactive Satellite Locator with Live Coordinates Badge */}
      <div className="mb-8 overflow-hidden rounded-2xl border border-line bg-paper shadow-md">
        <div className="flex items-center justify-between border-b border-line bg-slate-50/60 px-5 py-3">
          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-ink">
            <MapPin size={15} className="text-brand" />
            <span>Interactive Agro-Climatic Satellite Locator</span>
          </div>
          {farmerCoords ? (
            <span className="flex items-center gap-1.5 rounded-full bg-emerald-100 border border-emerald-400 px-3 py-1 text-xs font-bold text-emerald-800 shadow-xs">
              <Crosshair size={13} className="text-emerald-700 animate-spin" />
              Field Pinned: {farmerCoords.lat}°, {farmerCoords.lon}°
            </span>
          ) : (
            <span className="text-xs text-muted">
              {selectedCountry ? 'Click on the map to pin farm location' : 'Select a country to center the map'}
            </span>
          )}
        </div>
        <div
          ref={mapContainerRef}
          className="h-90 w-full cursor-crosshair"
          style={{ minHeight: '360px' }}
        />
      </div>

      {/* Footer Navigation */}
      <div className="mt-10 flex items-center justify-between border-t border-line pt-6">
        <button
          type="button"
          onClick={handleBack}
          className="flex items-center gap-2 text-sm font-medium text-ink hover:text-brand cursor-pointer"
        >
          <ArrowLeft size={16} />
          Back
        </button>
        <button
          type="button"
          onClick={handleContinue}
          disabled={!selectedCountry}
          className={cn(
            'flex items-center gap-2 rounded-sm bg-brand pl-6 pr-3 py-3 text-sm font-semibold text-white transition hover:bg-brand-dark cursor-pointer',
            !selectedCountry && 'cursor-not-allowed opacity-50',
          )}
        >
          Continue to Match Analysis
          <ArrowUpRight size={16} />
        </button>
      </div>
    </div>
  );
}