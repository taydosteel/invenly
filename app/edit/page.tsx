'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';

export default function BookListPage() {
  const [books, setBooks] = useState<any[]>([]);

  useEffect(() => {
    fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/item`)
      .then(res => res.json())
      .then(data => {
        const filtered = data.filter((item: any) => item.category === 'thu_vien');
        setBooks(data);
      });
  }, []);

  const getAttribute = (attrs: any[], key: string) => {
    return attrs?.find(a => a.key.toLowerCase() === key.toLowerCase())?.value || '-';
  };

  return (
    <div className="p-6 space-y-6">
      <h2 className="text-2xl font-bold">📚 Danh sách sách trong thư viện</h2>

      <div className="overflow-x-auto">
        <table className="min-w-full border text-sm">
          <thead>
            <tr className="bg-gray-100">
              <th className="px-4 py-2 border">Tên</th>
              <th className="px-4 py-2 border">Tác giả</th>
              <th className="px-4 py-2 border">Thể loại</th>
              <th className="px-4 py-2 border">Mô tả</th>
              <th className="px-4 py-2 border">QR</th>
              <th className="px-4 py-2 border">Chỉnh sửa</th>
            </tr>
          </thead>
          <tbody>
            {books.map(book => (
              <tr key={book._id} className="hover:bg-gray-50">
                <td className="px-4 py-2 border font-medium">{book.name}</td>
                <td className="px-4 py-2 border">{getAttribute(book.attributes, 'Tác giả')}</td>
                <td className="px-4 py-2 border">{getAttribute(book.attributes, 'Thể loại')}</td>
                <td className="px-4 py-2 border">{book.description}</td>
                <td className="px-4 py-2 border text-xs text-gray-500">
                  <code>{book.code}</code>
                </td>
                <td className="px-4 py-2 border">
                  <Link href={`/scan?code=${book.code}`}>
                    <button className="text-blue-600 underline text-sm">Chỉnh sửa</button>
                  </Link>
                </td>
              </tr>
            ))}
            {books.length === 0 && (
              <tr>
                <td colSpan={6} className="text-center py-4 text-gray-500">
                  Không có sách nào được tìm thấy
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
