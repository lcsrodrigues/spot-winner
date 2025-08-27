import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Resident, PaymentStatus } from "@/types/lottery";
import { toast } from "sonner";
import { Upload, Download, FileSpreadsheet } from "lucide-react";
import * as XLSX from 'xlsx';

interface ExcelUploadProps {
  onResidentsAdded: (residents: Resident[]) => void;
}

export function ExcelUpload({ onResidentsAdded }: ExcelUploadProps) {
  const [isProcessing, setIsProcessing] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const downloadTemplate = () => {
    // Criar dados de exemplo para o template
    const templateData = [
      {
        'Nome': 'João Silva',
        'Apartamento': '101',
        'Status de Pagamento': 'current',
        'Meses em Atraso': 0,
        'Possui Justificativa': 'não'
      },
      {
        'Nome': 'Maria Santos',
        'Apartamento': '102',
        'Status de Pagamento': 'overdue',
        'Meses em Atraso': 2,
        'Possui Justificativa': 'não'
      },
      {
        'Nome': 'Carlos Oliveira',
        'Apartamento': '201',
        'Status de Pagamento': 'delinquent',
        'Meses em Atraso': 5,
        'Possui Justificativa': 'sim'
      }
    ];

    // Criar workbook
    const wb = XLSX.utils.book_new();
    const ws = XLSX.utils.json_to_sheet(templateData);

    // Adicionar instruções na segunda aba
    const instructions = [
      { 'Instruções de Preenchimento': 'Status de Pagamento deve ser:' },
      { 'Instruções de Preenchimento': 'current - Para pagamentos em dia' },
      { 'Instruções de Preenchimento': 'overdue - Para pagamentos em atraso' },
      { 'Instruções de Preenchimento': 'delinquent - Para inadimplentes' },
      { 'Instruções de Preenchimento': '' },
      { 'Instruções de Preenchimento': 'Possui Justificativa deve ser:' },
      { 'Instruções de Preenchimento': 'sim - Para moradores com justificativa' },
      { 'Instruções de Preenchimento': 'não - Para moradores sem justificativa' },
      { 'Instruções de Preenchimento': '' },
      { 'Instruções de Preenchimento': 'Meses em Atraso: número inteiro (0 ou maior)' }
    ];
    
    const wsInstructions = XLSX.utils.json_to_sheet(instructions);

    // Adicionar as abas ao workbook
    XLSX.utils.book_append_sheet(wb, ws, "Moradores");
    XLSX.utils.book_append_sheet(wb, wsInstructions, "Instruções");

    // Fazer download
    XLSX.writeFile(wb, "modelo_moradores.xlsx");
    
    toast.success("Template baixado com sucesso!", {
      description: "Preencha o arquivo e faça o upload para cadastrar os moradores."
    });
  };

  const processExcelFile = (file: File) => {
    setIsProcessing(true);
    
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const data = new Uint8Array(e.target?.result as ArrayBuffer);
        const workbook = XLSX.read(data, { type: 'array' });
        
        // Pegar a primeira aba
        const sheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[sheetName];
        
        // Converter para JSON
        const jsonData = XLSX.utils.sheet_to_json(worksheet);
        
        // Validar e converter os dados
        const newResidents: Resident[] = [];
        const errors: string[] = [];
        
        jsonData.forEach((row: any, index: number) => {
          try {
            // Mapear os campos do Excel
            const name = String(row['Nome'] || '').trim();
            const apartment = String(row['Apartamento'] || '').trim();
            const paymentStatusRaw = String(row['Status de Pagamento'] || '').toLowerCase().trim();
            const monthsOverdue = Number(row['Meses em Atraso']) || 0;
            const hasJustificationRaw = String(row['Possui Justificativa'] || '').toLowerCase().trim();
            
            // Validações
            if (!name) {
              errors.push(`Linha ${index + 2}: Nome é obrigatório`);
              return;
            }
            
            if (!apartment) {
              errors.push(`Linha ${index + 2}: Apartamento é obrigatório`);
              return;
            }
            
            // Validar status de pagamento
            let paymentStatus: PaymentStatus;
            if (paymentStatusRaw === 'current') {
              paymentStatus = 'current';
            } else if (paymentStatusRaw === 'overdue') {
              paymentStatus = 'overdue';
            } else if (paymentStatusRaw === 'delinquent') {
              paymentStatus = 'delinquent';
            } else {
              errors.push(`Linha ${index + 2}: Status de pagamento inválido (deve ser: current, overdue ou delinquent)`);
              return;
            }
            
            // Validar justificativa
            const hasJustification = hasJustificationRaw === 'sim' || hasJustificationRaw === 'true';
            
            // Validar meses em atraso
            if (isNaN(monthsOverdue) || monthsOverdue < 0) {
              errors.push(`Linha ${index + 2}: Meses em atraso deve ser um número válido`);
              return;
            }
            
            newResidents.push({
              id: `imported_${Date.now()}_${index}`,
              name,
              apartment,
              paymentStatus,
              monthsOverdue,
              hasJustification
            });
            
          } catch (err) {
            errors.push(`Linha ${index + 2}: Erro ao processar dados`);
          }
        });
        
        if (errors.length > 0) {
          toast.error("Erros encontrados no arquivo:", {
            description: errors.slice(0, 3).join(', ') + (errors.length > 3 ? '...' : '')
          });
        } else if (newResidents.length > 0) {
          onResidentsAdded(newResidents);
          toast.success(`${newResidents.length} moradores importados com sucesso!`);
        } else {
          toast.warning("Nenhum morador válido encontrado no arquivo");
        }
        
      } catch (error) {
        toast.error("Erro ao processar arquivo Excel", {
          description: "Verifique se o arquivo está no formato correto"
        });
      } finally {
        setIsProcessing(false);
        if (fileInputRef.current) {
          fileInputRef.current.value = '';
        }
      }
    };
    
    reader.readAsArrayBuffer(file);
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      // Verificar se é um arquivo Excel
      const validTypes = [
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        'application/vnd.ms-excel'
      ];
      
      if (validTypes.includes(file.type) || file.name.endsWith('.xlsx') || file.name.endsWith('.xls')) {
        processExcelFile(file);
      } else {
        toast.error("Formato de arquivo inválido", {
          description: "Por favor, selecione um arquivo Excel (.xlsx ou .xls)"
        });
      }
    }
  };

  return (
    <Card className="mb-8 bg-gradient-to-r from-accent/5 to-accent/10 border-accent/20">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-xl">
          <FileSpreadsheet className="h-6 w-6 text-accent" />
          Cadastro em Massa via Excel
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Download Template */}
            <div className="space-y-2">
              <Label htmlFor="download-template">1. Baixar Modelo</Label>
              <Button 
                onClick={downloadTemplate}
                variant="outline"
                className="w-full"
              >
                <Download className="mr-2 h-4 w-4" />
                Baixar Excel Modelo
              </Button>
              <p className="text-xs text-muted-foreground">
                Baixe o arquivo modelo, preencha com os dados dos moradores e faça o upload
              </p>
            </div>

            {/* Upload File */}
            <div className="space-y-2">
              <Label htmlFor="excel-upload">2. Enviar Arquivo Preenchido</Label>
              <div className="flex items-center gap-2">
                <Input
                  id="excel-upload"
                  type="file"
                  ref={fileInputRef}
                  accept=".xlsx,.xls"
                  onChange={handleFileUpload}
                  disabled={isProcessing}
                  className="flex-1"
                />
                <Button 
                  disabled={isProcessing}
                  variant="outline"
                  size="icon"
                >
                  <Upload className="h-4 w-4" />
                </Button>
              </div>
              <p className="text-xs text-muted-foreground">
                {isProcessing ? "Processando arquivo..." : "Selecione o arquivo Excel preenchido"}
              </p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}