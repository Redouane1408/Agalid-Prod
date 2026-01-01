import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import { CalculatorForm, CalculatorResult, AIRecommendation, formatCurrency, formatNumber, generateQuoteId } from './utils';

export class PDFService {
  private static instance: PDFService;
  
  private constructor() {}
  
  public static getInstance(): PDFService {
    if (!PDFService.instance) {
      PDFService.instance = new PDFService();
    }
    return PDFService.instance;
  }

  async generateQuotePDF(
    formData: CalculatorForm,
    calculationResult: CalculatorResult,
    aiRecommendation: AIRecommendation,
    clientInfo: {
      name: string;
      email: string;
      phone: string;
      address: string;
    }
  ): Promise<Blob> {
    const pdf = new jsPDF('p', 'mm', 'a4');
    const quoteId = generateQuoteId();
    const date = new Date().toLocaleDateString('fr-FR');
    
    // Header with company branding
    pdf.setFillColor(255, 215, 0); // Solar yellow
    pdf.rect(0, 0, 210, 40, 'F');
    
    pdf.setFontSize(24);
    pdf.setTextColor(0, 0, 0);
    pdf.setFont('helvetica', 'bold');
    pdf.text('AGALID', 20, 25);
    
    pdf.setFontSize(12);
    pdf.text('Énergie Solaire - Devis Personnalisé', 20, 32);
    
    // Quote info
    pdf.setFontSize(10);
    pdf.setTextColor(100);
    pdf.text(`Devis N°: ${quoteId}`, 140, 20);
    pdf.text(`Date: ${date}`, 140, 27);
    pdf.text(`Validité: 30 jours`, 140, 34);
    
    // Client information
    pdf.setFontSize(12);
    pdf.setTextColor(0);
    pdf.setFont('helvetica', 'bold');
    pdf.text('Informations Client', 20, 60);
    
    pdf.setFont('helvetica', 'normal');
    pdf.setFontSize(10);
    pdf.text(`Nom: ${clientInfo.name}`, 20, 70);
    pdf.text(`Email: ${clientInfo.email}`, 20, 78);
    pdf.text(`Téléphone: ${clientInfo.phone}`, 20, 86);
    pdf.text(`Adresse: ${clientInfo.address}`, 20, 94);
    
    // System requirements
    pdf.setFontSize(12);
    pdf.setFont('helvetica', 'bold');
    pdf.text('Besoins Système', 20, 110);
    
    pdf.setFont('helvetica', 'normal');
    pdf.setFontSize(10);
    pdf.text(`Consommation mensuelle: ${formData.monthlyConsumption} kWh`, 20, 120);
    pdf.text(`Surface de toit disponible: ${formData.roofArea} m²`, 20, 128);
    pdf.text(`Heures d'ensoleillement: ${formData.peakSunHours}h/jour`, 20, 136);
    pdf.text(`Type de toit: ${this.getRoofTypeLabel(formData.roofType)}`, 20, 144);
    
    // System specifications
    pdf.setFontSize(12);
    pdf.setFont('helvetica', 'bold');
    pdf.text('Spécifications du Système Recommandé', 20, 160);
    
    pdf.setFont('helvetica', 'normal');
    pdf.setFontSize(10);
    pdf.text(`Nombre de panneaux: ${calculationResult.panelCount}`, 20, 170);
    pdf.text(`Puissance système: ${(calculationResult.panelCount * 400 / 1000).toFixed(1)} kW`, 20, 178);
    pdf.text(`Tension recommandée: ${calculationResult.recommendedVoltage}V`, 20, 186);
    pdf.text(`Surface d'installation: ${calculationResult.installationArea.toFixed(1)} m²`, 20, 194);
    pdf.text(`Production mensuelle: ${calculationResult.monthlyProduction.toFixed(0)} kWh`, 20, 202);
    
    // Financial information
    pdf.setFontSize(12);
    pdf.setFont('helvetica', 'bold');
    pdf.text('Informations Financières', 20, 220);
    
    pdf.setFont('helvetica', 'normal');
    pdf.setFontSize(10);
    pdf.text(`Coût total du système: ${formatCurrency(calculationResult.systemCost)}`, 20, 230);
    pdf.text(`Économies annuelles estimées: ${formatCurrency(calculationResult.estimatedSavings)}`, 20, 238);
    pdf.text(`Période de retour: ${calculationResult.paybackPeriod.toFixed(1)} ans`, 20, 246);
    pdf.text(`Réduction CO2 annuelle: ${formatNumber(calculationResult.co2Reduction)} kg`, 20, 254);
    
    // Equipment details
    pdf.setFontSize(12);
    pdf.setFont('helvetica', 'bold');
    pdf.text('Équipements Recommandés', 20, 270);
    
    pdf.setFont('helvetica', 'normal');
    pdf.setFontSize(10);
    const equipmentLines = this.formatEquipmentText(aiRecommendation);
    equipmentLines.forEach((line, index) => {
      pdf.text(line, 20, 280 + (index * 8));
    });
    
    // Add new page for detailed recommendations
    pdf.addPage();
    
    // AI recommendations
    pdf.setFontSize(12);
    pdf.setFont('helvetica', 'bold');
    pdf.text('Recommandations Personnalisées', 20, 30);
    
    pdf.setFont('helvetica', 'normal');
    pdf.setFontSize(10);
    const recommendationLines = this.formatRecommendationText(aiRecommendation);
    recommendationLines.forEach((line, index) => {
      if (20 + (index * 8) < 280) { // Keep within page bounds
        pdf.text(line, 20, 40 + (index * 8));
      }
    });
    
    // Financing options
    pdf.setFontSize(12);
    pdf.setFont('helvetica', 'bold');
    pdf.text('Options de Financement', 20, 200);
    
    pdf.setFont('helvetica', 'normal');
    pdf.setFontSize(10);
    aiRecommendation.financingOptions.forEach((option, index) => {
      pdf.text(`• ${option}`, 20, 210 + (index * 8));
    });
    
    // Government incentives
    pdf.setFontSize(12);
    pdf.setFont('helvetica', 'bold');
    pdf.text('Aides Gouvernementales Disponibles', 20, 240);
    
    pdf.setFont('helvetica', 'normal');
    pdf.setFontSize(10);
    aiRecommendation.governmentIncentives.forEach((incentive, index) => {
      pdf.text(`• ${incentive}`, 20, 250 + (index * 8));
    });
    
    // Footer
    pdf.setFontSize(10);
    pdf.setTextColor(100);
    pdf.text('Agalid Énergie Solaire - Casablanca, Maroc', 20, 280);
    pdf.text('Email: contact@agalid.com | Téléphone: +212 522 123 456', 20, 288);
    pdf.text('www.agalid.com', 20, 296);
    
    return pdf.output('blob');
  }

