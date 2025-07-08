import { chromium, Browser, BrowserContext, Page } from 'playwright';

export interface ExtractionResult {
  success: boolean;
  text?: string;
  markdown?: string;
  html?: string;
  error?: string;
  url: string;
  timestamp: string;
}

export class WebTextExtractor {
  private browser: Browser | null = null;
  private context: BrowserContext | null = null;

  async initialize(): Promise<void> {
    try {
      // Launch browser with human-like fingerprinting
      this.browser = await chromium.launch({
        headless: true, // Set to false for debugging
        args: [
          '--no-sandbox',
          '--disable-setuid-sandbox',
          '--disable-dev-shm-usage',
          '--disable-accelerated-2d-canvas',
          '--no-first-run',
          '--no-zygote',
          '--disable-gpu',
          '--disable-features=VizDisplayCompositor',
        ],
      });

      // Create context with human fingerprinting
      this.context = await this.browser.newContext({
        viewport: { width: 1366, height: 768 },
        userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/119.0.0.0 Safari/537.36',
        locale: 'en-US',
        timezoneId: 'America/New_York',
        permissions: ['geolocation'],
        geolocation: { longitude: -74.006, latitude: 40.7128 }, // New York
        colorScheme: 'light',
        extraHTTPHeaders: {
          'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,image/apng,*/*;q=0.8',
          'Accept-Language': 'en-US,en;q=0.9',
          'Accept-Encoding': 'gzip, deflate, br',
          'DNT': '1',
          'Connection': 'keep-alive',
          'Upgrade-Insecure-Requests': '1',
        }
      });

      // Add additional fingerprinting
      await this.context.addInitScript(() => {
        // Override webdriver property
        Object.defineProperty(navigator, 'webdriver', {
          get: () => undefined,
        });

        // Add realistic plugins
        Object.defineProperty(navigator, 'plugins', {
          get: () => [
            {
              name: 'Chrome PDF Plugin',
              filename: 'internal-pdf-viewer',
              description: 'Portable Document Format',
            },
            {
              name: 'Chrome PDF Viewer',
              filename: 'mhjfbmdgcfjbbpaeojofohoefgiehjai',
              description: '',
            },
            {
              name: 'Native Client',
              filename: 'internal-nacl-plugin',
              description: '',
            },
          ],
        });

        // Mock languages
        Object.defineProperty(navigator, 'languages', {
          get: () => ['en-US', 'en'],
        });

        // Mock permissions
        const originalQuery = window.navigator.permissions.query;
        window.navigator.permissions.query = (parameters) => (
          parameters.name === 'notifications' ?
            Promise.resolve({ state: Notification.permission } as any) :
            originalQuery(parameters)
        );

        // Add realistic screen properties
        Object.defineProperty(screen, 'availWidth', { get: () => 1366 });
        Object.defineProperty(screen, 'availHeight', { get: () => 728 });
        Object.defineProperty(screen, 'width', { get: () => 1366 });
        Object.defineProperty(screen, 'height', { get: () => 768 });
      });

    } catch (error) {
      throw new Error(`Failed to initialize browser: ${error}`);
    }
  }

