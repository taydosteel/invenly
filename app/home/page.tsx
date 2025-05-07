'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';

export default function BookListPage() {
  const [books, setBooks] = useState<any[]>([]);

  useEffect(() => {
    fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/item`)
      .then(res => res.json())
      .then(data => {
        const filtered = data.filter((item: any) => item.category === 'sach');
        setBooks(filtered);
      });
  }, []);

  const getAttr = (attrs: any[], key: string) => {
    return attrs?.find((a) => a.key?.toLowerCase() === key.toLowerCase())?.value || '—';
  };

  return (
    <div className="p-6 space-y-6">
      <h2 className="text-3xl font-bold">📚 Thư viện sách</h2>
      <p className="text-muted-foreground">Danh sách tất cả sách hiện có trong hệ thống.</p>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
        {books.map((book) => (
          <div
            key={book._id}
            className="border rounded-xl p-4 shadow hover:shadow-md transition space-y-2 bg-white"
          >
            {book.imageUrl && (
              <img
                src={book.imageUrl}
                alt={book.name}
                className="w-full h-40 object-cover rounded"
              />
            )}
            <h3 className="text-xl font-semibold">{book.name}</h3>
            <p className="text-sm text-muted-foreground">{book.description}</p>
            <div className="text-sm">
              <p><strong>📖 Tác giả:</strong> {getAttr(book.attributes, 'Tác giả')}</p>
              <p><strong>📚 Thể loại:</strong> {getAttr(book.attributes, 'Thể loại')}</p>
              {/* <p><strong>🔖 Mã:</strong> <code>{book.code}</code></p> */}
            </div>
          </div>
        ))}
        {books.length === 0 && (
          <div className="text-center text-gray-500 col-span-full">Không có sách nào được tìm thấy.</div>
        )}
      </div>
    </div>
  );
}
