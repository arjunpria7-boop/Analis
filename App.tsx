import React, { useState, useCallback, useEffect } from 'react';
import { GridData } from './types';
import { PREPOPULATED_GRID_DATA_SIDNEY, PREPOPULATED_GRID_DATA_HONGKONG, PREPOPULATED_GRID_DATA_SINGAPORE } from './constants';
import { analyzeGrid } from './services/geminiService';
import InputGrid from './components/InputGrid';
import AnalysisControls from './components/AnalysisControls';
import ResultsDisplay from './components/ResultsDisplay';

const LOCAL_STORAGE_KEY_SIDNEY = 'gemini-grid-analyzer-data-sydney';
const LOCAL_STORAGE_KEY_HONGKONG = 'gemini-grid-analyzer-data-hongkong';
const LOCAL_STORAGE_KEY_SINGAPORE = 'gemini-grid-analyzer-data-singapore';


// Tipe untuk pesan umpan balik
type ActionMessage = {
  text: string;
  type: 'success' | 'error';
};

function App() {
  const [grid, setGrid] = useState<GridData>([]);
  const [question, setQuestion] = useState<string>('');
  const [result, setResult] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [actionMessage, setActionMessage] = useState<ActionMessage | null>(null);
  const [activeMarket, setActiveMarket] = useState('SIDNEY');

  // Muat data saat market berubah
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
        if (
          Array.isArray(parsedGrid) &&
          parsedGrid.every(row => Array.isArray(row))
        ) {
          setGrid(parsedGrid);
          return;
        }
      }
    } catch (error) {
      console.error(`Gagal memuat data untuk ${activeMarket}:`, error);
    }
    setGrid(defaultData);
  }, [activeMarket]);

  // Fungsi pembantu untuk menampilkan pesan umpan balik sementara
  const displayActionMessage = (text: string, type: 'success' | 'error') => {
    setActionMessage({ text, type });
    setTimeout(() => {
      setActionMessage(null);
    }, 3000);
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
      case 'HONGKONG':
        key = LOCAL_STORAGE_KEY_HONGKONG;
        break;
      case 'SINGAPORE':
        key = LOCAL_STORAGE_KEY_SINGAPORE;
        break;
      case 'SIDNEY':
      default:
        key = LOCAL_STORAGE_KEY_SIDNEY;
        break;
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
      const day = now.getDate();
      const year = now.getFullYear();
      const monthNames = [
        "januari", "februari", "maret", "april", "mei", "juni",
        "juli", "agustus", "september", "oktober", "november", "desember"
      ];
      const month = monthNames[now.getMonth()];
      
      const marketName = activeMarket.toLowerCase();
      const fileName = `${marketName}_${day}_${month}_${year}.json`;

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
        if (
          !Array.isArray(parsedData) ||
          !parsedData.every(row => 
            Array.isArray(row) && 
            row.every(cell => typeof cell === 'string')
          )
        ) {
          throw new Error("Format file tidak valid. Harap unggah file JSON dengan struktur yang benar (array dari array string).");
        }
        setGrid(parsedData as GridData);
        displayActionMessage('Data berhasil diimpor!', 'success');
    } catch (error) {
        console.error("Gagal mengimpor data grid:", error);
        const errorMessage = error instanceof Error ? error.message : "Gagal membaca file.";
        displayActionMessage(`Gagal mengimpor: ${errorMessage}`, 'error');
    }
  }, []);

  const handleMarketSwitch = () => {
    let currentKey: string;
    switch (activeMarket) {
      case 'HONGKONG':
        currentKey = LOCAL_STORAGE_KEY_HONGKONG;
        break;
      case 'SINGAPORE':
        currentKey = LOCAL_STORAGE_KEY_SINGAPORE;
        break;
      case 'SIDNEY':
      default:
        currentKey = LOCAL_STORAGE_KEY_SIDNEY;
        break;
    }
    
    try {
        window.localStorage.setItem(currentKey, JSON.stringify(grid));
    } catch (e) {
        console.error("Gagal menyimpan otomatis saat beralih market:", e);
        displayActionMessage('Gagal menyimpan data saat beralih.', 'error');
    }
    
    setActiveMarket(prev => {
        if (prev === 'SIDNEY') return 'HONGKONG';
        if (prev === 'HONGKONG') return 'SINGAPORE';
        return 'SIDNEY'; // from SINGAPORE
    });
  };

  const handleFindMissing2D = useCallback(() => {
    setResult('');
    setError(null);
    setIsLoading(true);

    try {
        const allCells = grid.flat().filter(cell => cell && cell.trim().length >= 2);
        const last100Entries = allCells.slice(-100);
        const recent2DNumbers = new Set<string>();
        last100Entries.forEach(cell => {
            recent2DNumbers.add(cell.slice(-2));
        });

        const missingNumbers: string[] = [];
        for (let i = 0; i < 100; i++) {
            const numberStr = String(i).padStart(2, '0');
            if (!recent2DNumbers.has(numberStr)) {
                missingNumbers.push(numberStr);
            }
        }

        if (missingNumbers.length > 0) {
            const chunkSize = 10;
            const chunks = [];
            for (let i = 0; i < missingNumbers.length; i += chunkSize) {
                chunks.push(missingNumbers.slice(i, i + chunkSize).join('*'));
            }
            const formattedNumbers = chunks.join('\n');
            const resultString = `Angka 2D yang belum muncul dalam ${last100Entries.length} entri terakhir:\n\n${formattedNumbers}`;
            setResult(resultString);
        } else {
            setResult(`Semua angka 2D (00-99) telah muncul dalam ${last100Entries.length} entri terakhir.`);
        }
    } catch (e) {
        const errorMessage = e instanceof Error ? e.message : 'Terjadi kesalahan yang tidak terduga.';
        setError(`Gagal mencari angka 2D: ${errorMessage}`);
    } finally {
        setIsLoading(false);
    }
  }, [grid]);

  const handleFindMissing3D = useCallback(() => {
    setResult('');
    setError(null);
    setIsLoading(true);

    try {
        const allCells = grid.flat().filter(cell => cell && cell.trim().length >= 3);
        const last100Entries = allCells.slice(-100);
        const recent3DNumbers = new Set<string>();
        last100Entries.forEach(cell => {
            recent3DNumbers.add(cell.slice(-3));
        });

        const missingNumbers: string[] = [];
        for (let i = 0; i < 1000; i++) {
            const numberStr = String(i).padStart(3, '0');
            if (!recent3DNumbers.has(numberStr)) {
                missingNumbers.push(numberStr);
            }
        }

        if (missingNumbers.length > 0) {
            const chunkSize = 10;
            const chunks = [];
            for (let i = 0; i < missingNumbers.length; i += chunkSize) {
                chunks.push(missingNumbers.slice(i, i + chunkSize).join('*'));
            }
            const formattedNumbers = chunks.join('\n');
            const resultString = `Angka 3D yang belum muncul dalam ${last100Entries.length} entri terakhir:\n\n${formattedNumbers}`;
            setResult(resultString);
        } else {
            setResult(`Semua angka 3D (000-999) telah muncul dalam ${last100Entries.length} entri terakhir.`);
        }
    } catch (e) {
        const errorMessage = e instanceof Error ? e.message : 'Terjadi kesalahan yang tidak terduga.';
        setError(`Gagal mencari angka 3D: ${errorMessage}`);
    } finally {
        setIsLoading(false);
    }
  }, [grid]);

  const handleFindFrequent2D = useCallback(() => {
    setResult('');
    setError(null);
    setIsLoading(true);
    try {
      const allCells = grid.flat().filter(cell => cell && cell.trim().length >= 2);
      const last100Entries = allCells.slice(-100);
      const counts = new Map<string, number>();

      last100Entries.forEach(cell => {
        const twoDigitNum = cell.slice(-2);
        counts.set(twoDigitNum, (counts.get(twoDigitNum) || 0) + 1);
      });

      const frequentNumbers: string[] = [];
      counts.forEach((count, num) => {
        if (count > 2) {
          frequentNumbers.push(`${num} (${count}x)`);
        }
      });
      
      if (frequentNumbers.length > 0) {
          const resultString = `Angka 2D yang muncul lebih dari 2 kali dalam ${last100Entries.length} entri terakhir:\n\n${frequentNumbers.join('*')}`;
          setResult(resultString);
      } else {
          setResult(`Tidak ada angka 2D yang muncul lebih dari 2 kali dalam ${last100Entries.length} entri terakhir.`);
      }

    } catch (e) {
        const errorMessage = e instanceof Error ? e.message : 'Terjadi kesalahan yang tidak terduga.';
        setError(`Gagal mencari angka 2D yang sering muncul: ${errorMessage}`);
    } finally {
        setIsLoading(false);
    }
  }, [grid]);

  const handleFindFrequent3D = useCallback(() => {
    setResult('');
    setError(null);
    setIsLoading(true);
    try {
      const allCells = grid.flat().filter(cell => cell && cell.trim().length >= 3);
      const last100Entries = allCells.slice(-100);
      const counts = new Map<string, number>();
      
      last100Entries.forEach(cell => {
        const threeDigitNum = cell.slice(-3);
        counts.set(threeDigitNum, (counts.get(threeDigitNum) || 0) + 1);
      });

      const frequentNumbers: string[] = [];
      counts.forEach((count, num) => {
        if (count > 2) {
          frequentNumbers.push(`${num} (${count}x)`);
        }
      });

      if (frequentNumbers.length > 0) {
          const resultString = `Angka 3D yang muncul lebih dari 2 kali dalam ${last100Entries.length} entri terakhir:\n\n${frequentNumbers.join('*')}`;
          setResult(resultString);
      } else {
          setResult(`Tidak ada angka 3D yang muncul lebih dari 2 kali dalam ${last100Entries.length} entri terakhir.`);
      }

    } catch (e) {
        const errorMessage = e instanceof Error ? e.message : 'Terjadi kesalahan yang tidak terduga.';
        setError(`Gagal mencari angka 3D yang sering muncul: ${errorMessage}`);
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

    const gridSnapshot = JSON.parse(JSON.stringify(grid));

    try {
      const analysisResult = await analyzeGrid(gridSnapshot, question);
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
            <img 
              src="https://i.postimg.cc/hjqy34TJ/logo-ARJ-2-removebg-preview.png" 
              alt="Logo ARJ Predict" 
              className="h-12 w-auto transform -translate-y-1"
            />
            <h1 className="text-4xl font-bold tracking-tight">
              <button
                onClick={handleMarketSwitch}
                className={`transition-all duration-300 ease-in-out transform hover:scale-105 cursor-pointer ${
                  activeMarket === 'SIDNEY' ? 'text-yellow-400' : 
                  activeMarket === 'HONGKONG' ? 'text-red-500' : 
                  'text-green-500'
                }`}
              >
                {activeMarket}
              </button>
              <span className="ml-2">Analis</span>
            </h1>
          </div>
        </header>

        <main className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div className="overflow-x-auto">
            <InputGrid
              grid={grid}
              onGridChange={handleGridChange}
              onAddRows={handleAddRows}
              onSave={handleSaveGrid}
              onExport={handleExportGrid}
              onImport={handleImportGrid}
              actionMessage={actionMessage}
            />
          </div>

          <div className="flex flex-col">
            <AnalysisControls
              question={question}
              onQuestionChange={setQuestion}
              onAnalyze={handleAnalyze}
              isLoading={isLoading}
              onFindMissing2D={handleFindMissing2D}
              onFindMissing3D={handleFindMissing3D}
              onFindFrequent2D={handleFindFrequent2D}
              onFindFrequent3D={handleFindFrequent3D}
            />
            <ResultsDisplay
              result={result}
              isLoading={isLoading}
              error={error}
            />
          </div>
        </main>
        
        <footer className="text-center mt-12 text-sm text-brand-text-faded">
          <p>&copy; 2025 {activeMarket} Analis. Dirancang Oleh ARJ Predict.</p>
        </footer>
      </div>
    </div>
  );
}

export default App;