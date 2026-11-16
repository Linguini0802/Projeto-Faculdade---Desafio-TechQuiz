document.addEventListener("DOMContentLoaded", () => {
    // Telas
    const telaInicio = document.getElementById("tela-inicio");
    const telaNome = document.getElementById("tela-nome");
    const telaJogo = document.getElementById("tela-jogo");
    const telaResultado = document.getElementById("tela-resultado");

    // Botões e campos
    const btnIniciar = document.getElementById("btn-iniciar");
    const btnComecarJogo = document.getElementById("btn-comecar-jogo");
    const inputNome = document.getElementById("input-nome");
    const btnProxima = document.getElementById("btn-proxima");
    const btnReiniciar = document.getElementById("btn-reiniciar");
    const btnLimparRanking = document.getElementById("btn-limpar-ranking");

    // Elementos do jogo
    const contadorPergunta = document.getElementById("contador-pergunta");
    const textoPergunta = document.getElementById("texto-pergunta");
    const containerAlternativas = document.getElementById("container-alternativas");
    const containerRetorno = document.getElementById("container-retorno");
    const textoRetorno = document.getElementById("texto-retorno");
    const textoFonte = document.getElementById("texto-fonte");

    // Elementos do resultado
    const mensagemResultado = document.getElementById("mensagem-resultado");
    const pontuacaoFinal = document.getElementById("pontuacao-final");
    const listaRanking = document.getElementById("lista-ranking");

    let perguntas = [];
    let indicePerguntaAtual = 0;
    let pontuacao = 0;
    let nomeJogador = "";

    // 1. Carregar perguntas do JSON
    async function carregarPerguntas() {
        try {
            const resposta = await fetch("perguntas.json");
            perguntas = await resposta.json();
        } catch (erro) {
            console.error("Erro ao carregar perguntas.json:", erro);
            alert("Não foi possível carregar as perguntas. Abra o projeto com o Live Server.");
        }
    }

    carregarPerguntas();

    function mudarTela(telaAtual, proximaTela) {
        telaAtual.classList.remove("ativa");
        proximaTela.classList.add("ativa");
    }

    // Navegação
    btnIniciar.addEventListener("click", () => {
        mudarTela(telaInicio, telaNome);
        inputNome.focus();
    });

    btnComecarJogo.addEventListener("click", () => {
        nomeJogador = inputNome.value.trim();
        if (nomeJogador === "") {
            alert("Por favor, digite seu nome antes de começar.");
            inputNome.focus();
            return;
        }
        if (perguntas.length === 0) {
            alert("As perguntas ainda não foram carregadas.");
            return;
        }
        indicePerguntaAtual = 0;
        pontuacao = 0;
        mudarTela(telaNome, telaJogo);
        carregarPerguntaAtual();
    });

    // 2. Mostrar a pergunta atual
    function carregarPerguntaAtual() {
        containerRetorno.style.display = "none";
        btnProxima.style.display = "none";
        containerAlternativas.innerHTML = "";

        const pAtual = perguntas[indicePerguntaAtual];
        contadorPergunta.textContent = `Pergunta ${indicePerguntaAtual + 1} de ${perguntas.length}`;
        textoPergunta.textContent = pAtual.pergunta;

        pAtual.alternativas.forEach((alternativa, index) => {
            const botao = document.createElement("button");
            botao.classList.add("botao-alternativa");
            botao.textContent = alternativa;
            botao.addEventListener("click", () => selecionarResposta(index, pAtual));
            containerAlternativas.appendChild(botao);
        });
    }

    // 3. Conferir a resposta
    function selecionarResposta(indiceEscolhido, dadosPergunta) {
        const indiceCorreto = dadosPergunta.resposta;
        const botoes = containerAlternativas.querySelectorAll(".botao-alternativa");

        botoes.forEach((botao, index) => {
            botao.disabled = true;
            if (index === indiceCorreto) {
                botao.classList.add("botao-correto");
                botao.textContent += " ✔ (Correto)";
            } else if (index === indiceEscolhido) {
                botao.classList.add("botao-incorreto");
                botao.textContent += " ✖ (Incorreto)";
            }
        });

        if (indiceEscolhido === indiceCorreto) {
            pontuacao++;
            textoRetorno.textContent = "✔ Resposta Correta!";
            textoRetorno.style.color = "var(--cor-sucesso)";
        } else {
            textoRetorno.textContent = "✖ Resposta Incorreta!";
            textoRetorno.style.color = "#ef4444";
        }

        textoFonte.textContent = `${dadosPergunta.explicacao} Fonte: ${dadosPergunta.fonte}`;
        containerRetorno.style.display = "block";
        btnProxima.style.display = "block";
        btnProxima.focus();
    }

    // 4. Próxima pergunta ou fim
    btnProxima.addEventListener("click", () => {
        indicePerguntaAtual++;
        if (indicePerguntaAtual < perguntas.length) {
            carregarPerguntaAtual();
        } else {
            finalizarQuiz();
        }
    });

    // 5. Fim do quiz e ranking
    function finalizarQuiz() {
        mudarTela(telaJogo, telaResultado);
        mensagemResultado.textContent = `Parabéns, ${nomeJogador}!`;
        pontuacaoFinal.textContent = `Você acertou ${pontuacao} de ${perguntas.length} perguntas.`;
        salvarNoSessionStorage(nomeJogador, pontuacao);
        exibirRanking();
    }

    function salvarNoSessionStorage(nome, pontos) {
        let ranking = JSON.parse(sessionStorage.getItem("techquiz_ranking")) || [];
        ranking.push({ nome, pontos, data: new Date().toLocaleTimeString() });
        ranking.sort((a, b) => b.pontos - a.pontos);
        sessionStorage.setItem("techquiz_ranking", JSON.stringify(ranking));
    }

    function exibirRanking() {
        let ranking = JSON.parse(sessionStorage.getItem("techquiz_ranking")) || [];
        listaRanking.innerHTML = "";

        if (ranking.length === 0) {
            listaRanking.innerHTML = "<li class='sem-registro'>Nenhum registro na sessão.</li>";
            return;
        }

        ranking.forEach((item) => {
            const li = document.createElement("li");
            li.textContent = `${item.nome}: ${item.pontos} ponto(s) (${item.data})`;
            listaRanking.appendChild(li);
        });
    }

    // 6. Limpar ranking
    btnLimparRanking.addEventListener("click", () => {
        sessionStorage.removeItem("techquiz_ranking");
        exibirRanking();
    });

    // 7. Jogar novamente
    btnReiniciar.addEventListener("click", () => {
        inputNome.value = "";
        mudarTela(telaResultado, telaInicio);
    });
});
