export const difficultyOptions = [
  { id: 'easy', level: '하', title: '개념 확인', caption: '초보 탐험가 코스', english: 'BASIC CONCEPT',
    quote: '기본 개념과 핵심 용어를 확인하는 문제',
    description: '학습 자료의 중요한 뜻과 특징을 짚으며, 배운 내용을 차근차근 다져요.',
    examples: ['핵심 용어와 기본 개념의 뜻 확인', '기본 원리와 특징 구분'], note: '개념을 하나씩, 차근차근' },
  { id: 'normal', level: '중', title: '비교 및 관계 이해', caption: '익숙한 탐험가 코스', english: 'RELATION & COMPARE',
    quote: '개념 간 차이와 관계를 이해하는 문제',
    description: '비슷해 보이는 개념을 비교하고, 배운 지식이 어떻게 연결되는지 살펴봐요.',
    examples: ['두 개념의 공통점과 차이 비교', '개념 사이의 관계와 원인 이해'], note: '배운 지식을 연결하는 한 걸음' },
  { id: 'hard', level: '상', title: '사례 적용 및 추론', caption: '도전 탐험가 코스', english: 'APPLICATION & INFER',
    quote: '학습한 내용을 응용하거나 추론하는 문제',
    description: '새로운 상황에 배운 내용을 적용하고, 여러 조건을 살펴 결과를 생각해 봐요.',
    examples: ['새로운 사례에 배운 개념 적용', '여러 조건을 종합해 결과 추론'], note: '생각의 깊이를 넓히는 도전' },
];

// Small vector illustrations keep the paper cards crisp at every screen size.
const illustrations = {
  easy: `<ellipse cx="100" cy="119" rx="46" ry="9" fill="#d5dfce"/><path d="M60 78q20-9 40 0 20-9 40 0v38q-20-6-40 1-20-7-40-1Z" fill="#fffdf4" stroke="#588d75" stroke-width="2.5"/><path d="M100 79v38" stroke="#83b99b" stroke-width="2"/><path d="M71 76c-7-29 64-32 58 0Z" fill="#9bd3b1" stroke="#588d75" stroke-width="2.5"/><ellipse cx="88" cy="66" rx="2.5" ry="3" fill="#346d52"/><ellipse cx="113" cy="66" rx="2.5" ry="3" fill="#346d52"/><path d="M97 70q4 4 8 0M100 52V38" fill="none" stroke="#588d75" stroke-width="2" stroke-linecap="round"/><path d="M100 43q-22 0-17-13 16-2 17 13Zm0 0q0-20 17-15 2 14-17 15Z" fill="#83cbaa" stroke="#588d75" stroke-width="2"/><path d="m67 86 22 1m-22 7 22 1m23-7 20-1m-20 9 20-1" stroke="#d9e5d4" stroke-width="2"/>`,
  normal: `<ellipse cx="100" cy="122" rx="43" ry="8" fill="#e4d9b9"/><path d="m67 91-18 11 6 10 20-13m54-48 20-4-12 17" fill="#e9c358" stroke="#a17d36" stroke-width="2.5"/><circle cx="100" cy="72" r="34" fill="#efcc66" stroke="#a17d36" stroke-width="2.5"/><circle cx="100" cy="72" r="27" fill="#fffdf2" stroke="#b4964d" stroke-width="2"/><circle cx="100" cy="31" r="5" fill="#fff1b8" stroke="#a17d36" stroke-width="2"/><path d="m100 49 8 23-8 24-8-24Z" fill="#72acb2" stroke="#50787c" stroke-width="1.5"/><path d="m100 49 8 23-8 1Z" fill="#dc8467"/><circle cx="100" cy="72" r="3" fill="#fff5d8"/><path d="M100 48v-4m0 56v-4M76 72h-4m56 0h-4" stroke="#b4964d" stroke-width="1.5"/>`,
  hard: `<ellipse cx="100" cy="121" rx="46" ry="9" fill="#dfd5e4"/><path d="m56 84 44-10 44 10-8 32-36-8-36 8Z" fill="#c5a5e5" stroke="#80649c" stroke-width="2.5"/><path d="m63 81 37-9 37 9-7 27-30-7-30 7Z" fill="#fffdf5" stroke="#80649c" stroke-width="2"/><path d="M100 73v28" stroke="#d7c7e2" stroke-width="2"/><path d="m72 43 16 10 12-20 13 20 16-10-6 28H78Z" fill="#f4d36c" stroke="#9d8448" stroke-width="2.5"/><path d="m78 67 45 0" stroke="#fff0ad" stroke-width="3"/><circle cx="87" cy="58" r="3" fill="#81bd9a"/><path d="m100 49 4 7-4 7-4-7Z" fill="#dc8b85"/><circle cx="114" cy="58" r="3" fill="#9d8ac3"/>`,
};

export function renderDifficultyCards() {
  return difficultyOptions.map(option => `<label class="difficulty-card" data-level="${option.id}">
    <input type="radio" name="difficulty" value="${option.id}" ${option.id === 'normal' ? 'checked' : ''}/>
    <span class="difficulty-bookmark" aria-hidden="true">${option.level}</span>
    <span class="difficulty-selected" aria-hidden="true">✓ 현재 선택</span>
    <span class="difficulty-card-heading"><span class="difficulty-medallion">${option.level}</span><span><span class="difficulty-caption">${option.caption}</span><strong>${option.level} — ${option.title}</strong></span></span>
    <span class="difficulty-illustration"><span class="difficulty-english">${option.english}</span><svg viewBox="0 0 200 145" aria-hidden="true">${illustrations[option.id]}</svg></span>
    <span class="difficulty-description"><strong>“${option.quote}”</strong><span>${option.description}</span></span>
    <span class="difficulty-examples"><strong>문제 유형 예시</strong>${option.examples.map(example => `<span>${example}</span>`).join('')}</span>
    <span class="difficulty-card-bottom"><span>${option.note}</span><span class="difficulty-select-label">${option.level} · ${option.title} 선택하기</span></span>
  </label>`).join('');
}
