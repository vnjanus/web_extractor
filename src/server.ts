import express from 'express';
import cors from 'cors';
import path from 'path';
import { WebTextExtractor } from './extractor';

const app = express();
const port = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// Initialize the extractor
const extractor = new WebTextExtractor();

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

// Text extraction endpoint
app.post('/extract', async (req, res) => {
  try {
    const { url } = req.body;

    if (!url) {
      return res.status(400).json({
        success: false,
        error: 'URL is required',
      });
    }

    // Validate URL format
    try {
      new URL(url);
    } catch (error) {
      return res.status(400).json({
        success: false,
        error: 'Invalid URL format',
      });
    }

    // Extract text
    const result = await extractor.extractText(url);
    res.json(result);

  } catch (error) {
    console.error('Extraction error:', error);
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Internal server error',
    });
  }
});

// Start server
async function startServer() {
  try {
    console.log('Initializing browser...');
    await extractor.initialize();
    console.log('Browser initialized successfully');

    app.listen(port, () => {
      console.log(`Server running at http://localhost:${port}`);
      console.log('Ready to extract text from web pages!');
    });

    // Graceful shutdown
    process.on('SIGINT', async () => {
      console.log('\nShutting down server...');
      await extractor.close();
      process.exit(0);
    });

  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
}

startServer();