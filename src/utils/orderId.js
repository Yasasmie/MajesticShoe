// src/utils/orderId.js
export function formatOrderRef(id) {
  if (!id) return "UNKNOWN";
  return `#${id.slice(-8).toUpperCase()}`;
}
