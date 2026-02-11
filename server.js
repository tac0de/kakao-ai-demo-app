const path = require("path");
const express = require("express");

const app = express();
const port = Number(process.env.DEMO_PORT || 8787);
const targetWebhookUrl = process.env.TARGET_WEBHOOK_URL || "";
const defaultAccountId = process.env.DEMO_DEFAULT_ACCOUNT_ID || "demo-user-001";

app.use(express.json({ limit: "1mb" }));
app.use(express.static(path.join(__dirname, "public")));

function parseBotReply(data) {
  const simpleText =
    data?.template?.outputs?.find((o) => o?.simpleText?.text)?.simpleText?.text ||
    data?.template?.outputs?.[0]?.simpleText?.text ||
    null;
  if (simpleText) {
    return simpleText;
  }
  return "응답 형식을 해석하지 못했습니다. raw JSON을 확인해 주세요.";
}

app.get("/health", (_req, res) => {
  res.status(200).json({
    ok: true,
    targetWebhookUrl: targetWebhookUrl || "not-set",
  });
});

app.post("/api/chat", async (req, res) => {
  try {
    const {
      utterance,
      accountId = defaultAccountId,
      channelType = "dm",
      roomId = "",
    } = req.body || {};

    if (!targetWebhookUrl) {
      return res.status(400).json({
        ok: false,
        error:
          "TARGET_WEBHOOK_URL이 설정되지 않았습니다. demo-app/README.md를 확인하세요.",
      });
    }
    if (!utterance || typeof utterance !== "string") {
      return res.status(400).json({ ok: false, error: "utterance가 필요합니다." });
    }

    const payload = {
      userRequest: {
        user: {
          id: accountId,
          properties: {},
        },
        utterance: utterance.trim(),
      },
    };

    if (channelType === "group" && roomId) {
      payload.userRequest.room = {
        id: roomId,
        type: "group",
      };
    }

    const response = await fetch(targetWebhookUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    const text = await response.text();
    let data;
    try {
      data = JSON.parse(text);
    } catch {
      return res.status(502).json({
        ok: false,
        error: "대상 webhook 응답이 JSON이 아닙니다.",
        rawText: text,
      });
    }

    const reply = parseBotReply(data);
    return res.status(200).json({
      ok: true,
      reply,
      raw: data,
      requestPayload: payload,
    });
  } catch (error) {
    return res.status(500).json({
      ok: false,
      error: error.message || "unknown error",
    });
  }
});

app.listen(port, () => {
  // eslint-disable-next-line no-console
  console.log(`[demo-app] running at http://localhost:${port}`);
});
