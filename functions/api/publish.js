export async function onRequestPost(context) {
  const { request, env } = context;
  try {
    const payload = await request.json();
    const { type, title, author, description, body, link, image, date } = payload;
    if (!title || !type || !author) return new Response('Missing fields', { status: 400 });

    const slug = title.toLowerCase().replace(/[^a-z0-9\s-]/g,'').replace(/\s+/g,'-').slice(0,50) + '-' + Date.now();
    const filename = `${slug}.md`;

    let imageUrl = '';
    if (image && image.startsWith('data:image')) {
      const ext = image.split(';')[0].split('/')[1];
      const imgFilename = `uploads/${slug}.${ext}`;
      const imgBase64 = image.split(',')[1];
      await githubAPI(env, `contents/${imgFilename}`, 'PUT', {
        message: `Add image: ${title}`,
        content: imgBase64,
      });
      imageUrl = `/${imgFilename}`;
    }

    const lines = ['---', `title: "${title.replace(/"/g,'\\"')}"`, `author: "${author}"`, `description: "${(description||'').replace(/"/g,'\\"')}"`];
    if (imageUrl) lines.push(`image: "${imageUrl}"`);
    if (link) lines.push(`file: "${link}"`);
    lines.push(`date: "${date}"`, '---');
    const mdContent = body ? lines.join('\n') + '\n\n' + body : lines.join('\n');

    await githubAPI(env, `contents/content/${type}/${filename}`, 'PUT', {
      message: `Publish ${type}: ${title} by ${author}`,
      content: btoa(unescape(encodeURIComponent(mdContent))),
    });

    await updateIndex(env, type, filename, date);

    return new Response(JSON.stringify({ success: true }), { status: 200, headers: { 'Content-Type': 'application/json' } });
  } catch (err) {
    return new Response(err.message || 'Error', { status: 500 });
  }
}

async function githubAPI(env, path, method, body) {
  const res = await fetch(`https://api.github.com/repos/${env.GITHUB_REPO}/${path}`, {
    method,
    headers: { 'Authorization': `Bearer ${env.GITHUB_TOKEN}`, 'Content-Type': 'application/json', 'User-Agent': 'CreativeGeneration' },
    body: JSON.stringify(body),
  });
  if (!res.ok) throw new Error(`GitHub ${res.status}: ${await res.text()}`);
  return res.json();
}

async function updateIndex(env, type, filename, date) {
  const res = await fetch(`https://api.github.com/repos/${env.GITHUB_REPO}/contents/content/${type}/index.json`, {
    headers: { 'Authorization': `Bearer ${env.GITHUB_TOKEN}`, 'User-Agent': 'CreativeGeneration' },
  });
  let index = [], sha = null;
  if (res.ok) {
    const data = await res.json();
    sha = data.sha;
    index = JSON.parse(atob(data.content.replace(/\n/g,'')));
  }
  index.unshift({ filename, date });
  const body = { message: `Update ${type} index`, content: btoa(JSON.stringify(index, null, 2)) };
  if (sha) body.sha = sha;
  await githubAPI(env, `contents/content/${type}/index.json`, 'PUT', body);
}
