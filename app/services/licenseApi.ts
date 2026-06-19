// app/services/licenseApi.ts
let baseUrl = 'http://localhost:3000/api'; // значение по умолчанию

export function setBaseUrl(ip: string) {
  // Если IP уже содержит http://, не добавляем повторно
  if (ip.startsWith('http://') || ip.startsWith('https://')) {
    baseUrl = `${ip}/api`;
  } else {
    baseUrl = `http://${ip}:3000/api`;
  }
}

export async function saveLicense(data: any) {
  const res = await fetch(`${baseUrl}/licenses`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error('Ошибка сохранения');
  return res.json();
}

export async function getLicenses() {
  const res = await fetch(`${baseUrl}/licenses`);
  if (!res.ok) throw new Error('Ошибка загрузки');
  return res.json();
}