  private getRoofTypeLabel(roofType: string): string {
    const labels = {
      'flat': 'Toit Plat',
      'sloped': 'Toit en Pente',
      'mixed': 'Toit Mixte'
    };
    return labels[roofType as keyof typeof labels] || roofType;
  }

  private formatEquipmentText(recommendation: AIRecommendation): string[] {
    const lines = [];
    lines.push(`Type de système: ${recommendation.systemType}`);
    lines.push(`Panneaux: ${recommendation.panelModel}`);
    lines.push(`Onduleur: ${recommendation.inverterType}`);
    if (recommendation.batteryRecommendation) {
      lines.push(`Batterie: ${recommendation.batteryRecommendation}`);
    }
    return lines;
  }

  private formatRecommendationText(recommendation: AIRecommendation): string[] {
    const lines = [];
    const maxLineLength = 90;
    
    const addWrappedText = (text: string) => {
      const words = text.split(' ');
      let currentLine = '';
      
      words.forEach(word => {
        if ((currentLine + word).length > maxLineLength) {
          lines.push(currentLine.trim());
          currentLine = word + ' ';
        } else {
          currentLine += word + ' ';
        }
      });
      
      if (currentLine.trim()) {
        lines.push(currentLine.trim());
      }
    };
    
    lines.push('Installation:');
    addWrappedText(recommendation.installationNotes);
    lines.push('');
    lines.push('Maintenance:');
    addWrappedText(recommendation.maintenanceSchedule);
    
    return lines;
  }

  async generateFromElement(elementId: string, filename: string): Promise<void> {
    const element = document.getElementById(elementId);
    if (!element) {
      throw new Error(`Element with id ${elementId} not found`);
    }

    const canvas = await html2canvas(element, {
      scale: 2,
      useCORS: true,
      backgroundColor: '#ffffff'
    });

    const imgData = canvas.toDataURL('image/png');
    const pdf = new jsPDF('p', 'mm', 'a4');
    const imgWidth = 210;
    const pageHeight = 295;
    const imgHeight = (canvas.height * imgWidth) / canvas.width;
    let heightLeft = imgHeight;

    let position = 0;

    pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
    heightLeft -= pageHeight;

    while (heightLeft >= 0) {
      position = heightLeft - imgHeight;
      pdf.addPage();
      pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
      heightLeft -= pageHeight;
    }

    pdf.save(`${filename}.pdf`);
  }
}

export const pdfService = PDFService.getInstance();
