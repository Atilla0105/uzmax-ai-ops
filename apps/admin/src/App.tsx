import "@uzmax/ui-tokens/tokens.css";
import "./styles.css";

export function App() {
  return (
    <main className="app-shell" data-testid="design-harness">
      <section className="status-band" aria-labelledby="m0-title">
        <p className="eyebrow">M0-01</p>
        <h1 id="m0-title">UZMAX Admin</h1>
        <p className="status-text">Design harness ready</p>
      </section>
    </main>
  );
}
