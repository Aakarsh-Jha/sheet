export const compressImage = (dataUrl, maxWidth = 1000, maxHeight = 1000, quality = 0.7) => {
  return new Promise((resolve) => {
    const img = document.createElement('img');
    img.src = dataUrl;
    img.onload = () => {
      let width = img.width;
      let height = img.height;

      // Scale dimensions down if they exceed maximum limits
      if (width > height) {
        if (width > maxWidth) {
          height = Math.round((height * maxWidth) / width);
          width = maxWidth;
        }
      } else {
        if (height > maxHeight) {
          width = Math.round((width * maxHeight) / height);
          height = maxHeight;
        }
      }

      const canvas = document.createElement('canvas');
      canvas.width = width;
      canvas.height = height;

      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.drawImage(img, 0, 0, width, height);
        // Using image/jpeg for excellent compression compared to raw png
        const compressedDataUrl = canvas.toDataURL('image/jpeg', quality);
        resolve(compressedDataUrl);
      } else {
        resolve(dataUrl);
      }
    };
    img.onerror = () => {
      resolve(dataUrl);
    };
  });
};
