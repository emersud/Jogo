package com.emersud.demo.services;

import java.io.IOException;
import java.util.List;
import java.util.Optional;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import com.emersud.demo.entities.Jogo;
import com.emersud.demo.repositories.JogoRepository;

@Service
public class JogoService {

	private final JogoRepository jogoRepository;

	@Autowired
	public JogoService(JogoRepository jogoRepository) {
		this.jogoRepository = jogoRepository;

	}

	public Jogo getJogoById(Long id) {
		return jogoRepository.findById(id).orElse(null);
	}

	public List<Jogo> getAllJogos() {
		return jogoRepository.findAll();
	}

	public Jogo saveJogo(Jogo jogo) {
		return jogoRepository.save(jogo);
	}

	public void deleteJogo(Long id) {
		jogoRepository.deleteById(id);
	}

	public Jogo updateJogo(Long id, Jogo novoJogo, MultipartFile thumbnail) {
		Optional<Jogo> jogoOptional = jogoRepository.findById(id);

		if (jogoOptional.isPresent()) {
			Jogo jogoExistente = jogoOptional.get();
			jogoExistente.setName(novoJogo.getName());
			jogoExistente.setPlatform(novoJogo.getPlatform());
			jogoExistente.setPrice(novoJogo.getPrice());
			jogoExistente.setCategory(novoJogo.getCategory());			

			// Atualiza a thumbnail apenas se um novo arquivo for enviado
			if (thumbnail != null && !thumbnail.isEmpty()) {
				try {
					byte[] imageBytes = thumbnail.getBytes();
					jogoExistente.setThumbnail(imageBytes);
				} catch (IOException e) {
					throw new RuntimeException("Erro ao processar a imagem", e);
				}
			}

			return jogoRepository.save(jogoExistente);
		} else {
			return null;
		}
	}

}
