/**
 * Regular expression utility to strip out markdown formatting from plain text.
 */
export function stripMarkdown(text: string): string {
    if (!text) return '';
    return text
        .replace(/\*\*|__/g, '') // Remove bold markers
        .replace(/\*|_/g, '')   // Remove italics markers
        .replace(/#+\s+/g, '')  // Remove markdown headers
        .replace(/`([^`]+)`/g, '$1') // Remove inline code
        .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1') // Convert markdown links to text
        .trim();
}

/**
 * Parses plain text resume into HTML tags for structured styling.
 */
function convertToHtmlStructure(text: string): string {
    const cleanText = stripMarkdown(text);
    const lines = cleanText.split('\n');
    let html = '';
    let inList = false;
    let currentParagraphLines: string[] = [];

    const flushParagraph = () => {
        if (currentParagraphLines.length > 0) {
            const pText = currentParagraphLines.join('<br />');
            html += `<p style="margin-top: 0; margin-bottom: 10px; line-height: 1.45;">${pText}</p>\n`;
            currentParagraphLines = [];
        }
    };

    const flushList = () => {
        if (inList) {
            html += `</ul>\n`;
            inList = false;
        }
    };

    const headingSections = [
        'experience', 'education', 'skills', 'summary', 'projects', 
        'certifications', 'languages', 'core competencies', 'professional experience', 
        'board memberships & affiliations', 'community engagement & thought leadership',
        'strategic leadership & governance', 'cloud security & architecture',
        'security operations & resilience', 'business acumen & executive communication'
    ];

    for (let i = 0; i < lines.length; i++) {
        const line = lines[i].trim();
        
        if (!line) {
            flushList();
            flushParagraph();
            continue;
        }

        // Check if list item
        if (line.startsWith('-') || line.startsWith('*') || line.startsWith('•')) {
            flushParagraph();
            if (!inList) {
                html += `<ul style="margin-top: 0; margin-bottom: 12px; padding-left: 20px; list-style-type: disc;">\n`;
                inList = true;
            }
            const content = line.replace(/^[-*•]\s*/, '');
            html += `<li style="margin-bottom: 5px; line-height: 1.4;">${content}</li>\n`;
        } else {
            flushList();
            
            // Check if it's a heading
            const cleanLower = line.toLowerCase().replace(/[^a-z& ]/g, '').trim();
            const isHeading = (
                (line.length < 70 && line === line.toUpperCase() && line.match(/[A-Z]/)) ||
                (line.length < 50 && line.endsWith(':') && !line.includes(' ')) ||
                headingSections.includes(cleanLower)
            );

            if (isHeading) {
                flushParagraph();
                html += `<h2 style="font-size: 13pt; font-weight: bold; margin-top: 18px; margin-bottom: 8px; border-bottom: 1.5px solid #cbd5e1; padding-bottom: 4px; color: #1e293b; text-transform: uppercase; letter-spacing: 0.05em;">${line}</h2>\n`;
            } else {
                currentParagraphLines.push(line);
            }
        }
    }

    flushList();
    flushParagraph();
    return html;
}

/**
 * Exports a resume to a Word Document (.doc file readable by MS Word, Google Docs)
 */
export function exportToWord(filename: string, text: string): void {
    const formattedHtml = convertToHtmlStructure(text);
    const resumeName = filename.endsWith('.doc') ? filename : `${filename}.doc`;

    const htmlDocument = `
<html xmlns:o='urn:schemas-microsoft-com:office:office' xmlns:w='urn:schemas-microsoft-com:office:word' xmlns='http://www.w3.org/TR/REC-html40'>
<head>
    <title>Resume</title>
    <!--[if gte mso 9]>
    <xml>
        <w:WordDocument>
            <w:View>Print</w:View>
            <w:Zoom>100</w:Zoom>
            <w:DoNotOptimizeForBrowser/>
        </w:WordDocument>
    </xml>
    <![endif]-->
    <style>
        body {
            font-family: 'Calibri', 'Arial', sans-serif;
            font-size: 11pt;
            line-height: 1.15;
            color: #333333;
            margin: 1in;
        }
        h1 {
            font-size: 18pt;
            font-weight: bold;
            text-align: center;
            margin-bottom: 4px;
            color: #1a202c;
        }
        h2 {
            font-size: 13pt;
            font-weight: bold;
            margin-top: 16px;
            margin-bottom: 6px;
            border-bottom: 1px solid #e2e8f0;
            padding-bottom: 2px;
            color: #2d3748;
            text-transform: uppercase;
        }
        p {
            margin-top: 0;
            margin-bottom: 8px;
        }
        ul {
            margin-top: 0;
            margin-bottom: 10px;
            padding-left: 20px;
        }
        li {
            margin-bottom: 4px;
        }
    </style>
</head>
<body>
    <div style="max-width: 6.5in; margin: 0 auto;">
        ${formattedHtml}
    </div>
</body>
</html>
    `.trim();

    const blob = new Blob(['\ufeff' + htmlDocument], { type: 'application/msword' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = resumeName;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
}

/**
 * Opens a print dialog in a new tab with professional styles to export as PDF.
 */
export function exportToPdf(filename: string, text: string): void {
    const formattedHtml = convertToHtmlStructure(text);
    const printWindow = window.open('', '_blank');

    if (!printWindow) {
        alert('Popup blocker prevented PDF generation. Please allow popups for this site.');
        return;
    }

    printWindow.document.write(`
<!DOCTYPE html>
<html>
<head>
    <title>${filename}</title>
    <style>
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap');
        
        @page {
            size: letter;
            margin: 0.75in;
        }
        
        body {
            font-family: 'Inter', -apple-system, sans-serif;
            font-size: 10.5pt;
            line-height: 1.5;
            color: #1a202c;
            margin: 0;
            padding: 0;
            background: white;
        }
        
        .container {
            max-width: 100%;
        }
        
        h1 {
            font-size: 18pt;
            font-weight: 700;
            text-align: center;
            margin-top: 0;
            margin-bottom: 6px;
            color: #1a202c;
            letter-spacing: -0.02em;
        }
        
        h2 {
            font-size: 12pt;
            font-weight: 600;
            margin-top: 20px;
            margin-bottom: 8px;
            border-bottom: 1.5px solid #cbd5e1;
            padding-bottom: 4px;
            color: #1e293b;
            text-transform: uppercase;
            letter-spacing: 0.05em;
        }
        
        p {
            margin-top: 0;
            margin-bottom: 10px;
        }
        
        ul {
            margin-top: 0;
            margin-bottom: 12px;
            padding-left: 20px;
        }
        
        li {
            margin-bottom: 5px;
        }
        
        @media print {
            body {
                background: white;
                color: black;
            }
        }
    </style>
</head>
<body>
    <div class="container">
        ${formattedHtml}
    </div>
    <script>
        // Trigger print after fonts load
        window.onload = function() {
            setTimeout(function() {
                window.print();
            }, 300);
        };
    </script>
</body>
</html>
    `);

    printWindow.document.close();
}
