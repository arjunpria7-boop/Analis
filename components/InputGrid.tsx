import React, { useState, useMemo, useRef } from 'react';
import { GridData } from '../types';
import { SaveIcon, SearchIcon, ExportIcon, ImportIcon } from './Icons';

type ActionMessage = {
  text: string;
  type: 'success' | 'error';
};

interface InputGridProps {
  grid: GridData;
  onGridChange: (rowIndex: number, colIndex: number, value: string) => void;
  onAddRows: () => void;
  onSave: () => void;
  onExport: () => void;
  onImport: (fileContent: string) => void;
  actionMessage: ActionMessage | null;
}

const InputGrid: React.FC<InputGridProps> = ({ 
  grid, onGridChange, onAddRows, onSave, onExport, onImport, actionMessage 
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement>,
    rowIndex: number,
    colIndex: number
  ) => {
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
    reader.onerror = () => {
        console.error("Gagal membaca file.");
    };
    reader.readAsText(file);
    // Reset nilai input untuk memungkinkan pengunggahan ulang file yang sama
    if (e.target) {
      e.target.value = '';
    }
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
        {/* Baris 1: Kontrol Data & Pencarian */}
        <div className="flex flex-wrap justify-between items-center gap-4">
          <div className="flex items-center gap-2">
              <button onClick={onSave} className="px-3 py-2 bg-blue-600 text-white font-bold rounded-md hover:bg-blue-700 transition-colors flex items-center gap-2" aria-label="Simpan Data Grid">
                  <SaveIcon /> <span>Simpan</span>
              </button>
              <button onClick={onExport} className="px-3 py-2 bg-green-600 text-white font-bold rounded-md hover:bg-green-700 transition-colors flex items-center gap-2" aria-label="Ekspor Data Grid">
                  <ExportIcon /> <span>Ekspor</span>
              </button>
              <button onClick={handleImportClick} className="px-3 py-2 bg-purple-600 text-white font-bold rounded-md hover:bg-purple-700 transition-colors flex items-center gap-2" aria-label="Impor Data Grid">
                  <ImportIcon /> <span>Impor</span>
              </button>
              <input type="file" ref={fileInputRef} onChange={handleFileChange} accept=".json" style={{ display: 'none' }} />
          </div>
          <div className="relative flex-grow min-w-[200px]">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <SearchIcon />
            </div>
            <input
              type="search"
              placeholder="Cari angka..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full p-2 pl-10 bg-brand-primary text-brand-text rounded-lg border-2 border-brand-accent focus:outline-none focus:ring-2 focus:ring-brand-highlight focus:border-transparent"
              aria-label="Cari data di dalam grid"
            />
          </div>
        </div>
        
        {/* Baris 2: Pesan Aksi */}
        <div className="min-h-[24px] flex items-center">
            {actionMessage && (
              <p
                className={`text-sm font-semibold transition-opacity duration-500 ease-in-out ${
                    actionMessage.type === 'success' ? 'text-green-400' : 'text-red-500'
                }`}
                aria-live="polite"
              >
                {actionMessage.text}
              </p>
            )}
        </div>
      </div>
      <table className="table-auto border-collapse border border-brand-accent">
        <thead>
          <tr>
            {grid[0]?.map((_, colIndex) => (
              <th
                key={`header-${colIndex}`}
                className="p-2 border border-brand-accent text-center font-semibold text-brand-highlight"
              >
                {days[colIndex] || `Kolom ${colIndex + 1}`}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {filteredGrid.map(({ row, originalIndex }) => (
            <tr key={`row-${originalIndex}`}>
              {row.map((cell, colIndex) => (
                <td
                  key={`cell-${originalIndex}-${colIndex}`}
                  className="p-0 border border-brand-accent"
                >
                  <input
                    type="text"
                    inputMode="numeric"
                    pattern="[0-9xX]*"
                    value={cell}
                    onChange={(e) => handleInputChange(e, originalIndex, colIndex)}
                    maxLength={4}
                    className="w-24 h-10 p-2 bg-brand-secondary text-brand-text text-center focus:outline-none focus:ring-2 focus:ring-brand-highlight focus:bg-brand-accent tracking-widest"
                    aria-label={`Input untuk baris ${originalIndex + 1}, kolom ${days[colIndex] || colIndex + 1}`}
                    placeholder="XXXX"
                  />
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default InputGrid;