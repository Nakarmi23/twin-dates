import { describe, expect, test } from '@jest/globals';
import BikramSambat from '.';

describe('Bikram Sambat', () => {
  test('BS parse', () => {
    const date = BikramSambat.parse('2081-03-15');
    expect(date.bsDate).toBe(15);
    expect(date.bsMonth).toBe(3);
    expect(date.bsYear).toBe(2081);
    expect(date.weekDay).toBe(6);
    expect(date.ad.toLocaleDateString()).toBe('6/29/2024');
  });

  test('BS out of range parse', () => {
    expect(() => BikramSambat.parse('2081-01-90')).toThrowError();
    expect(() => BikramSambat.parse('2081-12-31')).toThrowError();
    expect(() => BikramSambat.parse('2112-01-01')).toThrowError();
    expect(() => BikramSambat.parse('1969-01-01')).toThrowError();
  });

  test('AD parse', () => {
    const date = BikramSambat.fromAD('2024-06-29');
    expect(date.bsDate).toBe(15);
    expect(date.bsMonth).toBe(3);
    expect(date.bsYear).toBe(2081);
    expect(date.weekDay).toBe(6);
    expect(date.ad.toLocaleDateString()).toBe('6/29/2024');

    const date2 = BikramSambat.fromAD(new Date('2024-06-29'));
    expect(date2.bsDate).toBe(15);
    expect(date2.bsMonth).toBe(3);
    expect(date2.bsYear).toBe(2081);
    expect(date.weekDay).toBe(6);
    expect(date2.ad.toLocaleDateString()).toBe('6/29/2024');
  });

  test('AD out of range parse', () => {
    expect(() => BikramSambat.fromAD('1913-04-12')).toThrowError();
    expect(() => BikramSambat.fromAD(new Date('2055-04-15'))).toThrowError();
  });

  test('clone', () => {
    const date = BikramSambat.parse('2081-03-15');
    const dateClone = date.clone();

    expect(JSON.stringify(dateClone)).toBe(JSON.stringify(date));
    expect(dateClone).not.toBe(date);
  });

  test('Date format', () => {
    const date = BikramSambat.parse('2081-03-15');

    expect(date.format('MMMM, DD YYYY dddd')).toBe('Ashadh, 15 2081 Saturday');
    expect(date.format('MMMM MMM MM M')).toBe('Ashadh MMM 03 3');
    expect(date.format('dddd ddd dd d')).toBe('Saturday Sat Sa 6');
  });

  test('Date Manipulation: startOf', () => {
    const date = BikramSambat.parse('2081-03-13');
    const monthStartOf = date.startOf('month');

    expect(monthStartOf.bsDate).toBe(1);
    expect(monthStartOf.bsMonth).toBe(3);
    expect(monthStartOf.bsMonthName).toBe('Ashadh');
    expect(monthStartOf.weekDay).toBe(6);

    const yearStartOf = date.startOf('year');

    expect(yearStartOf.bsDate).toBe(1);
    expect(yearStartOf.bsMonth).toBe(1);
    expect(yearStartOf.bsMonthName).toBe('Baishakh');
    expect(yearStartOf.weekDay).toBe(6);
  });

  test('Date Manipulation: endOf', () => {
    const date = BikramSambat.parse('2081-03-13');
    const monthEndOf = date.endOf('month');

    expect(monthEndOf.bsDate).toBe(31);
    expect(monthEndOf.bsMonth).toBe(3);
    expect(monthEndOf.bsMonthName).toBe('Ashadh');
    expect(monthEndOf.weekDay).toBe(1);

    const yearEndOf = date.endOf('year');

    expect(yearEndOf.bsDate).toBe(30);
    expect(yearEndOf.bsMonth).toBe(12);
    expect(yearEndOf.bsMonthName).toBe('Chaitra');
    expect(yearEndOf.weekDay).toBe(0);
  });

  test('Date Manipulation: add', () => {
    const date = BikramSambat.parse('2081-03-25');

    const dayAddDate = date.add(11, 'day');
    expect(dayAddDate.bsDate).toBe(5);
    expect(dayAddDate.bsMonth).toBe(4);
    expect(dayAddDate.bsMonthName).toBe('Shrawan');
    expect(dayAddDate.bsYear).toBe(2081);
    expect(dayAddDate.weekDay).toBe(6);
    expect(dayAddDate.ad.toLocaleDateString()).toBe('7/20/2024');

    const monthAddDate = dayAddDate.add(2, 'month');
    expect(monthAddDate.bsDate).toBe(4);
    expect(monthAddDate.bsMonth).toBe(6);
    expect(monthAddDate.bsMonthName).toBe('Ashwin');
    expect(monthAddDate.bsYear).toBe(2081);
    expect(monthAddDate.weekDay).toBe(5);
    expect(monthAddDate.ad.toLocaleDateString()).toBe('9/20/2024');

    const yearAddDate = monthAddDate.add(2, 'year');
    expect(yearAddDate.bsDate).toBe(4);
    expect(yearAddDate.bsMonth).toBe(6);
    expect(yearAddDate.bsMonthName).toBe('Ashwin');
    expect(yearAddDate.bsYear).toBe(2083);
    expect(yearAddDate.weekDay).toBe(0);
    expect(yearAddDate.ad.toLocaleDateString()).toBe('9/20/2026');
  });

  test('Date Manipulation: sub', () => {
    const date = BikramSambat.parse('2081-03-04');

    const daySubDate = date.sub(11, 'day');
    expect(daySubDate.bsDate).toBe(25);
    expect(daySubDate.bsMonth).toBe(2);
    expect(daySubDate.bsMonthName).toBe('Jestha');
    expect(daySubDate.bsYear).toBe(2081);
    expect(daySubDate.weekDay).toBe(5);
    expect(daySubDate.ad.toLocaleDateString()).toBe('6/7/2024');

    const monthSubDate = daySubDate.sub(2, 'month');
    expect(monthSubDate.bsDate).toBe(25);
    expect(monthSubDate.bsMonth).toBe(12);
    expect(monthSubDate.bsMonthName).toBe('Chaitra');
    expect(monthSubDate.bsYear).toBe(2080);
    expect(monthSubDate.weekDay).toBe(0);
    expect(monthSubDate.ad.toLocaleDateString()).toBe('4/7/2024');

    const yearSubDate = monthSubDate.sub(2, 'year');
    expect(yearSubDate.bsDate).toBe(24);
    expect(yearSubDate.bsMonth).toBe(12);
    expect(yearSubDate.bsMonthName).toBe('Chaitra');
    expect(yearSubDate.bsYear).toBe(2078);
    expect(yearSubDate.weekDay).toBe(4);
    expect(yearSubDate.ad.toLocaleDateString()).toBe('4/7/2022');
  });

  test('Date Comparison: isSame', () => {
    const date = BikramSambat.parse('2081-03-16');
    const sameBsDate = BikramSambat.fromAD('2024-06-30');

    expect(date.isSame(sameBsDate)).toBeTruthy();

    const diffBsDate = BikramSambat.parse('2024-03-03');

    expect(date.isSame(diffBsDate)).toBeFalsy();

    const diffAdDate = new Date('2024-03-03');

    expect(date.isSame(diffAdDate)).toBeFalsy();

    expect(() => date.isSame('2024-03-03' as never)).toThrowError();
  });

  test('Date Comparison: isBefore', () => {
    const date = BikramSambat.parse('2081-03-16');

    const beforeDate = BikramSambat.parse('2081-03-03');

    expect(beforeDate.isBefore(date)).toBeTruthy();

    const afterDate = BikramSambat.parse('2081-03-19');

    expect(afterDate.isBefore(date)).toBeFalsy();

    expect(() => date.isBefore('2024-03-03' as never)).toThrowError();
  });

  test('Date Comparison: isAfter', () => {
    const date = BikramSambat.parse('2081-03-16');

    const afterDate = BikramSambat.parse('2081-03-19');

    expect(afterDate.isAfter(date)).toBeTruthy();

    const beforeDate = BikramSambat.parse('2081-03-03');

    expect(beforeDate.isAfter(date)).toBeFalsy();

    expect(() => date.isBefore('2024-03-03' as never)).toThrowError();
  });
});
