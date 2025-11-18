export const formatContractType = (type) => {
  if (!type) return "";

  // Replace underscores with spaces first (optional)
  let str = type.replace(/_/g, " ");

  // Insert space before capital letters (camelCase → camel Case)
  str = str.replace(/([a-z])([A-Z])/g, "$1 $2");

  // Capitalize each word
  return str
    .split(" ")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
};

export const splitTitle = (title) => {
  const [type, propertyAddress] = title.split(/\s*-\s*/);
  return { type, propertyAddress };
};

export const confirmBody = async (request) => {
  let body;
  try {
    body = await request.json();
  } catch (e) {
    return jsonResponse({ ok: false, error: "Invalid JSON body" }, 400);
  }
  return body;
};
