import { useEffect, useMemo, useState } from 'react';
import {
  Alert,
  Button,
  CircularProgress,
  FormControl,
  InputLabel,
  MenuItem,
  Select,
  Snackbar,
  TextField,
} from '@mui/material';
import ArrowForwardRoundedIcon from '@mui/icons-material/ArrowForwardRounded';
import CalendarMonthRoundedIcon from '@mui/icons-material/CalendarMonthRounded';
import CheckCircleRoundedIcon from '@mui/icons-material/CheckCircleRounded';
import ChevronRightRoundedIcon from '@mui/icons-material/ChevronRightRounded';
import CloseRoundedIcon from '@mui/icons-material/CloseRounded';
import FavoriteBorderRoundedIcon from '@mui/icons-material/FavoriteBorderRounded';
import InstagramIcon from '@mui/icons-material/Instagram';
import LocalPhoneRoundedIcon from '@mui/icons-material/LocalPhoneRounded';
import LocationOnOutlinedIcon from '@mui/icons-material/LocationOnOutlined';
import MenuRoundedIcon from '@mui/icons-material/MenuRounded';
import RestaurantRoundedIcon from '@mui/icons-material/RestaurantRounded';
import StarRoundedIcon from '@mui/icons-material/StarRounded';

const today = new Date();
const localDate = (date) => `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
const todayString = localDate(today);
const maxDate = new Date(today.getFullYear(), today.getMonth(), today.getDate() + 90);

function formatDate(date) {
  if (!date) return '';
  return new Intl.DateTimeFormat('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric', timeZone: 'UTC' })
    .format(new Date(`${date}T12:00:00.000Z`));
}

function Brand({ light = false }) {
  return (
    <a className={`brand ${light ? 'brand-light' : ''}`} href="#home" aria-label="Little Lemon home">
      <span className="brand-mark"><span /></span>
      <span className="brand-wordmark">little<span>lemon</span></span>
    </a>
  );
}

function MediterraneanArt() {
  return (
    <svg className="med-art" viewBox="0 0 580 480" role="img" aria-label="Illustration of a fresh Mediterranean salad with lemon and olives">
      <defs>
        <pattern id="dots" width="18" height="18" patternUnits="userSpaceOnUse">
          <circle cx="2" cy="2" r="1.5" fill="#49603a" opacity=".18" />
        </pattern>
      </defs>
      <circle cx="295" cy="238" r="205" fill="#f4ce14" />
      <circle cx="295" cy="238" r="175" fill="url(#dots)" />
      <path d="M65 365c80-39 149-53 220-36s133 13 217-18v169H65z" fill="#e6b76a" />
      <ellipse cx="296" cy="266" rx="173" ry="137" fill="#f8f4ea" />
      <ellipse cx="296" cy="253" rx="144" ry="108" fill="#d9e1be" />
      <path d="M176 247c13-42 35-65 62-61 20 3 27 28 13 49-16 25-47 34-75 12zm138-72c29-10 50 3 50 26 0 24-28 40-56 27-24-11-20-44 6-53zm31 119c11-28 41-39 59-21 20 20 0 50-27 56-25 6-41-12-32-35zm-116-3c21-18 48-14 53 8 5 24-17 44-45 38-28-6-31-29-8-46z" fill="#4e6940" />
      <path d="M231 174c18 13 22 29 7 42-13 11-34 4-41-12-8-17 15-42 34-30zm104 67c22 6 27 26 14 39-14 14-39 5-42-14-3-18 10-30 28-25z" fill="#71894f" />
      <circle cx="286" cy="222" r="18" fill="#d76f45" />
      <circle cx="350" cy="297" r="14" fill="#d76f45" />
      <circle cx="222" cy="291" r="13" fill="#d76f45" />
      <circle cx="328" cy="199" r="11" fill="#d76f45" />
      <circle cx="269" cy="310" r="10" fill="#f0b54f" />
      <path d="M155 137c38-14 74-3 94 27-32 7-70-1-94-27zm239-24c-8 35-31 58-68 66 5-33 31-58 68-66z" fill="#567048" />
      <path d="M400 349c42-20 79-12 103 17-34 18-75 11-103-17z" fill="#66804d" />
      <path d="M435 73c24 10 39 28 43 55-28-7-49-26-56-52" fill="#f7fbec" />
      <path d="M447 76c-7 22-8 43-3 64" fill="none" stroke="#d4aa16" strokeWidth="3" />
      <text x="63" y="88" fill="#495e35" fontFamily="DM Sans, sans-serif" fontSize="11" fontWeight="700" letterSpacing="2.7">FRESH · LOCAL · FULL OF LIFE</text>
      <text x="410" y="432" fill="#495e35" fontFamily="Playfair Display, serif" fontSize="16" fontStyle="italic">a little sunshine</text>
    </svg>
  );
}

function BookingCard({ onBooked }) {
  const [date, setDate] = useState(todayString);
  const [guests, setGuests] = useState(2);
  const [time, setTime] = useState('');
  const [slots, setSlots] = useState([]);
  const [availabilityLoading, setAvailabilityLoading] = useState(true);
  const [availabilityRevision, setAvailabilityRevision] = useState(0);
  const [availabilityError, setAvailabilityError] = useState('');
  const [submitError, setSubmitError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [form, setForm] = useState({ name: '', email: '', phone: '', occasion: '', notes: '' });
  const [touched, setTouched] = useState({});

  useEffect(() => {
    const controller = new AbortController();
    async function loadAvailability() {
      setAvailabilityLoading(true);
      setAvailabilityError('');
      setSlots([]);
      try {
        const response = await fetch(`/api/availability?date=${encodeURIComponent(date)}&guests=${guests}`, { signal: controller.signal });
        const payload = await response.json();
        if (!response.ok) throw new Error(payload.message || 'We could not load availability.');
        setSlots(payload.slots);
        setTime((current) => payload.slots.some((slot) => slot.time === current && slot.available) ? current : '');
      } catch (error) {
        if (error.name !== 'AbortError') {
          setSlots([]);
          setAvailabilityError(error.message || 'We could not load availability. Please try again.');
        }
      } finally {
        if (!controller.signal.aborted) setAvailabilityLoading(false);
      }
    }
    loadAvailability();
    return () => controller.abort();
  }, [date, guests, availabilityRevision]);

  const errors = useMemo(() => ({
    name: form.name.trim().length < 2 ? 'Enter your name (at least 2 characters).' : '',
    email: !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email.trim()) ? 'Enter a valid email address.' : '',
    phone: form.phone.trim().length < 7 ? 'Enter a valid phone number.' : '',
  }), [form]);

  function updateForm(event) {
    setForm((current) => ({ ...current, [event.target.name]: event.target.value }));
    setSubmitError('');
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setTouched({ name: true, email: true, phone: true });
    setSubmitError('');
    if (Object.values(errors).some(Boolean)) return;
    if (!time) {
      setSubmitError('Choose a dining time to continue.');
      return;
    }
    setSubmitting(true);
    try {
      const response = await fetch('/api/bookings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...form, date, guests, time }),
      });
      const payload = await response.json();
      if (!response.ok) throw new Error(payload.message || 'Your reservation could not be completed.');
      onBooked(payload.booking);
    } catch (error) {
      setSubmitError(error.message || 'We could not reach the booking service. Please try again.');
      if (error.message?.includes('filled up') || error.message?.includes('has passed')) {
        setTime('');
        setAvailabilityRevision((revision) => revision + 1);
      }
    } finally {
      setSubmitting(false);
    }
  }

  const selectedSlot = slots.find((slot) => slot.time === time);

  return (
    <form className="booking-card" onSubmit={handleSubmit} noValidate>
      <div className="card-topline"><span className="card-icon"><CalendarMonthRoundedIcon fontSize="small" /></span><span>BOOK A TABLE</span><span className="card-topline-rule" /></div>
      <h2>Save your seat.</h2>
      <p className="booking-intro">Good food, good company. Pick a time and we’ll take care of the rest.</p>

      <div className="booking-row">
        <TextField className="booking-field" label="Date" type="date" value={date} onChange={(event) => { setDate(event.target.value); setTime(''); }} inputProps={{ min: todayString, max: localDate(maxDate) }} InputLabelProps={{ shrink: true }} required fullWidth />
        <FormControl className="booking-field" fullWidth>
          <InputLabel id="guests-label">Guests</InputLabel>
          <Select labelId="guests-label" value={guests} label="Guests" onChange={(event) => setGuests(Number(event.target.value))}>
            {Array.from({ length: 8 }, (_, index) => index + 1).map((count) => <MenuItem key={count} value={count}>{count} {count === 1 ? 'guest' : 'guests'}</MenuItem>)}
          </Select>
        </FormControl>
      </div>

      <div className="time-label-row"><span>Choose a time</span><span className="availability-note">{date === todayString ? 'Today' : formatDate(date)}</span></div>
      {availabilityLoading ? (
        <div className="slot-loading" aria-live="polite"><CircularProgress size={20} /> <span>Checking available tables…</span></div>
      ) : availabilityError ? (
        <Alert severity="error" action={<Button color="inherit" size="small" onClick={() => setAvailabilityRevision((revision) => revision + 1)}>Try again</Button>}>{availabilityError}</Alert>
      ) : (
        <div className="time-grid" role="group" aria-label="Available dining times">
          {slots.map((slot) => (
            <button key={slot.time} type="button" className={`time-option ${time === slot.time ? 'selected' : ''}`} disabled={!slot.available} onClick={() => { setTime(slot.time); setSubmitError(''); }} aria-pressed={time === slot.time}>
              <span>{slot.label}</span>
              {slot.passed ? <span className="time-full">Passed</span> : slot.available ? <span className="time-check">{time === slot.time ? <CheckCircleRoundedIcon fontSize="small" /> : `${slot.seatsLeft} left`}</span> : <span className="time-full">Full</span>}
            </button>
          ))}
        </div>
      )}

      <div className="form-divider"><span>Your details</span></div>
      <div className="guest-fields">
        <TextField className="booking-field" name="name" label="Full name" autoComplete="name" value={form.name} onChange={updateForm} onBlur={() => setTouched((value) => ({ ...value, name: true }))} error={Boolean(touched.name && errors.name)} helperText={touched.name && errors.name} fullWidth required />
        <div className="booking-row">
          <TextField className="booking-field" name="email" label="Email address" type="email" autoComplete="email" value={form.email} onChange={updateForm} onBlur={() => setTouched((value) => ({ ...value, email: true }))} error={Boolean(touched.email && errors.email)} helperText={touched.email && errors.email} fullWidth required />
          <TextField className="booking-field" name="phone" label="Phone number" type="tel" autoComplete="tel" value={form.phone} onChange={updateForm} onBlur={() => setTouched((value) => ({ ...value, phone: true }))} error={Boolean(touched.phone && errors.phone)} helperText={touched.phone && errors.phone} fullWidth required />
        </div>
        <FormControl className="booking-field" fullWidth>
          <InputLabel id="occasion-label">Celebrating something?</InputLabel>
          <Select labelId="occasion-label" name="occasion" value={form.occasion} label="Celebrating something?" onChange={updateForm}>
            <MenuItem value="">Just because</MenuItem>
            <MenuItem value="Birthday">Birthday</MenuItem>
            <MenuItem value="Anniversary">Anniversary</MenuItem>
            <MenuItem value="Date night">Date night</MenuItem>
            <MenuItem value="Other celebration">Other celebration</MenuItem>
          </Select>
        </FormControl>
        <TextField className="booking-field" name="notes" label="Anything we should know? (optional)" placeholder="Dietary needs, a special request…" value={form.notes} onChange={updateForm} multiline minRows={2} inputProps={{ maxLength: 500 }} fullWidth />
      </div>

      {submitError && <Alert className="submit-alert" severity="error" role="alert">{submitError}</Alert>}
      <Button className="book-submit" type="submit" variant="contained" size="large" disabled={submitting || availabilityLoading || !selectedSlot} endIcon={submitting ? <CircularProgress size={18} color="inherit" /> : <ArrowForwardRoundedIcon />}>
        {submitting ? 'Booking your table…' : 'Confirm reservation'}
      </Button>
      <p className="privacy-note">No charge to book · Confirmation shown instantly</p>
    </form>
  );
}

function Confirmation({ booking, onReset }) {
  const slotLabels = { '12:00': '12:00 PM', '13:30': '1:30 PM', '15:00': '3:00 PM', '17:30': '5:30 PM', '19:00': '7:00 PM', '20:30': '8:30 PM' };
  return (
    <section className="confirmation-card" aria-live="polite">
      <div className="confirmation-icon"><CheckCircleRoundedIcon /></div>
      <span className="eyebrow">IT’S A DATE</span>
      <h2>We saved you a seat, {booking.name.split(' ')[0]}.</h2>
      <p className="confirmation-copy">We can’t wait to welcome you. Your table is booked and all the little details are below.</p>
      <div className="confirmation-details">
        <div><span>Date</span><strong>{formatDate(booking.date)}</strong></div>
        <div><span>Time</span><strong>{slotLabels[booking.time] ?? booking.time}</strong></div>
        <div><span>Your party</span><strong>{booking.guests} {booking.guests === 1 ? 'guest' : 'guests'}</strong></div>
        <div><span>Confirmation</span><strong className="booking-reference">{booking.id.slice(0, 8).toUpperCase()}</strong></div>
      </div>
      <p className="confirmation-footnote">Keep your confirmation number handy. We look forward to seeing you, <strong>{booking.name}</strong>!</p>
      <Button variant="outlined" onClick={onReset} endIcon={<ArrowForwardRoundedIcon />}>Make another reservation</Button>
    </section>
  );
}

function App() {
  const [booking, setBooking] = useState(null);
  const [notice, setNotice] = useState('');
  const [menuOpen, setMenuOpen] = useState(false);

  function showBooking() {
    document.getElementById('reserve')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }

  return (
    <div className="site-shell" id="home">
      <div className="announcement"><span className="announcement-dot" /> A little sunshine is waiting for you <span className="announcement-divider">·</span> Open daily, 11am – 10pm <a href="#reserve">Come on in <ChevronRightRoundedIcon fontSize="small" /></a></div>
      <header className="site-header">
        <div className="header-inner"><Brand />
          <button className="mobile-menu-button" aria-label={menuOpen ? 'Close navigation menu' : 'Open navigation menu'} aria-expanded={menuOpen} onClick={() => setMenuOpen((open) => !open)}>{menuOpen ? <CloseRoundedIcon /> : <MenuRoundedIcon />}</button>
          <nav className={`main-nav ${menuOpen ? 'nav-open' : ''}`} aria-label="Main navigation">
            <a href="#our-story" onClick={() => setMenuOpen(false)}>Our story</a><a href="#menu" onClick={() => setMenuOpen(false)}>The menu</a><a href="#visit" onClick={() => setMenuOpen(false)}>Find us</a>
            <Button variant="contained" onClick={() => { setMenuOpen(false); showBooking(); }}>Book a table <ArrowForwardRoundedIcon fontSize="small" /></Button>
          </nav>
        </div>
      </header>

      <main>
        <section className="hero section-wrap" aria-labelledby="hero-heading">
          <div className="hero-copy"><span className="eyebrow"><span className="eyebrow-line" /> THE MEDITERRANEAN, A LITTLE CLOSER</span><h1 id="hero-heading">Good food.<br /><em>Good mood.</em></h1><p>Sunny plates, warm welcomes, and a little taste of the Mediterranean — right around the corner.</p><div className="hero-actions"><Button className="hero-book-button" variant="contained" onClick={showBooking}>Find your table <ArrowForwardRoundedIcon /></Button><a className="menu-link" href="#menu">Explore the menu <ChevronRightRoundedIcon /></a></div>
            <div className="hero-rating"><div className="rating-stars" aria-label="Rated 4.9 out of 5"><StarRoundedIcon /><StarRoundedIcon /><StarRoundedIcon /><StarRoundedIcon /><StarRoundedIcon /></div><span><strong>4.9/5</strong> from our lovely guests</span></div>
          </div>
          <div className="hero-visual"><div className="hero-art-frame"><MediterraneanArt /></div><div className="fresh-stamp"><span>MADE WITH</span><strong>♥</strong><span>A LITTLE LOVE</span></div><div className="hero-caption"><span className="caption-dot" /> Fresh from our kitchen, every day</div></div>
        </section>

        <section className="story-strip" id="our-story"><div className="story-inner"><div className="story-mark"><RestaurantRoundedIcon /></div><p><strong>Our kind of place.</strong> Pull up a chair, pour a glass, and stay a little longer. That’s how we do things around here.</p><a href="#visit" aria-label="Learn about Little Lemon"><ArrowForwardRoundedIcon /></a></div></section>

        <section className="booking-section section-wrap" id="reserve"><div className="booking-aside"><span className="eyebrow"><span className="eyebrow-line" /> YOUR TABLE IS WAITING</span><h2>Make a little<br /><em>room for joy.</em></h2><p>Planning a dinner date, a family get-together, or just craving something bright? There’s always a place for you here.</p><div className="booking-aside-note"><div className="aside-note-icon"><FavoriteBorderRoundedIcon /></div><p><strong>A note from us</strong><br />Let us know about a special occasion or dietary request. We love making the little things feel special.</p></div><div className="booking-contact"><span><LocalPhoneRoundedIcon /> +1 (555) 014-LEMN</span><span><LocationOnOutlinedIcon /> 42 Olive Street, Chicago</span></div></div>
          <div className="booking-content">{booking ? <Confirmation booking={booking} onReset={() => setBooking(null)} /> : <BookingCard onBooked={(reservation) => { setBooking(reservation); setNotice('Your table is confirmed. See you soon!'); }} />}</div>
        </section>

        <section className="menu-teaser" id="menu"><div className="section-wrap menu-teaser-inner"><div><span className="eyebrow"><span className="eyebrow-line" /> SOMETHING GOOD IS COOKING</span><h2>A menu made for<br /><em>passing around.</em></h2></div><div className="dish-list"><div><span className="dish-number">01</span><span><strong>Whipped feta & warm pita</strong><small>Honey, herbs, a little bit of magic</small></span><span className="dish-price">$12</span></div><div><span className="dish-number">02</span><span><strong>Sunday tomato pasta</strong><small>Slow tomatoes, basil, parmesan</small></span><span className="dish-price">$19</span></div><div><span className="dish-number">03</span><span><strong>Little Lemon olive cake</strong><small>Bright, tender, best shared</small></span><span className="dish-price">$9</span></div></div><a className="menu-full-link" href="#reserve" onClick={showBooking}>See what’s cooking <ArrowForwardRoundedIcon /></a></div></section>

        <section className="visit-section section-wrap" id="visit"><div className="visit-card"><div><span className="eyebrow">COME AS YOU ARE</span><h2>Your new favorite<br /><em>corner is right here.</em></h2></div><div className="visit-details"><p><LocationOnOutlinedIcon /><span><strong>Find us</strong>42 Olive Street, Chicago, IL</span></p><p><CalendarMonthRoundedIcon /><span><strong>When we’re here</strong>Every day, 11am – 10pm</span></p></div><Button variant="contained" onClick={showBooking}>Save your seat <ArrowForwardRoundedIcon /></Button><div className="visit-decor" aria-hidden="true">L</div></div></section>
      </main>

      <footer className="site-footer"><div className="footer-inner"><Brand light /><p>A little taste of the Mediterranean.<br />A whole lot of heart.</p><div className="footer-links"><a href="#our-story">Our story</a><a href="#menu">The menu</a><a href="#visit">Find us</a><a href="#reserve" onClick={showBooking}>Reservations</a></div><a className="instagram-link" href="https://instagram.com" aria-label="Little Lemon on Instagram"><InstagramIcon /></a><div className="footer-bottom"><span>© 2026 Little Lemon. Made with a little love.</span><span>Good food. Good mood. Always.</span></div></div></footer>
      <Snackbar open={Boolean(notice)} autoHideDuration={5000} onClose={() => setNotice('')} anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}><Alert onClose={() => setNotice('')} severity="success" variant="filled">{notice}</Alert></Snackbar>
    </div>
  );
}

export default App;
