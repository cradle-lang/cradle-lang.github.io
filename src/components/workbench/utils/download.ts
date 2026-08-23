export function downloadTextFile(
  name: string,
  mimeType: string,
  content: string,
): void {
  const blob = new Blob(
    [content],
    {
      type: mimeType,
    },
  );

  const url = URL.createObjectURL(blob);

  const anchor = document.createElement('a');

  anchor.href = url;
  anchor.download = name;

  document.body.appendChild(anchor);

  anchor.click();
  anchor.remove();

  window.setTimeout(() => {
    URL.revokeObjectURL(url);
  }, 1000);
}