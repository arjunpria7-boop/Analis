import React from 'react';
import ReactDOM from 'react-dom/client';
import { GoogleGenAI } from "@google/genai";

// Destructure hooks for use in components
const { useState, useCallback, useEffect, useMemo, useRef } = React;

// --- Type Definitions (from types.ts) ---
type GridData = string[][];
type ActionMessage = {
  text: string;
  type: 'success' | 'error';
};

// --- Constants (from constants.ts) ---
const PREPOPULATED_GRID_DATA_SIDNEY: GridData = [
  [ "7211", "6584", "3899", "8567", "4206", "8314", "0868" ],
  [ "9826", "0524", "6704", "0928", "3556", "7180", "0151" ],
  [ "4520", "1462", "8310", "2047", "3880", "4707", "3454" ],
  [ "5379", "6998", "4652", "7591", "8004", "9379", "0594" ],
  [ "4510", "6074", "4462", "7596", "3647", "5307", "4794" ],
  [ "7951", "9165", "0418", "3368", "1301", "3447", "4738" ],
  [ "1123", "2679", "2036", "5707", "4739", "5378", "1071" ],
  [ "6920", "0515", "7613", "2887", "2635", "5012", "6621" ],
  [ "3465", "5290", "9709", "0983", "8548", "0260", "4096" ],
  [ "6247", "8198", "1031", "0938", "5968", "9802", "3684" ],
  [ "5208", "1875", "6394", "4560", "3881", "8044", "3796" ],
  [ "4098", "5419", "6586", "3067", "3384", "0793", "6160" ],
  [ "9395", "7371", "8957", "5394", "5602", "9960", "7823" ],
  [ "1730", "3987", "2709", "9663", "2856", "5073", "7609" ],
  [ "9492", "4080", "7395", "6115", "5387", "4359", "3701" ],
  [ "7152", "5367", "0155", "0939", "6768", "3265", "0292" ],
  [ "2032", "8620", "1513", "6900", "1323", "8940", "4794" ],
  [ "1319", "5068", "3786", "3995", "1332", "6180", "3795" ],
  [ "3988", "1974", "0247", "7950", "4839", "7291", "0474" ],
  [ "5969", "6817", "1831", "7018", "2174", "1734", "7257" ],
  [ "8371", "8901", "3360", "0573", "5407", "5161", "1869" ],
  [ "9391", "7006", "6234", "8295", "3093", "5780", "1594" ],
  [ "9417", "4960", "3707", "0695", "3924", "6397", "9437" ],
  [ "0353", "3302", "3139", "7992", "2616", "2020", "8056" ],
  [ "4332", "0927", "2336", "4787", "6506", "2328", "3553" ],
  [ "2801", "3154", "4257", "4172", "0906", "3429", "7836" ],
  [ "2731", "9023", "2465", "3685", "5497", "2915", "2077" ],
  [ "4283", "3101", "7725", "8004", "7320", "4502", "6967" ],
  [ "3016", "2396", "1138", "5001", "1095", "9462", "4814" ],
  [ "6050", "8320", "4426", "2868", "0676", "7184", "0433" ],
  [ "2967", "1702", "2551", "3761", "4012", "0576", "1326" ],
  [ "8715", "4082", "1132", "1857", "7792", "2389", "6311" ],
  [ "1949", "8068", "2759", "4332", "5361", "3188", "1217" ],
  [ "9758", "5823", "4014", "9499", "8384", "8013", "2163" ],
  [ "3971", "3125", "5746", "7898", "1597", "6956", "0211" ],
  [ "1538", "6852", "9630", "4390", "0843", "2941", "5081" ],
  [ "3470", "0635", "8903", "1885", "7461", "5903", "1749" ],
  [ "4006", "7698", "9710", "6905", "8064", "1601", "0780" ],
  [ "7113", "0408", "5579", "4634", "8584", "3077", "9935" ],
  [ "8947", "3048", "0031", "7654", "5161", "6846", "1964" ],
  [ "4716", "8294", "5727", "0986", "2629", "3717", "0462" ],
  [ "5388", "4245", "2362", "1886", "0878", "3056", "4715" ],
  [ "6722", "1242", "9633", "5695", "0681", "", "" ]
];
const PREPOPULATED_GRID_DATA_HONGKONG: GridData = [
  ["5760", "0279", "9006", "0141", "6393", "2704", "5386"],
  ["8962", "4578", "3045", "2953", "6474", "9781", "7268"],
  ["9873", "8336", "5046", "6293", "0682", "3900", "2763"],
  ["3572", "7344", "2576", "9097", "5282", "4689", "0893"],
  ["7610", "7402", "6964", "2301", "8565", "8648", "3056"],
  ["0174", "9220", "3858", "9081", "0676", "4705", "0541"],
  ["8224", "0194", "3116", "1042", "0491", "2879", "9665"],
  ["6901", "5216", "1695", "8506", "4492", "7583", "2300"],
  ["9064", "6848", "0919", "5171", "8785", "1422", "4360"],
  ["6584", "5958", "3074", "1808", "7796", "3573", "5180"],
  ["6364", "8496", "9619", "1765", "0305", "4802", "1537"],
  ["7188", "2067", "9378", "3424", "4964", "0540", "4056"],
  ["9793", "6255", "3723", "8437", "0516", "4931", "1834"],
  ["9182", "5223", "6818", "2591", "7532", "1065", "8482"],
  ["3976", "7020", "9150", "1744", "5807", "0373", "6213"],
  ["8961", "4645", "9761", "6627", "8941", "3832", "2196"],
  ["7680", "2766", "4308", "6239", "7062", "3237", "4495"],
  ["5161", "1935", "2681", "8313", "3786", "0506", "1887"],
  ["6460", "9516", "3650", "0019", "1361", "2526", "6995"],
  ["6353", "5075", "2619", "8317", "5252", "3570", "2887"],
  ["6296", "9157", "1839", "5363", "1085", "2791", "2969"],
  ["0673", "7168", "0654", "2713", "6495", "8694", "9386"],
  ["6112", "7675", "5721", "2484", "0297", "6948", "0975"],
  ["9890", "4730", "7631", "5912", "9880", "4264", "8840"],
  ["2194", "3122", "4871", "1228", "9447", "9672", "0904"],
  ["0621", "6403", "0277", "0641", "0872", "2086", "5765"],
  ["8400", "2241", "3683", "6204", "2856", "6021", "4669"],
  ["7712", "9345", "1120", "1980", "0533", "3890", "5475"],
  ["4706", "1434", "2047", "7262", "8052", "4986", "5828"],
  ["0515", "6774", "3482", "9355", "4299", "2951", "0579"],
  ["8164", "5753", "7228", "4087", "0470", "2625", "9869"],
  ["5276", "7390", "4151", "2481", "0915", "8544", "7829"],
  ["6252", "9732", "5813", "2658", "5201", "0385", "8169"],
  ["0073", "7402", "0324", "2914", "4247", "1643", "4102"],
  ["6210", "5498", "8710", "1335", "1489", "9077", "3448"],
  ["0092", "7613", "4227", "9700", "0363", "6017", "0296"],
  ["1756", "2629", "9825", "5114", "0588", "8769", "3982"],
  ["4576", "9644", "8348", "5782", "7826", "9849", "4107"],
  ["5895", "9829", "4214", "8708", "8259", "5648", "2566"],
  ["9103", "3804", "0027", "3862", "8717", "6639", "7262"],
  ["9044", "0887", "7179", "2808", "9467", "4961", "1845"],
  ["0487", "0593", "3435", "2793", "7013", "8741", "5337"],
  ["7463", "9359", "8250", "0376", "9202", "4063", ""]
];
const PREPOPULATED_GRID_DATA_SINGAPORE: GridData = [
  ["3135", "", "7293", "5892", "", "2679", "5256"],
  ["3841", "", "8975", "6470", "", "5263", "8504"],
  ["8785", "", "5832", "1286", "", "9858", "3891"],
  ["1874", "", "5416", "8812", "", "1222", "2782"],
  ["8988", "", "0733", "2038", "", "8383", "9800"],
  ["1200", "", "2079", "0165", "", "9285", "3388"],
  ["0210", "", "7164", "1829", "", "9899", "7539"],
  ["9090", "", "3419", "6630", "", "7325", "6666"],
  ["5034", "", "5404", "3220", "", "5946", "7538"],
  ["0815", "", "8680", "8411", "", "0948", "4657"],
  ["9017", "", "6376", "0882", "", "5540", "9373"],
  ["9596", "", "9325", "1685", "", "4720", "4111"],
  ["4902", "", "3468", "9514", "", "8682", "8748"],
  ["9237", "", "3567", "9707", "", "1815", "1546"],
  ["4361", "", "8057", "3630", "", "1564", "5891"],
  ["3589", "", "0193", "3108", "", "8119", "7422"],
  ["7826", "", "4045", "0376", "", "0990", "4707"],
  ["0279", "", "4655", "0559", "", "6996", "5507"],
  ["6815", "", "2092", "0508", "", "0050", "8947"],
  ["6397", "", "8283", "3439", "", "6660", "0665"],
  ["2751", "", "3576", "2820", "", "1766", "0825"],
  ["4457", "", "9617", "2076", "", "9304", "5259"],
  ["0055", "", "7634", "0544", "", "4520", "3805"],
  ["1330", "", "8184", "5532", "", "8327", "5891"],
  ["5025", "", "0536", "7531", "", "4104", "9729"],
  ["4227", "", "6238", "4228", "", "4747", "7479"],
  ["8710", "", "1924", "1217", "", "0264", "2472"],
  ["2991", "", "0175", "7284", "", "3064", "8775"],
  ["7751", "", "9362", "5122", "", "4802", "4600"],
  ["5638", "", "9559", "5196", "", "0873", "7280"],
  ["0724", "", "8115", "9337", "", "0851", "9427"],
  ["2804", "", "9132", "3199", "", "8681", "4067"],
  ["5718", "", "3380", "4514", "", "4315", "7477"],
  ["2135", "", "0707", "5480", "", "2250", "9197"],
  ["7879", "", "6768", "7816", "", "9468", "7057"],
  ["2718", "", "9999", "3898", "", "3136", "7336"],
  ["6700", "", "7611", "4603", "", "9326", "8015"],
  ["4283", "", "8704", "7540", "", "4611", "3788"],
  ["7707", "", "3091", "5059", "", "4874", "5958"],
  ["8998", "", "0526", "8729", "", "5051", "4913"],
  ["7382", "", "8079", "3368", "", "3635", "1060"],
  ["4262", "", "7324", "2480", "", "6135", "5548"],
  ["3788", "", "8612", "1951", "", "XXXX", "XXXX"]
];

