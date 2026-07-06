export type ConfigViewState = "degraded" | "empty" | "error" | "loading" | "permission";
export type ConfigSection = "biz" | "sla" | "channel" | "connector";
export type ConfigVersion = { at: string; by: string; note?: string; ver: number };
export type ConfigConnector = {
  apiHealth: string;
  lastError: string;
  lastSync: string;
  mode: "api" | "import";
};
export type ConfigDraft = {
  biz: Record<"cap" | "handoffChannel" | "lang" | "timezone", string>;
  channels: Array<
    Record<"desc" | "id" | "lastTest" | "name" | "status", string> & {
      enabled: boolean;
    }
  >;
  connector: ConfigConnector;
  sla: Array<Record<"first" | "id" | "label" | "resolve", string>>;
};

export const configSections =
  "biz|业务配置;sla|SLA;channel|渠道配置;connector|订单 connector"
    .split(";")
    .map((row) => row.split("|")) as [ConfigSection, string][];
export const configSectionLabels = Object.fromEntries(configSections) as Record<
  ConfigSection,
  string
>;
export const dirtyableSections = "biz|sla|channel".split("|") as ConfigSection[];
export const configRuntimeLabels =
  "degraded|mock|read-only|browser-local only|no production config write|no dangerous action execution|no connector switch|no audit write|no DB/API/authz/RLS".split(
    "|"
  );
export const configSourceSummary =
  "owner HTML / unpacked 6 config source; sanitized centralized fallback";
export const selectOptions = {
  handoff: ["Telegram 人工组", "WhatsApp 值班组", "邮件工单组"],
  lang: ["乌兹别克语（拉丁）", "乌兹别克语（西里尔）", "俄语", "中文", "英语"],
  timezone: ["UTC+5 塔什干", "UTC+3 莫斯科", "UTC+8 北京"]
} as const;
const channels = [
  "tg_bot|Telegram Bot|标准机器人渠道 · AI 自动发送|true|正常|06-29 09:00",
  "tg_biz|Telegram Business|人工号双轨 · AI 生成草稿，需人工确认发送|true|正常|06-28 17:20"
].map((row) => {
  const cells = row.split("|");
  return {
    desc: cell(cells, 2),
    enabled: cell(cells, 3) === "true",
    id: cell(cells, 0),
    lastTest: cell(cells, 5),
    name: cell(cells, 1),
    status: cell(cells, 4)
  };
});

export const initialDraft: ConfigDraft = {
  biz: {
    cap: "8",
    handoffChannel: "Telegram 人工组",
    lang: "乌兹别克语（拉丁）",
    timezone: "UTC+5 塔什干"
  },
  channels,
  connector: { apiHealth: "正常", lastError: "无", lastSync: "2 分钟前", mode: "api" },
  sla: "p0|P0 · 红线 / 投诉|5|60;p1|P1 · 一般转人工|15|240;p2|P2 · 低优先级咨询|60|1440"
    .split(";")
    .map((row) => {
      const cells = row.split("|");
      return {
        first: cell(cells, 2),
        id: cell(cells, 0),
        label: cell(cells, 1),
        resolve: cell(cells, 3)
      };
    })
};
export const initialVersions = Object.fromEntries(
  "biz|3|韩雪|06-20 14:10;channel|8|李伟|06-25 16:00;connector|6|韩雪|06-22 08:40;sla|5|李伟|06-18 09:30"
    .split(";")
    .map((row) => {
      const cells = row.split("|");
      return [
        cell(cells, 0),
        { at: cell(cells, 3), by: cell(cells, 2), ver: Number(cell(cells, 1)) }
      ];
    })
) as Record<ConfigSection, ConfigVersion>;
export const initialHistory: Partial<Record<ConfigSection, ConfigVersion[]>> = {
  biz: historyRows(
    "2|韩雪|06-01 10:00|调整默认时区为塔什干;1|韩雪|05-10 09:00|初始业务配置"
  ),
  sla: historyRows("4|李伟|05-20 09:00|P0 首次响应收紧到 5 分钟")
};

export function readConfigViewState(): ConfigViewState {
  const state = new URLSearchParams(location.search).get("m7ConfigState");
  return ["empty", "error", "loading", "permission"].includes(state ?? "")
    ? (state as ConfigViewState)
    : "degraded";
}

export function configStateCopy(state: ConfigViewState) {
  return {
    degraded: `degraded / mock / read-only; ${configRuntimeLabels.slice(3).join("; ")}.`,
    empty:
      "empty fallback: no tenant config rows from runtime; browser-local only; no production config write.",
    error:
      "runtime unavailable: synthetic config state only; browser-local only; no DB/API/authz/RLS call was made.",
    loading:
      "loading tenant config skeleton: layout is stable and browser-local only; no production config write.",
    permission:
      "permission denied / locked: backend authz remains authoritative; browser-local only; no production config write; dangerous controls are not executable."
  }[state];
}

