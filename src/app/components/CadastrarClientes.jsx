import React, { useRef, useState } from "react";
import {
    DollarSign, User, Phone, Mail, CreditCard, Upload, X,
    MapPin, Home, Hash, CheckCircle, AlertCircle, UserPlus, ArrowLeft
} from "lucide-react";
import { Modal, Button, Alert } from "react-bootstrap";
import ClientesServices from "../services/ClientesServices";
import "../css/CadastrarClientes.css";
import {useNavigate} from "react-router-dom";
import BotaoSair from "./BotaoSair";

const CadastrarClientes = () => {
    const navigate = useNavigate();
    const service = useRef(new ClientesServices()).current;
    const [formData, setFormData] = useState({
        nome: "",
        email: "",
        telefone: "",
        cpf: "",
        limitePagamento: "",
        endereco: "",
        bairro: "",
        cidade: "",
        estado: "",
        numero: ""
    });
    const [foto, setFoto] = useState(null);
    const [previewFoto, setPreviewFoto] = useState(null);
    const [mensagem, setMensagem] = useState("");
    const [sucesso, setSucesso] = useState(false);
    const [modalAberto, setModalAberto] = useState(false);

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData({
            ...formData,
            [name]: value,
        });
    };

    const handleFotoChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setFoto(file);
            const reader = new FileReader();
            reader.onloadend = () => {
                setPreviewFoto(reader.result);
            };
            reader.readAsDataURL(file);
        }
    };

    const removerFoto = () => {
        setFoto(null);
        setPreviewFoto(null);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setMensagem("");
        setSucesso(false);
        setModalAberto(false);

        try {
            const response = await service.cadastrarCliente(formData, foto);
            setMensagem("Cliente cadastrado com sucesso!");
            setSucesso(true);
            setModalAberto(true);
            setFormData({
                nome: "",
                email: "",
                telefone: "",
                cpf: "",
                limitePagamento: "",
                endereco: "",
                bairro: "",
                cidade: "",
                estado: "",
                numero: ""
            });
            setFoto(null);
            setPreviewFoto(null);
        } catch (error) {
            setMensagem(error.message);
            setSucesso(false);
            setModalAberto(true);
        }
    };

    const fecharModal = () => {
        setModalAberto(false);
        setMensagem("");
    };

    const camposPessoais = [
        { id: "nome", label: "Nome Completo", icon: <User className="text-primary" size={20} /> },
        { id: "email", label: "E-mail", icon: <Mail className="text-danger" size={20} /> },
        { id: "telefone", label: "Telefone", icon: <Phone className="text-success" size={20} /> },
        { id: "cpf", label: "CPF", icon: <CreditCard className="text-info" size={20} /> },
        { id: "limitePagamento", label: "Limite de Pagamento", icon: <DollarSign className="text-warning" size={20} /> },
    ];

    const camposEndereco = [
        { id: "endereco", label: "Endereço", icon: <Home className="text-primary" size={20} /> },
        { id: "numero", label: "Número", icon: <Hash className="text-secondary" size={20} /> },
        { id: "bairro", label: "Bairro", icon: <MapPin className="text-danger" size={20} /> },
        { id: "cidade", label: "Cidade", icon: <MapPin className="text-success" size={20} /> },
        { id: "estado", label: "Estado", icon: <MapPin className="text-info" size={20} /> },
    ];

    const voltarTelaInicial = () => {
        navigate('/home');
    };

    return (
        <div className="container-fluid py-5 background">
            <div className="row justify-content-center">
                <div className="col-md-8 col-lg-6">
                  <BotaoSair />
                    <button
                        onClick={voltarTelaInicial}
                        className="btn btn-dark position-absolute top-0 start-0 m-3 d-flex align-items-center"
                        style={{ zIndex: 10 }}
                    >
                        <ArrowLeft size={20} className="me-2 text-info" />
                        Tela Inicial
                    </button>
                    <div className="card shadow-lg border-0 rounded-lg">
                        <div className="bg-gradient-primary text-white text-center">
                            <UserPlus size={48} className="mb-3" />
                            <h2 className="display-6 mb-0 text-dark">Cadastrar Novo Cliente</h2>
                        </div>
                        <div className="card-body p-4">
                            <form onSubmit={handleSubmit}>
                                {/* Foto Upload Section */}
                                <div className="text-center mb-4">
                                    <div className="position-relative d-inline-block">
                                        {previewFoto ? (
                                            <div className="position-relative">
                                                <img
                                                    src={previewFoto}
                                                    alt="Preview"
                                                    className="rounded-circle border border-primary shadow"
                                                    style={{ width: '180px', height: '180px', objectFit: 'cover' }}
                                                />
                                                <button
                                                    type="button"
                                                    className="btn btn-danger btn-sm position-absolute top-0 end-0 rounded-circle"
                                                    onClick={removerFoto}
                                                    aria-label="Remover foto"
                                                >
                                                    <X size={16} />
                                                </button>
                                            </div>
                                        ) : (
                                            <div className="bg-light rounded-circle d-flex flex-column justify-content-center align-items-center"
                                                 style={{ width: '180px', height: '180px', border: '2px dashed #6c757d' }}>
                                                <User size={64} className="text-muted" />
                                                <span className="text-muted">Foto do Cliente</span>
                                            </div>
                                        )}
                                        <label
                                            htmlFor="foto-upload"
                                            className="btn btn-outline-primary mt-3 d-block"
                                        >
                                            <Upload size={16} className="me-2" />
                                            Escolher Foto
                                            <input
                                                type="file"
                                                id="foto-upload"
                                                accept="image/*"
                                                onChange={handleFotoChange}
                                                className="d-none"
                                            />
                                        </label>
                                    </div>
                                </div>

                                {/* Personal Information Section */}
                                <div className="mb-4">
                                    <h5 className="border-bottom pb-2 mb-3 text-primary">
                                        <User size={24} className="me-2" />
                                        Informações Pessoais
                                    </h5>
                                    <div className="row g-3">
                                        {camposPessoais.map(({ id, label, icon }, index) => (
                                            <div key={index} className="col-md-6">
                                                <div className="input-group">
                                                    <span className="input-group-text bg-light border-end-0">
                                                        {icon}
                                                    </span>
                                                    <input
                                                        type="text"
                                                        className="form-control border-start-0 shadow-sm"
                                                        id={id}
                                                        name={id}
                                                        placeholder={label}
                                                        value={formData[id]}
                                                        onChange={handleInputChange}
                                                        required
                                                    />
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                {/* Address Information Section */}
                                <div className="mb-4">
                                    <h5 className="border-bottom pb-2 mb-3 text-primary">
                                        <MapPin size={24} className="me-2" />
                                        Informações de Endereço
                                    </h5>
                                    <div className="row g-3">
                                        {camposEndereco.map(({ id, label, icon }, index) => (
                                            <div key={index} className="col-md-6">
                                                <div className="input-group">
                                                    <span className="input-group-text bg-light border-end-0">
                                                        {icon}
                                                    </span>
                                                    <input
                                                        type="text"
                                                        className="form-control border-start-0 shadow-sm"
                                                        id={id}
                                                        name={id}
                                                        placeholder={label}
                                                        value={formData[id]}
                                                        onChange={handleInputChange}
                                                        required
                                                    />
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                {/* Submit Button */}
                                <div className="text-center">
                                    <button
                                        type="submit"
                                        className="btn btn-primary btn-lg shadow-sm d-flex align-items-center justify-content-center mx-auto"
                                    >
                                        <UserPlus size={20} className="me-2" />
                                        Cadastrar Cliente
                                    </button>
                                </div>
                            </form>
                        </div>
                        <div className="card-footer text-center bg-light py-3">
                            <small className="text-muted">
                                Seus dados estão protegidos de acordo com nossa política de privacidade.
                            </small>
                        </div>
                    </div>
                </div>
            </div>

            {/* Modal for Success/Error */}
            <Modal show={modalAberto} onHide={fecharModal} centered size="lg">
                <Modal.Header className={sucesso ? "bg-success text-white" : "bg-danger text-white"} closeButton>
                    <Modal.Title>{sucesso ? "Sucesso" : "Erro"}</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <Alert variant={sucesso ? "success" : "danger"} className="d-flex align-items-center">
                        {sucesso ? <CheckCircle size={24} className="me-2" /> : <AlertCircle size={24} className="me-2" />}
                        <span>{mensagem}</span>
                    </Alert>
                </Modal.Body>
                <Modal.Footer>
                    <Button variant="secondary" onClick={fecharModal}>
                        Fechar
                    </Button>
                </Modal.Footer>
            </Modal>
        </div>
    );
};

export default CadastrarClientes;