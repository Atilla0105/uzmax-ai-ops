import type { ReactNode } from "react";

export function Rows({
  fixed,
  rows,
  set,
  suffix
}: {
  fixed?: string;
  rows: readonly { cap?: string; editable?: boolean; k: string; v: string }[];
  set: (index: number, value: string) => void;
  suffix?: string;
}) {
  return (
    <section className="uz-config-panel uz-config-stack">
      {rows.map((r, i) => (
        <div className="uz-config-row" key={r.k}>
          <div className="uz-config-row-main">
            <div className="uz-config-row-title">{r.k}</div>
            {r.editable === false ? (
              <div className="uz-config-row-sub">集团层设置 · 只读</div>
            ) : null}
          </div>
          {r.editable === false ? (
            <strong className="is-mono">¥{r.v}</strong>
          ) : (
            <Num set={(v) => set(i, v)} v={r.v} />
          )}
          {r.cap ? (
            <span className="uz-config-muted">
              / ¥{r.cap} {suffix}
            </span>
          ) : null}
        </div>
      ))}
      {fixed ? (
        <div className="uz-config-row">
          <strong>{fixed}</strong>
        </div>
      ) : null}
    </section>
  );
}

export function MiniTable({
  cols,
  rows
}: {
  cols: readonly string[];
  rows: readonly ReactNode[][];
}) {
  return (
    <section className="uz-config-panel">
      <div className="uz-config-table-wrap">
        <table className="uz-config-table">
          <thead>
            <tr>
              {cols.map((c) => (
                <th key={c}>{c}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((row, i) => (
              <tr key={i}>
                {row.map((cell, j) => (
                  <td className={j ? "is-mono" : "is-strong"} key={j}>
                    {cell}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}

export function Field({ children, label }: { children: ReactNode; label: string }) {
  return (
    <div className="uz-config-field">
      <label>{label}</label>
      {children}
    </div>
  );
}

export function Sel({
  opts,
  set,
  v
}: {
  opts: readonly string[];
  set: (v: string) => void;
  v: string;
}) {
  return (
    <select onChange={(e) => set(e.currentTarget.value)} value={v}>
      {opts.map((o) => (
        <option key={o}>{o}</option>
      ))}
    </select>
  );
}

export function Num({ set, v }: { set: (v: string) => void; v: string }) {
  return <input onChange={(e) => set(e.currentTarget.value)} type="number" value={v} />;
}

export function Kv({ k, v }: { k: string; v: string }) {
  return (
    <div className="uz-config-kv">
      <span>{k}</span>
      <strong>{v}</strong>
    </div>
  );
}
