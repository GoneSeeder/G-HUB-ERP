// Thailand public holidays seed data + Thai translation dictionary.
// Used as offline fallback when Google Calendar iCal endpoint is unreachable.
// Seed regenerated from: en.th.official#holiday@group.v.calendar.google.com (2026-06).

export type ThaiHolidaySeed = {
  date: string;       // YYYY-MM-DD
  titleEn: string;    // raw SUMMARY from Google
};

export type ThaiHolidayInfo = {
  titleTh: string;
  descriptionTh: string;
};

// Dictionary maps the English SUMMARY string Google returns to Thai title + description.
// Variants ("Day off for X", "Substitute Holiday for X", "X observed") are normalized below.
export const THAI_HOLIDAY_DICTIONARY: Record<string, ThaiHolidayInfo> = {
  "New Year's Day": {
    titleTh: 'วันขึ้นปีใหม่',
    descriptionTh: 'วันเริ่มต้นปีปฏิทินสากล วันที่ 1 มกราคม เป็นวันหยุดราชการและธนาคารทั่วประเทศ',
  },
  "New Year's Eve": {
    titleTh: 'วันสิ้นปี',
    descriptionTh: 'วันส่งท้ายปีเก่า วันที่ 31 ธันวาคม เป็นวันหยุดราชการตามประกาศ',
  },
  'New Year Special Holiday': {
    titleTh: 'วันหยุดพิเศษช่วงปีใหม่',
    descriptionTh: 'วันหยุดพิเศษที่คณะรัฐมนตรีประกาศเพิ่มเติมในช่วงเทศกาลปีใหม่ เพื่อให้ประชาชนได้พักผ่อนต่อเนื่อง',
  },
  'Day off for New Year': {
    titleTh: 'ชดเชยวันขึ้นปีใหม่',
    descriptionTh: 'วันชดเชยเมื่อวันขึ้นปีใหม่ตรงกับวันเสาร์-อาทิตย์ ตามมติคณะรัฐมนตรี',
  },
  "Day off for New Year's Day": {
    titleTh: 'ชดเชยวันขึ้นปีใหม่',
    descriptionTh: 'วันชดเชยเมื่อวันขึ้นปีใหม่ตรงกับวันเสาร์-อาทิตย์ ตามมติคณะรัฐมนตรี',
  },
  'Makha Bucha': {
    titleTh: 'วันมาฆบูชา',
    descriptionTh: 'วันสำคัญทางพระพุทธศาสนา ตรงกับวันเพ็ญเดือน 3 รำลึกถึงโอวาทปาฏิโมกข์ที่พระพุทธเจ้าทรงแสดงแก่พระอรหันต์ 1,250 รูป',
  },
  'Day off for Makha Bucha': {
    titleTh: 'ชดเชยวันมาฆบูชา',
    descriptionTh: 'วันชดเชยเมื่อวันมาฆบูชาตรงกับวันเสาร์-อาทิตย์',
  },
  'Chakri Day': {
    titleTh: 'วันจักรี',
    descriptionTh: 'วันที่ 6 เมษายน รำลึกถึงพระบาทสมเด็จพระพุทธยอดฟ้าจุฬาโลกมหาราชและการสถาปนาราชวงศ์จักรี',
  },
  'Day off for Chakri Day': {
    titleTh: 'ชดเชยวันจักรี',
    descriptionTh: 'วันชดเชยเมื่อวันจักรีตรงกับวันเสาร์-อาทิตย์',
  },
  'Songkran': {
    titleTh: 'วันสงกรานต์',
    descriptionTh: 'เทศกาลปีใหม่ไทยตามจันทรคติ วันที่ 13 เมษายน เป็นวันแห่งครอบครัวและการรดน้ำดำหัวผู้ใหญ่',
  },
  'Songkran Holiday': {
    titleTh: 'วันหยุดสงกรานต์',
    descriptionTh: 'วันหยุดต่อเนื่องในเทศกาลสงกรานต์ (13-15 เมษายน) เพื่อให้ประชาชนกลับภูมิลำเนาและพักผ่อนกับครอบครัว',
  },
  'Day off for Songkran': {
    titleTh: 'ชดเชยวันสงกรานต์',
    descriptionTh: 'วันชดเชยเมื่อวันสงกรานต์ตรงกับวันเสาร์-อาทิตย์',
  },
  'Labor Day': {
    titleTh: 'วันแรงงานแห่งชาติ',
    descriptionTh: 'วันที่ 1 พฤษภาคม เป็นวันรำลึกถึงความสำคัญของผู้ใช้แรงงาน เป็นวันหยุดของหน่วยงานเอกชนและรัฐวิสาหกิจ',
  },
  'Coronation Day': {
    titleTh: 'วันฉัตรมงคล',
    descriptionTh: 'วันที่ 4 พฤษภาคม วันคล้ายวันบรมราชาภิเษกพระบาทสมเด็จพระเจ้าอยู่หัว รัชกาลที่ 10 (พ.ศ. 2562)',
  },
  'Royal Ploughing Ceremony Day': {
    titleTh: 'วันพืชมงคล',
    descriptionTh: 'พระราชพิธีจรดพระนังคัลแรกนาขวัญ เพื่อเป็นสิริมงคลแก่การเกษตรกรรมและพยากรณ์ผลผลิตประจำปี',
  },
  'Visakha Bucha': {
    titleTh: 'วันวิสาขบูชา',
    descriptionTh: 'วันสำคัญสากลทางพระพุทธศาสนา ตรงกับวันเพ็ญเดือน 6 รำลึกการประสูติ ตรัสรู้ และปรินิพพานของพระพุทธเจ้า',
  },
  'Day off for Visakha Bucha': {
    titleTh: 'ชดเชยวันวิสาขบูชา',
    descriptionTh: 'วันชดเชยเมื่อวันวิสาขบูชาตรงกับวันเสาร์-อาทิตย์',
  },
  "Queen Suthida's Birthday": {
    titleTh: 'วันเฉลิมพระชนมพรรษาสมเด็จพระนางเจ้าสุทิดา',
    descriptionTh: 'วันที่ 3 มิถุนายน วันคล้ายวันพระราชสมภพ สมเด็จพระนางเจ้าสุทิดา พัชรสุธาพิมลลักษณ พระบรมราชินี',
  },
  "King Vajiralongkorn's Birthday": {
    titleTh: 'วันเฉลิมพระชนมพรรษารัชกาลที่ 10',
    descriptionTh: 'วันที่ 28 กรกฎาคม วันคล้ายวันพระราชสมภพ พระบาทสมเด็จพระปรเมนทรรามาธิบดีศรีสินทรมหาวชิราลงกรณ พระวชิรเกล้าเจ้าอยู่หัว',
  },
  'Asalha Bucha': {
    titleTh: 'วันอาสาฬหบูชา',
    descriptionTh: 'วันสำคัญทางพระพุทธศาสนา ตรงกับวันเพ็ญเดือน 8 รำลึกการแสดงปฐมเทศนาของพระพุทธเจ้าและการเกิดขึ้นของพระสงฆ์รูปแรก',
  },
  'Day off for Asalha Bucha': {
    titleTh: 'ชดเชยวันอาสาฬหบูชา',
    descriptionTh: 'วันชดเชยเมื่อวันอาสาฬหบูชาตรงกับวันเสาร์-อาทิตย์',
  },
  'Buddhist Lent Day': {
    titleTh: 'วันเข้าพรรษา',
    descriptionTh: 'วันแรม 1 ค่ำ เดือน 8 เริ่มต้นช่วงจำพรรษาของพระสงฆ์เป็นเวลา 3 เดือนในฤดูฝน',
  },
  "The Queen Mother's Birthday": {
    titleTh: 'วันเฉลิมพระชนมพรรษาสมเด็จพระบรมราชชนนีพันปีหลวง',
    descriptionTh: 'วันที่ 12 สิงหาคม วันคล้ายวันพระราชสมภพ สมเด็จพระนางเจ้าสิริกิติ์ พระบรมราชินีนาถ พระบรมราชชนนีพันปีหลวง และเป็นวันแม่แห่งชาติ',
  },
  'Mother’s Day': {
    titleTh: 'วันแม่แห่งชาติ',
    descriptionTh: 'วันที่ 12 สิงหาคม วันคล้ายวันพระราชสมภพสมเด็จพระบรมราชชนนีพันปีหลวง และเป็นวันแม่แห่งชาติ',
  },
  'Mahidol Day': {
    titleTh: 'วันมหิดล',
    descriptionTh: 'วันที่ 24 กันยายน วันคล้ายวันสวรรคตของสมเด็จพระมหิตลาธิเบศร อดุลยเดชวิกรม พระบรมราชชนก พระบิดาแห่งการแพทย์แผนปัจจุบันของไทย',
  },
  'Anniversary of the Death of King Bhumibol': {
    titleTh: 'วันคล้ายวันสวรรคต รัชกาลที่ 9',
    descriptionTh: 'วันที่ 13 ตุลาคม วันคล้ายวันสวรรคต พระบาทสมเด็จพระบรมชนกาธิเบศร มหาภูมิพลอดุลยเดชมหาราช บรมนาถบพิตร',
  },
  'Chulalongkorn Day': {
    titleTh: 'วันปิยมหาราช',
    descriptionTh: 'วันที่ 23 ตุลาคม วันคล้ายวันสวรรคต พระบาทสมเด็จพระจุลจอมเกล้าเจ้าอยู่หัว รัชกาลที่ 5',
  },
  'Day off for Chulalongkorn Day': {
    titleTh: 'ชดเชยวันปิยมหาราช',
    descriptionTh: 'วันชดเชยเมื่อวันปิยมหาราชตรงกับวันเสาร์-อาทิตย์',
  },
  "King Bhumibol's Birthday": {
    titleTh: 'วันคล้ายวันพระบรมราชสมภพ รัชกาลที่ 9',
    descriptionTh: 'วันที่ 5 ธันวาคม วันคล้ายวันพระบรมราชสมภพ พระบาทสมเด็จพระบรมชนกาธิเบศร มหาภูมิพลอดุลยเดชมหาราช และเป็นวันพ่อแห่งชาติ',
  },
  "King Bhumibol's Birthday observed": {
    titleTh: 'ชดเชยวันคล้ายวันพระบรมราชสมภพ รัชกาลที่ 9',
    descriptionTh: 'วันชดเชยเมื่อวันที่ 5 ธันวาคมตรงกับวันเสาร์-อาทิตย์',
  },
  'Constitution Day': {
    titleTh: 'วันรัฐธรรมนูญ',
    descriptionTh: 'วันที่ 10 ธันวาคม รำลึกถึงการพระราชทานรัฐธรรมนูญฉบับแรกของไทยในปี พ.ศ. 2475',
  },
  'Substitute Holiday for Constitution Day': {
    titleTh: 'ชดเชยวันรัฐธรรมนูญ',
    descriptionTh: 'วันชดเชยเมื่อวันรัฐธรรมนูญตรงกับวันเสาร์-อาทิตย์',
  },
  'Bridge Public Holiday': {
    titleTh: 'วันหยุดเชื่อม',
    descriptionTh: 'วันหยุดพิเศษที่คณะรัฐมนตรีประกาศเพิ่ม เพื่อให้วันหยุดต่อเนื่องเป็นช่วงยาว',
  },
  'Bridge Public holiday': {
    titleTh: 'วันหยุดเชื่อม',
    descriptionTh: 'วันหยุดพิเศษที่คณะรัฐมนตรีประกาศเพิ่ม เพื่อให้วันหยุดต่อเนื่องเป็นช่วงยาว',
  },
};

