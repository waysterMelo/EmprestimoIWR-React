import React, { useState, useEffect } from "react";
import { DollarSign, ArrowLeft, Search, Save } from "lucide-react";
import { useNavigate } from "react-router-dom";
import EmprestimoServices from "../services/EmprestimoServices";
import ClientesServices from "../services/ClientesServices";
import "../css/CadastrarClientes.css";
import BotaoSair from "./BotaoSair";

const RealizarEmprestimo = () => {
    const navigate = useNavigate();
    const emprestimoService = new EmprestimoServices();
    const clientesService = new ClientesServices();

    const [buscaCpf, setBuscaCpf] = useState("");
    const [cliente, setCliente] = useState(null);
    const [valor, setValor] = useState("");
    const [juros, setJuros] = useState("");
    const [valorFinal, setValorFinal] = useState(0);

    // Novo campo data de vencimento
    const [dataVencimento, setDataVencimento] = useState("");

    // Estados para modais de erro/sucesso
    const [showSuccessModal, setShowSuccessModal] = useState(false);
    const [showErrorModal, setShowErrorModal] = useState(false);
    const [successMessage, setSuccessMessage] = useState("");
    const [errorMessage, setErrorMessage] = useState("");

    const buscarClientePorCpf = async () => {
        try {
            const resultado = await clientesService.buscarClientePorCpf(buscaCpf);
            setCliente(resultado.data);
        } catch (error) {
            // Em vez de alert, chamamos modal de erro
            setErrorMessage("Cliente não encontrado pelo CPF.");
            setShowErrorModal(true);
            setCliente(null);
        }
    };

    const calcularValorFinal = () => {
        const valorNum = parseFloat(valor);
        const jurosNum = parseFloat(juros);
        if (!isNaN(valorNum) && !isNaN(jurosNum)) {
            setValorFinal(valorNum + (valorNum * jurosNum) / 100);
        } else {
            setValorFinal(0);
        }
    };

    useEffect(() => {
        calcularValorFinal();
    }, [valor, juros]);

    const handleSalvar = async () => {
        if (!cliente || valorFinal <= 0 || !dataVencimento) {
            setErrorMessage("Complete corretamente todas as informações antes de salvar.");
            setShowErrorModal(true);
            return;
        }

        const payload = {
            clienteId: cliente.id,
            valorEmprestimo: parseFloat(valor),
            taxaJuros: parseFloat(juros) / 100,
            valorComJuros: valorFinal,
            dataVencimento,

        };

        try {
            await emprestimoService.realizarEmprestimo(payload);
            setSuccessMessage("Empréstimo realizado com sucesso!");
            setShowSuccessModal(true);

            // Reset de campos
            setCliente(null);
            setBuscaCpf("");
            setValor("");
            setJuros("");
            setValorFinal(0);
            setDataVencimento("");
        } catch (error) {
            setErrorMessage("Erro ao realizar empréstimo: " + error.message);
            setShowErrorModal(true);
        }
    };

    return (
        <div className="container-fluid py-5 background">
            <div className="row justify-content-center">
                <div className="col-md-8 col-lg-12">
                    <BotaoSair />
                    <button
                        onClick={() => navigate('/home')}
                        className="btn btn-dark position-absolute top-0 start-0 m-3 d-flex align-items-center"
                        style={{zIndex: 10}}
                    >
                        <ArrowLeft size={20} className="me-2 text-info"/>
                        Tela Inicial
                    </button>
                    <div className="card shadow-lg border-0 rounded-lg position-relative">
                        <div className="bg-gradient-primary text-white text-center py-3">
                            <DollarSign size={48} className="mb-2"/>
                            <h2 className="display-6 mb-0 text-dark">Realizar Empréstimo</h2>
                        </div>

                        <div className="card-body p-4">
                            {/* Campos de busca */}
                            <div className="row mb-3 justify-content-center">
                                <div className="col-md-6">
                                    <div className="input-group">
                                        <input
                                            type="text"
                                            className="form-control"
                                            placeholder="Buscar por CPF"
                                            value={buscaCpf}
                                            onChange={(e) => setBuscaCpf(e.target.value)}
                                        />
                                        <button className="btn btn-primary" onClick={buscarClientePorCpf}>
                                            <Search size={20}/>
                                        </button>
                                    </div>
                                </div>
                            </div>

                            {/* Campos do cliente pesquisado */}
                            {cliente && (
                                <div className="row mb-3">
                                    <div className="col-md-3">
                                        <label htmlFor="nomeCliente" className="form-label">
                                            Nome do Cliente
                                        </label>
                                        <input
                                            type="text"
                                            id="nomeCliente"
                                            className="form-control"
                                            value={cliente.nome}
                                            readOnly
                                        />
                                    </div>

                                    <div className="col-md-3">
                                        <label htmlFor="idCliente" className="form-label">
                                            ID do Cliente
                                        </label>
                                        <input
                                            type="text"
                                            id="idCliente"
                                            className="form-control"
                                            value={cliente.id}
                                            disabled
                                        />
                                    </div>

                                    <div className="col-md-3">
                                        <label htmlFor="cpfCliente" className="form-label">
                                            CPF do Cliente
                                        </label>
                                        <input
                                            type="text"
                                            id="cpfCliente"
                                            className="form-control"
                                            value={cliente.cpf}
                                            readOnly
                                        />
                                    </div>

                                    <div className="col-md-3">
                                        <label htmlFor="telefoneCliente" className="form-label">
                                            Telefone do Cliente
                                        </label>
                                        <input
                                            type="text"
                                            id="telefoneCliente"
                                            className="form-control"
                                            value={cliente.telefone}
                                            readOnly
                                        />
                                    </div>
                                </div>
                            )}

                            {/* Campo Data de Vencimento */}
                            <label htmlFor="dataVencimento" className="form-label mt-2">
                                Data de Vencimento
                            </label>
                            <input
                                type="date"
                                id="dataVencimento"
                                className="form-control mb-3"
                                value={dataVencimento}
                                onChange={(e) => setDataVencimento(e.target.value)}
                            />

                            {/* Campos de valor e juros */}
                            <input
                                type="number"
                                className="form-control mb-2"
                                placeholder="Valor a emprestar"
                                value={valor}
                                onChange={(e) => setValor(e.target.value)}
                            />

                            <input
                                type="number"
                                className="form-control mb-2"
                                placeholder="Juros (%)"
                                value={juros}
                                onChange={(e) => setJuros(e.target.value)}
                            />

                            <div className="alert alert-success text-center mb-3">
                                Valor Total com Juros: <strong>R$ {valorFinal.toFixed(2)}</strong>
                            </div>

                            <button className="btn btn-success w-100" onClick={handleSalvar}>
                                <Save size={20} className="me-2"/> Salvar Empréstimo
                            </button>
                        </div>

                        <div className="card-footer text-center bg-light py-3">
                            <small className="text-muted">
                                Os dados do empréstimo estão sujeitos às políticas internas da empresa.
                            </small>
                        </div>
                    </div>
                </div>
            </div>

            {/* Modal de Sucesso */}
            {showSuccessModal && (
                <div className="modal fade show" tabIndex="-1" style={{display: "block"}}>
                    <div className="modal-dialog">
                        <div className="modal-content">
                            <div className="modal-header">
                                <h5 className="modal-title">Sucesso</h5>
                                <button
                                    type="button"
                                    className="btn-close"
                                    onClick={() => setShowSuccessModal(false)}
                                    aria-label="Close"
                                ></button>
                            </div>
                            <div className="modal-body">
                                <p>{successMessage}</p>
                            </div>
                            <div className="modal-footer">
                                <button
                                    type="button"
                                    className="btn btn-primary"
                                    onClick={() => setShowSuccessModal(false)}
                                >
                                    OK
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Modal de Erro */}
            {showErrorModal && (
                <div className="modal fade show" tabIndex="-1" style={{ display: "block" }}>
                    <div className="modal-dialog">
                        <div className="modal-content">
                            <div className="modal-header">
                                <h5 className="modal-title">Atenção</h5>
                                <button
                                    type="button"
                                    className="btn-close"
                                    onClick={() => setShowErrorModal(false)}
                                    aria-label="Close"
                                ></button>
                            </div>
                            <div className="modal-body">
                                <p>{errorMessage}</p>
                            </div>
                            <div className="modal-footer">
                                <button
                                    type="button"
                                    className="btn btn-danger"
                                    onClick={() => setShowErrorModal(false)}
                                >
                                    Fechar
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default RealizarEmprestimo;
