#!/usr/bin/env node

const path = require("node:path");

const runner = async () => {
  const targetUrl = process.argv[2];
  const selector = process.argv[3];
  const level = process.argv[4];

  const write = (event) => {
    process.stdout.write(`${JSON.stringify(event)}\n`);
  };

  if (!targetUrl) {
    write({ type: "error", message: "Missing URL argument." });
    process.exitCode = 1;
    return;
  }

  try {
    const scanModulePath = path.resolve(__dirname, "../../cli/dist/core/scan/scan-url.js");
    const { scanUrl } = require(scanModulePath);

    const result = await scanUrl(targetUrl, {
      level: level || undefined,
      selector: selector || undefined,
      onProgressPrint: (message) => write({ type: "progress", message }),
    });

    write({ type: "result", result });
  } catch (error) {
    write({
      type: "error",
      message: error instanceof Error ? error.message : "Scan failed.",
      diagnostic:
        error && typeof error === "object" && typeof error.diagnostic === "object"
          ? error.diagnostic
          : undefined,
    });
    process.exitCode = 1;
  }
};

runner();
