import React, { useEffect, useState } from 'react';
import axios from 'axios';
import {
    BarChart, Bar, XAxis, YAxis, Tooltip, Legend,
    ResponsiveContainer, CartesianGrid, LineChart, Line, Area
} from 'recharts';
import {
    TrendingUp, DollarSign, Users, Percent, BarChart2, PieChart, Calendar,
    AlertCircle, ListChecks // Ícone adicionado para a nova tabela
} from 'lucide-react'; // Importado ListChecks
import { Container, Row, Col, Card, Alert, Spinner, Table } from 'react-bootstrap';
import CountUp from 'react-countup';
import '../css/LoanDashboard.css';
import api from '../../api'


const LoanOverviewDashboard = () => {
    // Estado para os dados dos cards/gráficos (endpoint original)
    const [loanData, setLoanData] = useState([]);
    // NOVO ESTADO: para a tabela detalhada (novo endpoint)
    const [detailedMonthlyData, setDetailedMonthlyData] = useState([]);

    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const monthNames = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'];

    useEffect(() => {
        const fetchDashboardData = async () => {
            try {
                setLoading(true);

                // Usar Promise.all para buscar os dois endpoints em paralelo
                const [responseOverview, responseDetailed] = await Promise.all([
                    api.get('/dashboard/resumo-mensal'),
                    api.get('/dashboard/resumo-financeiro-mensal')
                ]);

                // --- Processamento dos dados do endpoint original ---
                const mappedDataOverview = responseOverview.data.map(item => ({
                    month: monthNames[item.mes - 1],
                    originalMonth: item.mes,
                    totalLent: item.totalEmprestado ?? 0, // Usar ?? 0 para default
                    expectedReturn: item.retornoEsperado ?? 0,
                    activeLoans: item.clientes ?? 0,
                    interestRate: (item.mediaJuros ?? 0) * 100,
                    profit: (item.retornoEsperado ?? 0) - (item.totalEmprestado ?? 0)
                })).sort((a, b) => a.originalMonth - b.originalMonth);
                setLoanData(mappedDataOverview);

                // --- NOVO: Processamento dos dados do endpoint detalhado ---
                const mappedDataDetailed = responseDetailed.data.map(item => ({
                    month: monthNames[item.mes - 1],
                    originalMonth: item.mes,
                    totalLent: item.totalEmprestado ?? 0, // O backend já usa COALESCE, mas é bom garantir
                    expectedReturn: item.retornoEsperado ?? 0,
                    profit: item.lucro ?? 0
                })).sort((a, b) => a.originalMonth - b.originalMonth);
                setDetailedMonthlyData(mappedDataDetailed); // Atualiza o novo estado


                setError(null);
            } catch (err) {
                console.error("Erro ao buscar dados do dashboard:", err);
                let errorMessage = "Não foi possível carregar os dados. ";
                if (err.response) {
                    // Erro veio do backend (ex: 404, 500)
                    errorMessage += ` (Status: ${err.response.status})`;
                } else if (err.request) {
                    // Requisição feita mas sem resposta (ex: servidor offline)
                    errorMessage += "Verifique a conexão com o servidor.";
                } else {
                    // Erro ao configurar a requisição
                    errorMessage += "Ocorreu um erro inesperado.";
                }
                setError(errorMessage + " Tente novamente mais tarde.");
            } finally {
                setLoading(false);
            }
        };

        fetchDashboardData();
    }, []); // Dependência vazia para rodar apenas uma vez

    // --- Cálculos para os Cards/Gráficos (baseados nos dados originais) ---
    const totalLentCards = loanData.reduce((sum, item) => sum + item.totalLent, 0);
    const totalExpectedReturnCards = loanData.reduce((sum, item) => sum + item.expectedReturn, 0);
    const totalProfitCards = totalExpectedReturnCards - totalLentCards;
    const averageInterestRateCards = loanData.length
        ? (loanData.reduce((sum, item) => sum + item.interestRate, 0) / loanData.length)
        : 0;
    const totalActiveLoansCards = loanData.length > 0
        ? loanData.reduce((sum, item) => sum + item.activeLoans, 0) // Soma dos clientes por mês (pode não ser o ideal, talvez usar o último mês?)
        : 0;

    // --- NOVO: Cálculos para o Footer da Tabela Detalhada ---
    const totalLentDetailed = detailedMonthlyData.reduce((sum, item) => sum + item.totalLent, 0);
    const totalExpectedReturnDetailed = detailedMonthlyData.reduce((sum, item) => sum + item.expectedReturn, 0);
    const totalProfitDetailed = detailedMonthlyData.reduce((sum, item) => sum + item.profit, 0);
    // Note: O lucro total da tabela pode diferir ligeiramente de (totalExpectedReturnDetailed - totalLentDetailed)
    // se houver arredondamentos no cálculo do lucro por mês no backend. Usar a soma do lucro mensal é mais preciso.

    // Função formatCurrency original
    const formatCurrency = (value) => {
        if (typeof value !== 'number' || isNaN(value)) {
            return 'R$ 0,00';
        }
        return value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
    };

    // Componente MetricCard original
    const MetricCard = ({ title, value, icon: Icon, color = 'primary', isCurrency = false, isPercent = false, decimals = 0 }) => (
        <Card className="shadow-sm border-0 h-100 metric-card slide-up-fade-in">
            <Card.Body className="d-flex align-items-center">
                <div className={`text-${color} me-3`}>
                    <Icon size={28}/>
                </div>
                <div>
                    <Card.Subtitle className="text-muted mb-1 small">{title}</Card.Subtitle>
                    <Card.Title className="h4 fw-bold mb-0">
                        <CountUp
                            start={0}
                            end={value}
                            duration={1.5}
                            separator="."
                            decimal=","
                            prefix={isCurrency ? "R$ " : ""}
                            suffix={isPercent ? "%" : ""}
                            decimals={decimals}
                        />
                    </Card.Title>
                </div>
            </Card.Body>
        </Card>
    );

    return (
        <div className="min-vh-100 bg-white">
            {/* Header */}
            <header className="bg-white shadow-sm sticky-top border-bottom">
                <Container className="py-3">
                    <Row className="align-items-center">
                        <Col>
                            <h1 className="h5 fw-bold text-dark mb-0 d-flex align-items-center">
                                <BarChart2 className="me-2 text-primary" />
                                Painel de Empréstimos
                            </h1>
                        </Col>
                        <Col xs="auto">
                            {/* Lucro total dos cards continua aqui */}
                            <div className="text-end">
                                <p className="small text-muted fw-medium mb-0">Lucro Previsto Mensal</p>
                                <h2 className="h5 fw-bold text-success mb-0 profit-value">
                                    {formatCurrency(totalProfitCards)}
                                </h2>
                            </div>
                        </Col>
                    </Row>
                </Container>
            </header>

            {/* Conteúdo principal */}
            <main>
                <Container className="py-4">
                    {loading ? (
                        <div className="text-center py-5">
                            <Spinner animation="border" variant="primary" />
                            <p className="mt-2 text-muted">Carregando dados...</p>
                        </div>
                    ) : error ? (
                        <Alert variant="danger" className="d-flex align-items-center">
                            <AlertCircle className="me-2" />
                            {error}
                        </Alert>
                    ) : (
                        <>
                            {/* Cards de métricas (usando dados originais) */}
                            <Row xs={1} sm={2} lg={4} className="g-4 mb-4">
                                <Col>
                                    <MetricCard title="Emprestado" value={totalLentCards} icon={DollarSign} color="primary" isCurrency decimals={2}/>
                                </Col>
                                <Col>
                                    <MetricCard title="A Receber" value={totalExpectedReturnCards} icon={TrendingUp} color="success" isCurrency decimals={2}/>
                                </Col>
                                <Col>
                                    {/* O total de clientes ativos pode ser interpretado de várias formas. Ver nota nos cálculos. */}
                                    <MetricCard title="Clientes" value={totalActiveLoansCards} icon={Users} color="info" />
                                </Col>
                                <Col>
                                    <MetricCard title="Taxa Média" value={averageInterestRateCards} icon={Percent} color="warning" isPercent decimals={2}/>
                                </Col>
                            </Row>

                            {/* Gráficos (usando dados originais) */}
                            <Row className="g-4">
                                {/* Gráfico principal - LineChart */}
                                <Col xs={12}>
                                    <Card className="shadow-sm border-light chart-container-main slide-up-fade-in">
                                        <Card.Body>
                                            <div className="d-flex justify-content-between align-items-center mb-3">
                                                <h3 className="h6 fw-semibold text-dark mb-0 d-flex align-items-center">
                                                    <TrendingUp className="me-2 text-primary" size={18} />
                                                    Performance Financeira Mensal
                                                </h3>
                                                <div className="d-flex align-items-center text-muted small">
                                                    <Calendar size={14} className="me-1" />
                                                    <span>Mensal</span>
                                                </div>
                                            </div>
                                            {/* Gráfico continua usando loanData (dados originais) */}
                                            <div style={{ height: '400px' }}>
                                                <ResponsiveContainer width="100%" height="100%">
                                                    <LineChart data={loanData} margin={{ top: 5, right: 20, left: 10, bottom: 5 }}>
                                                        {/* Defs e resto do gráfico mantidos como antes */}
                                                        <defs>
                                                            <linearGradient id="colorTotalLent" x1="0" y1="0" x2="0" y2="1">
                                                                <stop offset="5%" stopColor="#0d6efd" stopOpacity={0.3}/>
                                                                <stop offset="95%" stopColor="#0d6efd" stopOpacity={0}/>
                                                            </linearGradient>
                                                            <linearGradient id="colorExpectedReturn" x1="0" y1="0" x2="0" y2="1">
                                                                <stop offset="5%" stopColor="#198754" stopOpacity={0.3}/>
                                                                <stop offset="95%" stopColor="#198754" stopOpacity={0}/>
                                                            </linearGradient>
                                                            <linearGradient id="colorProfit" x1="0" y1="0" x2="0" y2="1">
                                                                <stop offset="5%" stopColor="#6f42c1" stopOpacity={0.3}/>
                                                                <stop offset="95%" stopColor="#6f42c1" stopOpacity={0}/>
                                                            </linearGradient>
                                                        </defs>
                                                        <CartesianGrid strokeDasharray="3 3" vertical={false} strokeOpacity={0.1}/>
                                                        <XAxis dataKey="month" fontSize={12} tickLine={false} axisLine={{ stroke: '#e9ecef' }} dy={5}/>
                                                        <YAxis fontSize={12} tickLine={false} axisLine={false} tickFormatter={(value) => `R$${(value/1000).toFixed(0)}k`} dx={-5}/>
                                                        <Tooltip
                                                            cursor={{fill: 'transparent'}}
                                                            contentStyle={{ borderRadius: '8px', boxShadow: '0 4px 12px rgba(0,0,0,0.1)', border: '1px solid #eee', padding: '10px', backgroundColor: 'rgba(255, 255, 255, 0.9)'}}
                                                            formatter={(value, name, props) => formatCurrency(value)}
                                                            labelStyle={{ fontWeight: 'bold', marginBottom: '5px' }}
                                                        />
                                                        <Legend verticalAlign="top" align="right" height={40} iconSize={10} wrapperStyle={{fontSize: '12px'}}/>
                                                        <Line type="monotone" dataKey="totalLent" name="Total Emprestado" stroke="#0d6efd" strokeWidth={2.5} dot={false} activeDot={{ r: 5 }}/>
                                                        <Area type="monotone" dataKey="totalLent" fillOpacity={1} fill="url(#colorTotalLent)" stroke="none" />
                                                        <Line type="monotone" dataKey="expectedReturn" name="Retorno Esperado" stroke="#198754" strokeWidth={2.5} dot={false} activeDot={{ r: 5 }}/>
                                                        <Area type="monotone" dataKey="expectedReturn" fillOpacity={1} fill="url(#colorExpectedReturn)" stroke="none" />
                                                        <Line type="monotone" dataKey="profit" name="Lucro" stroke="#6f42c1" strokeWidth={2.5} strokeDasharray="5 5" dot={false} activeDot={{ r: 5 }}/>
                                                    </LineChart>
                                                </ResponsiveContainer>
                                            </div>
                                        </Card.Body>
                                    </Card>
                                </Col>

                                {/* Gráficos menores (mantidos usando dados originais) */}
                                <Col lg={6}>
                                    <Card className="shadow-sm border-light chart-container-secondary h-100 slide-up-fade-in">
                                        <Card.Body>
                                            <h3 className="h6 fw-semibold text-dark mb-3 d-flex align-items-center">
                                                <Percent className="me-2 text-warning" size={18} />
                                                Taxa Média 
                                            </h3>
                                            {/* Gráfico continua usando loanData */}
                                            <div style={{ height: '250px' }}>
                                                <ResponsiveContainer width="100%" height="100%">
                                                    <LineChart data={loanData} margin={{ top: 5, right: 5, left: -20, bottom: 5 }}>
                                                        <CartesianGrid strokeDasharray="3 3" vertical={false} strokeOpacity={0.1}/>
                                                        <XAxis dataKey="month" fontSize={12} tickLine={false} axisLine={{ stroke: '#e9ecef' }}/>
                                                        <YAxis fontSize={12} tickLine={false} axisLine={false} tickFormatter={(value) => `${value.toFixed(1)}%`}/>
                                                        <Tooltip formatter={(value) => [`${value.toFixed(2)}%`, 'Taxa Média']} contentStyle={{ borderRadius: '8px', boxShadow: '0 4px 12px rgba(0,0,0,0.1)', border: '1px solid #eee', padding: '8px' }}/>
                                                        <Line type="monotone" dataKey="interestRate" name="Taxa Média" stroke="#ffc107" strokeWidth={2} dot={{ r: 4 }} activeDot={{ r: 6 }}/>
                                                        <Area type="monotone" dataKey="interestRate" fill="#ffc107" fillOpacity={0.1} stroke="none"/>
                                                    </LineChart>
                                                </ResponsiveContainer>
                                            </div>
                                        </Card.Body>
                                    </Card>
                                </Col>
                                <Col lg={6}>
                                    <Card className="shadow-sm border-light chart-container-secondary h-100 slide-up-fade-in">
                                        <Card.Body>
                                            <h3 className="h6 fw-semibold text-dark mb-3 d-flex align-items-center">
                                                <Users className="me-2 text-info" size={18} />
                                                Clientes Ativos por Mês 
                                            </h3>
                                            {/* Gráfico continua usando loanData */}
                                            <div style={{ height: '250px' }}>
                                                <ResponsiveContainer width="100%" height="100%">
                                                    <BarChart data={loanData} margin={{ top: 5, right: 5, left: -20, bottom: 5 }}>
                                                        <CartesianGrid strokeDasharray="3 3" vertical={false} strokeOpacity={0.1}/>
                                                        <XAxis dataKey="month" fontSize={12} tickLine={false} axisLine={{ stroke: '#e9ecef' }}/>
                                                        <YAxis fontSize={12} tickLine={false} axisLine={false}/>
                                                        <Tooltip formatter={(value) => [value, 'Clientes Ativos']} contentStyle={{ borderRadius: '8px', boxShadow: '0 4px 12px rgba(0,0,0,0.1)', border: '1px solid #eee', padding: '8px' }}/>
                                                        <Bar dataKey="activeLoans" name="Clientes" fill="#0dcaf0" radius={[4, 4, 0, 0]} maxBarSize={30}/>
                                                    </BarChart>
                                                </ResponsiveContainer>
                                            </div>
                                        </Card.Body>
                                    </Card>
                                </Col>

                                {/* --- Tabela de Dados Mensais Detalhados - ATUALIZADA --- */}
                                <Col xs={12}>
                                    <Card className="shadow-sm border-light mt-4 slide-up-fade-in">
                                        <Card.Header className="bg-white border-bottom-0 pt-3 px-3">
                                            <Row className="align-items-center">
                                                <Col>
                                                    <h3 className="h6 fw-semibold text-dark mb-0 d-flex align-items-center">
                                                        <ListChecks className="me-2 text-purple" size={18} /> {/* Ícone novo */}
                                                        Resumo Financeiro Mensal (Todos Empréstimos)
                                                    </h3>
                                                </Col>
                                            </Row>
                                        </Card.Header>
                                        <Card.Body className="p-0">
                                            {/* Tabela agora usa detailedMonthlyData */}
                                            <Table responsive hover borderless className="mb-0 small">
                                                {/* Cabeçalho ATUALIZADO */}
                                                <thead className="table-responsive table-dark">
                                                <tr>
                                                    <th className="px-3 py-2">Mês</th>
                                                    <th className="text-end px-3 py-2">Total Emprestado</th>
                                                    <th className="text-end px-3 py-2">Retorno Esperado</th>
                                                    <th className="text-end px-3 py-2">Lucro Calculado</th>
                                                </tr>
                                                </thead>
                                                {/* Corpo ATUALIZADO */}
                                                <tbody>
                                                {/* Mapeia sobre o NOVO estado detailedMonthlyData */}
                                                {detailedMonthlyData.map((item, index) => (
                                                    <tr key={item.month + '-' + index} style={{ animationDelay: `${index * 0.05}s` }} className="slide-up-fade-in">
                                                        <td className="px-3 py-2">{item.month}</td>
                                                        <td className="text-end px-3 py-2">{formatCurrency(item.totalLent)}</td>
                                                        <td className="text-end px-3 py-2">{formatCurrency(item.expectedReturn)}</td>
                                                        <td className={`text-end px-3 py-2 ${item.profit >= 0 ? 'text-success' : 'text-danger'}`}>
                                                            {formatCurrency(item.profit)}
                                                        </td>
                                                        {/* Colunas removidas: Clientes Ativos, Taxa Média */}
                                                    </tr>
                                                ))}
                                                {/* Linha de fallback se não houver dados */}
                                                {detailedMonthlyData.length === 0 && (
                                                    <tr>
                                                        <td colSpan="4" className="text-center text-muted p-3">Nenhum dado detalhado encontrado.</td>
                                                    </tr>
                                                )}
                                                </tbody>
                                                {/* Rodapé ATUALIZADO */}
                                                <tfoot className="border-top">
                                                <tr className='fw-bold bg-light bg-opacity-50'>
                                                    <td className="px-3 py-2">Total Geral</td>
                                                    {/* Usa os novos totais calculados */}
                                                    <td className="text-end px-3 py-2">{formatCurrency(totalLentDetailed)}</td>
                                                    <td className="text-end px-3 py-2">{formatCurrency(totalExpectedReturnDetailed)}</td>
                                                    <td className={`text-end px-3 py-2 ${totalProfitDetailed >= 0 ? 'text-success' : 'text-danger'}`}>
                                                        {formatCurrency(totalProfitDetailed)}
                                                    </td>
                                                    {/* Colunas removidas: Clientes Ativos, Taxa Média */}
                                                </tr>
                                                </tfoot>
                                            </Table>
                                        </Card.Body>
                                    </Card>
                                </Col>
                            </Row>
                        </>
                    )}
                </Container>
            </main>

            {/* Footer */}
            <footer className="bg-white border-top mt-4 py-3">
                <Container>
                    <div className="d-flex justify-content-between align-items-center">
                        <p className="text-muted small mb-0">© {new Date().getFullYear()} Sistema de Gestão de Empréstimos</p>
                        <PieChart className="text-primary opacity-50" size={18} />
                    </div>
                </Container>
            </footer>

            {/* Estilos Globais (mantidos) */}
            <style jsx global>{`
                /* Estilos mantidos como no original */
                .bg-gradient-purple-light { background: linear-gradient(135deg, #f3e8ff, #e9d5ff); }
                .text-purple { color: #6f42c1; }
                .metric-card { transition: transform 0.2s ease-in-out, box-shadow 0.2s ease-in-out; }
                .metric-card:hover { transform: translateY(-4px); box-shadow: 0 10px 20px rgba(0,0,0,0.08) !important; }
                .slide-up-fade-in { /* animation: slideUpFadeIn 0.5s ease-out forwards; opacity: 0; */ }
                .table { font-size: 0.875rem; }
                .table thead th { font-weight: 600; border-bottom: 2px solid #dee2e6; }
                .table tfoot td { border-top: 1px solid #dee2e6; }
                .recharts-default-tooltip { border-radius: 8px !important; box-shadow: 0 4px 12px rgba(0,0,0,0.1) !important; border: none !important; padding: 10px !important; background-color: rgba(255, 255, 255, 0.95) !important; }
                .recharts-tooltip-label { font-weight: bold; margin-bottom: 5px; }
                /* body { font-family: 'Inter', sans-serif; } */
                /* h1, h2, h3, h4, h5, h6 { font-family: 'SuaFonteDisplay', sans-serif; } */
            `}</style>
        </div>
    );
};

export default LoanOverviewDashboard;