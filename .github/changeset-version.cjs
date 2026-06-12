const { execSync } = require("node:child_process");

execSync("yarn changeset version");
execSync(
  "YARN_ENABLE_IMMUTABLE_INSTALLS=false node .yarn/releases/yarn-4.10.3.cjs",
);
