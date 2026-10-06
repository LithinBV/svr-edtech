import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";

/*
  SVR-EDTECH - Fresh Manager Dashboard
  ---------------------------------------------------------
  Dashboard only.
  Your existing Sidebar and Navbar stay untouched.

  Backend endpoints used:
    GET /api/manager/leads?type=ALL
    GET /api/manager/leads/executives
    GET /api/manager/leads/follow-ups
*/

const API_URL = import.meta.env.VITE_API_URL;

const STATUS_META = {
  NEW: { label: "New", className: "bg-sky-50 text-sky-700 border-sky-100" },
  HOT: { label: "Hot", className: "bg-rose-50 text-rose-700 border-rose-100" },
  WARM: { label: "Warm", className: "bg-amber-50 text-amber-700 border-amber-100" },
  COLD: { label: "Cold", className: "bg-slate-100 text-slate-600 border-slate-200" },
};

const FOLLOWUP_META = {
  TODAY: { label: "Today", className: "bg-amber-50 text-amber-700" },
  COMPLETED: { label: "Completed", className: "bg-emerald-50 text-emerald-700" },
  UPCOMING: { label: "Upcoming", className: "bg-sky-50 text-sky-700" },
  MISSED: { label: "Missed", className: "bg-rose-50 text-rose-700" },
};

function getToken() {
  const keys = [
    "token",
    "accessToken",
    "access_token",
    "jwt",
    "authToken",
    "managerToken",
  ];

  for (const key of keys) {
    const value = localStorage.getItem(key);
    if (value) return value.replace(/^Bearer\s+/i, "");
  }

  return null;
}

