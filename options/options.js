const form = document.getElementById("profileForm");
const status = document.getElementById("status");
const customFieldsContainer = document.getElementById("customFields");
const customFieldTemplate = document.getElementById("customFieldTemplate");
const addCustomFieldButton = document.getElementById("addCustomField");

const simpleSections = {
  basicInfo: [
    ["chineseName", "中文姓名"],
    ["englishName", "英文姓名"],
    ["preferredName", "常用名"],
    ["gender", "性别"],
    ["birthDate", "出生年月"],
    ["nationality", "国籍"],
    ["nativePlace", "籍贯"],
    ["currentResidence", "当前居住地（城市/国家）"],
    ["acceptRelocation", "是否接受异地或海外工作"],
    ["acceptableCities", "可接受城市列表"],
    ["householdType", "户籍类型"],
    ["politicalStatus", "政治面貌"],
    ["workPermitStatus", "工作许可状态"],
    ["visaType", "签证类型"]
  ],
  contactInfo: [
    ["phone", "手机号码"],
    ["email", "电子邮箱"],
    ["wechat", "微信号"],
    ["linkedin", "LinkedIn 链接"],
    ["github", "GitHub 链接"],
    ["website", "个人网站"],
    ["portfolioLink", "作品集在线链接"],
    ["behanceOrDribbble", "Behance/Dribbble 链接"],
    ["cloudPortfolioLink", "云盘作品集链接"]
  ],
  professionalSkills: [
    ["designSkills", "设计能力（工业/交互/服务/用户研究/人体工学/CMF/结构等）", "textarea"],
    ["softwareSkills", "软件能力（Rhino/SolidWorks/Keyshot/Figma/PS/Blender/Arduino/Python 等）", "textarea"],
    ["hardwareSkills", "硬件能力（3D 打印/CNC/快速原型/传感器/嵌入式等）", "textarea"],
    ["softSkills", "综合素质（协作/表达/访谈/共创/分析/战略思维等）", "textarea"]
  ],
  researchAndAchievements: [
    ["papers", "论文发表情况（含 DOI）", "textarea"],
    ["patents", "专利情况（类型与状态）", "textarea"],
    ["softwareCopyrights", "软件著作权", "textarea"],
    ["designAwards", "设计奖项", "textarea"],
    ["competitionAwards", "竞赛获奖", "textarea"],
    ["researchProjects", "科研项目/基金参与", "textarea"],
    ["scholarships", "奖学金", "textarea"],
    ["conferences", "会议报告/学术交流", "textarea"]
  ],
  languageAbilities: [
    ["chineseLevel", "中文水平"],
    ["englishLevel", "英语水平（如 IELTS）"],
    ["japaneseOrOthers", "日语或其他语种及等级"]
  ],
  attachments: [
    ["resumeZhPdf", "中文简历 PDF"],
    ["resumeEnPdf", "英文简历 PDF"],
    ["portfolioPdf", "作品集 PDF"],
    ["onlinePortfolio", "在线作品集链接"],
    ["recommendationLetters", "推荐信"],
    ["transcripts", "成绩单"],
    ["certificates", "证书扫描件"]
  ]
};

const qaQuestions = [
  ["whyThisRole", "选择该岗位的原因"],
  ["whyThisCompany", "选择该公司的原因"],
  ["greatestAchievement", "个人最大成就"],
  ["challengeStory", "一次挑战经历"],
  ["leadershipCase", "领导力案例"],
  ["failureExperience", "失败经验"],
  ["careerPlan", "职业规划"]
];

function createField(section, key, label, type = "input") {
  const wrapper = document.createElement("label");
  wrapper.textContent = label;
  const el = document.createElement(type === "textarea" ? "textarea" : "input");
  if (type === "textarea") {
    el.rows = 3;
  }
  el.dataset.section = section;
  el.dataset.key = key;
  wrapper.appendChild(el);
  return wrapper;
}

function renderSimpleSection(containerId, sectionName) {
  const container = document.getElementById(containerId);
  simpleSections[sectionName].forEach(([key, label, type]) => {
    container.appendChild(createField(sectionName, key, label, type));
  });
}

