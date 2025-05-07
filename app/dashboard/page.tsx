'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent } from '../../components/ui/card';

interface UserInfo {
  username: string;
  fullname: string;
  roles: string[];
}

export default function DashboardPage() {
  const [user, setUser] = useState<UserInfo | null>(null);

  useEffect(() => {
    // Lấy token từ localStorage
    const token = localStorage.getItem('invenly_token');
    if (!token) {
      window.location.href = '/login';
      return;
    }

    // Giải mã token để lấy thông tin user (nếu bạn không có API riêng)
    const payload = JSON.parse(atob(token.split('.')[1]));
    setUser({
      username: payload.username,
      fullname: payload.fullname || 'Chưa đặt tên',
      roles: payload.roles,
    });
  }, []);

  if (!user) return null;

  return (
    <div className="p-6 max-w-3xl mx-auto">
      <Card>
        <CardContent className="p-6 space-y-2">
          <h1 className="text-2xl font-bold">Xin chào, {user.fullname}</h1>
          <p><strong>Tài khoản:</strong> {user.username}</p>
          <p><strong>Vai trò:</strong> {user.roles.join(', ')}</p>
        </CardContent>
      </Card>
    </div>
  );
}
