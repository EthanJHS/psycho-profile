// 영어판 48문항 — 한국어판(lib/questions-hexaco.ts)과 같은 ID·같은 채점(lib/scoring-hexaco.ts QUESTIONS)을 쓴다.
// 직역이 아니라 같은 행동을 영어권에서 자연스러운 장면으로 옮김. 상황 문항은 "상황(you) \n 나의 반응(I)" 두 줄 구조 유지.
// 문화 차이로 응답 분포가 달라질 수 있는 문항은 docs/en-localization-review.md 참고
import type { HexacoQuestion, LikertOption } from '../questions-hexaco'

export const LIKERT_OPTIONS_EN: LikertOption[] = [
  { value: 1, label: 'Strongly disagree' },
  { value: 2, label: 'Disagree' },
  { value: 3, label: 'Neutral' },
  { value: 4, label: 'Agree' },
  { value: 5, label: 'Strongly agree' },
]

export const HEXACO_QUESTIONS_EN: HexacoQuestion[] = [
  // H — Honesty-Humility
  { id: 'H1', text: 'I don’t say things I don’t mean just to make a good impression.' },
  { id: 'H2', text: 'A close friend shows you something they worked hard on and asks what you think.\nI’m honest about the parts that could be better, too.' },
  { id: 'H3', text: 'I don’t break rules, even when it seems no one would ever find out.' },
  { id: 'H4', text: 'After paying, you notice you were charged less than you should have been.\nI go back and pay the difference.' },
  { id: 'H5', text: 'I find myself wanting luxury brands or expensive things.' },
  { id: 'H6', text: 'You have to choose between a job that pays more but is boring, and one that pays less but feels meaningful.\nI care more about the work being fulfilling.' },
  { id: 'H7', text: 'I think I’m better than most people in many ways.' },
  { id: 'H8', text: 'At the end of a team project, you get a chance to talk about your contribution.\nI don’t play up my own role — I say it was a team effort.' },

  // E — Emotionality
  { id: 'E1', text: 'I don’t get very scared, even in dangerous situations.' },
  { id: 'E2', text: 'Your friends want you to go bungee jumping with them.\nI say no because it scares me.' },
  { id: 'E3', text: 'When something worries me, I shake it off quickly.' },
  { id: 'E4', text: 'You have an important presentation coming up.\nMy first reaction is to worry about whether it will go well.' },
  { id: 'E5', text: 'When things get hard, I really need someone’s comfort and support.' },
  { id: 'E6', text: 'Something is weighing on your mind.\nI feel a strong urge to talk it through with someone close to me.' },
  { id: 'E7', text: 'I feel deep sadness when I part ways with someone I’ve been close to for a long time.' },
  { id: 'E8', text: 'A coworker you worked closely with leaves the team.\nThey stay on my mind for a long while afterward.' },

  // X — eXtraversion
  { id: 'X1', text: 'I carry myself confidently, even around people I’ve just met.' },
  { id: 'X2', text: 'Everyone in a group has to introduce themselves.\nI confidently volunteer to go first.' },
  { id: 'X3', text: 'Speaking in front of a large audience doesn’t bother me.' },
  { id: 'X4', text: 'The conversation at a get-together dies down into an awkward silence.\nI’m the one who brings up something new to talk about.' },
  { id: 'X5', text: 'Constantly meeting new people wears me out.' },
  { id: 'X6', text: 'A group of friends you haven’t seen in a while is getting together.\nI’m eager to go.' },
  { id: 'X7', text: 'I absolutely need time alone to recharge.' },
  { id: 'X8', text: 'The mood at a get-together is flat.\nI naturally become the one who livens things up.' },

  // A — Agreeableness
  { id: 'A1', text: 'When someone wrongs me, I find it hard to let it go.' },
  { id: 'A2', text: 'A friend hurt you by accident but sincerely apologized.\nI forgive them and things go back to how they were.' },
  { id: 'A3', text: 'I tend to be lenient when I judge other people.' },
  { id: 'A4', text: 'A favor you asked for didn’t turn out as you hoped, but you know the person did their best.\nI tell them it’s fine and let it go.' },
  { id: 'A5', text: 'When there’s a conflict, I’m willing to give ground to reach a compromise.' },
  { id: 'A6', text: 'You and a friend disagree about where to eat.\nI go with what my friend wants.' },
  { id: 'A7', text: 'When the same annoying situation keeps happening, my irritation builds up.' },
  { id: 'A8', text: 'There’s a long line at the checkout.\nI wait without getting especially annoyed.' },

  // C — Conscientiousness
  { id: 'C1', text: 'My room or desk tends to be messy.' },
  { id: 'C2', text: 'You’re starting a new project.\nI begin by making a to-do list and deciding the order.' },
  { id: 'C3', text: 'Once I start something, I see it through no matter what.' },
  { id: 'C4', text: 'You’re responsible for a task, but halfway through you lose interest in it.\nI don’t give up — I finish it.' },
  { id: 'C5', text: 'I check my work carefully before calling it done.' },
  { id: 'C6', text: 'Right before submitting a document, you spot an error.\nEven with the deadline close, I fix it before I submit.' },
  { id: 'C7', text: 'I tend to decide quickly on gut feeling rather than thinking things through.' },
  { id: 'C8', text: 'You’re choosing a product to buy.\nI read more reviews before deciding.' },

  // O — Openness to Experience
  { id: 'O1', text: 'Art such as music or painting doesn’t really move me.' },
  { id: 'O2', text: 'You get a chance to visit a gallery or see a performance.\nI go, looking forward to enjoying it.' },
  { id: 'O3', text: 'When I come across something I don’t know, I feel a strong urge to learn more.' },
  { id: 'O4', text: 'An idea you’re not familiar with comes up in conversation.\nI look it up on my own later.' },
  { id: 'O5', text: 'Original ways of solving problems tend to come to me.' },
  { id: 'O6', text: 'Your team wants to stick with the usual way of doing things.\nI suggest a different approach.' },
  { id: 'O7', text: 'I don’t usually question conventional ways of doing things or common wisdom.' },
  { id: 'O8', text: 'There’s a custom everyone around you follows without question.\nIf the reason doesn’t make sense to me, I don’t follow it.' },
]
