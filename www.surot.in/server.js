const http = require('http');
const fs = require('fs');
const path = require('path');
const os = require('os');

const PORT = process.env.PORT || 3000;
const BASE_DIR = __dirname;

const MIME_TYPES = {
  '.html': 'text/html; charset=UTF-8',
  '.js': 'application/javascript; charset=UTF-8',
  '.css': 'text/css; charset=UTF-8',
  '.json': 'application/json; charset=UTF-8',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.png': 'image/png',
  '.gif': 'image/gif',
  '.svg': 'image/svg+xml',
  '.ico': 'image/x-icon',
  '.webp': 'image/webp'
};

const COMMENTS_FILE = path.join(BASE_DIR, 'comments.json');

const INITIAL_COMMENTS = [
  {
    id: 'comment-pinned-1',
    author: 'Surot Roy',
    role: 'Creator & Developer',
    isCreator: true,
    isPinned: true,
    isVerified: true,
    avatarText: 'SR',
    avatarGradient: 'linear-gradient(135deg, #6c80a8 0%, #54668D 50%, #3e4d6d 100%)',
    message: "Welcome to the community space! 🎉 Feel free to leave your thoughts, project feedback, or ask any questions about my work and tech stack. Let's build something epic together! 🚀",
    likes: 49,
    createdAt: Date.now() - 2 * 86400000
  },
  {
    id: 'comment-seed-2',
    author: 'Vikramaditya S.',
    role: 'Founder / Client',
    isCreator: false,
    isPinned: false,
    isVerified: true,
    avatarText: 'VS',
    avatarGradient: 'linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%)',
    message: 'The ABVP LALA Unit portal crafted by Surot is outstanding! Ultra-smooth navigation, great responsiveness, and the animations are buttery smooth. Highly recommend working with him! 🔥👏',
    likes: 19,
    createdAt: Date.now() - 18 * 3600000
  },
  {
    id: 'comment-seed-3',
    author: 'Aarav Roy',
    role: 'Developer',
    isCreator: false,
    isPinned: false,
    isVerified: false,
    avatarText: 'AR',
    avatarGradient: 'linear-gradient(135deg, #10b981 0%, #047857 100%)',
    message: 'The glassmorphism card physics and horizontal project scroll are top tier. Love the attention to detail on the micro-interactions! 💯✨',
    likes: 12,
    createdAt: Date.now() - 5 * 3600000
  },
  {
    id: 'comment-seed-4',
    author: 'Elena Rostova',
    role: 'UI/UX Designer',
    isCreator: false,
    isPinned: false,
    isVerified: true,
    avatarText: 'ER',
    avatarGradient: 'linear-gradient(135deg, #ec4899 0%, #be185d 100%)',
    message: 'Sleek color palette, crystal clear typography hierarchy, and effortless responsive design. Great job @SurotRoy! 😍⚡',
    likes: 9,
    createdAt: Date.now() - 1 * 3600000
  }
];

function getStoredComments() {
  try {
    if (fs.existsSync(COMMENTS_FILE)) {
      const data = fs.readFileSync(COMMENTS_FILE, 'utf-8');
      const parsed = JSON.parse(data);
      if (Array.isArray(parsed) && parsed.length > 0) {
        return parsed;
      }
    }
  } catch (err) {
    console.error('Error reading comments file:', err);
  }
  return INITIAL_COMMENTS;
}

function saveStoredComments(comments) {
  try {
    fs.writeFileSync(COMMENTS_FILE, JSON.stringify(comments, null, 2), 'utf-8');
  } catch (err) {
    console.error('Error writing comments file:', err);
  }
}

// ── Multi-Device Real-Time Server-Sent Events (SSE) Broadcast Hub ──
const sseClients = new Set();

function broadcastSse(eventType, payload) {
  const message = `event: ${eventType}\ndata: ${JSON.stringify(payload)}\n\n`;
  for (const client of sseClients) {
    try {
      client.write(message);
    } catch (err) {
      sseClients.delete(client);
    }
  }
}

// Periodic keep-alive ping to maintain live stream connection across mobile & desktop
setInterval(() => {
  for (const client of sseClients) {
    try {
      client.write(': keepalive\n\n');
    } catch (e) {
      sseClients.delete(client);
    }
  }
}, 15000);

function getLocalIpAddresses() {
  const interfaces = os.networkInterfaces();
  const addresses = [];
  for (const name of Object.keys(interfaces)) {
    for (const net of interfaces[name]) {
      if (net.family === 'IPv4' && !net.internal) {
        addresses.push(net.address);
      }
    }
  }
  return addresses;
}

