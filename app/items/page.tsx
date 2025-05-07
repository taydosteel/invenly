'use client';

import { useEffect, useState } from 'react';

export default function ItemImageUpdater() {
  const [items, setItems] = useState<any[]>([]);

  useEffect(() => {
    fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/item`)
      .then((res) => res.json())
      .then(setItems);
  }, []);

  const handleImageUpdate = async (itemId: string, file: File) => {
    const formData = new FormData();
    formData.append('image', file);

    const uploadRes = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/item/${itemId}/upload-image`, {
      method: 'POST',
      body: formData,
    });

    const data = await uploadRes.json();
    const imageUrl = data.imageUrl;

    // Update DB with new image URL
    await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/item/${itemId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ imageUrl }),
    });

    alert('Đã cập nhật ảnh');
  };

  return (
    <div className="p-6 space-y-4">
      <h2 className="text-xl font-semibold">Danh sách sản phẩm</h2>
      <ul className="space-y-4">
        {items.map((item: any) => (
          <li key={item._id} className="border p-4 rounded shadow space-y-2">
            <p><strong>{item.name}</strong> ({item.code})</p>
            <p><em>{item.description}</em></p>
            {item.imageUrl && (
              <img src={item.imageUrl} alt={item.name} className="h-32 object-cover rounded" />
            )}
            <input
              type="file"
              accept="image/*"
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) handleImageUpdate(item._id, file);
              }}
            />
          </li>
        ))}
      </ul>
    </div>
  );
}
