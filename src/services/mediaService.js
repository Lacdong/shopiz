import api from "./api";

export const mediaService = {
  async uploadMedia(file) {
    const formData = new FormData();
    formData.append("file", file);

    const data = await api.post("/simulator/media/upload", formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });
    return data; // { url, file_id, provider }
  },
};

export default mediaService;
