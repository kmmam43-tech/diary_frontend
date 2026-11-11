import { createApiClient } from "./api.js";

const api = createApiClient(window.APP_CONFIG?.API_BASE_URL || "http://localhost:8000");
const state = { challengeBehavior: "", messages: [] };

const behaviorSection = document.querySelector("#behavior-section");
const conversationSection = document.querySelector("#conversation-section");
const behaviorForm = document.querySelector("#behavior-form");
const behaviorInput = document.querySelector("#challenge-behavior");
const chatForm = document.querySelector("#chat-form");
const chatInput = document.querySelector("#chat-input");
const messagesElement = document.querySelector("#messages");
const interventionInput = document.querySelector("#intervention");
const saveButton = document.querySelector("#save-button");
const resetButton = document.querySelector("#reset-button");
const statusElement = document.querySelector("#status");
const behaviorStatusElement = document.querySelector("#behavior-status");

function addMessage(role, content) {
  const message = document.createElement("div");
  message.className = `message ${role}`;
  const label = document.createElement("span");
  label.textContent = role === "assistant" ? "대화 에이전트" : "나";
  const text = document.createElement("p");
  text.textContent = content;
  message.append(label, text);
  messagesElement.append(message);
  messagesElement.scrollTop = messagesElement.scrollHeight;
}

function setBusy(form, busy) {
  for (const element of form.elements) element.disabled = busy;
  form.setAttribute("aria-busy", String(busy));
}

function showError(message) {
  const target = conversationSection.classList.contains("hidden")
    ? behaviorStatusElement
    : statusElement;
  target.className = "status error";
  target.textContent = message;
}

async function getAgentResponse() {
  const result = await api.respond(state.challengeBehavior, state.messages);
  state.messages.push({ role: "assistant", content: result.assistant_message });
  addMessage("assistant", result.assistant_message);
  interventionInput.value = result.suggested_intervention;
}

behaviorForm.addEventListener("submit", async (event) => {
  event.preventDefault();
  state.challengeBehavior = behaviorInput.value.trim();
  state.messages = [];
  setBusy(behaviorForm, true);
  behaviorStatusElement.textContent = "";
  behaviorSection.classList.add("hidden");
  conversationSection.classList.remove("hidden");
  statusElement.className = "status";
  statusElement.textContent = "에이전트가 도전행동을 살펴보고 있습니다…";
  try {
    await getAgentResponse();
    statusElement.textContent = "";
    chatInput.focus();
  } catch (error) {
    showError(error.message);
  } finally {
    setBusy(behaviorForm, false);
  }
});

chatForm.addEventListener("submit", async (event) => {
  event.preventDefault();
  const content = chatInput.value.trim();
  if (!content) return;
  state.messages.push({ role: "user", content });
  addMessage("user", content);
  chatInput.value = "";
  setBusy(chatForm, true);
  try {
    await getAgentResponse();
  } catch (error) {
    showError(error.message);
  } finally {
    setBusy(chatForm, false);
    chatInput.focus();
  }
});

saveButton.addEventListener("click", async () => {
  const intervention = interventionInput.value.trim();
  if (intervention.length < 3) {
    showError("중재방안을 3자 이상 입력하세요.");
    return;
  }
  saveButton.disabled = true;
  statusElement.className = "status";
  statusElement.textContent = "저장 중입니다…";
  try {
    const saved = await api.saveCase(state.challengeBehavior, intervention, state.messages);
    statusElement.className = "status success";
    statusElement.textContent = `저장했습니다. 기록 ID: ${saved.id}`;
  } catch (error) {
    showError(error.message);
  } finally {
    saveButton.disabled = false;
  }
});

resetButton.addEventListener("click", () => window.location.reload());
