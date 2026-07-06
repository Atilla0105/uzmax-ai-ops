export function TenantHtmlTable({
  onManageUnavailable,
  runtimeBoundary
}: {
  onManageUnavailable: () => void;
  runtimeBoundary: string;
}) {
  return (
    <section
      aria-label="租户列表"
      className="uz-tenant-table-panel"
      data-testid="m7-tenant-table-panel"
    >
      <table className="uz-tenant-table">
        <tbody>
          <tr>
            <td className="uz-tenant-management-cell">
              <button
                aria-description={runtimeBoundary}
                className="uz-tenant-link-action"
                data-runtime-boundary={runtimeBoundary}
                data-testid="m7-tenant-manage-placeholder"
                onClick={onManageUnavailable}
                title={runtimeBoundary}
                type="button"
              >
                管理
              </button>
            </td>
          </tr>
        </tbody>
      </table>
    </section>
  );
}