function historyRows(rows: string) {
  return rows.split(";").map((row) => {
    const cells = row.split("|");
    return {
      at: cell(cells, 2),
      by: cell(cells, 1),
      note: cell(cells, 3),
      ver: Number(cell(cells, 0))
    };
  });
}

function cell(cells: string[], index: number) {
  return cells[index] ?? "";
}

export const configStyles = `.uz-config-page{display:flex;width:100%;height:100%;min-width:0;min-height:0;overflow:hidden;background:var(--paper);color:var(--ink-900);font-family:var(--font-body)}.uz-config-layout{display:flex;width:100%;min-width:0;min-height:0;flex:1}.uz-config-page *{box-sizing:border-box}.uz-config-side{width:236px;flex:none;overflow:auto;border-right:1px solid var(--ink-150);background:var(--card);padding:14px 10px}.uz-config-side h2{margin:0 8px 12px;font:800 15px/1.3 var(--font-display)}.uz-config-nav{display:grid;gap:2px}.uz-config-nav button{display:flex;height:36px;align-items:center;border:0;border-radius:7px;background:transparent;color:var(--ink-500);cursor:pointer;font:700 13px/1 var(--font-body);padding:0 10px;text-align:left}.uz-config-nav button[aria-pressed=true],.uz-config-nav button:hover{background:var(--ink-075);color:var(--ink-900)}.uz-config-main{display:flex;min-width:0;flex:1;flex-direction:column;overflow:hidden}.uz-config-head{flex:none;border-bottom:1px solid var(--ink-150);background:var(--card);padding:14px 24px}.uz-config-head-row{display:flex;align-items:center;gap:12px;min-width:0}.uz-config-title{margin:0;font:800 16px/1.35 var(--font-display)}.uz-config-current{font:800 13px/1.3 var(--font-body)}.uz-config-meta,.uz-config-muted{color:var(--ink-500);font-size:12px;line-height:1.45}.uz-config-tools{margin-left:auto;display:flex;gap:8px;align-items:center}.uz-config-btn,.uz-config-mini,.uz-config-danger,.uz-config-link{display:inline-flex;align-items:center;justify-content:center;border:1px solid var(--ink-150);border-radius:7px;background:var(--card);color:var(--ink-700);cursor:pointer;font:800 12px/1 var(--font-body);min-height:32px;padding:0 12px}.uz-config-btn.is-primary{border-color:var(--ink-900);background:var(--ink-900);color:var(--card)}.uz-config-btn:disabled{cursor:not-allowed;opacity:var(--opacity-disabled)}.uz-config-danger{border-color:var(--state-human-border);color:var(--state-human)}.uz-config-link{border:0;background:transparent;color:var(--state-ai);padding:0}.uz-config-btn:focus-visible,.uz-config-mini:focus-visible,.uz-config-danger:focus-visible,.uz-config-link:focus-visible,.uz-config-nav button:focus-visible,.uz-config-field input:focus-visible,.uz-config-field select:focus-visible,.uz-config-switch:focus-visible{outline:0;box-shadow:var(--shadow-focus)}.uz-config-note,.uz-config-toast{display:flex;align-items:center;gap:8px;border-bottom:1px solid var(--ink-150);background:var(--card);padding:10px 24px;color:var(--ink-700);font-size:12px;line-height:1.45}.uz-config-note strong{flex:none;border-radius:5px;background:var(--state-warn-bg);color:var(--state-warn);padding:2px 8px}.uz-config-note span{min-width:0;overflow-wrap:anywhere}.uz-config-toast{border-bottom-color:var(--state-ok-border);background:var(--state-ok-bg);color:var(--state-ok);font-weight:800}.uz-config-body{display:grid;gap:16px;min-height:0;overflow:auto;padding:18px 24px 24px}.uz-config-body>.uz-config-muted{margin:0}.uz-config-history,.uz-config-panel{overflow:hidden;border:1px solid var(--ink-150);border-radius:10px;background:var(--card)}.uz-config-history-head{border-bottom:1px solid var(--ink-075);padding:11px 15px;color:var(--ink-500);font-size:12px;font-weight:800}.uz-config-history-row,.uz-config-row{display:flex;align-items:center;gap:12px;border-bottom:1px solid var(--ink-075);padding:10px 15px}.uz-config-history-row:last-child,.uz-config-row:last-child{border-bottom:0}.uz-config-version{width:44px;flex:none;color:var(--ink-700);font:800 12px/1 var(--font-data)}.uz-config-grid{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:16px;padding:18px;max-width:680px}.uz-config-field{display:grid;gap:6px}.uz-config-field label,.uz-config-table th{color:var(--ink-500);font-size:11px;font-weight:800}.uz-config-field input,.uz-config-field select{width:100%;min-height:34px;border:1px solid var(--ink-150);border-radius:7px;background:var(--card);color:var(--ink-900);font:700 13px/1 var(--font-body);padding:0 10px}.uz-config-field input{font-family:var(--font-data)}.uz-config-table-wrap{max-width:100%;overflow:auto}.uz-config-table{width:100%;min-width:680px;border-collapse:collapse;font-size:13px}.uz-config-table th{background:var(--paper);border-bottom:1px solid var(--ink-150);padding:10px 14px;text-align:left}.uz-config-table td{border-bottom:1px solid var(--ink-075);padding:10px 14px;color:var(--ink-700);vertical-align:middle}.is-mono{font-family:var(--font-data)}.is-strong{color:var(--ink-900);font-weight:800}.uz-config-stack{display:grid;max-width:720px}.uz-config-row-main{min-width:0;flex:1}.uz-config-row-title{font-weight:800;font-size:13px}.uz-config-row-sub{margin-top:3px;color:var(--ink-500);font-size:12px;line-height:1.4}.uz-config-switch{width:40px;height:22px;border:1px solid var(--ink-150);border-radius:var(--radius-pill);background:var(--ink-075);padding:2px;cursor:pointer}.uz-config-switch span{display:block;width:16px;height:16px;border-radius:var(--radius-pill);background:var(--ink-500);transition:transform var(--duration-fast) var(--ease-out)}.uz-config-switch[aria-pressed=true]{background:var(--state-ok-bg);border-color:var(--state-ok-border)}.uz-config-switch[aria-pressed=true] span{background:var(--state-ok);transform:translateX(16px)}.uz-config-connector{display:grid;max-width:580px;gap:12px;padding:18px}.uz-config-kv{display:flex;justify-content:space-between;gap:16px;font-size:13px}.uz-config-kv span:first-child{color:var(--ink-500)}.uz-config-kv strong{font-family:var(--font-data)}.uz-config-actions{display:flex;gap:8px;flex-wrap:wrap;border-top:1px solid var(--ink-075);padding-top:12px}.uz-config-state{display:grid;min-height:260px;place-items:center;padding:24px;text-align:center}.uz-config-state div{max-width:580px;border:1px solid var(--ink-150);border-radius:8px;background:var(--card);padding:20px}.uz-config-state h2{margin:0 0 8px;font-size:16px}.uz-config-state p{margin:0;color:var(--ink-700);font-size:13px;line-height:1.55}@media(min-width:901px){.uz-config-page{width:calc(100vw - var(--nav-expanded-width));max-width:calc(100vw - var(--nav-expanded-width))}.uz-app-shell.is-nav-collapsed .uz-config-page{width:calc(100vw - var(--nav-collapsed-width));max-width:calc(100vw - var(--nav-collapsed-width))}}@media(max-width:820px){.uz-config-page{display:block;width:100vw;max-width:100vw;overflow:auto}.uz-config-layout{display:block}.uz-config-side{width:auto;border-right:0;border-bottom:1px solid var(--ink-150);padding:10px 12px}.uz-config-side h2{margin:0 0 8px}.uz-config-nav{display:flex;overflow-x:auto;padding-bottom:2px}.uz-config-nav button{flex:0 0 auto}.uz-config-main{overflow:visible}.uz-config-head,.uz-config-note,.uz-config-toast,.uz-config-body{padding-left:12px;padding-right:12px}.uz-config-head-row{align-items:flex-start;flex-direction:column;gap:6px}.uz-config-note{display:grid;align-items:start;gap:6px}.uz-config-note strong{width:fit-content;max-width:100%}.uz-config-body>.uz-config-muted{display:none}.uz-config-tools{width:100%;margin-left:0;flex-wrap:wrap}.uz-config-grid{grid-template-columns:1fr;padding:14px}.uz-config-table{min-width:560px}.uz-config-row,.uz-config-history-row{align-items:flex-start;display:grid}.uz-config-actions,.uz-config-btn,.uz-config-danger,.uz-config-mini{width:100%}.uz-config-kv{display:grid}.uz-config-version{width:auto}}@media(max-width:420px){.uz-config-body{gap:12px;padding-top:12px}.uz-config-table{min-width:520px}.uz-config-title{font-size:15px}.uz-config-meta{overflow-wrap:anywhere}.uz-config-nav button{height:34px}}`;