  async extractText(url: string): Promise<ExtractionResult> {
    if (!this.context) {
      throw new Error('Browser not initialized. Call initialize() first.');
    }

    const page = await this.context.newPage();
    
    try {
      // Navigate with human-like behavior
      await page.goto(url, {
        waitUntil: 'domcontentloaded',
        timeout: 30000,
      });

      // Wait for page to fully load
      await page.waitForLoadState('networkidle', { timeout: 10000 });

      // Add some human-like delay
      await page.waitForTimeout(Math.random() * 2000 + 1000);

      // Extract text content as markdown
      const textContent = await page.evaluate(() => {
        // Remove script and style elements
        const scripts = document.querySelectorAll('script, style, noscript');
        scripts.forEach(el => el.remove());

        // Function to process HTML tables into markdown
        function processTable(table: Element): string {
          const rows = Array.from(table.querySelectorAll('tr'));
          console.log('processTable called with', rows.length, 'rows');
          if (rows.length === 0) {
            console.log('No rows found in table');
            return '';
          }
          
          let tableMarkdown = '';
          let isFirstRow = true;
          
          for (const row of rows) {
            // Look for both direct children and descendant cells
            const cells = Array.from(row.querySelectorAll('td, th'));
            if (cells.length === 0) continue;
            
            // Extract cell contents more carefully
            const cellContents = cells.map(cell => {
              // Get only the direct text content, not nested elements
              let text = '';
              for (const node of Array.from(cell.childNodes)) {
                if (node.nodeType === Node.TEXT_NODE) {
                  text += node.textContent?.trim() || '';
                } else if (node.nodeType === Node.ELEMENT_NODE) {
                  // For elements, get their text content but avoid nested tables
                  const element = node as Element;
                  if (element.tagName.toLowerCase() !== 'table') {
                    text += ' ' + (element.textContent?.trim() || '');
                  }
                }
              }
              
              // Clean up and escape pipe characters
              text = text.replace(/\s+/g, ' ').trim();
              return text.replace(/\|/g, '\\|') || ' ';
            });
            
            // Ensure we have content for the row
            if (cellContents.some(content => content.trim() !== '')) {
              // Create table row
              tableMarkdown += '| ' + cellContents.join(' | ') + ' |\n';
              
              // Add header separator for first row
              if (isFirstRow) {
                const separator = cellContents.map(() => '---').join(' | ');
                tableMarkdown += '| ' + separator + ' |\n';
                isFirstRow = false;
              }
            }
          }
          
          return tableMarkdown;
        }

        // Function to convert HTML elements to markdown
        function htmlToMarkdown(element: Element): string {
          let markdown = '';
          
          for (const node of Array.from(element.childNodes)) {
            if (node.nodeType === Node.TEXT_NODE) {
              const text = node.textContent?.trim() || '';
              if (text) {
                markdown += text + ' ';
              }
            } else if (node.nodeType === Node.ELEMENT_NODE) {
              const el = node as Element;
              const tagName = el.tagName.toLowerCase();
              
              switch (tagName) {
                case 'h1':
                  markdown += `\n# ${el.textContent?.trim()}\n\n`;
                  break;
                case 'h2':
                  markdown += `\n## ${el.textContent?.trim()}\n\n`;
                  break;
                case 'h3':
                  markdown += `\n### ${el.textContent?.trim()}\n\n`;
                  break;
                case 'h4':
                  markdown += `\n#### ${el.textContent?.trim()}\n\n`;
                  break;
                case 'h5':
                  markdown += `\n##### ${el.textContent?.trim()}\n\n`;
                  break;
                case 'h6':
                  markdown += `\n###### ${el.textContent?.trim()}\n\n`;
                  break;
                case 'p':
                  const pText = htmlToMarkdown(el);
                  if (pText.trim()) {
                    // Ensure paragraph separation
                    markdown += `\n${pText.trim()}\n\n`;
                  }
                  break;
                case 'strong':
                case 'b':
                  markdown += `**${el.textContent?.trim()}**`;
                  break;
                case 'em':
                case 'i':
                  markdown += `*${el.textContent?.trim()}*`;
                  break;
                case 'a':
                  const href = el.getAttribute('href');
                  const linkText = el.textContent?.trim() || '';
                  if (href && linkText) {
                    markdown += `[${linkText}](${href})`;
                  } else {
                    markdown += linkText;
                  }
                  break;
                case 'ul':
                case 'ol':
                  markdown += '\n';
                  const isOrdered = tagName === 'ol';
                  const listItems = el.querySelectorAll('li');
                  listItems.forEach((li, index) => {
                    const bullet = isOrdered ? `${index + 1}.` : '-';
                    const liContent = htmlToMarkdown(li);
                    markdown += `${bullet} ${liContent.trim()}\n`;
                  });
                  markdown += '\n';
                  break;
                case 'dl':
                  markdown += '\n';
                  const dtElements = el.querySelectorAll('dt');
                  const ddElements = el.querySelectorAll('dd');
                  for (let i = 0; i < Math.min(dtElements.length, ddElements.length); i++) {
                    const term = dtElements[i].textContent?.trim() || '';
                    const definition = ddElements[i].textContent?.trim() || '';
                    markdown += `**${term}**: ${definition}\n\n`;
                  }
                  break;
                case 'blockquote':
                  const quoteText = el.textContent?.trim() || '';
                  if (quoteText) {
                    markdown += `\n> ${quoteText}\n\n`;
                  }
                  break;
                case 'code':
                  markdown += `\`${el.textContent?.trim()}\``;
                  break;
                case 'pre':
                  markdown += `\n\`\`\`\n${el.textContent?.trim()}\n\`\`\`\n\n`;
                  break;
                case 'br':
                  markdown += '\n';
                  break;
                case 'hr':
                  markdown += '\n---\n\n';
                  break;
                case 'table':
                  // Process table specifically and don't recurse into its content
                  console.log('Processing table in htmlToMarkdown');
                  const tableMarkdown = processTable(el);
                  console.log('Table markdown generated:', tableMarkdown.length, 'characters');
                  markdown += '\n' + tableMarkdown + '\n\n';
                  break;
                case 'div':
                case 'section':
                case 'article':
                case 'main':
                case 'aside':
                case 'header':
                case 'footer':
                case 'nav':
                  // Process content blocks with proper spacing
                  const divContent = htmlToMarkdown(el);
                  if (divContent.trim()) {
                    markdown += divContent + '\n\n';
                  }
                  break;
                case 'figure':
                  const figContent = htmlToMarkdown(el);
                  if (figContent.trim()) {
                    markdown += `\n${figContent.trim()}\n\n`;
                  }
                  break;
                case 'figcaption':
                  const caption = el.textContent?.trim() || '';
                  if (caption) {
                    markdown += `\n*${caption}*\n\n`;
                  }
                  break;
                default:
                  markdown += htmlToMarkdown(el);
                  break;
              }
            }
          }
          
          return markdown;
        }

        // Find Policy and Background h2 headers
        const h2Elements = document.querySelectorAll('h2');
        let policyElement: Element | null = null;
        let backgroundElement: Element | null = null;
        
        for (const h2 of Array.from(h2Elements)) {
          const text = h2.textContent?.trim().toLowerCase() || '';
          if (text.includes('policy')) {
            policyElement = h2;
          } else if (text.includes('background') && policyElement) {
            backgroundElement = h2;
            break;
          }
        }
        
        if (!policyElement) {
          return 'No "Policy" h2 header found';
        }
        
        // Collect elements between Policy and Background headers
        const elementsToProcess: Element[] = [];
        let currentElement = policyElement.nextElementSibling;
        
        while (currentElement && currentElement !== backgroundElement) {
          elementsToProcess.push(currentElement);
          currentElement = currentElement.nextElementSibling;
        }
        
        if (elementsToProcess.length === 0) {
          return 'No content found between Policy and Background headers';
        }
        
        // Convert only the filtered elements to markdown
        let markdown = `## ${policyElement.textContent?.trim()}\n\n`;
        
        // Debug: Check for tables in the filtered elements
        const tablesInSection = elementsToProcess.filter(el => el.tagName?.toLowerCase() === 'table');
        console.log('Direct tables found in Policy section:', tablesInSection.length);
        
        // Also check for nested tables
        let nestedTables = 0;
        for (const element of elementsToProcess) {
          const nestedTableElements = element.querySelectorAll('table');
          nestedTables += nestedTableElements.length;
        }
        console.log('Nested tables found in Policy section:', nestedTables);
        
        for (const element of elementsToProcess) {
          if (element.tagName?.toLowerCase() === 'table') {
            console.log('Processing table element directly');
          }
          markdown += htmlToMarkdown(element);
        }
        
        // Clean up excessive whitespace and newlines while preserving paragraph breaks
        markdown = markdown
          .replace(/\n\s*\n\s*\n/g, '\n\n') // Replace multiple newlines with double newlines
          .replace(/[ \t]+/g, ' ') // Replace multiple spaces/tabs with single space (but preserve newlines)
          .replace(/\n /g, '\n') // Remove spaces after newlines
          .replace(/\n\n\n+/g, '\n\n') // Limit to maximum double newlines
          .trim();
        
        return markdown;
      });

      await page.close();

      return {
        success: true,
        text: textContent, // Keep for backwards compatibility
        markdown: textContent,
        url,
        timestamp: new Date().toISOString(),
      };

    } catch (error) {
      await page.close();
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error occurred',
        url,
        timestamp: new Date().toISOString(),
      };
    }
  }

  async close(): Promise<void> {
    if (this.context) {
      await this.context.close();
      this.context = null;
    }
    if (this.browser) {
      await this.browser.close();
      this.browser = null;
    }
  }
}