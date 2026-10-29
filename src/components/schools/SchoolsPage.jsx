import { useState } from 'react';
import {
  MapPin,
  Search,
  Phone,
  Globe,
  Navigation,
  Star,
  Loader2,
  LocateFixed,
  Info,
} from 'lucide-react';
import { api } from '../../services/api';

const directionsUrl = (school) =>
  school.lat != null && school.lng != null
    ? `https://www.google.com/maps/dir/?api=1&destination=${school.lat},${school.lng}`
    : school.mapsUrl;

const ATTRIBUTION = {
  google: 'Results from Google Maps',
  osm: 'Results from OpenStreetMap contributors',
};

export default function SchoolsPage({ onBack }) {
  const [schools, setSchools] = useState(null);
  const [provider, setProvider] = useState(null);
  const [place, setPlace] = useState('');
  const [loading, setLoading] = useState(false);
  const [locating, setLocating] = useState(false);
  const [error, setError] = useState('');
  const [searchedLabel, setSearchedLabel] = useState('');

  const runSearch = async (params, label) => {
    setLoading(true);
    setError('');
    try {
      const res = await api.findSchools(params);
      setSchools(res.schools);
      setProvider(res.provider);
      setSearchedLabel(label);
    } catch (err) {
      setError(err.message);
      setSchools(null);
    } finally {
      setLoading(false);
    }
  };

  const useMyLocation = () => {
    if (!('geolocation' in navigator)) {
      setError("This browser can't share your location. Type a town or city instead.");
      return;
    }

    setLocating(true);
    setError('');

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setLocating(false);
        runSearch(
          { lat: pos.coords.latitude, lng: pos.coords.longitude },
          'near you'
        );
      },
      (geoError) => {
        setLocating(false);
        setError(
          geoError.code === geoError.PERMISSION_DENIED
            ? "You didn't allow location access. Type a town or city instead."
            : "Couldn't work out where you are. Type a town or city instead."
        );
      },
      { enableHighAccuracy: false, timeout: 10000, maximumAge: 5 * 60 * 1000 }
    );
  };

  const searchByPlace = (e) => {
    e.preventDefault();
    const q = place.trim();
    if (!q) {
      setError('Type a town or city to search.');
      return;
    }
    runSearch({ q }, `in ${q}`);
  };

  const busy = loading || locating;

  return (
    <div className="mx-auto max-w-4xl px-4 py-8">
      <div className="mb-8 flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Find a driving school</h1>
          <p className="mt-1 text-gray-500">
            Driving schools near you, wherever you are in the world.
          </p>
        </div>
        <button
          onClick={onBack}
          className="rounded-lg border border-gray-300 px-4 py-2 font-medium text-gray-700 transition hover:bg-gray-50 cursor-pointer"
        >
          ← Back to Dashboard
        </button>
      </div>

      {/* Search controls */}
      <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
        <button
          onClick={useMyLocation}
          disabled={busy}
          className="flex w-full items-center justify-center gap-2 rounded-xl bg-blue-600 py-3 font-semibold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50 cursor-pointer"
        >
          {locating ? (
            <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
          ) : (
            <LocateFixed className="h-4 w-4" aria-hidden="true" />
          )}
          {locating ? 'Finding you…' : 'Use my location'}
        </button>

        <div className="relative my-4">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-gray-200" />
          </div>
          <div className="relative flex justify-center text-sm">
            <span className="bg-white px-2 text-gray-500">or</span>
          </div>
        </div>

        <form onSubmit={searchByPlace} className="flex gap-2">
          <div className="relative flex-1">
            <MapPin
              className="pointer-events-none absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400"
              aria-hidden="true"
            />
            <input
              type="text"
              value={place}
              onChange={(e) => setPlace(e.target.value)}
              placeholder="Town, city or postcode"
              aria-label="Town, city or postcode"
              className="w-full rounded-lg border border-gray-300 py-2.5 pl-10 pr-4 focus:border-transparent focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <button
            type="submit"
            disabled={busy}
            className="flex items-center gap-2 rounded-lg border border-gray-300 px-4 py-2.5 font-medium text-gray-700 transition hover:bg-gray-50 disabled:opacity-50 cursor-pointer"
          >
            {loading && !locating ? (
              <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
            ) : (
              <Search className="h-4 w-4" aria-hidden="true" />
            )}
            Search
          </button>
        </form>

        <p className="mt-3 text-xs leading-relaxed text-gray-500">
          We only use your location to run this search — it isn't stored.
        </p>
      </div>

      {error && (
        <div className="mt-6 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800">
          {error}
        </div>
      )}

      {/* Results */}
      {schools && !error && (
        <div className="mt-8">
          <div className="mb-4 flex flex-wrap items-baseline justify-between gap-2">
            <h2 className="text-lg font-semibold text-gray-900">
              {schools.length === 0
                ? `No driving schools found ${searchedLabel}`
                : `${schools.length} driving school${schools.length === 1 ? '' : 's'} ${searchedLabel}`}
            </h2>
            {provider && <p className="text-xs text-gray-500">{ATTRIBUTION[provider]}</p>}
          </div>

          {schools.length === 0 ? (
            <div className="rounded-2xl border border-gray-200 bg-white p-10 text-center">
              <p className="text-gray-600">
                We couldn't find any listed nearby. Try a larger town, or a different spelling.
              </p>
            </div>
          ) : (
            <ul className="space-y-3">
              {schools.map((school) => (
                <li
                  key={school.id}
                  className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm transition hover:border-gray-300"
                >
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div className="min-w-0 flex-1">
                      <h3 className="font-semibold text-gray-900">{school.name}</h3>
                      {school.address && (
                        <p className="mt-0.5 text-sm text-gray-600">{school.address}</p>
                      )}

                      <div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-gray-500">
                        {school.distanceKm != null && (
                          <span className="font-medium text-gray-700">
                            {school.distanceKm} km away
                          </span>
                        )}
                        {school.rating != null && (
                          <span className="flex items-center gap-1">
                            <Star
                              className="h-4 w-4 fill-amber-400 text-amber-400"
                              aria-hidden="true"
                            />
                            {school.rating}
                            {school.ratingCount != null && (
                              <span className="text-gray-400">({school.ratingCount})</span>
                            )}
                          </span>
                        )}
                        {school.temporarilyClosed && (
                          <span className="rounded bg-amber-100 px-2 py-0.5 text-xs font-medium text-amber-800">
                            Temporarily closed
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="mt-4 flex flex-wrap gap-2">
                    {school.phone ? (
                      <a
                        href={`tel:${school.phone.replace(/\s/g, '')}`}
                        className="flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-blue-700"
                      >
                        <Phone className="h-4 w-4" aria-hidden="true" />
                        {school.phone}
                      </a>
                    ) : (
                      <span className="rounded-lg border border-dashed border-gray-300 px-4 py-2 text-sm text-gray-400">
                        No phone listed
                      </span>
                    )}

                    {school.website && (
                      <a
                        href={school.website}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-2 rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 transition hover:bg-gray-50"
                      >
                        <Globe className="h-4 w-4" aria-hidden="true" />
                        Website
                      </a>
                    )}

                    {directionsUrl(school) && (
                      <a
                        href={directionsUrl(school)}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-2 rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 transition hover:bg-gray-50"
                      >
                        <Navigation className="h-4 w-4" aria-hidden="true" />
                        Directions
                      </a>
                    )}
                  </div>
                </li>
              ))}
            </ul>
          )}

          {/* Be explicit about what DriveDoc is and isn't doing here. */}
          <div className="mt-6 flex gap-3 rounded-lg border border-gray-200 bg-gray-50 p-4">
            <Info className="mt-0.5 h-4 w-4 shrink-0 text-gray-400" aria-hidden="true" />
            <p className="text-sm leading-relaxed text-gray-600">
              These schools are independent businesses listed on public map data — contact them
              directly to arrange a lesson. DriveDoc doesn't book, vet or take payment for
              lessons, and isn't affiliated with any of them. Check that a school is properly
              licensed in your country before you pay anything.
            </p>
          </div>
        </div>
      )}

      {!schools && !error && !busy && (
        <div className="mt-8 rounded-2xl border border-dashed border-gray-300 p-10 text-center">
          <MapPin className="mx-auto mb-3 h-8 w-8 text-gray-300" aria-hidden="true" />
          <p className="text-gray-600">
            Share your location or type a place to find driving schools nearby.
          </p>
        </div>
      )}
    </div>
  );
}
