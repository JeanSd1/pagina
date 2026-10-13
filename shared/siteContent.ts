export const DEFAULT_SITE_CONTENT = {
  siteTheme: "light",
  brandMark: "JD/",
  brandName: "TECH SOLUTIONS",
  logoUrl: "",
  heroImageUrl: "",
  ownerName: "Jean Durgante",
  topLine: "atendimento local · orçamento sem compromisso",
  topAction: "ver horários disponíveis",
  navServices: "Serviços",
  navQuote: "Orçamento",
  navBooking: "Agenda",
  navContact: "Contato",
  navAdmin: "Painel",
  mainAction: "Começar agora",
  heroStatus: "disponível para novos atendimentos",
  heroTitle: "Problema técnico?",
  heroAccent: "Próximo passo.",
  heroDescription:
    "Tecnologia, segurança e manutenção para tirar o que trava a sua operação do caminho — com atendimento direto, orçamento claro e solução prática.",
  heroPrimaryAction: "Monte seu orçamento",
  heroSecondaryAction: "Explorar serviços",
  heroProofTitle: "Atendimento versátil",
  heroProofDetail: "do diagnóstico à execução",
  panelCode: "JD / 001",
  panelImageUrl: "",
  panelEyebrow: "soluções integradas",
  panelTitle: "Um único contato.",
  panelAccent: "Várias frentes.",
  panelDescription:
    "Suporte técnico, ponto eletrônico, segurança e manutenção geral em um fluxo simples.",
  responseLabel: "latência de resposta",
  responseValue: "< 24h",
  regionLabel: "região",
  regionValue: "RS / BR",
  metricServicesValue: "06",
  metricServicesLabel: "frentes de serviço",
  metricContactValue: "01",
  metricContactLabel: "contato direto",
  metricCustomValue: "100%",
  metricCustomLabel: "solução sob medida",
  metricsNote: "feito para pessoas, pensado com tecnologia",
  servicesEyebrow: "o que eu resolvo",
  servicesTitle: "Tecnologia que",
  servicesAccent: "funciona no mundo real.",
  servicesDescription:
    "Não importa se o desafio está dentro do computador, no controle de ponto ou do lado de fora: começo entendendo o contexto e entrego o próximo passo.",
  servicesAction: "Ver calculadora",
  servicesRail: "serviços\nintegrados",
  servicesRange: "01 — 06",
  methodEyebrow: "como funciona",
  methodTitle: "Sem enrolação.",
  methodAccent: "Só clareza.",
  methodStep1Title: "Você conta o cenário",
  methodStep1Description:
    "Por WhatsApp ou pelo orçamento guiado, você descreve o que precisa.",
  methodStep2Title: "Eu encontro o caminho",
  methodStep2Description:
    "Analiso a situação, explico as opções e combino o que faz sentido.",
  methodStep3Title: "A solução acontece",
  methodStep3Description:
    "Você acompanha um atendimento direto, organizado e sem surpresas.",
  quoteEyebrow: "simule agora",
  quoteTitle: "Seu próximo passo",
  quoteAccent: "começa aqui.",
  quoteDescription:
    "Escolha os serviços e receba uma estimativa em segundos. Depois, envie o resumo para conversarmos.",
  bookingEyebrow: "agenda aberta",
  bookingTitle: "Escolha um horário",
  bookingAccent: "que funciona para você.",
  bookingStatus: "horários atualizados em tempo real",
  bookingDescription:
    "A vaga fica bloqueada assim que você confirma os seus dados.",
  contactEyebrow: "vamos conversar",
  contactTitle: "Tecnologia boa é a que deixa o dia",
  contactAccent: "mais leve.",
  contactCardEyebrow: "resposta direta",
  contactCardTitle: "Fale comigo pelo WhatsApp.",
  contactDescription:
    "Explique o que está acontecendo. Se eu puder resolver, vou te mostrar como.",
  contactAction: "Abrir conversa",
  contactEmail: "jean.d.serres@gmail.com",
  whatsappDisplay: "(51) 98168-1426",
  whatsappNumber: "5551981681426",
  location: "Rio Grande do Sul · Brasil",
  footerTagline: "Tecnologia, manutenção e presença.",
} as const;

