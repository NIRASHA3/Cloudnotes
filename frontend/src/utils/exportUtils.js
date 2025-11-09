import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

export const exportNoteAsPDF = async (noteData) => {
  try {
    // Create a temporary div to render the content for PDF generation
    const element = document.createElement('div');
    element.style.position = 'absolute';
    element.style.left = '-9999px';
    element.style.top = '0';
    element.style.width = '800px';
    element.style.padding = '40px';
    element.style.fontFamily = 'Arial, sans-serif';
    element.style.lineHeight = '1.6';
    
    element.innerHTML = `
      <div style="margin-bottom: 30px;">
        <h1 style="color: #2d3748; margin-bottom: 10px; border-bottom: 2px solid #667eea; padding-bottom: 10px;">
          ${noteData.title}
        </h1>
        <div style="color: #718096; font-size: 14px; margin-bottom: 20px;">
          <strong>Category:</strong> ${noteData.category} | 
          <strong>Tags:</strong> ${noteData.tags.join(', ')} |
          <strong>Exported:</strong> ${new Date().toLocaleDateString()}
        </div>
      </div>
      <div style="font-size: 14px; color: #4a5568;">
        ${noteData.content}
      </div>
    `;
    
    document.body.appendChild(element);
    
    const canvas = await html2canvas(element, {
      scale: 2,
      useCORS: true,
      logging: false
    });
    
    document.body.removeChild(element);
    
    const imgData = canvas.toDataURL('image/png');
    const pdf = new jsPDF('p', 'mm', 'a4');
    const pdfWidth = pdf.internal.pageSize.getWidth();
    const pdfHeight = pdf.internal.pageSize.getHeight();
    const imgWidth = canvas.width;
    const imgHeight = canvas.height;
    const ratio = Math.min(pdfWidth / imgWidth, pdfHeight / imgHeight);
    const imgX = (pdfWidth - imgWidth * ratio) / 2;
    const imgY = 30;
    
    pdf.addImage(imgData, 'PNG', imgX, imgY, imgWidth * ratio, imgHeight * ratio);
    pdf.save(`${noteData.title}.pdf`);
    
  } catch (error) {
    console.error('Error generating PDF:', error);
    throw new Error('Failed to generate PDF');
  }
};

export const exportNoteAsHTML = (noteData) => {
  const htmlContent = `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${noteData.title}</title>
    <style>
        body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            line-height: 1.6;
            color: #2d3748;
            max-width: 800px;
            margin: 0 auto;
            padding: 40px 20px;
            background: #f7fafc;
        }
        .note-container {
            background: white;
            border-radius: 12px;
            padding: 40px;
            box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
        }
        .note-header {
            border-bottom: 2px solid #667eea;
            padding-bottom: 20px;
            margin-bottom: 30px;
        }
        .note-title {
            color: #2d3748;
            font-size: 2.5rem;
            margin: 0 0 10px 0;
            font-weight: 700;
        }
        .note-meta {
            color: #718096;
            font-size: 0.95rem;
        }
        .note-content {
            font-size: 1.1rem;
            color: #4a5568;
        }
        .note-content h1, .note-content h2, .note-content h3 {
            color: #2d3748;
            margin-top: 1.5em;
        }
        .note-content p {
            margin-bottom: 1.2em;
        }
        .note-content ul, .note-content ol {
            margin-bottom: 1.2em;
            padding-left: 2em;
        }
        .note-tags {
            margin: 20px 0;
        }
        .tag {
            display: inline-block;
            background: #e6fffa;
            color: #234e52;
            padding: 4px 12px;
            border-radius: 20px;
            margin: 2px 4px;
            font-size: 0.85rem;
            font-weight: 500;
        }
    </style>
</head>
<body>
    <div class="note-container">
        <div class="note-header">
            <h1 class="note-title">${noteData.title}</h1>
            <div class="note-meta">
                <strong>Category:</strong> ${noteData.category} | 
                <strong>Exported:</strong> ${new Date().toLocaleDateString()}
                ${noteData.tags.length > 0 ? `| <strong>Tags:</strong> ${noteData.tags.join(', ')}` : ''}
            </div>
        </div>
        
        ${noteData.tags.length > 0 ? `
        <div class="note-tags">
            ${noteData.tags.map(tag => `<span class="tag">#${tag}</span>`).join('')}
        </div>
        ` : ''}
        
        <div class="note-content">
            ${noteData.content}
        </div>
    </div>
</body>
</html>
  `;

  const blob = new Blob([htmlContent], { type: 'text/html' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `${noteData.title}.html`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
};