import axios from "axios";

const API_URL = "http://localhost:3000";

function slugifyOrganization(name, fallbackCode = "") {
  const slug = (name || "")
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9\u0600-\u06FF]+/g, "-")
    .replace(/^-+|-+$/g, "");

  return slug || (fallbackCode || `org-${Date.now()}`).toLowerCase().replace(/[^a-z0-9-]+/g, "-");
}

export const statuses = {
  all: { label: "الكل", style: "bg-slate-100 text-slate-700" },
  active: { label: "نشطة", style: "bg-emerald-100 text-emerald-700" },
  inactive: { label: "غير نشطة", style: "bg-slate-100 text-slate-600" },
};

export const projectStatuses = {
  active: { label: "نشط", style: "bg-emerald-100 text-emerald-700" },
  pending: { label: "قيد التنفيذ", style: "bg-amber-100 text-amber-700" },
  completed: { label: "مكتمل", style: "bg-sky-100 text-sky-700" },
  cancelled: { label: "ملغي", style: "bg-red-100 text-red-700" },
};

export const organizationsApi = {
  list() {
    return axios
      .get(`${API_URL}/organizations`)
      .then((response) => response.data)
      .catch(() => []);
  },

  get(id) {
    return axios
      .get(`${API_URL}/organizations/${id}`)
      .then((response) => response.data)
      .catch(() => null);
  },

  subMunicipalities(organizationId) {
    return axios
      .get(`${API_URL}/subMunicipalities`, { params: { organizationId: Number(organizationId) } })
      .then((response) => response.data)
      .catch(() => []);
  },

  projects(organizationId) {
    return axios
      .get(`${API_URL}/projects`, { params: { organizationId: Number(organizationId) } })
      .then((response) => response.data)
      .catch(() => []);
  },

  create(data) {
    const code = data.code || `ORG-${Date.now()}`;
    const slug = data.slug?.trim() || slugifyOrganization(data.name, code);
    const payload = { ...data, id: Date.now(), code, slug, createdAt: new Date().toISOString().slice(0, 10) };
    return axios.post(`${API_URL}/organizations`, payload).then((response) => response.data);
  },

  update(id, data) {
    const slug = data.slug?.trim() || slugifyOrganization(data.name || "", data.code || "");
    return axios.put(`${API_URL}/organizations/${id}`, { ...data, slug, id }).then((response) => response.data);
  },

  remove(id) {
    return axios.delete(`${API_URL}/organizations/${id}`).then((response) => response.data);
  },
};
