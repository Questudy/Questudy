// Set this to the production endpoint that accepts { email, message } as JSON.
export const CONTACT_ENDPOINT = '';

export function aboutPage(): string {
  return `<article class="service-page">
    <header class="page-heading"><h1>서비스 소개</h1><p>퀘스터디는 학습 자료를 올리면 문제를 풀며 지도를 탐험하는 학습 게임이에요.</p></header>
    <section class="paper-panel service-panel"><h2>이렇게 이용해요</h2>
      <div><h3>자료 올리기</h3><p>학습 자료를 올리고 지도 제목과 문제 수를 정해요.</p></div>
      <div><h3>학습 지도 만들기</h3><p>자료를 바탕으로 문제를 만들고 학습 지도를 준비해요.</p></div>
      <div><h3>문제 풀며 탐험하기</h3><p>문제를 풀어 다음 구역을 열고, 내 지도에서 탐험을 이어갈 수 있어요.</p></div>
    </section><a class="service-link" href="#create">지도 만들기 →</a>
  </article>`;
}

export function contactPage(): string {
  return `<article class="service-page">
    <header class="page-heading"><h1>문의하기</h1><p>이용 중 겪은 오류, 문제 내용의 오류, 개선 의견을 알려주세요.</p></header>
    <form id="contact-form" class="paper-panel service-panel">
      <label class="contact-field">답변받을 이메일 (선택)<input type="email" name="email" autocomplete="email" maxlength="254" placeholder="이메일 주소를 입력해 주세요."></label>
      <label class="contact-field">문의 내용<textarea name="message" required maxlength="5000" placeholder="어떤 화면에서 어떤 문제가 있었는지 적어 주세요."></textarea></label>
      <p id="contact-error" class="field-error" role="alert" hidden></p>
      <button class="contact-submit" type="submit">문의 보내기</button>
      ${CONTACT_ENDPOINT ? '' : '<p class="contact-availability" role="status">문의 접수는 준비 중이에요. 작성한 내용은 아래에서 복사할 수 있어요.</p><button class="quiet" type="button" data-action="copy-contact">작성한 내용 복사</button>'}
    </form>
  </article>`;
}

export function contactSuccessPage(): string {
  return `<article class="service-page contact-success"><header class="page-heading"><h1 tabindex="-1">문의가 접수됐어요</h1></header>
    <section class="paper-panel service-panel"><p>보내주신 문의를 확인할게요. 답변받을 이메일을 남겼다면 그 주소로 답변드릴게요.</p></section>
    <a class="service-link" href="#home">홈으로 돌아가기 →</a></article>`;
}

export async function submitContact(form: HTMLFormElement): Promise<boolean> {
  const email = form.elements.namedItem('email') as HTMLInputElement;
  const message = form.elements.namedItem('message') as HTMLTextAreaElement;
  const error = form.querySelector<HTMLElement>('#contact-error');
  error.hidden = true;
  message.setCustomValidity(message.value.trim() ? '' : '문의 내용을 입력해 주세요.');
  if (!form.reportValidity()) return false;
  if (!CONTACT_ENDPOINT) {
    error.textContent = '아직 문의 접수가 연결되지 않았어요. 작성한 내용을 복사해 보관해 주세요.';
    error.hidden = false;
    return false;
  }
  const button = form.querySelector<HTMLButtonElement>('[type="submit"]');
  button.disabled = true;
  button.textContent = '보내는 중…';
  form.setAttribute('aria-busy', 'true');
  try {
    const response = await fetch(CONTACT_ENDPOINT, {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: email.value.trim(), message: message.value.trim() }),
      signal: AbortSignal.timeout(15000)
    });
    if (!response.ok) throw new Error('Contact request failed');
    return true;
  } catch {
    error.textContent = '문의를 보내지 못했어요. 입력한 내용은 유지돼요. 잠시 후 다시 시도해 주세요.';
    error.hidden = false;
    return false;
  } finally {
    button.disabled = false;
    button.textContent = '문의 보내기';
    form.removeAttribute('aria-busy');
  }
}
