import axios from "axios";

const API_URL = "http://localhost:3000";

export const statuses = {
  all: { label: "الكل", style: "bg-slate-100 text-slate-700" },
  active: { label: "نشط", style: "bg-emerald-100 text-emerald-700" },
  pending: { label: "قيد التنفيذ", style: "bg-amber-100 text-amber-700" },
  completed: { label: "مكتمل", style: "bg-sky-100 text-sky-700" },
  cancelled: { label: "ملغي", style: "bg-red-100 text-red-700" },
};

export const syncStatuses = {
  synced: { label: "تم الإرسال", style: "bg-emerald-100 text-emerald-700" },
  pending: { label: "قيد الانتظار", style: "bg-amber-100 text-amber-700" },
  failed: { label: "فشل", style: "bg-red-100 text-red-700" },
};

export const projectsApi = {
  list() {
    return axios
      .get(`${API_URL}/projects`)
      .then((response) => response.data)
      .catch(() => []);
  },

  get(id) {
    return axios
      .get(`${API_URL}/projects/${id}`)
      .then((response) => response.data)
      .catch(() => null);
  },

  sites(projectId) {
    return axios
      .get(`${API_URL}/sites`, { params: { projectId: Number(projectId) } })
      .then((response) => response.data)
      .catch(() => []);
  },

  transactions(projectId) {
    return axios
      .get(`${API_URL}/transactions`, { params: { projectId: Number(projectId) } })
      .then((response) => response.data)
      .catch(() => []);
  },

  lookups() {
    return axios
      .all([axios.get(`${API_URL}/municipalities`), axios.get(`${API_URL}/contractors`)])
      .then(([municipalitiesResponse, contractorsResponse]) => ({
        municipalities: municipalitiesResponse?.data ?? [],
        contractors: contractorsResponse?.data ?? [],
      }))
      .catch(() => ({ municipalities: [], contractors: [] }));
  },

  create(data) {
    const payload = { ...data, id: Date.now(), code: data.code || `PRJ-${Date.now()}` };
    return axios.post(`${API_URL}/projects`, payload).then((response) => response.data);
  },

  update(id, data) {
    return axios.put(`${API_URL}/projects/${id}`, { ...data, id }).then((response) => response.data);
  },

  remove(id) {
    return axios.delete(`${API_URL}/projects/${id}`).then((response) => response.data);
  },
};
