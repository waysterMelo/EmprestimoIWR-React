import axios from 'axios';
import { getToken } from "./AuthService"

class EmprestimoServices {


    async realizarEmprestimo(dadosEmprestimo) {
        try {
            const response = await axios.post('/emprestimo', dadosEmprestimo, {
                headers: {
                    Authorization: `Bearer ${getToken()}`
                }

            });
            return response.data;
        } catch (error) {
            throw new Error(error.response?.data?.message || 'Erro ao realizar empréstimo.');
        }
    }


}
export default EmprestimoServices;
