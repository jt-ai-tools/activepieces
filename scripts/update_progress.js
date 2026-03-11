const fs = require('fs');

function updateProgress() {
    let content = fs.readFileSync('PROGRESS.md', 'utf8');
    const lines = content.split('\n');
    const newLines = lines.map(line => {
        if (line.includes('|') && line.includes('Pending')) {
            const parts = line.split('|');
            const filePath = parts[1].trim();
            const ext = filePath.split('.').pop();
            const base = filePath.substring(0, filePath.lastIndexOf('.'));
            const translatedPath = `${base}_zh_TW.${ext}`;
            
            if (fs.existsSync(translatedPath)) {
                const fileName = translatedPath.split('/').pop();
                return `| ${filePath} | Completed | [${fileName}](${translatedPath}) |`;
            }
        }
        return line;
    });
    
    fs.writeFileSync('PROGRESS.md', newLines.join('\n'));
}

updateProgress();
