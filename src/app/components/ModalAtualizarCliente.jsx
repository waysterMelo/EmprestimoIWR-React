import React, { useState, useEffect } from "react";
import "../css/ModalAtualizarCliente.css";
import ClientesServices from "../services/ClientesServices";
import { motion, AnimatePresence } from "framer-motion";

const ModalAtualizarCliente = ({ cliente, onClose, onClienteAtualizado }) => {
    const [formData, setFormData] = useState({
        nome: "",
        cpf: "",
        email: "",
        telefone: "",
        endereco: "",
        numero: "",
        bairro: "",
        cidade: "",
        estado: "",
    });
    const [foto, setFoto] = useState(null);
    const [fotoPreview, setFotoPreview] = useState(null);
    const [isLoading, setIsLoading] = useState(false);
    const [erro, setErro] = useState("");
    const [sucesso, setSucesso] = useState("");
    const [formStep, setFormStep] = useState(1);
    const totalSteps = 2;

    const clientesService = new ClientesServices();

    useEffect(() => {
        if (cliente) {
            setFormData({
                nome: cliente.nome || "",
                cpf: cliente.cpf || "",
                email: cliente.email || "",
                telefone: cliente.telefone || "",
                endereco: cliente.endereco || "",
                numero: cliente.numero || "",
                bairro: cliente.bairro || "",
                cidade: cliente.cidade || "",
                estado: cliente.estado || "",
            });

            if (cliente.fotoUrl) {
                setFotoPreview(cliente.fotoUrl);
            }
        }
    }, [cliente]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData({
            ...formData,
            [name]: value,
        });
    };

    const handleFotoChange = (e) => {
        if (e.target.files && e.target.files[0]) {
            const selectedFoto = e.target.files[0];
            setFoto(selectedFoto);

            const reader = new FileReader();
            reader.onloadend = () => {
                setFotoPreview(reader.result);
            };
            reader.readAsDataURL(selectedFoto);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsLoading(true);
        setErro("");
        setSucesso("");

        try {
            await clientesService.atualizarCliente(cliente.id, formData, foto);
            setSucesso("Cliente atualizado com sucesso!");

            if (onClienteAtualizado) {
                onClienteAtualizado();
            }

            setTimeout(() => {
                onClose();
            }, 2000);
        } catch (error) {
            setErro(`Erro ao atualizar cliente: ${error.message}`);
        } finally {
            setIsLoading(false);
        }
    };

    const nextStep = (e) => {
        e.preventDefault()
        setFormStep(current => Math.min(current + 1, totalSteps));
    };

    const prevStep = () => {
        setFormStep(current => Math.max(current - 1, 1));
    };

    const handleClickOutside = (e) => {
        if (e.target.className === 'modal-overlay') {
            onClose();
        }
    };

    const stepVariants = {
        hidden: { opacity: 0, x: 50 },
        visible: { opacity: 1, x: 0, transition: { type: "spring", stiffness: 300, damping: 30 } },
        exit: { opacity: 0, x: -50, transition: { ease: "easeInOut" } }
    };

    return (
        <motion.div
            className="modal-overlay"
            onClick={handleClickOutside}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
        >
            <motion.div
                className="modal-atualizar container p-4 bg-light rounded shadow"
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ duration: 0.3 }}
            >
                <div className="modal-header gradient-header p-3 mb-3">
                    <motion.h2
                        initial={{ x: -20, opacity: 0 }}
                        animate={{ x: 0, opacity: 1 }}
                        transition={{ delay: 0.2 }}
                    >
                        Atualizar Dados do Cliente
                    </motion.h2>
                    <button className="btn-close pulse-effect" onClick={onClose}></button>
                </div>
                <div className="modal-body custom-scrollbar p-3">
                    <form onSubmit={handleSubmit}>
                        <div className="progress-container mb-4">
                            <div className="progress-steps d-flex justify-content-between">
                                {[...Array(totalSteps)].map((_, index) => (
                                    <div
                                        key={index}
                                        className={`progress-step ${formStep >= index + 1 ? 'active' : ''}`}
                                        onClick={() => formStep > index + 1 && setFormStep(index + 1)}
                                    >
                                        <div className="step-number">{index + 1}</div>
                                        <motion.div
                                            className="step-line"
                                            initial={{ width: 0 }}
                                            animate={{ width: formStep > index + 1 ? '100%' : '0%' }}
                                            transition={{ duration: 0.5 }}
                                        ></motion.div>
                                    </div>
                                ))}
                            </div>
                            <div className="step-labels d-flex justify-content-between mt-2">
                                <span className={formStep === 1 ? 'active' : ''}>
                                    <i className="bi bi-person-badge"></i> Informações Pessoais
                                </span>
                                <span className={formStep === 2 ? 'active' : ''}>
                                    <i className="bi bi-geo-alt"></i> Endereço
                                </span>
                            </div>
                        </div>

                        <AnimatePresence mode="wait">
                            {formStep === 1 && (
                                <motion.div
                                    key="step1"
                                    variants={stepVariants}
                                    initial="hidden"
                                    animate="visible"
                                    exit="exit"
                                    className="form-step"
                                >
                                    <div className="container">
                                        <div className="row justify-content-center">
                                            <div className="col-lg-12 col-md-10 col-sm-12">
                                                <div className="card shadow-sm p-4 mb-5">
                                                    <div className="foto-container mb-4 text-center">
                                                        <motion.div
                                                            className="foto-preview-wrapper"
                                                            whileHover={{ scale: 1.05 }}
                                                            whileTap={{ scale: 0.95 }}
                                                        >
                                                            <div className="foto-preview">
                                                                {fotoPreview ? (
                                                                    <img src={fotoPreview} alt="Preview da foto" className="img-fluid rounded" style={{ maxHeight: "150px", width: "auto" }} />
                                                                ) : (
                                                                    <div className="foto-placeholder">
                                                                        <i className="bi bi-person-circle fs-1"></i>
                                                                    </div>
                                                                )}
                                                            </div>
                                                            <div className="foto-upload mt-2">
                                                                <label htmlFor="foto" className="upload-button btn btn-outline-primary">
                                                                    <i className="bi bi-camera"></i> Alterar Foto
                                                                </label>
                                                                <input
                                                                    type="file"
                                                                    id="foto"
                                                                    accept="image/*"
                                                                    onChange={handleFotoChange}
                                                                    style={{ display: "none" }}
                                                                />
                                                            </div>
                                                        </motion.div>
                                                    </div>

                                                    <div className="row g-4">
                                                        <div className="col-md-6">
                                                            <div className="form-group animated-input mb-3">
                                                                <input
                                                                    type="text"
                                                                    id="nome"
                                                                    name="nome"
                                                                    value={formData.nome}
                                                                    onChange={handleChange}
                                                                    required
                                                                    placeholder=" "
                                                                    className="form-control form-control-lg"
                                                                />
                                                                <label htmlFor="nome" className="form-label">
                                                                    <i className="bi bi-person"></i> Nome Completo
                                                                </label>
                                                                <span className="highlight"></span>
                                                            </div>
                                                        </div>
                                                        <div className="col-md-6">
                                                            <div className="form-group animated-input mb-3">
                                                                <input
                                                                    type="text"
                                                                    id="cpf"
                                                                    name="cpf"
                                                                    value={formData.cpf}
                                                                    onChange={handleChange}
                                                                    disabled
                                                                    placeholder=" "
                                                                    className="form-control form-control-lg disabled-input"
                                                                />
                                                                <label htmlFor="cpf" className="form-label">
                                                                    <i className="bi bi-card-text"></i> CPF
                                                                </label>
                                                                <small className="helper-text text-muted">
                                                                    <i className="bi bi-info-circle"></i> O CPF não pode ser
                                                                    alterado
                                                                </small>
                                                            </div>
                                                        </div>
                                                        <div className="col-md-6">
                                                            <div className="form-group animated-input mb-3">
                                                                <input
                                                                    type="email"
                                                                    id="email"
                                                                    name="email"
                                                                    value={formData.email}
                                                                    onChange={handleChange}
                                                                    required
                                                                    placeholder=" "
                                                                    className="form-control form-control-lg"
                                                                />
                                                                <label htmlFor="email" className="form-label">
                                                                    <i className="bi bi-envelope"></i> Email
                                                                </label>
                                                                <span className="highlight"></span>
                                                            </div>
                                                        </div>
                                                        <div className="col-md-6">
                                                            <div className="form-group animated-input mb-3">
                                                                <input
                                                                    type="text"
                                                                    id="telefone"
                                                                    name="telefone"
                                                                    value={formData.telefone}
                                                                    onChange={handleChange}
                                                                    required
                                                                    placeholder=" "
                                                                    className="form-control form-control-lg"
                                                                />
                                                                <label htmlFor="telefone" className="form-label">
                                                                    <i className="bi bi-telephone"></i> Telefone
                                                                </label>
                                                                <span className="highlight"></span>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </motion.div>
                            )}

                            {formStep === 2 && (
                                <motion.div
                                    key="step2"
                                    variants={stepVariants}
                                    initial="hidden"
                                    animate="visible"
                                    exit="exit"
                                    className="form-step"
                                >
                                    <div className="container">
                                        <div className="row justify-content-center">
                                            <div className="col-lg-12 col-md-10 col-sm-12">
                                                <div className="card shadow p-2 mb-5">
                                                    <div className="address-header mb-4">
                                                        <h3 className="d-flex align-items-center">
                                                            <i className="bi bi-house-door me-2"></i>
                                                            Dados de Endereço
                                                        </h3>
                                                    </div>

                                                    <div className="row g-4">
                                                        <div className="col-md-8">
                                                            <div className="form-group animated-input mb-3">
                                                                <input
                                                                    type="text"
                                                                    id="endereco"
                                                                    name="endereco"
                                                                    value={formData.endereco}
                                                                    onChange={handleChange}
                                                                    required
                                                                    placeholder=" "
                                                                    className="form-control form-control-lg"
                                                                />
                                                                <label htmlFor="endereco" className="form-label">
                                                                    <i className="bi bi-signpost"></i> Endereço
                                                                </label>
                                                                <span className="highlight"></span>
                                                            </div>
                                                        </div>
                                                        <div className="col-md-4">
                                                            <div className="form-group animated-input mb-3">
                                                                <input
                                                                    type="text"
                                                                    id="numero"
                                                                    name="numero"
                                                                    value={formData.numero}
                                                                    onChange={handleChange}
                                                                    required
                                                                    placeholder=" "
                                                                    className="form-control form-control-lg"
                                                                />
                                                                <label htmlFor="numero" className="form-label">
                                                                    <i className="bi bi-123"></i> Número
                                                                </label>
                                                                <span className="highlight"></span>
                                                            </div>
                                                        </div>
                                                        <div className="col-md-4">
                                                            <div className="form-group animated-input mb-3">
                                                                <input
                                                                    type="text"
                                                                    id="bairro"
                                                                    name="bairro"
                                                                    value={formData.bairro}
                                                                    onChange={handleChange}
                                                                    required
                                                                    placeholder=" "
                                                                    className="form-control form-control-lg"
                                                                />
                                                                <label htmlFor="bairro" className="form-label">
                                                                    <i className="bi bi-geo"></i> Bairro
                                                                </label>
                                                                <span className="highlight"></span>
                                                            </div>
                                                        </div>
                                                        <div className="col-md-4">
                                                            <div className="form-group animated-input mb-3">
                                                                <input
                                                                    type="text"
                                                                    id="cidade"
                                                                    name="cidade"
                                                                    value={formData.cidade}
                                                                    onChange={handleChange}
                                                                    required
                                                                    placeholder=" "
                                                                    className="form-control form-control-lg"
                                                                />
                                                                <label htmlFor="cidade" className="form-label">
                                                                    <i className="bi bi-building"></i> Cidade
                                                                </label>
                                                                <span className="highlight"></span>
                                                            </div>
                                                        </div>
                                                        <div className="col-md-4">
                                                            <div className="form-group animated-input mb-3">
                                                                <select
                                                                    id="estado"
                                                                    name="estado"
                                                                    value={formData.estado}
                                                                    onChange={handleChange}
                                                                    required
                                                                    className="form-control form-control-lg custom-select"
                                                                >
                                                                    <option value="">Selecione o estado</option>
                                                                    <option value="AC">Acre</option>
                                                                    <option value="AL">Alagoas</option>
                                                                    <option value="AP">Amapá</option>
                                                                    <option value="AM">Amazonas</option>
                                                                    <option value="BA">Bahia</option>
                                                                    <option value="CE">Ceará</option>
                                                                    <option value="DF">Distrito Federal</option>
                                                                    <option value="ES">Espírito Santo</option>
                                                                    <option value="GO">Goiás</option>
                                                                    <option value="MA">Maranhão</option>
                                                                    <option value="MT">Mato Grosso</option>
                                                                    <option value="MS">Mato Grosso do Sul</option>
                                                                    <option value="MG">Minas Gerais</option>
                                                                    <option value="PA">Pará</option>
                                                                    <option value="PB">Paraíba</option>
                                                                    <option value="PR">Paraná</option>
                                                                    <option value="PE">Pernambuco</option>
                                                                    <option value="PI">Piauí</option>
                                                                    <option value="RJ">Rio de Janeiro</option>
                                                                    <option value="RN">Rio Grande do Norte</option>
                                                                    <option value="RS">Rio Grande do Sul</option>
                                                                    <option value="RO">Rondônia</option>
                                                                    <option value="RR">Roraima</option>
                                                                    <option value="SC">Santa Catarina</option>
                                                                    <option value="SP">São Paulo</option>
                                                                    <option value="SE">Sergipe</option>
                                                                    <option value="TO">Tocantins</option>
                                                                </select>
                                                                <label htmlFor="estado" className="form-label select-label">
                                                                    <i className="bi bi-geo-alt"></i> Estado
                                                                </label>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </motion.div>
                            )}
                        </AnimatePresence>

                        <AnimatePresence>
                            {erro && (
                                <motion.div
                                    className="notification error alert alert-danger mt-3"
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, y: -20 }}
                                >
                                    <i className="bi bi-exclamation-triangle"></i>
                                    <div>{erro}</div>
                                    <button className="close-btn" onClick={() => setErro("")}>
                                        <i className="bi bi-x"></i>
                                    </button>
                                </motion.div>
                            )}

                            {sucesso && (
                                <motion.div
                                    className="notification success alert alert-success mt-3"
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, y: -20 }}
                                >
                                    <i className="bi bi-check-circle"></i>
                                    <div>{sucesso}</div>
                                    <div className="progress-bar-success">
                                        <motion.div
                                            className="progress-fill"
                                            initial={{ width: 0 }}
                                            animate={{ width: "100%" }}
                                            transition={{ duration: 2 }}
                                        ></motion.div>
                                    </div>
                                </motion.div>
                            )}
                        </AnimatePresence>

                        <div className="modal-footer d-flex justify-content-between mt-4">
                            {formStep > 1 ? (
                                <motion.button
                                    whileHover={{ scale: 1.05 }}
                                    whileTap={{ scale: 0.95 }}
                                    type="button"
                                    className="btn btn-secondary"
                                    onClick={prevStep}
                                >
                                    <i className="bi bi-arrow-left"></i> Voltar
                                </motion.button>
                            ) : (
                                <motion.button
                                    whileHover={{ scale: 1.05 }}
                                    whileTap={{ scale: 0.95 }}
                                    type="button"
                                    className="btn btn-outline-secondary"
                                    onClick={onClose}
                                >
                                    <i className="bi bi-x-circle"></i> Cancelar
                                </motion.button>
                            )}

                            {formStep < totalSteps ? (
                                <motion.button
                                    whileHover={{ scale: 1.05 }}
                                    whileTap={{ scale: 0.95 }}
                                    type="button"
                                    className="btn btn-primary"
                                    onClick={nextStep}
                                >
                                    Próximo <i className="bi bi-arrow-right"></i>
                                </motion.button>
                            ) : (
                                <motion.button
                                    whileHover={{ scale: 1.05 }}
                                    whileTap={{ scale: 0.95 }}
                                    type="submit"
                                    className="btn btn-success"
                                    disabled={isLoading}
                                >
                                    {isLoading ? (
                                        <div className="loader-container">
                                            <div className="loader"></div>
                                            nextStep            <span>Salvando...</span>
                                        </div>
                                    ) : (
                                        <>
                                            <i className="bi bi-check2-circle"></i> Salvar Alterações
                                        </>
                                    )}
                                </motion.button>
                            )}
                        </div>
                    </form>
                </div>
            </motion.div>
        </motion.div>
    );
};

export default ModalAtualizarCliente;