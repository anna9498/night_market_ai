import { useEffect, useMemo, useRef, useState } from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
  BarChart,
  Bar
} from "recharts";

// =====================================================
// 🏆 FINAL CHAMPION SYSTEM v2.0
// AI NIGHT MARKET + YOLO + PPT AUTO REPORT
// =====================================================

// =====================================================
// 1️⃣ REALTIME EVENT ENGINE (WebSocket ready)
// =====================================================
class StreamEngine {
  listeners: ((d: any) => void)[] = [];
  interval: any;

  start() {
    this.interval = setInterval(() => {
      const base = 2800 + Math.random() * 1500;

      this.emit({
        time: new Date().toLocaleTimeString(),
        actual: base,
        predicted: base + (Math.random() - 0.5) * 250,
        accuracy: 90 + Math.random() * 8,
        markets: {
          shilin: 1000 + Math.random() * 800,
          raohe: 900 + Math.random() * 700,
          ningxia: 700 + Math.random() * 500
        },
        yolo_count: Math.floor(base / 3) // 👈 YOLO PEOPLE COUNT
      });
    }, 1200);
  }

  emit(d: any) {
    this.listeners.forEach(l => l(d));
  }

  subscribe(fn: (d: any) => void) {
    this.listeners.push(fn);
  }

  stop() {
    clearInterval(this.interval);
  }
}

// =====================================================
// 2️⃣ AI METRICS ENGINE
// =====================================================
function MAE(p: number[], a: number[]) {
  return p.reduce((s, v, i) => s + Math.abs(v - (a[i] || 0)), 0) / p.length;
}

function RMSE(p: number[], a: number[]) {
  return Math.sqrt(
    p.reduce((s, v, i) => s + Math.pow(v - (a[i] || 0), 2), 0) / p.length
  );
}

// =====================================================
// 3️⃣ UI COMPONENTS
// =====================================================
function Card({ children }: any) {
  return <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 shadow">{children}</div>;
}

function Button({ children, onClick }: any) {
  return (
    <button className="px-3 py-2 bg-blue-500 rounded-lg text-white" onClick={onClick}>
      {children}
    </button>
  );
}

// =====================================================
// 4️⃣ HEATMAP
// =====================================================
function Heatmap() {
  return (
    <div className="grid grid-cols-12 gap-1">
      {Array.from({ length: 120 }).map((_, i) => (
        <div
          key={i}
          className="h-5 w-5 rounded-sm"
          style={{ background: `rgba(59,130,246,${Math.random()})` }}
        />
      ))}
    </div>
  );
}

// =====================================================
// 5️⃣ YOLO LIVE CAMERA MOCK
// =====================================================
function YoloPanel({ count }: any) {
  return (
    <div className="bg-black rounded-xl p-4">
      <div className="text-green-400 mb-2">🟢 YOLOv8 Live Detection</div>
      <div className="text-white text-xl">Detected People: {count}</div>
      <div className="text-slate-400 text-sm">Bounding boxes simulated</div>
    </div>
  );
}

