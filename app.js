const urlInput = document.getElementById('product-url');
const generateBtn = document.getElementById('generate-btn');
const statusEl = document.getElementById('status');
const adSection = document.getElementById('ad-section');

const adImage = document.getElementById('ad-image');
const adTitle = document.getElementById('ad-title');
const adCopy = document.getElementById('ad-copy');
const adCta = document.getElementById('ad-cta');
const adLink = document.getElementById('ad-link');
const copyBtn = document.getElementById('copy-btn');

const CTA_OPTIONS = ['Quero esse achadinho', 'Aproveitar oferta', 'Garantir o meu'];

const normalizeUrl = (value) => {
  const trimmed = value.trim();
  if (!trimmed) throw new Error('Informe um link válido.');
  return /^https?:\/\//i.test(trimmed) ? trimmed : `https://${trimmed}`;
};

const chooseCTA = (title = '') => {
  const lower = title.toLowerCase();
  if (lower.includes('roupa') || lower.includes('vestido') || lower.includes('camisa')) {
    return 'Montar look com desconto';
  }
  if (lower.includes('casa') || lower.includes('cozinha') || lower.includes('decor')) {
    return 'Deixar a casa linda';
  }
  return CTA_OPTIONS[Math.floor(Math.random() * CTA_OPTIONS.length)];
};

const buildCopy = ({ title, description, url }) => {
  const safeTitle = title || 'Achadinho imperdível';
  const safeDescription = description || 'Produto com ótimo custo-benefício para quem ama economizar.';

  return [
    `✨ ${safeTitle}`,
    '',
    `${safeDescription.slice(0, 140)}${safeDescription.length > 140 ? '...' : ''}`,
    '',
    '💸 Oferta encontrada por aqui! Corre antes que acabe.',
    `🔗 Link: ${url}`,
  ].join('\n');
};

async function fetchProductMeta(url) {
  const endpoint = `https://api.microlink.io/?url=${encodeURIComponent(url)}&screenshot=false&meta=true`;
  const response = await fetch(endpoint);
  if (!response.ok) throw new Error('Não foi possível buscar dados do link.');

  const payload = await response.json();
  if (!payload?.status || !payload?.data) {
    throw new Error('O link informado não retornou metadados.');
  }

  return {
    title: payload.data.title || 'Achadinho especial',
    description: payload.data.description || payload.data.publisher || '',
    image: payload.data.image?.url || payload.data.logo?.url || 'https://picsum.photos/800',
  };
}

async function generateAd() {
  try {
    generateBtn.disabled = true;
    statusEl.textContent = 'Gerando anúncio...';

    const url = normalizeUrl(urlInput.value);
    const meta = await fetchProductMeta(url);
    const cta = chooseCTA(meta.title);

    adImage.src = meta.image;
    adTitle.textContent = meta.title;
    adCopy.value = buildCopy({ ...meta, url });
    adCta.value = cta;
    adLink.textContent = cta;
    adLink.href = url;

    adSection.hidden = false;
    statusEl.textContent = 'Anúncio gerado com sucesso! Você pode editar o texto antes de publicar.';
  } catch (error) {
    statusEl.textContent = error.message || 'Erro inesperado ao gerar anúncio.';
  } finally {
    generateBtn.disabled = false;
  }
}

generateBtn.addEventListener('click', generateAd);

copyBtn.addEventListener('click', async () => {
  try {
    await navigator.clipboard.writeText(adCopy.value);
    statusEl.textContent = 'Copy copiada para a área de transferência!';
  } catch {
    statusEl.textContent = 'Não foi possível copiar automaticamente. Copie manualmente.';
  }
});

adCta.addEventListener('input', () => {
  adLink.textContent = adCta.value || 'Ver oferta';
});
