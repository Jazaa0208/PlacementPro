import axios from "axios";

const API = axios.create({
  baseURL: "https://web-production-54456.up.railway.app/api",
  headers: {
    "Content-Type": "application/json",
  },
});

API.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("access_token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
      console.log("Sending request to:", config.url, "with token:", token.substring(0, 20) + "...");
    } else {
      console.log("No token found for request to:", config.url);
    }
    return config;
  },
  (error) => {
    console.error("Request interceptor error:", error);
    return Promise.reject(error);
  }
);

API.interceptors.response.use(
  (response) => {
    console.log("Response received from:", response.config.url, "Status:", response.status);
    return response;
  },
  (error) => {
    if (error.response) {
      console.error("API error:", error.response.status, error.response.data?.error || error.response.data || error.message);
    } else if (error.request) {
      console.error("No response received:", error.request);
    } else {
      console.error("Error setting up request:", error.message);
    }
    return Promise.reject(error);
  }
);

export const registerUser = (payload) => API.post("/auth/register", payload);
export const loginUser = (payload) => API.post("/auth/login", payload);
export const fetchMe = () => API.get("/auth/me");
export const testBackend = () => API.get("/test");
export const getCodingProblems = () => API.get("/coding/problems");
export const runCode = (payload) => API.post("/coding/run", payload);
export const submitCode = (payload) => API.post("/coding/submit", payload);
export const getRoadmap = () => API.get("/aptitude/roadmap");
export const getPracticeQuestions = (topic) => API.get(`/aptitude/topic/${topic}/practice`);
export const getVideo = (topic) => API.get(`/aptitude/topic/${topic}/video`);
export const completePractice = (topic) => API.post(`/aptitude/topic/${topic}/complete-practice`);
export const checkAnswer = (topic, payload) => API.post(`/aptitude/topic/${topic}/check-answer`, payload);
export const getTestQuestions = (topic) => API.get(`/aptitude/topic/${topic}/test`);
export const submitTest = (topic, payload) => API.post(`/aptitude/topic/${topic}/submit-test`, payload);

export default API;