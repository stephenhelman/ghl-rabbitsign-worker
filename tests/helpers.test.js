function splitTitle(title) {
  const [type, propertyAddress] = title.split(/\s*-\s*/);
  return { type, propertyAddress };
}

test("splitTitle splits type and propertyAddress correctly", () => {
  const title = "psa - 123 Main St, Little Rock AR";
  const { type, propertyAddress } = splitTitle(title);

  expect(type).toBe("psa");
  expect(propertyAddress).toBe("123 Main St, Little Rock AR");
});