// --- Icons (from components/Icons.tsx) ---
const LoadingSpinner: React.FC = () => (
  <svg className="animate-spin h-8 w-8 text-brand-highlight" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" role="status" aria-label="Loading">
    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
  </svg>
);
const SendIcon: React.FC = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-5 w-5" aria-hidden="true">
        <line x1="22" y1="2" x2="11" y2="13"></line>
        <polygon points="22 2 15 22 11 13 2 9 22 2"></polygon>
    </svg>
);
const SaveIcon: React.FC = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-5 w-5" aria-hidden="true">
        <path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"></path>
        <polyline points="17 21 17 13 7 13 7 21"></polyline>
        <polyline points="7 3 7 8 15 8"></polyline>
    </svg>
);
const ExportIcon: React.FC = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-5 w-5" aria-hidden="true">
        <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
        <polyline points="7 10 12 15 17 10"></polyline>
        <line x1="12" y1="15" x2="12" y2="3"></line>
    </svg>
);
const ImportIcon: React.FC = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-5 w-5" aria-hidden="true">
        <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
        <polyline points="17 14 12 9 7 14"></polyline>
        <line x1="12" y1="9" x2="12" y2="21"></line>
    </svg>
);
const SearchIcon: React.FC = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-5 w-5 text-gray-400" aria-hidden="true">
      <circle cx="11" cy="11" r="8"></circle>
      <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
    </svg>
);

