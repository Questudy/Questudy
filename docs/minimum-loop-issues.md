# Questudy 개발 계획

기능과 범위의 원본은 [기능 명세](functional-spec.md), 협업 절차는 [CONTRIBUTING](../CONTRIBUTING.md)이다. 담당·진행 상태·작업별 설계·완료 조건은 연결된 Linear 이슈에서 관리한다.

## 개발 단계

| 단계 | 목표 | 관련 이슈 |
| --- | --- | --- |
| 첫 학습 전투 | PDF 한 개로 업로드 → 문제 생성·저장 → 난이도 선택 → 전투 노드 하나 → 결과 | [QS-1](https://linear.app/questudy/issue/QS-1), QS-2~QS-10 |
| 탐험·보상 반복 | 작은 분기 지도, 경로 공개, 보상·회복·PASS와 다음 전투 | [QS-11](https://linear.app/questudy/issue/QS-11), QS-12~QS-14 |
| 이어하기·기록 | 나가기 → 재실행·이어하기 → 종료 → 아카이브 조회 | [QS-15](https://linear.app/questudy/issue/QS-15), QS-16~QS-17 |
| 전체 서비스 확장 | 복수 자료 입력과 자료별 영역 구성 | 후속 작업으로 구체화 |

첫 세 묶음은 PDF 한 개와 단일 난이도 구간에서 시작한다. 자료별 영역 구성과 구간 간 난이도 재선택은 후속 범위다. LLM 응답은 기존 첫 흐름 계획의 JSONL 규격을 사용하며, 응답 형식과 저장 형식은 구분한다. 저장 방식은 QS-7, 임시 HP·피해량·입력 제한은 관련 티켓에서 정한다.

## 작업 의존 관계

| 티켓 | 책임 | 완료에 필요한 선행 결과 |
| --- | --- | --- |
| [QS-2](https://linear.app/questudy/issue/QS-2) | 첫 루프 화면과 정상·실패 흐름 합의 | 현재 기능 명세 |
| [QS-3](https://linear.app/questudy/issue/QS-3) | 실행 환경, 역할 경계, 공통 요청·응답·오류 표현 | 현재 기능 명세 |
| [QS-4](https://linear.app/questudy/issue/QS-4) | PDF 업로드·페이지별 추출 | QS-3, QS-2의 업로드 화면 합의 |
| [QS-5](https://linear.app/questudy/issue/QS-5) | 문제 규격·JSONL 파싱·검증 | QS-3의 연결 방식 |
| [QS-6](https://linear.app/questudy/issue/QS-6) | LLM 호출 설계·생성·품질 검증 | QS-4, QS-5 |
| [QS-7](https://linear.app/questudy/issue/QS-7) | 생성 흐름·문제 저장·조회 | QS-4, QS-5, QS-6, QS-2의 생성 화면 합의 |
| [QS-8](https://linear.app/questudy/issue/QS-8) | 지도 입장·난이도 선택 | QS-7, QS-2의 입장 화면 합의 |
| [QS-9](https://linear.app/questudy/issue/QS-9) | 전투 상태 전환·화면 연결 | QS-5, QS-8, QS-2의 전투 화면 합의 |
| [QS-10](https://linear.app/questudy/issue/QS-10) | 피드백·결과·첫 루프 검증 | QS-9, QS-2의 결과 화면 합의 |
| [QS-12](https://linear.app/questudy/issue/QS-12) | 분기 지도·노드별 문제 | QS-1 완료 |
| [QS-13](https://linear.app/questudy/issue/QS-13) | 노드 개방·이동·진행도 | [QS-12](https://linear.app/questudy/issue/QS-12) |
| [QS-14](https://linear.app/questudy/issue/QS-14) | 보상·소모품 사용·반복 검증 | [QS-13](https://linear.app/questudy/issue/QS-13) |
| [QS-16](https://linear.app/questudy/issue/QS-16) | 플레이 저장·이어하기 | QS-11 완료 |
| [QS-17](https://linear.app/questudy/issue/QS-17) | 아카이브·전체 흐름 검증 | [QS-16](https://linear.app/questudy/issue/QS-16) |

규격과 목업이 합의된 부분부터 샘플로 병행 개발한다. QS-10·QS-14·QS-17은 첫 통합 시점이 아니라 각 흐름의 최종 확인 책임이다. 생성 결과가 준비되는 대로 연결한다.