export type SiteContent = {
  -readonly [Key in keyof typeof DEFAULT_SITE_CONTENT]: string;
};

export const SITE_CONTENT_FIELDS: {
  section: string;
  key: keyof SiteContent;
  label: string;
  multiline?: boolean;
}[] = [
  { section: "Aparência", key: "siteTheme", label: "Tema do site" },
  { section: "Marca e contato", key: "brandMark", label: "Símbolo da marca" },
  { section: "Marca e contato", key: "brandName", label: "Nome da marca" },
  { section: "Marca e contato", key: "logoUrl", label: "Logo da frente (URL ou upload)" },
  {
    section: "Marca e contato",
    key: "ownerName",
    label: "Nome exibido no rodapé",
  },
  { section: "Marca e contato", key: "contactEmail", label: "E-mail" },
  {
    section: "Marca e contato",
    key: "whatsappDisplay",
    label: "WhatsApp exibido",
  },
  {
    section: "Marca e contato",
    key: "whatsappNumber",
    label: "WhatsApp para links (somente números)",
  },
  { section: "Marca e contato", key: "location", label: "Localização" },
  { section: "Cabeçalho", key: "topLine", label: "Mensagem superior" },
  { section: "Cabeçalho", key: "topAction", label: "Link superior" },
  { section: "Cabeçalho", key: "navServices", label: "Menu: serviços" },
  { section: "Cabeçalho", key: "navQuote", label: "Menu: orçamento" },
  { section: "Cabeçalho", key: "navBooking", label: "Menu: agenda" },
  { section: "Cabeçalho", key: "navContact", label: "Menu: contato" },
  { section: "Cabeçalho", key: "navAdmin", label: "Menu: painel" },
  { section: "Cabeçalho", key: "mainAction", label: "Botão principal" },
  { section: "Apresentação", key: "heroStatus", label: "Disponibilidade" },
  { section: "Apresentação", key: "heroTitle", label: "Título" },
  { section: "Apresentação", key: "heroAccent", label: "Destaque do título" },
  { section: "Apresentação", key: "heroImageUrl", label: "Imagem principal da capa (URL ou upload)" },
  {
    section: "Apresentação",
    key: "heroDescription",
    label: "Descrição",
    multiline: true,
  },
  {
    section: "Apresentação",
    key: "heroPrimaryAction",
    label: "Botão principal",
  },
  {
    section: "Apresentação",
    key: "heroSecondaryAction",
    label: "Botão secundário",
  },
  {
    section: "Apresentação",
    key: "heroProofTitle",
    label: "Destaque de atendimento",
  },
  {
    section: "Apresentação",
    key: "heroProofDetail",
    label: "Detalhe do atendimento",
  },
  { section: "Cartão de destaque", key: "panelCode", label: "Identificação" },
  {
    section: "Cartão de destaque",
    key: "panelImageUrl",
    label: "Logo ou imagem do cartão (PNG/JPG, URL ou upload)",
  },
  { section: "Cartão de destaque", key: "panelEyebrow", label: "Chamada" },
  { section: "Cartão de destaque", key: "panelTitle", label: "Título" },
  {
    section: "Cartão de destaque",
    key: "panelAccent",
    label: "Destaque do título",
  },
  {
    section: "Cartão de destaque",
    key: "panelDescription",
    label: "Descrição",
    multiline: true,
  },
  {
    section: "Cartão de destaque",
    key: "responseLabel",
    label: "Rótulo de resposta",
  },
  {
    section: "Cartão de destaque",
    key: "responseValue",
    label: "Tempo de resposta",
  },
  {
    section: "Cartão de destaque",
    key: "regionLabel",
    label: "Rótulo de região",
  },
  { section: "Cartão de destaque", key: "regionValue", label: "Região" },
  {
    section: "Indicadores",
    key: "metricServicesValue",
    label: "Valor: serviços",
  },
  {
    section: "Indicadores",
    key: "metricServicesLabel",
    label: "Texto: serviços",
  },
  {
    section: "Indicadores",
    key: "metricContactValue",
    label: "Valor: contato",
  },
  {
    section: "Indicadores",
    key: "metricContactLabel",
    label: "Texto: contato",
  },
  {
    section: "Indicadores",
    key: "metricCustomValue",
    label: "Valor: personalização",
  },
  {
    section: "Indicadores",
    key: "metricCustomLabel",
    label: "Texto: personalização",
  },
  {
    section: "Indicadores",
    key: "metricsNote",
    label: "Frase dos indicadores",
  },
  { section: "Serviços", key: "servicesEyebrow", label: "Chamada" },
  { section: "Serviços", key: "servicesTitle", label: "Título" },
  { section: "Serviços", key: "servicesAccent", label: "Destaque do título" },
  {
    section: "Serviços",
    key: "servicesDescription",
    label: "Descrição",
    multiline: true,
  },
  { section: "Serviços", key: "servicesAction", label: "Link para orçamento" },
  {
    section: "Serviços",
    key: "servicesRail",
    label: "Texto lateral (quebra linha com Enter)",
    multiline: true,
  },
  { section: "Serviços", key: "servicesRange", label: "Numeração lateral" },
  { section: "Como funciona", key: "methodEyebrow", label: "Chamada" },
  { section: "Como funciona", key: "methodTitle", label: "Título" },
  {
    section: "Como funciona",
    key: "methodAccent",
    label: "Destaque do título",
  },
  {
    section: "Como funciona",
    key: "methodStep1Title",
    label: "Etapa 1: título",
  },
  {
    section: "Como funciona",
    key: "methodStep1Description",
    label: "Etapa 1: descrição",
    multiline: true,
  },
  {
    section: "Como funciona",
    key: "methodStep2Title",
    label: "Etapa 2: título",
  },
  {
    section: "Como funciona",
    key: "methodStep2Description",
    label: "Etapa 2: descrição",
    multiline: true,
  },
  {
    section: "Como funciona",
    key: "methodStep3Title",
    label: "Etapa 3: título",
  },
  {
    section: "Como funciona",
    key: "methodStep3Description",
    label: "Etapa 3: descrição",
    multiline: true,
  },
  { section: "Orçamento", key: "quoteEyebrow", label: "Chamada" },
  { section: "Orçamento", key: "quoteTitle", label: "Título" },
  { section: "Orçamento", key: "quoteAccent", label: "Destaque do título" },
  {
    section: "Orçamento",
    key: "quoteDescription",
    label: "Descrição",
    multiline: true,
  },
  { section: "Agenda", key: "bookingEyebrow", label: "Chamada" },
  { section: "Agenda", key: "bookingTitle", label: "Título" },
  { section: "Agenda", key: "bookingAccent", label: "Destaque do título" },
  { section: "Agenda", key: "bookingStatus", label: "Status da agenda" },
  {
    section: "Agenda",
    key: "bookingDescription",
    label: "Descrição",
    multiline: true,
  },
  { section: "Contato", key: "contactEyebrow", label: "Chamada" },
  { section: "Contato", key: "contactTitle", label: "Título" },
  { section: "Contato", key: "contactAccent", label: "Destaque do título" },
  { section: "Contato", key: "contactCardEyebrow", label: "Chamada do cartão" },
  { section: "Contato", key: "contactCardTitle", label: "Título do cartão" },
  {
    section: "Contato",
    key: "contactDescription",
    label: "Descrição",
    multiline: true,
  },
  { section: "Contato", key: "contactAction", label: "Botão do WhatsApp" },
  { section: "Rodapé", key: "footerTagline", label: "Texto do rodapé" },
];

export function normalizeSiteContent(value: unknown): SiteContent {
  const source = typeof value === "object" && value !== null ? value : {};
  const content: SiteContent = { ...DEFAULT_SITE_CONTENT };
  for (const key of Object.keys(
    DEFAULT_SITE_CONTENT
  ) as (keyof SiteContent)[]) {
    const candidate = Reflect.get(source, key);
    if (key === "siteTheme" && candidate !== "light" && candidate !== "dark") {
      continue;
    }
    if (typeof candidate === "string") content[key] = candidate;
  }
  return content;
}
