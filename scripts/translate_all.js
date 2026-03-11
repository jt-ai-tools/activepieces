const fs = require('fs');
const path = require('path');
const { exec } = require('child_process');
const util = require('util');

const execAsync = util.promisify(exec);
const PROGRESS_FILE = path.join(__dirname, '..', 'PROGRESS.md');
const CONCURRENCY_LIMIT = 3;

const PROMPT = `You are an expert technical translator. Translate the following markdown file to Traditional Chinese (Taiwan).
Rules:
1. Maintain the exact original markdown structure, formatting, and code blocks.
2. Only output the translated markdown content. Do NOT wrap your entire response in a markdown code block.
3. Update any internal links that point to .md or .mdx files to point to their _zh_TW counterparts. For example, [Link](./path/to/file.md) becomes [Link](./path/to/file_zh_TW.md).
4. Do NOT translate code, variable names, or technical terms that are better left in English (e.g. API keys, function names).
`;

async function translateFile(filePath) {
    const isMdx = filePath.endsWith('.mdx');
    const outPath = filePath.replace(/\.mdx?$/, isMdx ? '_zh_TW.mdx' : '_zh_TW.md');
    
    // Read original content
    const content = fs.readFileSync(filePath, 'utf-8');
    
    const tempInFile = filePath + '.temp_in.txt';
    fs.writeFileSync(tempInFile, content);

    const geminiPath = '/Users/JamesTzeng/.nvm/versions/node/v22.21.1/bin/gemini';
    const cmd = `cat "${tempInFile}" | ${geminiPath} -p "${PROMPT.replace(/"/g, '\\"')}" --output-format text --yolo 2>/dev/null`;
    
    try {
        console.log(`[+] Translating: ${filePath}`);
        // Increased timeout to 10 minutes per file
        const { stdout } = await execAsync(cmd, { maxBuffer: 1024 * 1024 * 50, timeout: 600000 }); 
        
        if (!stdout || stdout.trim().length === 0) {
            console.error(`[X] Empty output for ${filePath}`);
            if (fs.existsSync(tempInFile)) fs.unlinkSync(tempInFile);
            return { success: false, error: 'Empty output' };
        }
        
        let translated = stdout.trim();
        if (translated.startsWith('```markdown')) {
            translated = translated.replace(/^```markdown\n?/, '').replace(/\n```$/, '');
        }
        
        fs.writeFileSync(outPath, translated);
        console.log(`[✓] Completed: ${outPath}`);
        
        if (fs.existsSync(tempInFile)) fs.unlinkSync(tempInFile);
        
        return { success: true, outPath };
    } catch (err) {
        console.error(`[X] Error translating ${filePath}:`, err.message);
        if (fs.existsSync(tempInFile)) fs.unlinkSync(tempInFile);
        return { success: false, error: err.message };
    }
}

async function updateProgress(originalPath, outPath) {
    const lines = fs.readFileSync(PROGRESS_FILE, 'utf-8').split('\n');
    for (let i = 0; i < lines.length; i++) {
        if (lines[i].includes(`| ${originalPath} | Pending |`)) {
            lines[i] = `| ${originalPath} | Completed | [${path.basename(outPath)}](${outPath}) |`;
            break;
        }
    }
    fs.writeFileSync(PROGRESS_FILE, lines.join('\n'));
}

async function commitAndPush() {
    console.log('[*] Committing progress...');
    try {
        const { stdout: status } = await execAsync('git status --porcelain');
        if (status.trim().length > 0) {
            await execAsync('git add . && git commit -m "docs: auto-translate batch of markdown files to Traditional Chinese" && git push');
            console.log('[✓] Pushed to remote.');
        } else {
            console.log('[~] No changes to commit.');
        }
    } catch (err) {
        console.error('[!] Commit/push failed:', err.message);
    }
}

async function main() {
    if (!fs.existsSync(PROGRESS_FILE)) {
        console.error('PROGRESS.md not found.');
        return;
    }

    const lines = fs.readFileSync(PROGRESS_FILE, 'utf-8').split('\n');
    const pendingFiles = lines
        .filter(line => line.includes('| Pending |'))
        .map(line => line.split('|')[1].trim())
        .slice(0, 50);

    console.log(`Found ${pendingFiles.length} files to translate.`);

    // Heartbeat to prevent timeout
    setInterval(() => {
        console.log(`[Heartbeat] Still working... Current index: ${i}`);
    }, 60000);

    for (var i = 0; i < pendingFiles.length; i += CONCURRENCY_LIMIT) {
        const chunk = pendingFiles.slice(i, i + CONCURRENCY_LIMIT);
        console.log(`\n--- Processing chunk ${i / CONCURRENCY_LIMIT + 1} (${chunk.length} files) ---`);
        
        const promises = chunk.map(async (filePath) => {
            try {
                const res = await translateFile(filePath);
                if (res.success) {
                    await updateProgress(filePath, res.outPath);
                }
            } catch (e) {
                console.error(`[X] Task failed for ${filePath}:`, e.message);
            }
        });

        await Promise.all(promises);

        if ((i + chunk.length) % 15 === 0 || (i + chunk.length) === pendingFiles.length) {
            await commitAndPush();
        }
    }

    console.log('\n🎉 All translations completed!');
}

main().catch(err => {
    console.error('Fatal error in main:', err);
});
