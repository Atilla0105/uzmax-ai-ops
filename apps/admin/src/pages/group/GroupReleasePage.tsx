import { Rocket } from "lucide-react";
import { Button, IconSlot, StatusBadge } from "../../primitives";
import { DegradedBar } from "../../patterns";
import {
  ReadOnlyChecklistBox,
  ReleaseStyles,
  checklistStatus,
  gateBlockerLabel,
  gateOwnerLabel,
  gateVisualTitle,
  gaChecklist,
  releaseGates,
  releaseViewStateFromSearch,
  renderReleaseState,
  severityRollup,
  stateBadge
} from "./GroupReleaseSupport";

export function GroupReleasePage() {
  const viewState = releaseViewStateFromSearch();
  const blockingState = renderReleaseState(viewState);
  const accepted = releaseGates.filter((gate) => gate.state === "Accepted").length;
  const closed = releaseGates.filter((gate) => gate.state === "Closed").length;
  const locked = releaseGates.filter(
    (gate) => gate.state === "Locked" || gate.state === "Blocked"
  ).length;

  return (
    <section className="uz-release-page" data-testid="m7-release-acceptance-page">
      <ReleaseStyles />
      <header className="uz-release-header">
        <div className="uz-release-heading">
          <h1>发布与验收</h1>
          <p>里程碑闸门 · owner 验收 · 只读证据控制台</p>
        </div>
        <div className="uz-release-header-metrics" aria-label="Release summary">
          <div className="uz-release-header-metric is-ok">
            <span>已验收里程碑</span>
            <strong>
              {accepted} / {releaseGates.length}
            </strong>
          </div>
          <div className="uz-release-header-metric is-warn">
            <span>加固收口（不发布）</span>
            <strong>{closed} 项</strong>
          </div>
          <div className="uz-release-header-metric is-danger">
            <span>锁定 / 阻断</span>
            <strong>{locked} 项</strong>
          </div>
        </div>
      </header>
      <DegradedBar
        action={<Button disabled>runtime/audit contract missing</Button>}
        data-testid="m7-release-degraded"
      >
        缺少 release/acceptance runtime API、owner signoff source 和 audit-write
        path；本页只用 legacy release gate contract 做只读证据呈现。
      </DegradedBar>
      <section
        className="uz-release-mobile-fallback"
        data-testid="m7-release-mobile-fallback"
      >
        <strong>移动端只读阻断复核</strong>
        <p>
          仅展示 GA-0 / 1.0 阻断、证据引用和 owner-needed
          标记；不开闸、不发布、不写审计。
        </p>
      </section>
      {blockingState ?? <ReleaseConsole viewState={viewState} />}
    </section>
  );
}

function ReleaseConsole({ viewState }: { viewState: string }) {
  return (
    <div className="uz-release-overview">
      <div className="uz-release-main">
        <section className="uz-release-summary" data-testid="m7-release-summary">
          M5 按里程碑证据完成 owner 验收；M6
          作为证据/加固类不发布收口包已关闭；外部输入类阻断项已清空；GA-0 与 1.0
          仍处于锁定 / 阻断状态。
        </section>
        <p className="uz-release-section-label">闸门状态 · M0-M6 · GA-0 · 1.0</p>
        <section className="uz-release-gates" data-testid="m7-release-gates">
          {releaseGates.map((gate) => (
            <article
              className="uz-release-gate"
              data-testid={`m7-release-gate-${gate.gate}`}
              key={gate.gate}
            >
              <header>
                <h3>{gateVisualTitle(gate)}</h3>
                {stateBadge(gate.state)}
              </header>
              <dl>
                <div>
                  <dt>证据来源</dt>
                  <dd>{gate.source}</dd>
                </div>
                <div>
                  <dt>证据</dt>
                  <dd>
                    <a href={gate.evidenceHref}>{gate.evidenceLabel}</a>
                  </dd>
                </div>
                <div>
                  <dt>owner 签收</dt>
                  <dd>{gateOwnerLabel(gate.owner)}</dd>
                </div>
                <div>
                  <dt>阻断项</dt>
                  <dd
                    className={
                      gate.blocker === "none" ? undefined : "uz-release-gate-blocker"
                    }
                  >
                    {gateBlockerLabel(gate.blocker)}
                  </dd>
                </div>
              </dl>
            </article>
          ))}
        </section>
      </div>

      <aside className="uz-release-side">
        <section className="uz-release-checklist" data-testid="m7-release-ga0">
          <h3>GA-0 Checklist</h3>
          <div className="uz-release-checklist-subtitle">
            全部满足后方可开闸 · 开闸写操作日志
          </div>
          <div className="uz-release-checklist-list">
            {gaChecklist.map((item) => (
              <div className="uz-release-check-row" key={item.id}>
                <ReadOnlyChecklistBox item={item} />
                <div>
                  <strong>{item.label}</strong>
                  <p>{item.evidence}</p>
                </div>
                {checklistStatus(item)}
              </div>
            ))}
          </div>
          <div className="uz-release-actions-row">
            <Button disabled icon={<IconSlot icon={Rocket} />} variant="success">
              开闸 GA-0
            </Button>
          </div>
          <div className="uz-release-truthline">
            当前真实状态：L-01 checklist 未全绿，owner 尚未开闸；本页不写审计。
          </div>
          {viewState === "owner-decision-required" ? (
            <StatusBadge tone="danger">
              controlled owner-decision-required state
            </StatusBadge>
          ) : null}
        </section>
        <section className="uz-release-severity" data-testid="m7-release-severity">
          <h3>P0/P1/P2 发布分级</h3>
          <div className="uz-release-severity-list">
            {severityRollup.map((item) => (
              <div className="uz-release-severity-row" key={item.label}>
                <span className="uz-release-severity-label">{item.label}</span>
                <strong className={`uz-release-severity-value is-${item.tone}`}>
                  {item.value}
                </strong>
                <p>{item.blockers}</p>
                <p>{item.source}</p>
              </div>
            ))}
          </div>
        </section>
        <section
          className="uz-release-actions"
          data-testid="m7-release-high-risk-actions"
        >
          <strong>高风险发布动作</strong>
          <p>
            AI agents may aggregate evidence and expose blockers. Only the project owner
            can approve GA-0, accept P1 risk, approve production, or approve 1.0.
          </p>
          <div className="uz-release-actions-row">
            <Button disabled icon={<IconSlot icon={Rocket} />} variant="success">
              确认开闸 GA-0
            </Button>
            <Button disabled variant="danger">
              确认 1.0 正式发布
            </Button>
          </div>
        </section>
      </aside>
    </div>
  );
}
