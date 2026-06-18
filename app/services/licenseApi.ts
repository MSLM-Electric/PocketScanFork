// app/services/licenseApi.ts
const BASE_URL = 'http://10.161.35.189:3000/api'; // IP вашего компьютера в локальной сети

export async function saveLicense(data: {
  full_name: string;
  birth_date: string;
  doc_number: string;
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