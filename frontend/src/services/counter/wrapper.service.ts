"use client";
import {
    ICreateCounterRequest,
    IUpdateCounterRequest,
} from "@/interfaces/services/counter.interface";
import { useMutation, useQuery } from "@tanstack/react-query";
import toast from "react-hot-toast";
import {
    apiCreateCounter,
    apiDeleteCounter,
    apiGetActiveCounters,
    apiGetAllCounters,
    apiGetCounterById,
    apiToggleCounterStatus,
    apiUpdateCounter,
} from "./api.service";

const COUNTER_KEYS = {
    all: ["counters"] as const,
    active: ["counters", "active"] as const,
    byId: (id: number) => ["counters", id] as const,
};

export const useGetAllCounters = () => {
    return useQuery({
        queryKey: COUNTER_KEYS.all,
        queryFn: () => apiGetAllCounters(),
        refetchOnWindowFocus: false,
    });
};

export const useGetActiveCounters = () => {
    return useQuery({
        queryKey: COUNTER_KEYS.active,
        queryFn: () => apiGetActiveCounters(),
        refetchOnWindowFocus: false,
    });
};

export const useGetCounterById = (id: number) => {
    return useQuery({
        queryKey: COUNTER_KEYS.byId(id),
        queryFn: () => apiGetCounterById(id),
        enabled: !!id,
        refetchOnWindowFocus: false,
    });
};

export const useCreateCounter = () => {
    return useMutation({
        mutationFn: (data: ICreateCounterRequest) => apiCreateCounter(data),
        onSuccess: (response) => {
            if (response && response.error) {
                toast.error(response.error.message || "Failed to create counter");
                return;
            }

            if (response && response.status === true) {
                toast.success("Counter berhasil dibuat");
            } else {
                toast.error(response?.message || "Failed to create counter");
            }
        },
        onError: (error) => {
            toast.error(error?.message || "Failed to create counter");
        },
    });
};

export const useUpdateCounter = () => {
    return useMutation({
        mutationFn: (data: IUpdateCounterRequest) => apiUpdateCounter(data),
        onSuccess: (response) => {
            if (response && response.error) {
                toast.error(response.error.message || "Failed to update counter");
                return;
            }

            if (response && response.status === true) {
                toast.success("Counter berhasil diperbarui");
            } else {
                toast.error(response?.message || "Failed to update counter");
            }
        },
        onError: (error) => {
            toast.error(error?.message || "Failed to update counter");
        },
    });
};

export const useDeleteCounter = () => {
    return useMutation({
        mutationFn: (id: number) => apiDeleteCounter(id),
        onSuccess: (response) => {
            if (response && response.error) {
                toast.error(response.error.message || "Failed to delete counter");
                return;
            }

            if (response && response.status === true) {
                toast.success("Counter berhasil dihapus");
            } else {
                toast.error(response?.message || "Failed to delete counter");
            }
        },
        onError: (error) => {
            toast.error(error?.message || "Failed to delete counter");
        },
    });
};

export const useToggleCounterStatus = () => {
    return useMutation({
        mutationFn: (id: number) => apiToggleCounterStatus(id),
        onSuccess: (response) => {
            if (response && response.error) {
                toast.error(response.error.message || "Failed to toggle counter status");
                return;
            }

            if (response && response.status === true) {
                const newStatus = response.data?.isActive ? "diaktifkan" : "dinonaktifkan";
                toast.success(`Counter berhasil ${newStatus}`);
            } else {
                toast.error(response?.message || "Failed to toggle counter status");
            }
        },
        onError: (error) => {
            toast.error(error?.message || "Failed to toggle counter status");
        },
    });
};