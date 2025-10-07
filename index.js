// Bibliotecas Usadas
const { input, select} = require('@inquirer/prompts');
const {randomUUID} = require ('node:crypto');
const fs = require ('fs');
const pdf = require('html-pdf-node'); 

console.log("=== CONQUISTA DE JOGOS === ");

const minPontos = 10;
const maxPontos = 100;

let conquistas = [];

async function salvarConquistas() {
    try {
        await fs.promises.writeFile('conquistas.json', JSON.stringify(conquistas, null, 2));
        console.log('✔️ Metas salvas com sucesso em conquistas.json');
    } catch (error) {
        console.error('❌ Erro ao salvar metas:', error.message);
    }
}

async function carregarConquistas() {
    try {
        const dados = await fs.promises.readFile('conquistas.json', 'utf-8');
        conquistas = JSON.parse(dados);
        console.log('✔️ Jogos carregados com sucesso de jogos.json');
    } catch (error) {
        console.error('❌ Erro ao carregar jogos:', error.message);
    }
}

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


async function mostrarMenu () {
    const opcao = await select({
        message: "⬇️ Escolha uma opção ⬇️",
        choices: [
        {name: "📝 Adicionar jogo novo.", value: "novo"},
        {name: "📝 Adicionar conquista.", value: "conquista"},
        {name: "📝 Detalhes por jogo / Estatísticas.", value: "visualizar"},
        {name: "🏆 Ranking de Jogos.", value: "ranking"},
        {name: "🏅 Ranking de Dificuldade (D/M/F).", value: "ranking_dificuldade"},
        {name: "📄 Exportar Relatório PDF.", value: "exportar_pdf"},
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
        case "ranking":
            await gerarRanking();
            break;
        case "ranking_dificuldade":
            await gerarRankingDificuldade();
            break;
        case "exportar_pdf":
            await exportarPDF();
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
    await salvarConquistas();
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
    await salvarConquistas();
}

async function iniciar(){
    limparTela();
    mostrarMensagem("=== SISTEMA DE CONQUISTA DE JOGOS ===")
    await carregarConquistas();

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

async function gerarRanking() {
    limparTela();
    mostrarMensagem("🏆 RANKING DE JOGOS MAIS COMPLETADOS 🏆");

    // 1. AGRUPAMENTO E CÁLCULO DAS ESTATÍSTICAS
    // Usa um Map para agrupar as estatísticas de cada jogo
    const rankingData = new Map();

    conquistas.forEach(c => {
        // Ignora entradas que não são de jogo ou conquista
        if (!c.valueJogo || !c.valorPlataforma) {
            return;
        }

        const key = `${c.valueJogo}|${c.valorPlataforma}`; // Chave única para o jogo + plataforma
        
        // Inicializa as estatísticas para este jogo se for a primeira vez
        if (!rankingData.has(key)) {
            // Tenta encontrar o registro inicial do jogo para pegar o total máximo
            const registroJogo = conquistas.find(r => 
                r.valueJogo === c.valueJogo && 
                r.valorPlataforma === c.valorPlataforma &&
                typeof r.maxConquistas === 'number'
            );
            
            // Define o total máximo (com fallback para 1 se não estiver definido)
            const maxConquistas = registroJogo ? registroJogo.maxConquistas : 
                (c.valueTitulo ? 1 : 0); // Se for a primeira conquista, usamos 1 como fallback mínimo
            
            rankingData.set(key, {
                jogo: c.valueJogo,
                plataforma: c.valorPlataforma,
                maxConquistas: maxConquistas,
                desbloqueadas: 0,
                totalCadastradas: 0,
                porcentagem: 0
            });
        }

        const stats = rankingData.get(key);

        // Se a entrada for uma CONQUISTA REAL:
        if (!!c.valueTitulo) { 
            stats.totalCadastradas++;
            if (c.valueDesbloqueado) {
                stats.desbloqueadas++;
            }
        }
    });

    // 2. CÁLCULO FINAL E ORDENAÇÃO
    let rankingArray = Array.from(rankingData.values())
        .map(stats => {
            // Recalcula a porcentagem usando o maxConquistas (total fixo)
            const porcentagem = Math.round((stats.desbloqueadas / stats.maxConquistas) * 100);
            
            return {
                ...stats,
                porcentagem: porcentagem
            };
        })
        // Ordena do maior percentual de conclusão para o menor
        .sort((a, b) => b.porcentagem - a.porcentagem);

    if (rankingArray.length === 0) {
        mostrarMensagem("⚠️ Nenhuma estatística de jogo disponível para criar um ranking.");
        return;
    }

    // 3. EXIBIÇÃO DO RANKING
    let mensagemRanking = "";
    rankingArray.forEach((item, index) => {
        // Gera a barra de progresso para exibição
        const barra = gerarBarraProgresso(item.porcentagem);
        
        mensagemRanking += `\n#${index + 1} - ${item.jogo} (${item.plataforma})\n`;
        mensagemRanking += `   Progresso: ${barra} ${item.porcentagem}%\n`;
        mensagemRanking += `   Status: ${item.desbloqueadas} / ${item.maxConquistas} Conquistas Desbloqueadas\n`;
    });

    mostrarMensagem(mensagemRanking);
}

async function exportarPDF() {
    limparTela();
    mostrarMensagem("📄 Gerando relatório PDF... Aguarde um momento.");

    if (conquistas.length === 0) {
        mostrarMensagem("❌ Não há dados salvos para gerar o relatório.");
        return;
    }

    // 1. MONTAGEM DO CONTEÚDO HTML
    let htmlContent = `
        <html>
        <head>
            <title>Relatório de Conquistas</title>
            <style>
                body { font-family: sans-serif; margin: 20px; }
                h1 { color: #5c6bc0; border-bottom: 2px solid #5c6bc0; padding-bottom: 5px; }
                .game-section { margin-bottom: 30px; border: 1px solid #ccc; padding: 15px; border-radius: 5px; }
                .game-header { font-size: 1.2em; font-weight: bold; margin-bottom: 10px; color: #333; }
                .achievement { border-left: 3px solid #7c4dff; padding-left: 10px; margin-top: 5px; font-size: 0.9em; }
                .status-desbloqueada { color: green; font-weight: bold; }
                .status-bloqueada { color: red; }
                .stats { background-color: #f0f4f8; padding: 10px; border-radius: 4px; margin-bottom: 15px; }
            </style>
        </head>
        <body>
            <h1>Relatório Geral de Conquistas (${new Date().toLocaleDateString('pt-BR')})</h1>
    `;

    // Reutiliza a lógica de agrupamento de jogos para exibir o relatório de forma organizada
    const relatorioPorJogo = agruparConquistasPorJogo(conquistas);

    for (const [key, data] of relatorioPorJogo.entries()) {
        const { jogo, plataforma, conquistas: listaConquistas, maxConquistas, desbloqueadas, porcentagem } = data;

        const barraProgresso = gerarBarraProgresso(porcentagem).replace(/▓/g, '#').replace(/░/g, '-'); // Caracteres simples para PDF

        htmlContent += `
            <div class="game-section">
                <div class="game-header">${jogo} (${plataforma})</div>
                <div class="stats">
                    <p>Total Desbloqueadas: ${desbloqueadas} / ${maxConquistas}</p>
                    <p>Progresso: ${porcentagem}% ${barraProgresso}</p>
                </div>
        `;
        
        listaConquistas.forEach(conquista => {
            const statusClass = conquista.valueDesbloqueado ? 'status-desbloqueada' : 'status-bloqueada';
            const dataDesbloqueio = conquista.valueDataDesbloqueio 
                ? new Date(conquista.valueDataDesbloqueio).toLocaleDateString('pt-BR') 
                : 'Bloqueada';

            htmlContent += `
                <div class="achievement">
                    <strong>${conquista.valueTitulo}</strong> (${conquista.valuePontos} Pts, ${conquista.valueDificuldade})<br>
                    Descrição: ${conquista.valueDescricao}<br>
                    Status: <span class="${statusClass}">${conquista.valueDesbloqueado ? 'DESBLOQUEADA' : 'BLOQUEADA'}</span> | Data: ${dataDesbloqueio}
                </div>
            `;
        });

        htmlContent += `</div>`;
    }

    htmlContent += `</body></html>`;

    // 2. GERAÇÃO DO PDF
    const options = { format: 'A4', args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-gpu', '--disable-dev-shm-usage', '--no-zygote', '--single-process'],};
    const file = { content: htmlContent };

    try {
        const pdfBuffer = await pdf.generatePdf(file, options);
        // Salva o buffer diretamente no arquivo
        await fs.promises.writeFile('relatorio_conquistas.pdf', pdfBuffer);
        mostrarMensagem("🎉 PDF gerado com sucesso! Arquivo: relatorio_conquistas.pdf");
    } catch (Erro) {
        mostrarMensagem(`❌ Erro ao gerar PDF: ${Erro.message}`);
        console.error(Erro);
    }
}

// Adicione esta função auxiliar após gerarBarraProgresso e antes de mostrarMenu:
function agruparConquistasPorJogo(conquistasArray) {
    const relatorio = new Map();

    conquistasArray.forEach(c => {
        if (!c.valueJogo || !c.valorPlataforma || !c.valueTitulo) {
            // Ignora registros de jogo incompletos ou malformados
            return;
        }

        const key = `${c.valueJogo}|${c.valorPlataforma}`;

        if (!relatorio.has(key)) {
            const registroJogo = conquistasArray.find(r => 
                r.valueJogo === c.valueJogo && 
                r.valorPlataforma === c.valorPlataforma &&
                typeof r.maxConquistas === 'number'
            );
            
            const maxConquistas = registroJogo ? registroJogo.maxConquistas : 1;
            
            relatorio.set(key, {
                jogo: c.valueJogo,
                plataforma: c.valorPlataforma,
                maxConquistas: maxConquistas,
                desbloqueadas: 0,
                conquistas: [],
                porcentagem: 0
            });
        }

        const data = relatorio.get(key);

        data.conquistas.push(c);

        if (c.valueDesbloqueado) {
            data.desbloqueadas++;
        }
        
        data.porcentagem = Math.round((data.desbloqueadas / data.maxConquistas) * 100);
    });

    return relatorio;
}


const PRIORIDADE_DIFICULDADE = {
    "dificil": 3,
    "media": 2,
    "facil": 1
};

async function gerarRankingDificuldade() {
    limparTela();
    mostrarMensagem("🏅 RANKING DE CONQUISTAS POR DIFICULDADE 🏅");

    // 1. FILTRAR E COLETAR APENAS AS CONQUISTAS VÁLIDAS
    // Filtra para incluir apenas entradas que são conquistas reais (têm valueTitulo)
    const todasConquistas = conquistas.filter(c => c.valueTitulo);

    if (todasConquistas.length === 0) {
        mostrarMensagem("⚠️ Nenhuma conquista cadastrada para gerar o ranking.");
        return;
    }

    // 2. ORDENAÇÃO POR DIFICULDADE
    const conquistasOrdenadas = todasConquistas.sort((a, b) => {
        // Pega o valor de prioridade na tabela (o toLowerCase é importante)
        const prioridadeA = PRIORIDADE_DIFICULDADE[a.valueDificuldade.toLowerCase()] || 0;
        const prioridadeB = PRIORIDADE_DIFICULDADE[b.valueDificuldade.toLowerCase()] || 0;

        // Ordena em ordem decrescente (DIFÍCIL > MÉDIA > FÁCIL)
        return prioridadeB - prioridadeA;
    });

    // 3. EXIBIÇÃO DO RANKING
    let mensagemRanking = "";
    
    conquistasOrdenadas.forEach((c, index) => {
        const status = c.valueDesbloqueado ? "✔️ DESBLOQUEADA" : "❌ BLOQUEADA";
        
        mensagemRanking += `\n--- #${index + 1} ---\n`;
        mensagemRanking += `Título: ${c.valueTitulo}\n`;
        mensagemRanking += `Jogo/Plataforma: ${c.valueJogo} (${c.valorPlataforma})\n`;
        mensagemRanking += `Dificuldade: ${c.valueDificuldade.toUpperCase()}\n`;
        mensagemRanking += `Status: ${status}\n`;
        mensagemRanking += `Pontos: ${c.valuePontos} Pts\n`;
    });

    mostrarMensagem(mensagemRanking);
}

iniciar();