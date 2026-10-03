import axios from "axios";

let databasePromise;
let warnedAboutFallback = false;

function loadDatabase() {
  if (!databasePromise) {
    databasePromise = fetch(`${import.meta.env.BASE_URL}db.json`)
      .then((response) => {
        if (!response.ok) throw new Error(`Could not load public/db.json (${response.status})`);
        return response.json();
      })
      .catch((error) => {
        databasePromise = undefined;
        throw error;
      });
  }

  return databasePromise;
}

function readFallback(database, config) {
  const url = new URL(config.url, config.baseURL || window.location.origin);
  if (!["localhost", "127.0.0.1"].includes(url.hostname) || url.port !== "3000") return null;

  Object.entries(config.params || {}).forEach(([key, value]) => {
    if (value !== undefined && value !== null) url.searchParams.set(key, String(value));
  });

  const [resource, id] = url.pathname.split("/").filter(Boolean).map(decodeURIComponent);
  const records = database[resource];
  if (!Array.isArray(records)) return null;

  let data;
  if (id !== undefined) {
    data = records.find((record) => String(record.id) === id);
    if (!data) {
      const error = new Error(`Record ${id} was not found in public/db.json`);
      error.config = config;
      error.response = { status: 404, data: { message: error.message }, config, headers: {} };
      throw error;
    }
  } else {
    const query = [...url.searchParams.entries()];
    data = records.filter((record) =>
      query.every(([key, value]) => {
        if (key.startsWith("_") || key === "q") return true;
        const recordValue = record[key];
        return Array.isArray(recordValue)
          ? recordValue.some((item) => String(item) === value)
          : String(recordValue ?? "") === value;
      }),
    );

    const search = url.searchParams.get("q");
    if (search) {
      const term = search.toLowerCase();
      data = data.filter((record) => JSON.stringify(record).toLowerCase().includes(term));
    }

    const sortBy = url.searchParams.get("_sort");
    if (sortBy) {
      const direction = url.searchParams.get("_order") === "desc" ? -1 : 1;
      data = [...data].sort((a, b) => (a[sortBy] > b[sortBy] ? direction : a[sortBy] < b[sortBy] ? -direction : 0));
    }

    const start = Number(url.searchParams.get("_start") || 0);
    const endParam = url.searchParams.get("_end");
    const limitParam = url.searchParams.get("_limit");
    const page = Number(url.searchParams.get("_page") || 1);
    const startIndex = url.searchParams.has("_page") && limitParam ? (page - 1) * Number(limitParam) : start;
    const endIndex = endParam ? Number(endParam) : limitParam ? startIndex + Number(limitParam) : undefined;
    data = data.slice(startIndex, endIndex);
  }

  return {
    data,
    status: 200,
    statusText: "OK (public/db.json fallback)",
    headers: {},
    config,
    request: null,
  };
}

axios.interceptors.response.use(
  (response) => response,
  async (error) => {
    const config = error.config;
    if (config?.method?.toLowerCase() !== "get" || error.response) throw error;

    const database = await loadDatabase();
    const response = readFallback(database, config);
    if (!response) throw error;

    if (!warnedAboutFallback) {
      console.warn("json-server is unavailable; using read-only data from public/db.json. Changes will not be saved.");
      warnedAboutFallback = true;
    }
    return response;
  },
);
