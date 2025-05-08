'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Input } from '@/components/ui/input';
import { BookOpen, Search, BadgeCheck } from 'lucide-react';
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';


export default function BookListPage() {
  const [books, setBooks] = useState<any[]>([]);
  const [filteredBooks, setFilteredBooks] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState('');

  
  const [selectedBook, setSelectedBook] = useState<any | null>(null);
  const [borrowForm, setBorrowForm] = useState({ name: '', email: '', phone:'', note: '' });

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

  const fallbackImages = [
    '/images/book/sample1.jpg',
    '/images/book/sample2.jpg',
    '/images/book/sample3.jpg',
    '/images/book/sample4.jpg',
    '/images/book/sample5.jpg',
    '/images/book/sample6.jpg',
    '/images/book/sample7.jpg',
    '/images/book/sample8.jpg',
    '/images/book/sample9.jpg',
    '/images/book/sample10.jpg',
    '/images/book/sample11.jpg',
    '/images/book/sample12.jpg',
    '/images/book/sample13.jpg'
  ];
  
  const getRandomFallbackImage = () => {
    return fallbackImages[Math.floor(Math.random() * fallbackImages.length)];
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
              <div className="aspect-[3/4] w-full overflow-hidden rounded-md">
                    <img
                      src={book.imageUrl || getRandomFallbackImage()}
                      alt={book.name}
                      className="w-full h-full object-cover"
                    />
                  </div>
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
                    <Button
                      size="sm"
                      variant="outline"
                      className="w-full mt-2"
                      onClick={() => {
                        setSelectedBook(book);
                        setBorrowForm({ name: '', email: '',phone:'', note: '' });
                      }}
                    >
                      📖 Mượn sách
                    </Button>

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

      <Dialog open={!!selectedBook} onOpenChange={(open) => !open && setSelectedBook(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Mượn sách: {selectedBook?.name}</DialogTitle>
            <DialogDescription>Nhập thông tin để gửi yêu cầu</DialogDescription>
          </DialogHeader>

          <input
            placeholder="Họ tên"
            className="border w-full px-2 py-1 rounded text-sm"
            value={borrowForm.name}
            onChange={(e) => setBorrowForm({ ...borrowForm, name: e.target.value })}
          />
          <input
            placeholder="Email"
            className="border w-full px-2 py-1 rounded text-sm"
            value={borrowForm.email}
            onChange={(e) => setBorrowForm({ ...borrowForm, email: e.target.value })}
          />
          <input
            placeholder="Số điện thoại hoặc Zalo"
            className="border w-full px-2 py-1 rounded text-sm"
            value={borrowForm.phone}
            onChange={(e) => setBorrowForm({ ...borrowForm, phone: e.target.value })}
          />
          <textarea
            placeholder="Ghi chú"
            className="border w-full px-2 py-1 rounded text-sm"
            value={borrowForm.note}
            onChange={(e) => setBorrowForm({ ...borrowForm, note: e.target.value })}
          />

          <Button
            className="w-full mt-2"
            onClick={async () => {
              const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/borrow-request`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ ...borrowForm, itemId: selectedBook._id }),
              });
              const result = await res.json();
              if (res.ok) {
                alert('📚 Đã gửi yêu cầu mượn');
                setSelectedBook(null);
              } else {
                alert(result.message || 'Lỗi khi gửi yêu cầu');
              }
            }}
          >
            ✅ Gửi yêu cầu
          </Button>
        </DialogContent>
      </Dialog>

    </div>
  );
}
