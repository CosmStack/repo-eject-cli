import type { Config } from "./types";
import path from "node:path";
import os from "node:os";

const calculateKeyRotationInterval = (keyRotationInterval: number) => {
  return keyRotationInterval * 24 * 60 * 60 * 1000;
};

const getKeyRotationInterval = () => {
  const keyRotationInterval = process.env.KEY_ROTATION_INTERVAL;
  if (!keyRotationInterval) return calculateKeyRotationInterval(30);
  return calculateKeyRotationInterval(Number(keyRotationInterval));
};

const getEncryptionAlgorithm = () => {
  const encryptionAlgorithm = process.env.ENCRYPTION_ALGORITHM;
  if (!encryptionAlgorithm) return "aes-256-gcm";
  return encryptionAlgorithm;
};

export const config: Config = {
  app: {
    name: "repoeject",
    version: "0.1.2-test-5",
  },
  github: {
    apiVersion: "2022-11-28",
    perPage: 100,
    maxPages: 10,
  },

  ui: {
    spinnerColor: "yellow",
    tableColors: {
      header: "cyan",
      row: "white",
      selected: "green",
      inactive: "gray",
      danger: "red",
    },
    inactiveThresholdDays: 180,
    lowCommitThreshold: 3,
  },

  cli: {
    confirmationKeyword: "DELETE",
  },

  authMethods: {
    oauth: false,
    token: true,
  },

  store: {
    configDir: path.join(os.homedir(), ".repoeject"),
    configFile: path.join(os.homedir(), ".repoeject", "config.json"),
    keyDir: path.join(os.homedir(), ".repoeject", "keys"),
    keyFile: path.join(os.homedir(), ".repoeject", "keys", "master.key"),
  },
  security: {
    encryptionAlgorithm: getEncryptionAlgorithm(),
    keyRotationInterval: getKeyRotationInterval(),
  },
};
