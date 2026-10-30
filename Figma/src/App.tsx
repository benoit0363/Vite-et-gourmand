import { useState } from 'react'

type Page = 'home' | 'menus' | 'about' | 'cart'
type IconName = 'award' | 'calendar' | 'cart' | 'clock' | 'close' | 'heart' | 'leaf' | 'mail' | 'map' | 'menu' | 'minus' | 'phone' | 'plus' | 'star' | 'trash' | 'users'

const photos = {
  hero: 'https://images.unsplash.com/photo-1555244162-803834f70033?auto=format&fit=crop&w=1800&q=88',
  food1: 'https://images.unsplash.com/photo-1576842546422-60562b9242ae?auto=format&fit=crop&w=900&q=85',
  food2: 'https://images.unsplash.com/photo-1740047602722-b4993b79e4b7?auto=format&fit=crop&w=900&q=85',
  food3: 'https://images.unsplash.com/photo-1633424414664-c24a6d28086b?auto=format&fit=crop&w=900&q=85',
  team: 'https://images.unsplash.com/photo-1671612451404-f4f8fc5fe25e?auto=format&fit=crop&w=900&q=85',
  chef: 'https://images.unsplash.com/photo-1616734755909-bb016ce64930?auto=format&fit=crop&w=900&q=85',
}

const menus = [
  { id: 1, title: 'Menu Prestige de Noël', theme: 'Noël', price: 65, image: photos.food2 },
  { id: 2, title: 'Menu Tradition de Pâques', theme: 'Pâques', price: 40, image: photos.food3 },
  { id: 3, title: 'Menu Fraîcheur', theme: 'Classique', price: 32, image: photos.food1 },
]

const iconPaths: Record<IconName, React.ReactNode> = {
  award: <><circle cx="12" cy="8" r="5" /><path d="m8.5 12-1 9 4.5-2 4.5 2-1-9" /></>,
  calendar: <><rect x="3" y="5" width="18" height="16" rx="2" /><path d="M16 3v4M8 3v4M3 10h18" /></>,
  cart: <><path d="M3 4h2l2 10h11l2-7H6" /><circle cx="9" cy="19" r="1" /><circle cx="18" cy="19" r="1" /></>,
  clock: <><circle cx="12" cy="12" r="9" /><path d="M12 7v5l3 2" /></>,
  close: <path d="m6 6 12 12M18 6 6 18" />,
  heart: <path d="M20.8 4.6a5.5 5.5 0 0 0-7.8 0L12 5.7l-1.1-1.1a5.5 5.5 0 0 0-7.8 7.8L12 21l8.8-8.6a5.5 5.5 0 0 0 0-7.8Z" />,
  leaf: <><path d="M20 4C11 4 6 8 6 14c0 3 2 5 5 5 6 0 9-7 9-15Z" /><path d="M4 21c3-6 7-9 12-11" /></>,
  mail: <><rect x="3" y="5" width="18" height="14" rx="2" /><path d="m3 7 9 6 9-6" /></>,
  map: <><path d="M20 10c0 5-8 11-8 11S4 15 4 10a8 8 0 1 1 16 0Z" /><circle cx="12" cy="10" r="2" /></>,
  menu: <path d="M4 7h16M4 12h16M4 17h16" />,
  minus: <path d="M5 12h14" />,
  phone: <path d="M22 17v3a2 2 0 0 1-2 2C10 21 3 14 2 4a2 2 0 0 1 2-2h3l2 5-2 2c2 4 4 6 8 8l2-2 5 2Z" />,
  plus: <path d="M12 5v14M5 12h14" />,
  star: <path d="m12 3 2.8 5.7 6.2.9-4.5 4.4 1.1 6.2-5.6-2.9-5.6 2.9 1.1-6.2L3 9.6l6.2-.9L12 3Z" />,
  trash: <><path d="M4 7h16M9 7V4h6v3M7 7l1 14h8l1-14M10 11v6M14 11v6" /></>,
  users: <><circle cx="9" cy="8" r="4" /><path d="M2 21v-2a5 5 0 0 1 5-5h4a5 5 0 0 1 5 5v2M16 4a4 4 0 0 1 0 8M22 21v-2a5 5 0 0 0-4-4.6" /></>,
}