function getAuthHeaders() {
  const token = getToken();
  return {
    "Content-Type": "application/json",
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
}

async function apiGet(path) {
  const response = await fetch(`${API_URL}${path}`, {
    method: "GET",
    headers: getAuthHeaders(),
    cache: "no-store",
  });

  let data = {};
  try {
    data = await response.json();
  } catch {
    data = {};
  }

  if (!response.ok) {
    throw new Error(data.message || `Request failed (${response.status})`);
  }

  return data;
}

function formatNumber(value) {
  return new Intl.NumberFormat("en-IN").format(Number(value || 0));
}

function formatDate(value, withTime = false) {
  if (!value) return "—";

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "—";

  return new Intl.DateTimeFormat("en-IN", {
    day: "2-digit",
    month: "short",
    ...(withTime ? { hour: "2-digit", minute: "2-digit" } : {}),
  }).format(date);
}

function initials(name = "User") {
  return (
    name
      .trim()
      .split(/\s+/)
      .slice(0, 2)
      .map((part) => part[0])
      .join("")
      .toUpperCase() || "U"
  );
}

function getOwnerName(lead) {
  return (
    lead?.leadOwner?.name ||
    lead?.leadOwner?.fullName ||
    lead?.ownerName ||
    "Unassigned"
  );
}

function getLeadName(lead) {
  return lead?.name || lead?.fullName || lead?.leadName || "Unnamed lead";
}

function getLeadStatus(lead) {
  return String(lead?.status || "NEW").toUpperCase();
}

function Icon({ name, size = 20, strokeWidth = 1.8 }) {
  const common = {
    width: size,
    height: size,
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: "currentColor",
    strokeWidth,
    strokeLinecap: "round",
    strokeLinejoin: "round",
    "aria-hidden": true,
  };

  const paths = {
    spark: (
      <>
        <path d="m12 3-1.3 4.1L7 8.5l3.7 1.4L12 14l1.3-4.1L17 8.5l-3.7-1.4L12 3Z" />
        <path d="m19 14-.7 2.3L16 17l2.3.7L19 20l.7-2.3L22 17l-2.3-.7L19 14Z" />
      </>
    ),
    users: (
      <>
        <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
        <circle cx="9" cy="7" r="4" />
        <path d="M22 21v-2a4 4 0 0 0-3-3.87" />
        <path d="M16 3.13a4 4 0 0 1 0 7.75" />
      </>
    ),
    userPlus: (
      <>
        <path d="M15 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
        <circle cx="8" cy="7" r="4" />
        <path d="M19 8v6M16 11h6" />
      </>
    ),
    flame: (
      <path d="M12.4 22c4.1-.2 7.1-3 7.1-7.1 0-3.1-1.9-5.7-4.4-7.4.1 2.2-.8 3.7-2.2 4.7.1-3.9-1.8-6.9-4.7-9.2.3 3.7-3.8 5.8-3.8 10.2 0 4.6 3.3 8.9 8 8.8Z" />
    ),
    check: (
      <>
        <circle cx="12" cy="12" r="9" />
        <path d="m8 12 2.5 2.5L16 9" />
      </>
    ),
    clock: (
      <>
        <circle cx="12" cy="12" r="9" />
        <path d="M12 7v5l3 2" />
      </>
    ),
    alert: (
      <>
        <path d="M10.3 3.8 2.8 17a2 2 0 0 0 1.7 3h15a2 2 0 0 0 1.7-3L13.7 3.8a2 2 0 0 0-3.4 0Z" />
        <path d="M12 9v4M12 17h.01" />
      </>
    ),
    arrow: (
      <>
        <path d="M5 12h14" />
        <path d="m13 6 6 6-6 6" />
      </>
    ),
    refresh: (
      <>
        <path d="M20 11a8 8 0 0 0-14.9-4L3 10" />
        <path d="M3 5v5h5" />
        <path d="M4 13a8 8 0 0 0 14.9 4L21 14" />
        <path d="M21 19v-5h-5" />
      </>
    ),
    trend: (
      <>
        <path d="m3 17 6-6 4 4 8-9" />
        <path d="M15 6h6v6" />
      </>
    ),
    target: (
      <>
        <circle cx="12" cy="12" r="8" />
        <circle cx="12" cy="12" r="4" />
        <circle cx="12" cy="12" r="1" />
      </>
    ),
    calendar: (
      <>
        <rect x="3" y="4" width="18" height="17" rx="2" />
        <path d="M16 2v4M8 2v4M3 9h18" />
      </>
    ),
    chevron: <path d="m9 18 6-6-6-6" />,
    book: (
      <>
        <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" />
        <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2Z" />
      </>
    ),
    layers: (
      <>
        <path d="m12 2 9 5-9 5-9-5 9-5Z" />
        <path d="m3 12 9 5 9-5" />
        <path d="m3 17 9 5 9-5" />
      </>
    ),
  };

  return <svg {...common}>{paths[name] || paths.spark}</svg>;
}

function MiniSparkline({ data = [] }) {
  if (!data.length) return null;

  const max = Math.max(...data, 1);
  const min = Math.min(...data, 0);
  const range = max - min || 1;

  const points = data
    .map((value, index) => {
      const x = (index / Math.max(data.length - 1, 1)) * 100;
      const y = 34 - ((value - min) / range) * 28;
      return `${x},${y}`;
    })
    .join(" ");

  return (
    <svg viewBox="0 0 100 38" className="h-10 w-full">
      <polyline
        points={points}
        fill="none"
        stroke="currentColor"
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function StatCard({ title, value, subtitle, icon, tone, trend, onClick }) {
  const tones = {
    navy: "bg-[#102236] text-white",
    gold: "bg-[#FECA42] text-[#102236]",
    blue: "bg-sky-50 text-sky-700",
    green: "bg-emerald-50 text-emerald-700",
    red: "bg-rose-50 text-rose-700",
  };

  return (
    <button
      type="button"
      onClick={onClick}
      className="group relative w-full overflow-hidden rounded-[24px] border border-slate-100 bg-white p-5 text-left shadow-[0_10px_35px_rgba(15,23,42,0.06)] transition-all duration-300 hover:-translate-y-1 hover:border-slate-200 hover:shadow-[0_18px_45px_rgba(15,23,42,0.10)] focus:outline-none focus:ring-2 focus:ring-[#f7c843]/50"
    >
      <div className="flex items-start justify-between">
        <div>
          <p className="text-[12px] font-semibold uppercase tracking-[0.14em] text-slate-400">
            {title}
          </p>
          <p className="mt-2 text-[30px] font-black tracking-tight text-slate-900">
            {formatNumber(value)}
          </p>
          <p className="mt-1 text-xs text-slate-500">{subtitle}</p>
        </div>

        <div className={`rounded-2xl p-3 ${tones[tone] || tones.blue}`}>
          <Icon name={icon} size={21} strokeWidth={2} />
        </div>
      </div>

      {trend && (
        <div className="mt-4 flex items-center gap-1.5 text-xs font-semibold text-emerald-600">
          <Icon name="trend" size={14} />
          {trend}
        </div>
      )}
    </button>
  );
}

function FollowupCard({ label, value, icon, tone }) {
  const toneMap = {
    today: "border-amber-100 bg-gradient-to-br from-amber-50 to-white text-amber-700",
    completed:
      "border-emerald-100 bg-gradient-to-br from-emerald-50 to-white text-emerald-700",
    upcoming:
      "border-sky-100 bg-gradient-to-br from-sky-50 to-white text-sky-700",
    missed:
      "border-rose-100 bg-gradient-to-br from-rose-50 to-white text-rose-700",
  };

  return (
    <div
      className={`rounded-[22px] border p-4 ${toneMap[tone] || toneMap.today}`}
    >
      <div className="flex items-center justify-between">
        <div className="rounded-xl bg-white/80 p-2 shadow-sm">
          <Icon name={icon} size={18} />
        </div>
        <span className="text-[28px] font-black">{formatNumber(value)}</span>
      </div>
      <p className="mt-3 text-xs font-bold uppercase tracking-[0.12em] opacity-70">
        {label}
      </p>
    </div>
  );
}

function PipelineChart({ counts }) {
  const items = [
    { key: "NEW", label: "New", className: "bg-sky-500" },
    { key: "HOT", label: "Hot", className: "bg-rose-500" },
    { key: "WARM", label: "Warm", className: "bg-amber-400" },
    { key: "COLD", label: "Cold", className: "bg-slate-400" },
  ];

  const total = Math.max(
    items.reduce((sum, item) => sum + (counts[item.key] || 0), 0),
    1
  );

  return (
    <div className="space-y-5">
      {items.map((item) => {
        const value = counts[item.key] || 0;
        const percentage = Math.round((value / total) * 100);

        return (
          <div key={item.key}>
            <div className="mb-2 flex items-center justify-between text-sm">
              <div className="flex items-center gap-2.5">
                <span className={`h-2.5 w-2.5 rounded-full ${item.className}`} />
                <span className="font-semibold text-slate-700">{item.label}</span>
              </div>
              <span className="font-bold text-slate-900">
                {formatNumber(value)}
              </span>
            </div>

            <div className="h-3 overflow-hidden rounded-full bg-slate-100">
              <div
                className={`h-full rounded-full ${item.className} transition-all duration-700`}
                style={{ width: `${percentage}%` }}
              />
            </div>

            <div className="mt-1 text-right text-[11px] font-medium text-slate-400">
              {percentage}%
            </div>
          </div>
        );
      })}
    </div>
  );
}

function SourceBars({ sourceCounts }) {
  const entries = Object.entries(sourceCounts).sort((a, b) => b[1] - a[1]);
  const max = Math.max(...entries.map(([, value]) => value), 1);

  if (!entries.length) {
    return (
      <div className="flex h-64 items-center justify-center text-sm text-slate-400">
        No lead-source data yet.
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {entries.slice(0, 6).map(([source, value]) => (
        <div key={source}>
          <div className="mb-2 flex items-center justify-between gap-3">
            <span className="truncate text-sm font-semibold text-slate-700">
              {source}
            </span>
            <span className="shrink-0 text-sm font-bold text-slate-900">
              {formatNumber(value)}
            </span>
          </div>

          <div className="h-3 overflow-hidden rounded-full bg-slate-100">
            <div
              className="h-full rounded-full bg-gradient-to-r from-[#2563eb] to-[#8b5cf6] transition-all duration-700"
              style={{ width: `${(value / max) * 100}%` }}
            />
          </div>
        </div>
      ))}
    </div>
  );
}

function FollowupTower({ followUps }) {
  const counts = followUps.reduce(
    (acc, item) => {
      const status = String(item.followUpStatus || "NONE").toUpperCase();
      if (status in acc) acc[status] += 1;
      return acc;
    },
    { TODAY: 0, COMPLETED: 0, UPCOMING: 0, MISSED: 0 }
  );

  const total = Math.max(
    counts.TODAY + counts.COMPLETED + counts.UPCOMING + counts.MISSED,
    1
  );

  const rows = [
    ["MISSED", counts.MISSED, "bg-rose-400", "Missed"],
    ["TODAY", counts.TODAY, "bg-blue-600", "Today"],
    ["COMPLETED", counts.COMPLETED, "bg-emerald-400", "Completed"],
    ["UPCOMING", counts.UPCOMING, "bg-violet-400", "Upcoming"],
  ];

  return (
    <div className="grid grid-cols-1 gap-5 lg:grid-cols-[180px_1fr]">
      <div className="relative flex min-h-[250px] items-end justify-center overflow-hidden rounded-[24px] bg-[#102236] p-5">
        <div className="absolute inset-x-8 top-8 h-px bg-white/10" />
        <div className="absolute inset-x-8 top-1/3 h-px bg-white/10" />
        <div className="absolute inset-x-8 top-2/3 h-px bg-white/10" />

        <div className="relative flex h-[190px] w-20 items-end overflow-hidden rounded-t-[18px] rounded-b-lg border border-white/10 bg-white/10">
          <div
            className="w-full rounded-t-[18px] bg-gradient-to-t from-[#f7c843] via-[#ffdc72] to-white transition-all duration-1000"
            style={{
              height: `${Math.max(
                ((counts.TODAY + counts.MISSED) / total) * 100,
                8
              )}%`,
            }}
          />
        </div>

        <div className="absolute bottom-3 left-0 right-0 text-center">
          <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-white/50">
            Follow-up load
          </p>
          <p className="mt-1 text-lg font-black text-white">
            {formatNumber(total)}
          </p>
        </div>
      </div>

      <div className="space-y-5">
        {rows.map(([key, value, bar, label]) => (
          <button
            key={key}
            type="button"
            onClick={() => openFollowUps(key)}
            className="block w-full text-left transition hover:-translate-y-0.5 focus:outline-none"
          >
            <div className="mb-2 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className={`h-2.5 w-2.5 rounded-full ${bar}`} />
                <span className="text-sm font-semibold text-slate-700">
                  {label}
                </span>
              </div>
              <span className="text-sm font-black text-slate-900">
                {formatNumber(value)}
              </span>
            </div>
            <div className="h-2.5 overflow-hidden rounded-full bg-slate-100">
              <div
                className={`h-full rounded-full ${bar}`}
                style={{ width: `${(value / total) * 100}%` }}
              />
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}

function TeamPerformance({ leads, executives }) {
  const people = useMemo(() => {
    const map = new Map();

    (executives || []).forEach((person) => {
      const id = String(person?._id || person?.id || person?.userId || "");
      if (id) {
        map.set(id, {
          id,
          name: person.name || person.fullName || "Executive",
          email: person.email || "",
          total: 0,
          hot: 0,
          warm: 0,
          cold: 0,
          newCount: 0,
        });
      }
    });

    leads.forEach((lead) => {
      const owner = lead?.leadOwner;
      const id = String(owner?._id || owner || "");

      if (!id) return;

      if (!map.has(id)) {
        map.set(id, {
          id,
          name: owner?.name || "Manager",
          email: owner?.email || "",
          total: 0,
          hot: 0,
          warm: 0,
          cold: 0,
          newCount: 0,
        });
      }

      const row = map.get(id);
      const status = getLeadStatus(lead);

      row.total += 1;
      if (status === "HOT") row.hot += 1;
      if (status === "WARM") row.warm += 1;
      if (status === "COLD") row.cold += 1;
      if (status === "NEW") row.newCount += 1;
    });

    return [...map.values()].sort((a, b) => b.total - a.total);
  }, [leads, executives]);

  if (!people.length) {
    return (
      <div className="flex min-h-48 items-center justify-center text-sm text-slate-400">
        No team data available.
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full min-w-[650px] border-separate border-spacing-y-2">
        <thead>
          <tr className="text-left text-[11px] font-bold uppercase tracking-[0.12em] text-slate-400">
            <th className="px-3 pb-2">Team member</th>
            <th className="px-3 pb-2 text-center">Leads</th>
            <th className="px-3 pb-2 text-center">Hot</th>
            <th className="px-3 pb-2 text-center">Warm</th>
            <th className="px-3 pb-2 text-center">New</th>
          </tr>
        </thead>
        <tbody>
          {people.slice(0, 7).map((person) => (
            <tr key={person.id} className="group">
              <td className="rounded-l-2xl bg-slate-50 px-3 py-3">
                <div className="flex items-center gap-3">
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-[#102236] text-xs font-black text-white">
                    {initials(person.name)}
                  </div>
                  <div className="min-w-0">
                    <p className="truncate text-sm font-bold text-slate-800">
                      {person.name}
                    </p>
                    <p className="truncate text-[11px] text-slate-400">
                      {person.email || "Team member"}
                    </p>
                  </div>
                </div>
              </td>
              <td className="bg-slate-50 px-3 py-3 text-center text-sm font-black text-slate-800">
                {formatNumber(person.total)}
              </td>
              <td className="bg-slate-50 px-3 py-3 text-center text-sm font-bold text-rose-600">
                {formatNumber(person.hot)}
              </td>
              <td className="bg-slate-50 px-3 py-3 text-center text-sm font-bold text-amber-600">
                {formatNumber(person.warm)}
              </td>
              <td className="rounded-r-2xl bg-slate-50 px-3 py-3 text-center text-sm font-bold text-sky-600">
                {formatNumber(person.newCount)}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function RecentLeads({ leads }) {
  const recent = [...leads]
    .sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0))
    .slice(0, 6);

  if (!recent.length) {
    return (
      <div className="flex min-h-48 items-center justify-center text-sm text-slate-400">
        No leads found for this manager/team.
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {recent.map((lead) => {
        const status = getLeadStatus(lead);
        const meta = STATUS_META[status] || STATUS_META.NEW;

        return (
          <button
            type="button"
            key={lead._id || lead.id}
            onClick={() => openLead(lead._id || lead.id)}
            className="flex w-full items-center gap-3 rounded-2xl p-3 text-left transition-colors hover:bg-slate-50 focus:outline-none"
          >
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-xs font-black text-[#102236]">
              {initials(getLeadName(lead))}
            </div>

            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-bold text-slate-800">
                {getLeadName(lead)}
              </p>
              <p className="mt-0.5 truncate text-[11px] text-slate-400">
                {getOwnerName(lead)} · {formatDate(lead.createdAt)}
              </p>
            </div>

            <span
              className={`rounded-full border px-2.5 py-1 text-[10px] font-bold uppercase ${meta.className}`}
            >
              {meta.label}
            </span>
          </button>
        );
      })}
    </div>
  );
}

function ProgramCard({ leads }) {
  const counts = leads.reduce((acc, lead) => {
    const value = lead?.programInterest || "Not specified";
    acc[value] = (acc[value] || 0) + 1;
    return acc;
  }, {});

  const entries = Object.entries(counts).sort((a, b) => b[1] - a[1]).slice(0, 4);

  if (!entries.length) {
    return <p className="text-sm text-slate-400">No program data yet.</p>;
  }

  const max = Math.max(...entries.map(([, value]) => value), 1);

  return (
    <div className="space-y-4">
      {entries.map(([name, value]) => (
        <div key={name}>
          <div className="mb-2 flex justify-between gap-3">
            <span className="truncate text-sm font-semibold text-slate-700">
              {name}
            </span>
            <span className="text-sm font-black text-slate-900">
              {formatNumber(value)}
            </span>
          </div>
          <div className="h-2 overflow-hidden rounded-full bg-slate-100">
            <div
              className="h-full rounded-full bg-[#102236]"
              style={{ width: `${(value / max) * 100}%` }}
            />
          </div>
        </div>
      ))}
    </div>
  );
}

export default function ManagerDashboard() {
  const navigate = useNavigate();

  const [leads, setLeads] = useState([]);
  const [followUps, setFollowUps] = useState([]);
  const [executives, setExecutives] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState("");
  const [lastUpdated, setLastUpdated] = useState(null);

  const loadDashboard = async (isRefresh = false) => {
    try {
      setError("");
      if (isRefresh) setRefreshing(true);
      else setLoading(true);

      const [leadResponse, executiveResponse, followupResponse] =
        await Promise.all([
          apiGet("/api/manager/leads?type=ALL"),
          apiGet("/api/manager/leads/executives"),
          apiGet("/api/manager/leads/follow-ups"),
        ]);

      setLeads(Array.isArray(leadResponse?.leads) ? leadResponse.leads : []);
      setExecutives(
        Array.isArray(executiveResponse?.executives)
          ? executiveResponse.executives
          : []
      );
      // The manager follow-up API is expected to return `followUps`.
      // Keep `leads` as a compatibility fallback because older versions
      // of the follow-up controller returned the formatted rows as `leads`.
      const followUpRows = Array.isArray(followupResponse?.followUps)
        ? followupResponse.followUps
        : Array.isArray(followupResponse?.leads)
          ? followupResponse.leads
          : [];

      setFollowUps(followUpRows);
      setLastUpdated(new Date());
    } catch (err) {
      console.error("Manager dashboard error:", err);
      setError(err?.message || "Unable to load manager dashboard.");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    loadDashboard();

    const timer = setInterval(() => {
      loadDashboard(true);
    }, 60000);

    return () => clearInterval(timer);
  }, []);

  const openFollowUps = (status = "ALL") => {
    // Existing sidebar route confirmed by the current manager navigation.
    // The Follow-Ups page fetches the detailed follow-up data itself.
    navigate("/manager-follow-ups", {
      state: { filter: status },
    });
  };

  const openLead = (leadId) => {
    if (!leadId) return;
    navigate(`/leads/${leadId}`);
  };

  const stats = useMemo(() => {
    const counts = { NEW: 0, HOT: 0, WARM: 0, COLD: 0 };

    leads.forEach((lead) => {
      const status = getLeadStatus(lead);
      if (status in counts) counts[status] += 1;
    });

    const enrolled = leads.filter(
      (lead) => String(lead?.latestRemark || "").toUpperCase() === "ENROLLED"
    ).length;

    const followupCounts = followUps.reduce(
      (acc, item) => {
        const status = String(item?.followUpStatus || "").toUpperCase();
        if (status in acc) acc[status] += 1;
        return acc;
      },
      { TODAY: 0, COMPLETED: 0, UPCOMING: 0, MISSED: 0 }
    );

    const sourceCounts = leads.reduce((acc, lead) => {
      const source = lead?.leadSource || "Not specified";
      acc[source] = (acc[source] || 0) + 1;
      return acc;
    }, {});

    return {
      counts,
      enrolled,
      followupCounts,
      sourceCounts,
    };
  }, [leads, followUps]);

  const upcomingFollowups = useMemo(
    () =>
      [...followUps]
        .filter((item) =>
          ["TODAY", "UPCOMING", "MISSED"].includes(
            String(item?.followUpStatus || "").toUpperCase()
          )
        )
        .sort(
          (a, b) =>
            new Date(a?.displayFollowUpAt || a?.followUpAt || 0) -
            new Date(b?.displayFollowUpAt || b?.followUpAt || 0)
        )
        .slice(0, 5),
    [followUps]
  );

  if (loading) {
    return (
      <div className="min-h-full bg-slate-50 p-5 md:p-7">
        <div className="mx-auto max-w-[1700px] animate-pulse space-y-6">
          <div className="h-28 rounded-[28px] bg-white" />
          <div className="grid grid-cols-2 gap-4 xl:grid-cols-5">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="h-32 rounded-[24px] bg-white" />
            ))}
          </div>
          <div className="grid gap-6 xl:grid-cols-[1.35fr_0.85fr]">
            <div className="h-[390px] rounded-[28px] bg-white" />
            <div className="h-[390px] rounded-[28px] bg-white" />
          </div>
        </div>
      </div>
    );
  }

  return (
    <main className="min-h-full bg-slate-50 p-4 md:p-6 xl:p-7">
      <div className="mx-auto max-w-[1700px] space-y-6">
        {/* Dashboard hero */}
        <section className="relative overflow-hidden rounded-[30px] bg-[#102236] p-6 text-white shadow-[0_25px_80px_rgba(0,0,0,0.18)] md:p-8">
          <div className="absolute -right-24 -top-28 h-72 w-72 rounded-full bg-[#FECA42]/15 blur-3xl" />
          <div className="absolute -bottom-28 left-1/3 h-64 w-64 rounded-full bg-cyan-400/10 blur-3xl" />

          <div className="relative flex flex-col justify-between gap-6 lg:flex-row lg:items-end">
            <div>
              <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/10 px-3 py-1.5 text-[10px] font-bold uppercase tracking-[0.16em] text-white/70">
                <span className="h-1.5 w-1.5 rounded-full bg-[#FECA42]" />
                Manager overview
              </div>

              <h1 className="max-w-3xl text-3xl font-black tracking-tight md:text-4xl">
                Your team at a glance.
              </h1>

              <p className="mt-2 max-w-2xl text-sm leading-6 text-white/60">
                Live lead pipeline, follow-up workload and team activity in one
                clean view.
              </p>
            </div>

            <div className="flex items-center gap-3">
              <div className="rounded-2xl border border-white/10 bg-white/10 px-4 py-3">
                <p className="text-[10px] font-bold uppercase tracking-[0.12em] text-white/40">
                  Last synced
                </p>
                <p className="mt-1 text-sm font-bold">
                  {lastUpdated
                    ? lastUpdated.toLocaleTimeString("en-IN", {
                        hour: "2-digit",
                        minute: "2-digit",
                      })
                    : "—"}
                </p>
              </div>

              <button
                type="button"
                onClick={() => loadDashboard(true)}
                disabled={refreshing}
                className="inline-flex items-center gap-2 rounded-2xl bg-[#FECA42] px-4 py-3 text-sm font-black text-[#102236] transition hover:bg-[#ffdb6c] disabled:cursor-not-allowed disabled:opacity-60"
              >
                <span className={refreshing ? "animate-spin" : ""}>
                  <Icon name="refresh" size={17} />
                </span>
                Refresh
              </button>
            </div>
          </div>
        </section>

        {error && (
          <div className="flex items-start gap-3 rounded-2xl border border-rose-100 bg-rose-50 px-4 py-3 text-sm text-rose-700">
            <Icon name="alert" size={18} />
            <div>
              <p className="font-bold">Dashboard data could not be loaded.</p>
              <p className="mt-0.5 text-xs">{error}</p>
            </div>
          </div>
        )}

        {/* KPI cards */}
        <section className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-5">
          <StatCard
            title="Total Leads"
            value={leads.length}
            subtitle="Manager + executive leads"
            icon="users"
            tone="navy"
            onClick={() => navigate("/manager-leads")}
          />
          <StatCard
            title="New Leads"
            value={stats.counts.NEW}
            subtitle="Fresh pipeline"
            icon="userPlus"
            tone="blue"
            onClick={() => navigate("/manager-leads")}
          />
          <StatCard
            title="Hot Leads"
            value={stats.counts.HOT}
            subtitle="High priority"
            icon="flame"
            tone="red"
            onClick={() => navigate("/manager-leads")}
          />
          <StatCard
            title="Warm Leads"
            value={stats.counts.WARM}
            subtitle="Active opportunities"
            icon="trend"
            tone="gold"
            onClick={() => navigate("/manager-leads")}
          />
          <StatCard
            title="Enrolled"
            value={stats.enrolled}
            subtitle="Latest remark = enrolled"
            icon="check"
            tone="green"
            onClick={() => navigate("/manager-leads")}
          />
        </section>

        {/* Main charts */}
        <section className="grid gap-6 xl:grid-cols-[1.35fr_0.85fr]">
          <div className="rounded-[28px] border border-slate-100 bg-white p-5 shadow-[0_10px_35px_rgba(15,23,42,0.05)] md:p-6">
            <div className="mb-7 flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
              <div>
                <p className="text-[11px] font-bold uppercase tracking-[0.15em] text-[#d09f12]">
                  Lead pipeline
                </p>
                <h2 className="mt-1 text-xl font-black text-slate-900">
                  Lead distribution
                </h2>
                <p className="mt-1 text-xs text-slate-400">
                  Current status mix across your manager team.
                </p>
              </div>

              <div className="flex items-center gap-2 rounded-xl bg-slate-50 px-3 py-2 text-xs font-semibold text-slate-500">
                <Icon name="layers" size={15} />
                {formatNumber(leads.length)} total
              </div>
            </div>

            <PipelineChart counts={stats.counts} />
          </div>

          <div className="rounded-[28px] border border-slate-100 bg-white p-5 shadow-[0_10px_35px_rgba(15,23,42,0.05)] md:p-6">
            <div className="mb-7 flex items-start justify-between gap-3">
              <div>
                <p className="text-[11px] font-bold uppercase tracking-[0.15em] text-[#d09f12]">
                  Follow-up tower
                </p>
                <h2 className="mt-1 text-xl font-black text-slate-900">
                  Follow-up command center
                </h2>
                <p className="mt-1 text-xs text-slate-400">
                  Status calculated by the current backend follow-up logic.
                </p>
              </div>
              <button
                type="button"
                onClick={() => openFollowUps("ALL")}
                className="inline-flex shrink-0 items-center gap-1.5 rounded-xl bg-[#102236] px-3 py-2 text-xs font-bold text-white transition hover:bg-[#18344d]"
              >
                Open details
                <Icon name="arrow" size={14} />
              </button>
            </div>

            <FollowupTower followUps={followUps} />
          </div>
        </section>

        {/* Source + upcoming */}
        <section className="grid gap-6 xl:grid-cols-[0.9fr_1.1fr]">
          <div className="rounded-[28px] border border-slate-100 bg-white p-5 shadow-[0_10px_35px_rgba(15,23,42,0.05)] md:p-6">
            <div className="mb-7">
              <p className="text-[11px] font-bold uppercase tracking-[0.15em] text-[#d09f12]">
                Acquisition
              </p>
              <h2 className="mt-1 text-xl font-black text-slate-900">
                Lead sources
              </h2>
              <p className="mt-1 text-xs text-slate-400">
                Where your current leads are coming from.
              </p>
            </div>

            <SourceBars sourceCounts={stats.sourceCounts} />
          </div>

          <div className="rounded-[28px] border border-slate-100 bg-white p-5 shadow-[0_10px_35px_rgba(15,23,42,0.05)] md:p-6">
            <div className="mb-5 flex items-center justify-between gap-3">
              <div>
                <p className="text-[11px] font-bold uppercase tracking-[0.15em] text-[#d09f12]">
                  Attention
                </p>
                <h2 className="mt-1 text-xl font-black text-slate-900">
                  Follow-ups needing attention
                </h2>
              </div>

              <div className="rounded-xl bg-rose-50 px-3 py-2 text-xs font-bold text-rose-600">
                {formatNumber(stats.followupCounts.MISSED)} missed
              </div>
            </div>

            <div className="space-y-2">
              {upcomingFollowups.length ? (
                upcomingFollowups.map((item) => {
                  const meta =
                    FOLLOWUP_META[
                      String(item.followUpStatus || "").toUpperCase()
                    ] || FOLLOWUP_META.UPCOMING;

                  return (
                    <button
                      type="button"
                      key={item._id || item.id}
                      onClick={() => openLead(item.leadId || item?._id || item?.lead?._id)}
                      className="flex w-full items-center gap-3 rounded-2xl border border-slate-100 p-3 text-left transition hover:-translate-y-0.5 hover:border-slate-200 hover:bg-slate-50 focus:outline-none"
                    >
                      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-[#102236]">
                        <Icon
                          name={
                            String(item.followUpStatus).toUpperCase() ===
                            "MISSED"
                              ? "alert"
                              : "calendar"
                          }
                          size={17}
                        />
                      </div>

                      <div className="min-w-0 flex-1">
                        <p className="truncate text-sm font-bold text-slate-800">
                          {getLeadName(item)}
                        </p>
                        <p className="truncate text-[11px] text-slate-400">
                          {getOwnerName(item)} ·{" "}
                          {formatDate(
                            item.displayFollowUpAt || item.followUpAt,
                            true
                          )}
                        </p>
                      </div>

                      <span
                        className={`rounded-full px-2.5 py-1 text-[10px] font-bold ${meta.className}`}
                      >
                        {meta.label}
                      </span>
                    </button>
                  );
                })
              ) : (
                <div className="flex min-h-40 flex-col items-center justify-center rounded-2xl bg-slate-50 text-center">
                  <div className="rounded-2xl bg-white p-3 text-emerald-600 shadow-sm">
                    <Icon name="check" size={20} />
                  </div>
                  <p className="mt-3 text-sm font-bold text-slate-700">
                    No active follow-ups
                  </p>
                  <p className="mt-1 text-xs text-slate-400">
                    Your follow-up queue is clear.
                  </p>
                </div>
              )}
            </div>
          </div>
        </section>

        {/* Team + programs */}
        <section className="grid gap-6 xl:grid-cols-[1.2fr_0.8fr]">
          <div className="rounded-[28px] border border-slate-100 bg-white p-5 shadow-[0_10px_35px_rgba(15,23,42,0.05)] md:p-6">
            <div className="mb-5 flex items-end justify-between gap-3">
              <div>
                <p className="text-[11px] font-bold uppercase tracking-[0.15em] text-[#d09f12]">
                  Team
                </p>
                <h2 className="mt-1 text-xl font-black text-slate-900">
                  Executive performance
                </h2>
              </div>
              <span className="text-xs font-semibold text-slate-400">
                {formatNumber(executives.length)} executives
              </span>
            </div>

            <TeamPerformance leads={leads} executives={executives} />
          </div>

          <div className="rounded-[28px] border border-slate-100 bg-white p-5 shadow-[0_10px_35px_rgba(15,23,42,0.05)] md:p-6">
            <div className="mb-6">
              <p className="text-[11px] font-bold uppercase tracking-[0.15em] text-[#d09f12]">
                Programs
              </p>
              <h2 className="mt-1 text-xl font-black text-slate-900">
                Interest breakdown
              </h2>
            </div>

            <ProgramCard leads={leads} />

            <div className="mt-7 rounded-2xl bg-[#102236] p-4 text-white">
              <div className="flex items-center gap-3">
                <div className="rounded-xl bg-[#FECA42] p-2 text-[#102236]">
                  <Icon name="target" size={18} />
                </div>
                <div>
                  <p className="text-xs font-bold text-white/50">
                    Pipeline focus
                  </p>
                  <p className="text-sm font-bold">
                    {formatNumber(stats.counts.HOT)} hot leads need priority.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Recent leads */}
        <section className="rounded-[28px] border border-slate-100 bg-white p-5 shadow-[0_10px_35px_rgba(15,23,42,0.05)] md:p-6">
          <div className="mb-5 flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
            <div>
              <p className="text-[11px] font-bold uppercase tracking-[0.15em] text-[#d09f12]">
                Activity
              </p>
              <h2 className="mt-1 text-xl font-black text-slate-900">
                Recent leads
              </h2>
            </div>

            <div className="flex items-center gap-2 text-xs font-semibold text-slate-400">
              <Icon name="calendar" size={14} />
              Live manager/team data
            </div>
          </div>

          <RecentLeads leads={leads} />
        </section>
      </div>
    </main>
  );
}
