import { useEffect, useState } from "react";
import {
  ArrowDownRight,
  ArrowRight,
  CheckCircle2,
  ChevronRight,
  Code2,
  Mail,
  MapPin,
  Menu,
  MessageCircle,
  Sparkles,
  X,
} from "lucide-react";
import { DEFAULT_SERVICES } from "@shared/const";
import {
  DEFAULT_SITE_CONTENT,
  normalizeSiteContent,
} from "@shared/siteContent";
import BookingWidget from "@/components/BookingWidget";
import QuoteBuilder from "@/components/QuoteBuilder";
import ServiceCard from "@/components/ServiceCard";
import { trpc } from "@/lib/trpc";
import { isSupabaseConfigured, supabase } from "@/lib/supabase";

export default function Home() {
  const servicesQuery = trpc.services.list.useQuery(undefined, {
    staleTime: 60_000,
  });
  const contentQuery = trpc.siteContent.get.useQuery(undefined, {
    staleTime: 60_000,
  });
  const services = servicesQuery.data?.length
    ? servicesQuery.data
    : DEFAULT_SERVICES;
  const content = normalizeSiteContent(
    contentQuery.data ?? DEFAULT_SITE_CONTENT
  );
  const heroImageUrl = content.heroImageUrl?.trim();
  const brandLogoUrl = content.logoUrl?.trim();
  const panelImageUrl = content.panelImageUrl?.trim();
  const hasHeroCopy = [
    content.heroStatus,
    content.heroTitle,
    content.heroAccent,
    content.heroDescription,
    content.heroPrimaryAction,
    content.heroSecondaryAction,
    content.heroProofTitle,
    content.heroProofDetail,
  ].some(value => value.trim());
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    document.title = `${content.ownerName} — ${content.brandName}`;
  }, [content.brandName, content.ownerName]);

  useEffect(() => {
    if (!isSupabaseConfigured) return;
    const channel = supabase
      .channel("public-services-live")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "services" },
        () => servicesQuery.refetch()
      )
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "site_settings" },
        () => contentQuery.refetch()
      )
      .subscribe();
    return () => {
      void supabase.removeChannel(channel);
    };
  }, [contentQuery, servicesQuery]);

  const closeMenu = () => setMenuOpen(false);

  if (contentQuery.isPending || servicesQuery.isPending) {
    return <main className="site-loading" role="status">Carregando conteúdo…</main>;
  }

  return (
    <div className="site-shell">
      <div className="topline">
        <div className="container flex items-center justify-between gap-4">
          <span>
            <span className="pulse-dot" /> {content.topLine}
          </span>
          <a href="#agenda">
            {content.topAction} <ArrowRight size={13} />
          </a>
        </div>
      </div>
      <header className="site-header">
        <div className="container flex items-center justify-between gap-5">
          <a className="brand-mark" href="#top">
            {brandLogoUrl ? (
              <img
                className="brand-logo"
                src={brandLogoUrl}
                alt={`${content.brandName} logo`}
              />
            ) : (
              <span>{content.brandMark}</span>
            )}
            <b>{content.brandName}</b>
          </a>
          <nav className={`site-nav ${menuOpen ? "site-nav-open" : ""}`}>
            <a href="#servicos" onClick={closeMenu}>
              {content.navServices}
            </a>
            <a href="#orcamento" onClick={closeMenu}>
              {content.navQuote}
            </a>
            <a href="#agenda" onClick={closeMenu}>
              {content.navBooking}
            </a>
            <a href="#contato" onClick={closeMenu}>
              {content.navContact}
            </a>
            <a className="nav-admin" href="/admin" onClick={closeMenu}>
              {content.navAdmin} <ChevronRight size={14} />
            </a>
          </nav>
          <div className="flex items-center gap-2">
            <a
              className="button-primary hidden sm:inline-flex"
              href="#orcamento"
            >
              {content.mainAction} <ArrowRight size={16} />
            </a>
            <button
              className="menu-button"
              type="button"
              onClick={() => setMenuOpen(!menuOpen)}
              aria-label="Abrir menu"
            >
              {menuOpen ? <X size={21} /> : <Menu size={21} />}
            </button>
          </div>
        </div>
      </header>
      <main id="top">
        <section className="hero-section">
          <div className={`hero-grid container ${heroImageUrl && !hasHeroCopy ? "hero-grid-image-only" : ""}`}>
            {hasHeroCopy && <div className="hero-copy">
              {content.heroStatus.trim() && <div className="hero-kicker">
                <span className="status-dot">●</span> {content.heroStatus}{" "}
                <span className="hero-kicker-line" />
              </div>}
              {(content.heroTitle.trim() || content.heroAccent.trim()) && <h1>
                {content.heroTitle}
                {content.heroTitle.trim() && content.heroAccent.trim() && <br />}
                {content.heroAccent.trim() && <em>{content.heroAccent}</em>}
              </h1>}
              {content.heroDescription.trim() && <p className="hero-lede">{content.heroDescription}</p>}
              {(content.heroPrimaryAction.trim() || content.heroSecondaryAction.trim()) && <div className="hero-actions">
                {content.heroPrimaryAction.trim() && <a className="button-primary" href="#orcamento">
                  {content.heroPrimaryAction} <ArrowRight size={17} />
                </a>}
                {content.heroSecondaryAction.trim() && <a className="button-text" href="#servicos">
                  {content.heroSecondaryAction} <ArrowDownRight size={17} />
                </a>}
              </div>}
              {(content.heroProofTitle.trim() || content.heroProofDetail.trim()) && <div className="hero-proof">
                <div className="avatar-stack">
                  <span>{content.brandMark.replace("/", "")}</span>
                  <span>+</span>
                </div>
                <p>
                  {content.heroProofTitle.trim() && <strong>{content.heroProofTitle}</strong>}
                  {content.heroProofTitle.trim() && content.heroProofDetail.trim() && <br />}
                  {content.heroProofDetail.trim() && <span>{content.heroProofDetail}</span>}
                </p>
              </div>}
            </div>}
            <div className={`hero-panel ${heroImageUrl ? "hero-panel-with-image" : ""}`}>
              {heroImageUrl ? <img className="hero-panel-upload" src={heroImageUrl} alt={`${content.brandName} capa`} /> : <>
              <div className="panel-noise" />
              <div className="panel-noise" />
              <div className="panel-head">
                <span className="eyebrow text-blue-200">
                  {content.panelCode}
                </span>
                <span className="panel-live">
                  <span className="pulse-dot" /> online
                </span>
              </div>
              <div className="panel-main">
                {panelImageUrl ? (
                  <div className="panel-image-wrap">
                    <img
                      className="panel-image"
                      src={panelImageUrl}
                      alt={`${content.brandName} logo`}
                    />
                  </div>
                ) : (
                  <div className="panel-orbit">
                    <div className="orbit-ring orbit-ring-one" />
                    <div className="orbit-ring orbit-ring-two" />
                    <div className="orbit-core">
                      <Code2 size={33} />
                    </div>
                    <span className="orbit-node node-one" />
                    <span className="orbit-node node-two" />
                    <span className="orbit-node node-three" />
                  </div>
                )}
                <p className="eyebrow text-blue-200">{content.panelEyebrow}</p>
                <h2>
                  {content.panelTitle}
                  <br />
                  <span>{content.panelAccent}</span>
                </h2>
                <p className="panel-note">{content.panelDescription}</p>
              </div>
              <div className="panel-foot">
                <span>{content.responseLabel}</span>
                <strong>{content.responseValue}</strong>
                <span className="panel-foot-line" />
                <span>{content.regionLabel}</span>
                <strong>{content.regionValue}</strong>
              </div>
              </>}
            </div>
          </div>
        </section>
        <section className="metrics-band">
          <div className="container metrics-grid">
            <div>
              <strong>{content.metricServicesValue}</strong>
              <span>{content.metricServicesLabel}</span>
            </div>
            <div>
              <strong>{content.metricContactValue}</strong>
              <span>{content.metricContactLabel}</span>
            </div>
            <div>
              <strong>{content.metricCustomValue}</strong>
              <span>{content.metricCustomLabel}</span>
            </div>
            <div className="metrics-note">
              <Sparkles size={17} /> <span>{content.metricsNote}</span>
            </div>
          </div>
        </section>
        <section className="section-block services-section" id="servicos">
          <div className="container">
            <div className="section-intro">
              <div>
                <p className="eyebrow text-blue-600">
                  {content.servicesEyebrow}
                </p>
                <h2 className="section-title">
                  {content.servicesTitle}
                  <br />
                  <span>{content.servicesAccent}</span>
                </h2>
              </div>
              <div className="section-aside">
                <p>{content.servicesDescription}</p>
                <a className="button-text" href="#orcamento">
                  {content.servicesAction} <ArrowRight size={16} />
                </a>
              </div>
            </div>
            <div className="services-layout">
              <div className="services-rail">
                <div className="rail-mark">{content.brandMark}</div>
                <p>
                  {content.servicesRail.split("\n").map((line, index) => (
                    <span key={`${line}-${index}`}>
                      {line}
                      <br />
                    </span>
                  ))}
                </p>
                <span className="rail-line" />
                <span className="rail-index">{content.servicesRange}</span>
              </div>
              <div className="services-grid">
                {services.map((service, index) => (
                  <ServiceCard
                    key={service.id}
                    service={service}
                    index={index}
                    onSelect={() =>
                      document
                        .getElementById("orcamento")
                        ?.scrollIntoView({ behavior: "smooth" })
                    }
                  />
                ))}
              </div>
            </div>
          </div>
        </section>
        <section className="method-section">
          <div className="container method-grid">
            <div>
              <p className="eyebrow text-blue-200">{content.methodEyebrow}</p>
              <h2 className="font-display mt-4 max-w-xl text-4xl font-semibold tracking-tight text-white sm:text-5xl">
                {content.methodTitle}
                <br />
                <span className="text-blue-400">{content.methodAccent}</span>
              </h2>
            </div>
            <div className="method-steps">
              <div>
                <span>01</span>
                <div>
                  <h3>{content.methodStep1Title}</h3>
                  <p>{content.methodStep1Description}</p>
                </div>
              </div>
              <div>
                <span>02</span>
                <div>
                  <h3>{content.methodStep2Title}</h3>
                  <p>{content.methodStep2Description}</p>
                </div>
              </div>
              <div>
                <span>03</span>
                <div>
                  <h3>{content.methodStep3Title}</h3>
                  <p>{content.methodStep3Description}</p>
                </div>
              </div>
            </div>
          </div>
        </section>
        <section className="section-block quote-section" id="orcamento">
          <div className="container">
            <div className="section-intro compact">
              <div>
                <p className="eyebrow text-blue-600">{content.quoteEyebrow}</p>
                <h2 className="section-title">
                  {content.quoteTitle}
                  <br />
                  <span>{content.quoteAccent}</span>
                </h2>
              </div>
              <p className="section-aside max-w-sm">
                {content.quoteDescription}
              </p>
            </div>
            <QuoteBuilder services={services} content={content} />
          </div>
        </section>
        <section className="section-block booking-section" id="agenda">
          <div className="container">
            <div className="section-intro compact">
              <div>
                <p className="eyebrow text-blue-600">
                  {content.bookingEyebrow}
                </p>
                <h2 className="section-title">
                  {content.bookingTitle}
                  <br />
                  <span>{content.bookingAccent}</span>
                </h2>
              </div>
              <div className="section-aside">
                <div className="flex items-center gap-2 text-sm font-semibold text-slate-600">
                  <CheckCircle2 size={17} className="text-lime-600" />{" "}
                  {content.bookingStatus}
                </div>
                <p className="mt-3">{content.bookingDescription}</p>
              </div>
            </div>
            <BookingWidget content={content} />
          </div>
        </section>
        <section className="contact-section" id="contato">
          <div className="container contact-grid">
            <div>
              <p className="eyebrow text-blue-200">{content.contactEyebrow}</p>
              <h2 className="mt-4 max-w-2xl font-display text-4xl font-semibold tracking-tight text-white sm:text-6xl">
                {content.contactTitle}{" "}
                <span className="text-blue-400">{content.contactAccent}</span>
              </h2>
            </div>
            <div className="contact-card">
              <div className="contact-icon">
                <MessageCircle size={22} />
              </div>
              <p className="eyebrow text-blue-200">
                {content.contactCardEyebrow}
              </p>
              <h3 className="mt-3 font-display text-2xl font-semibold text-white">
                {content.contactCardTitle}
              </h3>
              <p className="mt-2 text-sm leading-6 text-slate-400">
                {content.contactDescription}
              </p>
              <a
                className="button-primary mt-6 w-full justify-center"
                href={`https://wa.me/${content.whatsappNumber}`}
                target="_blank"
                rel="noreferrer"
              >
                {content.contactAction} <ArrowRight size={17} />
              </a>
              <div className="mt-6 flex flex-col gap-3 border-t border-white/10 pt-5 text-sm text-slate-400">
                <a
                  className="flex items-center gap-3 hover:text-white"
                  href={`mailto:${content.contactEmail}`}
                >
                  <Mail size={16} /> {content.contactEmail}
                </a>
                <span className="flex items-center gap-3">
                  <MapPin size={16} /> {content.location}
                </span>
                <span className="flex items-center gap-3">
                  <MessageCircle size={16} /> {content.whatsappDisplay}
                </span>
              </div>
            </div>
          </div>
        </section>
      </main>
      <footer className="site-footer">
        <div className="container flex justify-end py-7">
          <div className="text-xs font-semibold text-slate-400">
            <a
              href="https://github.com/JeanSd1"
              target="_blank"
              rel="noreferrer"
            >
              Desenvolvido por
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
}
