// Variáveis Globais
let jogos = [];
let posicaoAtual = -1; 
let jogoAtualId = null; 
function abrirMenu() {
    const menu = document.getElementById("sideMenu");
    if (menu) menu.style.left = "0";
}
function fecharMenu() {
    const menu = document.getElementById("sideMenu");
    if (menu) menu.style.left = "-250px";
}

document.addEventListener('DOMContentLoaded', () => {
    const cadastroForm = document.getElementById('cadastroForm');
    if (cadastroForm) {
        const thumbnailInput = document.getElementById('thumbnail');
        const exampleImage = document.getElementById('exampleImage');
        const fileNameSpan = document.querySelector('.file-name');

        if (thumbnailInput && exampleImage && fileNameSpan) {
            thumbnailInput.addEventListener('change', function(e) {
                const file = e.target.files[0];
                if (file) {
                    const reader = new FileReader();
                    reader.onload = function(event) {
                        exampleImage.src = event.target.result;                        
                        fileNameSpan.textContent = file.name;
                    }
                    reader.readAsDataURL(file);
                } else {
                    exampleImage.src = "src/Imagem5.jpg"; 
                    fileNameSpan.textContent = "Nenhum arquivo escolhido";
                }
            });
        }


        cadastroForm.addEventListener('submit', function(event) {
            event.preventDefault(); 
            cadastrarJogo();        
        });
    }


    const pesquisaForm = document.getElementById('pesquisaForm');
    if (pesquisaForm) {
  
        carregarBase().then(() => {
            console.log('Base de jogos carregada para navegação.');
            atualizarBotoesNavegacao(); 
        }).catch(error => {
            console.error("Erro ao carregar base na inicialização da pesquisa:", error);
            alert("Não foi possível carregar a lista de jogos para navegação.");
        });
     
        const searchButton = pesquisaForm.querySelector('button[onclick="pesquisarJogo()"]');
        if(searchButton) {
             searchButton.setAttribute('type', 'button'); 
        }
         const navButtons = document.querySelector('.navegar');
         if (navButtons) {
            navButtons.style.display = 'none';
         }
    }

}); 



function cadastrarJogo() {
    const name = document.getElementById('name')?.value; 
    const platform = document.getElementById('platform')?.value;
    const price = document.getElementById('price')?.value;
    const category = document.getElementById('category')?.value;
    const thumbnailInput = document.getElementById('thumbnail');
    const thumbnail = thumbnailInput?.files[0];

    if (!name || !platform || !price || !category) {
        alert('Por favor, preencha todos os campos obrigatórios (Nome, Plataforma, Preço, Gênero).');
        return;
    }
     if (!thumbnail) {
        alert('Por favor, selecione uma imagem.');
        return;
    }


    const formData = new FormData();
    formData.append('name', name);
    formData.append('platform', platform);
    formData.append('price', price);
    formData.append('category', category);
    formData.append('thumbnail', thumbnail);

    console.log("Enviando dados para cadastro...");

    fetch('http://localhost:8080/jogos/create', {
        method: 'POST',
        body: formData,
    })
    .then(response => {
        if (!response.ok) {
             return response.text().then(text => { throw new Error(text || `Erro ${response.status}`) });
        }
        return response.json();
    })
    .then(data => {
        alert(`Jogo "${data.name}" cadastrado com sucesso! ID: ${data.id}`);
        document.getElementById('cadastroForm')?.reset(); 
        const exampleImage = document.getElementById('exampleImage');
        const fileNameSpan = document.querySelector('.file-name');
        if(exampleImage) exampleImage.src = "src/Imagem5.jpg";
        if(fileNameSpan) fileNameSpan.textContent = "Nenhum arquivo escolhido";
    })
    .catch(error => {
        console.error('Erro ao cadastrar jogo:', error);
        alert(`Erro ao cadastrar jogo: ${error.message}`);
    });
}

async function carregarBase() {
    console.log('Carregando base de jogos...');
    try {
        const response = await fetch('http://localhost:8080/jogos');
        if (!response.ok) {
             throw new Error(`Erro ao buscar jogos: ${response.status}`);
        }
        const dados = await response.json();
        jogos = dados; 
        console.log(`Base carregada com ${jogos.length} jogos.`);
        jogos.sort((a, b) => a.id - b.id);
    } catch (error) {
        console.error('Erro dentro de carregarBase:', error);
        jogos = []; 
        throw error;
    }
}

