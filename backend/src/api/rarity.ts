export async function fetchRarity(cid: string): Promise<number> {
  const res = await fetch("http://192.168.1.5:8000/rarity:8000/rarity", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ cid }),
  });

  const data = await res.json();
  return data.rarity;
}