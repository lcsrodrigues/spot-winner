import { useRef, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ParkingSpot, VagaType } from "@/types/lottery";
import { toast } from "sonner";
import { Download, Upload, Car } from "lucide-react";
import * as XLSX from 'xlsx';

interface VagasExcelUploadProps {
  onVagasConfigured: (vagas: ParkingSpot[]) => void;
}

export function VagasExcelUpload({ onVagasConfigured }: VagasExcelUploadProps) {
  const [isProcessing, setIsProcessing] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const downloadTemplate = () => {
    const sample = [
      { 
        "Número da Vaga": "1",
        "Localização": "TÉRREO", 
        "Tipo de Vaga": "DUPLA",
        "Pré-Selecionada": "NÃO",
        "Regra Oculta": "NÃO",
        "Apartamentos Elegíveis": "101,102,103"
      },
      { 
        "Número da Vaga": "2",
        "Localização": "TÉRREO", 
        "Tipo de Vaga": "ÚNICA",
        "Pré-Selecionada": "SIM",
        "Regra Oculta": "NÃO",
        "Apartamentos Elegíveis": "201,202"
      },
      { 
        "Número da Vaga": "3",
        "Localização": "TÉRREO", 
        "Tipo de Vaga": "VISITANTE",
        "Pré-Selecionada": "NÃO",
        "Regra Oculta": "SIM",
        "Apartamentos Elegíveis": ""
      }
    ];

    const ws = XLSX.utils.json_to_sheet(sample);
    
    const instructions = [
      { Instrucoes: "Preencha as colunas conforme o modelo:" },
      { Instrucoes: "- Número da Vaga: número identificador da vaga" },
      { Instrucoes: "- Localização: TÉRREO, G1, G2, etc." },
      { Instrucoes: "- Tipo de Vaga: ÚNICA, DUPLA ou VISITANTE" },
      { Instrucoes: "- Pré-Selecionada: SIM ou NÃO (vagas pré-selecionadas não entram no sorteio)" },
      { Instrucoes: "- Regra Oculta: SIM ou NÃO (vagas com regra oculta não sorteiiam)" },
      { Instrucoes: "- Apartamentos Elegíveis: números separados por vírgula (ex: 101,102,103)" },
      { Instrucoes: "Deixe 'Apartamentos Elegíveis' em branco para vagas VISITANTE" }
    ];
    const wsInfo = XLSX.utils.json_to_sheet(instructions);

    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Vagas");
    XLSX.utils.book_append_sheet(wb, wsInfo, "Instruções");
    XLSX.writeFile(wb, "modelo_vagas_sorteio.xlsx");

    toast.success("Template de vagas baixado!");
  };

  const parseSheetToVagas = (worksheet: XLSX.WorkSheet): ParkingSpot[] => {
    const rows: any[] = XLSX.utils.sheet_to_json(worksheet, { defval: "" });
    const vagas: ParkingSpot[] = [];

    rows.forEach((row, index) => {
      try {
        const numero = String(row["Número da Vaga"] || "").trim();
        const localizacao = String(row["Localização"] || "").trim();
        const tipo = String(row["Tipo de Vaga"] || "").trim().toUpperCase() as VagaType;
        const preSelec = String(row["Pré-Selecionada"] || "").trim().toUpperCase();
        const regraOculta = String(row["Regra Oculta"] || "").trim().toUpperCase();
        const elegiveisStr = String(row["Apartamentos Elegíveis"] || "").trim();

        if (!numero || !localizacao || !tipo) {
          console.warn(`Linha ${index + 2}: dados incompletos, ignorando`);
          return;
        }

        if (!['ÚNICA', 'DUPLA', 'VISITANTE'].includes(tipo)) {
          console.warn(`Linha ${index + 2}: tipo inválido '${tipo}', ignorando`);
          return;
        }

        const isPreSelected = preSelec === 'SIM';
        const hasHiddenRule = regraOculta === 'SIM';
        
        const eligibleApartments = elegiveisStr 
          ? elegiveisStr.split(',').map(apt => apt.trim()).filter(Boolean)
          : [];

        vagas.push({
          id: `vaga-${numero}-${index}`,
          number: numero,
          location: localizacao,
          type: tipo,
          isPreSelected,
          hasHiddenRule,
          eligibleApartments,
          observations: isPreSelected ? "Pré-selecionada - não sorteada" : 
                       hasHiddenRule ? "Não sorteia" : ""
        });
      } catch (error) {
        console.error(`Erro ao processar linha ${index + 2}:`, error);
      }
    });

    return vagas;
  };

  const processExcelFile = (file: File) => {
    setIsProcessing(true);
    const reader = new FileReader();

    reader.onload = (e) => {
      try {
        const data = new Uint8Array(e.target?.result as ArrayBuffer);
        const workbook = XLSX.read(data, { type: 'array' });

        const sheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[sheetName];
        if (!worksheet) throw new Error('Aba de planilha não encontrada');

        const vagas = parseSheetToVagas(worksheet);

        if (vagas.length === 0) {
          toast.warning('Nenhuma vaga válida encontrada no arquivo.');
        } else {
          onVagasConfigured(vagas);
          toast.success(`${vagas.length} vagas importadas com sucesso!`);
        }
      } catch (error) {
        toast.error('Erro ao processar arquivo de vagas', {
          description: 'Verifique se as colunas estão nomeadas conforme o modelo',
        });
      } finally {
        setIsProcessing(false);
        if (fileInputRef.current) fileInputRef.current.value = '';
      }
    };

    reader.readAsArrayBuffer(file);
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const validTypes = [
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'application/vnd.ms-excel',
    ];

    if (validTypes.includes(file.type) || file.name.endsWith('.xlsx') || file.name.endsWith('.xls')) {
      processExcelFile(file);
    } else {
      toast.error('Formato de arquivo inválido', {
        description: 'Envie um arquivo .xlsx ou .xls',
      });
    }
  };

  return (
    <Card className="mb-8 bg-gradient-to-r from-accent/5 to-accent/10 border-accent/20">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-xl">
          <Car className="h-6 w-6 text-accent" />
          Importar Configuração de Vagas
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>1. Baixar Modelo de Configuração</Label>
              <Button onClick={downloadTemplate} variant="outline" className="w-full">
                <Download className="mr-2 h-4 w-4" />
                Baixar Template
              </Button>
              <p className="text-xs text-muted-foreground">
                Template com configuração de vagas, pré-seleção e elegibilidade.
              </p>
            </div>

            <div className="space-y-2">
              <Label>2. Enviar Configuração Preenchida</Label>
              <div className="flex items-center gap-2">
                <Input
                  type="file"
                  accept=".xlsx,.xls"
                  ref={fileInputRef}
                  onChange={handleFileUpload}
                  disabled={isProcessing}
                  className="flex-1"
                />
                <Button disabled={isProcessing} variant="outline" size="icon">
                  <Upload className="h-4 w-4" />
                </Button>
              </div>
              <p className="text-xs text-muted-foreground">
                {isProcessing ? 'Processando arquivo...' : 'Selecione o arquivo de configuração'}
              </p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}