import { splitTitle } from "../util/util";
import { buildSenderFieldValuesForType, buildRoles } from "./senderFields";

export function buildRabbitPrefillPayload(body, date, title) {
  const [type] = splitTitle(title);
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
