import { NextResponse } from 'next/server';
import { THAI_HOLIDAY_SEED, translateHoliday } from '@/data/humansource/thailand-holidays';

type HolidayEntry = {
  id: string;
  date: string;
  title: string;
  type: 'announcement';
  country: string;
  appliesTo: string;
  description: string;
  source: 'google' | 'seed';
};

const GOOGLE_CALENDAR_ICAL_ENDPOINT =
  'https://calendar.google.com/calendar/ical/en.th.official%23holiday%40group.v.calendar.google.com/public/basic.ics';

function cleanIcsText(value: string) {
  return value.replace(/\\,/g, ',').replace(/\\;/g, ';').replace(/\\n/g, ' ').trim();
}

function readIcsField(block: string, field: string) {
  return block.match(new RegExp(`${field}(?:;[^:]*)?:(.+)`))?.[1]?.split(/\r?\n/)[0];
}

function buildHolidayFromSummary(
  summary: string,
  date: string,
  uid: string | undefined,
  source: 'google' | 'seed',
): HolidayEntry {
  const translated = translateHoliday(summary);
  const cleanUid = uid ? cleanIcsText(uid) : null;
  return {
    id: cleanUid ?? `${source}-${date}-${summary}`,
    date,
    title: translated.titleTh,
    type: 'announcement',
    country: 'Thailand',
    appliesTo: 'Thailand',
    description: translated.descriptionTh,
    source,
  };
}

function parseGoogleIcs(text: string, targetYear: number): HolidayEntry[] {
  const unfolded = text.replace(/\r?\n[ \t]/g, '');
  return unfolded
    .split('BEGIN:VEVENT')
    .slice(1)
    .map((block): HolidayEntry | null => {
      const date = readIcsField(block, 'DTSTART')?.match(/[0-9]{8}/)?.[0];
      const summary = readIcsField(block, 'SUMMARY');
      const uid = readIcsField(block, 'UID');
      if (!date || Number(date.slice(0, 4)) !== targetYear || !summary) return null;

      const formattedDate = `${date.slice(0, 4)}-${date.slice(4, 6)}-${date.slice(6, 8)}`;
      return buildHolidayFromSummary(cleanIcsText(summary), formattedDate, uid, 'google');
    })
    .filter((holiday): holiday is HolidayEntry => Boolean(holiday))
    .sort((a, b) => a.date.localeCompare(b.date));
}

function buildSeedFallback(targetYear: number): HolidayEntry[] {
  const seed = THAI_HOLIDAY_SEED[targetYear] ?? [];
  return seed
    .map((item) => buildHolidayFromSummary(item.titleEn, item.date, undefined, 'seed'))
    .sort((a, b) => a.date.localeCompare(b.date));
}

async function loadFromGoogle(targetYear: number) {
  const response = await fetch(GOOGLE_CALENDAR_ICAL_ENDPOINT, {
    next: { revalidate: 86400 },
    signal: AbortSignal.timeout(5000),
  });
  if (!response.ok) throw new Error(`Google Calendar iCal ตอบกลับด้วยสถานะ ${response.status}`);
  return parseGoogleIcs(await response.text(), targetYear);
}

export async function GET(request: Request) {
  const year = Number(new URL(request.url).searchParams.get('year'));
  const currentYear = new Date().getFullYear();
  if (!Number.isInteger(year) || year < currentYear || year > currentYear + 1) {
    return NextResponse.json({ error: 'เลือกดูได้เฉพาะปีปัจจุบันและปีถัดไป' }, { status: 400 });
  }

  try {
    const holidays = await loadFromGoogle(year);
    // Google sometimes returns 0 events for far-future years — fall back to seed when empty.
    if (holidays.length === 0) {
      return NextResponse.json({ holidays: buildSeedFallback(year), source: 'seed' });
    }
    return NextResponse.json({ holidays, source: 'google' });
  } catch {
    return NextResponse.json({ holidays: buildSeedFallback(year), source: 'seed' });
  }
}