// --- Services (from services/geminiService.ts) ---
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
function formatGridDataForPrompt(grid: GridData): string {
  return grid.map(row => row.map(cell => cell.trim() === '' ? 'x' : cell).join(',')).join('\n');
}
const analyzeGrid = async (grid: GridData, question: string): Promise<string> => {
  try {
    const gridString = formatGridDataForPrompt(grid);
    const prompt = `
Anda adalah seorang analis ahli dalam pola angka, khususnya dalam konteks permainan angka.
Anda akan diberikan sebuah grid berisi angka-angka dan sebuah pertanyaan.
Karakter 'x' merepresentasikan nilai yang kosong atau tidak diketahui.

**Pengetahuan Dasar (Gunakan ini sebagai dasar untuk semua analisis):**

Setiap angka 4-digit dianalisis menggunakan dua sistem:

**Sistem 1: Posisi Digit (AS, Kop, Kepala, Ekor)**
- Digit pertama (paling kiri) disebut 'AS'.
- Digit kedua disebut 'Kop'.
- Digit ketiga disebut 'Kepala'.
- Digit keempat (paling kanan) disebut 'Ekor'.
- **Contoh:** Pada angka **5290**, AS adalah **5**, Kop adalah **2**, Kepala adalah **9**, dan Ekor adalah **0**.

**Sistem 2: Dimensi Angka (2D, 3D, 4D)**
- '2D' adalah dua digit terakhir dari angka tersebut.
- '3D' adalah tiga digit terakhir dari angka tersebut.
- '4D' adalah keseluruhan angka 4-digit itu sendiri.
- **Contoh:** Pada angka **5290**, 2D adalah **90**, 3D adalah **290**, dan 4D adalah **5290**.

Gunakan Pengetahuan Dasar ini untuk menganalisis data grid yang disediakan dan jawab pertanyaan pengguna secara ringkas dan akurat.

**Aturan Penting untuk Format Jawaban:**
- Saat Anda mengidentifikasi angka yang berpotensi keluar (angka kuat), **HARUS** gunakan frasa "Angka Kuat:" diikuti dengan angka-angkanya.
- Saat Anda mengidentifikasi angka yang berpotensi tidak keluar (angka lemah), **HARUS** gunakan frasa "Angka Lemah:" diikuti dengan angka-angkanya.
- Ini sangat penting agar sistem dapat menyorot angka-angka tersebut untuk pengguna.

Data Grid (format CSV):
${gridString}

Pertanyaan Pengguna: ${question}

Analisis:
`;
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
    });
    return response.text;
  } catch (error) {
    console.error("Error analyzing grid with Gemini API:", error);
    if (error instanceof Error) {
        return `Terjadi kesalahan saat analisis: ${error.message}`;
    }
    return "Terjadi kesalahan yang tidak diketahui saat analisis.";
  }
};

