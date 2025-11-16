import api from "./api";

export const adminApi = {
  getStudents: async () => {
    const res = await api.get("/admin/students");
    return res.data;
  },

  getTeachers: async () => {
    const res = await api.get("/admin/teachers");
    return res.data;
  },

  assignBatch: async (id, batch) => {
    const res = await api.patch(`/admin/students/${id}/batch`, { batch });
    return res.data;
  },

  postNotice: async (title, description) => {   
    const res = await api.post("/notices/add", { title, description });
    return res.data;
  },

  getNotices: async () => {
    const res = await api.get("/notices");
    return res.data.notices || [];  
  },
};
