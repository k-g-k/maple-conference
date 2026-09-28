// Single import home for the 62F reform question's data and content.
// Parallel to src/app/data/rent-control/index.ts.

export { SOURCES } from "./sources";
export * from "./content";
export { PROSE } from "./prose";
export { orgTestifiers, testimonyFor } from "./selectors";
export {
  POSITION_USERS,
  type PositionUser,
  type PositionUserType,
} from "../tax-rebate-62f-users";
export {
  TESTIMONY,
  type TestimonyItem,
  type TestimonyStance,
} from "../tax-rebate-62f-testimony";
