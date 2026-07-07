import Link from "next/link";

export function Footer() {
  return (
    <footer className="bg-brown text-offwhite/80 mt-24">
      <div className="max-w-content mx-auto px-6 py-16 grid grid-cols-1 md:grid-cols-3 gap-10">
        <div>
          <h3 className="font-serif text-xl text-offwhite mb-4">MAISON LUX</h3>
          <p className="text-sm leading-relaxed">
            Moda feminina com materiais nobres e caimento impecável.
          </p>
        </div>
        <div>
          <h4 className="text-xs uppercase tracking-luxe mb-4">Institucional</h4>
          <ul className="space-y-2 text-sm">
            <li>
              <Link href="/sobre" className="hover:text-gold">
                Sobre a Maison
              </Link>
            </li>
            <li>
              <Link href="/trocas-e-devolucoes" className="hover:text-gold">
                Trocas e Devoluções
              </Link>
            </li>
            <li>
              <Link href="/guia-de-medidas" className="hover:text-gold">
                Guia de Medidas