async function pesquisarJogo() {
    console.log('Iniciando pesquisa...'); 
    const searchIdInput = document.getElementById('searchId');
    const searchId = searchIdInput?.value;

    if (!searchId) {
        alert('Por favor, insira um ID para pesquisar.');
        return;
    }

    limparCamposPesquisa(false); 
    resetarImagemPesquisa();
    const navButtons = document.querySelector('.navegar');
    if (navButtons) navButtons.style.display = 'none';
    jogoAtualId = null; // Reseta o ID atual
    posicaoAtual = -1;

    console.log(`Buscando jogo com ID: ${searchId}`); 

    fetch(`http://localhost:8080/jogos/${searchId}`)
        .then(response => {
            console.log('Resposta do fetch recebida.');
            if (!response.ok) {
                 if (response.status === 404) {
                    throw new Error(`Jogo com ID ${searchId} não encontrado.`);
                 } else {
                    throw new Error(`Erro do servidor: ${response.status}`);
                 }
            }
            return response.json();
        })
        .then(data => {
            console.log('Dados do jogo recebidos:', data); 
            preencherCamposPesquisa(data);
            exibirImagemPesquisa(data);

            jogoAtualId = data.id; 

    
            posicaoAtual = jogos.findIndex(jogo => jogo.id == jogoAtualId); 

            console.log(`Jogo encontrado. Posição na lista: ${posicaoAtual}`); 

          
            if (navButtons) navButtons.style.display = 'flex';
            atualizarBotoesNavegacao(); 

        })
        .catch(error => {
            console.error('Erro ao pesquisar jogo:', error);
            document.getElementById('resultadoPesquisa').innerHTML = `<p style="color: red;">${error.message}</p>`;
            limparCamposPesquisa(false); 
             if (navButtons) navButtons.style.display = 'none'; 
             jogoAtualId = null;
             posicaoAtual = -1;
        });    
}

function atualizarJogo() {
    if (!jogoAtualId) { 
        alert('Nenhum jogo carregado para atualizar. Pesquise um jogo primeiro.');
        return;
    }

    const name = document.getElementById('name')?.value;
    const platform = document.getElementById('platform')?.value;
    const price = document.getElementById('price')?.value;
    const category = document.getElementById('category')?.value;

    if (!name || !platform || !price || !category) {
        alert('Os campos Nome, Plataforma, Preço e Gênero não podem ficar vazios para atualizar.');
        return;
    }
    const formData = new FormData();
    formData.append('name', name);
    formData.append('platform', platform);
    formData.append('price', price);
    formData.append('category', category);
    console.log(`Atualizando jogo ID: ${jogoAtualId}`);

    fetch(`http://localhost:8080/jogos/${jogoAtualId}`, { 
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, platform, price, category }), 

    })
    .then(response => {
         if (!response.ok) {
            return response.text().then(text => { throw new Error(text || `Erro ${response.status}`) });
        }
        return response.json(); 
    })
    .then(data => {
        alert('Jogo atualizado com sucesso!');        
        if (posicaoAtual > -1 && jogos[posicaoAtual]) {
            jogos[posicaoAtual] = { ...jogos[posicaoAtual], ...data };
        }
        
    })
    .catch(error => {
        console.error('Erro ao atualizar jogo:', error);
        alert(`Erro ao atualizar jogo: ${error.message}`);
    });
}

function excluirJogo() {
     if (!jogoAtualId) { 
        alert('Nenhum jogo carregado para excluir. Pesquise um jogo primeiro.');
        return;
    }
  
    if (!confirm(`Tem certeza que deseja excluir o jogo ID ${jogoAtualId}?`)) {
        return; 
    }

    console.log(`Excluindo jogo ID: ${jogoAtualId}`);

    fetch(`http://localhost:8080/jogos/${jogoAtualId}`, { 
        method: 'DELETE'
        
    })
    .then(response => {
        if (!response.ok) { 
             if (response.status === 204) return; // Considera sucesso
             return response.text().then(text => { throw new Error(text || `Erro ${response.status}`) });
        }
    })
    .then(() => { 
        alert('Jogo apagado com sucesso!');
        if (posicaoAtual > -1) {
            jogos.splice(posicaoAtual, 1);
        }
        document.getElementById('pesquisaForm')?.reset(); 
        resetarImagemPesquisa();
        const navButtons = document.querySelector('.navegar');
        if (navButtons) navButtons.style.display = 'none';
        jogoAtualId = null;
        posicaoAtual = -1;
        atualizarBotoesNavegacao(); 

    })
    .catch(error => {
        console.error('Erro ao apagar jogo:', error);
         alert(`Erro ao apagar jogo: ${error.message}`);
    });
}


function carregarJogoAnterior() {
    if (posicaoAtual > 0) {
        posicaoAtual--;
        carregarJogo(jogos[posicaoAtual]);
    }
    atualizarBotoesNavegacao();
}

function carregarJogoProximo() {
    if (posicaoAtual < jogos.length - 1) {
        posicaoAtual++;
        carregarJogo(jogos[posicaoAtual]);
    }
     atualizarBotoesNavegacao();
}

// Carrega um jogo da lista local 'jogos' para a interface
function carregarJogo(jogo) {
    if (!jogo) return;

    preencherCamposPesquisa(jogo);
    exibirImagemPesquisa(jogo);
    document.getElementById('searchId').value = jogo.id; 
    jogoAtualId = jogo.id; 

    const navButtons = document.querySelector('.navegar');
    if (navButtons) navButtons.style.display = 'flex';
}


function limparCamposPesquisa(limparId = true) {
    if(limparId) {
         document.getElementById('searchId').value = '';
    }
    document.getElementById('name').value = '';
    document.getElementById('platform').value = '';
    document.getElementById('price').value = '';
    document.getElementById('category').value = '';
}

