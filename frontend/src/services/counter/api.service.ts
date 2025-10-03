"use server";

import { satellite } from "@/config/api.config";
import { APIBaseResponse } from "@/interfaces/api.interface";
import {
    ICounter,
    ICreateCounterRequest,
    IUpdateCounterRequest,
} from "@/interfaces/services/counter.interface";
import { errorMessage } from "@/utils/error.util";

const API_BASE_PATH = "/api/v1/counters";

export const apiGetAllCounters = async () => {
    try {
        const res = await satellite.get<APIBaseResponse<ICounter[]>>(
            `${API_BASE_PATH}`
        );
        return res.data;
    } catch (e) {
        return errorMessage<ICounter[]>(e);
    }
};

export const apiGetCounterById = async (id: number) => {
    try {
        const res = await satellite.get<APIBaseResponse<ICounter>>(
            `${API_BASE_PATH}/${id}`
        );
        return res.data;
    } catch (e) {
        return errorMessage<ICounter>(e);
    }
};

export const apiCreateCounter = async (data: ICreateCounterRequest) => {
    try {
        console.log("🏢 Creating counter...", data);
        const res = await satellite.post<APIBaseResponse<ICounter>>(
            `${API_BASE_PATH}/create`,
            data
        );
        console.log("✅ Create counter response:", res.data);
        return res.data;
    } catch (e) {
        console.error("❌ Create counter error:", e);
        return errorMessage<ICounter>(e);
    }
};

export const apiUpdateCounter = async (data: IUpdateCounterRequest) => {
    try {
        const id = data.id;
        const updateData = { ...data };
        delete updateData.id;

        const res = await satellite.put<APIBaseResponse<ICounter>>(
            `${API_BASE_PATH}/${id}`,
            updateData
        );
        return res.data;
    } catch (e) {
        return errorMessage<ICounter>(e);
    }
};

export const apiDeleteCounter = async (id: number) => {
    try {
        const res = await satellite.delete<APIBaseResponse<{ success: boolean }>>(
            `${API_BASE_PATH}/${id}`
        );
        return res.data;
    } catch (e) {
        return errorMessage<{ success: boolean }>(e);
    }
};

export const apiToggleCounterStatus = async (id: number) => {
    try {
        // Since backend doesn't have toggle-status endpoint,
        // we need to get counter first, then update with opposite status
        const getRes = await satellite.get<APIBaseResponse<ICounter>>(
            `${API_BASE_PATH}/${id}`
        );

        if (getRes.data && getRes.data.data) {
            const counter = getRes.data.data;
            const updatedData = {
                name: counter.name,
                max_queue: counter.maxQueue,
                is_active: !counter.isActive // Toggle status
            };

            const res = await satellite.put<APIBaseResponse<ICounter>>(
                `${API_BASE_PATH}/${id}`,
                updatedData
            );
            return res.data;
        }

        return getRes.data;
    } catch (e) {
        return errorMessage<ICounter>(e);
    }
};

export const apiGetActiveCounters = async () => {
    try {
        // Get all counters then filter active ones in frontend
        // since backend doesn't have /active endpoint
        const res = await satellite.get<APIBaseResponse<ICounter[]>>(
            `${API_BASE_PATH}`
        );

        if (res.data && res.data.data) {
            // Filter active counters in frontend
            const activeCounters = res.data.data.filter(counter => counter.isActive);
            return {
                ...res.data,
                data: activeCounters
            };
        }

        return res.data;
    } catch (e) {
        return errorMessage<ICounter[]>(e);
    }
};