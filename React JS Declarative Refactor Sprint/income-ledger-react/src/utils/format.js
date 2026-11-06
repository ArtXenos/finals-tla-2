// Display helpers. They only turn values into text; they never change state.

const pesoFormatter = new Intl.NumberFormat("en-PH", {
  style: "currency",
  currency: "PHP",
});

const dateFormatter = new Intl.DateTimeFormat("en-PH", {
  dateStyle: "medium",
  timeStyle: "short",
});

// 15000.5 -> "₱15,000.50"
export const formatPeso = (amount) => pesoFormatter.format(amount);

// 1762422000000 -> "Nov 6, 2026, 5:40 PM"
export const formatDate = (timestamp) => dateFormatter.format(new Date(timestamp));
