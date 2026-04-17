#!/usr/bin/env node

const { execSync } = require("child_process");
const path = require("path");
const fs = require("fs");
const readline = require("readline");

const TEMPLATE_DIR = path.join(__dirname, "..", "template");

const COLORS = {
    reset: "\x1b[0m",
    bright: "\x1b[1m",
    cyan: "\x1b[36m",
    green: "\x1b[32m",
    yellow: "\x1b[33m",
    red: "\x1b[31m",
    magenta: "\x1b[35m",
    dim: "\x1b[2m",
};

function log(msg, color = "") {
    console.log(`${color}${msg}${COLORS.reset}`);
}

function banner() {
    console.log("");
    log(
        "  ╔══════════════════════════════════════════════╗",
        COLORS.cyan
    );
    log(
        "  ║                                              ║",
        COLORS.cyan
    );
    log(
        "  ║   🚀  create-next-starter                   ║",
        COLORS.cyan
    );
    log(
        "  ║   Next.js Professional Starter Kit           ║",
        COLORS.cyan
    );
    log(
        "  ║                                              ║",
        COLORS.cyan
    );
    log(
        "  ╚══════════════════════════════════════════════╝",
        COLORS.cyan
    );
    console.log("");
    log(
        "  Redux Toolkit • shadcn/ui • SEO • RTK Query",
        COLORS.dim
    );
    console.log("");
}

function ask(rl, question, defaultVal) {
    return new Promise((resolve) => {
        const suffix = defaultVal ? ` ${COLORS.dim}(${defaultVal})${COLORS.reset}` : "";
        rl.question(`  ${COLORS.green}?${COLORS.reset} ${question}${suffix}: `, (answer) => {
            resolve(answer.trim() || defaultVal || "");
        });
    });
}

function copyRecursive(src, dest) {
    if (!fs.existsSync(dest)) {
        fs.mkdirSync(dest, { recursive: true });
    }

    const entries = fs.readdirSync(src, { withFileTypes: true });

    for (const entry of entries) {
        const srcPath = path.join(src, entry.name);
        const destPath = path.join(dest, entry.name);

        if (entry.name === "node_modules" || entry.name === ".next") continue;

        if (entry.isDirectory()) {
            copyRecursive(srcPath, destPath);
        } else {
            fs.copyFileSync(srcPath, destPath);
        }
    }
}

async function main() {
    banner();

    const args = process.argv.slice(2);

    if (args.includes("--help") || args.includes("-h")) {
        log("  Usage: npx create-next-starter <project-name>", COLORS.bright);
        console.log("");
        log("  Options:", COLORS.bright);
        log("    --help, -h     Show this help message");
        log("    --version, -v  Show version number");
        console.log("");
        log("  Example:", COLORS.bright);
        log("    npx create-next-starter my-app");
        console.log("");
        process.exit(0);
    }

    if (args.includes("--version") || args.includes("-v")) {
        const pkg = require("../package.json");
        log(`  v${pkg.version}`, COLORS.cyan);
        process.exit(0);
    }

    const rl = readline.createInterface({
        input: process.stdin,
        output: process.stdout,
    });

    try {
        const projectName = args[0] || (await ask(rl, "Project name", "my-next-app"));
        const pkgManager = await ask(rl, "Package manager (npm/yarn/pnpm/bun)", "npm");

        rl.close();
        console.log("");

        const targetDir = path.resolve(process.cwd(), projectName);

        if (fs.existsSync(targetDir)) {
            log(`  ✖ Directory "${projectName}" already exists!`, COLORS.red);
            process.exit(1);
        }

        log(`  ⏳ Creating project in ${COLORS.bright}${targetDir}${COLORS.reset}...`);
        console.log("");

        // Copy template
        copyRecursive(TEMPLATE_DIR, targetDir);

        // Update package.json with project name
        const pkgJsonPath = path.join(targetDir, "package.json");
        const pkgJson = JSON.parse(fs.readFileSync(pkgJsonPath, "utf-8"));
        pkgJson.name = projectName;
        fs.writeFileSync(pkgJsonPath, JSON.stringify(pkgJson, null, 2) + "\n");

        // Rename gitignore (npm ignores .gitignore in publish)
        const gitignoreSrc = path.join(targetDir, "_gitignore");
        const gitignoreDest = path.join(targetDir, ".gitignore");
        if (fs.existsSync(gitignoreSrc)) {
            fs.renameSync(gitignoreSrc, gitignoreDest);
        }

        // Install dependencies
        log(`  📦 Installing dependencies with ${pkgManager}...`, COLORS.yellow);
        console.log("");

        const installCmd =
            pkgManager === "yarn" ? "yarn" : `${pkgManager} install`;

        execSync(installCmd, {
            cwd: targetDir,
            stdio: "inherit",
        });

        console.log("");
        log("  ✅ Project created successfully!", COLORS.green + COLORS.bright);
        console.log("");
        log("  Next steps:", COLORS.bright);
        log(`    cd ${projectName}`, COLORS.cyan);
        log(
            `    ${pkgManager === "npm" ? "npm run" : pkgManager} dev`,
            COLORS.cyan
        );
        console.log("");
        log("  🎉 Happy coding!", COLORS.magenta);
        console.log("");
    } catch (err) {
        rl.close();
        log(`\n  ✖ Error: ${err.message}`, COLORS.red);
        process.exit(1);
    }
}

main();
