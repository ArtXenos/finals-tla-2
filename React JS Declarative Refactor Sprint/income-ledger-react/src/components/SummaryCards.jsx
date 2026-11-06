import { formatPeso } from "../utils/format.js";

/**
 * Three totals across ALL categories. Everything here is computed from the
 * categories prop on each render; nothing is stored in state.
 */
export default function SummaryCards({ categories }) {
  const monthlyTotal = categories.reduce((sum, c) => sum + c.amount, 0);
  const topCategory = categories.reduce(
    (top, c) => (top === null || c.amount > top.amount ? c : top),
    null
  );

  const cards = [
    { label: "Expected Monthly Income", value: formatPeso(monthlyTotal), highlight: true },
    { label: "Projected Yearly Income", value: formatPeso(monthlyTotal * 12) },
    {
      label: "Top Income Source",
      value: topCategory ? topCategory.name : "—",
      note: topCategory ? `${formatPeso(topCategory.amount)} / month` : "No categories yet",
    },
  ];

  return (
    <section className="row g-3 mb-4" aria-label="Income summary">
      {cards.map((card) => (
        <div className="col-md-4" key={card.label}>
          <div className={`card border-0 shadow-sm h-100 summary-card${card.highlight ? " summary-card-highlight" : ""}`}>
            <div className="card-body">
              <p className="summary-label mb-1">{card.label}</p>
              <p className="summary-value mb-0 text-truncate" title={card.value}>
                {card.value}
              </p>
              {card.note && <p className="summary-note mb-0">{card.note}</p>}
            </div>
          </div>
        </div>
      ))}
    </section>
  );
}