function renderQaFields() {
  const container = document.getElementById("qaFields");
  qaQuestions.forEach(([questionKey, title]) => {
    const block = document.createElement("div");
    block.className = "qa-block";
    const h = document.createElement("h3");
    h.textContent = title;
    block.appendChild(h);

    ["zh200", "zh500", "zh1000", "en200", "en500", "en1000"].forEach((k) => {
      block.appendChild(createField(`qaBank.${questionKey}`, k, k, "textarea"));
    });

    container.appendChild(block);
  });
}

function renderJobMatchingFields() {
  const container = document.getElementById("jobMatchingFields");
  container.appendChild(
    createField(
      "jobMatching.directionKeywords",
      "robotics",
      "机器人方向核心关键词（逗号分隔）",
      "textarea"
    )
  );
  container.appendChild(
    createField(
      "jobMatching.directionKeywords",
      "automotive",
      "汽车方向核心关键词（逗号分隔）",
      "textarea"
    )
  );
  container.appendChild(
    createField(
      "jobMatching.directionKeywords",
      "interaction",
      "交互方向核心关键词（逗号分隔）",
      "textarea"
    )
  );
  container.appendChild(
    createField("jobMatching.directionKeywords", "pet", "宠物方向核心关键词（逗号分隔）", "textarea")
  );
  container.appendChild(createField("jobMatching", "rolePositioning", "岗位版本一句话自我定位", "textarea"));
  container.appendChild(createField("jobMatching", "elevatorPitch30s", "30 秒电梯陈述", "textarea"));
}

function createCustomFieldItem(item = {}) {
  const node = customFieldTemplate.content.firstElementChild.cloneNode(true);
  node.dataset.id = item.id ?? crypto.randomUUID();
  node.querySelector('[data-key="label"]').value = item.label ?? "";
  node.querySelector('[data-key="value"]').value = item.value ?? "";
  node.querySelector('[data-key="hints"]').value = item.hints ?? "";
  node.querySelector('[data-action="remove"]').addEventListener("click", () => node.remove());
  return node;
}

function collectCustomFields() {
  return Array.from(customFieldsContainer.querySelectorAll(".custom-item"))
    .map((node) => {
      const label = node.querySelector('[data-key="label"]').value.trim();
      if (!label) return null;
      return {
        id: node.dataset.id,
        label,
        value: node.querySelector('[data-key="value"]').value.trim(),
        hints: node.querySelector('[data-key="hints"]').value.trim()
      };
    })
    .filter(Boolean);
}

function safeParseJsonArray(text, fallback = []) {
  if (!text.trim()) return fallback;
  try {
    const parsed = JSON.parse(text);
    return Array.isArray(parsed) ? parsed : fallback;
  } catch {
    return null;
  }
}

function setFieldValue(section, key, value) {
  const target = document.querySelector(`[data-section="${section}"][data-key="${key}"]`);
  if (target) target.value = value ?? "";
}

function getFieldValue(section, key) {
  return document.querySelector(`[data-section="${section}"][data-key="${key}"]`)?.value?.trim() ?? "";
}

