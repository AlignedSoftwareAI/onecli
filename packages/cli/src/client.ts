const getConfig = () => {
  const apiUrl = process.env.ONECLI_API_URL;
  const apiKey = process.env.ONECLI_API_KEY;
  const projectId = process.env.ONECLI_PROJECT_ID;

  if (!apiUrl) throw new Error("ONECLI_API_URL is required");
  if (!apiKey) throw new Error("ONECLI_API_KEY is required");
  if (!projectId) throw new Error("ONECLI_PROJECT_ID is required");

  return { apiUrl: apiUrl.replace(/\/$/, ""), apiKey, projectId };
};

const extractError = async (res: Response): Promise<string> => {
  try {
    const body = await res.json();
    if (typeof body?.error === "string") return body.error;
    if (typeof body?.error?.message === "string") return body.error.message;
  } catch {}
  return `HTTP ${res.status}`;
};

export const apiRequest = async <T>(
  method: string,
  path: string,
  body?: unknown,
): Promise<T> => {
  const { apiUrl, apiKey, projectId } = getConfig();

  const headers: Record<string, string> = {
    Authorization: `Bearer ${apiKey}`,
    "X-Project-Id": projectId,
  };
  if (body !== undefined) headers["Content-Type"] = "application/json";

  const res = await fetch(`${apiUrl}${path}`, {
    method,
    headers,
    body: body !== undefined ? JSON.stringify(body) : undefined,
  });

  if (res.status === 204) return undefined as T;

  if (!res.ok) {
    const msg = await extractError(res);
    throw new Error(msg);
  }

  return res.json() as T;
};
