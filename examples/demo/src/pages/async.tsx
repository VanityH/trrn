import type { Ctx } from "trrn";
import { Spinner } from "../components/Spinner.tsx";

function simulateFetch(id: number): Promise<string> {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      if (id <= 0) reject(new Error("Network error"));
      else resolve(`Data loaded for id: ${id}`);
    }, 1500);
  });
}

export function AsyncPage(_: unknown, { update, onMount, onUnmount }: Ctx) {
  let status = "idle" as "idle" | "loading" | "success" | "error";
  let data = "";
  let errorMsg = "";
  let fetchId = 1;

  onUnmount(() => { fetchId = -1; });

  const load = () => {
    status = "loading";
    data = "";
    errorMsg = "";
    const id = ++fetchId;
    update();

    simulateFetch(id)
      .then((result) => {
        if (id !== fetchId) return;
        data = result;
        status = "success";
        update();
      })
      .catch((err: Error) => {
        if (id !== fetchId) return;
        errorMsg = err.message;
        status = "error";
        update();
      });
  };

  onMount(load);

  return () => (
    <div>
      <h2>Async Data Loading</h2>
      <p style="color: #666; font-size: 14px;">
        onMount init + onUnmount cancellation + loading/error/success states.
      </p>

      <div style="margin-top: 16px; padding: 16px; border: 1px solid #eee; border-radius: 8px; min-height: 80px;">
        {status === "loading" && <Spinner />}
        {status === "success" && <p style="color: #16a34a;">{data}</p>}
        {status === "error" && <p style="color: #dc2626;">Error: {errorMsg}</p>}
        {status === "idle" && <p style="color: #999;">Click "Load" to start.</p>}
      </div>

      <button
        onClick={load}
        disabled={status === "loading"}
        style={{
          marginTop: "12px",
          padding: "8px 20px",
          background: status === "loading" ? "#ccc" : "#6366f1",
          color: "#fff",
          border: "none",
          borderRadius: "4px",
          cursor: status === "loading" ? "default" : "pointer",
        }}
      >
        {status === "loading" ? "Loading..." : "Reload"}
      </button>
    </div>
  );
}