function preencherCamposPesquisa(data) {
    document.getElementById('name').value = data.name || '';
    document.getElementById('platform').value = data.platform || '';
    document.getElementById('price').value = data.price !== null && data.price !== undefined ? data.price : '';
    document.getElementById('category').value = data.category || '';
}

function exibirImagemPesquisa(data) {
     const resultadoPesquisa = document.getElementById('resultadoPesquisa');
     if (resultadoPesquisa) {
         if (data && data.thumbnail) {
             resultadoPesquisa.innerHTML = `
                <img src="data:image/jpeg;base64,${data.thumbnail}" alt="Imagem do Jogo: ${data.name || ''}" id="exampleImage" style="max-width: 100%; height: auto;">
             `;
         } else {
             resetarImagemPesquisa();
         }
     }
}

function resetarImagemPesquisa() {
     const resultadoPesquisa = document.getElementById('resultadoPesquisa');
      if (resultadoPesquisa) {
         resultadoPesquisa.innerHTML = `
            <img src="src/Imagem5.jpg" alt="Exemplo de Jogo" id="exampleImage" style="max-width: 100%; height: auto;">
         `;
      }
}

function atualizarBotoesNavegacao() {
    const btnAnterior = document.getElementById('anterior');
    const btnProximo = document.getElementById('proximo');
    if (btnAnterior) {
        btnAnterior.disabled = (posicaoAtual <= 0); 
    }
     if (btnProximo) {
        btnProximo.disabled = (posicaoAtual < 0 || posicaoAtual >= jogos.length - 1); 
    }
}

//
// Adicione esta função ao seu script.js

async function carregarVitrine() {
    const gameGrid = document.getElementById('gameGrid');
    const loadingMessage = document.getElementById('loadingMessage');

    if (!gameGrid) {
        console.error("Elemento 'gameGrid' não encontrado.");
        return; // Sai se não estiver na página da vitrine
    }

     // Exibe mensagem de carregamento inicial
    if (loadingMessage) loadingMessage.style.display = 'block';
    gameGrid.innerHTML = ''; // Limpa grid anterior (exceto a mensagem)
    gameGrid.appendChild(loadingMessage); // Recoloca a mensagem

    try {
        // Reutiliza a função carregarBase se quiser a lista já ordenada e tratada
        // ou faz um fetch direto aqui
        console.log("Buscando jogos para a vitrine...");
        const response = await fetch('http://localhost:8080/jogos');

        if (!response.ok) {
            throw new Error(`Erro ao buscar jogos: ${response.status}`);
        }

        const jogosParaVitrine = await response.json();
        console.log(`${jogosParaVitrine.length} jogos recebidos.`);

        // Remove a mensagem de carregamento
         if (loadingMessage) loadingMessage.style.display = 'none';


        if (jogosParaVitrine.length === 0) {
            gameGrid.innerHTML = '<p id="errorMessage">Nenhum jogo cadastrado ainda.</p>';
            return;
        }

        // Cria e adiciona um card para cada jogo
        jogosParaVitrine.forEach(jogo => {
            const card = document.createElement('div');
            card.classList.add('product-card');

            const precoFormatado = Number(jogo.price).toLocaleString('pt-BR', {
                style: 'currency',
                currency: 'BRL'
            });

            card.innerHTML = `
                <img src="data:image/jpeg;base64,${jogo.thumbnail}" alt="${jogo.name || 'Imagem do Jogo'}">
                <div class="product-info">
                    <h3 class="product-name" title="${jogo.name || ''}">${jogo.name || 'Nome Indisponível'}</h3>
                    <p class="product-platform">Plataforma: ${jogo.platform || 'N/A'}</p>
                    <p class="product-category">Gênero: ${jogo.category || 'N/A'}</p>
                    <p class="product-price">${precoFormatado}</p>
                    <button class="btn-buy" onclick="comprarJogo(${jogo.id})">Comprar</button>
                </div>
            `;
            gameGrid.appendChild(card);
        });

    } catch (error) {
        console.error('Erro ao carregar vitrine:', error);
        if (loadingMessage) loadingMessage.style.display = 'none';
        gameGrid.innerHTML = `<p id="errorMessage">Falha ao carregar os jogos. Tente novamente mais tarde. (${error.message})</p>`;
    }
}

// Função placeholder para o botão comprar (você implementará a lógica depois)
function comprarJogo(id) {
    alert(`Funcionalidade "Comprar" para o jogo ID ${id} ainda não implementada.`);
    // Aqui você adicionaria a lógica de adicionar ao carrinho, etc.
}


// --- Ajuste no DOMContentLoaded ---
// Certifique-se que seu listener DOMContentLoaded chame carregarVitrine
// se estiver na página correta (index.html ou vitrine.html)

document.addEventListener('DOMContentLoaded', () => {

    // (Mantenha os blocos if (cadastroForm) e if (pesquisaForm) como estavam)
    // ...

    // --- Bloco para a página da VITRINE (index.html / vitrine.html) ---
    const gameGridElement = document.getElementById('gameGrid');
    if (gameGridElement) {
        carregarVitrine(); // Chama a função para preencher a grade
    }

}); // Fim do DOMContentLoaded