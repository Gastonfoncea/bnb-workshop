import type { Metadata } from "next";
import { SlideDeck } from "@/components/slide-deck";

export const metadata: Metadata = {
  title: "Qué vamos a hacer — BNB Chain Workshop",
  description:
    "Las slides del workshop: cómo se usa la skill, qué queda afuera y por qué, y cómo seguir una vez que tenés el agente armado.",
};

export default function SlidesPage() {
  return <SlideDeck />;
}