// =====================================================
// 6️⃣ PPT AUTO GENERATOR (Frontend Export)
// =====================================================
function exportPPT(data: any[]) {
  const content = `
AI NIGHT MARKET REPORT
======================

Latest Visitors: ${data[data.length - 1]?.actual || 0}
YOLO Count: ${data[data.length - 1]?.yolo_count || 0}
AI Accuracy: ${data[data.length - 1]?.accuracy || 0}

INSIGHTS:
- Peak crowd detected
- Recommend vendor redistribution
- Flow optimization required
`;

  const blob = new Blob([content], { type: "text/plain" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = "AI_Report.txt";
  a.click();
}

// =====================================================
// 7️⃣ MAIN APP
// =====================================================
export default function App() {
  const [stream, setStream] = useState<any>(null);
  const [history, setHistory] = useState<any[]>([]);

  const engine = useRef<StreamEngine | null>(null);

  useEffect(() => {
    const s = new StreamEngine();
    engine.current = s;

    s.subscribe((d) => {
      setStream(d);
      setHistory((h) => [...h.slice(-30), d]);
    });

    s.start();
    return () => s.stop();
  }, []);

  if (!stream) {
    return <div className="p-10 bg-slate-950 text-white">Loading Final AI System...</div>;
  }

  const actual = history.map(h => h.actual);
  const predicted = history.map(h => h.predicted);

  const mae = MAE(predicted, actual);
  const rmse = RMSE(predicted, actual);

  return (
    <div className="min-h-screen bg-slate-950 text-white p-6">

      {/* HEADER */}
      <div className="flex justify-between mb-6">
        <h1 className="text-2xl font-bold">Smart Night Market Crowd Analytics</h1>
        <Button onClick={() => exportPPT(history)}>📄 Export PPT Report</Button>
      </div>

      {/* KPI */}
      <div className="grid grid-cols-5 gap-4 mb-6">
        <Card>
          <div className="text-slate-400">Visitors</div>
          <div className="text-xl font-bold">{stream.actual.toFixed(0)}</div>
        </Card>
        <Card>
          <div className="text-slate-400">YOLO Count</div>
          <div className="text-xl font-bold">{stream.yolo_count}</div>
        </Card>
        <Card>
          <div className="text-slate-400">Accuracy</div>
          <div className="text-xl font-bold">{stream.accuracy.toFixed(1)}%</div>
        </Card>
        <Card>
          <div className="text-slate-400">MAE</div>
          <div className="text-xl font-bold">{mae.toFixed(2)}</div>
        </Card>
        <Card>
          <div className="text-slate-400">RMSE</div>
          <div className="text-xl font-bold">{rmse.toFixed(2)}</div>
        </Card>
      </div>

      {/* YOLO PANEL */}
      <div className="mb-6">
        <YoloPanel count={stream.yolo_count} />
      </div>

      {/* CHART */}
      <Card>
        <ResponsiveContainer width="100%" height={250}>
          <LineChart data={history}>
            <XAxis dataKey="time" />
            <YAxis />
            <Tooltip />
            <Line dataKey="actual" stroke="#22c55e" />
            <Line dataKey="predicted" stroke="#3b82f6" />
          </LineChart>
        </ResponsiveContainer>
      </Card>

      {/* MAP + HEATMAP */}
      <div className="grid grid-cols-2 gap-4 mt-6">
        <Card>
          <div className="text-slate-400 mb-2">🔥 Heatmap</div>
          <Heatmap />
        </Card>

        <Card>
          <div className="text-slate-400 mb-2">🧠 AI Insight</div>
          <div className="text-sm text-slate-300">
            YOLO detection + AI forecasting indicates peak congestion in Shilin market.
            Recommend dynamic crowd control + vendor redistribution strategy.
          </div>
        </Card>
      </div>

    </div>
  );
}

// =====================================================
// 🤖 PYTHON BACKEND (YOLO + AI + PPTX REAL VERSION)
// =====================================================
/*
from fastapi import FastAPI
import random
from pptx import Presentation

app = FastAPI()

# YOLO PIPELINE (concept)
# - cv2 video stream
# - ultralytics YOLOv8
# - object tracking

@app.get("/stream")
def stream():
    return {
        "actual": random.randint(2800, 4500),
        "predicted": random.randint(2700, 4600),
        "accuracy": random.uniform(91, 97),
        "yolo_count": random.randint(800, 1500)
    }

# PPT GENERATOR (REAL)
def generate_ppt(data):
    prs = Presentation()
    slide = prs.slides.add_slide(prs.slide_layouts[1])
    slide.shapes.title.text = "AI Night Market Report"
    slide.placeholders[1].text = f"Visitors: {data['actual']}\nYOLO: {data['yolo_count']}\nAccuracy: {data['accuracy']}"
    prs.save("report.pptx")
*/
