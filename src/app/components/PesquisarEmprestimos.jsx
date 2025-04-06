import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
    FaSearch,
    FaFilter,
    FaCalendarAlt,
    FaIdCard,
    FaMoneyBillWave,
    FaExclamationTriangle,
    FaCheckCircle,
    FaHourglassHalf,
    FaArrowLeft
} from 'react-icons/fa';
import "../css/PesquisarEmprestimos.css";
import EmprestimoPesquisaService from "../services/EmprestimoPesquisaService";
import BotaoSair from "./BotaoSair";

const PesquisarEmprestimos = () => {
    const navigate = useNavigate();
    const [dataVencimento, setDataVencimento] = useState("");
    const [cpf, setCpf] = useState("");
    const [statusFiltro, setStatusFiltro] = useState("");
    const [emprestimos, setEmprestimos] = useState([]);
    const [resumoEmprestimos, setResumoEmprestimos] = useState(null);
    const [pesquisaRealizada, setPesquisaRealizada] = useState(false);
    const [carregando, setCarregando] = useState(false);
    const [erro, setErro] = useState("");

    // Instanciar o serviço
    const emprestimoPesquisaService = new EmprestimoPesquisaService();

    const handlePesquisar = async () => {
        console.log('[LOG] Iniciando pesquisa de empréstimos');
        console.log('[LOG] Valores dos filtros:', { dataVencimento, cpf, statusFiltro });

        setCarregando(true);
        setErro("");

        try {
            // Validar CPF se fornecido
            if (cpf && cpf.replace(/\D/g, '').length < 11) {
                console.log('[LOG] CPF inválido:', cpf);
                setErro("CPF inválido. Por favor, digite um CPF completo.");
                setCarregando(false);
                return;
            }

            // Formatar CPF (remover caracteres não numéricos)
            const cpfFormatado = cpf ? cpf.replace(/\D/g, '') : null;
            console.log('[LOG] CPF após formatação:', cpfFormatado);

            console.log('[LOG] Chamando serviço de pesquisa com parâmetros:', {
                dataVencimento,
                cpfFormatado,
                statusFiltro
            });

            // Chamar a API com os filtros fornecidos
            const resultado = await emprestimoPesquisaService.pesquisarEmprestimos(
                dataVencimento,
                cpfFormatado,
                statusFiltro
            );

            console.log('[LOG] Resultados recebidos:', resultado);
            console.log('[LOG] Tipo dos resultados:', typeof resultado);
            console.log('[LOG] É array?', Array.isArray(resultado));

            // Verificar se o resultado é um array de empréstimos diretamente ou está dentro de um objeto
            let emprestimosArray = [];
            let resumo = null;

            if (Array.isArray(resultado)) {
                console.log('[LOG] Resultado é um array');
                emprestimosArray = resultado;
            } else if (resultado && resultado.emprestimos && Array.isArray(resultado.emprestimos)) {
                console.log('[LOG] Resultado contém array de empréstimos dentro do objeto');
                emprestimosArray = resultado.emprestimos;
                // Extrair informações de resumo
                resumo = {
                    totalEmprestimos: resultado.totalEmprestimos,
                    valorTotalEmprestado: resultado.valorTotalEmprestado,
                    valorTotalComJuros: resultado.valorTotalComJuros,
                    lucroTotal: resultado.lucroTotal
                };
            }

            console.log('[LOG] Empréstimos após processamento:', emprestimosArray);
            console.log('[LOG] Resumo extraído:', resumo);
            console.log('[LOG] Número de empréstimos:', emprestimosArray.length);

            setEmprestimos(emprestimosArray);
            setResumoEmprestimos(resumo);
            setPesquisaRealizada(true);

            // Verificar se existem resultados
            if (emprestimosArray.length === 0) {
                console.log('[LOG] Nenhum resultado encontrado');
                setErro("Nenhum empréstimo encontrado com os critérios especificados.");
            } else {
                console.log('[LOG] Dados do primeiro resultado:', emprestimosArray[0]);
                // Limpar qualquer erro anterior se encontrou resultados
                setErro("");
            }
        } catch (error) {
            console.error("[LOG] Erro completo na pesquisa:", error);

            // Log detalhado do erro
            if (error.response) {
                console.log('[LOG] Status do erro:', error.response.status);
                console.log('[LOG] Headers da resposta:', error.response.headers);
                console.log('[LOG] Dados do erro:', error.response.data);
            } else if (error.request) {
                console.log('[LOG] Erro na requisição (sem resposta):', error.request);
            } else {
                console.log('[LOG] Erro de configuração da requisição:', error.message);
            }
            console.log('[LOG] Configuração completa do erro:', error.config);

            // Mensagem de erro mais específica baseada no tipo de erro
            const mensagemErro = error.response?.status === 401
                ? "Sessão expirada. Por favor, faça login novamente."
                : error.response?.status === 403
                    ? "Você não tem permissão para realizar esta operação."
                    : error.response?.data?.message || error.message || "Ocorreu um erro ao pesquisar empréstimos.";

            console.log('[LOG] Mensagem de erro definida:', mensagemErro);
            setErro(mensagemErro);
            setEmprestimos([]);
        } finally {
            console.log('[LOG] Finalizando processo de pesquisa');
            setCarregando(false);
        }
    };

    const formatarData = (dataString) => {
        // Verificar se dataString existe
        if (!dataString) {
            return "Data não disponível";
        }

        try {
            // Converter para Date se for uma string
            const data = new Date(dataString);

            // Verificar se a data é válida
            if (isNaN(data.getTime())) {
                console.log('[LOG] Data inválida:', dataString);
                return "Data inválida";
            }

            // Formatar a data para o padrão brasileiro (DD/MM/AAAA)
            return data.toLocaleDateString('pt-BR', {
                day: '2-digit',
                month: '2-digit',
                year: 'numeric'
            });
        } catch (error) {
            console.error('[LOG] Erro ao formatar data:', error, dataString);
            return "Erro na data";
        }
    };

    const formatarValor = (valor) => {
        // Verificar se valor é um número ou pode ser convertido para número
        if (valor === null || valor === undefined || isNaN(Number(valor))) {
            return 'R$ 0,00';
        }

        // Converter para número se for string
        const valorNumerico = typeof valor === 'string' ? parseFloat(valor) : valor;

        // Formatar usando toLocaleString
        return valorNumerico.toLocaleString('pt-BR', {
            style: 'currency',
            currency: 'BRL'
        });
    };

    const formatarCpf = (cpf) => {
        if (!cpf) return '';

        // Remove caracteres não numéricos
        const cpfNumerico = cpf.replace(/\D/g, '');

        // Aplica a formatação padrão do CPF: 000.000.000-00
        return cpfNumerico
            .replace(/(\d{3})(\d)/, "$1.$2")
            .replace(/(\d{3})(\d)/, "$1.$2")
            .replace(/(\d{3})(\d{1,2})$/, "$1-$2");
    };

    const getStatusBadgeClass = (status) => {
        if (!status) return 'badge-status';

        switch (status.toUpperCase()) {
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
        if (!status) return null;

        switch (status.toUpperCase()) {
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
            <button
                onClick={() => navigate('/home')}
                className="btn-nav"
            >
                <FaArrowLeft className="me-2"/>
                <span>Voltar</span>
            </button>
            <BotaoSair/>
            <div className="container py-3">
                {/* Header com estilo melhorado */}
                <div className="header-container mb-4">
                    <div className="d-flex justify-content-between align-items-center">
                        <h2 className="page-title">
                            <FaMoneyBillWave className="me-2 money-icon"/>
                            <span>Pesquisar Empréstimos</span>
                        </h2>
                    </div>
                </div>

                {/* Formulário de pesquisa com estilos aprimorados */}
                <div className="search-card">
                    <div className="search-form p-4">
                        <div className="row g-3 mb-4">
                            <div className="col-lg-3 col-md-6">
                                <label className="form-label text-muted mb-1">Data de Vencimento</label>
                                <div className="input-group custom-input">
                                    <span className="input-group-text">
                                        <FaCalendarAlt/>
                                    </span>
                                    <input
                                        type="date"
                                        className="form-control"
                                        placeholder="dd/mm/aaaa"
                                        value={dataVencimento}
                                        onChange={(e) => setDataVencimento(e.target.value)}
                                    />
                                </div>
                            </div>
                            <div className="col-lg-3 col-md-6">
                                <label className="form-label text-muted mb-1">CPF do Cliente</label>
                                <div className="input-group custom-input">
                                    <span className="input-group-text">
                                        <FaIdCard/>
                                    </span>
                                    <input
                                        type="text"
                                        className="form-control"
                                        placeholder="CPF do Cliente"
                                        value={cpf}
                                        onChange={(e) => setCpf(e.target.value)}
                                    />
                                </div>
                            </div>
                            <div className="col-lg-3 col-md-4">
                                <label className="form-label text-muted mb-1">Status do Empréstimo</label>
                                <div className="input-group custom-input">
                                    <span className="input-group-text">
                                        <FaFilter/>
                                    </span>
                                    <select
                                        className="form-select"
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

                        <div className="text-center">
                            <button
                                className="btn-search"
                                onClick={handlePesquisar}
                                disabled={carregando}
                            >
                                {carregando ? (
                                    <>
                                        <span className="spinner-border spinner-border-sm me-2" role="status"
                                              aria-hidden="true"></span>
                                        <span>Pesquisando...</span>
                                    </>
                                ) : (
                                    <>
                                        <FaSearch className="me-2"/>
                                        <span>Pesquisar</span>
                                    </>
                                )}
                            </button>
                        </div>
                    </div>
                </div>

                {/* Mensagem de erro */}
                {erro && (
                    <div className="alert alert-danger shadow-sm" role="alert">
                        <div className="d-flex align-items-center">
                            <FaExclamationTriangle className="me-2 flex-shrink-0"/>
                            <span>{erro}</span>
                        </div>
                    </div>
                )}

                {/* Resultados */}
                {pesquisaRealizada && emprestimos.length > 0 && (
                    <div className="result-card">
                        <div className="result-header">
                            <div className="d-flex justify-content-between align-items-center">
                                <h5 className="mb-0 fw-bold">Resultados da Pesquisa</h5>
                                <span className="result-badge">
                                    {emprestimos.length} empréstimo(s)
                                </span>
                            </div>
                        </div>

                        <div className="card-body p-4">
                            {/* Resumo */}
                            {resumoEmprestimos && (
                                <div className="mb-4">
                                    <h6 className="text-muted mb-3">Resumo da Pesquisa</h6>
                                    <div className="row g-3">
                                        <div className="col-lg-3 col-md-6 col-sm-6">
                                            <div className="resume-card">
                                                <div className="card-body text-center p-3">
                                                    <h4 className="text-primary mb-2 fw-bold">
                                                        {formatarValor(resumoEmprestimos.valorTotalEmprestado)}
                                                    </h4>
                                                    <p className="text-muted small mb-0">Total Emprestado</p>
                                                </div>
                                            </div>
                                        </div>
                                        <div className="col-lg-3 col-md-6 col-sm-6">
                                            <div className="resume-card">
                                                <div className="card-body text-center p-3">
                                                    <h4 className="text-success mb-2 fw-bold">
                                                        {formatarValor(resumoEmprestimos.valorTotalComJuros)}
                                                    </h4>
                                                    <p className="text-muted small mb-0">Total com Juros</p>
                                                </div>
                                            </div>
                                        </div>
                                        <div className="col-lg-3 col-md-6 col-sm-6">
                                            <div className="resume-card">
                                                <div className="card-body text-center p-3">
                                                    <h4 className="text-danger mb-2 fw-bold">
                                                        {formatarValor(resumoEmprestimos.lucroTotal)}
                                                    </h4>
                                                    <p className="text-muted small mb-0">Lucro Previsto</p>
                                                </div>
                                            </div>
                                        </div>
                                        <div className="col-lg-3 col-md-6 col-sm-6">
                                            <div className="resume-card">
                                                <div className="card-body text-center p-3">
                                                    <h4 className="text-info mb-2 fw-bold">
                                                        {resumoEmprestimos.totalEmprestimos}
                                                    </h4>
                                                    <p className="text-muted small mb-0">Total de Empréstimos</p>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* Tabela */}
                            <div className="table-responsive">
                                <table className="table-emprestimos">
                                    <thead>
                                    <tr>
                                        <th scope="col">#</th>
                                        <th scope="col">Cliente</th>
                                        <th scope="col">CPF</th>
                                        <th scope="col">Data Empréstimo</th>
                                        <th scope="col">Vencimento</th>
                                        <th scope="col">Valor</th>
                                        <th scope="col">Valor c/ Juros</th>
                                        <th scope="col">Status</th>
                                    </tr>
                                    </thead>
                                    <tbody>
                                    {emprestimos.map((emp) => (
                                        <tr key={emp.id || 'sem-id-' + Math.random()}>
                                            <td>{emp.id || '-'}</td>
                                            <td>{emp.nomeCliente || emp.cliente || '-'}</td>
                                            <td>{formatarCpf(emp.cpfCliente || emp.cpf || '')}</td>
                                            <td>{formatarData(emp.dataEmprestimo || emp.data_emprestimo)}</td>
                                            <td>{formatarData(emp.dataVencimento || emp.data_vencimento)}</td>
                                            <td>{formatarValor(emp.valorEmprestimo || emp.valor_emprestimo || 0)}</td>
                                            <td>{formatarValor(emp.valorComJuros || emp.valor_com_juros || 0)}</td>
                                            <td>
                                                    <span
                                                        className={`badge-status ${getStatusBadgeClass(emp.statusPagamento || emp.status_pagamento || 'DESCONHECIDO')}`}>
                                                        {getStatusIcon(emp.statusPagamento || emp.status_pagamento || 'DESCONHECIDO')} {emp.statusPagamento || emp.status_pagamento || 'DESCONHECIDO'}
                                                    </span>
                                            </td>
                                        </tr>
                                    ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>
                )}

                {/* Sem resultados */}
                {pesquisaRealizada && emprestimos.length === 0 && !erro && (
                    <div className="alert alert-warning shadow-sm" role="alert">
                        <div className="d-flex align-items-center">
                            <FaExclamationTriangle className="me-2 flex-shrink-0"/>
                            <span>Nenhum empréstimo encontrado com os critérios especificados.</span>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default PesquisarEmprestimos;