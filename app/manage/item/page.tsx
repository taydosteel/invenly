'use client';

import { useEffect, useState } from 'react';

export default function ManageItemsPage() {
  const [items, setItems] = useState<any[]>([]);
  const [editingItem, setEditingItem] = useState<any>(null);

  const fetchItems = async () => {
    const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/item`);
    const data = await res.json();
    setItems(data);
  };

  useEffect(() => {
    // Lấy token từ localStorage
    const token = localStorage.getItem('invenly_token');
    if (!token) {
      window.location.href = '/login';
      return;
    }
    
    fetchItems();
  }, []);

  const handleDelete = async (id: string) => {
    if (!confirm('Bạn có chắc muốn xoá?')) return;
    const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/item/${id}`, {
      method: 'DELETE',
    });
    const data = await res.json();
    if (res.ok) {
      alert('🗑️ Đã xoá');
      fetchItems();
    } else {
      alert(data.message || 'Xoá thất bại');
    }
  };

  return (
    <div className="p-6 space-y-6">
      <h2 className="text-3xl font-bold">📦 Quản lý vật phẩm</h2>

      <div className="border border-gray-200 rounded-lg p-4 space-y-4 bg-gray-50">
        <h3 className="text-lg font-semibold">
          {editingItem?._id ? '📝 Chỉnh sửa vật phẩm' : '➕ Thêm vật phẩm mới'}
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <input
            className="border p-2 rounded"
            placeholder="Tên"
            value={editingItem?.name || ''}
            onChange={(e) => setEditingItem({ ...editingItem, name: e.target.value })}
          />
          <input
            className="border p-2 rounded"
            placeholder="Mã"
            disabled={!!editingItem?._id}
            value={editingItem?.code || ''}
            onChange={(e) => setEditingItem({ ...editingItem, code: e.target.value })}
          />
          <select
            className="border p-2 rounded"
            value={editingItem?.category || 'vat_pham'}
            onChange={(e) => setEditingItem({ ...editingItem, category: e.target.value })}
          >
            <option value="thu_vien">Thư viện</option>
            <option value="qua_tang">Quà tặng</option>
            <option value="vat_pham">Vật phẩm</option>
            <option value="khac">Khác</option>
          </select>
          <input
            className="border p-2 rounded"
            placeholder="Nguồn"
            value={editingItem?.source || ''}
            onChange={(e) => setEditingItem({ ...editingItem, source: e.target.value })}
          />
          <input
            className="border p-2 rounded"
            placeholder="Quản lý"
            value={editingItem?.manager || ''}
            onChange={(e) => setEditingItem({ ...editingItem, manager: e.target.value })}
          />
          <input
            className="border p-2 rounded col-span-full"
            placeholder="Mô tả"
            value={editingItem?.description || ''}
            onChange={(e) => setEditingItem({ ...editingItem, description: e.target.value })}
          />
        </div>

        <div className="space-y-2">
          <h4 className="font-semibold text-sm">Thuộc tính</h4>
          {(editingItem?.attributes || []).map((attr: any, idx: number) => (
            <div key={idx} className="flex gap-2">
              <input
                className="border px-2 py-1 rounded w-1/2"
                placeholder="Tên"
                value={attr.key}
                onChange={(e) => {
                  const copy = [...editingItem.attributes];
                  copy[idx].key = e.target.value;
                  setEditingItem({ ...editingItem, attributes: copy });
                }}
              />
              <input
                className="border px-2 py-1 rounded w-1/2"
                placeholder="Giá trị"
                value={attr.value}
                onChange={(e) => {
                  const copy = [...editingItem.attributes];
                  copy[idx].value = e.target.value;
                  setEditingItem({ ...editingItem, attributes: copy });
                }}
              />
            </div>
          ))}
          <button
            className="text-sm text-blue-600 underline"
            onClick={() =>
              setEditingItem({
                ...editingItem,
                attributes: [...(editingItem?.attributes || []), { key: '', value: '' }],
              })
            }
          >
            ➕ Thêm thuộc tính
          </button>
        </div>

        <div className="flex gap-2">
          <button
            onClick={async () => {
              const method = editingItem?._id ? 'PUT' : 'POST';
              const url = editingItem?._id
                ? `${process.env.NEXT_PUBLIC_API_URL}/api/item/${editingItem._id}`
                : `${process.env.NEXT_PUBLIC_API_URL}/api/item`;

              const res = await fetch(url, {
                method,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(editingItem),
              });

              const data = await res.json();
              if (res.ok) {
                alert(editingItem?._id ? '✅ Đã cập nhật' : '✅ Đã thêm mới');
                setEditingItem(null);
                fetchItems();
              } else {
                alert(data.message || 'Lỗi');
              }
            }}
            className="bg-blue-600 text-white px-4 py-2 rounded"
          >
            {editingItem?._id ? '💾 Lưu' : '➕ Thêm'}
          </button>
          {editingItem?._id && (
            <button onClick={() => setEditingItem(null)} className="px-3 py-2 text-sm underline text-gray-600">
              Huỷ
            </button>
          )}
        </div>
      </div>

      <table className="w-full border text-sm">
        <thead className="bg-gray-100">
          <tr>
            <th className="border px-2 py-1">Tên</th>
            <th className="border px-2 py-1">Mã</th>
            <th className="border px-2 py-1">Loại</th>
            <th className="border px-2 py-1">Mô tả</th>
            <th className="border px-2 py-1">Nguồn</th>
            <th className="border px-2 py-1">Quản lý</th>
            <th className="border px-2 py-1">Thuộc tính</th>
            <th className="border px-2 py-1">Thao tác</th>
          </tr>
        </thead>
        <tbody>
          {items.map((item) => (
            <tr key={item._id}>
              <td className="border px-2 py-1">{item.name}</td>
              <td className="border px-2 py-1">{item.code}</td>
              <td className="border px-2 py-1">{item.category}</td>
              <td className="border px-2 py-1">{item.description}</td>
              <td className="border px-2 py-1">{item.source}</td>
              <td className="border px-2 py-1">{item.manager}</td>
              <td className="border px-2 py-1 space-y-1">
                {item.attributes?.map((a: any, idx: number) => (
                  <div key={idx} className="text-xs">
                    <strong>{a.key}:</strong> {a.value}
                  </div>
                ))}
              </td>
              <td className="border px-2 py-1 space-x-2">
                <button className="text-blue-600 text-sm" onClick={() => setEditingItem(item)}>✏️ Sửa</button>
                <button className="text-red-500 text-sm" onClick={() => handleDelete(item._id)}>❌ Xoá</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
