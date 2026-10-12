import { createServer } from 'node:http';
import { randomUUID } from 'node:crypto';
import { mkdir, readFile, writeFile } from 'node:fs/promises';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const here = dirname(fileURLToPath(import.meta.url));
const dataDirectory = join(here, 'data');
const bookingsFile = join(dataDirectory, 'bookings.json');
const port = Number(process.env.API_PORT ?? 3001);
const slotOptions = [
  { time: '12:00', label: '12:00 PM' },
  { time: '13:30', label: '1:30 PM' },
  { time: '15:00', label: '3:00 PM' },
  { time: '17:30', label: '5:30 PM' },
  { time: '19:00', label: '7:00 PM' },
  { time: '20:30', label: '8:30 PM' },
];
const slotCapacity = 24;
let bookingQueue = Promise.resolve();

async function readBookings() {
  try {
    return JSON.parse(await readFile(bookingsFile, 'utf8'));
  } catch (error) {
    if (error.code === 'ENOENT') return [];
    throw error;
  }
}

async function saveBookings(bookings) {
  await mkdir(dataDirectory, { recursive: true });
  await writeFile(bookingsFile, `${JSON.stringify(bookings, null, 2)}\n`, 'utf8');
}

function isValidDate(date) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(date ?? '')) return false;
  const parsed = new Date(`${date}T00:00:00.000Z`);
  return !Number.isNaN(parsed.valueOf()) && parsed.toISOString().slice(0, 10) === date;
}

function dateIsPast(date) {
  const today = new Date();
  const todayString = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;
  return date < todayString;
}

function getAvailability(bookings, date, guests) {
  const now = new Date();
  const today = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
  const currentTime = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;
  return slotOptions.map((slot) => {
    const seatsBooked = bookings
      .filter((booking) => booking.date === date && booking.time === slot.time)
      .reduce((total, booking) => total + booking.guests, 0);
    const seatsLeft = Math.max(0, slotCapacity - seatsBooked);
    const passed = date === today && slot.time <= currentTime;
    return {
      ...slot,
      seatsLeft,
      passed,
      available: !passed && seatsLeft >= guests,
    };
  });
}

function sendJson(response, status, payload) {
  response.writeHead(status, {
    'Content-Type': 'application/json; charset=utf-8',
    'Cache-Control': 'no-store',
  });
  response.end(JSON.stringify(payload));
}

async function readBody(request) {
  let body = '';
  for await (const chunk of request) {
    body += chunk;
    if (body.length > 16_384) throw new Error('Request body is too large.');
  }
  try {
    return JSON.parse(body || '{}');
  } catch {
    throw new Error('Please send a valid booking request.');
  }
}

function validateBooking(input) {
  if (!input || typeof input !== 'object' || Array.isArray(input)) return { error: 'Please send a valid booking request.' };
  const name = typeof input.name === 'string' ? input.name.trim() : '';
  const email = typeof input.email === 'string' ? input.email.trim() : '';
  const phone = typeof input.phone === 'string' ? input.phone.trim() : '';
  const occasion = typeof input.occasion === 'string' ? input.occasion.trim() : '';
  const notes = typeof input.notes === 'string' ? input.notes.trim() : '';
  const date = typeof input.date === 'string' ? input.date : '';
  const time = typeof input.time === 'string' ? input.time : '';
  const guests = Number(input.guests);

  if (name.length < 2 || name.length > 80) return { error: 'Please enter a name between 2 and 80 characters.' };
  if (email.length > 254 || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return { error: 'Please enter a valid email address.' };
  if (phone.length < 7 || phone.length > 32) return { error: 'Please enter a valid phone number.' };
  if (!Number.isInteger(guests) || guests < 1 || guests > 8) return { error: 'Choose a party size between 1 and 8.' };
  if (!isValidDate(date) || dateIsPast(date)) return { error: 'Choose today or a future date.' };
  if (!slotOptions.some((slot) => slot.time === time)) return { error: 'Choose an available dining time.' };
  if (occasion.length > 60 || notes.length > 500) return { error: 'Please shorten your note and try again.' };

  return { booking: { name, email, phone, occasion, notes, date, time, guests } };
}

function queueBooking(create) {
  const operation = bookingQueue.then(create);
  bookingQueue = operation.catch(() => {});
  return operation;
}

const server = createServer(async (request, response) => {
  const url = new URL(request.url, `http://${request.headers.host ?? 'localhost'}`);

  if (request.method === 'GET' && url.pathname === '/api/health') {
    return sendJson(response, 200, { status: 'ok', service: 'little-lemon-bookings' });
  }

  if (request.method === 'GET' && url.pathname === '/api/availability') {
    const date = url.searchParams.get('date') ?? '';
    const guests = Number(url.searchParams.get('guests') ?? 2);
    if (!isValidDate(date) || !Number.isInteger(guests) || guests < 1 || guests > 8) {
      return sendJson(response, 400, { message: 'Choose a valid date and a party size from 1 to 8.' });
    }
    if (dateIsPast(date)) return sendJson(response, 400, { message: 'Choose today or a future date.' });
    const bookings = await readBookings();
    return sendJson(response, 200, { date, guests, slots: getAvailability(bookings, date, guests) });
  }

  if (request.method === 'POST' && url.pathname === '/api/bookings') {
    let input;
    try {
      input = await readBody(request);
    } catch (error) {
      return sendJson(response, 400, { message: error.message });
    }
    const { booking, error } = validateBooking(input);
    if (error) return sendJson(response, 400, { message: error });

    try {
      const result = await queueBooking(async () => {
        const bookings = await readBookings();
        const slot = getAvailability(bookings, booking.date, booking.guests)
          .find((option) => option.time === booking.time);
        if (slot?.passed) return { error: 'That dining time has passed. Please choose a later time.' };
        if (!slot?.available) return { error: 'That time just filled up. Please choose another time.' };
        const reservation = {
          id: randomUUID(),
          ...booking,
          createdAt: new Date().toISOString(),
        };
        await saveBookings([...bookings, reservation]);
        return { reservation };
      });
      if (result.error) return sendJson(response, 409, { message: result.error });
      const created = result.reservation;
      return sendJson(response, 201, {
        booking: {
          id: created.id,
          name: created.name,
          date: created.date,
          time: created.time,
          guests: created.guests,
        },
      });
    } catch (error) {
      console.error('Could not save booking:', error);
      return sendJson(response, 500, { message: 'We could not save your reservation. Please try again.' });
    }
  }

  return sendJson(response, 404, { message: 'This endpoint was not found.' });
});

server.listen(port, () => {
  console.log(`Little Lemon booking API is running at http://localhost:${port}`);
});
