export const ROLES = Object.freeze({
  USER: "user",
  MANAGER: "manager",
  ADMIN: "admin",
});

export const EMAIL_REGEX =
  /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;

export const CAREER_LEVELS = Object.freeze({
  JUNIOR: "junior",
  MID: "mid",
  SENIOR: "senior",
});

export const PHONE_NR_REGEX = /^(\+)?[0-9]*$/;
