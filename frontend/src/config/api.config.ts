"use server";
import { tokenInterceptor } from "@/services/auth/api.service";
import axios from "axios";
import { cookies } from "next/headers";
import { env } from "./env.config";

// Debug environment variables
console.log("API Config Debug:", {
  API_URL: env.APP.API_URL,
  API_KEY: env.APP.API_KEY ? "***SET***" : "***NOT SET***"
});

export const satellite = axios.create({
  baseURL: env.APP.API_URL,
  headers: {
    APIKey: env.APP.API_KEY,
  },
});

satellite.interceptors.request.use(
  async function (request) {
    try {
      console.log("API Request:", {
        method: request.method?.toUpperCase(),
        baseURL: request.baseURL,
        url: request.url,
        fullURL: `${request.baseURL}${request.url}`
      });

      const cookieStore = await cookies();
      const token = cookieStore.get("token")?.value;

      if (token) {
        request.headers.Authorization = `Bearer ${token || ""}`;
      }
    } catch (error) {
      console.error("Request interceptor error:", error);
      return Promise.reject(error);
    }

    return request;
  },
  function (error) {
    return Promise.reject(error);
  }
);

satellite.interceptors.response.use(
  function (response) {
    return response;
  },
  async function (error) {
    console.log("error in main", error.response);
    return tokenInterceptor(error);
  }
);