// --- Components ---

// from components/ResultsDisplay.tsx
interface ResultsDisplayProps {
  result: string;
  isLoading: boolean;
  error: string | null;
}
const ResultsDisplay: React.FC<ResultsDisplayProps> = ({ result, isLoading, error }) => {
  const renderResultWithHighlights = (text: string) => {
    const lines = text.split('\n');
    return lines.map((line, lineIndex) => {
      const lowerLine = line.toLowerCase();
      const hasStrongKeyword = /\b(angka kuat|kuat)\b/i.test(lowerLine);
      const hasWeakKeyword = /\b(angka lemah|lemah)\b/i.test(lowerLine) && !hasStrongKeyword;
      if (!hasStrongKeyword && !hasWeakKeyword) {
        return <span key={lineIndex} className="block">{line}</span>;
      }
      const parts = line.split(/(\d+)/);
      const highlightClass = hasStrongKeyword
        ? 'bg-yellow-400 text-black font-bold px-1 rounded-sm'
        : 'bg-red-500 text-white font-bold px-1 rounded-sm';
      return (
        <p key={lineIndex} className="block">
          {parts.map((part, partIndex) =>
            partIndex % 2 === 1 ? (
              <span key={partIndex} className={highlightClass}>{part}</span>
            ) : (part)
          )}
        </p>
      );
    });
  };
  return (
    <div className="mt-6 p-4 bg-brand-secondary rounded-lg shadow-lg min-h-[200px] flex flex-col">
      <h2 className="text-xl font-semibold text-brand-highlight mb-2">Hasil Analisis</h2>
      <div className="flex-grow flex items-center justify-center">
        {isLoading && (
          <div className="flex flex-col items-center">
            <LoadingSpinner />
            <span className="text-brand-text mt-2">Menganalisis...</span>
          </div>
        )}
        {error && <div className="text-red-500 bg-red-100 p-3 rounded w-full text-center">{error}</div>}
        {!isLoading && !error && result && (
          <div className="text-brand-text whitespace-pre-wrap w-full self-start">
            {renderResultWithHighlights(result)}
          </div>
        )}
        {!isLoading && !error && !result && (
          <p className="text-brand-text-faded">Hasil analisis akan muncul di sini.</p>
        )}
      </div>
    </div>
  );
};

