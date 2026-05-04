import { defineComponent, action } from "trrn";
import type { Ctx } from "trrn";
import { Card } from "../../components/ui/Card.tsx";
import { fetchAnalytics } from "../../mock/api.ts";
import type { AnalyticsData } from "../../mock/types.ts";

export const AnalyticsPage = defineComponent<object>(function (
  _,
  { update, onMount, onUnmount }: Ctx,
) {
  let data: AnalyticsData | null = null;
  let loading = true;
  let error: string | null = null;

  onMount(() => {
    void fetchAnalytics()
      .then((result) => {
        data = result;
      })
      .catch((e) => {
        error = String(e);
      })
      .finally(() => {
        loading = false;
        update();
      });
  });

  const intervalId = { current: 0 as unknown as ReturnType<typeof setInterval> };
  let liveValues: Array<{ time: string; value: number }> = [];

  onMount(() => {
    intervalId.current = setInterval(() => {
      if (!data) return;
      const now = new Date();
      const time = `${String(now.getHours()).padStart(2, "0")}:${String(now.getMinutes()).padStart(2, "0")}`;
      const value = Math.floor(Math.random() * 200 + 100);
      liveValues = [...liveValues, { time, value }];
      if (liveValues.length > 30) liveValues = liveValues.slice(-30);
      data = {
        ...data,
        pageViews: data.pageViews + Math.floor(Math.random() * 5),
        activeUsers: data.activeUsers + (Math.random() > 0.5 ? 1 : -1),
      };
      update();
    }, 2000);
  });

  onUnmount(() => {
    clearInterval(intervalId.current);
  });

  const handleRefresh = action({ update } as Ctx, () => {
    loading = true;
    update();
    void fetchAnalytics().then((result) => {
      data = result;
      loading = false;
      update();
    });
  });

  return (__) => {
    const cols = [
      { label: "页面浏览量", value: data?.pageViews ?? 0, color: "#6366f1" },
      { label: "活跃用户", value: data?.activeUsers ?? 0, color: "#10b981" },
      { label: "请求数", value: data?.requests ?? 0, color: "#f59e0b" },
      { label: "延迟 (ms)", value: data?.latency ?? 0, color: "#ef4444" },
    ];

    let chartData = data?.history ?? [];
    if (liveValues.length > 0) {
      chartData = [...chartData, ...liveValues];
    }

    const maxVal = Math.max(...chartData.map((d) => d.value), 1);

    return (
      <div>
        <div style={{ display: "flex", gap: "12px", marginBottom: "20px" }}>
          {cols.map((col) => (
            <Card key={col.label} style={{ flex: 1, minWidth: 0 } as any}>
              <div style={{ textAlign: "center" }}>
                <div style={{ fontSize: "12px", color: "#6b7280", marginBottom: "4px" }}>
                  {col.label}
                </div>
                <div style={{ fontSize: "28px", fontWeight: 700, color: col.color }}>
                  {loading ? "..." : col.value.toLocaleString()}
                </div>
              </div>
            </Card>
          ))}
        </div>

        <Card
          title="实时数据"
          footer={
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <span style={{ fontSize: "12px", color: "#9ca3af" }}>每秒自动更新</span>
              <button
                onClick={handleRefresh}
                style={{
                  padding: "4px 12px",
                  fontSize: "12px",
                  borderRadius: "4px",
                  border: "1px solid #d1d5db",
                  background: "#fff",
                  cursor: "pointer",
                }}
              >
                刷新
              </button>
            </div>
          }
        >
          {loading ? (
            <div style={{ textAlign: "center", padding: "40px", color: "#9ca3af" }}>加载中...</div>
          ) : error ? (
            <div style={{ textAlign: "center", padding: "40px", color: "#ef4444" }}>{error}</div>
          ) : (
            <div
              style={{
                display: "flex",
                alignItems: "flex-end",
                gap: "3px",
                height: "160px",
                padding: "8px 0",
              }}
            >
              {chartData.map((d, i) => (
                <div
                  key={i}
                  style={{
                    flex: 1,
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    justifyContent: "flex-end",
                    height: "100%",
                  }}
                >
                  <div
                    style={{
                      width: "100%",
                      height: `${(d.value / maxVal) * 100}%`,
                      background: "#6366f1",
                      borderRadius: "3px 3px 0 0",
                      minHeight: "2px",
                      transition: "height 0.3s",
                    }}
                  />
                  {i % 4 === 0 && (
                    <span
                      style={{
                        fontSize: "9px",
                        color: "#9ca3af",
                        marginTop: "4px",
                        whiteSpace: "nowrap",
                      }}
                    >
                      {d.time}
                    </span>
                  )}
                </div>
              ))}
            </div>
          )}
        </Card>
      </div>
    );
  };
});
