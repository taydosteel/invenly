'use client';

import { useEffect, useRef, useState } from 'react';

export default function ScanPage() {
  const scannerRef = useRef<any>(null);
  const [code, setCode] = useState<string | null>(null);
  const [item, setItem] = useState<any>(null);
  const [form, setForm] = useState<any>({});
  const [editing, setEditing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const scannedRef = useRef(false);

  const handleResult = async (scannedCode: string) => {
    if (scannedRef.current || scannedCode === code) return;
    scannedRef.current = true;
    setCode(scannedCode);

    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/item/code/${scannedCode}`);
      if (!res.ok) throw new Error('Không tìm thấy sản phẩm');
      const data = await res.json();
      setItem(data);
      setForm(data);
      setEditing(false);
      setError(null);
    } catch (err: any) {
      setItem(null);
      setError(err.message || 'Lỗi khi gọi API');
    }

    setTimeout(() => {
      scannedRef.current = false;
    }, 3000);
  };

  useEffect(() => {
    let scannerInstance: any;

    import('html5-qrcode').then(({ Html5Qrcode }) => {
      if (!scannerRef.current) {
        scannerInstance = new Html5Qrcode('reader');
        scannerRef.current = scannerInstance;

        scannerInstance
          .start(
            { facingMode: 'environment' },
            { fps: 10, qrbox: { width: 250, height: 250 } },
            (decodedText:string) => handleResult(decodedText),
            () => {}
          )
          .catch((err: any) => {
            console.error('🚫 Không thể mở camera:', err);
          });
      }
    });

    return () => {
      if (scannerRef.current) {
        scannerRef.current
          .stop()
          .then(() => {
            scannerRef.current.clear();
            document.getElementById('reader')!.innerHTML = ''; // Xóa DOM thừa
            scannerRef.current = null;
          })
          .catch(() => {});
      }
    };
  }, []);

  return (
    <div className="p-6 space-y-6">
      <h2 className="text-2xl font-semibold">Quét mã QR sản phẩm</h2>

      <div id="reader" className="w-full max-w-xs mx-auto border rounded overflow-hidden" />

      {code && <p className="text-sm text-muted-foreground">Mã quét: <code>{code}</code></p>}
      {error && <p className="text-red-500">⚠ {error}</p>}

      {item && (
        <div className="bg-white rounded shadow p-4 space-y-3">
          <h3 className="text-lg font-bold">{item.name}</h3>
          <p><strong>Mô tả:</strong> {item.description}</p>
          <p><strong>Nguồn:</strong> {item.source}</p>
          <p><strong>Loại:</strong> {item.category}</p>
          {item.imageUrl && (
            <img
              src={item.imageUrl}
              alt={item.name}
              className="h-32 mt-2 rounded object-contain"
            />
          )}
        </div>
      )}
    </div>
  );
}
