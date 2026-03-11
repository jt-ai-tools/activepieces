const fs = require('fs');
const path = require('path');

function updateLinksInFile(filePath) {
    let content = fs.readFileSync(filePath, 'utf8');
    const dir = path.dirname(filePath);
    
    // Pattern for [text](link)
    // Avoid updating external links (http/https)
    const linkRegex = /\[([^\]]+)\]\(([^)]+)\)/g;
    
    let updated = false;
    const newContent = content.replace(linkRegex, (match, text, link) => {
        // Skip external links
        if (link.startsWith('http://') || link.startsWith('https://') || link.startsWith('mailto:')) {
            return match;
        }
        
        // Skip anchors
        if (link.startsWith('#')) {
            return match;
        }

        // Get file extension and path parts
        const parsedPath = path.parse(link);
        if (parsedPath.ext === '.md' || parsedPath.ext === '.mdx') {
            // Check if it already has _zh_TW
            if (parsedPath.name.endsWith('_zh_TW')) {
                return match;
            }
            
            const zhTwLink = `${parsedPath.dir ? parsedPath.dir + '/' : ''}${parsedPath.name}_zh_TW${parsedPath.ext}${parsedPath.base.includes('#') ? '#' + parsedPath.base.split('#')[1] : ''}`;
            
            // Check if the file actually exists
            const absolutePath = path.resolve(dir, parsedPath.dir, `${parsedPath.name}${parsedPath.ext}`);
            const absoluteZhTwPath = path.resolve(dir, parsedPath.dir, `${parsedPath.name}_zh_TW${parsedPath.ext}`);
            
            if (fs.existsSync(absoluteZhTwPath)) {
                updated = true;
                return `[${text}](${zhTwLink})`;
            }
        }
        
        return match;
    });
    
    if (updated) {
        fs.writeFileSync(filePath, newContent);
        console.log(`Updated links in: ${filePath}`);
    }
}

// Find all _zh_TW files
const { execSync } = require('child_process');
try {
    const output = execSync('find . -type f \\( -name "*_zh_TW.md" -o -name "*_zh_TW.mdx" \\) ! -path "*/node_modules/*"').toString();
    const files = output.split('\n').filter(Boolean);
    
    files.forEach(file => {
        updateLinksInFile(file);
    });
} catch (err) {
    console.error('Error finding files:', err);
}
