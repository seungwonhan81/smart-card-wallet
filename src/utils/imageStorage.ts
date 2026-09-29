export const saveImageToDevice = (imageDataUrl: string, cardName: string): void => {
  const date = new Date().toISOString().slice(0, 10);
  const safeName = cardName.replace(/[^\w가-힣]/g, '_');
  const filename = `명함_${safeName}_${date}.jpg`;

  const a = document.createElement('a');
  a.href = imageDataUrl;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
};
