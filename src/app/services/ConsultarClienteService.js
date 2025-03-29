import axios from "axios";

const API_BASE_URL = "http://localhost:8080";

// Recupera o token do localStorage e monta o header
const getAuthHeader = () => {
    const token = localStorage.getItem("token");
    return {
        Authorization: `Bearer ${token}`
    };
};

// Busca cliente e seus empréstimos por CPF
const buscarClienteComEmprestimosPorCpf = (cpf) => {
    return axios.get(`${API_BASE_URL}/clientes/buscar-com-emprestimos/${cpf}`, {
        headers: getAuthHeader()
    });
};

// Quita um empréstimo
const quitarEmprestimo = (emprestimoId) => {
    return axios.put(`${API_BASE_URL}/emprestimo/baixa/${emprestimoId}`, {}, {
        headers: getAuthHeader()
    });
};

// Realiza pagamento parcial
const pagarParcialmente = (emprestimoId, valor) => {
    return axios.put(
        `http://localhost:8080/emprestimo/${emprestimoId}/pagar-parcialmente`,
        { valorPago: valor },
        {
            headers: {
                Authorization: `Bearer ${localStorage.getItem("token")}`,
                'Content-Type': 'application/json'
            }
        }
    );
};

// Busca foto do cliente por CPF
const buscarFotoCliente = (cpf) => {
    return axios.get(`${API_BASE_URL}/clientes/foto/${cpf}`, {
        headers: getAuthHeader(),
        responseType: "blob", // importante para lidar com imagem
    });
};

// Exporta os métodos agrupados
const ConsultarClienteService = {
    buscarClienteComEmprestimosPorCpf,
    quitarEmprestimo,
    pagarParcialmente,
    buscarFotoCliente
};

export default ConsultarClienteService;
