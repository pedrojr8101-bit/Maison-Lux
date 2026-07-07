const sizeChart = [
  { size: "PP", bust: "80-84", waist: "60-64", hip: "88-92" },
  { size: "P", bust: "85-89", waist: "65-69", hip: "93-97" },
  { size: "M", bust: "90-94", waist: "70-74", hip: "98-102" },
  { size: "G", bust: "95-99", waist: "75-79", hip: "103-107" },
  { size: "GG", bust: "100-104", waist: "80-84", hip: "108-112" },
];

export default function GuiaDeMedidasPage() {
  return (
    <main className="max-w-3xl mx-auto px-6 py-16">
      <h1 className="section-title mb-8">Guia de Medidas</h1>
      <p className="text-charcoal/80 mb-8">
        Todas as medidas estão em centímetros. Para melhores resultados, meça-se com uma
        fita métrica flexível, sem apertar, sobre uma roupa fina.
      </p>

      <div className="overflow-x-auto">
        <table className="w-full text-sm border border-beige">
          <thead className="bg-sand text-left uppercase tracking-luxe text-xs">
            <tr>
              <th className="p-4">Tamanho</th>
              <th className="p-4">Busto (cm)</th>
              <th className="p-4">Cintura (cm)</th>
              <th className="p-4">Quadril (cm)</th>
            </tr>
          </thead>
          <tbody>
            {sizeChart.map((row) => (
              <tr key={row.size} className="border-t border-beige">
                <td className="p-4 font-medium">{row.size}</td>
                <td className="p-4">{row.bust}</td>
                <td className="p-4">{row.waist}</td>
                <td className="p-4">{row.hip}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="mt-10 space-y-3 text-sm text-charcoal/70">
        <p><strong>Busto:</strong> meça na parte mais larga do busto, mantendo a fita reta.</p>
        <p><strong>Cintura:</strong> meça na parte mais fina do tronco, geralmente acima do umbigo.</p>
        <p><strong>Quadril:</strong> meça na parte mais larga do quadril/glúteo.</p>
      </div>
    </main>
  );
}