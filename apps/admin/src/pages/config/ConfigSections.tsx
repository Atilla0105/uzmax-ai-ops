import type { ReactNode } from "react";
import { StatusBadge } from "../../primitives";
import {
  routeColumns,
  routeRows,
  selectOptions,
  templateRows,
  useConfigPageState,
  type ConfigConnector,
  type ConfigDraft,
  type ConfigSection
} from "./configFallback";
import { Field, Kv, MiniTable, Num, Rows, Sel } from "./ConfigInputs";

export type ConfigPageState = ReturnType<typeof useConfigPageState>;

type ViewProps = {
  connectorSwitch: (mode: ConfigConnector["mode"]) => void;
  draft: ConfigDraft;
  state: ConfigPageState;
};

export const sectionViews: Record<ConfigSection, (props: ViewProps) => ReactNode> = {
  biz: ({ draft, state }) => (
    <section className="uz-config-panel uz-config-grid">
      <Field label="默认语言">
        <Sel
          opts={selectOptions.lang}
          set={(v) => state.update.biz("lang", v)}
          v={draft.biz.lang}
        />
      </Field>
      <Field label="默认时区">
        <Sel
          opts={selectOptions.timezone}
          set={(v) => state.update.biz("timezone", v)}
          v={draft.biz.timezone}
        />
      </Field>
      <Field label="转人工兜底渠道">
        <Sel
          opts={selectOptions.handoff}
          set={(v) => state.update.biz("handoffChannel", v)}
          v={draft.biz.handoffChannel}
        />
      </Field>
      <Field label="单成员接待上限">
        <Num set={(v) => state.update.biz("cap", v)} v={draft.biz.cap} />
      </Field>
    </section>
  ),
  breaker: ({ draft, state }) => (
    <Rows
      fixed="AllProvidersDown · 立即熔断 · 固定策略"
      rows={draft.breakers}
      set={state.update.breaker}
    />
  ),
  channel: ({ draft, state }) => (
    <section className="uz-config-stack">
      {draft.channels.map((c) => (
        <article className="uz-config-panel uz-config-row" key={c.id}>
          <div className="uz-config-row-main">
            <div className="uz-config-row-title">{c.name}</div>
            <div className="uz-config-row-sub">
              {c.desc} · 最近测试 {c.lastTest} · 状态 {c.status}
            </div>
          </div>
          <button
            className="uz-config-mini"
            onClick={() => state.update.channelTest(c.id)}
            type="button"
          >
            测试连接
          </button>
          <button
            aria-pressed={c.enabled}
            className="uz-config-switch"
            onClick={() => state.update.channelToggle(c.id)}
            type="button"
          >
            <span />
          </button>
          <StatusBadge tone={c.enabled ? "ok" : "neutral"}>
            {c.enabled ? "已启用" : "已停用"}
          </StatusBadge>
        </article>
      ))}
    </section>
  ),
  connector: ({ connectorSwitch, draft, state }) => {
    const c = draft.connector;
    const isApi = c.mode === "api";
    return (
      <section className="uz-config-panel uz-config-connector">
        <Kv k="当前主路径" v={isApi ? "订单 API（主路径）" : "导入快照（主路径）"} />
        <Kv k="订单 API 健康度" v={c.apiHealth} />
        <Kv k="最近错误" v={c.lastError} />
        <Kv k="最近同步" v={c.lastSync} />
        <div className="uz-config-actions">
          <button
            className="uz-config-mini"
            onClick={state.update.connectorTest}
            type="button"
          >
            测试连接
          </button>
          <button
            className="uz-config-danger"
            onClick={() => connectorSwitch(isApi ? "import" : "api")}
            type="button"
          >
            {isApi ? "切换为导入快照主路径" : "切换回订单 API 主路径"}
          </button>
          <button className="uz-config-link" type="button">
            查看导入历史 →
          </button>
        </div>
      </section>
    );
  },
  cost: ({ draft, state }) => (
    <Rows rows={draft.guardrails} set={state.update.guard} suffix="集团上限" />
  ),
  model: () => <MiniTable cols={routeColumns} rows={routeRows} />,
  sla: ({ draft, state }) => (
    <MiniTable
      cols={["优先级", "首次响应（分钟）", "解决时限（分钟）"]}
      rows={draft.sla.map((r) => [
        r.label,
        <Num key="first" set={(v) => state.update.sla(r.id, "first", v)} v={r.first} />,
        <Num
          key="resolve"
          set={(v) => state.update.sla(r.id, "resolve", v)}
          v={r.resolve}
        />
      ])}
    />
  ),
  tmpl: () => (
    <MiniTable
      cols={["模板名", "本地版本", "来源版本", "复制时间", "状态", "操作"]}
      rows={templateRows.map((r) => [...r, r[4] === "有更新" ? "同步更新" : "查看"])}
    />
  )
};

export function versionCopy(state: ConfigPageState) {
  return state.section === "tmpl"
    ? "来自集团模板中心 · 独立版本"
    : `${state.version.by} 修改于 ${state.version.at}`;
}
