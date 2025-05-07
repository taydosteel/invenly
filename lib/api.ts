const API_URL = process.env.NEXT_PUBLIC_API_URL;

export async function login(username: string, password: string) {
  try {
    console.log(API_URL)
    const res = await fetch(`${API_URL}/api/auth/signin`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, password }),
    });

    return await res.json();
  } catch (err) {
    console.error('Login error:', err);
    return { message: 'Lỗi kết nối tới server' };
  }
}
