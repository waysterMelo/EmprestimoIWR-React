import axios from "axios";
import { getToken } from './AuthService';

const api_url = process.env.REACT_APP_API_URL;

if (!api_url) {
    throw new Error("A URL base da API não foi fornecida e REACT_APP_API_URL não está definida.");
}

class ClientesServices {
    constructor(baseUrl = api_url) {
        this.API_URL = baseUrl;
    }

    getAuthHeaders() {
        const token = localStorage.getItem("token");
        return {
            Authorization: `Bearer ${token}`,
        };
    }

    async cadastrarCliente(dados, foto) {
        try {
            const formData = new FormData();
            Object.entries(dados).forEach(([key, value]) => {
                if (value !== null && value !== undefined) {
                    formData.append(key, value.toString());
                }
            });
            if (foto) {
                formData.append("foto", foto);
            }

            const response = await axios.post(`${this.API_URL}/clientes`, formData, {
                headers: this.getAuthHeaders()
            });

            return response.data;
        } catch (error) {
            const errorMessage = error.response
                ? `Erro ${error.response.status}: ${error.response.data.message || error.message}`
                : `Erro ao conectar com a API: ${error.message}`;
            console.error("Erro ao cadastrar cliente:", errorMessage);
            throw new Error(errorMessage);
        }
    }

    async atualizarCliente(id, cliente) {
        try {
            const response = await axios.put(`${this.API_URL}/clientes/${id}`, cliente, {
                headers: this.getAuthHeaders()
            });
            return response.data;
        } catch (error) {
            throw new Error(error.response?.data?.message || 'Erro ao atualizar cliente.');
        }
    }

    async excluirCliente(id) {
        try {
            const response = await axios.delete(`${this.API_URL}/clientes/${id}`, {
                headers: this.getAuthHeaders()
            });
            return response.data;
        } catch (error) {
            throw new Error(error.response?.data?.message || 'Erro ao excluir cliente.');
        }
    }

    async buscarClientePorCpf(cpf) {
        const response = await axios.get(`http://localhost:8080/clientes/buscar-por-cpf/${cpf}`, {
            headers: {
                Authorization: `Bearer ${getToken()}`,
            }
        });
        return response;
    }

}

export default ClientesServices;
