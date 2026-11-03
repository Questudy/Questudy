# Questudy 개발 계획

기능과 범위의 원본은 [기능 명세](functional-spec.md), 협업 절차는 [CONTRIBUTING](../CONTRIBUTING.md)이다. 담당·진행 상태·작업별 설계·완료 조건은 연결된 Linear 이슈에서 관리한다.

## 개발 단계

[Questudy 첫 플레이 버전](https://linear.app/questudy/project/questudy-첫-플레이-버전-26e540a49039)에서 첫 세 단계를 마일스톤으로 관리한다.

| 단계 | 목표 | 관련 이슈 | 제출용 화면의 최종 확인 |
| --- | --- | --- | --- |
| 첫 학습 전투 | PDF 한 개로 업로드 → 생성·저장 → 난이도 선택 → 전투 → 결과 | QS-2~QS-10, QS-18 | QS-10 |
| 탐험과 보상 반복 | 분기 지도·노드 이동·보상·회복·PASS | QS-12~QS-14, QS-19 | QS-19 |
| 이어하기와 기록 | 나가기 → 재실행·이어하기 → 종료 → 아카이브 | QS-16~QS-17, QS-20 | QS-20 |
| 전체 서비스 확장 | 복수 자료 입력과 자료별 영역 구성 | 후속 작업으로 구체화 | 후속 정의 |

첫 세 묶음은 PDF 한 개와 단일 난이도 구간에서 시작한다. 자료별 영역 구성과 구간 간 난이도 재선택은 후속 범위다. LLM 응답은 JSONL이며 저장 형식과 구분한다. 저장 방식은 QS-7, 임시 HP·피해량은 QS-18, 입력 제한은 QS-4에서 명세를 기준으로 정하고 기록한다.

## 구현과 연결

- Backend는 자료 처리·AI·저장·게임 규칙을 구현하고 QS-3의 공통 스켈레톤에 테스트 조작을 추가해 검증한다.
- Frontend는 제출용 화면·사용자 입력·결과 표시를 구현하고 스켈레톤에서 검증된 기능부터 연결한다.
- 스켈레톤과 제출용 프론트는 동일한 백엔드 기능을 호출한다. 프론트는 백엔드의 판정 결과를 표시한다.
- 요청·응답·오류 예시를 먼저 공유한다. 프론트는 목업과 샘플로 착수하고, 백엔드는 제출용 화면 완성을 기다리지 않는다.
- Backend 완료는 스켈레톤의 정상·실패 검증과 테스트, Frontend 완료는 실제 백엔드 연결과 화면 조작으로 확인한다.
- QS-10·QS-19·QS-20에서 제출용 화면의 전체 흐름을 검증한 뒤 각 마일스톤을 완료한다.

## 작업 의존 관계

| 티켓 | 영역 | 책임 | 완료에 필요한 선행 결과 |
| --- | --- | --- | --- |
| [QS-2](https://linear.app/questudy/issue/QS-2) | Design | 첫 루프 목업 | 현재 기능 명세 |
| [QS-3](https://linear.app/questudy/issue/QS-3) | Backend | 공통 실행 환경·테스트 스켈레톤 | 현재 기능 명세 |
| [QS-4](https://linear.app/questudy/issue/QS-4) | Backend | PDF 수신·검사·페이지별 추출 | QS-3 |
| [QS-5](https://linear.app/questudy/issue/QS-5) | Backend | 문제 규격·JSONL 검증 | QS-3 |
| [QS-6](https://linear.app/questudy/issue/QS-6) | Backend | LLM 생성·품질 검증 | QS-4, QS-5 |
| [QS-7](https://linear.app/questudy/issue/QS-7) | Backend | 생성 흐름·문제 저장·조회 | QS-4, QS-5, QS-6 |
| [QS-18](https://linear.app/questudy/issue/QS-18) | Backend | 전투 시작·판정·종료 결과 | QS-5 |
| [QS-8](https://linear.app/questudy/issue/QS-8) | Frontend | 업로드·생성 상태·지도 입장 화면 | QS-2, QS-3, QS-4, QS-7 |
| [QS-9](https://linear.app/questudy/issue/QS-9) | Frontend | 전투 화면·전투 시작 연결 | QS-2, QS-8, QS-18 |
| [QS-10](https://linear.app/questudy/issue/QS-10) | Frontend | 피드백·결과 화면·첫 루프 검증 | QS-2, QS-9, QS-18 |
| [QS-12](https://linear.app/questudy/issue/QS-12) | Backend | 분기 지도·노드별 문제 | QS-7 |
| [QS-13](https://linear.app/questudy/issue/QS-13) | Backend | 노드 개방·이동·진행도 | QS-12, QS-18 |
| [QS-14](https://linear.app/questudy/issue/QS-14) | Backend | 보상·회복·PASS 처리 | QS-13 |
| [QS-19](https://linear.app/questudy/issue/QS-19) | Frontend | 탐험 지도·보상·아이템 화면·반복 검증 | QS-9, QS-12, QS-13, QS-14 |
| [QS-16](https://linear.app/questudy/issue/QS-16) | Backend | 플레이 저장·나가기·이어하기 | QS-14 |
| [QS-17](https://linear.app/questudy/issue/QS-17) | Backend | 종료 결과 저장·아카이브 조회 | QS-16 |
| [QS-20](https://linear.app/questudy/issue/QS-20) | Frontend | 이어하기·아카이브 화면·전체 검증 | QS-10, QS-19, QS-16, QS-17 |

표와 Linear의 선행 관계는 완료에 필요한 결과를 나타낸다. 샘플로 시작한 부분은 실제 출력으로 교체하고 다시 확인한다. 단계는 첫 학습 전투부터 시연하되, 후속 백엔드 기능은 필요한 선행 백엔드 결과가 준비되면 스켈레톤에서 개발할 수 있다.
