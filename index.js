console.log("=== CONQUISTA DE JOGOS === ");

let conquistas = [];

function limparTela(){
    console.clear();
}

async function mostrarMenu () {
    const opcao = await Selection({
        message: "⬇️ Escolha uma opção ⬇️",
        choices: [
            {name: "📝 Adicionar jogo novo.", value: "novo"},
            { name: "❌ Sair", value: "sair" }
        ]
    });
    return opcao;
}

async function executarEscolha(opcao){

    switch (opcao) {
        case "novo":
            await adicionarJogo();
            break;
        case "sair":
            break;
        default:
            console.log("Opção inválida!");
    }

}

async function inciar(){
    limparTela();
    monstrarMensagem("=== SISTEMA DE CONQUISTA DE JOGOS ===")

    while (true) {
        const opcao = await mostrarMenu();

    if (opcao === "sair"){
        await executarEscolha(opcao);
        limparTela();
        monstrarMensagem("Até mais! 👋");
        break;
        }
        await executarEscolha(opcao);
        await salvarMetas();
    }
}

