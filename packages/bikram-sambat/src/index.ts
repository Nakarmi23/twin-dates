import dayjs from 'dayjs';
import { nepEngCalenderMaps } from './constraints/nepali-english-calender-maps';
import { months } from './constraints/nepali-english-month-name';
import { nepDateNoOfDays } from './constraints/nepali-month-total-days';
import { adDateFromBS } from './utilities/get-ad-date-from-bs';
import { getBSMonthTotalDays } from './utilities/get-bs-month-total-days';
import { getMonthsWithCumulativeDays } from './utilities/get-months-with-cumulative-days';
import { parseAdString } from './utilities/parse-ad-string';

interface BikramSambatProps {
  bsYear: number;
  bsMonth: number;
  bsDate: number;
  weekDay: 0 | 1 | 2 | 3 | 4 | 5 | 6;
  ad: Date;
  bsMonthName: string;
}

export type UnitType = 'day' | 'date' | 'month' | 'year' | 'week';

export type SetUnitType = Exclude<UnitType, 'week'>;

export type StarOfEndOfType = Exclude<UnitType, 'date' | 'day' | 'week'>;

export type ManipulateType = 'month' | 'year' | 'day';

export default class BikramSambat implements BikramSambatProps {
  bsYear!: number;
  bsMonth!: number;
  bsDate!: number;
  weekDay!: 0 | 1 | 2 | 3 | 4 | 5 | 6;
  ad!: Date;
  bsMonthName!: string;

  private constructor(props: BikramSambatProps) {
    Object.assign(this, props);
  }

  static parse(toParse: string) {
    if (!(typeof toParse === 'string'))
      throw new Error('This function only accepts string.');

    if (!/^\d{4}-\d{2}-\d{2}$/.test(toParse))
      throw new Error(
        `Invalid date format: "${toParse}". Expected format is YYYY-MM-DD.`
      );

    const [year, month, date] = toParse
      .split('-')
      .map((num) => parseInt(num)) as [number, number, number];

    if (year < 1970 || year > 2111)
      throw new Error('Year should be between 1970 and 2111.');

    if (month < 1 || month > 12)
      throw new Error(
        `Invalid date month: ${month}. Month should be between 1 and 12.`
      );

    const currentMonthIndex = month - 1;

    const englishDate = adDateFromBS(year, month, date);

    const bikramSambatDate: BikramSambatProps = {
      weekDay: englishDate.day(),
      bsYear: year,
      bsMonth: month,
      bsDate: date,
      bsMonthName: months[currentMonthIndex]!.nepName,
      ad: englishDate.toDate(),
    };

    return new BikramSambat(bikramSambatDate);
  }

  static fromAD(date: string | Date) {
    if (typeof date === 'string') date = parseAdString(date);
    else if (!(date instanceof Date))
      throw new Error('This function only accepts string or Date object.');

    const englishDateDayjs = dayjs(date);
    const matchingCalendarPeriod = nepEngCalenderMaps.find((calendarPeriod) => {
      const startDate = dayjs(calendarPeriod.startDate);
      const endDate = dayjs(calendarPeriod.endDate);

      return (
        (endDate.isAfter(englishDateDayjs, 'date') &&
          startDate.isBefore(englishDateDayjs, 'date')) ||
        endDate.isSame(englishDateDayjs, 'date') ||
        startDate.isSame(englishDateDayjs, 'date')
      );
    });

    if (!matchingCalendarPeriod)
      throw new Error(
        `No corresponding Bikram Sambat date found for the English date ${date.toISOString().split('T')[0]}.`
      );

    const daysSinceStartOfPeriod =
      englishDateDayjs.diff(matchingCalendarPeriod.startDate, 'days') + 1;

    const bsMonthsWithCumulativeDays = getMonthsWithCumulativeDays(
      matchingCalendarPeriod.nepYear
    );

    const currentBsMonth = [...bsMonthsWithCumulativeDays].find(
      (month) => month.cumulativeDays >= daysSinceStartOfPeriod
    );

    if (!currentBsMonth)
      throw new Error(
        `Unable to determine the Bikram Sambat month for the given English date ${date.toISOString().split('T')[0]}.`
      );

    const previousBsMonth = bsMonthsWithCumulativeDays
      .filter((month) => month.cumulativeDays < daysSinceStartOfPeriod)
      .at(-1);

    const bikramSambatDate: BikramSambatProps = {
      weekDay: englishDateDayjs.day(),
      bsYear: matchingCalendarPeriod.nepYear,
      bsMonth: currentBsMonth.monthNumber,
      bsDate: previousBsMonth
        ? daysSinceStartOfPeriod - previousBsMonth.cumulativeDays
        : daysSinceStartOfPeriod,
      bsMonthName: currentBsMonth.monthName,
      ad: date,
    };

    return new BikramSambat(bikramSambatDate);
  }

  static getBikramSambatMonths(year: number) {
    const nepaliYearData = nepDateNoOfDays.find(
      (date) => date.nepYear === year
    );

    if (!nepaliYearData)
      throw new Error(
        `No data available for the year ${year} in the Bikram Sambat calendar.`
      );

    return months.map((month) => ({
      monthNumber: month.id,
      monthName: month.nepName,
      numberOfDays:
        nepaliYearData[`m${month.id}` as keyof typeof nepaliYearData],
    }));
  }