// from components/AnalysisControls.tsx
interface AnalysisControlsProps {
  question: string;
  onQuestionChange: (question: string) => void;
  onAnalyze: () => void;
  isLoading: boolean;
  onFindMissing2D: () => void;
  onFindMissing3D: () => void;
  onFindFrequent2D: () => void;
  onFindFrequent3D: () => void;
}
const AnalysisControls: React.FC<AnalysisControlsProps> = ({ question, onQuestionChange, onAnalyze, isLoading, onFindMissing2D, onFindMissing3D, onFindFrequent2D, onFindFrequent3D }) => {
  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      if (!isLoading) {
        onAnalyze();
      }
    }
  };
  return (
    <div className="lg:mt-0 space-y-4">
      <div>
        <label htmlFor="question-input" className="block text-lg font-semibold text-brand-highlight mb-2">Pertanyaan Analisis</label>
        <div className="relative">
          <textarea id="question-input" value={question} onChange={(e) => onQuestionChange(e.target.value)} onKeyDown={handleKeyDown} className="w-full p-3 pr-32 bg-brand-secondary text-brand-text rounded-lg border-2 border-brand-accent focus:outline-none focus:ring-2 focus:ring-brand-highlight focus:border-transparent resize-none" placeholder="contoh: 'Apa pola di kolom pertama?'" rows={3} disabled={isLoading} />
          <button onClick={onAnalyze} disabled={isLoading || !question.trim()} className="absolute right-3 top-1/2 -translate-y-1/2 px-4 py-2 bg-brand-highlight text-brand-primary font-bold rounded-md hover:bg-opacity-90 disabled:bg-gray-500 disabled:cursor-not-allowed flex items-center gap-2 transition-colors" aria-label="Analisis">
            {isLoading ? 'Menganalisis...' : 'Analisis'}
            {!isLoading && <SendIcon />}
          </button>
        </div>
      </div>
      <div className="flex flex-wrap justify-start items-center gap-x-6 gap-y-4 border-t border-brand-accent pt-4">
        <div className="flex items-center gap-2">
            <span className="text-sm font-semibold text-brand-text-faded">Angka Belum Muncul:</span>
            <button onClick={onFindMissing2D} className="px-2 py-1 bg-green-600 text-white font-bold rounded-md hover:bg-green-700 transition-colors text-sm disabled:bg-gray-500 disabled:cursor-not-allowed" aria-label="Cari 2D yang Belum Muncul" disabled={isLoading}>2D</button>
            <button onClick={onFindMissing3D} className="px-2 py-1 bg-green-600 text-white font-bold rounded-md hover:bg-green-700 transition-colors text-sm disabled:bg-gray-500 disabled:cursor-not-allowed" aria-label="Cari 3D yang Belum Muncul" disabled={isLoading}>3D</button>
        </div>
        <div className="flex items-center gap-2">
            <span className="text-sm font-semibold text-brand-text-faded">Angka Sering Muncul:</span>
            <button onClick={onFindFrequent2D} className="px-2 py-1 bg-red-600 text-white font-bold rounded-md hover:bg-red-700 transition-colors text-sm disabled:bg-gray-500 disabled:cursor-not-allowed" aria-label="Cari 2D yang Sering Muncul" disabled={isLoading}>2D</button>
            <button onClick={onFindFrequent3D} className="px-2 py-1 bg-red-600 text-white font-bold rounded-md hover:bg-red-700 transition-colors text-sm disabled:bg-gray-500 disabled:cursor-not-allowed" aria-label="Cari 3D yang Sering Muncul" disabled={isLoading}>3D</button>
        </div>
      </div>
    </div>
  );
};

