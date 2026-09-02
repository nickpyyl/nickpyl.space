import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const endpoint = "http://127.0.0.1:3845/mcp";
const outDir = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../assets/fuse-case-study");

const frames = [
  ["1:12", "fuse-00-cover.png"],
  ["1:74", "fuse-01-intro.png"],
  ["59:1378", "fuse-02-context.png"],
  ["78:1659", "fuse-03-problem.png"],
  ["106:757", "fuse-04-question.png"],
  ["89:2", "fuse-05-home-redesign.png"],
  ["144:3184", "fuse-06-product-structure.png"],
  ["166:4943", "fuse-07-actions-placement.png"],
  ["143:151", "fuse-08-onboarding.png"],
  ["143:273", "fuse-09-swap.png"],
];

function parseSse(text) {
  const payloads = text
    .split("\n")
    .filter((line) => line.startsWith("data: "))
    .map((line) => JSON.parse(line.slice(6)));

  return payloads.at(-1);
}

async function post(payload, sessionId) {
  const response = await fetch(endpoint, {
    method: "POST",
    headers: {
      "content-type": "application/json",
      accept: "application/json, text/event-stream",
      ...(sessionId ? { "mcp-session-id": sessionId } : {}),
    },
    body: JSON.stringify(payload),
  });

  const text = await response.text();
  if (!response.ok) {
    throw new Error(`MCP request failed ${response.status}: ${text}`);
  }

  return {
    sessionId: response.headers.get("mcp-session-id") ?? sessionId,
    message: text.trim() ? parseSse(text) : null,
  };
}

async function initialize() {
  const init = await post({
    jsonrpc: "2.0",
    id: 1,
    method: "initialize",
    params: {
      protocolVersion: "2025-06-18",
      capabilities: {},
      clientInfo: { name: "codex-exporter", version: "1.0.0" },
    },
  });

  await post({
    jsonrpc: "2.0",
    method: "notifications/initialized",
    params: {},
  }, init.sessionId);

  return init.sessionId;
}

async function exportFrame(sessionId, [nodeId, filename], index) {
  const { message } = await post({
    jsonrpc: "2.0",
    id: index + 2,
    method: "tools/call",
    params: {
      name: "get_screenshot",
      arguments: {
        nodeId,
        contentsOnly: false,
      },
    },
  }, sessionId);

  if (message?.error) {
    throw new Error(`${nodeId}: ${JSON.stringify(message.error)}`);
  }

  const image = message?.result?.content?.find((item) => item.type === "image");
  if (!image?.data) {
    throw new Error(`${nodeId}: no image data in response`);
  }

  const destination = path.join(outDir, filename);
  await writeFile(destination, Buffer.from(image.data, "base64"));
  console.log(`${nodeId} -> ${destination}`);
}

await mkdir(outDir, { recursive: true });
const sessionId = await initialize();

for (const [index, frame] of frames.entries()) {
  await exportFrame(sessionId, frame, index);
}
