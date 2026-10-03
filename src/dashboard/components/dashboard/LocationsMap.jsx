import { useEffect, useState } from "react";
import axios from "axios";
import LocationOnIcon from "@mui/icons-material/LocationOn";
import { CircleMarker, MapContainer, Popup, TileLayer, useMap } from "react-leaflet";
import "leaflet/dist/leaflet.css";

const API_URL = "http://localhost:3000";
const DEFAULT_CENTER = [23.8859, 45.0792];
const hasCoordinates = (site) =>
  site.lat != null &&
  site.lng != null &&
  site.lat !== "" &&
  site.lng !== "" &&
  Number.isFinite(Number(site.lat)) &&
  Number.isFinite(Number(site.lng));

function FitMapToSites({ sites }) {
  const map = useMap();

  useEffect(() => {
    const points = sites
      .filter(hasCoordinates)
      .map((site) => [Number(site.lat), Number(site.lng)]);

    if (points.length === 1) {
      map.setView(points[0], 8);
    } else if (points.length > 1) {
      map.fitBounds(points, { padding: [24, 24], maxZoom: 8 });
    }
  }, [map, sites]);

  return null;
}

export default function LocationsMap() {
  const [sites, setSites] = useState([]);
  const [error, setError] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    axios
      .get(`${API_URL}/sites`)
      .then((response) => {
        setSites(Array.isArray(response.data) ? response.data : []);
      })
      .catch(() => setError(true))
      .finally(() => setLoading(false));
  }, []);

  const sitesWithCoordinates = sites.filter(hasCoordinates);

  return (
    <div className="h-full w-full rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="mb-4 flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-red-100 text-red-500">
          <LocationOnIcon />
        </div>

        <div>
          <h2 className="font-bold text-slate-800">المواقع والبوابات</h2>

          <p className="text-sm text-slate-400">توزيع المواقع</p>
        </div>
      </div>

      <div className="relative h-64 overflow-hidden rounded-lg border border-slate-200">
        <MapContainer center={DEFAULT_CENTER} zoom={5} scrollWheelZoom className="h-full w-full">
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          <FitMapToSites sites={sitesWithCoordinates} />
          {sitesWithCoordinates.map((site) => (
            <CircleMarker
              key={site.id}
              center={[Number(site.lat), Number(site.lng)]}
              radius={8}
              pathOptions={{
                color: site.active === false ? "#64748b" : "#dc2626",
                fillColor: site.active === false ? "#94a3b8" : "#ef4444",
                fillOpacity: 0.9,
                weight: 2,
              }}
            >
              <Popup>
                <div dir="rtl" className="space-y-1 text-right">
                  <p className="font-semibold">{site.nameAr || site.name || "موقع بدون اسم"}</p>
                  <p dir="ltr">{site.lat}, {site.lng}</p>
                  {site.demoCoordinates && <p className="text-amber-700">إحداثيات تجريبية</p>}
                </div>
              </Popup>
            </CircleMarker>
          ))}
        </MapContainer>
        {(loading || error || sitesWithCoordinates.length === 0) && (
          <div className="pointer-events-none absolute inset-x-0 bottom-0 bg-white/90 px-3 py-2 text-center text-xs text-slate-600">
            {loading && "جارِ تحميل المواقع..."}
            {error && <span role="alert" className="text-red-600">تعذّر تحميل بيانات المواقع.</span>}
            {!loading && !error && sitesWithCoordinates.length === 0 && "لا توجد إحداثيات للمواقع لعرضها."}
          </div>
        )}
      </div>
      <p className="mt-2 text-xs text-amber-700">الإحداثيات المعروضة تجريبية وليست مواقع فعلية.</p>
    </div>
  );
}
