export default function PanelPage() {
  return (
    <main className="mb-16 mt-14 flex w-full flex-col gap-6 px-4 lg:max-w-[80vw] lg:px-0">
      <h1 className="text-xl">Painel Administrativo</h1>
      <div className="mx-auto -mt-5 h-[1px] w-full max-w-[1440px] bg-[#BFBFBF]" />

      <section className="w-full max-w-7xl lg:pl-10">
        <h2 className="mb-6 mt-6 text-lg font-medium">Bem-vindo ao Sistema de Gestão</h2>
        
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
          <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
            <h3 className="mb-2 text-lg font-semibold text-gray-900">Gestão de Alunos</h3>
            <p className="text-gray-600">Gerir inscrições, dados pessoais e progresso dos alunos.</p>
          </div>
          
          <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
            <h3 className="mb-2 text-lg font-semibold text-gray-900">Aulas e Calendário</h3>
            <p className="text-gray-600">Organizar horários, aulas de condução e código.</p>
          </div>
          
          <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
            <h3 className="mb-2 text-lg font-semibold text-gray-900">Exames</h3>
            <p className="text-gray-600">Acompanhar exames de código e condução.</p>
          </div>
          
          <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
            <h3 className="mb-2 text-lg font-semibold text-gray-900">Alertas</h3>
            <p className="text-gray-600">Criar e gerir alertas e informações importantes.</p>
          </div>
          
          <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
            <h3 className="mb-2 text-lg font-semibold text-gray-900">Utilizadores</h3>
            <p className="text-gray-600">Gerir utilizadores e permissões do sistema.</p>
          </div>
          
          <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
            <h3 className="mb-2 text-lg font-semibold text-gray-900">Agenda dos Instrutores</h3>
            <p className="text-gray-600">Visualizar e organizar a agenda dos instrutores.</p>
          </div>
        </div>
      </section>
    </main>
  )
}
