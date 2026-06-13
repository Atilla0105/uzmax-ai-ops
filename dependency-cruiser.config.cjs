module.exports = {
  forbidden: [
    {
      name: "admin-no-backend-imports",
      severity: "error",
      from: { path: "^apps/admin" },
      to: {
        path: "^(apps/(api|worker|cron)|packages/(db|authz|channels|engine|capabilities|ops-assets|llm-gateway|memory|distill|evals))"
      }
    },
    {
      name: "authz-no-runtime-domain-deps",
      severity: "error",
      from: { path: "^packages/authz" },
      to: { path: "^packages/(capabilities|engine|channels)" }
    },
    {
      name: "engine-no-channel-imports",
      severity: "error",
      from: { path: "^packages/engine" },
      to: { path: "^packages/channels" }
    },
    {
      name: "capabilities-no-engine-or-channel-imports",
      severity: "error",
      from: { path: "^packages/capabilities" },
      to: { path: "^packages/(engine|channels)" }
    },
    {
      name: "memory-no-channel-imports",
      severity: "error",
      from: { path: "^packages/memory" },
      to: { path: "^packages/channels" }
    }
  ],
  options: {
    doNotFollow: {
      path: "node_modules"
    },
    enhancedResolveOptions: {
      extensions: [".ts", ".tsx", ".js", ".jsx", ".json"]
    },
    includeOnly: "^(apps|packages)"
  }
};
