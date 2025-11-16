export async function saveContractMapping(env, folderId, data) {
  const key = `rs:${folderId}`;
  const value = {
    ...data,
    folderId,
    createdAt: new Date().toISOString(),
  };

  await env.MAP_KV.put(key, JSON.stringify(value), {
    expirationTtl: 60 * 60 * 24 * 14, // 14 days
  });

  return key;
}

export async function getContractMapping(env, folderId) {
  const key = `rs:${folderId}`;
  const json = await env.MAP_KV.get(key);
  return json ? JSON.parse(json) : null;
}

export async function deleteContractMapping(env, folderId) {
  const key = `rs:${folderId}`;
  await env.MAP_KV.delete(key);
}
