"use client";
import { ICounter } from "@/interfaces/services/counter.interface";
import { IQueue } from "@/interfaces/services/queue.interface";
import React, { useState } from "react";
import Button from "../atoms/Button";
import Card from "../atoms/Card";
import Select from "../atoms/Select";
import CurrentQueueDisplay from "../molecules/CurrentQueueDisplay";
import { useGetActiveCounters } from "@/services/counter/wrapper.service";
import {
  useGetCurrentQueues,
  useNextQueue,
  useSkipQueue,
} from "@/services/queue/wrapper.service";
import { useCounterAppStore } from "@/stores/global-states/counter/counter-app.store";

interface CounterOperatorProps {
  className?: string;
}

const CounterOperator: React.FC<CounterOperatorProps> = ({ className }) => {
  const [selectedCounterId, setSelectedCounterId] = useState<number | null>(null);
  const { selectedCounter, setSelectedCounter, currentQueue, setCurrentQueue } = useCounterAppStore();

  const { data: activeCountersData } = useGetActiveCounters();
  const { data: currentQueuesData, refetch: refetchCurrentQueues } = useGetCurrentQueues();
  const { mutate: nextQueue, isPending: isNexting } = useNextQueue();
  const { mutate: skipQueue, isPending: isSkipping } = useSkipQueue();

  const activeCounters = activeCountersData?.data || [];

  const handleCounterChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const counterId = parseInt(e.target.value);
    const counter = activeCounters.find(c => c.id === counterId);
    setSelectedCounterId(counterId);
    setSelectedCounter(counter || null);

    // Find current queue for selected counter
    if (currentQueuesData?.data) {
      const counterQueue = currentQueuesData.data.find(cq => cq.id === counterId);
      if (counterQueue) {
        setCurrentQueue({
          id: 0,
          queueNumber: counterQueue.currentQueue,
          status: counterQueue.status,
          counter: { id: counterQueue.id, name: counterQueue.name },
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        });
      }
    }
  };

  const handleNextQueue = () => {
    if (!selectedCounter) return;

    nextQueue(
      { counter_id: selectedCounter.id },
      {
        onSuccess: (response) => {
          if (response?.status && response.data) {
            setCurrentQueue(response.data.queue);
            refetchCurrentQueues();
          }
        },
      }
    );
  };

  const handleSkipQueue = () => {
    if (!selectedCounter) return;

    skipQueue(
      { counter_id: selectedCounter.id },
      {
        onSuccess: (response) => {
          if (response?.status && response.data?.nextQueue) {
            setCurrentQueue(response.data.nextQueue);
            refetchCurrentQueues();
          }
        },
      }
    );
  };

  return (
    <div className={className}>
      <Card className="mb-6">
        <h2 className="text-2xl font-bold text-center text-gray-900 mb-2">
          OPERATOR COUNTER
        </h2>
        <p className="text-center text-gray-600 mb-6">
          Panel untuk operator counter melayani antrian pengunjung
        </p>

        <Select
          label="Pilih Counter"
          fullWidth
          options={[
            { value: "", label: "Pilih Counter", disabled: true },
            ...activeCounters.map((counter) => ({
              value: counter.id.toString(),
              label: counter.name,
              disabled: false,
            })),
          ]}
          value={selectedCounterId?.toString() || ""}
          onChange={handleCounterChange}
        />
      </Card>

      {selectedCounter ? (
        <div className="space-y-6">
          <CurrentQueueDisplay
            counterName={selectedCounter?.name || ""}
            queueNumber={currentQueue?.queueNumber || null}
            status={currentQueue?.status || "RELEASED"}
          />

          <div className="flex gap-4">
            <Button
              fullWidth
              leftIcon={
                <span className="material-symbols-outlined">arrow_forward</span>
              }
              onClick={handleNextQueue}
              isLoading={isNexting}
              disabled={isNexting || isSkipping}
            >
              Panggil Antrian Berikutnya
            </Button>

            {currentQueue && (
              <Button
                fullWidth
                variant="danger"
                leftIcon={
                  <span className="material-symbols-outlined">skip_next</span>
                }
                onClick={handleSkipQueue}
                isLoading={isSkipping}
                disabled={isNexting || isSkipping}
              >
                Lewati Antrian
              </Button>
            )}
          </div>
        </div>
      ) : (
        <Card variant="outline" className="text-center py-8 text-gray-500">
          Silahkan pilih counter untuk mulai melayani antrian
        </Card>
      )}
    </div>
  );
};

export default CounterOperator;
