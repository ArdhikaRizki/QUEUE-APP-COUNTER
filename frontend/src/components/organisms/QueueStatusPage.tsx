"use client";
import { IQueue } from "@/interfaces/services/queue.interface";
import React, { useState, useEffect } from "react";
import Button from "../atoms/Button";
import Card from "../atoms/Card";
import QueueCard from "../molecules/QueueCard";
import ReleaseQueueForm from "../molecules/ReleaseQueueForm";
import { useSearchQueue, useReleaseQueue } from "@/services/queue/wrapper.service";
import toast from "react-hot-toast";
import { useDebounce } from "@/hooks/debounce.hook";

interface QueueStatusCheckerProps {
  className?: string;
}

const QueueStatusChecker: React.FC<QueueStatusCheckerProps> = ({
  className,
}) => {
  const [queueNumber, setQueueNumber] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [queueDetails, setQueueDetails] = useState<IQueue | null>(null);
  const [notFound, setNotFound] = useState(false);
  const [isSearched, setIsSearched] = useState(false);

  const debouncedSearchQuery = useDebounce(searchQuery, 300);
  const { data: searchResult, isLoading: isSearching } = useSearchQueue(debouncedSearchQuery);
  const { mutate: releaseQueue, isPending: isReleasing } = useReleaseQueue();

  useEffect(() => {
    if (debouncedSearchQuery && searchResult && isSearched) {
      if (searchResult.data && searchResult.data.length > 0) {
        setQueueDetails(searchResult.data[0]);
        setNotFound(false);
      } else {
        setQueueDetails(null);
        setNotFound(true);
      }
    }
  }, [searchResult, debouncedSearchQuery, isSearched]);

  const handleSubmit = (data: { queueNumber: string }) => {
    const query = data.queueNumber.trim();
    setQueueNumber(query);
    setSearchQuery(query);
    setIsSearched(true);
    setNotFound(false);
    setQueueDetails(null);
  };

  const handleReleaseQueue = () => {
    if (!queueDetails?.counter?.id || !queueDetails?.queueNumber) {
      toast.error("Informasi antrian tidak lengkap");
      return;
    }

    releaseQueue(
      {
        counter_id: queueDetails.counter.id,
        queue_number: queueDetails.queueNumber,
      },
      {
        onSuccess: (response) => {
          if (response?.status) {
            setQueueDetails(null);
            setQueueNumber("");
            setSearchQuery("");
            setNotFound(false);
          }
        },
      }
    );
  };

  return (
    <div className={className}>
      <Card className="mb-6">
        <h2 className="text-2xl font-bold text-center text-gray-900 mb-2">
          Cek Status Antrian
        </h2>
        <p className="text-center text-gray-600 mb-6">
          Masukkan nomor antrian Anda untuk memeriksa status
        </p>

        <ReleaseQueueForm onSubmit={handleSubmit} isLoading={isSearching} />
      </Card>

      {queueDetails ? (
        <div className="space-y-4">
          <QueueCard queue={queueDetails} />

          {queueDetails.status === "CLAIMED" && (
            <Button
              variant="danger"
              fullWidth
              onClick={handleReleaseQueue}
              isLoading={isReleasing}
              disabled={isReleasing}
              leftIcon={
                <span className="material-symbols-outlined">exit_to_app</span>
              }
            >
              Lepaskan Nomor Antrian
            </Button>
          )}
        </div>
      ) : (
        notFound &&
        queueNumber && (
          <Card variant="outline" className="text-center py-6 text-gray-500">
            Nomor antrian <strong>{queueNumber}</strong> tidak ditemukan.
          </Card>
        )
      )}
    </div>
  );
};

export default QueueStatusChecker;
