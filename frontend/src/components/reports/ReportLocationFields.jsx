import React, { useState } from 'react';
import { MapPin, Navigation, AlertCircle, CheckCircle2 } from 'lucide-react';

const KENYAN_COUNTIES = [
  'Baringo', 'Bomet', 'Bungoma', 'Busia', 'Elgeyo Marakwet', 'Embu',
  'Garissa', 'Homa Bay', 'Isiolo', 'Kajiado', 'Kakamega', 'Kericho',
  'Kiambu', 'Kilifi', 'Kirinyaga', 'Kisii', 'Kisumu', 'Kitui',
  'Kwale', 'Laikipia', 'Lamu', 'Machakos', 'Makueni', 'Mandera',
  'Marsabit', 'Meru', 'Migori', 'Mombasa', "Murang'a", 'Nairobi',
  'Nakuru', 'Nandi', 'Narok', 'Nyamira', 'Nyandarua', 'Nyeri',
  'Samburu', 'Siaya', 'Taita Taveta', 'Tana River', 'Tharaka Nithi',
  'Trans Nzoia', 'Turkana', 'Uasin Gishu', 'Vihiga', 'Wajir', 'West Pokot'
];

export default function ReportLocationFields({
  values,
  onChange,
  errors = {}
}) {
  const [gpsLoading, setGpsLoading] = useState(false);
  const [gpsStatus, setGpsStatus] = useState(null);

  const handleGetCurrentLocation = () => {
    if (!navigator.geolocation) {
      setGpsStatus({
        type: 'error',
        message: 'Geolocation is not supported by your browser.'
      });
      return;
    }

    setGpsLoading(true);
    setGpsStatus(null);

    navigator.geolocation.getCurrentPosition(
      (position) => {
        setGpsLoading(false);
        const lat = Number(position.coords.latitude.toFixed(6));
        const lng = Number(position.coords.longitude.toFixed(6));

        onChange('latitude', lat);
        onChange('longitude', lng);

        setGpsStatus({
          type: 'success',
          message: `Location captured: ${lat}, ${lng} (±${Math.round(position.coords.accuracy)}m)`
        });
      },
      (error) => {
        setGpsLoading(false);
        let msg = 'Unable to retrieve location.';
        if (error.code === error.PERMISSION_DENIED) {
          msg = 'Location permission was denied. You may enter coordinates manually or rely on county/ward.';
        } else if (error.code === error.POSITION_UNAVAILABLE) {
          msg = 'Location information is currently unavailable.';
        } else if (error.code === error.TIMEOUT) {
          msg = 'Location request timed out. Please try again or enter details manually.';
        }
        setGpsStatus({
          type: 'error',
          message: msg
        });
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 60000
      }
    );
  };

  return (
    <div className="space-y-4">
      {/* County (Required) */}
      <div>
        <label
          htmlFor="report-county"
          className="block text-xs font-bold text-neutral-900 mb-1"
        >
          County <span className="text-red-600">*</span>
        </label>
        <select
          id="report-county"
          name="county"
          value={values.county || ''}
          onChange={(e) => onChange('county', e.target.value)}
          className={`w-full px-3 py-2 text-xs border rounded-md bg-white focus:outline-none focus:ring-2 focus:ring-emerald-800 ${
            errors.county ? 'border-red-500' : 'border-stone-300'
          }`}
          required
        >
          <option value="">Select County</option>
          {KENYAN_COUNTIES.map((c) => (
            <option key={c} value={c}>
              {c} County
            </option>
          ))}
        </select>
        {errors.county && (
          <p className="mt-1 text-[11px] text-red-600">{errors.county}</p>
        )}
      </div>

      {/* Sub-County & Ward */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label
            htmlFor="report-sub-county"
            className="block text-xs font-semibold text-neutral-800 mb-1"
          >
            Sub-County / Constituency <span className="text-stone-400 font-normal">(Optional)</span>
          </label>
          <input
            id="report-sub-county"
            type="text"
            name="sub_county"
            value={values.sub_county || ''}
            onChange={(e) => onChange('sub_county', e.target.value)}
            placeholder="e.g. Dagoretti North"
            className="w-full px-3 py-2 text-xs border border-stone-300 rounded-md bg-white focus:outline-none focus:ring-2 focus:ring-emerald-800"
          />
        </div>

        <div>
          <label
            htmlFor="report-ward"
            className="block text-xs font-semibold text-neutral-800 mb-1"
          >
            Ward <span className="text-stone-400 font-normal">(Optional)</span>
          </label>
          <input
            id="report-ward"
            type="text"
            name="ward"
            value={values.ward || ''}
            onChange={(e) => onChange('ward', e.target.value)}
            placeholder="e.g. Kilimani"
            className="w-full px-3 py-2 text-xs border border-stone-300 rounded-md bg-white focus:outline-none focus:ring-2 focus:ring-emerald-800"
          />
        </div>
      </div>

      {/* Specific Location Description */}
      <div>
        <label
          htmlFor="report-location-text"
          className="block text-xs font-semibold text-neutral-800 mb-1"
        >
          Location Description / Landmark <span className="text-stone-400 font-normal">(Optional)</span>
        </label>
        <input
          id="report-location-text"
          type="text"
          name="location_text"
          value={values.location_text || ''}
          onChange={(e) => onChange('location_text', e.target.value)}
          placeholder="e.g. Near Kilimani Primary School along Argwings Kodhek Road"
          className="w-full px-3 py-2 text-xs border border-stone-300 rounded-md bg-white focus:outline-none focus:ring-2 focus:ring-emerald-800"
        />
        <p className="mt-1 text-[11px] text-stone-500">
          Provide landmark descriptions to help field verification teams locate the issue.
        </p>
      </div>

      {/* GPS Coordinates & Capture Button */}
      <div className="pt-2 border-t border-stone-100">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-3">
          <div>
            <span className="text-xs font-bold text-neutral-900 block">
              Precise GPS Coordinates
            </span>
            <span className="text-[11px] text-stone-500">
              Optional decimal coordinates for pinpoint accuracy.
            </span>
          </div>

          <button
            type="button"
            onClick={handleGetCurrentLocation}
            disabled={gpsLoading}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-semibold bg-stone-100 hover:bg-stone-200 text-stone-800 border border-stone-300 transition-colors disabled:opacity-50 self-start sm:self-center"
          >
            {gpsLoading ? (
              <div className="w-3.5 h-3.5 border-2 border-stone-700 border-t-transparent rounded-full animate-spin"></div>
            ) : (
              <Navigation className="w-3.5 h-3.5 text-emerald-800" />
            )}
            <span>{gpsLoading ? 'Detecting...' : 'Use My Current Location'}</span>
          </button>
        </div>

        {gpsStatus && (
          <div
            className={`p-2.5 rounded-md text-xs mb-3 flex items-start gap-2 ${
              gpsStatus.type === 'success'
                ? 'bg-emerald-50 text-emerald-900 border border-emerald-200'
                : 'bg-amber-50 text-amber-900 border border-amber-200'
            }`}
          >
            {gpsStatus.type === 'success' ? (
              <CheckCircle2 className="w-4 h-4 text-emerald-700 shrink-0 mt-0.5" />
            ) : (
              <AlertCircle className="w-4 h-4 text-amber-700 shrink-0 mt-0.5" />
            )}
            <span className="leading-relaxed">{gpsStatus.message}</span>
          </div>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label
              htmlFor="report-latitude"
              className="block text-[11px] font-medium text-stone-600 mb-1"
            >
              Latitude <span className="text-stone-400 font-normal">(-90 to 90)</span>
            </label>
            <input
              id="report-latitude"
              type="number"
              step="any"
              name="latitude"
              value={values.latitude ?? ''}
              onChange={(e) => onChange('latitude', e.target.value === '' ? '' : Number(e.target.value))}
              placeholder="e.g. -1.2921"
              className="w-full px-3 py-1.5 text-xs border border-stone-300 rounded-md bg-white focus:outline-none focus:ring-2 focus:ring-emerald-800 font-mono"
            />
          </div>

          <div>
            <label
              htmlFor="report-longitude"
              className="block text-[11px] font-medium text-stone-600 mb-1"
            >
              Longitude <span className="text-stone-400 font-normal">(-180 to 180)</span>
            </label>
            <input
              id="report-longitude"
              type="number"
              step="any"
              name="longitude"
              value={values.longitude ?? ''}
              onChange={(e) => onChange('longitude', e.target.value === '' ? '' : Number(e.target.value))}
              placeholder="e.g. 36.7854"
              className="w-full px-3 py-1.5 text-xs border border-stone-300 rounded-md bg-white focus:outline-none focus:ring-2 focus:ring-emerald-800 font-mono"
            />
          </div>
        </div>
      </div>
    </div>
  );
}
