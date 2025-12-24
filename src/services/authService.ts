export async function loginAdmin(email: string, password: string) {
  const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/admin/login`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    credentials: "include",
    body: JSON.stringify({ email, password }),
  });

  return await res.json();
}
