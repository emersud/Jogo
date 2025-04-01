
let jogos = [];
let posicaoAtual = 0;

function cadastrarJogo() {

	const name = document.getElementById('name').value;
	const platform = document.getElementById('platform').value;
	const thumbnail = document.getElementById('thumbnail').files[0];

	const formData = new FormData();
	formData.append('name', name);
	formData.append('platform', platform);
	formData.append('thumbnail', thumbnail);

	fetch('http://localhost:8080/jogos/create', {
		method: 'POST',
		body: formData,
	})
		.then(response => response.json())
		.then(data => {
			alert('Jogo cadastrado com sucesso!');
			document.getElementById('cadastroForm').reset();
			location.reload();
		})
		.catch(error => {
			console.error('Erro ao cadastrar jogo:', error);
		});
}

function pesquisarJogo() {
	const searchId = document.getElementById('searchId').value;
	carregarBase();

	fetch(`http://localhost:8080/jogos/${searchId}`)
		.then(response => {
			if (response.status === 404) {
				return Promise.reject('Jogo não encontrado');
			}
			return response.json();
		})
		.then(data => {
			result = 1;
			document.getElementById('name').value = data.name;
			document.getElementById('platform').value = data.platform;
			document.getElementById('anterior').style.display = 'inline';
			document.getElementById('proximo').style.display = 'inline';

			const resultadoPesquisa = document.getElementById('resultadoPesquisa');
			resultadoPesquisa.innerHTML = `
                <h3>ID: ${data.id}</h3>
                <img src="data:thumbnail/jpeg;base64,${data.thumbnail}" alt="Imagem do Jogo">
            `;
		})
		.catch(error => {
			console.error('Erro ao pesquisar jogo:', error);
			document.getElementById('resultadoPesquisa').innerHTML = 'Jogo não encontrado. Inserir ID válido';
		});
}

function atualizarJogo() {
	pesquisarJogo();
	if (result == 1) {
		const name = document.getElementById('name').value;
		const platform = document.getElementById('platform').value;
		const searchId = document.getElementById('searchId').value;
		const thumbnail = document.getElementById('thumbnail').files[0];

		const formData = new FormData();
		formData.append('name', name);
		formData.append('platform', platform);
		if (thumbnail) {
			formData.append('thumbnail', thumbnail);
		}

		fetch(`http://localhost:8080/jogos/${searchId}`, {
			method: 'PUT',
			body: formData,
		})
			.then(response => response.json())
			.then(data => {
				alert('Jogo atualizado com sucesso!');
				document.getElementById('cadastroForm').reset();
				location.reload();
			})
			.catch(error => {
				console.error('Erro ao atualizar jogo:', error);
			});
	} else {
		alert('ID não encontrado. Favor pesquisar jogo a ser alterado.');
	}
}

function excluirJogo() {
	pesquisarJogo();
	if (result == 1) {
		const searchId = document.getElementById('searchId').value;
		fetch(`http://localhost:8080/jogos/${searchId}`, {
			method: 'DELETE',
			headers: { 'Content-Type': 'application/json' }
		})
			.then(response => {
				if (response.status === 200) {
					alert('Jogo apagado com sucesso!');
					document.getElementById('cadastroForm').reset();
					location.reload();
				} else {
					alert('Erro ao apagar jogo.');
				}
			})
			.catch(error => {
				console.error('Erro ao apagar jogo:', error);
			});
	} else {
		alert('ID não encontrado. Nenhum jogo foi apagado.');
	}
}

function carregarBase() {
    fetch('http://localhost:8080/jogos')
        .then(response => response.json())
        .then(data => {
            jogos = data;
        })
        .catch(error => {
            console.error('Erro ao carregar jogos:', error);
        });
}

function carregarJogoAnterior() {
    if (posicaoAtual > 0) {
        posicaoAtual--;
        carregarJogo(jogos[posicaoAtual]);
    }
}

function carregarJogoProximo() {
    if (posicaoAtual < jogos.length - 1) {
        posicaoAtual++;
        carregarJogo(jogos[posicaoAtual]);
    }
}

function carregarJogo(jogo) {
    document.getElementById('name').value = jogo.name;
    document.getElementById('platform').value = jogo.platform;
    
    const resultadoPesquisa = document.getElementById('resultadoPesquisa');
    resultadoPesquisa.innerHTML = `
        <h3>ID: ${jogo.id}</h3>
        <img src="data:thumbnail/jpeg;base64,${jogo.thumbnail}" alt="Imagem do Jogo">
    `;
}