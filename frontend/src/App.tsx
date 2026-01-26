import { useEffect, useState } from "react";

export default function App() {
  const [status, setStatus] = useState("loading");

  useEffect(() => {
    const baseUrl = import.meta.env.VITE_API_BASE_URL || "";

    fetch(`${baseUrl}/api/health`)
      .then((r) => r.json())
      .then((data) => setStatus(data.status))
      .catch(() => setStatus("error"));
  }, []);

  return (
    <div style={{ padding: 16 }}>
      <h1>Portfolio (dev)</h1>
      <p>API status: {status}</p>
    </div>
  );
}
