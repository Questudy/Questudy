declare module '*pdf.min.mjs' {
  export const GlobalWorkerOptions: { workerSrc: string };
  export function getDocument(options: { data: ArrayBuffer; cMapUrl: string; cMapPacked: boolean; standardFontDataUrl: string; isEvalSupported: boolean }): {
    promise: Promise<{ numPages: number; getPage(page: number): Promise<{ getTextContent(): Promise<{ items: { str?: string; hasEOL?: boolean }[] }>; cleanup(): void }> }>;
    destroy(): Promise<void>;
  };
}
