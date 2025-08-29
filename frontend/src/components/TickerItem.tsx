// components/TickerItem.tsx
import { useEffect, useState } from "react";
import Spinner from "./Spinner";

export default function TickerItem({
  ticker,
  price,
  isLoading,
  onRemove,
}: {
  ticker: string;
  price: number;
  isLoading: boolean;
  onRemove: () => void;
}) {
  const [flashClass, setFlashClass] = useState("");

  useEffect(() => {
    if (!isLoading && price !== undefined && price !== -1) {
      setFlashClass("font-bold " + (price > 0 ? "text-green-600" : "text-red-600"));
      const timer = setTimeout(() => setFlashClass(""), 1000);
      return () => clearTimeout(timer);
    }
  }, [price]);

  return (
    <li className="flex justify-between items-center border-b py-2">
      <span>
        <strong>{ticker}</strong>:{" "}
        {isLoading ? (
          <Spinner />
        ) : price === -1 ? (
          <span className="text-gray-500 italic">Ticker does not exist</span>
        ) : (
          <span className={flashClass}>${price.toFixed(2)}</span>
        )}
      </span>
      <button onClick={onRemove} className="text-red-500 hover:underline">
        Remove
      </button>
    </li>
  );
}
