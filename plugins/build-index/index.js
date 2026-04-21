const fs = require('fs');
const path = require('path');

module.exports = {
  onBuild: async ({ utils }) => {
    console.log('Building content indexes...');
    
    const contentTypes = ['art', 'articles', 'books'];
    
    for (const type of contentTypes) {
      const dir = path.join(process.cwd(), 'content', type);
      
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
        fs.writeFileSync(path.join(dir, 'index.json'), '[]');
        continue;
      }
      
      const files = fs.readdirSync(dir)
        .filter(f => f.endsWith('.md'));
      
      const index = files.map(filename => {
        const content = fs.readFileSync(path.join(dir, filename), 'utf8');
        const match = content.match(/^---\n([\s\S]*?)\n---/);
        let date = new Date().toISOString();
        if (match) {
          const dateLine = match[1].split('\n').find(l => l.startsWith('date:'));
          if (dateLine) date = dateLine.replace('date:', '').trim().replace(/^["']|["']$/g, '');
        }
        return { filename, date };
      });
      
      // Sort newest first
      index.sort((a, b) => new Date(b.date) - new Date(a.date));
      
      fs.writeFileSync(
        path.join(dir, 'index.json'),
        JSON.stringify(index, null, 2)
      );
      
      console.log(`Built index for ${type}: ${index.length} items`);
    }
  }
};
