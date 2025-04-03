import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { format } from 'date-fns';
import { FaSearch, FaFilter, FaCalendarAlt, FaIdCard, FaMoneyBillWave, FaExclamationTriangle, FaCheckCircle, FaHourglassHalf } from 'react-icons/fa';
import "../css/PesquisarEmprestimos.css";

const PesquisarEmprestimos = () => {
    const navigate = useNavigate();
    const [dataVencimento, setDataVencimento] = useState("");
    const [cpf, setCpf] = useState("");
    const [statusFiltro, setStatusFiltro] = useState("");
    const [emprestimos, setEmprestimos] = useState([]);
    const [pesquisaRealizada, setPesquisaRealizada] = useState(false);
    const [carregando, setCarregando] = useState(false);

    // Dados simulados para testar a interface (remover na implementação final)
    const dadosSimulados = [
        { id: 1, cliente: "João Silva", cpf: "123.456.789-00", data_emprestimo: "2025-03-18", data_vencimento: "2025-04-02",
            valor_emprestimo: 900, valor_com_juros: 1250, status_pagamento: "PAGO", taxa_juros: 0.4 },
        { id: 2, cliente: "Maria Sousa", cpf: "987.654.321-00", data_emprestimo: "2025-03-18", data_vencimento: "2025-03-29",
            valor_emprestimo: 50, valor_com_juros: 70, status_pagamento: "PAGO", taxa_juros: 0.4 },
        { id: 3, cliente: "Carlos Freitas", cpf: "456.789.123-00", data_emprestimo: "2025-03-22", data_vencimento: "2025-03-23",
            valor_emprestimo: 100, valor_com_juros: 60, status_pagamento: "PAGO", taxa_juros: 0.4 },
        { id: 4, cliente: "Ana Oliveira", cpf: "321.654.987-00", data_emprestimo: "2025-03-30", data_vencimento: "2025-03-31",
            valor_emprestimo: 100, valor_com_juros: 140, status_pagamento: "PENDENTE", taxa_juros: 0.4 },
        { id: 5, cliente: "Pedro Santos", cpf: "789.123.456-00", data_emprestimo: "2025-03-30", data_vencimento: "2025-03-31",
            valor_emprestimo: 200, valor_com_juros: 280, status_pagamento: "ATRASADO", taxa_juros: 0.4 }
    ];

    const handlePesquisar = () => {
        setCarregando(true);
        // Simular chamada à API
        setTimeout(() => {
            // Filtrar dados com base nos critérios de pesquisa
            let resultados = dadosSimulados;

            if (dataVencimento) {
                resultados = resultados.filter(emp => emp.data_vencimento === dataVencimento);
            }

            if (cpf) {
                resultados = resultados.filter(emp => emp.cpf.includes(cpf));
            }

            if (statusFiltro) {
                resultados = resultados.filter(emp => emp.status_pagamento === statusFiltro);
            }

            setEmprestimos(resultados);
            setPesquisaRealizada(true);
            setCarregando(false);
        }, 800);
    };

    const formatarData = (dataString) => {
        const partes = dataString.split('-');
        return `${partes[2]}/${partes[1]}/${partes[0]}`;
    };

    const formatarValor = (valor) => {
        return valor.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
    };

    const formatarCpf = (cpf) => {
        return cpf;
    };

    const getStatusBadgeClass = (status) => {
        switch (status) {
            case 'PAGO':
                return 'badge-ativo';
            case 'PENDENTE':
                return 'badge-pendente';
            case 'ATRASADO':
                return 'badge-atrasado';
            default:
                return 'badge-status';
        }
    };

    const getStatusIcon = (status) => {
        switch (status) {
            case 'PAGO':
                return <FaCheckCircle />;
            case 'PENDENTE':
                return <FaHourglassHalf />;
            case 'ATRASADO':
                return <FaExclamationTriangle />;
            default:
                return null;
        }
    };

    return (
        <div className="background-consultar">
            <div className="consultar-container">
                <div className="card-consultar">
                    <div className="header-consultar">
                        <h1><FaMoneyBillWave className="me-2" /> Pesquisar Empréstimos</h1>
                    </div>

                    <div className="p-4">
                        <div className="row mb-4">
                            <div className="col-md-4 mb-3 mb-md-0">
                                <div className="input-group">
                                    <span className="input-group-text"><FaCalendarAlt /></span>
                                    <input
                                        type="date"
                                        className="form-control"
                                        placeholder="Data de Vencimento"
                                        value={dataVencimento}
                                        onChange={(e) => setDataVencimento(e.target.value)}
                                    />
                                </div>
                            </div>
                            <div className="col-md-4 mb-3 mb-md-0">
                                <div className="input-group">
                                    <span className="input-group-text"><FaIdCard /></span>
                                    <input
                                        type="text"
                                        className="form-control"
                                        placeholder="CPF do Cliente"
                                        value={cpf}
                                        onChange={(e) => setCpf(e.target.value)}
                                    />
                                </div>
                            </div>
                            <div className="col-md-4">
                                <div className="input-group">
                                    <span className="input-group-text"><FaFilter /></span>
                                    <select
                                        className="form-control"
                                        value={statusFiltro}
                                        onChange={(e) => setStatusFiltro(e.target.value)}
                                    >
                                        <option value="">Todos os Status</option>
                                        <option value="PAGO">Pago</option>
                                        <option value="PENDENTE">Pendente</option>
                                        <option value="ATRASADO">Atrasado</option>
                                    </select>
                                </div>
                            </div>
                        </div>

                        <div className="text-center mb-4">
                            <button
                                className="btn-search"
                                onClick={handlePesquisar}
                                disabled={carregando}
                            >
                                {carregando ? (
                                    <>
                                        <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                                        Pesquisando...
                                    </>
                                ) : (
                                    <>
                                        <FaSearch className="me-2" /> Pesquisar
                                    </>
                                )}
                            </button>
                        </div>

                        {pesquisaRealizada && (
                            <div className="emprestimos-card">
                                <div className="emprestimos-header d-flex justify-content-between align-items-center">
                                    <h4>Resultados da Pesquisa</h4>
                                    <span className="badge bg-primary rounded-pill">
                                        {emprestimos.length} empréstimo(s) encontrado(s)
                                    </span>
                                </div>

                                {emprestimos.length > 0 ? (
                                    <div className="table-responsive">
                                        <table className="table-emprestimos">
                                            <thead>
                                            <tr>
                                                <th>#</th>
                                                <th>Cliente</th>
                                                <th>CPF</th>
                                                <th>Data Empréstimo</th>
                                                <th>Vencimento</th>
                                                <th>Valor</th>
                                                <th>Valor c/ Juros</th>
                                                <th>Status</th>
                                            </tr>
                                            </thead>
                                            <tbody>
                                            {emprestimos.map((emp) => (
                                                <tr key={emp.id}>
                                                    <td>{emp.id}</td>
                                                    <td>{emp.cliente}</td>
                                                    <td>{formatarCpf(emp.cpf)}</td>
                                                    <td>{formatarData(emp.data_emprestimo)}</td>
                                                    <td>{formatarData(emp.data_vencimento)}</td>
                                                    <td>{formatarValor(emp.valor_emprestimo)}</td>
                                                    <td>{formatarValor(emp.valor_com_juros)}</td>
                                                    <td>
                                                            <span className={`badge-status ${getStatusBadgeClass(emp.status_pagamento)}`}>
                                                                {getStatusIcon(emp.status_pagamento)} {emp.status_pagamento}
                                                            </span>
                                                    </td>
                                                </tr>
                                            ))}
                                            </tbody>
                                        </table>
                                    </div>
                                ) : (
                                    <div className="erro-mensagem">
                                        <FaExclamationTriangle className="me-2" />
                                        Nenhum empréstimo encontrado com os critérios especificados.
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default PesquisarEmprestimos;