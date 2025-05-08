'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Input } from '@/components/ui/input';
import { BookOpen, Search, BadgeCheck } from 'lucide-react';


export default function BookListPage() {
  const [books, setBooks] = useState<any[]>([]);
  const [filteredBooks, setFilteredBooks] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState('');

  useEffect(() => {
    fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/item`)
      .then(res => res.json())
      .then(data => {
        const filtered = data.filter((item: any) => item.category === 'sach');
        setBooks(filtered);
        setFilteredBooks(filtered);
        setLoading(false);
      });
  }, []);

  const getAttr = (attrs: any[], key: string) => {
    return attrs?.find((a) => a.key?.toLowerCase() === key.toLowerCase())?.value || '—';
  };

  const handleSearch = (text: string) => {
    setQuery(text);
    const lower = text.toLowerCase();
    const results = books.filter((book) =>
      book.name?.toLowerCase().includes(lower) ||
      book.code?.toLowerCase().includes(lower) ||
      getAttr(book.attributes, 'Tác giả')?.toLowerCase().includes(lower) ||
      getAttr(book.attributes, 'Thể loại')?.toLowerCase().includes(lower)
    );
    setFilteredBooks(results);
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
      <div className="flex items-center gap-2">
        <BookOpen className="w-5 h-5" />
        <h2 className="text-3xl font-bold">Thư viện sách</h2>
      </div>

        <Input
          placeholder="🔍 Tìm theo tên, mã, tác giả hoặc thể loại..."
          value={query}
          onChange={(e) => handleSearch(e.target.value)}
          className="max-w-sm"
        />
      </div>

      {loading ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
          {Array.from({ length: 10 }).map((_, i) => (
            <Skeleton key={i} className="h-64 w-full rounded-xl" />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
          {filteredBooks.map((book) => (
            <Card key={book._id} className="hover:shadow-md transition-shadow h-full">
              <CardContent className="p-3 space-y-2 flex flex-col h-full">
                {book.imageUrl && (
                  <div className="aspect-[3/4] w-full overflow-hidden rounded-md">
                    <img
                      src={book.imageUrl}
                      alt={book.name}
                      className="w-full h-full object-cover"
                    />
                  </div>
                )}
                <div className="flex-1 space-y-1">
                  <h3 className="text-sm font-semibold leading-snug line-clamp-2">{book.name}</h3>
                  <p className="text-xs text-muted-foreground line-clamp-2">{book.description}</p>
                  <div className="text-xs mt-1 flex flex-wrap gap-2">
                    <Badge variant="outline" className="text-[10px]">
                      Tác giả: {getAttr(book.attributes, 'Tác giả')}
                    </Badge>
                    <Badge variant="outline" className="text-[10px]">
                      Thể loại: {getAttr(book.attributes, 'Thể loại')}
                    </Badge>
                    <Badge
                      variant={book.isLoaned ? 'destructive' : 'secondary'}
                      className="text-[10px]"
                    >
                      {book.isLoaned ? 'Đang được mượn' : 'Có sẵn'}
                    </Badge>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
          {filteredBooks.length === 0 && (
            <div className="text-center text-gray-500 col-span-full">Không có sách nào phù hợp.</div>
          )}
        </div>
      )}
    </div>
  );
}
