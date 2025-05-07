'use client';

import { useState } from 'react';
import { QrReader } from '@blackbox-vision/react-qr-reader';

export default function ScanPage() {
  const [code, setCode] = useState<string | null>(null);
  const [item, setItem] = useState<any>(null);
  const [form, setForm] = useState<any>({});
  const [editing, setEditing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleResult = async (result: any) => {
    const scannedCode = result?.getText?.();
    if (scannedCode && scannedCode !== code) {
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
    }
  };

  const handleUpdate = async () => {
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/item/${item._id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      alert(data.message || 'Đã cập nhật');
      setItem(data.item || item);
      setEditing(false);
    } catch (err) {
      alert('Cập nhật thất bại');
    }
  };

  return (
    <div className="p-6 space-y-6">
      <h2 className="text-2xl font-semibold">Quét mã QR sản phẩm</h2>

      <div className="w-full max-w-xs mx-auto border rounded overflow-hidden">
        <QrReader
          constraints={{ facingMode: 'environment' }}
          onResult={(result, err) => {
            if (result) handleResult(result);
          }}
          containerStyle={{ width: '100%' }}
        />
      </div>

      {code && <p className="text-sm text-muted-foreground">Mã quét: <code>{code}</code></p>}
      {error && <p className="text-red-500">⚠ {error}</p>}

      {item && (
        <div className="bg-white rounded shadow p-4 space-y-3">
          {editing ? (
            <>
              <input
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                placeholder="Tên sản phẩm"
                className="w-full border rounded px-3 py-2"
              />
              <textarea
                value={form.description}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
                placeholder="Mô tả"
                className="w-full border rounded px-3 py-2"
              />
              <input
                value={form.source}
                onChange={(e) => setForm({ ...form, source: e.target.value })}
                placeholder="Nguồn"
                className="w-full border rounded px-3 py-2"
              />
              <input
                value={form.category}
                onChange={(e) => setForm({ ...form, category: e.target.value })}
                placeholder="Loại (thu_vien, qua_tang, vat_pham)"
                className="w-full border rounded px-3 py-2"
              />

              {form.imageUrl && (
                <img
                  src={form.imageUrl}
                  alt={form.name}
                  className="h-32 mt-2 rounded object-contain"
                />
              )}

              <input
                type="file"
                accept="image/*"
                onChange={async (e) => {
                  const file = e.target.files?.[0];
                  if (!file) return;

                  const formData = new FormData();
                  formData.append('image', file);

                  const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/item/${item._id}/upload-image`, {
                    method: 'POST',
                    body: formData,
                  });

                  const data = await res.json();
                  if (data.imageUrl) {
                    setForm({ ...form, imageUrl: data.imageUrl });
                    alert('Đã cập nhật ảnh');
                  } else {
                    alert('Upload ảnh thất bại');
                  }
                }}
                className="mt-2"
              />

              <div className="flex gap-2 mt-4">
                <button
                  onClick={handleUpdate}
                  className="bg-blue-600 text-white px-4 py-2 rounded"
                >
                  Lưu
                </button>
                <button
                  onClick={() => setEditing(false)}
                  className="text-sm underline"
                >
                  Huỷ
                </button>
              </div>
            </>
          ) : (
            <>
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
              <button
                onClick={() => setEditing(true)}
                className="text-sm text-blue-600 underline"
              >
                Chỉnh sửa
              </button>
            </>
          )}
        </div>
      )}
    </div>
  );
}
