import * as XLSX from 'xlsx';
import * as pdfjsLib from 'pdfjs-dist/build/pdf';

addEventListener('fetch', event => {
  event.respondWith(handleRequest(event.request))
})

async function handleRequest(request) {
  if (request.method === 'POST') {
    try {
      const formData = await request.formData();
      const file = formData.get('file');

      if (!file) {
        return new Response('No file uploaded', { status: 400 });
      }

      const arrayBuffer = await file.arrayBuffer();
      const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
      const numPages = pdf.numPages;

      let textContent = '';
      for (let i = 1; i <= numPages; i++) {
        const page = await pdf.getPage(i);
        const text = await page.getTextContent();
        textContent += text.items.map(item => item.str).join(' ');
      }

      // Process the textContent and convert it to an Excel format
      const workbook = XLSX.utils.book_new();
      const worksheet = XLSX.utils.aoa_to_sheet([
        ['Date', 'Description', 'Amount', 'Balance'],
        // Add rows based on the parsed PDF data
        // You'll need to implement logic to parse textContent into structured data
      ]);

      XLSX.utils.book_append_sheet(workbook, worksheet, 'Bank Statement');

      const excelBuffer = XLSX.write(workbook, { type: 'array', bookType: 'xlsx' });

      return new Response(excelBuffer, {
        headers: {
          'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
          'Content-Disposition': 'attachment; filename="bank_statement.xlsx"',
        },
      });
    } catch (error) {
      console.error('Error processing file:', error);
      return new Response('Error processing file', { status: 500 });
    }
  }

  return new Response('Method not allowed', { status: 405 });
}