// from components/InputGrid.tsx
interface InputGridProps {
  grid: GridData;
  onGridChange: (rowIndex: number, colIndex: number, value: string) => void;
  onAddRows: () => void;
  onSave: () => void;
  onExport: () => void;
  onImport: (fileContent: string) => void;
  actionMessage: ActionMessage | null;
}
const InputGrid: React.FC<InputGridProps> = ({ grid, onGridChange, onAddRows, onSave, onExport, onImport, actionMessage }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>, rowIndex: number, colIndex: number) => {
    const value = e.target.value;
    if (/^[0-9xX]*$/.test(value) && value.length <= 4) {
      onGridChange(rowIndex, colIndex, value.toUpperCase());
      if (grid.length > 0 && grid[0].length > 0 && rowIndex === grid.length - 1 && colIndex === grid[0].length - 1 && value.length > 0) {
        onAddRows();
      }
    }
  };
  const handleImportClick = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
        const content = event.target?.result;
        if (typeof content === 'string') {
            onImport(content);
        }
    };
    reader.onerror = () => { console.error("Gagal membaca file."); };
    reader.readAsText(file);
    if (e.target) { e.target.value = ''; }
  };
  const days = ['Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu', 'Minggu'];
  const filteredGrid = useMemo(() => {
    if (!searchQuery.trim()) {
      return grid.map((row, index) => ({ row, originalIndex: index }));
    }
    return grid
      .map((row, index) => ({ row, originalIndex: index }))
      .filter(({ row }) =>
        row.some(cell => cell.toLowerCase().endsWith(searchQuery.toLowerCase()))
      );
  }, [grid, searchQuery]);
  return (
    <div className="p-2 bg-brand-secondary rounded-lg shadow-lg">
      <div className="mb-4 px-2 space-y-4">
        <div className="flex flex-wrap justify-between items-center gap-4">
          <div className="flex items-center gap-2">
              <button onClick={onSave} className="px-3 py-2 bg-blue-600 text-white font-bold rounded-md hover:bg-blue-700 transition-colors flex items-center gap-2" aria-label="Simpan Data Grid"><SaveIcon /> <span>Simpan</span></button>
              <button onClick={onExport} className="px-3 py-2 bg-green-600 text-white font-bold rounded-md hover:bg-green-700 transition-colors flex items-center gap-2" aria-label="Ekspor Data Grid"><ExportIcon /> <span>Ekspor</span></button>
              <button onClick={handleImportClick} className="px-3 py-2 bg-purple-600 text-white font-bold rounded-md hover:bg-purple-700 transition-colors flex items-center gap-2" aria-label="Impor Data Grid"><ImportIcon /> <span>Impor</span></button>
              <input type="file" ref={fileInputRef} onChange={handleFileChange} accept=".json" style={{ display: 'none' }} />
          </div>
          <div className="relative flex-grow min-w-[200px]">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none"><SearchIcon /></div>
            <input type="search" placeholder="Cari angka..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="w-full p-2 pl-10 bg-brand-primary text-brand-text rounded-lg border-2 border-brand-accent focus:outline-none focus:ring-2 focus:ring-brand-highlight focus:border-transparent" aria-label="Cari data di dalam grid"/>
          </div>
        </div>
        <div className="min-h-[24px] flex items-center">
            {actionMessage && (<p className={`text-sm font-semibold transition-opacity duration-500 ease-in-out ${actionMessage.type === 'success' ? 'text-green-400' : 'text-red-500'}`} aria-live="polite">{actionMessage.text}</p>)}
        </div>
      </div>
      <table className="table-auto border-collapse border border-brand-accent">
        <thead>
          <tr>
            {grid[0]?.map((_, colIndex) => (<th key={`header-${colIndex}`} className="p-2 border border-brand-accent text-center font-semibold text-brand-highlight">{days[colIndex] || `Kolom ${colIndex + 1}`}</th>))}
          </tr>
        </thead>
        <tbody>
          {filteredGrid.map(({ row, originalIndex }) => (
            <tr key={`row-${originalIndex}`}>
              {row.map((cell, colIndex) => (
                <td key={`cell-${originalIndex}-${colIndex}`} className="p-0 border border-brand-accent">
                  <input type="text" inputMode="numeric" pattern="[0-9xX]*" value={cell} onChange={(e) => handleInputChange(e, originalIndex, colIndex)} maxLength={4} className="w-24 h-10 p-2 bg-brand-secondary text-brand-text text-center focus:outline-none focus:ring-2 focus:ring-brand-highlight focus:bg-brand-accent tracking-widest" aria-label={`Input untuk baris ${originalIndex + 1}, kolom ${days[colIndex] || colIndex + 1}`} placeholder="XXXX"/>
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

// --- Main App Component (from App.tsx) ---
function App() {
  const [grid, setGrid] = useState<GridData>([]);
  const [question, setQuestion] = useState<string>('');
  const [result, setResult] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [actionMessage, setActionMessage] = useState<ActionMessage | null>(null);
  const [activeMarket, setActiveMarket] = useState('SIDNEY');
  
  const LOCAL_STORAGE_KEY_SIDNEY = 'gemini-grid-analyzer-data-sydney';
  const LOCAL_STORAGE_KEY_HONGKONG = 'gemini-grid-analyzer-data-hongkong';
  const LOCAL_STORAGE_KEY_SINGAPORE = 'gemini-grid-analyzer-data-singapore';

  useEffect(() => {
    let key: string;
    let defaultData: GridData;
    switch (activeMarket) {
      case 'HONGKONG':
        key = LOCAL_STORAGE_KEY_HONGKONG;
        defaultData = PREPOPULATED_GRID_DATA_HONGKONG;
        break;
      case 'SINGAPORE':
        key = LOCAL_STORAGE_KEY_SINGAPORE;
        defaultData = PREPOPULATED_GRID_DATA_SINGAPORE;
        break;
      case 'SIDNEY':
      default:
        key = LOCAL_STORAGE_KEY_SIDNEY;
        defaultData = PREPOPULATED_GRID_DATA_SIDNEY;
        break;
    }
    try {
      const savedGrid = window.localStorage.getItem(key);
      if (savedGrid) {
        const parsedGrid = JSON.parse(savedGrid);
        if (Array.isArray(parsedGrid) && parsedGrid.every(row => Array.isArray(row))) {
          setGrid(parsedGrid);
          return;
        }
      }
    } catch (error) {
      console.error(`Gagal memuat data untuk ${activeMarket}:`, error);
    }
    setGrid(defaultData);
  }, [activeMarket]);

  const displayActionMessage = (text: string, type: 'success' | 'error') => {
    setActionMessage({ text, type });
    setTimeout(() => { setActionMessage(null); }, 3000);
  };

  const handleGridChange = useCallback((rowIndex: number, colIndex: number, value: string) => {
    setGrid(prevGrid => {
      const newGrid = prevGrid.map(row => [...row]);
      newGrid[rowIndex][colIndex] = value;
      return newGrid;
    });
  }, []);

  const handleAddRows = useCallback(() => {
    const newRow: string[] = Array(7).fill('');
    setGrid(prevGrid => [...prevGrid, newRow]);
  }, []);
  
  const handleSaveGrid = useCallback(() => {
    let key: string;
    switch (activeMarket) {
      case 'HONGKONG': key = LOCAL_STORAGE_KEY_HONGKONG; break;
      case 'SINGAPORE': key = LOCAL_STORAGE_KEY_SINGAPORE; break;
      case 'SIDNEY': default: key = LOCAL_STORAGE_KEY_SIDNEY; break;
    }
    try {
      window.localStorage.setItem(key, JSON.stringify(grid));
      displayActionMessage('Data grid berhasil disimpan!', 'success');
    } catch (error) {
      console.error("Gagal menyimpan data grid ke localStorage:", error);
      displayActionMessage('Gagal menyimpan data grid.', 'error');
    }
  }, [grid, activeMarket]);

  const handleExportGrid = useCallback(() => {
    try {
      const now = new Date();
      const fileName = `${activeMarket.toLowerCase()}_${now.getDate()}_${["januari", "februari", "maret", "april", "mei", "juni", "juli", "agustus", "september", "oktober", "november", "desember"][now.getMonth()]}_${now.getFullYear()}.json`;
      const jsonString = JSON.stringify(grid, null, 2);
      const blob = new Blob([jsonString], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = fileName;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (error) {
        console.error("Gagal mengekspor data:", error);
        displayActionMessage('Gagal mengekspor data.', 'error');
    }
  }, [grid, activeMarket]);

  const handleImportGrid = useCallback((fileContent: string) => {
    try {
        const parsedData = JSON.parse(fileContent);
        if (!Array.isArray(parsedData) || !parsedData.every(row => Array.isArray(row) && row.every(cell => typeof cell === 'string'))) {
          throw new Error("Format file tidak valid. Harap unggah file JSON dengan struktur yang benar (array dari array string).");
        }
        setGrid(parsedData as GridData);
        displayActionMessage('Data berhasil diimpor!', 'success');
    } catch (error) {
        const errorMessage = error instanceof Error ? error.message : "Gagal membaca file.";
        displayActionMessage(`Gagal mengimpor: ${errorMessage}`, 'error');
    }
  }, []);

  const handleMarketSwitch = () => {
    let currentKey: string;
    switch (activeMarket) {
      case 'HONGKONG': currentKey = LOCAL_STORAGE_KEY_HONGKONG; break;
      case 'SINGAPORE': currentKey = LOCAL_STORAGE_KEY_SINGAPORE; break;
      case 'SIDNEY': default: currentKey = LOCAL_STORAGE_KEY_SIDNEY; break;
    }
    try {
        window.localStorage.setItem(currentKey, JSON.stringify(grid));
    } catch (e) {
        console.error("Gagal menyimpan otomatis saat beralih market:", e);
        displayActionMessage('Gagal menyimpan data saat beralih.', 'error');
    }
    setActiveMarket(prev => (prev === 'SIDNEY' ? 'HONGKONG' : prev === 'HONGKONG' ? 'SINGAPORE' : 'SIDNEY'));
  };

  const findMissingNumbers = useCallback((dimension: 2 | 3) => {
    setResult('');
    setError(null);
    setIsLoading(true);

    try {
        const allCells = grid.flat().filter(cell => cell && cell.trim().length >= dimension);
        const last100Entries = allCells.slice(-100);
        const recentNumbers = new Set<string>();
        last100Entries.forEach(cell => {
            recentNumbers.add(cell.slice(-dimension));
        });

        const missingNumbers: string[] = [];
        const limit = Math.pow(10, dimension);
        for (let i = 0; i < limit; i++) {
            const numberStr = String(i).padStart(dimension, '0');
            if (!recentNumbers.has(numberStr)) {
                missingNumbers.push(numberStr);
            }
        }
        
        if (missingNumbers.length > 0) {
            const chunkSize = 10;
            const chunks = [];
            for (let i = 0; i < missingNumbers.length; i += chunkSize) {
                chunks.push(missingNumbers.slice(i, i + chunkSize).join('*'));
            }
            setResult(`Angka ${dimension}D yang belum muncul dalam ${last100Entries.length} entri terakhir:\n\n${chunks.join('\n')}`);
        } else {
            setResult(`Semua angka ${dimension}D telah muncul dalam ${last100Entries.length} entri terakhir.`);
        }
    } catch (e) {
        const errorMessage = e instanceof Error ? e.message : 'Terjadi kesalahan.';
        setError(`Gagal mencari angka ${dimension}D: ${errorMessage}`);
    } finally {
        setIsLoading(false);
    }
  }, [grid]);
  
  const findFrequentNumbers = useCallback((dimension: 2 | 3) => {
    setResult('');
    setError(null);
    setIsLoading(true);
    try {
      const allCells = grid.flat().filter(cell => cell && cell.trim().length >= dimension);
      const last100Entries = allCells.slice(-100);
      const counts = new Map<string, number>();

      last100Entries.forEach(cell => {
        const num = cell.slice(-dimension);
        counts.set(num, (counts.get(num) || 0) + 1);
      });

      const frequentNumbers = Array.from(counts.entries())
        .filter(([, count]) => count > 2)
        .map(([num, count]) => `${num} (${count}x)`);
      
      if (frequentNumbers.length > 0) {
          setResult(`Angka ${dimension}D yang muncul lebih dari 2 kali dalam ${last100Entries.length} entri terakhir:\n\n${frequentNumbers.join('*')}`);
      } else {
          setResult(`Tidak ada angka ${dimension}D yang muncul lebih dari 2 kali dalam ${last100Entries.length} entri terakhir.`);
      }
    } catch (e) {
        const errorMessage = e instanceof Error ? e.message : 'Terjadi kesalahan.';
        setError(`Gagal mencari angka ${dimension}D yang sering muncul: ${errorMessage}`);
    } finally {
        setIsLoading(false);
    }
  }, [grid]);

  const handleAnalyze = async () => {
    if (!question.trim()) {
      setError("Silakan masukkan pertanyaan untuk menganalisis grid.");
      return;
    }
    setIsLoading(true);
    setError(null);
    setResult('');
    try {
      const analysisResult = await analyzeGrid(grid, question);
      if (analysisResult.startsWith('Terjadi kesalahan')) {
        setError(analysisResult);
      } else {
        setResult(analysisResult);
      }
    } catch (e) {
      const errorMessage = e instanceof Error ? e.message : 'Terjadi kesalahan yang tidak terduga.';
      setError(`Gagal mendapatkan analisis: ${errorMessage}`);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="bg-brand-primary min-h-screen text-brand-text p-4 sm:p-6 lg:p-8 font-sans">
      <div className="max-w-7xl mx-auto">
        <header className="p-4 mb-8 bg-gray-800/50 border border-gray-700 rounded-lg backdrop-blur-sm sticky top-4 z-10">
          <div className="flex justify-center items-center gap-4">
            <img src="https://i.postimg.cc/hjqy34TJ/logo-ARJ-2-removebg-preview.png" alt="Logo ARJ Predict" className="h-12 w-auto transform -translate-y-1"/>
            <h1 className="text-4xl font-bold tracking-tight">
              <button onClick={handleMarketSwitch} className={`transition-all duration-300 ease-in-out transform hover:scale-105 cursor-pointer ${activeMarket === 'SIDNEY' ? 'text-yellow-400' : activeMarket === 'HONGKONG' ? 'text-red-500' : 'text-green-500'}`}>
                {activeMarket}
              </button>
              <span className="ml-2">Analis</span>
            </h1>
          </div>
        </header>
        <main className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div className="overflow-x-auto">
            <InputGrid grid={grid} onGridChange={handleGridChange} onAddRows={handleAddRows} onSave={handleSaveGrid} onExport={handleExportGrid} onImport={handleImportGrid} actionMessage={actionMessage} />
          </div>
          <div className="flex flex-col">
            <AnalysisControls question={question} onQuestionChange={setQuestion} onAnalyze={handleAnalyze} isLoading={isLoading} onFindMissing2D={() => findMissingNumbers(2)} onFindMissing3D={() => findMissingNumbers(3)} onFindFrequent2D={() => findFrequentNumbers(2)} onFindFrequent3D={() => findFrequentNumbers(3)} />
            <ResultsDisplay result={result} isLoading={isLoading} error={error} />
          </div>
        </main>
        <footer className="text-center mt-12 text-sm text-brand-text-faded">
          <p>&copy; 2025 {activeMarket} Analis. Dirancang Oleh ARJ Predict.</p>
        </footer>
      </div>
    </div>
  );
}

// --- Mount the App ---
const rootElement = document.getElementById('root');
if (!rootElement) {
  throw new Error("Could not find root element to mount to");
}
const root = ReactDOM.createRoot(rootElement);
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
