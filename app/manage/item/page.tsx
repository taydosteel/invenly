'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';

export default function ManageItemsPage() {
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [newItem, setNewItem] = useState({
    name: '',
    code: '',
    category: 'vat_pham',
    description: '',
    manager: '',
    source: '',
    attributes: [] as { key: string; value: string }[],
  });
  const [editIndex, setEditIndex] = useState<number | null>(null);
  const [editItem, setEditItem] = useState<any>(null);

  const fetchItems = async () => {
    const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/item`);
    const data = await res.json();
    setItems(data);
  };

  useEffect(() => {
    fetchItems();
  }, []);

  const handleCreate = async () => {
    const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/item`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(newItem),
    });
    const data = await res.json();
    if (res.ok) {
      alert('✅ Đã thêm vật phẩm');
      setNewItem({ name: '', code: '', category: 'vat_pham', description: '', manager: '', source: '', attributes: [] });
      fetchItems();
    } else {
      alert(data.message || 'Lỗi khi thêm');
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Bạn có chắc muốn xoá?')) return;
    const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/item/${id}`, { method: 'DELETE' });
    const data = await res.json();
    if (res.ok) {
      alert('🗑️ Đã xoá');
      fetchItems();
    } else {
      alert(data.message || 'Xoá thất bại');
    }
  };

  const handleUpdate = async () => {
    if (!editItem) return;
    const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/item/${editItem._id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(editItem),
    });
    const data = await res.json();
    if (res.ok) {
      alert('✅ Đã cập nhật');
      setEditIndex(null);
      setEditItem(null);
      fetchItems();
    } else {
      alert(data.message || 'Cập nhật thất bại');
    }
  };

  return (
    <div className="p-6 space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">📦 Quản lý vật phẩm</h2>
        <Link href="/import">
          <button className="bg-blue-600 text-white px-4 py-2 rounded text-sm">📥 Nhập từ Excel</button>
        </Link>
      </div>

      <div className="overflow-x-auto">
        <table className="min-w-full border text-sm">
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
            <tr className="bg-yellow-50">
              <td className="border px-2 py-1">
                <input className="w-full border rounded px-1" value={newItem.name} onChange={(e) => setNewItem({ ...newItem, name: e.target.value })} />
              </td>
              <td className="border px-2 py-1">
                <input className="w-full border rounded px-1" value={newItem.code} onChange={(e) => setNewItem({ ...newItem, code: e.target.value })} />
              </td>
              <td className="border px-2 py-1">
                <select className="w-full border rounded px-1" value={newItem.category} onChange={(e) => setNewItem({ ...newItem, category: e.target.value })}>
                  <option value="thu_vien">Thư viện</option>
                  <option value="qua_tang">Quà tặng</option>
                  <option value="vat_pham">Vật phẩm</option>
                  <option value="khac">Khác</option>
                </select>
              </td>
              <td className="border px-2 py-1">
                <input className="w-full border rounded px-1" value={newItem.description} onChange={(e) => setNewItem({ ...newItem, description: e.target.value })} />
              </td>
              <td className="border px-2 py-1">
                <input className="w-full border rounded px-1" value={newItem.source} onChange={(e) => setNewItem({ ...newItem, source: e.target.value })} />
              </td>
              <td className="border px-2 py-1">
                <input className="w-full border rounded px-1" value={newItem.manager} onChange={(e) => setNewItem({ ...newItem, manager: e.target.value })} />
              </td>
              <td className="border px-2 py-1 space-y-1">
                {newItem.attributes.map((attr, idx) => (
                  <div key={idx} className="flex gap-1">
                    <input className="border px-1 rounded w-1/2" placeholder="Tên" value={attr.key} onChange={(e) => { const copy = [...newItem.attributes]; copy[idx].key = e.target.value; setNewItem({ ...newItem, attributes: copy }); }} />
                    <input className="border px-1 rounded w-1/2" placeholder="Giá trị" value={attr.value} onChange={(e) => { const copy = [...newItem.attributes]; copy[idx].value = e.target.value; setNewItem({ ...newItem, attributes: copy }); }} />
                  </div>
                ))}
                <button className="text-xs text-blue-600 underline" onClick={() => setNewItem({ ...newItem, attributes: [...newItem.attributes, { key: '', value: '' }] })}>➕ Thêm thuộc tính</button>
              </td>
              <td className="border px-2 py-1">
                <button className="bg-green-600 text-white px-3 py-1 rounded text-sm" onClick={handleCreate}>➕ Thêm</button>
              </td>
            </tr>

            {items.map((item, index) => (
              <tr key={item._id} className={editIndex === index ? 'bg-blue-50' : ''}>
                {editIndex === index ? (
                  <>
                    <td className="border px-2 py-1">
                      <input className="w-full border rounded px-1" value={editItem.name} onChange={(e) => setEditItem({ ...editItem, name: e.target.value })} />
                    </td>
                    <td className="border px-2 py-1">{editItem.code}</td>
                    <td className="border px-2 py-1">
                      <select className="w-full border rounded px-1" value={editItem.category} onChange={(e) => setEditItem({ ...editItem, category: e.target.value })}>
                        <option value="thu_vien">Thư viện</option>
                        <option value="qua_tang">Quà tặng</option>
                        <option value="vat_pham">Vật phẩm</option>
                        <option value="khac">Khác</option>
                      </select>
                    </td>
                    <td className="border px-2 py-1">
                      <input className="w-full border rounded px-1" value={editItem.description} onChange={(e) => setEditItem({ ...editItem, description: e.target.value })} />
                    </td>
                    <td className="border px-2 py-1">
                      <input className="w-full border rounded px-1" value={editItem.source} onChange={(e) => setEditItem({ ...editItem, source: e.target.value })} />
                    </td>
                    <td className="border px-2 py-1">
                      <input className="w-full border rounded px-1" value={editItem.manager} onChange={(e) => setEditItem({ ...editItem, manager: e.target.value })} />
                    </td>
                    <td className="border px-2 py-1 space-y-1">
                      {editItem.attributes?.map((attr: any, idx: number) => (
                        <div key={idx} className="flex gap-1">
                          <input className="border px-1 rounded w-1/2" value={attr.key} onChange={(e) => { const copy = [...editItem.attributes]; copy[idx].key = e.target.value; setEditItem({ ...editItem, attributes: copy }); }} />
                          <input className="border px-1 rounded w-1/2" value={attr.value} onChange={(e) => { const copy = [...editItem.attributes]; copy[idx].value = e.target.value; setEditItem({ ...editItem, attributes: copy }); }} />
                        </div>
                      ))}
                      <button className="text-xs text-blue-600 underline" onClick={() => setEditItem({ ...editItem, attributes: [...editItem.attributes, { key: '', value: '' }] })}>➕</button>
                    </td>
                    <td className="border px-2 py-1 space-x-1">
                      <button className="text-sm text-green-700 underline" onClick={handleUpdate}>💾</button>
                      <button className="text-sm text-gray-500 underline" onClick={() => setEditIndex(null)}>Huỷ</button>
                    </td>
                  </>
                ) : (
                  <>
                    <td className="border px-2 py-1">{item.name}</td>
                    <td className="border px-2 py-1">{item.code}</td>
                    <td className="border px-2 py-1">{item.category}</td>
                    <td className="border px-2 py-1">{item.description}</td>
                    <td className="border px-2 py-1">{item.source}</td>
                    <td className="border px-2 py-1">{item.manager}</td>
                    <td className="border px-2 py-1">
                      {item.attributes?.map((a: any, idx: number) => (
                        <div key={idx} className="text-xs">
                          <strong>{a.key}:</strong> {a.value}
                        </div>
                      ))}
                    </td>
                    <td className="border px-2 py-1 space-x-2">
                      <button className="text-blue-600 text-sm" onClick={() => { setEditIndex(index); setEditItem(item); }}>✏️ Sửa</button>
                      <button className="text-red-500 text-sm" onClick={() => handleDelete(item._id)}>❌ Xoá</button>
                    </td>
                  </>
                )}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
