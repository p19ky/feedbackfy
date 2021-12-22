export const ROLES = Object.freeze({
  USER: "user",
  MANAGER: "manager",
  ADMIN: "admin",
});

export const EMAIL_REGEX =
  /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;

export const CAREER_LEVELS = Object.freeze({
  JUNIOR: "junior consultant",
  MID: "consultant",
  SENIOR: "senior consultant",
});

export const PHONE_NR_REGEX = /^(\+)?[0-9]*$/;

export const PROJECT_DAYS_EVALUATED_VALUES = ["0-50", "50-100", "100+"];

export const PEG_EVALUATION_RATING_TO_TEXTUAL_MEANING = Object.freeze({
  "-": "Not assessable at this time",
  1: "Does not meet expectations",
  2: "Partially meets expectations",
  3: "Fully meets expectations",
  4: "Exceeds expectations",
});

export const PEG_EVALUATION_TYPE_TO_TITLE = Object.freeze({
  customerFocus: "Customer Focus",
  employeeFocus: "Employee Focus",
  excellenceFocus: "Excellence Focus",
  strategyFocus: "Strategy Focus",
  experience: "Professional and Industry Experience",
  management: "Project and Program Management",
});
