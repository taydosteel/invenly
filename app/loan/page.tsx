'use client';

import { useEffect, useRef, useState } from 'react';
import { Button } from '@/components/ui/button';

export default function LoanScanPage() {
  const scannerRef = useRef<any>(null);
  const scannedRef = useRef(false);

  const [scannedItems, setScannedItems] = useState<any[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [form, setForm] = useState({ borrowerName: '', returnDueDate: '' });

  const scannedCodesRef = useRef<Set<string>>(new Set());

  const handleResult = async (scannedCode: string) => {
    if (scannedRef.current || scannedCodesRef.current.has(scannedCode)) return;
    scannedRef.current = true;

    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/item/code/${scannedCode}`);
      if (!res.ok) throw new Error('Không tìm thấy vật phẩm');
      const data = await res.json();

      if (data.isLoaned) {
        setError(`❌ Vật phẩm "${data.name}" đã được mượn.`);
      } else {
        scannedCodesRef.current.add(scannedCode);
        setScannedItems((prev) => [...prev, data]);
        setError(null);
      }
    } catch (err: any) {
      setError(err.message || 'Lỗi khi quét mã');
    }

    setTimeout(() => {
      scannedRef.current = false;
    }, 3000);
  };


  useEffect(() => {
    import('html5-qrcode').then(({ Html5Qrcode }) => {
      const container = document.getElementById('reader');
      if (container) container.innerHTML = '';

      const scanner = new Html5Qrcode('reader');
      scannerRef.current = scanner;

      scanner
        .start(
          { facingMode: 'environment' },
          { fps: 10, qrbox: 250 },
          (decodedText: string) => handleResult(decodedText),
          () => { }
        )
        .catch((err) => console.error('🚫 Không thể mở camera:', err));
    });

    return () => {
      if (scannerRef.current) {
        scannerRef.current
          .stop()
          .then(() => scannerRef.current.clear());
      }
    };
  }, []);

  const handleSubmit = async () => {
    const payload = {
      borrowerName: form.borrowerName,
      returnDueDate: form.returnDueDate,
      itemCodes: scannedItems.map((i) => i.code),
      createdBy: 'admin' // hoặc lấy từ token
    };

    const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/loan/batch`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });

    const result = await res.json();
    if (res.ok) {
      alert('✅ Mượn thành công');
      setScannedItems([]);
      setForm({ borrowerName: '', returnDueDate: '' });
    } else {
      alert(result.error || 'Lỗi khi mượn');
    }
  };

  return (
    <div className="p-6 space-y-4">
      <h2 className="text-xl font-bold">📦 Quét để mượn vật phẩm</h2>
      <div id="reader" className="w-full max-w-xs mx-auto border rounded overflow-hidden" />

      {error && <p className="text-red-500 text-sm">{error}</p>}

      <div className="space-y-2">
        <input
          className="border p-2 rounded w-full"
          placeholder="Tên người mượn"
          value={form.borrowerName}
          onChange={(e) => setForm({ ...form, borrowerName: e.target.value })}
        />
        <input
          type="date"
          className="border p-2 rounded w-full"
          value={form.returnDueDate}
          onChange={(e) => setForm({ ...form, returnDueDate: e.target.value })}
        />
      </div>

      <ul className="space-y-1 text-sm">
        {scannedItems.map((item) => (
          <li key={item.code}>
            ✅ {item.name} (<code>{item.code}</code>)
          </li>
        ))}
      </ul>

      {scannedItems.length > 0 && (
        <Button className="w-full" onClick={handleSubmit}>
          Gửi yêu cầu mượn ({scannedItems.length} vật phẩm)
        </Button>
      )}
    </div>
  );
}
