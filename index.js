const { input, select, checkbox } = require('@inquirer/prompts');
const {randomUUID} = require ('node:crypto');


console.log("=== CONQUISTA DE JOGOS === ");

const minPontos = 10;
const maxPontos = 100;

let conquistas = [];

// === FUNÇÕES DE UTILIDADE GERAL ===
function limparTela(){
    console.clear();
}

function mostrarMensagem(mensagem) {
    console.log(`\n${mensagem}\n`);
}

/**
 * Gera uma barra de progresso visual para o console.
 * @param {number} porcentagem - O valor percentual (0-100).
 * @returns {string} - A barra visual.
 */
function gerarBarraProgresso(porcentagem) {
    const tamanhoBarra = 20;
    
    // Calcula quantos blocos são preenchidos
    const blocosPreenchidos = Math.round((porcentagem / 100) * tamanhoBarra);
    
    // Calcula quantos blocos são vazios
    const blocosVazios = tamanhoBarra - blocosPreenchidos;

    // Constrói a barra visual
    const barraPreenchida = '▓'.repeat(blocosPreenchidos);
    const barraVazia = '░'.repeat(blocosVazios);

    return `[${barraPreenchida}${barraVazia}]`;
}
// ===================================


async function mostrarMenu () {
    const opcao = await select({
        message: "⬇️ Escolha uma opção ⬇️",
        choices: [
        {name: "📝 Adicionar jogo novo.", value: "novo"},
        {name: "📝 Adicionar conquista.", value: "conquista"},
        {name: "📝 Detalhes por jogo / Estatísticas.", value: "visualizar"},
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

    const totalMaximo = await input({message: "📝 Total MÁXIMO de conquistas que este jogo terá:"});
    const maxConquistas = parseInt(totalMaximo, 10); // Converte o input para um número inteiro

    if (isNaN(maxConquistas) || maxConquistas <= 0) {
       mostrarMensagem("❌ Total máximo inválido. Use um número positivo.");
       return;
    }

    const plataforma = await input({message: "📝 Digite a plataforma (PC / XBOX / PS5):"});
    const plataformaUpper = plataforma.toUpperCase().trim(); // Converte para maiúsculas e remove espaços

    if (plataformaUpper != "PC" && plataformaUpper != "XBOX" && plataformaUpper != "PS5") {
       mostrarMensagem("❌ Plataforma inválida. Tente novamente.");
       return;
    }

    // Usando a variável plataformaUpper e salvando maxConquistas
    conquistas.push({id: randomUUID(), valueJogo: jogo, valorPlataforma: plataformaUpper, maxConquistas: maxConquistas});
    mostrarMensagem("✔️ Jogo adicionado com sucesso!");
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
    
    // 5. FILTRAGEM DOS DADOS (Conquistas reais)
    const conquistasFiltradas = conquistas.filter(conquista => {
        // Verifica se a propriedade existe para evitar o TypeError
        if (typeof conquista.valueJogo !== 'string' || typeof conquista.valorPlataforma !== 'string') {
            return false;
        }

        const Jogo_E_Plataforma = (
            conquista.valueJogo === nomeJogoSelecionado && 
            conquista.valorPlataforma === plataformaSelecionada
        );
        
        // Verifica se possui Título (é uma conquista, e não apenas o registro do jogo)
        const ConquistaAtual = !!conquista.valueTitulo; 
        
        // Retorna APENAS se for uma conquista E o jogo/plataforma for o selecionado
        return Jogo_E_Plataforma && ConquistaAtual;
    }); 
    
    // 6. CÁLCULO DAS ESTATÍSTICAS (CORRIGIDO PARA USAR O TOTAL MÁXIMO)
    const totalConquistasCadastradas = conquistasFiltradas.length;
    let desbloqueadas = 0;

    conquistasFiltradas.forEach(c => {
        if (c.valueDesbloqueado) { 
            desbloqueadas++;
        }
    });
    
    // 🚨 ENCONTRA O TOTAL MÁXIMO DEFINIDO NO CADASTRO DO JOGO
    const registroJogo = conquistas.find(c => 
        c.valueJogo === nomeJogoSelecionado && 
        c.valorPlataforma === plataformaSelecionada &&
        typeof c.maxConquistas === 'number'
    );
    
    const maxConquistasDoJogo = registroJogo ? registroJogo.maxConquistas : 
        (totalConquistasCadastradas > 0 ? totalConquistasCadastradas : 1);
        
    // Calcula a porcentagem usando o TOTAL MÁXIMO
    const porcentagem = Math.round((desbloqueadas / maxConquistasDoJogo) * 100);

    const barraProgresso = gerarBarraProgresso(porcentagem);

    // 7. EXIBIÇÃO DOS DETALHES
    let mensagem = `\n✅ Jogo: ${nomeJogoSelecionado}\n`;
    mensagem += `🎮 Plataforma: ${plataformaSelecionada}\n`;
    mensagem += `\n📊 Estatísticas de Conclusão:\n`;
    
    // Usa as variáveis locais corrigidas:
    mensagem += `   Conquistas Desbloqueadas: ${desbloqueadas}/${maxConquistasDoJogo}\n`; // Exibe a razão
    mensagem += `   Progresso: ${barraProgresso} ${porcentagem}%\n`; 
    mensagem += "----------------------------------------\n";
    mensagem += "--- Detalhes das Conquistas ---\n";

    // Usa o total correto para a verificação
    if (totalConquistasCadastradas === 0) {
        mensagem += "\nNenhuma conquista cadastrada para este jogo/plataforma.";
    }

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