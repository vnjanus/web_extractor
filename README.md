# 🕷️ Web Text Extractor

A sophisticated TypeScript application that uses Playwright to extract clean text content from any webpage while maintaining human-like browsing behavior to avoid detection.

![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?style=for-the-badge&logo=typescript&logoColor=white)
![Playwright](https://img.shields.io/badge/Playwright-45ba4b?style=for-the-badge&logo=playwright&logoColor=white)
![Express](https://img.shields.io/badge/Express-000000?style=for-the-badge&logo=express&logoColor=white)
![Node.js](https://img.shields.io/badge/Node.js-339933?style=for-the-badge&logo=nodedotjs&logoColor=white)

## ✨ Features

- **🔒 Human Fingerprinting**: Advanced browser fingerprinting that mimics real user behavior
- **🎯 Clean Text Extraction**: Removes scripts, styles, and formatting for pure text content
- **🌐 Beautiful Web Interface**: Modern, responsive UI for easy interaction
- **📋 Copy & Download**: One-click copy to clipboard or download as .txt file
- **⚡ TypeScript**: Full type safety with modern JavaScript features
- **🛡️ Error Handling**: Comprehensive error handling and validation
- **📱 Mobile Responsive**: Works perfectly on desktop and mobile devices
- **🚀 REST API**: RESTful endpoints for programmatic access

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ installed
- npm or yarn package manager

### Installation

1. **Clone the repository:**
```bash
git clone https://github.com/vnjanus/web_extractor.git
cd web_extractor
```

2. **Install dependencies:**
```bash
npm install
```

3. **Install Playwright browsers:**
```bash
npm run install-browsers
```

4. **Start the development server:**
```bash
npm run dev
```

5. **Open your browser and navigate to:**
```
http://localhost:3000
```

## 📋 Available Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start development server with hot reload |
| `npm run build` | Build for production |
| `npm start` | Start production server |
| `npm run install-browsers` | Install Playwright browser binaries |

## 🔧 How It Works

### Human Fingerprinting
The application uses sophisticated techniques to appear as a real human user:

- **Realistic Headers**: Authentic user agent and browser headers
- **Natural Viewport**: Standard desktop resolution (1366x768)
- **Browser Plugins**: Simulated Chrome PDF plugins and extensions
- **Human Timing**: Random delays between actions (1-3 seconds)
- **Geolocation**: New York timezone and coordinates
- **Device Properties**: Proper screen dimensions and color scheme

### Text Extraction Process

1. **Navigate** to the target webpage with human-like behavior
2. **Wait** for full page load including network activity
3. **Remove** scripts, styles, and non-content elements
4. **Extract** clean text using DOM APIs
5. **Format** and clean whitespace for readability
6. **Return** structured result with metadata

## 🏗️ Project Structure

```
web_extractor/
├── 📁 src/
│   ├── 📄 server.ts          # Express server and API endpoints
│   ├── 📄 extractor.ts       # Core Playwright text extraction logic
│   └── 📁 public/
│       ├── 📄 index.html     # Web interface
│       ├── 📄 style.css      # Modern styling with animations
│       └── 📄 script.js      # Frontend JavaScript
├── 📄 package.json           # Dependencies and scripts
├── 📄 tsconfig.json         # TypeScript configuration
├── 📄 .gitignore           # Git ignore rules
└── 📄 README.md             # Documentation
```

## 🌟 API Reference

### Extract Text from URL

**Endpoint:** `POST /extract`

**Request Body:**
```json
{
  "url": "https://example.com"
}
```

**Response:**
```json
{
  "success": true,
  "text": "Extracted text content from the webpage...",
  "url": "https://example.com",
  "timestamp": "2025-07-08T16:45:30.123Z"
}
```

**Error Response:**
```json
{
  "success": false,
  "error": "Invalid URL format",
  "url": "invalid-url",
  "timestamp": "2025-07-08T16:45:30.123Z"
}
```

### Health Check

**Endpoint:** `GET /health`

**Response:**
```json
{
  "status": "OK",
  "timestamp": "2025-07-08T16:45:30.123Z"
}
```

## 🛠️ Configuration

### Browser Settings

Modify browser launch options in `src/extractor.ts`:

```typescript
this.browser = await chromium.launch({
  headless: true,  // Set to false for debugging
  args: [
    '--no-sandbox',
    '--disable-setuid-sandbox',
    // ... other browser flags
  ],
});
```

### Custom Headers

Add custom headers in the browser context:

```typescript
extraHTTPHeaders: {
  'Custom-Header': 'value',
  'Authorization': 'Bearer token',
  // ... other headers
}
```

### Proxy Support

Enable proxy by adding to browser context:

```typescript
this.context = await this.browser.newContext({
  proxy: {
    server: 'http://proxy-server:port',
    username: 'username',
    password: 'password'
  },
  // ... other options
});
```

## 🔍 Advanced Usage

### Command Line Usage

```bash
# Extract text from URL using curl
curl -X POST http://localhost:3000/extract \
  -H "Content-Type: application/json" \
  -d '{"url": "https://example.com"}'
```

### Programmatic Usage

```javascript
const response = await fetch('http://localhost:3000/extract', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ url: 'https://example.com' })
});

const result = await response.json();
console.log(result.text);
```

## 🚀 Production Deployment

### Using Node.js

1. **Build the application:**
```bash
npm run build
```

2. **Set environment variables:**
```bash
export PORT=3000
export NODE_ENV=production
```

3. **Start the production server:**
```bash
npm start
```

### Using Docker

```dockerfile
FROM node:18-alpine

# Install dependencies for Playwright
RUN apk add --no-cache \
    chromium \
    nss \
    freetype \
    freetype-dev \
    harfbuzz \
    ca-certificates \
    ttf-freefont

# Set up working directory
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production

# Copy application code
COPY . .
RUN npm run build

# Install Playwright browsers
RUN npx playwright install chromium --with-deps

# Expose port
EXPOSE 3000

# Set environment variables
ENV NODE_ENV=production
ENV PLAYWRIGHT_SKIP_BROWSER_DOWNLOAD=1
ENV PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH=/usr/bin/chromium-browser

# Start the application
CMD ["npm", "start"]
```

**Build and run:**
```bash
docker build -t web-extractor .
docker run -p 3000:3000 web-extractor
```

## 🧪 Testing

### Manual Testing

1. Start the development server
2. Navigate to `http://localhost:3000`
3. Enter a test URL (e.g., `https://example.com`)
4. Verify text extraction works correctly

### API Testing

```bash
# Test health endpoint
curl http://localhost:3000/health

# Test extraction endpoint
curl -X POST http://localhost:3000/extract \
  -H "Content-Type: application/json" \
  -d '{"url": "https://httpbin.org/html"}'
```

## 🤝 Contributing

We welcome contributions! Here's how to get started:

1. **Fork the repository**
2. **Create a feature branch:** `git checkout -b feature/amazing-feature`
3. **Make your changes** and add tests if applicable
4. **Commit your changes:** `git commit -m 'Add amazing feature'`
5. **Push to the branch:** `git push origin feature/amazing-feature`
6. **Open a Pull Request**

### Development Guidelines

- Use TypeScript for all new code
- Follow the existing code style
- Add JSDoc comments for public methods
- Test your changes thoroughly
- Update documentation as needed

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## ⚠️ Legal Disclaimer

This tool is designed for legitimate use cases such as:
- Content research and analysis
- SEO and marketing research
- Academic research
- Personal data extraction

**Important:** Always respect website terms of service, robots.txt files, and applicable laws. Users are responsible for ensuring their use complies with all relevant regulations and website policies.

## 🐛 Troubleshooting

### Common Issues

**Browser installation fails:**
```bash
# Try manual installation
npx playwright install chromium --force
```

**Permission denied errors:**
```bash
# On Linux/Mac, ensure proper permissions
sudo chown -R $(whoami) ~/.cache/ms-playwright
```

**Port already in use:**
```bash
# Use a different port
export PORT=3001
npm run dev
```

**Memory issues with large pages:**
```bash
# Increase Node.js memory limit
export NODE_OPTIONS="--max-old-space-size=4096"
npm run dev
```

### Debug Mode

Enable debug mode by setting `headless: false` in `src/extractor.ts`:

```typescript
this.browser = await chromium.launch({
  headless: false,  // Shows browser window
  // ... other options
});
```

## 📊 Performance

- **Extraction Speed**: ~2-5 seconds per page
- **Memory Usage**: ~100-200MB per browser instance
- **Concurrent Requests**: Supports multiple simultaneous extractions
- **Browser Overhead**: ~50MB per Chromium instance

## 🔗 Related Projects

- [Playwright](https://playwright.dev/) - Browser automation framework
- [Puppeteer](https://pptr.dev/) - Alternative browser automation
- [Cheerio](https://cheerio.js.org/) - Server-side HTML parsing
- [Readability](https://github.com/mozilla/readability) - Content extraction

## 📞 Support

- 🐛 **Bug Reports**: [GitHub Issues](https://github.com/vnjanus/web_extractor/issues)
- 💡 **Feature Requests**: [GitHub Issues](https://github.com/vnjanus/web_extractor/issues)
- 📧 **Email**: Contact the repository owner
- 💬 **Discussions**: [GitHub Discussions](https://github.com/vnjanus/web_extractor/discussions)

## 🏆 Acknowledgments

- **Playwright Team** for the excellent browser automation framework
- **TypeScript Team** for making JavaScript development better
- **Express.js** for the lightweight web framework
- **Open Source Community** for inspiration and best practices

---

<div align="center">

**Made with ❤️ using TypeScript, Playwright, and modern web technologies**

⭐ **Star this repo if you found it helpful!** ⭐

</div>