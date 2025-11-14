#!/usr/bin/env node

/**
 * Setup CLI for @studiozandra/svelte-ai-chat-widget
 * Installs backend templates and demo page into a SvelteKit project
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import readline from 'readline';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Colors for terminal output
const colors = {
	reset: '\x1b[0m',
	bright: '\x1b[1m',
	green: '\x1b[32m',
	yellow: '\x1b[33m',
	blue: '\x1b[34m',
	cyan: '\x1b[36m',
	red: '\x1b[31m'
};

function log(message, color = 'reset') {
	console.log(`${colors[color]}${message}${colors.reset}`);
}

function createInterface() {
	return readline.createInterface({
		input: process.stdin,
		output: process.stdout
	});
}

function question(rl, query) {
	return new Promise((resolve) => rl.question(query, resolve));
}

async function copyDirectory(src, dest) {
	await fs.promises.mkdir(dest, { recursive: true });
	const entries = await fs.promises.readdir(src, { withFileTypes: true });

	for (const entry of entries) {
		const srcPath = path.join(src, entry.name);
		const destPath = path.join(dest, entry.name);

		if (entry.isDirectory()) {
			await copyDirectory(srcPath, destPath);
		} else {
			await fs.promises.copyFile(srcPath, destPath);
		}
	}
}

async function fileExists(filePath) {
	try {
		await fs.promises.access(filePath);
		return true;
	} catch {
		return false;
	}
}

async function main() {
	log('\n╔════════════════════════════════════════════════════════════╗', 'cyan');
	log('║  @studiozandra/svelte-ai-chat-widget Setup                ║', 'cyan');
	log('╚════════════════════════════════════════════════════════════╝\n', 'cyan');

	// Get current working directory (user's project)
	const projectRoot = process.cwd();

	// Check if we're in a SvelteKit project
	const svelteConfigPath = path.join(projectRoot, 'svelte.config.js');
	const packageJsonPath = path.join(projectRoot, 'package.json');

	if (!(await fileExists(svelteConfigPath)) && !(await fileExists(packageJsonPath))) {
		log('❌ Error: Not in a SvelteKit project directory.', 'red');
		log('   Please run this command from your SvelteKit project root.\n', 'yellow');
		process.exit(1);
	}

	// Find the package templates directory
	const templatesDir = path.join(__dirname, '..', 'templates');

	if (!(await fileExists(templatesDir))) {
		log('❌ Error: Templates directory not found.', 'red');
		log('   Package may be corrupted. Try reinstalling.\n', 'yellow');
		process.exit(1);
	}

	const rl = createInterface();

	try {
		log('This setup will install:', 'bright');
		log('  ✓ Backend API endpoints (chat send & history)', 'green');
		log('  ✓ Database utilities (SQLite)', 'green');
		log('  ✓ Environment config', 'green');
		log('  ✓ Rate limiting', 'green');
		log('  ✓ Demo page (optional)\n', 'green');

		// Ask about demo page installation
		const installDemo = await question(
			rl,
			`${colors.blue}Install demo page? (y/n) [y]: ${colors.reset}`
		);
		const shouldInstallDemo = !installDemo || installDemo.toLowerCase() !== 'n';

		let demoRoutePath = 'chatbot-demo';
		let protectDemoPage = true;

		if (shouldInstallDemo) {
			const customRoute = await question(
				rl,
				`${colors.blue}Demo page route name [chatbot-demo]: ${colors.reset}`
			);
			if (customRoute && customRoute.trim()) {
				demoRoutePath = customRoute.trim();
			}

			// Ask about authentication protection
			log(`\n${colors.yellow}ℹ️  Note: Backend endpoints already require authentication.${colors.reset}`);
			log(`${colors.yellow}ℹ️  Choose 'n' only if you want to test the UI without auth first.${colors.reset}\n`);
			const protectPage = await question(
				rl,
				`${colors.blue}Protect demo page with authentication? (y/n) [y]: ${colors.reset}`
			);
			protectDemoPage = !protectPage || protectPage.toLowerCase() !== 'n';
		}

		log('\n📦 Installing backend files...', 'cyan');

		// Copy backend files
		const srcLibServer = path.join(projectRoot, 'src', 'lib', 'server');
		await fs.promises.mkdir(srcLibServer, { recursive: true });

		// Copy server utilities
		const backendFiles = ['db.ts', 'env.ts', 'rate-limit.ts'];
		for (const file of backendFiles) {
			const src = path.join(templatesDir, 'backend', file);
			const dest = path.join(srcLibServer, file);

			if (await fileExists(dest)) {
				log(`  ⚠️  Skipping ${file} (already exists)`, 'yellow');
			} else {
				await fs.promises.copyFile(src, dest);
				log(`  ✓ Created src/lib/server/${file}`, 'green');
			}
		}

		// Copy API routes
		const apiRoutesDir = path.join(projectRoot, 'src', 'routes', 'api', 'chat');
		await fs.promises.mkdir(apiRoutesDir, { recursive: true });

		// Copy send endpoint
		const sendDir = path.join(apiRoutesDir, 'send');
		await fs.promises.mkdir(sendDir, { recursive: true });
		const sendSrc = path.join(templatesDir, 'backend', 'api', 'chat', 'send', '+server.ts');
		const sendDest = path.join(sendDir, '+server.ts');

		if (await fileExists(sendDest)) {
			log(`  ⚠️  Skipping send endpoint (already exists)`, 'yellow');
		} else {
			await fs.promises.copyFile(sendSrc, sendDest);
			log(`  ✓ Created src/routes/api/chat/send/+server.ts`, 'green');
		}

		// Copy history endpoint
		const historyDir = path.join(apiRoutesDir, 'history');
		await fs.promises.mkdir(historyDir, { recursive: true });
		const historySrc = path.join(templatesDir, 'backend', 'api', 'chat', 'history', '+server.ts');
		const historyDest = path.join(historyDir, '+server.ts');

		if (await fileExists(historyDest)) {
			log(`  ⚠️  Skipping history endpoint (already exists)`, 'yellow');
		} else {
			await fs.promises.copyFile(historySrc, historyDest);
			log(`  ✓ Created src/routes/api/chat/history/+server.ts`, 'green');
		}

		// Copy .env.example
		const envExampleSrc = path.join(templatesDir, 'backend', '.env.example');
		const envExampleDest = path.join(projectRoot, '.env.example');

		if (await fileExists(envExampleDest)) {
			log(`  ⚠️  Skipping .env.example (already exists)`, 'yellow');
		} else {
			await fs.promises.copyFile(envExampleSrc, envExampleDest);
			log(`  ✓ Created .env.example`, 'green');
		}

		// Copy demo page
		if (shouldInstallDemo) {
			log('\n📄 Installing demo page...', 'cyan');
			const demoDir = path.join(projectRoot, 'src', 'routes', demoRoutePath);
			await fs.promises.mkdir(demoDir, { recursive: true });

			const demoSrc = path.join(templatesDir, 'chat-page-template.svelte');
			const demoDest = path.join(demoDir, '+page.svelte');

			if (await fileExists(demoDest)) {
				log(`  ⚠️  Demo page already exists at src/routes/${demoRoutePath}/+page.svelte`, 'yellow');
			} else {
				await fs.promises.copyFile(demoSrc, demoDest);
				log(`  ✓ Created src/routes/${demoRoutePath}/+page.svelte`, 'green');
			}

			// Copy +page.server.ts if authentication protection is enabled
			if (protectDemoPage) {
				const serverSrc = path.join(templatesDir, 'chat-page-server-template.ts');
				const serverDest = path.join(demoDir, '+page.server.ts');

				if (await fileExists(serverDest)) {
					log(`  ⚠️  Server file already exists at src/routes/${demoRoutePath}/+page.server.ts`, 'yellow');
				} else {
					await fs.promises.copyFile(serverSrc, serverDest);
					log(`  ✓ Created src/routes/${demoRoutePath}/+page.server.ts (auth protected)`, 'green');
				}
			} else {
				log(`  ⚠️  Demo page is NOT protected by authentication`, 'yellow');
				log(`     Users can access it without logging in`, 'yellow');
			}
		}

		// Success message
		log('\n✅ Setup complete!', 'green');
		log('\n┌─────────────────────────────────────────────────┐', 'cyan');
		log('│  Next Steps:                                    │', 'cyan');
		log('└─────────────────────────────────────────────────┘', 'cyan');

		log('\n1. Install dependencies:', 'bright');
		log('   npm install @anthropic-ai/sdk better-sqlite3 @types/better-sqlite3', 'yellow');

		log('\n2. Set up Better Auth (required):', 'bright');
		log('   npm install better-auth', 'yellow');
		log('   See: https://www.better-auth.com/docs', 'blue');

		log('\n3. Configure your environment:', 'bright');
		log('   cp .env.example .env', 'yellow');
		log('   # Add your ANTHROPIC_API_KEY to .env', 'yellow');

		log('\n4. Start your dev server:', 'bright');
		log('   npm run dev', 'yellow');

		if (shouldInstallDemo) {
			log(`\n5. View the demo at:`, 'bright');
			log(`   http://localhost:5173/${demoRoutePath}`, 'cyan');
		}

		log('\n📚 Documentation:', 'bright');
		log('   Backend setup: templates/backend/BACKEND_SETUP.md', 'blue');
		log('   Main README: node_modules/@studiozandra/svelte-ai-chat-widget/README.md\n', 'blue');

		log('Need help? https://github.com/studiozandra/svelte-ai-chat-widget/issues\n', 'cyan');
	} catch (error) {
		log(`\n❌ Setup failed: ${error.message}`, 'red');
		process.exit(1);
	} finally {
		rl.close();
	}
}

main();
