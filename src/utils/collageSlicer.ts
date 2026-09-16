/**
 * Utility to slice a 20-photo contact sheet collage into 20 individual image DataURLs.
 * Specifically handles the layout:
 * - Row 1: 7 photos (1 to 7)
 * - Row 2: 7 photos (8 to 14)
 * - Row 3: 6 photos (15 to 20)
 */

export interface SlicedPhoto {
  id: number;
  dataUrl: string;
}

export async function sliceCollageImage(fileOrBlob: Blob): Promise<SlicedPhoto[]> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    const objectUrl = URL.createObjectURL(fileOrBlob);

    img.onload = () => {
      URL.revokeObjectURL(objectUrl);
      try {
        const W = img.naturalWidth;
        const H = img.naturalHeight;

        const results: SlicedPhoto[] = [];

        // Row definitions:
        // Total rows = 3
        // Row 1: Y from 0 to H * 0.333, 7 items
        // Row 2: Y from H * 0.333 to H * 0.666, 7 items
        // Row 3: Y from H * 0.666 to H * 1.0, 6 items

        // Let's create an off-screen canvas
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        if (!ctx) {
          reject(new Error('Canvas 2D context not available'));
          return;
        }

        const rowConfigs = [
          { rowIdx: 0, count: 7, startId: 1, yMin: 0.01, yMax: 0.31 },
          { rowIdx: 1, count: 7, startId: 8, yMin: 0.34, yMax: 0.64 },
          { rowIdx: 2, count: 6, startId: 15, yMin: 0.67, yMax: 0.97 }
        ];

        for (const rc of rowConfigs) {
          const colWidthRatio = 1.0 / rc.count;
          const yStart = rc.yMin * H;
          const cropH = (rc.yMax - rc.yMin) * H;

          for (let c = 0; c < rc.count; c++) {
            const id = rc.startId + c;
            // Crop with slight inset to avoid black borders and numbers
            const xCenter = (c + 0.5) * colWidthRatio * W;
            const itemWidth = colWidthRatio * W * 0.78; // exclude margins
            const xStart = Math.max(0, xCenter - itemWidth / 2);

            canvas.width = Math.round(itemWidth);
            canvas.height = Math.round(cropH);

            ctx.clearRect(0, 0, canvas.width, canvas.height);
            ctx.drawImage(
              img,
              xStart,
              yStart,
              itemWidth,
              cropH,
              0,
              0,
              canvas.width,
              canvas.height
            );

            const dataUrl = canvas.toDataURL('image/jpeg', 0.92);
            results.push({ id, dataUrl });
          }
        }

        resolve(results);
      } catch (err) {
        reject(err);
      }
    };

    img.onerror = (err) => {
      URL.revokeObjectURL(objectUrl);
      reject(err);
    };

    img.src = objectUrl;
  });
}
