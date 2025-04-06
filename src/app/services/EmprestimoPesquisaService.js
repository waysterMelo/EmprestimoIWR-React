import axios from "axios";
import { getToken } from "./AuthService";

const API_URL = process.env.REACT_APP_API_URL || "http://localhost:8080";

class EmprestimoPesquisaService {

    /**
     * Pesquisa empréstimos com base nos filtros fornecidos
     * @param {string} dataVencimento - Data de vencimento no formato ISO (opcional)
     * @param {string} cpf - CPF do cliente (opcional)
     * @param {string} statusPagamento - Status do pagamento (PAGO, PENDENTE, ATRASADO) (opcional)
     * @returns {Promise} Promise contendo os resultados da pesquisa
     */
    async pesquisarEmprestimos(dataVencimento = null, cpf = null, statusPagamento = null) {
        try {
            // Construindo os parâmetros da query
            const params = {};

            if (dataVencimento) {
                // Garantir o formato ISO para a data
                const date = new Date(dataVencimento);
                const isoDate = date.toISOString().split('T')[0];
                params.dataVencimento = isoDate;
                console.log('[LOG] Data de vencimento formatada:', isoDate);
            }

            if (cpf) {
                params.cpf = cpf;
                console.log('[LOG] CPF enviado:', cpf);
            }

            if (statusPagamento) {
                params.statusPagamento = statusPagamento;
                console.log('[LOG] Status de pagamento enviado:', statusPagamento);
            }

            // Log da URL completa e parâmetros sendo enviados
            const requestUrl = `${API_URL}/pesquisar`;
            console.log('[LOG] Fazendo requisição para:', requestUrl);
            console.log('[LOG] Parâmetros da requisição:', params);
            console.log('[LOG] Token de autenticação presente:', !!getToken());

            // Tentativa 1: endpoint /pesquisar
            try {
                console.log('[LOG] Tentando endpoint: /pesquisar');
                const response = await axios.get(`${API_URL}/pesquisar`, {
                    params,
                    headers: {
                        Authorization: `Bearer ${getToken()}`
                    }
                });

                console.log('[LOG] Resposta recebida do endpoint /pesquisar:', response);
                console.log('[LOG] Status da resposta:', response.status);
                console.log('[LOG] Dados recebidos:', response.data);

                // Verificar formato da resposta
                if (response.data && Array.isArray(response.data)) {
                    console.log('[LOG] Retornando array de resposta diretamente');
                    return response.data;
                } else if (response.data && response.data.content && Array.isArray(response.data.content)) {
                    console.log('[LOG] Retornando content da resposta paginada');
                    return response.data.content;
                } else if (response.data && response.data.emprestimos && Array.isArray(response.data.emprestimos)) {
                    console.log('[LOG] Retornando array de emprestimos do objeto de resposta');
                    return response.data.emprestimos;
                } else {
                    console.log('[LOG] Formato de resposta não reconhecido, retornando dados como estão');
                    return response.data || [];
                }
            } catch (error) {
                console.log('[LOG] Erro no endpoint /pesquisar:', error.message);
                console.log('[LOG] Código de status (se disponível):', error.response?.status);
                console.log('[LOG] Dados de erro (se disponível):', error.response?.data);

                // Se o primeiro endpoint falhar, tente o segundo
                console.log('[LOG] Tentando endpoint alternativo: /emprestimo/pesquisar');
                const response = await axios.get(`${API_URL}/emprestimo/pesquisar`, {
                    params,
                    headers: {
                        Authorization: `Bearer ${getToken()}`
                    }
                });

                console.log('[LOG] Resposta recebida do endpoint alternativo:', response);
                console.log('[LOG] Status da resposta:', response.status);
                console.log('[LOG] Dados recebidos:', response.data);

                // Verificar formato da resposta
                if (response.data && Array.isArray(response.data)) {
                    console.log('[LOG] Retornando array de resposta diretamente');
                    return response.data;
                } else if (response.data && response.data.content && Array.isArray(response.data.content)) {
                    console.log('[LOG] Retornando content da resposta paginada');
                    return response.data.content;
                } else {
                    console.log('[LOG] Formato de resposta não reconhecido, retornando dados como estão');
                    return response.data || [];
                }
            }
        } catch (error) {
            console.log('[LOG] Erro capturado no serviço:', error);

            if (error.response) {
                console.log('[LOG] Erro de resposta da API:');
                console.log('[LOG] Status:', error.response.status);
                console.log('[LOG] Data:', error.response.data);
                console.log('[LOG] Headers:', error.response.headers);
            } else if (error.request) {
                console.log('[LOG] Erro na requisição (não recebeu resposta):');
                console.log('[LOG] Request:', error.request);
            } else {
                console.log('[LOG] Erro na configuração da requisição:', error.message);
            }

            // Verificar erros específicos
            if (error.code === 'ERR_NETWORK') {
                console.log('[LOG] Erro de rede detectado. API pode estar inacessível.');
            }

            const errorMessage = error.response
                ? `Erro ${error.response.status}: ${error.response.data?.message || error.message}`
                : `Erro ao conectar com a API: ${error.message}`;
            console.error("Erro ao pesquisar empréstimos:", errorMessage);

            // Verifica se estamos tentando o endpoint alternativo
            if (!error.isSecondAttempt) {
                console.log('[LOG] Tentando endpoint alternativo após erro');
                const err = new Error(errorMessage);
                err.isSecondAttempt = true;
                throw err;
            }

            throw new Error(errorMessage);
        }
    }

    // Método auxiliar para inspecionar o token JWT (útil para debug)
    decodeJWT(token) {
        try {
            if (!token) {
                console.log('[LOG] Token não fornecido');
                return null;
            }

            const parts = token.split('.');
            if (parts.length !== 3) {
                console.log('[LOG] Token não tem formato JWT válido');
                return null;
            }

            const decoded = JSON.parse(atob(parts[1]));
            console.log('[LOG] Token decodificado:', decoded);
            console.log('[LOG] Expiração:', new Date(decoded.exp * 1000).toLocaleString());
            console.log('[LOG] Tempo restante:', Math.floor((decoded.exp * 1000 - Date.now()) / 1000 / 60), 'minutos');

            return decoded;
        } catch (e) {
            console.log('[LOG] Erro ao decodificar token:', e);
            return null;
        }
    }
}

export default EmprestimoPesquisaService;