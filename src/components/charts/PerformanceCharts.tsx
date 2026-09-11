"use client";

import React, { useState } from "react";
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from "recharts";
import { Zap, Target, Layers } from "lucide-react";

interface PerformanceChartsProps {
  chartData: Array<{
    date: string;
    wpm: number;
    accuracy: number;
    mode: string;
    difficulty: string;
  }>;
  difficultyBreakdown: Array<{
    difficulty: string;
    avgWpm: number;
    avgAccuracy: number;
    testsCount: number;
  }>;
}

export function PerformanceCharts({
  chartData,
  difficultyBreakdown,
}: PerformanceChartsProps) {
  const [activeTab, setActiveTab] = useState<"wpm" | "accuracy" | "difficulty">("wpm");

  const CustomWpmTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="rounded-xl bg-slate-900 border border-slate-700 p-2.5 text-xs shadow-xl font-mono">
          <p className="text-slate-400">{label}</p>
          <p className="text-rush-400 font-bold">{payload[0].value} WPM</p>
        </div>
      );
    }
    return null;
  };

  const CustomAccTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="rounded-xl bg-slate-900 border border-slate-700 p-2.5 text-xs shadow-xl font-mono">
          <p className="text-slate-400">{label}</p>
          <p className="text-cyan-400 font-bold">{payload[0].value}% Accuracy</p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="w-full rounded-2xl bg-slate-950/80 border border-slate-800 p-6 space-y-6 shadow-xl">
      {/* Chart Selector Tabs */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-slate-850 pb-4">
        <div className="flex items-center gap-2">
          <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
            Analytics View
          </span>
        </div>

        <div className="flex items-center gap-1.5 bg-slate-900/80 p-1 rounded-xl border border-slate-800">
          <button
            onClick={() => setActiveTab("wpm")}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
              activeTab === "wpm"
                ? "bg-rush-500 text-slate-950 shadow-sm"
                : "text-slate-400 hover:text-white"
            }`}
          >
            <Zap className="w-3.5 h-3.5" />
            <span>Speed (WPM)</span>
          </button>
          <button
            onClick={() => setActiveTab("accuracy")}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
              activeTab === "accuracy"
                ? "bg-cyan-500 text-slate-950 shadow-sm"
                : "text-slate-400 hover:text-white"
            }`}
          >
            <Target className="w-3.5 h-3.5" />
            <span>Accuracy (%)</span>
          </button>
          <button
            onClick={() => setActiveTab("difficulty")}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
              activeTab === "difficulty"
                ? "bg-purple-500 text-white shadow-sm"
                : "text-slate-400 hover:text-white"
            }`}
          >
            <Layers className="w-3.5 h-3.5" />
            <span>Difficulty Breakdown</span>
          </button>
        </div>
      </div>

      {/* Chart Canvas */}
      <div className="h-64 sm:h-72 w-full">
        {chartData.length === 0 ? (
          <div className="h-full flex items-center justify-center text-slate-500 text-xs font-mono">
            No test data available for the selected timeframe.
          </div>
        ) : activeTab === "wpm" ? (
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={chartData}>
              <defs>
                <linearGradient id="wpmArea" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#10b981" stopOpacity={0.4} />
                  <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
              <XAxis dataKey="date" stroke="#64748b" tickLine={false} fontSize={11} />
              <YAxis stroke="#64748b" tickLine={false} domain={["dataMin - 10", "dataMax + 10"]} fontSize={11} />
              <Tooltip content={<CustomWpmTooltip />} />
              <Area
                type="monotone"
                dataKey="wpm"
                stroke="#10b981"
                strokeWidth={2.5}
                fillOpacity={1}
                fill="url(#wpmArea)"
              />
            </AreaChart>
          </ResponsiveContainer>
        ) : activeTab === "accuracy" ? (
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
              <XAxis dataKey="date" stroke="#64748b" tickLine={false} fontSize={11} />
              <YAxis stroke="#64748b" tickLine={false} domain={[80, 100]} fontSize={11} />
              <Tooltip content={<CustomAccTooltip />} />
              <Line
                type="monotone"
                dataKey="accuracy"
                stroke="#06b6d4"
                strokeWidth={2.5}
                dot={{ r: 3, fill: "#06b6d4" }}
                activeDot={{ r: 5 }}
              />
            </LineChart>
          </ResponsiveContainer>
        ) : (
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={difficultyBreakdown}>
              <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
              <XAxis dataKey="difficulty" stroke="#64748b" tickLine={false} fontSize={11} />
              <YAxis stroke="#64748b" tickLine={false} fontSize={11} />
              <Tooltip
                content={({ active, payload, label }: any) => {
                  if (active && payload && payload.length) {
                    return (
                      <div className="rounded-xl bg-slate-900 border border-slate-700 p-2.5 text-xs shadow-xl font-mono">
                        <p className="text-white font-bold">{label}</p>
                        <p className="text-rush-400">Avg Speed: {payload[0].value} WPM</p>
                      </div>
                    );
                  }
                  return null;
                }}
              />
              <Bar dataKey="avgWpm" fill="#8b5cf6" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        )}
      </div>
    </div>
  );
}