  toString() {
    return `${this.bsMonthName} ${this.bsDate} ${this.bsYear}`;
  }

  static now() {
    return this.fromAD(new Date());
  }

  add(value: number, unit: ManipulateType = 'day') {
    const newDate = BikramSambat.fromAD(
      dayjs(this.ad).add(value, unit).toDate()
    );

    return newDate;
  }

  sub(value: number, unit: ManipulateType = 'day') {
    return this.add(value * -1, unit);
  }

  startOf(unit: StarOfEndOfType) {
    const clone = this.clone();
    if (unit === 'month') clone.bsDate = 1;
    if (unit === 'year') {
      clone.bsDate = 1;
      clone.bsMonth = 1;
      clone.bsMonthName = months.at(0)!.nepName;
    }

    const newAdDate = adDateFromBS(clone.bsYear, clone.bsMonth, clone.bsDate);

    clone.ad = newAdDate.toDate();
    clone.weekDay = newAdDate.day();

    return clone;
  }

  endOf(unit: StarOfEndOfType) {
    const clone = this.clone();
    if (unit === 'month') {
      clone.bsDate = getBSMonthTotalDays(clone.bsMonth, clone.bsYear);
    } else if (unit === 'year') {
      clone.bsMonth = 12;
      clone.bsMonthName = months.at(-1)!.nepName;
      clone.bsDate = getBSMonthTotalDays(clone.bsMonth, clone.bsYear);
    }

    const newAdDate = adDateFromBS(clone.bsYear, clone.bsMonth, clone.bsDate);

    clone.ad = newAdDate.toDate();
    clone.weekDay = newAdDate.day();

    return clone;
  }

  format(formatString: string) {
    const REGEX_FORMAT = /Y{4}|M{1,4}|D{1,2}|d{1,4}/g;

    const matches = (match: string) => {
      switch (match) {
        case 'MMMM':
          return this.bsMonthName;
        case 'MM':
          return this.bsMonth.toString().padStart(2, '0');
        case 'M':
          return this.bsMonth.toString();
        case 'YYYY':
          return this.bsYear.toString();
        case 'DD':
          return this.bsDate.toString().padStart(2, '0');
        case 'D':
          return this.bsDate.toString();
        case 'dddd':
          return dayjs(this.ad).format('dddd');
        case 'ddd':
          return dayjs(this.ad).format('ddd');
        case 'dd':
          return dayjs(this.ad).format('dd');
        case 'd':
          return dayjs(this.ad).format('d');
      }
      return null;
    };

    return formatString.replace(
      REGEX_FORMAT,
      (match) => matches(match) || match
    );
  }

  clone() {
    return new BikramSambat({
      ad: new Date(this.ad),
      bsDate: this.bsDate,
      bsMonth: this.bsMonth,
      bsMonthName: this.bsMonthName,
      bsYear: this.bsYear,
      weekDay: this.weekDay,
    });
  }

  isSame(date: BikramSambat | Date, unit: UnitType = 'day') {
    if (date instanceof BikramSambat) date = date.ad;
    else if (!(date instanceof Date)) throw new Error('Invalid compare value');

    return dayjs(this.ad).isSame(date, unit);
  }

  isBefore(date: BikramSambat | Date, unit: UnitType = 'day') {
    if (date instanceof BikramSambat) date = date.ad;
    else if (!(date instanceof Date)) throw new Error('Invalid compare value');

    return dayjs(this.ad).isBefore(date, unit);
  }

  isAfter(date: BikramSambat | Date, unit: UnitType = 'day') {
    if (date instanceof BikramSambat) date = date.ad;
    else if (!(date instanceof Date)) throw new Error('Invalid compare value');

    return dayjs(this.ad).isAfter(date, unit);
  }

  get(unit: UnitType) {
    switch (unit) {
      case 'date':
        return this.bsDate;
      case 'month':
        return this.bsMonth;
      case 'day':
        return this.weekDay;
      case 'year':
        return this.bsYear;
    }
  }

  set(unit: SetUnitType, value: number) {
    if (typeof value !== 'number')
      throw new Error('Value must be a type of number.');
    return BikramSambat.fromAD(dayjs(this.ad).set(unit, value).toDate());
  }

  date(value?: number) {
    if (typeof value !== 'number')
      throw new Error('Value must be a type of number.');
    if (!value) return this.bsDate;

    return this.add(value, 'day');
  }

  month(value?: number) {
    if (typeof value !== 'number')
      throw new Error('Value must be a type of number.');
    if (!value) return this.bsMonth;

    return this.add(value, 'month');
  }

  year(value?: number) {
    if (typeof value !== 'number')
      throw new Error('Value must be a type of number.');
    if (!value) return this.year;

    return this.add(value, 'year');
  }

  day(value?: number) {
    if (typeof value !== 'number')
      throw new Error('Value must be a type of number.');
    return this.date(value);
  }
}
