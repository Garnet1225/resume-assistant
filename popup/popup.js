function countByStatus(applications) {
  return applications.reduce(
    (acc, item) => {
      acc.total += 1;
      if (item.status === "面试中") acc.interview += 1;
      if (item.status === "已拒绝") acc.rejected += 1;
      if (item.status === "Offer") acc.offer += 1;
      return acc;
    },
    { total: 0, interview: 0, rejected: 0, offer: 0 }
  );
}

function renderMetrics(applications) {
  const stats = countByStatus(applications);
  const metrics = document.getElementById("metrics");
  metrics.innerHTML = [
    ["总投递", stats.total],
    ["面试中", stats.interview],
    ["Offer", stats.offer]
  ]
    .map(
      ([label, value]) =>
        `<div class="metric"><div class="label">${label}</div><div class="value">${value}</div></div>`
    )
    .join("");
}

function renderApplications(applications) {
  const ul = document.getElementById("applications");
  const latest = applications.slice(0, 5);

  if (!latest.length) {
    ul.innerHTML = '<li class="muted">还没有投递记录，先点击“记录本次投递”。</li>';
    return;
  }

  ul.innerHTML = latest
    .map(
      (item) => `<li>
      <strong>${item.company}</strong> · ${item.title}<br />
      <span class="muted">状态：${item.status} · ${new Date(item.updatedAt).toLocaleString()}</span>
    </li>`
    )
    .join("");
}

async function getCurrentTab() {
  const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
  return tab;
}

async function sendToCurrentTab(message) {
  const tab = await getCurrentTab();
  if (!tab?.id) {
    throw new Error("无法获取当前标签页");
  }

  return chrome.tabs.sendMessage(tab.id, message);
}

async function refreshState() {
  const state = await chrome.runtime.sendMessage({ type: "GET_STATE" });
  renderMetrics(state.applications);
  renderApplications(state.applications);
}

document.getElementById("autofill").addEventListener("click", async () => {
  try {
    await sendToCurrentTab({ type: "AUTO_FILL" });
  } catch (error) {
    console.warn(error);
  }
});

document.getElementById("logSubmit").addEventListener("click", async () => {
  const tab = await getCurrentTab();
  await chrome.runtime.sendMessage({
    type: "LOG_APPLICATION",
    company: new URL(tab.url).hostname,
    title: tab.title,
    url: tab.url,
    status: "已投递"
  });
  await refreshState();
});

refreshState();
