const { input, select, checkbox } = require('@inquirer/prompts');
const {randomUUID} = require ('node:crypto');
const fs = require ('fs').promises;


console.log("=== CONQUISTA DE JOGOS === ");

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
    const plataformaUpper = plataforma.toUpperCase().trim(); // Converte para maiúsculas e remove espaços

    if (plataformaUpper != "PC" && plataformaUpper != "XBOX" && plataformaUpper != "PS5") {
     mostrarMensagem("❌ Plataforma inválida. Tente novamente.");
    return;
    }

    // erro no retorno da const plataforma
    conquistas.push({id: randomUUID(), valueJogo: jogo, valorPlataforma: plataforma});
    mostrarMensagem("✔️  Jogo adicionado com sucesso!");
    }

async function adicionarConquistas() {
    // 1. EXTRAIR JOGOS ÚNICOS PARA SELEÇÃO
    const jogoUnico = new Map(); 

    // Itera sobre o array e coleta todas as entradas que parecem ser um registro de jogo.
    conquistas.forEach(c => {
        // Usa as chaves que você definiu: valueJogo e valorPlataforma
        if (c.valueJogo && c.valorPlataforma) {
            // Cria uma chave única (ex: "ELDEN RING-PS5") para evitar duplicatas
            const key = `${c.valueJogo.toUpperCase().trim()}-${c.valorPlataforma.toUpperCase().trim()}`;
            if (!jogoUnico.has(key)) {
                jogoUnico.set(key, { jogo: c.valueJogo, plataforma: c.valorPlataforma });
            }
        }
    });

    // 2. VERIFICAÇÃO: Se não houver jogos cadastrados
    if (jogoUnico.size === 0) {
        mostrarMensagem("❌ Nenhum jogo cadastrado. Por favor, adicione um jogo primeiro (Opção 'Adicionar jogo novo').");
        return;
    }

    // 3. PREPARAÇÃO E EXIBIÇÃO DO MENU DE SELEÇÃO
    const choices = Array.from(jogoUnico.values()).map(item => ({
        // Nome a ser exibido no menu (Ex: "Elden Ring (PS5)")
        name: `${item.jogo} (${item.plataforma})`,
        // Valor real a ser retornado (Objeto com jogo e plataforma)
        value: { jogo: item.jogo, plataforma: item.plataforma }
    }));

    const selecao = await select({
        message: "🎮 Selecione o JOGO para esta conquista:",
        choices: choices
    });

    const jogoSelecionado = selecao.jogo;
    const plataformaSelecionada = selecao.plataforma;

    // --- 4. PROSSEGUE COM OS DETALHES DA CONQUISTA ---

    const titulo = await input ({message: "Titulo da conquista:"});
    if (titulo.length === 0) {
        mostrarMensagem("❌ Título inválido. Tente novamente.");
        return;
    }
    
    const descricao = await input ({message: "Descrição da conquista:"});
    // erro de digitação na mensagem de erro
    if (descricao.length === 0) {
        mostrarMensagem("❌ Descrição inválida. Tente novamente.");
        return;
    }

    const dificuldade = await input ({message: "Dificuldade (fácil, média, difícil):"});
    // tratamento de caso (case-insensitive)
    const dif = dificuldade.toLowerCase().trim();
    if (dif != "facil" && dif != "media" && dif != "dificil") {
        // mensagem de erro mais clara
        mostrarMensagem("❌ Dificuldade inválida. Use fácil, média ou difícil.");
        return;
    }

    // Atribui um booleano e o objeto Date corretamente
    const isDesbloqueada = true; 
    const dataDesbloqueio = new Date().toISOString(); 
    
    // Geração dos pontos
    const pontos = Math.floor(Math.random() * (maxPontos - minPontos + 1)) + minPontos;
    console.log(`🎉 Pontos Gerados: ${pontos} Pts`);

    // 5. ARMAZENAMENTO DA CONQUISTA
    conquistas.push({
        id: randomUUID(), 
        // Inclui o jogo e a plataforma selecionados para poder filtrar depois
        valueJogo: jogoSelecionado,
        valorPlataforma: plataformaSelecionada,

        valueTitulo: titulo, 
        valueDescricao: descricao, 
        valueDificuldade: dif, 
        valueDesbloqueado: isDesbloqueada, 
        valueDataDesbloqueio: dataDesbloqueio, 
        valuePontos: pontos
    });
    mostrarMensagem("✔️ Conquista adicionada com sucesso!");
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
    // 1. APENAS JOGOS CADASTRADOS
    const uniqueGames = new Map(); 

    // Itera para encontrar todos os jogos únicos com suas plataformas
    conquistas.forEach(c => {
        if (c.valueJogo && c.valorPlataforma) {
            const key = `${c.valueJogo.toUpperCase().trim()}-${c.valorPlataforma.toUpperCase().trim()}`;
            if (!uniqueGames.has(key)) {
                uniqueGames.set(key, { jogo: c.valueJogo, plataforma: c.valorPlataforma });
            }
        }
    });

    // 2. VERIFICAÇÃO DE JOGOS CADASTRADOS
    if (uniqueGames.size === 0) {
        mostrarMensagem("❌ Nenhum jogo cadastrado para visualizar. Por favor, adicione um jogo primeiro.");
        return;
    }

    // 3. PREPARAÇÃO DO MENU DE SELEÇÃO
    const choices = Array.from(uniqueGames.values()).map(item => ({
        // Nome a ser exibido no menu (Ex: "Elden Ring (PS5)")
        name: `${item.jogo} (${item.plataforma})`,
        // Valor real a ser retornado
        value: { jogo: item.jogo, plataforma: item.plataforma }
    }));

    // 4. SELEÇÃO DO JOGO
    const selecao = await select({
        message: "🔍 Selecione o JOGO para visualizar as conquistas:",
        choices: choices
    });

    const nomeJogoSelecionado = selecao.jogo;
    const plataformaSelecionada = selecao.plataforma;
    
    // 5. FILTRAGEM DOS DADOS (Não é mais necessário usar toLowerCase() no input)
    // Filtra todas as entradas que correspondem ao jogo e plataforma selecionados.
    const conquistasFiltradas = conquistas.filter(conquista => {
        // Verifica se a propriedade existe para evitar o TypeError
        if (typeof conquista.valueJogo !== 'string' || typeof conquista.valorPlataforma !== 'string') {
            return false;
        }
        
        // Filtra pelo nome do jogo E pela plataforma (para diferenciar "God of War (PC)" de "God of War (PS5)")
        return (
            conquista.valueJogo === nomeJogoSelecionado && 
            conquista.valorPlataforma === plataformaSelecionada
        );
    });

    // 6. EXIBIÇÃO DOS DETALHES
    // Como a filtragem já foi feita, este bloco exibe as informações

    let mensagem = `\n✅ Jogo: ${nomeJogoSelecionado}\n`;
    mensagem += `🎮 Plataforma: ${plataformaSelecionada}\n`;
    mensagem += `Total de Entradas: ${conquistasFiltradas.length}\n`;
    mensagem += "--- Detalhes das Conquistas ---\n";

    conquistasFiltradas.forEach((conquista, index) => {
        // Usa as chaves com prefixo 'value'
        const isDesbloqueada = conquista.valueDesbloqueado || false;
        const status = isDesbloqueada ? "✔️ DESBLOQUEADA" : "❌ BLOQUEADA";
        
        // Tenta formatar a data, se houver
        let dataDesbloqueioFormatada = 'N/A';
        if (isDesbloqueada && conquista.valueDataDesbloqueio) {
            const data = new Date(conquista.valueDataDesbloqueio);
            if (!isNaN(data)) {
                dataDesbloqueioFormatada = data.toLocaleDateString('pt-BR');
            }
        }
        
        mensagem += `\n${index + 1}. Título: ${conquista.valueTitulo || 'N/A'}\n`;
        mensagem += `   Descrição: ${conquista.valueDescricao || 'N/A'}\n`;
        mensagem += `   Dificuldade: ${conquista.valueDificuldade || 'N/A'}\n`;
        mensagem += `   Pontos: ${conquista.valuePontos || 0} Pts\n`;
        mensagem += `   Status: ${status}\n`;

        if (isDesbloqueada) {
            mensagem += `   Data Desbloqueio: ${dataDesbloqueioFormatada}\n`;
        }
    });
    
    mostrarMensagem(mensagem);
}
inciar();