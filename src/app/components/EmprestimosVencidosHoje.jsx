import React, { useEffect, useState } from 'react';
import axios from 'axios';

function EmprestimosVencidosHoje() {
    const [resumo, setResumo] = useState(null);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const response = await axios.get('http://localhost:8080/emprestimos/vencidos-hoje');
                setResumo(response.data);
            } catch (error) {
                console.error('Erro ao buscar empréstimos vencidos hoje:', error);
            }
        };
        fetchData();
    }, []);

    if (!resumo) {
        return <div>Carregando...</div>;
    }

    return (
        <div style={{ maxWidth: '600px', margin: '0 auto' }}>
            <h2>Empréstimos Vencidos Hoje</h2>
            <p><b>Total Emprestado:</b> R${resumo.valoresEmprestados}</p>
            <p><b>Total a Receber:</b> R${resumo.valoresAReceber}</p>
            <p><b>Lucro:</b> R${resumo.lucro}</p>

            <h3>Lista de Empréstimos</h3>
            <ul>
                {resumo.emprestimos.map((emp) => (
                    <li key={emp.id}>
                        Empréstimo #{emp.id} - Valor: R${emp.valorEmprestimo} - Vencimento: {emp.dataVencimento} - Status: {emp.statusPagamento}
                    </li>
                ))}
            </ul>
        </div>
    );
}

export default EmprestimosVencidosHoje;