// Fallback translation when the SUMMARY isn't in the dictionary above.
export function translateHoliday(summary: string): ThaiHolidayInfo {
  const direct = THAI_HOLIDAY_DICTIONARY[summary];
  if (direct) return direct;

  // Handle "Day off for ..." and "Substitute Holiday for ..." composites.
  const dayOffMatch = summary.match(/^Day off for (.+)$/i);
  if (dayOffMatch) {
    const base = THAI_HOLIDAY_DICTIONARY[dayOffMatch[1]];
    if (base) return { titleTh: `ชดเชย${base.titleTh}`, descriptionTh: `วันชดเชย${base.titleTh}` };
  }

  const substituteMatch = summary.match(/^Substitute Holiday for (.+)$/i);
  if (substituteMatch) {
    const base = THAI_HOLIDAY_DICTIONARY[substituteMatch[1]];
    if (base) return { titleTh: `ชดเชย${base.titleTh}`, descriptionTh: `วันชดเชย${base.titleTh}` };
  }

  const observedMatch = summary.match(/^(.+) observed$/i);
  if (observedMatch) {
    const base = THAI_HOLIDAY_DICTIONARY[observedMatch[1]];
    if (base) return { titleTh: `ชดเชย${base.titleTh}`, descriptionTh: `วันชดเชย${base.titleTh}` };
  }

  // Last resort — return the raw English summary so the user can fix it manually.
  return { titleTh: summary, descriptionTh: 'วันหยุดราชการตามประกาศของประเทศไทย' };
}

