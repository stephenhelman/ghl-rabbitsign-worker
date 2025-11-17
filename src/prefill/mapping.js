import { formatContractType } from "../util/util";
import { buildSenderFieldValuesForType, buildRoles } from "./senderFields";

export function buildRabbitPrefillPayload(body, date, type) {
  const typeLabel = formatContractType(type);
  const title = `${typeLabel} - ${
    body.customData.propertyAddress || "No Address"
  }`;
  const summary = `Seller: ${body.customData.sellerName || "Unknown"}`;
  const senderFieldValues = buildSenderFieldValuesForType(type, body, date);
  const roles = buildRoles(body);

  return {
    title,
    summary,
    date,
    senderFieldValues,
    roles,
  };
}
