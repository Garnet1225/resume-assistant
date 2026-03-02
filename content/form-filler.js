const FIELD_HINTS = {
  chineseName: [/中文姓名/, /姓名/, /name/i, /full\s*name/i],
  englishName: [/英文名/, /english\s*name/i],
  preferredName: [/常用名/, /preferred\s*name/i],
  gender: [/性别/, /gender/i],
  birthDate: [/出生/, /birth/i, /date\s*of\s*birth/i],
  nationality: [/国籍/, /nationality/i],
  nativePlace: [/籍贯/],
  currentResidence: [/当前居住地/, /现居/, /location/i, /city/i],
  acceptRelocation: [/异地/, /海外工作/, /relocat/i],
  acceptableCities: [/可接受城市/, /preferred\s*location/i],
  householdType: [/户籍/],
  politicalStatus: [/政治面貌/],
  workPermitStatus: [/工作许可/, /work\s*permit/i],
  visaType: [/签证/, /visa/i],
  phone: [/手机/, /电话/, /phone/i, /mobile/i],
  email: [/邮箱/, /email/i, /e-mail/i],
  wechat: [/微信/, /wechat/i],
  linkedin: [/linkedin/i],
  github: [/github/i],
  website: [/个人网站/, /website/i],
  portfolioLink: [/作品集/, /portfolio/i],
  behanceOrDribbble: [/behance/i, /dribbble/i],
  cloudPortfolioLink: [/云盘作品集/, /cloud/i, /drive/i],
  rolePositioning: [/自我定位/, /positioning/i],
  elevatorPitch30s: [/电梯陈述/, /30\s*秒/, /elevator\s*pitch/i],
  designSkills: [/设计能力/, /design\s*skills?/i],
  softwareSkills: [/软件能力/, /software\s*skills?/i],
  hardwareSkills: [/硬件能力/, /hardware\s*skills?/i],
  softSkills: [/综合素质/, /soft\s*skills?/i],
  chineseLevel: [/中文水平/],
  englishLevel: [/英语水平/, /ielts/i, /toefl/i],
  japaneseOrOthers: [/日语/, /其他语种/, /language/i],
  whyThisRole: [/选择该岗位/, /why\s*this\s*role/i],
  whyThisCompany: [/选择该公司/, /why\s*this\s*company/i],
  greatestAchievement: [/最大成就/, /greatest\s*achievement/i],
  challengeStory: [/挑战经历/, /challenge/i],
  leadershipCase: [/领导力/, /leadership/i],
  failureExperience: [/失败经验/, /failure/i],
  careerPlan: [/职业规划/, /career\s*plan/i]
};

function getFieldText(element) {
  return [
    element.name,
    element.id,
    element.placeholder,
    element.getAttribute("aria-label"),
    element.labels?.[0]?.textContent
  ]
    .filter(Boolean)
    .join(" ")
    .toLowerCase();
}

function isPatternMatch(text, patterns = []) {
  return patterns.some((pattern) => pattern.test(text));
}

function customFieldMatches(text, customField) {
  const label = String(customField.label || "").toLowerCase();
  const hints = String(customField.hints || "")
    .split(",")
    .map((item) => item.trim().toLowerCase())
    .filter(Boolean);

  if (label && text.includes(label)) {
    return true;
  }

  return hints.some((hint) => text.includes(hint));
}

function fillElementValue(el, value) {
  if (el.tagName.toLowerCase() === "select") {
    const options = Array.from(el.options);
    const candidate = options.find((opt) => {
      const text = opt.textContent?.trim() ?? "";
      return text.includes(value) || opt.value === value;
    });
    if (candidate) {
      el.value = candidate.value;
    }
  } else {
    el.value = value;
  }

  el.dispatchEvent(new Event("input", { bubbles: true }));
  el.dispatchEvent(new Event("change", { bubbles: true }));
}

function buildAutofillSource(profile) {
  const source = {
    ...profile.basicInfo,
    ...profile.contactInfo,
    ...profile.professionalSkills,
    ...profile.languageAbilities,
    rolePositioning: profile.jobMatching?.rolePositioning ?? "",
    elevatorPitch30s: profile.jobMatching?.elevatorPitch30s ?? "",
    whyThisRole: profile.qaBank?.whyThisRole?.zh500 || profile.qaBank?.whyThisRole?.en500 || "",
    whyThisCompany: profile.qaBank?.whyThisCompany?.zh500 || profile.qaBank?.whyThisCompany?.en500 || "",
    greatestAchievement:
      profile.qaBank?.greatestAchievement?.zh500 || profile.qaBank?.greatestAchievement?.en500 || "",
    challengeStory: profile.qaBank?.challengeStory?.zh500 || profile.qaBank?.challengeStory?.en500 || "",
    leadershipCase: profile.qaBank?.leadershipCase?.zh500 || profile.qaBank?.leadershipCase?.en500 || "",
    failureExperience:
      profile.qaBank?.failureExperience?.zh500 || profile.qaBank?.failureExperience?.en500 || "",
    careerPlan: profile.qaBank?.careerPlan?.zh500 || profile.qaBank?.careerPlan?.en500 || ""
  };

  return source;
}

async function fillForm() {
  const { profile } = await chrome.storage.local.get({ profile: {} });
  const autofillSource = buildAutofillSource(profile || {});
  const elements = document.querySelectorAll("input, textarea, select");
  const customFields = Array.isArray(profile?.customFields) ? profile.customFields : [];

  for (const el of elements) {
    if (el.disabled || el.readOnly) {
      continue;
    }

    const fieldText = getFieldText(el);
    let matched = false;

    for (const [key, patterns] of Object.entries(FIELD_HINTS)) {
      const value = autofillSource[key];
      if (!value || !isPatternMatch(fieldText, patterns)) {
        continue;
      }

      fillElementValue(el, String(value));
      matched = true;
      break;
    }

    if (matched) {
      continue;
    }

    for (const customField of customFields) {
      if (!customField?.value || !customFieldMatches(fieldText, customField)) {
        continue;
      }

      fillElementValue(el, String(customField.value));
      break;
    }
  }
}

chrome.runtime.onMessage.addListener((message, _sender, sendResponse) => {
  if (message.type === "AUTO_FILL") {
    fillForm()
      .then(() => sendResponse({ ok: true }))
      .catch((error) => sendResponse({ ok: false, error: error.message }));
    return true;
  }

  if (message.type === "PING_CONTENT") {
    sendResponse({ ok: true });
    return false;
  }

  return false;
});
