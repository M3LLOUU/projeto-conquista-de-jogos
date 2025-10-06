const { input, select, checkbox } = require('@inquirer/prompts');
const {randomUUID} = require ('node:crypto');
const fs = require ('fs').promises;


console.log("=== CONQUISTA DE JOGOS === ");

const desbloqueada = true;

const minPontos = 10;
const maxPontos = 100;

let conquistas = [];

function limparTela(){
    console.clear();
}

function mostrarMensagem(mensagem) {
    console.log(`\n${mensagem}\n`);
}

async function mostrarMenu () {
    const opcao = await select({
        message: "⬇️  Escolha uma opção ⬇️",
        choices: [
        {name: "📝 Adicionar jogo novo.", value: "novo"},
        {name: "📝 Adicionar conquista.", value: "conquista"},
        {name: "📝 Detalhes por jogo.", value: "visualizar"},
        {name: "❌ Sair", value: "sair"}
        ]
    });
    return opcao;
}

async function executarEscolha(opcao){
    switch (opcao) {
        case "novo":
            await adicionarJogo();
            break;
        case "conquista":
            await adicionarConquistas();
            break;
        case "visualizar":
            await visualizarConquistasPorJogo();
        break;
        case "sair":
            break;
        default:
        console.log("Opção inválida!");
    }
}

async function adicionarJogo() {
    const jogo = await input({message: "📝 Cadastrar jogo:"});

    if (jogo.length === 0) {
     mostrarMensagem("❌ Jogo inválido. Tente novamente.");
    return;
    }

    // erro no retorno da const plataforma 

    const plataforma = await input({message: "📝 Digite a plataforma (PC / XBOX / PS5):"});

    if (plataforma != "PC" && plataforma != "XBOX" && plataforma != "PS5") {
     mostrarMensagem("❌ Plataforma inválida. Tente novamente.");
    return;
    }

    // erro no retorno da const plataforma
    conquistas.push({id: randomUUID(), valueJogo: jogo, valorPlataforma: plataforma});
    mostrarMensagem("✔️  Jogo adicionado com sucesso!");
    }

async function adicionarConquistas() {
    const titulo = await input ({message: "Titulo da conquista:"});
    if (titulo.length === 0) {
     mostrarMensagem("❌ Titulo inválido. Tente novamente.");
    return;
    }
    const descricao = await input ({message: "Descrição da conquista:"});
    if (descricao.length === 0) {
     mostrarMensagem("❌ Titulo inválido. Tente novamente.");
    return;
    }
    const dificuldade = await input ({message: "Dificuldade (fácil, média, dificil):"});
    if (dificuldade != "facil" && dificuldade != "media" && dificuldade != "dificil") {
        mostrarMensagem("❌ Titulo inválido. Tente novamente.");
    return;
    }
    const desbloqueada = ({message:"Desbloqueada!"});
    const dataDesbloqueio = console.log ("Data do desbloqueio:", new Date());

    /* 
        math.floor: Arredonda para baixo para manter um número inteiro.
        math.random retorna número aleatório.
    */
    const pontos = Math.floor(Math.random() * (maxPontos - minPontos + 1)) + minPontos;
    /*
        const pontos precisa do calculo matematico para poder retornar o número aleatório,
        caso não seja feito ele apenas retorna indefinido
    */
    console.log(pontos, "Pts");

    conquistas.push({id: randomUUID(), valueTitulo: titulo, valueDescricao: descricao, valueDificuldade: dificuldade, valueDesbloqueado: desbloqueada, valueDataDesbloqueio: dataDesbloqueio, valuePontos: pontos});
    mostrarMensagem("✔️  conquista adicionado com sucesso!");
}

async function inciar(){
    limparTela();
    mostrarMensagem("=== SISTEMA DE CONQUISTA DE JOGOS ===")

    while (true) {
    const opcao = await mostrarMenu();

    if (opcao === "sair"){
        await executarEscolha(opcao);
        limparTela();
        mostrarMensagem("Até mais! 👋");
        break;
        }
    await executarEscolha(opcao);
    }
}

async function visualizarConquistasPorJogo() {
     // 1. Pede o nome do jogo ao usuário
     const nomeJogo = await input({ message: "Digite o jogo que deseja visualizar:" });

    if (!nomeJogo) {
        mostrarMensagem("❌ Nome do jogo não pode ser vazio.");
        return;
    }

    // 2. Filtra o array de conquistas
    // (Assumindo que 'conquistas' é o seu array global de todas as conquistas)
    const conquistasFiltradas = conquistas.filter(conquista => 
    // Filtra por jogos que têm o nome exato (idealmente, use toUpperCase/toLowerCase para ser flexível)
    conquista.valueJogo.toLowerCase() === nomeJogo.toLowerCase()
    );

    if (conquistasFiltradas.length === 0) {
        mostrarMensagem(`⚠️ Nenhum jogo encontrado com o nome: ${nomeJogo}.`);
        return;
    }

    // Pega os dados gerais (Jogo e Plataforma) da primeira conquista filtrada
    const jogoInfo = conquistasFiltradas[0];
    const nomeExibido = jogoInfo.valueJogo;
    const plataformaExibida = jogoInfo.valorPlataforma;

    let mensagem = `\n✅ Jogo: ${nomeExibido}\n`;
    mensagem += `🎮 Plataforma: ${plataformaExibida}\n`;
    mensagem += `Total de Conquistas: ${conquistasFiltradas.length}\n`;
    mensagem += "--- Detalhes das Conquistas ---\n";

    // 4. Itera sobre as conquistas filtradas para listar os detalhes
    conquistasFiltradas.forEach((conquista, index) => {
    // Formata o status de desbloqueio
    const status = conquista.desbloqueada ? "✔️ DESBLOQUEADA" : "❌ BLOQUEADA";
 
    mensagem += `\n${index + 1}. Título: ${conquista.titulo}\n`;
    mensagem += `Descrição: ${conquista.descricao || 'N/A'}\n`;
    mensagem += `Pontos: ${conquista.pontos || 0} Pts\n`;
    mensagem += `Status: ${status}\n`;

    if (conquista.desbloqueada && conquista.dataDesbloqueio) {
    // Você pode formatar a data como preferir
    mensagem += ` Data Desbloqueio: ${new Date(conquista.dataDesbloqueio).toLocaleDateString('pt-BR')}\n`;
    }
});
// Exibe a mensagem final com todos os detalhes
mostrarMensagem(mensagem);
}
inciar();