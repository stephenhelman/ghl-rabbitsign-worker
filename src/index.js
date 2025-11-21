// worker/src/index.js
import { handleRequest } from "./router.js";

export default {
  fetch: (request, env) => handleRequest(request, env),
};
