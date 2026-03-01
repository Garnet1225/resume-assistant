const DEFAULT_PROFILE = {
  basicInfo: {
    chineseName: "",
    englishName: "",
    preferredName: "",
    gender: "",
    birthDate: "",
    nationality: "",
    nativePlace: "",
    currentResidence: "",
    acceptRelocation: "",
    acceptableCities: "",
    householdType: "",
    politicalStatus: "",
    workPermitStatus: "",
    visaType: ""
  },
  contactInfo: {
    phone: "",
    email: "",
    wechat: "",
    linkedin: "",
    github: "",
    website: "",
    portfolioLink: "",
    behanceOrDribbble: "",
    cloudPortfolioLink: ""
  },
  educationExperiences: [],
  workExperiences: [],
  projectExperiences: [],
  professionalSkills: {
    designSkills: "",
    softwareSkills: "",
    hardwareSkills: "",
    softSkills: ""
  },
  researchAndAchievements: {
    papers: "",
    patents: "",
    softwareCopyrights: "",
    designAwards: "",
    competitionAwards: "",
    researchProjects: "",
    scholarships: "",
    conferences: ""
  },
  languageAbilities: {
    chineseLevel: "",
    englishLevel: "",
    japaneseOrOthers: ""
  },
  attachments: {
    resumeZhPdf: "",
    resumeEnPdf: "",
    portfolioPdf: "",
    onlinePortfolio: "",
    recommendationLetters: "",
    transcripts: "",
    certificates: ""
  },
  qaBank: {
    whyThisRole: { zh200: "", zh500: "", zh1000: "", en200: "", en500: "", en1000: "" },
    whyThisCompany: { zh200: "", zh500: "", zh1000: "", en200: "", en500: "", en1000: "" },
    greatestAchievement: { zh200: "", zh500: "", zh1000: "", en200: "", en500: "", en1000: "" },
    challengeStory: { zh200: "", zh500: "", zh1000: "", en200: "", en500: "", en1000: "" },
    leadershipCase: { zh200: "", zh500: "", zh1000: "", en200: "", en500: "", en1000: "" },
    failureExperience: { zh200: "", zh500: "", zh1000: "", en200: "", en500: "", en1000: "" },
    careerPlan: { zh200: "", zh500: "", zh1000: "", en200: "", en500: "", en1000: "" }
  },
  jobMatching: {
    directionKeywords: {
      robotics: "",
      automotive: "",
      interaction: "",
      pet: ""
    },
    rolePositioning: "",
    elevatorPitch30s: ""
  },
  customFields: []
};

const DEFAULT_STATE = {
  applications: [],
  profile: DEFAULT_PROFILE
};

function asObject(v, fallback = {}) {
  return v && typeof v === "object" && !Array.isArray(v) ? v : fallback;
}

function asArray(v) {
  return Array.isArray(v) ? v : [];
}

function normalizeQaItem(v) {
  const raw = asObject(v);
  return {
    zh200: raw.zh200 ?? "",
    zh500: raw.zh500 ?? "",
    zh1000: raw.zh1000 ?? "",
    en200: raw.en200 ?? "",
    en500: raw.en500 ?? "",
    en1000: raw.en1000 ?? ""
  };
}

function normalizeCustomFields(v) {
  return asArray(v)
    .filter((item) => item && item.label)
    .map((item) => ({
      id: item.id ?? crypto.randomUUID(),
      label: String(item.label).trim(),
      value: item.value ?? "",
      hints: item.hints ?? ""
    }));
}

function normalizeProfile(rawProfile = {}) {
  const raw = asObject(rawProfile);
  return {
    basicInfo: { ...DEFAULT_PROFILE.basicInfo, ...asObject(raw.basicInfo) },
    contactInfo: { ...DEFAULT_PROFILE.contactInfo, ...asObject(raw.contactInfo) },
    educationExperiences: asArray(raw.educationExperiences),
    workExperiences: asArray(raw.workExperiences),
    projectExperiences: asArray(raw.projectExperiences),
    professionalSkills: { ...DEFAULT_PROFILE.professionalSkills, ...asObject(raw.professionalSkills) },
    researchAndAchievements: {
      ...DEFAULT_PROFILE.researchAndAchievements,
      ...asObject(raw.researchAndAchievements)
    },
    languageAbilities: { ...DEFAULT_PROFILE.languageAbilities, ...asObject(raw.languageAbilities) },
    attachments: { ...DEFAULT_PROFILE.attachments, ...asObject(raw.attachments) },
    qaBank: {
      whyThisRole: normalizeQaItem(raw.qaBank?.whyThisRole),
      whyThisCompany: normalizeQaItem(raw.qaBank?.whyThisCompany),
      greatestAchievement: normalizeQaItem(raw.qaBank?.greatestAchievement),
      challengeStory: normalizeQaItem(raw.qaBank?.challengeStory),
      leadershipCase: normalizeQaItem(raw.qaBank?.leadershipCase),
      failureExperience: normalizeQaItem(raw.qaBank?.failureExperience),
      careerPlan: normalizeQaItem(raw.qaBank?.careerPlan)
    },
    jobMatching: {
      directionKeywords: {
        ...DEFAULT_PROFILE.jobMatching.directionKeywords,
        ...asObject(raw.jobMatching?.directionKeywords)
      },
      rolePositioning: raw.jobMatching?.rolePositioning ?? "",
      elevatorPitch30s: raw.jobMatching?.elevatorPitch30s ?? ""
    },
    customFields: normalizeCustomFields(raw.customFields)
  };
}

async function getState() {
  const state = await chrome.storage.local.get(DEFAULT_STATE);
  return {
    ...state,
    profile: normalizeProfile(state.profile)
  };
}

async function upsertApplication(application) {
  const state = await getState();
  const idx = state.applications.findIndex((item) => item.id === application.id);

  if (idx === -1) {
    state.applications.unshift(application);
  } else {
    state.applications[idx] = { ...state.applications[idx], ...application };
  }

  await chrome.storage.local.set({ applications: state.applications });
  return state.applications;
}

chrome.runtime.onInstalled.addListener(async () => {
  await chrome.storage.local.set(DEFAULT_STATE);
});

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  (async () => {
    if (message.type === "GET_STATE") {
      sendResponse(await getState());
      return;
    }

    if (message.type === "SAVE_PROFILE") {
      const profile = normalizeProfile(message.profile);
      await chrome.storage.local.set({ profile });
      sendResponse({ ok: true, profile });
      return;
    }

    if (message.type === "LOG_APPLICATION") {
      const tab = sender.tab;
      const payload = {
        id: message.id ?? crypto.randomUUID(),
        company: message.company ?? "未知公司",
        title: message.title ?? tab?.title ?? "未知职位",
        url: message.url ?? tab?.url ?? "",
        status: message.status ?? "已投递",
        note: message.note ?? "",
        createdAt: message.createdAt ?? new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
      const applications = await upsertApplication(payload);
      sendResponse({ ok: true, applications });
      return;
    }

    if (message.type === "UPDATE_STATUS") {
      const state = await getState();
      const applications = state.applications.map((item) => {
        if (item.id !== message.id) {
          return item;
        }
        return {
          ...item,
          status: message.status,
          note: message.note ?? item.note,
          updatedAt: new Date().toISOString()
        };
      });
      await chrome.storage.local.set({ applications });
      sendResponse({ ok: true, applications });
      return;
    }

    sendResponse({ ok: false, error: "Unknown message type" });
  })();

  return true;
});
