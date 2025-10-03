const { input, select, checkbox } = require('@inquirer/prompts');
const {randomUUID} = require ('node:crypto');
const fs = require ('fs').promises;


console.log("=== CONQUISTA DE JOGOS === ");

let str1 = "PC";
let str2 = "pc";
let str3 = "XBOX";
let str4 = "xbox";
let str5 = "PS5"
let str6 = "ps5"


let conquistas = [];

function limparTela(){
    console.clear();
}

function mostrarMensagem(mensagem) {
    console.log(`\n${mensagem}\n`);
}

async function mostrarMenu () {
    const opcao = await select({
        message: "⬇️  Escolha uma opção ⬇️",
        choices: [
            {name: "📝 Adicionar jogo novo.", value: "novo"},
            {name: "📝 Adicionar conquista.", value: "conquista"},
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

    if (plataforma !== str1, str2, str3, str4, str5, str6 ) {
        mostrarMensagem("❌ Plataforma inválida. Tente novamente.");
        return;
    }

    // erro no retorno da const plataforma
     
    conquistas.push({id: randomUUID(), valueJogo: jogo, valorPlataforma: plataforma});
    mostrarMensagem("✔️  Jogo adicionado com sucesso!");
    }

async function adicionarConquistas() {
    const titulo = await input ({message: "Titulo da conquista: "});
    const descricao = await input ({message: "Descrição da conquista: "});
    const dificuldade = await input ({message: "Dificuldade: (fácil, média, dificil)"}); // fácil, média, difícil
    const desbloqueada = await input ({message: false});
    const dataDesbloqueio = await input ({message: null});
    const pontos = await input ({message: 50});

    conquistas.push({id: randomUUID(), valueTitulo: titulo, valueDescricao: descricao, valueDificuldade: dificuldade, valueDesbloqueado: desbloqueada, valueDataDesbloqueio: dataDesbloqueio, valuePontos: pontos});
    mostrarMensagem("✔️  conquista adicionado com sucesso!");
    
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
inciar();



