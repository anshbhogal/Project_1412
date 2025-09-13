import apiClient from "./index";

export const healthCheck = async () => {
  try {
    const res = await apiClient.get("/health");
    return res.data;
  } catch (err) {
    console.error("Health check failed:", err);
    throw err;
  }
};
