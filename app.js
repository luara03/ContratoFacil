const contractForm = document.getElementById("contractForm");
const contractPreview = document.getElementById("contractPreview");
const generateButton = document.getElementById("generateButton");
const copyButton = document.getElementById("copyButton");
const downloadButton = document.getElementById("downloadButton");
const statusMessage = document.getElementById("statusMessage");

const formatCurrency = (value) => {
  const amount = Number.parseFloat(value);
  if (Number.isNaN(amount)) {
    return value;
  }
  return amount.toLocaleString("pt-BR", {
    style: "currency",
    currency: "BRL",
  });
};

const template = (data) => `CONTRATO DE PRESTAÇÃO DE SERVIÇOS FREELANCER

CONTRATANTE: ${data.clientName}, inscrito sob o documento ${data.clientDoc}, contato ${data.clientContact}.

CONTRATADO: ${data.freelancerName}, inscrito sob o documento ${data.freelancerDoc}, contato ${data.freelancerContact}.

1. OBJETO
O presente contrato tem como objeto a prestação de serviços de ${data.serviceTitle}.

2. ESCOPO DOS SERVIÇOS
${data.scope}

3. PRAZO E CRONOGRAMA
Os serviços terão início em ${data.startDate} e deverão ser entregues até ${data.deliveryDate}, podendo haver ajustes mediante acordo entre as partes.

4. REMUNERAÇÃO
O valor total acordado é de ${formatCurrency(data.paymentTotal)}, a ser pago conforme: ${data.paymentMethod}.

5. RESPONSABILIDADES DO CONTRATADO
O contratado compromete-se a executar os serviços com qualidade, respeitando prazos e realizando comunicações periódicas com o contratante.

6. RESPONSABILIDADES DO CONTRATANTE
O contratante fornecerá informações e materiais necessários para a execução do escopo, além de realizar os pagamentos nas datas acordadas.

7. DIREITOS AUTORAIS E USO
Após o pagamento integral, o contratante poderá utilizar os entregáveis conforme acordado. O contratado poderá incluir o projeto em seu portfólio, salvo restrição expressa.

8. RESCISÃO
O contrato pode ser rescindido por qualquer das partes mediante aviso prévio de 7 dias, com pagamento proporcional aos serviços realizados.

9. FORO
Fica eleito o foro da comarca de ${data.jurisdiction} para dirimir quaisquer dúvidas.

E, por estarem de acordo, as partes assinam o presente contrato.

${data.jurisdiction}, ${data.startDate}.

_______________________________
${data.clientName}

_______________________________
${data.freelancerName}
`;

const getFormData = () => {
  const formData = new FormData(contractForm);
  return Object.fromEntries(formData.entries());
};

const renderContract = () => {
  const data = getFormData();
  contractPreview.textContent = template(data);
  statusMessage.textContent = "Contrato atualizado com os dados informados.";
};

const ensureContract = () => {
  if (contractForm.reportValidity()) {
    renderContract();
    return true;
  }
  statusMessage.textContent = "Preencha todos os campos obrigatórios para gerar o contrato.";
  return false;
};

const copyContract = async () => {
  if (!contractPreview.textContent.trim() && !ensureContract()) {
    return;
  }
  try {
    await navigator.clipboard.writeText(contractPreview.textContent);
    copyButton.textContent = "Contrato copiado!";
    statusMessage.textContent = "Texto copiado para a área de transferência.";
    setTimeout(() => {
      copyButton.textContent = "Copiar texto";
    }, 2000);
  } catch (error) {
    statusMessage.textContent = "Não foi possível copiar automaticamente. Selecione e copie o texto manualmente.";
  }
};

const downloadContract = () => {
  if (!contractPreview.textContent.trim() && !ensureContract()) {
    return;
  }
  const blob = new Blob([contractPreview.textContent], { type: "text/plain;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = "contrato-freelancer.txt";
  link.click();
  URL.revokeObjectURL(url);
  statusMessage.textContent = "Download iniciado.";
};

generateButton.addEventListener("click", ensureContract);

copyButton.addEventListener("click", copyContract);

downloadButton.addEventListener("click", downloadContract);

contractForm.addEventListener("submit", (event) => {
  event.preventDefault();
  renderContract();
});
