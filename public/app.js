const accountInput = document.getElementById("accountId");
const channelSelect = document.getElementById("channelType");
const roomInput = document.getElementById("roomId");
const utteranceInput = document.getElementById("utterance");
const chatForm = document.getElementById("chatForm");
const messages = document.getElementById("messages");
const rawOutput = document.getElementById("rawOutput");
const quickButtons = document.querySelectorAll(".quick-grid button");

const LS_KEY = "kakao-ai-demo-config";

function appendBubble(text, role) {
  const div = document.createElement("div");
  div.className = `bubble ${role}`;
  div.textContent = text;
  messages.appendChild(div);
  messages.scrollTop = messages.scrollHeight;
}

function saveConfig() {
  const payload = {
    accountId: accountInput.value.trim(),
    channelType: channelSelect.value,
    roomId: roomInput.value.trim(),
  };
  localStorage.setItem(LS_KEY, JSON.stringify(payload));
}

function loadConfig() {
  const raw = localStorage.getItem(LS_KEY);
  if (!raw) {
    return;
  }
  try {
    const parsed = JSON.parse(raw);
    accountInput.value = parsed.accountId || "demo-user-001";
    channelSelect.value = parsed.channelType || "dm";
    roomInput.value = parsed.roomId || "";
  } catch (_e) {
    // ignore parse errors
  }
}

async function sendMessage(utterance) {
  const accountId = accountInput.value.trim() || "demo-user-001";
  const channelType = channelSelect.value || "dm";
  const roomId = roomInput.value.trim();

  appendBubble(utterance, "user");
  saveConfig();

  const response = await fetch("/api/chat", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      utterance,
      accountId,
      channelType,
      roomId,
    }),
  });

  const data = await response.json();
  if (!response.ok || !data.ok) {
    appendBubble(`오류: ${data.error || "unknown error"}`, "bot");
    rawOutput.textContent = JSON.stringify(data, null, 2);
    return;
  }

  appendBubble(data.reply || "(empty)", "bot");
  rawOutput.textContent = JSON.stringify(data.raw || {}, null, 2);
}

chatForm.addEventListener("submit", async (e) => {
  e.preventDefault();
  const utterance = utteranceInput.value.trim();
  if (!utterance) {
    return;
  }
  utteranceInput.value = "";
  await sendMessage(utterance);
});

quickButtons.forEach((btn) => {
  btn.addEventListener("click", async () => {
    const cmd = btn.getAttribute("data-cmd");
    if (!cmd) {
      return;
    }
    await sendMessage(cmd);
  });
});

[accountInput, channelSelect, roomInput].forEach((el) => {
  el.addEventListener("change", saveConfig);
});

loadConfig();
if (!accountInput.value) {
  accountInput.value = "demo-user-001";
}

appendBubble(
  "데모 앱 준비 완료. /체험시작 또는 /앱전환 default 를 눌러 시작하세요.",
  "bot",
);
