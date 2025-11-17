import { buildSenderFieldValuesForType, buildRoles } from "./senderFields";

export function buildRabbitPrefillPayload(body, date, typeLabel) {
  const title = `${typeLabel} - ${
    body.customData.propertyAddress || "No Address"
  }`;
  const summary = `Seller: ${body.customData.sellerName || "Unknown"}`;
  const senderFieldValues = buildSenderFieldValuesForType(body, date);
  const roles = buildRoles(body);

  return {
    title,
    summary,
    date,
    senderFieldValues,
    roles,
  };
}
