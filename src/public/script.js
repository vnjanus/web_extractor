class WebTextExtractorUI {
    constructor() {
        this.form = document.getElementById('extractForm');
        this.urlInput = document.getElementById('urlInput');
        this.extractBtn = document.getElementById('extractBtn');
        this.btnText = this.extractBtn.querySelector('.btn-text');
        this.loadingText = this.extractBtn.querySelector('.loading');
        this.results = document.getElementById('results');
        this.error = document.getElementById('error');
        this.textOutput = document.getElementById('textOutput');
        this.htmlOutput = document.getElementById('htmlOutput');
        this.urlDisplay = document.getElementById('urlDisplay');
        this.timestamp = document.getElementById('timestamp');
        this.copyBtn = document.getElementById('copyBtn');
        this.downloadBtn = document.getElementById('downloadBtn');
        this.errorMessage = document.getElementById('errorMessage');
        
        // Store the raw markdown for copy/download
        this.rawMarkdown = '';

        this.bindEvents();
    }

    bindEvents() {
        this.form.addEventListener('submit', (e) => this.handleSubmit(e));
        this.copyBtn.addEventListener('click', () => this.copyToClipboard());
        this.downloadBtn.addEventListener('click', () => this.downloadText());
    }

    async handleSubmit(e) {
        e.preventDefault();
        
        const url = this.urlInput.value.trim();
        if (!url) {
            this.showError('Please enter a URL');
            return;
        }

        this.setLoading(true);
        this.hideResults();
        this.hideError();

        try {
            const response = await fetch('/extract', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ url }),
            });

            const result = await response.json();

            if (result.success) {
                this.showResults(result);
            } else {
                this.showError(result.error || 'Failed to extract text');
            }
        } catch (error) {
            console.error('Request failed:', error);
            this.showError('Network error. Please check your connection and try again.');
        } finally {
            this.setLoading(false);
        }
    }

    setLoading(loading) {
        this.extractBtn.disabled = loading;
        this.btnText.style.display = loading ? 'none' : 'inline';
        this.loadingText.style.display = loading ? 'inline' : 'none';
    }

    showResults(result) {
        // Store raw markdown for copy/download
        this.rawMarkdown = result.markdown || result.text || 'No text content found';
        
        // Display HTML if available, otherwise fallback to text
        if (result.html) {
            this.htmlOutput.innerHTML = result.html;
            this.htmlOutput.style.display = 'block';
            this.textOutput.style.display = 'none';
        } else {
            this.textOutput.textContent = this.rawMarkdown;
            this.textOutput.style.display = 'block';
            this.htmlOutput.style.display = 'none';
        }
        
        this.urlDisplay.textContent = `URL: ${result.url}`;
        this.timestamp.textContent = `Extracted: ${new Date(result.timestamp).toLocaleString()}`;
        this.results.style.display = 'block';
        
        // Smooth scroll to results
        this.results.scrollIntoView({ behavior: 'smooth' });
    }

    showError(message) {
        this.errorMessage.textContent = message;
        this.error.style.display = 'block';
        this.error.scrollIntoView({ behavior: 'smooth' });
    }

    hideResults() {
        this.results.style.display = 'none';
    }

    hideError() {
        this.error.style.display = 'none';
    }

    async copyToClipboard() {
        try {
            await navigator.clipboard.writeText(this.rawMarkdown);
            
            // Visual feedback
            const originalText = this.copyBtn.textContent;
            this.copyBtn.textContent = '✓ Copied!';
            this.copyBtn.style.background = '#28a745';
            
            setTimeout(() => {
                this.copyBtn.textContent = originalText;
                this.copyBtn.style.background = '';
            }, 2000);
        } catch (error) {
            alert('Failed to copy to clipboard');
        }
    }

    downloadText() {
        const text = this.rawMarkdown;
        const url = this.urlDisplay.textContent.replace('URL: ', '');
        const timestamp = new Date().toISOString().slice(0, 19).replace(/:/g, '-');
        
        const filename = `extracted-text-${timestamp}.md`;
        const content = `URL: ${url}\nExtracted: ${new Date().toLocaleString()}\n\n${text}`;
        
        const blob = new Blob([content], { type: 'text/markdown' });
        const downloadUrl = URL.createObjectURL(blob);
        
        const a = document.createElement('a');
        a.href = downloadUrl;
        a.download = filename;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(downloadUrl);
    }
}

// Initialize the app when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    new WebTextExtractorUI();
});