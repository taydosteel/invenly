'use client';

import { useEffect, useRef, useState } from 'react';
import { Button } from '@/components/ui/button';

export default function LoanScanPage() {
  const scannerRef = useRef<any>(null);
  const scannedRef = useRef(false);

  const [scannedItems, setScannedItems] = useState<any[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [borrowerName, setBorrowerName] = useState('');
  const [borrowerImageFile, setBorrowerImageFile] = useState<File | null>(null);
  const [borrowerImageUrl, setBorrowerImageUrl] = useState<string>('');
  const [loading, setLoading] = useState(false);

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
        setScannedItems((prev) => [
          ...prev,
          {
            ...data,
            returnDueDate: '',
            damaged: false,
            damageNote: '',
          },
        ]);
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
        scannerRef.current.stop().then(() => scannerRef.current.clear());
      }
    };
  }, []);

  const handleUploadImage = async () => {
    if (!borrowerImageFile) return '';
    const formData = new FormData();
    formData.append('file', borrowerImageFile);

    const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/upload`, {
      method: 'POST',
      body: formData,
    });

    const result = await res.json();
    return result.url; // đảm bảo backend trả { url: '...' }
  };

  const handleSubmit = async () => {
    if (!borrowerName) {
      alert('⚠️ Vui lòng nhập tên người mượn');
      return;
    }

    const invalidDate = scannedItems.some((i) => !i.returnDueDate);
    if (invalidDate) {
      alert('⚠️ Vui lòng nhập ngày trả cho tất cả vật phẩm');
      return;
    }

    setLoading(true);
    try {
      const imageUrl = await handleUploadImage();

      const payload = {
        borrowerName,
        items: scannedItems.map((i) => ({
          code: i.code,
          returnDueDate: i.returnDueDate,
          damaged: i.damaged,
          damageNote: i.damageNote,
          borrowerImageUrl: imageUrl,
        })),
      };

      const token = localStorage.getItem('accessToken');

      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/loan/batch`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-access-token': token || '',
        },
        body: JSON.stringify(payload),
      });

      const result = await res.json();

      if (res.ok) {
        alert(`✅ Mượn thành công (${result.success})\n❌ Thất bại: ${result.failed.join(', ')}`);
        setScannedItems([]);
        setBorrowerName('');
        setBorrowerImageFile(null);
        setBorrowerImageUrl('');
      } else if (res.status === 401) {
        alert('Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.');
        localStorage.setItem('pendingRequest', JSON.stringify(payload));
        window.location.href = '/login';
      } else {
        alert(result.error || 'Lỗi khi mượn');
      }
    } catch (err) {
      alert('Lỗi hệ thống khi gửi yêu cầu');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6 space-y-4">
      <h2 className="text-xl font-bold">📦 Quét để mượn vật phẩm</h2>
      <div id="reader" className="w-full max-w-xs mx-auto border rounded overflow-hidden" />

      {error && <p className="text-red-500 text-sm">{error}</p>}

      <input
        className="border p-2 rounded w-full"
        placeholder="Tên người mượn"
        value={borrowerName}
        onChange={(e) => setBorrowerName(e.target.value)}
      />

      <div className="space-y-2">
        <label className="block text-sm font-medium">Ảnh người mượn</label>
        <input
          type="file"
          accept="image/*"
          onChange={(e) => {
            if (e.target.files?.[0]) {
              setBorrowerImageFile(e.target.files[0]);
            }
          }}
        />
      </div>

      {scannedItems.map((item, index) => (
        <div key={item.code} className="border p-3 rounded space-y-2">
          <div className="flex items-center space-x-3">
            <img src={item.imageUrl} className="w-12 h-12 rounded object-cover" />
            <div>
              <p className="font-medium">{item.name}</p>
              <p className="text-xs text-gray-600">{item.code}</p>
            </div>
          </div>

          <input
            type="date"
            value={item.returnDueDate}
            onChange={(e) => {
              const newItems = [...scannedItems];
              newItems[index].returnDueDate = e.target.value;
              setScannedItems(newItems);
            }}
            className="border rounded p-2 w-full"
          />

          <label className="flex items-center space-x-2 text-sm">
            <input
              type="checkbox"
              checked={item.damaged}
              onChange={(e) => {
                const newItems = [...scannedItems];
                newItems[index].damaged = e.target.checked;
                setScannedItems(newItems);
              }}
            />
            <span>Vật phẩm bị hư?</span>
          </label>

          {item.damaged && (
            <textarea
              placeholder="Mô tả hư hỏng"
              value={item.damageNote}
              onChange={(e) => {
                const newItems = [...scannedItems];
                newItems[index].damageNote = e.target.value;
                setScannedItems(newItems);
              }}
              className="border rounded p-2 w-full"
              rows={2}
            />
          )}
        </div>
      ))}

      {scannedItems.length > 0 && (
        <Button className="w-full" onClick={handleSubmit} disabled={loading}>
          {loading ? 'Đang gửi...' : `Gửi yêu cầu mượn (${scannedItems.length} vật phẩm)`}
        </Button>
      )}
    </div>
  );
}