const server = http.createServer((req, res) => {
  let decodedUrl;
  try {
    decodedUrl = decodeURIComponent(req.url.split('?')[0]);
  } catch (e) {
    res.writeHead(400, { 'Content-Type': 'text/plain' });
    return res.end('Bad Request');
  }

  // Set global CORS headers for any external or local devices
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    res.writeHead(204);
    return res.end();
  }

  // ── Real-Time Live Comments Event Stream (SSE) ──
  if (decodedUrl === '/api/comments/stream') {
    res.writeHead(200, {
      'Content-Type': 'text/event-stream; charset=UTF-8',
      'Cache-Control': 'no-cache, no-transform',
      'Connection': 'keep-alive',
      'Access-Control-Allow-Origin': '*'
    });
    res.write(`event: init\ndata: ${JSON.stringify({ connected: true, clients: sseClients.size + 1 })}\n\n`);

    sseClients.add(res);

    req.on('close', () => {
      sseClients.delete(res);
    });
    return;
  }

  // ── Comments Database API Endpoints ──
  if (decodedUrl === '/api/comments') {
    if (req.method === 'GET') {
      const comments = getStoredComments();
      res.writeHead(200, { 'Content-Type': 'application/json' });
      return res.end(JSON.stringify(comments));
    }

    if (req.method === 'POST') {
      let body = '';
      req.on('data', chunk => {
        body += chunk.toString();
      });
      req.on('end', () => {
        try {
          const payload = JSON.parse(body);
          let comments = getStoredComments();

          // 1. Live Like Action
          if (payload.action === 'like') {
            const comment = comments.find(c => c.id === payload.id);
            if (comment) {
              comment.likes = (comment.likes || 0) + (payload.delta || 1);
              if (comment.likes < 0) comment.likes = 0;
            }
            saveStoredComments(comments);
            broadcastSse('like_comment', { id: payload.id, likes: comment ? comment.likes : 0, delta: payload.delta || 1 });
            res.writeHead(200, { 'Content-Type': 'application/json' });
            return res.end(JSON.stringify({ success: true, comments }));
          }

          // 2. Live Delete Action
          if (payload.action === 'delete') {
            comments = comments.filter(c => c.id !== payload.id);
            saveStoredComments(comments);
            broadcastSse('delete_comment', { id: payload.id });
            res.writeHead(200, { 'Content-Type': 'application/json' });
            return res.end(JSON.stringify({ success: true, comments }));
          }

          // 3. New Live Comment Insertion
          if (payload.message && payload.author) {
            const newComment = {
              id: payload.id || ('comment-' + Date.now() + '-' + Math.random().toString(36).substr(2, 5)),
              author: payload.author.trim(),
              role: payload.role || 'Visitor',
              isCreator: false,
              isPinned: false,
              isVerified: false,
              avatarText: payload.avatarText || payload.author.substring(0, 2).toUpperCase(),
              avatarGradient: payload.avatarGradient || 'linear-gradient(135deg, #6c80a8, #54668D)',
              message: payload.message.trim(),
              likes: 0,
              createdAt: payload.createdAt || Date.now()
            };

            // Avoid duplicates
            if (!comments.some(c => c.id === newComment.id)) {
              // Insert after pinned comments
              const pinnedCount = comments.filter(c => c.isPinned).length;
              comments.splice(pinnedCount, 0, newComment);
              saveStoredComments(comments);
            }

            // Broadcast live to all connected devices instantly
            broadcastSse('new_comment', newComment);

            res.writeHead(201, { 'Content-Type': 'application/json' });
            return res.end(JSON.stringify({ success: true, comment: newComment, comments }));
          }

          res.writeHead(400, { 'Content-Type': 'application/json' });
          return res.end(JSON.stringify({ error: 'Invalid comment payload' }));
        } catch (err) {
          res.writeHead(400, { 'Content-Type': 'application/json' });
          return res.end(JSON.stringify({ error: 'Malformed JSON payload' }));
        }
      });
      return;
    }
  }

  let filePath = path.join(BASE_DIR, decodedUrl === '/' ? 'index.html' : decodedUrl);

  // Security check: prevent directory traversal outside BASE_DIR
  if (!filePath.startsWith(BASE_DIR)) {
    res.writeHead(403, { 'Content-Type': 'text/plain' });
    return res.end('Forbidden');
  }

  fs.stat(filePath, (err, stats) => {
    if (err || !stats.isFile()) {
      res.writeHead(404, { 'Content-Type': 'text/plain' });
      return res.end('404 Not Found');
    }

    const ext = path.extname(filePath).toLowerCase();
    const contentType = MIME_TYPES[ext] || 'application/octet-stream';

    // Cache image assets for instant response
    const headers = {
      'Content-Type': contentType,
      'Content-Length': stats.size,
      'Access-Control-Allow-Origin': '*'
    };

    if (ext === '.jpg' || ext === '.jpeg' || ext === '.png' || ext === '.webp') {
      headers['Cache-Control'] = 'public, max-age=31536000, immutable';
    } else {
      headers['Cache-Control'] = 'no-cache';
    }

    res.writeHead(200, headers);
    const stream = fs.createReadStream(filePath);
    stream.pipe(res);
  });
});

// Bind to 0.0.0.0 so ANY phone, tablet, or external device on the network can connect
server.listen(PORT, '0.0.0.0', () => {
  const ips = getLocalIpAddresses();
  console.log(`\n======================================================`);
  console.log(`🚀 Live Server & Real-Time Database Running!`);
  console.log(`💻 Local Machine:    http://localhost:${PORT}`);
  ips.forEach(ip => {
    console.log(`📱 Other Devices/WiFi: http://${ip}:${PORT}`);
  });
  console.log(`======================================================\n`);
});
