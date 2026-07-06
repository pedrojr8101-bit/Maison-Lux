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
            <li>Sobre a Maison</li>
            <li>Trocas e Devoluções</li>
            <li>Guia de Medidas</li>
          </ul>
        </div>
        <div>
          <h4 className="text-xs uppercase tracking-luxe mb-4">Atendimento</h4>
          <ul className="space-y-2 text-sm">
            <li>contato@maisonlux.com</li>
            <li>Seg a Sex, 9h às 18h</li>
          </ul>
        </div>
      </div>
      <div className="text-center text-xs py-6 border-t border-offwhite/10">
        © {new Date().getFullYear()} Maison Lux. Todos os direitos reservados.
      </div>
    </footer>
  );
}
