export const runStep = async (label, fn) => {
  try {
    const result = await fn();
    console.log(`[step:${label}] success`, result);
    return { ok: true, result };
  } catch (err) {
    console.error(`[step:${label}] failed`, {
      message: err?.message,
      stack: err?.stack,
    });
    return { ok: false, error: err };
  }
};
