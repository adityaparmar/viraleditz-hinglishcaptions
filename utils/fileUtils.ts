
export const fileToBase64 = (file: File): Promise<{ base64: string, mimeType: string }> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => {
      const result = reader.result as string;
      const [header, base64] = result.split(',');
      const mimeTypeMatch = header.match(/:(.*?);/);
      if (!mimeTypeMatch || !base64) {
        reject(new Error("Could not parse file data."));
        return;
      }
      const mimeType = mimeTypeMatch[1];
      resolve({ base64, mimeType });
    };
    reader.onerror = (error) => reject(error);
  });
};
