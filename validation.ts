import { ResumeSchema } from './resume-schema';
import { checkSpelling, add, getCorrectionsForMisspelling } from 'spellchecker';
import chalk from 'chalk';
const data = <ResumeSchema>require('./resume.json');

interface DateStamped {
  startDate?: string;
  endDate?: string;
}

interface FreeTextContainer {
  description?: string;
  summary?: string;
  highlights?: string[];
  position?: string;
}

let error: boolean = false;

function checkDates(obj: DateStamped) {
  if (!obj.startDate || !obj.endDate) {
    return;
  }
  if (Date.parse(obj.endDate) <= Date.parse(obj.startDate)) {
    console.error(`${obj.endDate} should be after ${obj.startDate}`);
    error = true;
  }
}

data.work!.forEach(obj => checkDates(obj));
data.projects!.forEach(obj => checkDates(obj));
data.volunteer!.forEach(obj => checkDates(obj));
data.education!.forEach(obj => checkDates(obj));

function checkAndMarkString(text?: string, skipPeriod = false): void {
  if (text === undefined) {
    return;
  }
  const res = checkSpelling(text);
  for(const err of res) {
    const word = text.substring(err.start, err.end);
    const correct = getCorrectionsForMisspelling(word);
    const correctHighlighted = correct.length ? chalk.greenBright(correct.join('|')) : '';
    const highlighted = chalk.redBright.strikethrough(word);
    console.error(`Spelling: '${text.substring(0, err.start)}${highlighted}${correctHighlighted}${text.substring(err.end)}`);
    error = true;
  }
  if (!skipPeriod && !text.endsWith('.')) {
    console.error(`Text should end with period. ${text}`);
  }
}

add('Omnea');
add('golang');
add('synchronize');
add('sequelize');

function checkAndMark(stuff: FreeTextContainer) {
  checkAndMarkString(stuff.description);
  checkAndMarkString(stuff.summary);
  checkAndMarkString(stuff.position, true);
  stuff.highlights?.forEach(hl => checkAndMarkString(hl));
}

data.work!.forEach(obj => checkAndMark(obj));
data.projects!.forEach(obj => checkAndMark(obj));
data.volunteer!.forEach(obj => checkAndMark(obj));

if (error) {
  process.exit(1);
}
