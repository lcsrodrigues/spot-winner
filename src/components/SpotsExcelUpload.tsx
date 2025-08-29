import { useRef, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ParkingSpot } from "@/types/lottery";
import { toast } from "sonner";
import { Download, Upload, Car } from "lucide-react";
import * as XLSX from 'xlsx';

interface SpotsExcelUploadProps {
  onSpotsConfigured: (spots: ParkingSpot[]) => void;
}

export function SpotsExcelUpload({ onSpotsConfigured }: SpotsExcelUploadProps) {
  const [isProcessing, setIsProcessing] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const downloadTemplate = () => {
    // Planilha com três colunas: G1, G2, TERREO
    const sample = [
      { G1: "101", G2: "", TERREO: "" },
      { G1: "102", G2: "201", TERREO: "" },
      { G1: "",   G2: "202", TERREO: "T01" },
      { G1: "105", G2: "105", TERREO: "" }, // exemplo de vaga duplicada (mesmo número aparece 2x)
    ];

    const ws = XLSX.utils.json_to_sheet(sample, { header: ["G1", "G2", "TERREO"] });

    const instructions = [
      { Instrucoes: "Preencha apenas as colunas G1, G2 e TERREO com os números das vagas." },
      { Instrucoes: "Quando um número aparecer mais de uma vez NA MESMA COLUNA, significa que é vaga dupla." },
      { Instrucoes: "G1 e G2 serão consideradas vagas cobertas; TERREO será considerada vaga descoberta." },
      { Instrucoes: "Você pode deixar células em branco. Apenas células preenchidas serão importadas." },
      { Instrucoes: "Os números podem conter letras (ex: 120C)." },
    ];
    const wsInfo = XLSX.utils.json_to_sheet(instructions);

    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Vagas");
    XLSX.utils.book_append_sheet(wb, wsInfo, "Instrucoes");
    XLSX.writeFile(wb, "modelo_vagas.xlsx");

    toast.success("Template de vagas baixado!");
  };

  const parseSheetToSpots = (worksheet: XLSX.WorkSheet): ParkingSpot[] => {
    // Suportar cabeçalhos exatamente: G1, G2, TERREO
    const rows: any[] = XLSX.utils.sheet_to_json(worksheet, { defval: "" });

    type Section = 'G1' | 'G2' | 'TERREO';
    const sections: Section[] = ['G1', 'G2', 'TERREO'];

    const spots: ParkingSpot[] = [];

    sections.forEach((section) => {
      // Mapear cada linha da coluna correspondente
      const values = rows.map((row) => String(row[section] ?? "").trim()).filter((v) => v !== "");

      // Contabilizar repetições dentro da própria coluna
      const counts: Record<string, number> = {};

      values.forEach((val) => {
        counts[val] = (counts[val] || 0) + 1;
      });

      // Criar as vagas; se existir repetição, criaremos N registros distintos
      values.forEach((val) => {
        const occurrenceIndex = (counts[val] ?? 1) - (counts[val] = (counts[val] || 0) - 1);
        const uniqueIndex = occurrenceIndex <= 0 ? 1 : occurrenceIndex; // fallback

        const type = section === 'TERREO' ? 'uncovered' : 'covered';
        const id = `${section}-${val}-${uniqueIndex}`;

        spots.push({
          id,
          number: String(val),
          type,
          // @ts-ignore - extendido no tipo com campo opcional "section"
          section: section.toLowerCase() as any,
        });
      });
    });

    return spots;
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

        const spots = parseSheetToSpots(worksheet);

        if (spots.length === 0) {
          toast.warning('Nenhuma vaga encontrada no arquivo.');
        } else {
          onSpotsConfigured(spots);
          toast.success(`${spots.length} vagas importadas com sucesso!`);
        }
      } catch (error) {
        toast.error('Erro ao processar arquivo de vagas', {
          description: 'Verifique se as colunas estão nomeadas como G1, G2 e TERREO',
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
          Importar Vagas via Excel
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>1. Baixar Modelo (G1, G2, TERREO)</Label>
              <Button onClick={downloadTemplate} variant="outline" className="w-full">
                <Download className="mr-2 h-4 w-4" />
                Baixar Modelo de Vagas
              </Button>
              <p className="text-xs text-muted-foreground">
                Duplique o número na mesma coluna para indicar vaga dupla.
              </p>
            </div>

            <div className="space-y-2">
              <Label>2. Enviar Planilha Preenchida</Label>
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
                {isProcessing ? 'Processando arquivo...' : 'Selecione a planilha de vagas'}
              </p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
