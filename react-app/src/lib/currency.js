export function formatMoney(value, currency, rate) {
  if (currency === "USD") {
    const converted = Math.round(value / rate);
    return `USD ${converted.toLocaleString("en-US")}`;
  }

  return `ARS ${value.toLocaleString("es-AR")}`;
}

export async function fetchUsdRate() {
  const response = await fetch("https://api.frankfurter.dev/v1/latest?base=USD&symbols=ARS");

  if (!response.ok) {
    throw new Error(`HTTP ${response.status}`);
  }

  const data = await response.json();
  const rate = Number(data?.rates?.ARS);

  if (!Number.isFinite(rate) || rate <= 0) {
    throw new Error("Invalid rate");
  }

  return rate;
}
