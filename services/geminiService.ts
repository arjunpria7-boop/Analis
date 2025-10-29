import { GoogleGenAI } from "@google/genai";
import { GridData } from '../types';

// Per coding guidelines, the API key must be read from process.env.API_KEY.
// It is assumed to be pre-configured and valid.
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

function formatGridDataForPrompt(grid: GridData): string {
  // Convert the grid to a CSV-like string, replacing empty cells with 'x' for clarity.
  return grid.map(row => row.map(cell => cell.trim() === '' ? 'x' : cell).join(',')).join('\n');
}

/**
 * Analyzes the provided grid data based on a user's question using the Gemini API.
 * @param grid The grid data to analyze.
 * @param question The user's question about the grid data.
 * @returns A string containing the analysis from the Gemini model.
 */
export const analyzeGrid = async (grid: GridData, question: string): Promise<string> => {
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

    // Per coding guidelines, use generateContent with the model name and prompt.
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash', // Use gemini-2.5-flash for basic text tasks.
      contents: prompt,
    });

    // Per coding guidelines, extract the text response directly from the `text` property.
    return response.text;
  } catch (error) {
    console.error("Error analyzing grid with Gemini API:", error);
    if (error instanceof Error) {
        // Provide a user-friendly error message.
        return `Terjadi kesalahan saat analisis: ${error.message}`;
    }
    return "Terjadi kesalahan yang tidak diketahui saat analisis.";
  }
};