function Icon({ name, size = 18 }: { name: IconName; size?: number }) {
  return (
    <svg aria-hidden="true" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      {iconPaths[name]}
    </svg>
  )
}

export default function App() {
  const [page, setPage] = useState<Page>('home')
  const [mobileOpen, setMobileOpen] = useState(false)
  const [cart, setCart] = useState<Record<number, number>>({ 1: 1, 2: 1 })

  const navigate = (next: Page) => {
    setPage(next)
    setMobileOpen(false)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const updateQuantity = (id: number, amount: number) => {
    setCart((current) => {
      const quantity = Math.max(0, (current[id] || 0) + amount)
      const updated = { ...current, [id]: quantity }
      if (!quantity) delete updated[id]
      return updated
    })
  }

  const count = Object.values(cart).reduce((sum, quantity) => sum + quantity, 0)
  const total = menus.reduce((sum, item) => sum + (cart[item.id] || 0) * item.price, 0)

  return (
    <div className="app-shell">
      <Header page={page} count={count} mobileOpen={mobileOpen} setMobileOpen={setMobileOpen} navigate={navigate} />
      <main className="page-content">
        {page === 'home' && <Home navigate={navigate} />}
        {page === 'menus' && <Menus cart={cart} updateQuantity={updateQuantity} />}
        {page === 'about' && <About />}
        {page === 'cart' && <Order cart={cart} total={total} updateQuantity={updateQuantity} navigate={navigate} />}
      </main>
      {page !== 'cart' && <Footer />}
    </div>
  )
}

function Header({
  page,
  count,
  mobileOpen,
  setMobileOpen,
  navigate,
}: {
  page: Page
  count: number
  mobileOpen: boolean
  setMobileOpen: (value: boolean) => void
  navigate: (page: Page) => void
}) {
  return (
    <>
      <div className="prototype-bar">Menu showcase and ordering app <span>⌄</span></div>
      <header className="site-header">
        <div className="header-inner">
          <button className="brand" onClick={() => navigate('home')}>Vite & Gourmand</button>
          <nav className="desktop-nav" aria-label="Navigation principale">
            <button className={page === 'home' ? 'active' : ''} onClick={() => navigate('home')}>Accueil</button>
            <button className={page === 'menus' ? 'active' : ''} onClick={() => navigate('menus')}>Nos Menus</button>
            <button className={page === 'about' ? 'active' : ''} onClick={() => navigate('about')}>À Propos</button>
            <a href="#contact">Contact</a>
          </nav>
          <button className="order-button" onClick={() => navigate('cart')}>
            <Icon name="cart" size={17} /><span>Commander</span>
            {count > 0 && <b>{count}</b>}
          </button>
          <button className="mobile-toggle" onClick={() => setMobileOpen(!mobileOpen)} aria-label="Menu">
            <Icon name={mobileOpen ? 'close' : 'menu'} />
          </button>
        </div>
        {mobileOpen && (
          <nav className="mobile-nav">
            <button onClick={() => navigate('home')}>Accueil</button>
            <button onClick={() => navigate('menus')}>Nos Menus</button>
            <button onClick={() => navigate('about')}>À Propos</button>
            <a href="#contact">Contact</a>
          </nav>
        )}
      </header>
    </>
  )
}

function Home({ navigate }: { navigate: (page: Page) => void }) {
  const strengths: [IconName, string, string][] = [
    ['award', 'Qualité artisanale', 'Des plats préparés avec passion et savoir-faire depuis 25 ans'],
    ['calendar', 'Menus évolutifs', 'Nos cartes changent régulièrement selon les saisons et événements'],
    ['star', 'Service personnalisé', 'Julie et José à votre écoute pour des prestations sur-mesure'],
    ['users', 'Tous événements', 'De Noël à Pâques, en passant par vos fêtes personnelles'],
  ]

  return (
    <>
      <section className="home-hero">
        <img src={photos.hero} alt="Préparation d'un événement par Vite & Gourmand" />
        <div className="hero-shade" />
        <div className="hero-copy">
          <h1>Vite & Gourmand</h1>
          <p>Traiteur à Bordeaux depuis 25 ans - Julie et José au service de vos événements</p>
          <div>
            <button onClick={() => navigate('menus')}>Découvrir nos menus</button>
            <button className="secondary" onClick={() => navigate('cart')}>Nous contacter</button>
          </div>
        </div>
      </section>

      <section className="why-section">
        <h2>Pourquoi nous choisir ?</h2>
        <div className="strength-grid">
          {strengths.map(([icon, title, text]) => (
            <article key={title}>
              <span><Icon name={icon} size={21} /></span>
              <h3>{title}</h3>
              <p>{text}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="cta-band">
        <h2>Prêt à commander ?</h2>
        <p>Découvrez nos menus actuels et passez votre commande en quelques clics</p>
        <button onClick={() => navigate('menus')}>Voir les menus disponibles</button>
      </section>

      <section className="creations">
        <h2>Nos créations</h2>
        <div>
          <img src={photos.food1} alt="Création gastronomique" />
          <img src={photos.food2} alt="Plat de fête" />
          <img src={photos.food3} alt="Buffet coloré" />
        </div>
      </section>
    </>
  )
}

function Menus({ cart, updateQuantity }: { cart: Record<number, number>; updateQuantity: (id: number, amount: number) => void }) {
  return (
    <section className="menus-page">
      <div className="simple-heading">
        <h1>Nos Menus</h1>
        <p>Des menus gourmands pour tous vos événements</p>
      </div>
      <div className="menu-gallery">
        {menus.map((item) => (
          <article className="menu-tile" key={item.id}>
            <img src={item.image} alt={item.title} />
            <div>
              <small>{item.theme}</small>
              <h2>{item.title}</h2>
              <p>Une sélection de saison préparée avec des produits frais et tout notre savoir-faire.</p>
              <div className="menu-tile-bottom">
                <strong>{item.price.toFixed(2)} €</strong>
                <button onClick={() => updateQuantity(item.id, 1)}>
                  <Icon name="plus" size={16} /> {cart[item.id] ? `Ajouté (${cart[item.id]})` : 'Commander'}
                </button>
              </div>
            </div>
          </article>
        ))}
      </div>
    </section>
  )
}

function About() {
  const values: [IconName, string, string][] = [
    ['heart', 'Passion', "L'amour de la cuisine et du bien-manger guide chacun de nos services"],
    ['award', 'Qualité', 'Sélection rigoureuse de nos produits pour garantir l’excellence'],
    ['leaf', 'Fraîcheur', 'Produits frais et de saison pour des saveurs authentiques'],
    ['clock', 'Expérience', '25 ans de savoir-faire au service de vos événements'],
  ]

  return (
    <section className="about-page">
      <div className="simple-heading">
        <h1>Notre Histoire</h1>
        <p>Depuis 25 ans, Julie et José partagent leur passion de la gastronomie au service de vos<br />événements à Bordeaux</p>
      </div>
      <div className="story">
        <div className="story-copy">
          <h2>Une passion familiale</h2>
          <p>Tout a commencé en 1999, lorsque Julie et José ont décidé de transformer leur passion pour la cuisine en métier. Avec pour seul bagage leur amour des bons produits et le désir de faire plaisir, ils ont créé Vite & Gourmand.</p>
          <p>Aujourd’hui, après 25 ans d’expérience, notre service traiteur s’est adapté et agrandi en gardant une conviction : chaque événement mérite la même attention.</p>
          <p>Que ce soit pour Noël, Pâques, ou tout autre événement qui vous est cher, nous mettons à votre service une cuisine généreuse avec des plats préparés avec amour et savoir-faire.</p>
        </div>
        <div className="story-images">
          <img src={photos.team} alt="Julie et José dans leur atelier" />
          <img src={photos.chef} alt="José en cuisine" />
        </div>
      </div>
      <div className="values">
        <h2>Nos Valeurs</h2>
        <div>
          {values.map(([icon, title, text]) => (
            <article key={title}>
              <span><Icon name={icon} size={21} /></span>
              <h3>{title}</h3>
              <p>{text}</p>
            </article>
          ))}
        </div>
      </div>
      <div className="founders-note">
        <h2>Julie & José</h2>
        <p>Julie, passionnée de pâtisserie, crée des desserts qui émerveillent vos papilles, tandis que José,<br />véritable chef cuisinier, sublime les produits de saison.</p>
        <p>Ensemble, ils forment un duo complémentaire qui met toute son énergie et son expertise à votre service.<br />Leur objectif : faire de votre événement un moment inoubliable où la gastronomie est à l’honneur.</p>
      </div>
    </section>
  )
}

function Order({
  cart,
  total,
  updateQuantity,
  navigate,
}: {
  cart: Record<number, number>
  total: number
  updateQuantity: (id: number, amount: number) => void
  navigate: (page: Page) => void
}) {
  const selected = menus.filter((item) => cart[item.id])
  return (
    <section className="order-page">
      <div className="order-list">
        {selected.length === 0 ? (
          <div className="empty-cart">
            <Icon name="cart" size={30} />
            <h2>Votre panier est vide</h2>
            <button onClick={() => navigate('menus')}>Voir les menus</button>
          </div>
        ) : selected.map((item) => (
          <article className="order-item" key={item.id}>
            <img src={item.image} alt={item.title} />
            <div className="order-item-copy">
              <h2>{item.title}</h2>
              <p>{item.theme}</p>
              <div className="quantity">
                <button onClick={() => updateQuantity(item.id, -1)}><Icon name="minus" size={16} /></button>
                <span>{cart[item.id]}</span>
                <button onClick={() => updateQuantity(item.id, 1)}><Icon name="plus" size={16} /></button>
              </div>
            </div>
            <button className="delete" onClick={() => updateQuantity(item.id, -cart[item.id])} aria-label={`Supprimer ${item.title}`}><Icon name="trash" size={17} /></button>
            <strong>{(item.price * cart[item.id]).toFixed(2)} €</strong>
          </article>
        ))}
      </div>
      <form className="order-form" onSubmit={(event) => event.preventDefault()}>
        <h1>Informations de commande</h1>
        <label>Nom complet *<input required /></label>
        <label>Email *<input type="email" required /></label>
        <label>Téléphone *<input type="tel" required /></label>
        <label>Date de l’événement *<input type="date" required /></label>
        <label>Nombre de convives *<input type="number" min="1" required /></label>
        <label>Adresse de livraison<input /></label>
        <label>Notes / Demandes spéciales<textarea rows={3} /></label>
        <div className="total-line"><span>Total</span><strong>{total.toFixed(2)} €</strong></div>
        <p className="price-note">* Prix par personne. Le montant final sera calculé selon le nombre de convives.</p>
        <button className="submit-order">Envoyer la commande</button>
        <p className="response-note">Nous vous contacterons sous 24h pour confirmer votre commande</p>
      </form>
    </section>
  )
}

function Footer() {
  return (
    <footer id="contact" className="footer">
      <div className="footer-grid">
        <div>
          <h2>Vite & Gourmand</h2>
          <p>Depuis 25 ans, Julie et José mettent leur passion au service de vos événements à Bordeaux. Traiteur de qualité pour tous vos moments gourmands.</p>
        </div>
        <div>
          <h2>Contact</h2>
          <p><Icon name="map" size={14} /> Bordeaux, France</p>
          <p><Icon name="phone" size={14} /> 05 56 XX XX XX</p>
          <p><Icon name="mail" size={14} /> contact@vite-gourmand.fr</p>
        </div>
        <div>
          <h2>Horaires</h2>
          <p>Lundi - Vendredi : 9h - 18h</p>
          <p>Samedi : 9h - 13h</p>
          <p>Dimanche : Fermé</p>
          <a href="#">Sur rendez-vous pour les prestations</a>
        </div>
      </div>
      <div className="copyright">© 2025 Vite & Gourmand. Tous droits réservés.</div>
    </footer>
  )
}
