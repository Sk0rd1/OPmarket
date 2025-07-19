import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function getRarityColor(rarity: string) {
  const rarityColors: Record<string, string> = {
    C: "bg-gray-500 text-white",
    UC: "bg-green-600 text-white",
    R: "bg-blue-600 text-white",
    SR: "bg-purple-600 text-white",
    SEC: "bg-red-600 text-white",
    L: "bg-yellow-600 text-black",
    P: "bg-pink-600 text-white",
  }
  return rarityColors[rarity] || "bg-gray-400 text-white"
}
