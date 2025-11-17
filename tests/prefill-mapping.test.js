import { buildRabbitPrefillPayload } from "../src/prefill/mapping.js";

describe("buildRabbitPrefillPayload", () => {
  test("builds expected payload with seller only", () => {
    const payload = buildRabbitPrefillPayload({
      templateId: "tmpl_123",
      contractType: "cash",
      seller: {
        name: "John Seller",
        email: "john@example.com",
      },
      buyer: null,
      property: {
        address: "123 Main St, Little Rock AR",
      },
    });

    expect(payload.templateId).toBe("tmpl_123");
    expect(payload.title).toBe("cash - 123 Main St, Little Rock AR");
    expect(payload.senderFieldValues).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          label: "Seller Email",
          value: "john@example.com",
        }),
        expect.objectContaining({
          label: "Property Address",
          value: "123 Main St, Little Rock AR",
        }),
      ])
    );
  });

  test("adds buyer fields when buyer is present", () => {
    const payload = buildRabbitPrefillPayload({
      templateId: "tmpl_123",
      contractType: "assignment",
      seller: {
        name: "Jane Seller",
        email: "jane@example.com",
      },
      buyer: {
        name: "Bob Buyer",
        email: "bob@example.com",
      },
      property: {
        address: "208 Military Rd, Jacksonville AR",
      },
    });

    const labels = payload.senderFieldValues.map((f) => f.label);
    expect(labels).toContain("Buyer Name");
    expect(labels).toContain("Buyer Email");
  });
});
