import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';

export async function exportPNG(element: HTMLElement, filename = `cardapio-${Date.now()}.png`) {
  const canvas = await html2canvas(element, {
    scale: 2,
    backgroundColor: '#ffffff'
  });
  const dataUrl = canvas.toDataURL('image/png');
  const a = document.createElement('a');
  a.href = dataUrl;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
}

export async function exportPDF(element: HTMLElement, filename = `cardapio-${Date.now()}.pdf`) {
  const canvas = await html2canvas(element, {
    scale: 2,
    backgroundColor: '#ffffff'
  });
  const imgData = canvas.toDataURL('image/png');
  const pdf = new jsPDF('p', 'mm', 'a4');
  const pageWidth = pdf.internal.pageSize.getWidth();
  const imgWidth = pageWidth;
  const imgHeight = (canvas.height * imgWidth) / canvas.width;
  pdf.addImage(imgData, 'PNG', 0, 0, imgWidth, imgHeight);
  pdf.save(filename);
}


