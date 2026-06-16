// app/services/licenseApi.ts
const BASE_URL = 'http://192.168.1.XX:3000/api'; // IP вашего компьютера в локальной сети

export async function saveLicense(data: {
  fullName: string;
  birthDate: string;
  docNumber: string;
  category: string;
}) {
  const response = await fetch(`${BASE_URL}/licenses`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  if (!response.ok) throw new Error('Ошибка сохранения');
  return response.json();
}

export async function getLicenses() {
  const response = await fetch(`${BASE_URL}/licenses`);
  if (!response.ok) throw new Error('Ошибка загрузки');
  return response.json();
}