async function load() {
  renderSimpleSection("basicInfoFields", "basicInfo");
  renderSimpleSection("contactInfoFields", "contactInfo");
  renderSimpleSection("professionalSkillsFields", "professionalSkills");
  renderSimpleSection("researchFields", "researchAndAchievements");
  renderSimpleSection("languageFields", "languageAbilities");
  renderSimpleSection("attachmentFields", "attachments");
  renderQaFields();
  renderJobMatchingFields();

  const { profile } = await chrome.storage.local.get({ profile: {} });

  Object.entries(simpleSections).forEach(([section, fields]) => {
    fields.forEach(([key]) => setFieldValue(section, key, profile?.[section]?.[key]));
  });

  qaQuestions.forEach(([q]) => {
    ["zh200", "zh500", "zh1000", "en200", "en500", "en1000"].forEach((k) => {
      setFieldValue(`qaBank.${q}`, k, profile?.qaBank?.[q]?.[k]);
    });
  });

  setFieldValue("jobMatching.directionKeywords", "robotics", profile?.jobMatching?.directionKeywords?.robotics);
  setFieldValue("jobMatching.directionKeywords", "automotive", profile?.jobMatching?.directionKeywords?.automotive);
  setFieldValue("jobMatching.directionKeywords", "interaction", profile?.jobMatching?.directionKeywords?.interaction);
  setFieldValue("jobMatching.directionKeywords", "pet", profile?.jobMatching?.directionKeywords?.pet);
  setFieldValue("jobMatching", "rolePositioning", profile?.jobMatching?.rolePositioning);
  setFieldValue("jobMatching", "elevatorPitch30s", profile?.jobMatching?.elevatorPitch30s);

  document.getElementById("educationExperiences").value = JSON.stringify(
    profile?.educationExperiences ?? [],
    null,
    2
  );
  document.getElementById("workExperiences").value = JSON.stringify(profile?.workExperiences ?? [], null, 2);
  document.getElementById("projectExperiences").value = JSON.stringify(
    profile?.projectExperiences ?? [],
    null,
    2
  );

  (profile?.customFields ?? []).forEach((item) => customFieldsContainer.appendChild(createCustomFieldItem(item)));
}

addCustomFieldButton.addEventListener("click", () => {
  customFieldsContainer.appendChild(createCustomFieldItem());
});

form.addEventListener("submit", async (event) => {
  event.preventDefault();

  const educationExperiences = safeParseJsonArray(document.getElementById("educationExperiences").value, []);
  const workExperiences = safeParseJsonArray(document.getElementById("workExperiences").value, []);
  const projectExperiences = safeParseJsonArray(document.getElementById("projectExperiences").value, []);

  if (!educationExperiences || !workExperiences || !projectExperiences) {
    status.textContent = "保存失败：教育/工作/项目经历 JSON 格式不正确，请检查。";
    return;
  }

  const profile = {
    basicInfo: Object.fromEntries(simpleSections.basicInfo.map(([k]) => [k, getFieldValue("basicInfo", k)])),
    contactInfo: Object.fromEntries(simpleSections.contactInfo.map(([k]) => [k, getFieldValue("contactInfo", k)])),
    educationExperiences,
    workExperiences,
    projectExperiences,
    professionalSkills: Object.fromEntries(
      simpleSections.professionalSkills.map(([k]) => [k, getFieldValue("professionalSkills", k)])
    ),
    researchAndAchievements: Object.fromEntries(
      simpleSections.researchAndAchievements.map(([k]) => [k, getFieldValue("researchAndAchievements", k)])
    ),
    languageAbilities: Object.fromEntries(
      simpleSections.languageAbilities.map(([k]) => [k, getFieldValue("languageAbilities", k)])
    ),
    attachments: Object.fromEntries(simpleSections.attachments.map(([k]) => [k, getFieldValue("attachments", k)])),
    qaBank: Object.fromEntries(
      qaQuestions.map(([q]) => [
        q,
        Object.fromEntries(
          ["zh200", "zh500", "zh1000", "en200", "en500", "en1000"].map((k) => [
            k,
            getFieldValue(`qaBank.${q}`, k)
          ])
        )
      ])
    ),
    jobMatching: {
      directionKeywords: {
        robotics: getFieldValue("jobMatching.directionKeywords", "robotics"),
        automotive: getFieldValue("jobMatching.directionKeywords", "automotive"),
        interaction: getFieldValue("jobMatching.directionKeywords", "interaction"),
        pet: getFieldValue("jobMatching.directionKeywords", "pet")
      },
      rolePositioning: getFieldValue("jobMatching", "rolePositioning"),
      elevatorPitch30s: getFieldValue("jobMatching", "elevatorPitch30s")
    },
    customFields: collectCustomFields()
  };

  await chrome.runtime.sendMessage({ type: "SAVE_PROFILE", profile });
  status.textContent = "保存成功：结构化个人简历数据库已更新。";
});

load();
