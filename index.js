async function visualizarConquistasPorJogo() {
    // 1. Pede o nome do jogo ao usuário e limpa espaços/garante string
    const nomeJogoInput = await input({ message: "Qual jogo você deseja visualizar?" });
    const nomeJogo = (nomeJogoInput || "").trim();

    if (nomeJogo.length === 0) {
        mostrarMensagem("❌ Nome do jogo não pode ser vazio.");
        return;
    }

    // 2. Filtra o array com a VERIFICAÇÃO DE SEGURANÇA
    const conquistasFiltradas = conquistas.filter(conquista => {
        // CORREÇÃO: Verifica se valueJogo existe e é uma string antes de chamar toLowerCase()
        if (typeof conquista.valueJogo !== 'string') {
            return false;
        }
        
        return conquista.valueJogo.toLowerCase() === nomeJogo.toLowerCase();
    });

    if (conquistasFiltradas.length === 0) {
        mostrarMensagem(`⚠️ Nenhum jogo encontrado com o nome: ${nomeJogo}.`);
        return;
    }

    // 3. Prepara a exibição
    const jogoInfo = conquistasFiltradas[0];
    const nomeExibido = jogoInfo.valueJogo;
    const plataformaExibida = jogoInfo.valorPlataforma;

    let mensagem = `\n--- Detalhes do Jogo ---\n`;
    mensagem += `🎮 Jogo: ${nomeExibido} (${plataformaExibida})\n`;
    mensagem += `✅ Total de Conquistas Encontradas: ${conquistasFiltradas.length}\n`;
    mensagem += "--------------------------------\n";
    
    // 4. Lista os detalhes de cada conquista
    conquistasFiltradas.forEach((conquista, index) => {
        const statusIcon = conquista.desbloqueada ? "✔️" : "🔒";
        const statusText = conquista.desbloqueada ? "Desbloqueada" : "Bloqueada";
        
        // Exibe a data formatada, se existir
        let dataDesbloqueio = 'N/A';
        if (conquista.dataDesbloqueio && conquista.desbloqueada) {
             dataDesbloqueio = new Date(conquista.dataDesbloqueio).toLocaleDateString('pt-BR');
        }
        
        mensagem += `\n${index + 1}. ${conquista.titulo || 'Sem Título'}\n`;
        mensagem += `   Pontos: ${conquista.pontos || 0} Pts\n`;
        mensagem += `   Dificuldade: ${conquista.dificuldade || 'N/A'}\n`;
        mensagem += `   Status: ${statusIcon} ${statusText}\n`;
        
        // Inclui a data apenas para conquistas desbloqueadas
        if (conquista.desbloqueada) {
            mensagem += `   Data: ${dataDesbloqueio}\n`;
        }
        
        mensagem += `   Descrição: ${conquista.descricao || 'Sem descrição'}\n`;
    });

    mostrarMensagem(mensagem);
}