// Seed data captured 2026-06 from Google iCal — used when the network call fails.
// Update by running `pnpm run sync:thai-holidays` (or refetch manually).
export const THAI_HOLIDAY_SEED: Record<number, ThaiHolidaySeed[]> = {
  2026: [
    { date: '2026-01-01', titleEn: "New Year's Day" },
    { date: '2026-01-02', titleEn: 'New Year Special Holiday' },
    { date: '2026-03-03', titleEn: 'Makha Bucha' },
    { date: '2026-04-06', titleEn: 'Chakri Day' },
    { date: '2026-04-13', titleEn: 'Songkran' },
    { date: '2026-04-14', titleEn: 'Songkran Holiday' },
    { date: '2026-04-15', titleEn: 'Songkran Holiday' },
    { date: '2026-05-01', titleEn: 'Labor Day' },
    { date: '2026-05-04', titleEn: 'Coronation Day' },
    { date: '2026-05-13', titleEn: 'Royal Ploughing Ceremony Day' },
    { date: '2026-05-31', titleEn: 'Visakha Bucha' },
    { date: '2026-06-01', titleEn: 'Day off for Visakha Bucha' },
    { date: '2026-06-03', titleEn: "Queen Suthida's Birthday" },
    { date: '2026-07-28', titleEn: "King Vajiralongkorn's Birthday" },
    { date: '2026-07-29', titleEn: 'Asalha Bucha' },
    { date: '2026-08-12', titleEn: "The Queen Mother's Birthday" },
    { date: '2026-10-13', titleEn: 'Anniversary of the Death of King Bhumibol' },
    { date: '2026-10-23', titleEn: 'Chulalongkorn Day' },
    { date: '2026-12-05', titleEn: "King Bhumibol's Birthday" },
    { date: '2026-12-07', titleEn: "King Bhumibol's Birthday observed" },
    { date: '2026-12-10', titleEn: 'Constitution Day' },
    { date: '2026-12-31', titleEn: "New Year's Eve" },
  ],
  2027: [
    { date: '2027-01-01', titleEn: "New Year's Day" },
    { date: '2027-04-06', titleEn: 'Chakri Day' },
    { date: '2027-04-13', titleEn: 'Songkran' },
    { date: '2027-05-04', titleEn: 'Coronation Day' },
    { date: '2027-07-28', titleEn: "King Vajiralongkorn's Birthday" },
    { date: '2027-12-05', titleEn: "King Bhumibol's Birthday" },
    { date: '2027-12-10', titleEn: 'Constitution Day' },
  ],
};
