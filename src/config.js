export const resolveConfig = (env) => {
  let templateMap = {};
  try {
    if (env.TEMPLATE_CONFIG_JSON) {
      templateMap = JSON.parse(env.TEMPLATE_CONFIG_JSON);
    }
  } catch (e) {
    console.error("Failed to parse TEMPLATE_CONFIG_JSON:", e);
  }

  return {
    ghlApiKey: env.GHL_API_KEY,
    rabbitSignSecret: env.RABBIT_KEY_SECRET,
    rabbitKeyId: env.RABBIT_KEY_ID,
    locationId: env.GHL_LOCATION_ID,
    templateMap,
    //TODO - other sensitive IDs
  };
};
