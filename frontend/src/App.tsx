import { useEffect, useRef, useState } from "react";
import { io, type Socket } from "socket.io-client";

function App() {
  type ESPData = {
    id: string;
    flameRead: number;
    tempRead: number;
    humidity: number;
    gasRead: number;
    timestamp: string;
  };

  const socketRef = useRef<Socket | null>(null);
  const [connected, setConnected] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [data, setData] = useState<ESPData[]>([]);

  useEffect(() => {
    const socket = io("http://localhost:3000", {
      timeout: 5000,
      reconnectionAttempts: 5,
      reconnectionDelay: 1000,
    });
    socketRef.current = socket;
    socket.on("connect", () => {
      setConnected(true);
      setLoading(true);
      setError(false);
    });

    socket.io.on("reconnect_failed", () => {
      setLoading(false);
      setError(true);
    });

    socket.on("disconnect", () => {
      setConnected(false);
      setLoading(false);
      setError(true);
    });
    socket.on("sensorData", (data: ESPData) => {
      setData((prev) => [data, ...prev]);
    });
    socket.on("prevData", (data: ESPData[]) => {
      setData(data);
      setLoading(false);
      setError(false);
    });
    socket.on("sensorDataError", (message: string) => {
      setLoading(false);
      setError(true);
      console.error(message);
    });
    return () => {
      socket.disconnect();
      socketRef.current = null;
    };
  }, []);

  return (
    <div className="flex flex-col gap-4 p-4">
      <div className="flex justify-between">
        <h1 className="text-center text-2xl font-bold">Sensor Data</h1>
        <div className="flex items-center gap-2">
          <div
            className={`${loading ? "h-5 w-5 animate-spin rounded-full border-4 border-blue-400 border-t-transparent" : ""}`}
          ></div>
          <p>
            {error ? "Disconnected" : connected ? "Connected" : "Connecting..."}
          </p>
        </div>
      </div>
      <table className="table-auto border-collapse border border-gray-300">
        <thead>
          <tr className="bg-gray-400">
            <th className="border-x border-x-white">ID</th>
            <th className="border-x border-x-white">FLame</th>
            <th className="border-x border-x-white">Temp</th>
            <th className="border-x border-x-white">Humidity</th>
            <th className="border-x border-x-white">Gas</th>
            <th className="border-x border-x-white">Time</th>
            <th className="border-x border-x-white">Date</th>
          </tr>
        </thead>
        <tbody>
          {data.length > 0 &&
            data?.map((item) => {
              return (
                <tr
                  className="text-center odd:bg-white even:bg-gray-200"
                  key={item.id}
                >
                  <td className="border-x border-x-white py-1 text-center">
                    {item.id}
                  </td>
                  <td className="border-x border-x-white text-center">
                    {item.flameRead === 1 ? "Yes" : "No"}
                  </td>
                  <td className="border-x border-x-white text-center">
                    {item.tempRead} °C
                  </td>
                  <td className="border-x border-x-white text-center">
                    {item.humidity} %
                  </td>
                  <td className="border-x border-x-white text-center">
                    {item.humidity} ppm
                  </td>
                  <td className="border-x border-x-white text-center">
                    {new Date(item.timestamp).toLocaleTimeString()}
                  </td>
                  <td className="border-x border-x-white text-center">
                    {new Date(item.timestamp).toLocaleDateString()}
                  </td>
                </tr>
              );
            })}
        </tbody>
      </table>
    </div>
  );
}

export default App;
