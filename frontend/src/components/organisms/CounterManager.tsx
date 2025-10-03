"use client";
import {
  ICounter,
  ICreateCounterRequest,
  IUpdateCounterRequest,
} from "@/interfaces/services/counter.interface";
import React, { useState } from "react";
import Button from "../atoms/Button";
import Card from "../atoms/Card";
import CounterCard from "../molecules/CounterCard";
import CounterForm from "../molecules/CounterForm";
import {
  useGetAllCounters,
  useCreateCounter,
  useUpdateCounter,
  useDeleteCounter,
} from "@/services/counter/wrapper.service";

interface CounterManagerProps {
  className?: string;
}

const CounterManager: React.FC<CounterManagerProps> = ({ className }) => {
  const [isAddingCounter, setIsAddingCounter] = useState(false);
  const [editingCounter, setEditingCounter] = useState<ICounter | null>(null);
  const [selectedCounter, setSelectedCounter] = useState<ICounter | null>(null);

  const {
    data: countersData,
    isLoading,
    refetch: refetchCounters,
  } = useGetAllCounters();
  const { mutate: createCounter, isPending: isCreating } = useCreateCounter();
  const { mutate: updateCounter, isPending: isUpdating } = useUpdateCounter();
  const { mutate: deleteCounter, isPending: isDeleting } = useDeleteCounter();

  const counters = countersData?.data || [];

  const handleSubmit = (
    data: ICreateCounterRequest | IUpdateCounterRequest
  ) => {
    if (editingCounter) {
      updateCounter(
        { ...data, id: editingCounter.id },
        {
          onSuccess: (response) => {
            if (response?.status) {
              setEditingCounter(null);
              refetchCounters();
            }
          },
        }
      );
    } else {
      createCounter(data, {
        onSuccess: (response) => {
          if (response?.status) {
            setIsAddingCounter(false);
            refetchCounters();
          }
        },
      });
    }
  };

  const handleCounterClick = (counter: ICounter) => {
    setSelectedCounter(selectedCounter?.id === counter.id ? null : counter);
  };

  const handleEditCounter = () => {
    if (selectedCounter) {
      setEditingCounter(selectedCounter);
      setSelectedCounter(null);
    }
  };

  const handleDeleteCounter = () => {
    if (selectedCounter) {
      deleteCounter(selectedCounter.id, {
        onSuccess: (response) => {
          if (response?.status) {
            setSelectedCounter(null);
            refetchCounters();
          }
        },
      });
    }
  };

  return (
    <div className={className}>
      <Card className="mb-6">
        <div className="flex justify-between items-center">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">
              Manajemen Counter
            </h2>
            <p className="text-gray-600 mt-1">Kelola counter/loket pelayanan</p>
          </div>
          {!isAddingCounter && !editingCounter && (
            <Button
              onClick={() => setIsAddingCounter(true)}
              leftIcon={<span className="material-symbols-outlined">add</span>}
            >
              Tambah Counter
            </Button>
          )}
        </div>
      </Card>

      {isAddingCounter || editingCounter ? (
        <Card>
          <h3 className="text-lg font-semibold mb-4">
            {editingCounter ? "Edit Counter" : "Tambah Counter Baru"}
          </h3>
          <CounterForm
            counter={editingCounter || undefined}
            onSubmit={handleSubmit}
            isLoading={isCreating || isUpdating}
            isEditMode={!!editingCounter}
          />
          <div className="flex justify-end mt-4">
            <Button
              variant="outline"
              onClick={() => {
                setIsAddingCounter(false);
                setEditingCounter(null);
              }}
            >
              Batal
            </Button>
          </div>
        </Card>
      ) : (
        <>
          {selectedCounter && (
            <div className="flex gap-2 mb-4">
              <Button
                variant="outline"
                onClick={handleEditCounter}
                leftIcon={
                  <span className="material-symbols-outlined">edit</span>
                }
              >
                Edit
              </Button>
              <Button
                variant="danger"
                onClick={handleDeleteCounter}
                isLoading={isDeleting}
                leftIcon={
                  <span className="material-symbols-outlined">delete</span>
                }
              >
                Hapus
              </Button>
            </div>
          )}

          {isLoading ? (
            <Card variant="outline" className="text-center py-8 text-gray-500">
              Memuat data counter...
            </Card>
          ) : counters.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {counters.map((counter) => (
                <CounterCard
                  key={counter.id}
                  counter={counter}
                  isSelected={selectedCounter?.id === counter.id}
                  onClick={handleCounterClick}
                />
              ))}
            </div>
          ) : (
            <Card variant="outline" className="text-center py-8 text-gray-500">
              Belum ada counter. Klik 'Tambah Counter' untuk membuat counter
              baru.
            </Card>
          )}
        </>
      )}
    </div>
  );
};

export default CounterManager;
